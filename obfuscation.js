"use strict";
exports.__esModule = true;
exports.Obfuscation = void 0;
var babel_parser = require("@babel/parser");
var generator_1 = require("@babel/generator");
var beautify = require("js-beautify");
var core_1 = require("@babel/core");
var t = require("@babel/types");
var crypto_1 = require("crypto");
var Obfuscation = /** @class */ (function () {
    function Obfuscation(source) {
        this.string_table = [];
        this.enc_string_table = [];
        this.symbol_func_name = {};
        this.ast = babel_parser.parse(source);
        this.decode_func_name = btoa((0, crypto_1.randomBytes)(20).toString('hex')).split("=").join("");
        this.table_enc_name = btoa((0, crypto_1.randomBytes)(20).toString('hex')).split('=').join("");
        console.log(this.table_enc_name, this.decode_func_name);
    }
    Obfuscation.prototype.random_string = function (size) {
        return btoa((0, crypto_1.randomBytes)(size).toString('hex')).split('=').join("");
    };
    Obfuscation.prototype.shuffle = function (array) {
        var _a;
        var constants = [];
        var nonConstants = [];
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var item = array_1[_i];
            if (item.kind === 'const') {
                constants.push(item);
            }
            else {
                nonConstants.push(item);
            }
        }
        for (var i = nonConstants.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [nonConstants[j], nonConstants[i]], nonConstants[i] = _a[0], nonConstants[j] = _a[1];
        }
        return constants.concat(nonConstants);
    };
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
    Obfuscation.prototype.get_array_element_by_value = function (array, value) {
        if (array.includes(value))
            return t.memberExpression(t.identifier(this.table_enc_name), t.numericLiteral(array.indexOf(value)), true);
        else
            return null;
    };
    Obfuscation.prototype.get_callexpression = function (callee, argument) {
        return t.callExpression(t.identifier(callee), [argument]);
    };
    Obfuscation.prototype.get_decode_func_pattern_ast = function () {
        var decode_func_source = "\n        var ".concat(this.decode_func_name, " = ((encVal) => {\n            let value_string = encVal.split(\"\")\n    \n            let ord_string_value = value_string.map((x, i) => encVal.charCodeAt(i))\n    \n            let length_string = ord_string_value.length-1\n    \n            let dec_string = \"\"\n    \n            for (let val_enc of ord_string_value) {\n                dec_string += String.fromCharCode((val_enc ^ length_string))\n                length_string--;\n            }\n    \n            return dec_string\n        })\n        ");
        var decode_str_func_ast = babel_parser.parse(decode_func_source);
        return decode_str_func_ast.program.body[0];
        //return t.functionDeclaration(undefined)
    };
    Obfuscation.prototype.make_string_table = function () {
        var self = this;
        (0, core_1.traverse)(this.getAst(), {
            StringLiteral: function (path) {
                var node = path.node;
                self.string_table.push(node.value);
            }
        });
        this.obfuscate_strings();
        console.log(this.decode_string(this.enc_string_table[16]));
        (0, core_1.traverse)(this.getAst(), {
            AssignmentExpression: function (path) {
                var node = path.node;
                if (!t.isStringLiteral(node.right))
                    return;
                var memberexpr = self.get_array_element_by_value(self.string_table, node.right.value);
                if (memberexpr) {
                    path.node.right = self.get_callexpression(self.decode_func_name, memberexpr);
                }
            },
            ObjectExpression: function (path) {
                var node = path.node;
                var properties = node.properties;
                for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
                    var proper = properties_1[_i];
                    if (t.isStringLiteral(proper.value)) {
                        var memberexpr = self.get_array_element_by_value(self.string_table, proper.value.value);
                        if (memberexpr)
                            proper.value = self.get_callexpression(self.decode_func_name, self.get_array_element_by_value(self.string_table, proper.value.value));
                    }
                }
            },
            CallExpression: function (path) {
                var node = path.node;
                for (var idx in node.arguments) {
                    if (t.isStringLiteral(node.arguments[idx])) {
                        var memberexpr = self.get_array_element_by_value(self.string_table, node.arguments[idx].value);
                        if (memberexpr) {
                            path.node.arguments[idx] = self.get_callexpression(self.decode_func_name, memberexpr);
                        }
                    }
                }
            },
            VariableDeclarator: function (path) {
                var node = path.node;
                if (t.isStringLiteral(node.init)) {
                    var memberexpr = self.get_array_element_by_value(self.string_table, node.init.value);
                    if (memberexpr) {
                        path.node.init = self.get_callexpression(self.decode_func_name, memberexpr);
                    }
                }
            },
            ReturnStatement: function (path) {
                var node = path.node;
                if (t.isStringLiteral(node.argument)) {
                    var memberexpr = self.get_array_element_by_value(self.string_table, node.argument.value);
                    if (memberexpr) {
                        path.node.argument = self.get_callexpression(self.decode_func_name, memberexpr);
                    }
                }
            }
        });
    };
    // algorithm encryption string array
    Obfuscation.prototype.obfuscate_strings = function () {
        if (!this.string_table)
            return;
        for (var _i = 0, _a = this.string_table; _i < _a.length; _i++) {
            var str = _a[_i];
            this.enc_string_table.push(this.encode_string(str));
        }
    };
    Obfuscation.prototype.table_string_to_string_literal = function (table_str) {
        var tt = table_str.map(function (str) { return t.stringLiteral(str); });
        return tt;
    };
    // unoptimize arithmetic operation with axiome equation
    Obfuscation.prototype.constant_unfolding = function () {
    };
    Obfuscation.prototype.rename_function = function () {
        var self = this;
        (0, core_1.traverse)(this.getAst(), {
            VariableDeclaration: function (path) {
                var node = path.node;
                for (var _i = 0, _a = node.declarations; _i < _a.length; _i++) {
                    var decl = _a[_i];
                    if (!t.isVariableDeclarator(decl))
                        continue;
                    if (!t.isArrowFunctionExpression(decl.init))
                        continue;
                    if (decl.id["name"] === "init_hk" || decl.id["name"] === self.decode_func_name)
                        continue;
                    var randomName = self.random_string(decl.id["name"].length);
                    self.symbol_func_name[decl.id["name"]] = randomName;
                    decl.id["name"] = randomName;
                }
            }
        });
        console.log(self.symbol_func_name);
        // rename all call function by corresponding random name
        (0, core_1.traverse)(this.getAst(), {
            CallExpression: function (path) {
                var node = path.node;
                var symbol_name = self.symbol_func_name[node.callee.name];
                if (symbol_name) {
                    node.callee.name = symbol_name;
                }
            }
        });
    };
    Obfuscation.prototype.obfuscate = function () {
        // Step constant unfolding
        this.get_decode_func_pattern_ast();
        this.make_string_table();
        this.constant_unfolding();
        this.rename_function();
        this.getAst().program.body.unshift(t.variableDeclaration("var", [
            t.variableDeclarator(t.identifier(this.table_enc_name), t.arrayExpression(this.table_string_to_string_literal(this.enc_string_table)))
        ]), this.get_decode_func_pattern_ast());
        this.shuffle(this.getAst().program.body);
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
