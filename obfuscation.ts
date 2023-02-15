import * as babel from "babel-core"
import * as babel_parser from "@babel/parser"
import generate from "@babel/generator";
import * as beautify from "js-beautify"
import { traverse } from "babel-core";
import * as t from "@babel/types"

export class Obfuscation {

    ast : any;
    string_table : string[] = ['d']

    constructor(source : string) {
        this.ast = babel_parser.parse(source)
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

    make_string_table(): void {
        let string_table 
        traverse(this.getAst(), {
            StringLiteral(path, string_table) {
                let {node} = path
                console.log(node.value)
            }
        });

    }

    // algorithm encryption string array
    obfuscate_strings() : void {
        console.log(this.encode_string("Lol"))
        console.log(this.decode_string("Nnl"))
    }

    // unoptimize arithmetic operation with axiome equation
    constant_unfolding() : void {
        
    }

    obfuscate() : string {

        // Step constant unfolding
        this.make_string_table()
        this.obfuscate_strings()
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


