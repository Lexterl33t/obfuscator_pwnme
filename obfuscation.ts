import * as babel from "babel-core"
import * as babel_parser from "@babel/parser"
import generate from "@babel/generator";
import * as beautify from "js-beautify"
import { traverse } from "babel-core";
import * as t from "@babel/types"

export class Obfuscation {

    ast : any;
    constructor(source : string) {
        this.ast = babel_parser.parse(source)
    }

    getAst() : any {
        if(!this.ast)
            return
        
        return this.ast
    }

    // algorithm encryption string array
    obfuscate_string() : void {
            
    }

    // unoptimize arithmetic operation with axiome equation
    constant_unfolding() : void {
        
        traverse(this.getAst(), {
            "VariableDeclarator"(path) {
                let {node} = path

                /** 
                if (t.isVariableDeclarator(node)) {
                    let {init} = node
                    
                    

                } else {

                }*/

                path.traverse({
                    BinaryExpression(path) {
                        let {node} = path

                        path.traverse({
                            NumericLiteral(path) {
                                let {node} = path

                                let randomAxiome = Math.round(Math.random() * 1337)
                                path.parentPath.replaceWith(t.binaryExpression("^", t.valueToNode(node.value ^ randomAxiome), t.valueToNode(randomAxiome)))
                            }
                        })
                    }
                })

                

            }
        })
    }

    obfuscate() : string {

        // Step constant unfolding
        this.constant_unfolding()

        let obfuCode = generate(this.getAst(), { comments: false }).code;
        obfuCode = beautify(obfuCode, {
            indent_size: 2,
            space_in_empty_paren: true,
        });

        return obfuCode
    }


}

export default Obfuscation;


