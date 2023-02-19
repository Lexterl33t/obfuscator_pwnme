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
        this.symbol_object = [];
        this.whitelist_native_object = [
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
        ];
        this.ast = babel_parser.parse(source);
        this.decode_func_name = btoa((0, crypto_1.randomBytes)(20).toString('hex')).split("=").join("");
        this.table_enc_name = btoa((0, crypto_1.randomBytes)(20).toString('hex')).split('=').join("");
        this.table_object_name = btoa((0, crypto_1.randomBytes)(20).toString('hex')).split('=').join("");
        var fixe_name = btoa((0, crypto_1.randomBytes)(20).toString('hex')).split('=').join("");
        this.fixe_variable_literal = { 1: fixe_name };
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
            if (item.kind === 'const' || item.kind === 'var') {
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
            },
            MemberExpression: function (path) {
                var node = path.node;
                if (node.computed)
                    return;
                if (!t.isIdentifier(node.object) || !t.isIdentifier(node.property))
                    return;
                if (!self.symbol_object.includes(node.object.name) && self.whitelist_native_object.includes(node.object.name)) {
                    self.symbol_object.push(node.object.name);
                }
                if (!self.string_table.includes(node.property.name) && self.whitelist_native_object.includes(node.property.name)) {
                    self.string_table.push(node.property.name);
                }
            }
        });
        this.obfuscate_strings();
        console.log(self.symbol_object, self.string_table);
    };
    Obfuscation.prototype.do_object_to_array = function () {
        var self = this;
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
        (0, core_1.traverse)(this.getAst(), {
            CallExpression: function (path) {
                var node = path.node;
                var callee = node.callee;
                if (!t.isMemberExpression(callee))
                    if (!t.isIdentifier(callee.object) || !t.isIdentifier(callee.property))
                        return;
                if (self.symbol_object.includes(callee.object.name) && self.string_table.includes(callee.property.name)) {
                    path.node.callee = t.memberExpression(t.memberExpression(t.identifier(self.table_object_name), t.numericLiteral(self.symbol_object.indexOf(callee.object.name)), true), self.get_callexpression(self.decode_func_name, self.get_array_element_by_value(self.string_table, callee.property.name)), true);
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
    Obfuscation.prototype.table_string_to_identifier = function (table_str) {
        var tt = table_str.map(function (str) { return t.identifier(str); });
        return tt;
    };
    // unoptimize arithmetic operation with axiome equation
    Obfuscation.prototype.constant_unfolding = function () {
        var self = this;
        (0, core_1.traverse)(this.getAst(), {
            MemberExpression: function (path) {
                var node = path.node;
                var property = node.property;
                if (!t.isNumericLiteral(property))
                    return;
                var value_literal = property.value;
                var random = Math.floor(Math.random() * Math.floor(Math.random() * 2000));
                var xored_value = value_literal ^ random;
                path.node.property = t.binaryExpression("^", t.numericLiteral(xored_value), t.numericLiteral(random));
            },
            ReturnStatement: function (path) {
                var node = path.node;
                if (!t.isNumericLiteral(node.argument))
                    return;
                var value = node.argument.value;
                var rand = Math.floor(Math.random() * 2000);
                var xored = rand ^ value;
                /*
                    rand = 74
                    value = 0x1337337
                    xored = rand ^ value

                    bitshifted = xored >> (rand ^ rand) + -1 + 1

                */
                path.node.argument = t.binaryExpression("+", t.binaryExpression(">>", t.binaryExpression("^", t.numericLiteral(xored), t.numericLiteral(rand)), t.binaryExpression("^", t.numericLiteral(rand), t.numericLiteral(rand))), t.binaryExpression("+", t.binaryExpression("*", t.identifier(self.fixe_variable_literal[1]), t.numericLiteral(-1)), t.identifier(self.fixe_variable_literal[1])));
            },
            ObjectExpression: function (path) {
                var node = path.node;
                console.log(node);
                for (var decl in node.properties) {
                    if (!t.isObjectProperty(node.properties[decl]))
                        continue;
                    if (!t.isNumericLiteral(node.properties[decl].value))
                        continue;
                    var value = node.properties[decl].value.value;
                    var rand = Math.floor(Math.random() * 2000);
                    var xored = rand ^ value;
                    path.node.properties[decl].value = t.binaryExpression("+", t.binaryExpression(">>", t.binaryExpression("^", t.numericLiteral(xored), t.numericLiteral(rand)), t.binaryExpression("^", t.numericLiteral(rand), t.numericLiteral(rand))), t.binaryExpression("+", t.binaryExpression("*", t.identifier(self.fixe_variable_literal[1]), t.numericLiteral(-1)), t.identifier(self.fixe_variable_literal[1])));
                }
            }
        });
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
                    if (t.isArrowFunctionExpression(decl.init)) {
                        if (decl.id["name"] === "init_hk" || decl.id["name"] === self.decode_func_name)
                            continue;
                        var randomName = self.random_string(decl.id["name"].length);
                        self.symbol_func_name[decl.id["name"]] = randomName;
                        decl.id["name"] = randomName;
                    }
                    else if (t.isCallExpression(decl.init) && t.isArrowFunctionExpression(decl.init.callee)) {
                        if (decl.id["name"] === "init_hk" || decl.id["name"] === self.decode_func_name)
                            continue;
                        var randomName = self.random_string(decl.id["name"].length);
                        self.symbol_func_name[decl.id["name"]] = randomName;
                        decl.id["name"] = randomName;
                    }
                }
            },
            CallExpression: function (path) {
                var node = path.node;
                for (var idx in node.arguments) {
                    if (t.isIdentifier(node.arguments[idx])) {
                        if (self.symbol_func_name[node.arguments[idx].name]) {
                            path.node.arguments[idx].name = self.symbol_func_name[node.arguments[idx].name];
                        }
                    }
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
    Obfuscation.prototype.hook_btoa_function = function () {
        var source = "\n        var hooked_btoa = ((original, args) => {\n              let retValue = original(args)\n              return [retValue]\n        })\n\n        var hook_btoa = (() => {\n            hookFunction(window, \"btoa\", hooked_btoa)\n        })()\n        ";
        var decode_str_func_ast = babel_parser.parse(source);
        for (var _i = 0, _a = decode_str_func_ast.program.body; _i < _a.length; _i++) {
            var statement = _a[_i];
            this.getAst().program.body.push(statement);
        }
    };
    Obfuscation.prototype.hook_function = function () {
        this.hook_btoa_function();
        var source = "\n        var hookFunction = (obj, fnName, callback) => {\n            const originalFn = obj[fnName];\n            obj[fnName] = function(...args) {\n              const newArgs = callback(originalFn, args);\n              return originalFn.apply(this, newArgs);\n            };\n          };\n        ";
        var decode_str_func_ast = babel_parser.parse(source);
        this.getAst().program.body.unshift(decode_str_func_ast.program.body[0]);
    };
    Obfuscation.prototype.gen_junk_code = function () {
        var var1 = this.random_string(4);
        var var2 = this.random_string(5);
        var junkcode = "\n            let ".concat(this.random_string(45), " = ((").concat(var1, ", ").concat(var2, ") => {\n                return ").concat(var1, " ^ ").concat(var2, "\n            })\n\n            let ").concat(this.random_string(1), " = ((").concat(var1, ", ").concat(var2, ") => {\n                return ").concat(var1, " * ").concat(var2, "\n            })\n\n\n            let ").concat(this.random_string(45), " = ((").concat(var1, ", ").concat(var2, ") => {\n                return ").concat(var1, " - ").concat(var2, "\n            })\n\n            let ").concat(this.random_string(1), " = ((").concat(var1, ", ").concat(var2, ") => {\n                return ").concat(var1, " + ").concat(var2, "\n            })\n\n\n            let ").concat(this.random_string(45), " = ((").concat(var1, ", ").concat(var2, ") => {\n                return ").concat(var1, " / ").concat(var2, "\n            })\n\n            let ").concat(this.random_string(1), " = ((").concat(var1, ", ").concat(var2, ") => {\n                return ").concat(var1, " % ").concat(var2, "\n            })\n\n\n            let ").concat(this.random_string(45), " = ((").concat(var1, ", ").concat(var2, ") => {\n                return ").concat(var1, " ^ ").concat(var2, " + ").concat(var1, "\n            })\n\n            let ").concat(this.random_string(1), " = ((").concat(var1, ", ").concat(var2, ") => {\n                return ").concat(var1, " * ").concat(var2, " - ").concat(var2, "\n            })\n        ");
        var decode_str_func_ast = babel_parser.parse(junkcode);
        this.getAst().program.body.push(decode_str_func_ast);
    };
    Obfuscation.prototype.obfuscate = function () {
        // Step constant unfolding
        this.gen_junk_code();
        this.hook_function();
        this.make_string_table();
        this.do_object_to_array();
        this.rename_function();
        this.constant_unfolding();
        this.getAst().program.body.unshift(t.variableDeclaration("var", [
            t.variableDeclarator(t.identifier(this.table_enc_name), t.arrayExpression(this.table_string_to_string_literal(this.enc_string_table)))
        ]), this.get_decode_func_pattern_ast(), t.variableDeclaration("var", [
            t.variableDeclarator(t.identifier(this.fixe_variable_literal[1]), t.numericLiteral(parseInt(Object.keys(this.fixe_variable_literal)[0])))
        ]));
        this.getAst().program.body.unshift(t.variableDeclaration("var", [
            t.variableDeclarator(t.identifier(this.table_object_name), t.arrayExpression(this.table_string_to_identifier(this.symbol_object)))
        ]));
        this.getAst().program.body = this.shuffle(this.getAst().program.body);
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
