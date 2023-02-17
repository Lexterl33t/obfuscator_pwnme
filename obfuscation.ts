import * as babel_parser from "@babel/parser"
import generate from "@babel/generator";
import * as beautify from "js-beautify"
import { traverse } from "@babel/core";
import * as t from "@babel/types"
import { table } from "console";
import { encode } from "punycode";
import { declaredPredicate } from "@babel/types";
import {randomBytes} from "crypto"

export class Obfuscation {

    ast : any;
    string_table : string[] = []
    enc_string_table : string[] = []
    decode_func_name : string
    table_enc_name : string
    symbol_func_name : Object = {}

    constructor(source : string) {
        this.ast = babel_parser.parse(source)
        this.decode_func_name = btoa(randomBytes(20).toString('hex')).split("=").join("")
        this.table_enc_name = btoa(randomBytes(20).toString('hex')).split('=').join("")
        console.log(this.table_enc_name, this.decode_func_name)
    }

    random_string(size : number) : string {
        return btoa(randomBytes(size).toString('hex')).split('=').join("")
    }

    shuffle(array : any[]) : any[] {
        let constants = [];
        let nonConstants = [];
        for (let item of array) {
          if (item.kind === 'const') {
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
            }
        })

        this.obfuscate_strings()

        console.log(this.decode_string(this.enc_string_table[16]))

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
            }
        });

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

    // unoptimize arithmetic operation with axiome equation
    constant_unfolding() : void {
        
    }

    rename_function() : void {
        const self = this;

        traverse(this.getAst(), {
            VariableDeclaration(path) {
                let {node} = path

                for (let decl of node.declarations) {
                    if (!t.isVariableDeclarator(decl)) continue;

                    if (!t.isArrowFunctionExpression(decl.init)) continue;

                    if (decl.id["name"] === "init_hk" || decl.id["name"] === self.decode_func_name) continue;

                    let randomName : string = self.random_string(decl.id["name"].length) 
                    self.symbol_func_name[decl.id["name"]] = randomName
                    decl.id["name"] = randomName
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

    obfuscate() : string {

        // Step constant unfolding
        this.get_decode_func_pattern_ast()
        this.make_string_table()
        this.constant_unfolding()
        this.rename_function()


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

        this.shuffle(this.getAst().program.body)
        let obfuCode = generate(this.getAst(), { comments: false }).code;
        obfuCode = beautify(obfuCode, {
            indent_size: 2,
            space_in_empty_paren: true,
        });

        return obfuCode
    }

}

export default Obfuscation;


