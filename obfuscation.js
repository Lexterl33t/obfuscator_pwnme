"use strict";
exports.__esModule = true;
exports.Obfuscation = void 0;
var babel_parser = require("@babel/parser");
var generator_1 = require("@babel/generator");
var beautify = require("js-beautify");
var babel_core_1 = require("babel-core");
var t = require("@babel/types");
var Obfuscation = /** @class */ (function () {
    function Obfuscation(source) {
        this.ast = babel_parser.parse(source);
    }
    Obfuscation.prototype.getAst = function () {
        if (!this.ast)
            return;
        return this.ast;
    };
    // algorithm encryption string array
    Obfuscation.prototype.obfuscate_string = function () {
    };
    // unoptimize arithmetic operation with axiome equation
    Obfuscation.prototype.constant_unfolding = function () {
        (0, babel_core_1.traverse)(this.getAst(), {
            "VariableDeclarator": function (path) {
                var node = path.node;
                /**
                if (t.isVariableDeclarator(node)) {
                    let {init} = node
                    
                    

                } else {

                }*/
                path.traverse({
                    BinaryExpression: function (path) {
                        var node = path.node;
                        path.traverse({
                            NumericLiteral: function (path) {
                                var node = path.node;
                                var randomAxiome = Math.round(Math.random() * 1337);
                                path.parentPath.replaceWith(t.binaryExpression("^", t.valueToNode(node.value ^ randomAxiome), t.valueToNode(randomAxiome)));
                            }
                        });
                    }
                });
            }
        });
    };
    Obfuscation.prototype.obfuscate = function () {
        // Step constant unfolding
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
