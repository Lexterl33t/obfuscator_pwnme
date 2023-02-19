import * as babel_parser from "@babel/parser"
import generate from "@babel/generator";
import * as beautify from "js-beautify"
import { traverse } from "@babel/core";
import { traverseFast } from '@babel/traverse';
import * as babel from '@babel/core';


import * as t from "@babel/types"
import { table } from "console";
import { declaredPredicate } from "@babel/types";
import {randomBytes} from "crypto"
import { memberExpression } from "@babel/types";

export class Obfuscation {

    ast : any;
    string_table : string[] = []
    enc_string_table : string[] = []
    decode_func_name : string
    table_enc_name : string
    symbol_func_name : Object = {}
    symbol_object : string[] = []
    table_object_name : string
    whitelist_native_object : string[] = [
        "Math",
        "String",
        "window",
        "document",
        "floor",
        "fromCharCode",
        "random",
        "Date",
        "now",
        "getElementById",
        "axios",
        "post",
    ]

    constructor(source : string) {
        this.ast = babel_parser.parse(source)
        this.decode_func_name = btoa(randomBytes(20).toString('hex')).split("=").join("")
        this.table_enc_name = btoa(randomBytes(20).toString('hex')).split('=').join("")
        this.table_object_name = btoa(randomBytes(20).toString('hex')).split('=').join("")
        console.log(this.table_enc_name, this.decode_func_name)
    }

    random_string(size : number) : string {
        return btoa(randomBytes(size).toString('hex')).split('=').join("")
    }

    shuffle(array : any[]) : any[] {
        let constants = [];
        let nonConstants = [];
        for (let item of array) {
          if (item.kind === 'const' || item.kind === 'var') {
            constants.push(item);
          } else {
            nonConstants.push(item);
          }
        }
        for (let i = nonConstants.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonConstants[i], nonConstants[j]] = [nonConstants[j], nonConstants[i]];
        }
        return constants.concat(nonConstants);
      }

    getAst() : any {
        if(!this.ast)
            return
        
        return this.ast
    }

    encode_string(value : string) : string {
        let value_string : string[] = value.split("")

        let ord_string_value : number[] = value_string.map((x, i) => value.charCodeAt(i))

        let length_string = ord_string_value.length-1

        let encoded_string = ""

        for (let val of ord_string_value) {
            encoded_string += String.fromCharCode(((val ^ length_string))) 
            length_string--;
        }   

        return encoded_string
    }

    decode_string(encVal : string) : string {
        let value_string :string[] = encVal.split("")

        let ord_string_value : number[] = value_string.map((x, i) => encVal.charCodeAt(i))

        let length_string = ord_string_value.length-1

        let dec_string = ""

        for (let val_enc of ord_string_value) {
            dec_string += String.fromCharCode((val_enc ^ length_string))
            length_string--;
        }

        return dec_string
    }

    get_array_element_by_value(array : string[], value : string) : any {
        if (array.includes(value)) 
            return t.memberExpression(t.identifier(this.table_enc_name), t.numericLiteral(array.indexOf(value)) , true) 
        else
            return null;
    }

    get_callexpression(callee : string, argument : t.Expression | t.StringLiteral) : t.CallExpression {
        return t.callExpression(t.identifier(callee), [argument])
    }

    get_decode_func_pattern_ast(): t.Statement {
        let decode_func_source = `
        var ${this.decode_func_name} = ((encVal) => {
            let value_string = encVal.split("")
    
            let ord_string_value = value_string.map((x, i) => encVal.charCodeAt(i))
    
            let length_string = ord_string_value.length-1
    
            let dec_string = ""
    
            for (let val_enc of ord_string_value) {
                dec_string += String.fromCharCode((val_enc ^ length_string))
                length_string--;
            }
    
            return dec_string
        })
        `
        let decode_str_func_ast = babel_parser.parse(decode_func_source)
        
        return decode_str_func_ast.program.body[0]
        
        //return t.functionDeclaration(undefined)
    }

    make_string_table(): void {


        const self = this;

        traverse(this.getAst(), {
            StringLiteral(path) {
                let {node} = path

                self.string_table.push(node.value)
            },
            MemberExpression(path) {
                let {node} = path

                if (node.computed) return;

                if (!t.isIdentifier(node.object) || !t.isIdentifier(node.property)) return;
                
                if (!self.symbol_object.includes(node.object.name) && self.whitelist_native_object.includes(node.object.name)) {
                    self.symbol_object.push(node.object.name)
                }

                if (!self.string_table.includes(node.property.name) && self.whitelist_native_object.includes(node.property.name)) {
                    self.string_table.push(node.property.name)
                }
            }
        })

        this.obfuscate_strings()

        


        console.log(self.symbol_object, self.string_table)

    }

    do_object_to_array() : void {

        const self = this;

        traverse(this.getAst(), {
            AssignmentExpression(path) {
                let {node} = path

                if (!t.isStringLiteral(node.right)) return; 

                let memberexpr = self.get_array_element_by_value(self.string_table, node.right.value)

                if (memberexpr) {
                    path.node.right = self.get_callexpression(self.decode_func_name, memberexpr)
                }
            },
            ObjectExpression(path) {
                let {node} = path

                let {properties} = node

                for (let proper of properties) {
                    

                    if (t.isStringLiteral(proper.value)) {
                        let memberexpr = self.get_array_element_by_value(self.string_table, proper.value.value)

                        if (memberexpr) 
                            proper.value = self.get_callexpression(self.decode_func_name, self.get_array_element_by_value(self.string_table, proper.value.value))
                    }
                }
            },
            CallExpression(path) {
                let {node} = path


                for (let idx in node.arguments) {
                    
                    if (t.isStringLiteral(node.arguments[idx])) {
                        let memberexpr = self.get_array_element_by_value(self.string_table, node.arguments[idx].value)
                        if (memberexpr) {
                            path.node.arguments[idx] = self.get_callexpression(
                                self.decode_func_name, 
                                memberexpr,
                            )
                        } 
                    }   
                }
            },
            VariableDeclarator(path) {
                let {node} = path


                if (t.isStringLiteral(node.init)) {
                    let memberexpr = self.get_array_element_by_value(self.string_table, node.init.value)
                    if (memberexpr) {
                        path.node.init = self.get_callexpression(
                            self.decode_func_name,
                            memberexpr,
                        )
                    }
                }   
            },
            ReturnStatement(path) {
                let {node} = path

                if (t.isStringLiteral(node.argument)) {
                    let memberexpr = self.get_array_element_by_value(self.string_table, node.argument.value)
                    
                    if (memberexpr) {
                        path.node.argument = self.get_callexpression(
                            self.decode_func_name,
                            memberexpr,
                        )
                    }
                }
            },
            
        });


        traverse(this.getAst(), {
            CallExpression(path) {
                let {node} = path

                let {callee} = node
                if (!t.isMemberExpression(callee))

                if (!t.isIdentifier(callee.object) || !t.isIdentifier(callee.property)) return;

                if (self.symbol_object.includes(callee.object.name) && self.string_table.includes(callee.property.name)) {
                    path.node.callee = t.memberExpression(
                        t.memberExpression(t.identifier(self.table_object_name), t.numericLiteral(self.symbol_object.indexOf(callee.object.name)), true),
                        self.get_callexpression(self.decode_func_name, self.get_array_element_by_value(self.string_table, callee.property.name)),
                        true,
                    )
                }
            }
        })
    }

    // algorithm encryption string array
    obfuscate_strings() : void {
        if (!this.string_table) return;

        for (let str of this.string_table) {
            this.enc_string_table.push(this.encode_string(str))
        }
    }

    table_string_to_string_literal(table_str : string[]) : t.StringLiteral[] {
        let tt : t.StringLiteral[] = table_str.map((str) => t.stringLiteral(str))
        return tt;
    }

    table_string_to_identifier(table_str : string[]) : t.Identifier[] {
        let tt : t.Identifier[] = table_str.map((str) => t.identifier(str))
        return tt;
    }

    // unoptimize arithmetic operation with axiome equation
    constant_unfolding() : void {
        
        const self = this

        traverse(this.getAst(), {
            MemberExpression(path) {
                let {node} = path

                let {property} = node

                if (!t.isNumericLiteral(property)) return;

                let value_literal : number = property.value

                let random : number = Math.floor(Math.random() * Math.floor(Math.random() * 2000))
                let xored_value : number = value_literal ^ random

                path.node.property = t.binaryExpression("^", t.numericLiteral(xored_value), t.numericLiteral(random))
            },
            ReturnStatement(path) {
                let {node} = path
                
                if (!t.isNumericLiteral(node.argument)) return;

                let value : number = node.argument.value

                let rand : number = Math.floor(Math.random() * 2000)
                let xored : number = rand ^ value
                /*
                    rand = 74
                    value = 0x1337337
                    xored = rand ^ value

                    bitshifted = xored >> (rand ^ rand) + -1 + 1

                */
                path.node.argument = t.binaryExpression("+", t.binaryExpression(">>", t.binaryExpression("^", t.numericLiteral(xored), t.numericLiteral(rand)), t.binaryExpression("^", t.numericLiteral(rand), t.numericLiteral(rand))), t.binaryExpression("+", t.numericLiteral(-1), t.numericLiteral(1)))
            },
            ObjectExpression(path) {
                let {node} = path

                console.log(node)

                for (let decl in node.properties) {
                    if (!t.isObjectProperty(node.properties[decl])) continue;

                    if (!t.isNumericLiteral(node.properties[decl].value)) continue;

                    
                    let value : number = node.properties[decl].value.value

                    let rand : number = Math.floor(Math.random() * 2000)
                    let xored : number = rand ^ value

                    path.node.properties[decl].value = t.binaryExpression("+", t.binaryExpression(">>", t.binaryExpression("^", t.numericLiteral(xored), t.numericLiteral(rand)), t.binaryExpression("^", t.numericLiteral(rand), t.numericLiteral(rand))), t.binaryExpression("+", t.numericLiteral(-1), t.numericLiteral(1))) 
                }

                
            }
            
        })

        
    }

    

    rename_function() : void {
        const self = this;

        traverse(this.getAst(), {
            VariableDeclaration(path) {
                let {node} = path

                for (let decl of node.declarations) {
                    if (!t.isVariableDeclarator(decl)) continue;

                    if (t.isArrowFunctionExpression(decl.init)) {
                        if (decl.id["name"] === "init_hk" || decl.id["name"] === self.decode_func_name) continue;

                        let randomName : string = self.random_string(decl.id["name"].length) 
                        self.symbol_func_name[decl.id["name"]] = randomName
                        decl.id["name"] = randomName
                    } else if (t.isCallExpression(decl.init) && t.isArrowFunctionExpression(decl.init.callee)) {
                        if (decl.id["name"] === "init_hk" || decl.id["name"] === self.decode_func_name) continue;

                        let randomName : string = self.random_string(decl.id["name"].length) 
                        self.symbol_func_name[decl.id["name"]] = randomName
                        decl.id["name"] = randomName
                    }
                    
                }
            },
            CallExpression(path) {
                let {node} = path

                for (let idx in node.arguments) {
                    if (t.isIdentifier(node.arguments[idx])) {
                        if (self.symbol_func_name[node.arguments[idx].name]) {
                            path.node.arguments[idx].name = self.symbol_func_name[node.arguments[idx].name]
                        }
                    }
                }
            }
        })

        console.log(self.symbol_func_name)

        // rename all call function by corresponding random name
        traverse(this.getAst(), {
            CallExpression(path) {
                let {node} = path
                
                let symbol_name = self.symbol_func_name[node.callee.name]
                if (symbol_name) {
                    node.callee.name = symbol_name
                }
            }
        })
    }

    hook_btoa_function() : void {
        let source : string = `
        var hooked_btoa = ((original, args) => {
              let retValue = original(args)
              return [retValue]
        })

        var hook_btoa = (() => {
            hookFunction(window, "btoa", hooked_btoa)
        })()
        `

        let decode_str_func_ast = babel_parser.parse(source)

        for (let statement of decode_str_func_ast.program.body) {
            this.getAst().program.body.push(statement)
        }
    }

    hook_function() : void {

        this.hook_btoa_function()

        let source : string = `
        var hookFunction = (obj, fnName, callback) => {
            const originalFn = obj[fnName];
            obj[fnName] = function(...args) {
              const newArgs = callback(originalFn, args);
              return originalFn.apply(this, newArgs);
            };
          };
        `

        let decode_str_func_ast = babel_parser.parse(source)

        this.getAst().program.body.unshift(decode_str_func_ast.program.body[0])
    } 

    gen_junk_code() : void {
        let var1 : string = this.random_string(4)
        let var2 : string = this.random_string(5)

        let junkcode = `
            let ${this.random_string(45)} = ((${var1}, ${var2}) => {
                return ${var1} ^ ${var2}
            })

            let ${this.random_string(1)} = ((${var1}, ${var2}) => {
                return ${var1} * ${var2}
            })


            let ${this.random_string(45)} = ((${var1}, ${var2}) => {
                return ${var1} - ${var2}
            })

            let ${this.random_string(1)} = ((${var1}, ${var2}) => {
                return ${var1} + ${var2}
            })


            let ${this.random_string(45)} = ((${var1}, ${var2}) => {
                return ${var1} / ${var2}
            })

            let ${this.random_string(1)} = ((${var1}, ${var2}) => {
                return ${var1} % ${var2}
            })


            let ${this.random_string(45)} = ((${var1}, ${var2}) => {
                return ${var1} ^ ${var2} + ${var1}
            })

            let ${this.random_string(1)} = ((${var1}, ${var2}) => {
                return ${var1} * ${var2} - ${var2}
            })
        `

        let decode_str_func_ast = babel_parser.parse(junkcode)

        this.getAst().program.body.push(decode_str_func_ast)
    }

    obfuscate() : string {

        // Step constant unfolding
        
        this.gen_junk_code()
        this.hook_function()
        this.make_string_table()
        this.do_object_to_array()
        this.rename_function()
        this.constant_unfolding()


        this.getAst().program.body.unshift(
            t.variableDeclaration(
                "var",
                [
                t.variableDeclarator(
                    t.identifier(this.table_enc_name),
                    t.arrayExpression(this.table_string_to_string_literal(this.enc_string_table))
                )],
            ),
            this.get_decode_func_pattern_ast()
        )

        this.getAst().program.body.unshift(
            t.variableDeclaration(
                "var",
                [
                t.variableDeclarator(
                    t.identifier(this.table_object_name),
                    t.arrayExpression(this.table_string_to_identifier(this.symbol_object))
                )],
            )
            )


        

        this.getAst().program.body = this.shuffle(this.getAst().program.body)
        let obfuCode = generate(this.getAst(), { comments: false }).code;
        obfuCode = beautify(obfuCode, {
            indent_size: 2,
            space_in_empty_paren: true,
        });

        return obfuCode
    }

}

export default Obfuscation;


