"use strict";
exports.__esModule = true;
exports.Obfuscation = void 0;
var babel_parser = require("@babel/parser");
var generator_1 = require("@babel/generator");
var beautify = require("js-beautify");
var babel_core_1 = require("babel-core");
var Obfuscation = /** @class */ (function () {
    function Obfuscation(source) {
        this.string_table = ['d'];
        this.ast = babel_parser.parse(source);
    }
    Obfuscation.prototype.getAst = function () {
        if (!this.ast)
            return;
        return this.ast;
    };
    Obfuscation.prototype.encode_string = function (value) {
        var value_string = value.split("");
        var ord_string_value = value_string.map(function (x, i) { return value.charCodeAt(i); });
        var length_string = ord_string_value.length - 1;
        var encoded_string = "";
        for (var _i = 0, ord_string_value_1 = ord_string_value; _i < ord_string_value_1.length; _i++) {
            var val = ord_string_value_1[_i];
            encoded_string += String.fromCharCode(((val ^ length_string)));
            length_string--;
        }
        return encoded_string;
    };
    Obfuscation.prototype.decode_string = function (encVal) {
        var value_string = encVal.split("");
        var ord_string_value = value_string.map(function (x, i) { return encVal.charCodeAt(i); });
        var length_string = ord_string_value.length - 1;
        var dec_string = "";
        for (var _i = 0, ord_string_value_2 = ord_string_value; _i < ord_string_value_2.length; _i++) {
            var val_enc = ord_string_value_2[_i];
            dec_string += String.fromCharCode((val_enc ^ length_string));
            length_string--;
        }
        return dec_string;
    };
    Obfuscation.prototype.make_string_table = function () {
        var string_table;
        (0, babel_core_1.traverse)(this.getAst(), {
            StringLiteral: function (path, string_table) {
                var node = path.node;
                console.log(node.value);
            }
        });
    };
    // algorithm encryption string array
    Obfuscation.prototype.obfuscate_strings = function () {
        console.log(this.encode_string("Lol"));
        console.log(this.decode_string("Nnl"));
    };
    // unoptimize arithmetic operation with axiome equation
    Obfuscation.prototype.constant_unfolding = function () {
    };
    Obfuscation.prototype.obfuscate = function () {
        // Step constant unfolding
        this.make_string_table();
        this.obfuscate_strings();
        this.constant_unfolding();
        var obfuCode = (0, generator_1["default"])(this.getAst(), { comments: false }).code;
        obfuCode = beautify(obfuCode, {
            indent_size: 2,
            space_in_empty_paren: true
        });
        return obfuCode;
    };
    return Obfuscation;
}());
exports.Obfuscation = Obfuscation;
exports["default"] = Obfuscation;
