"use strict";
exports.__esModule = true;
var obfuscation = require("./obfuscation");
var commander = require("commander");
var process = require("process");
var fs = require("fs");
var App = /** @class */ (function () {
    function App() {
        this.main();
    }
    App.prototype.load_file = function (filename) {
        if (filename) {
            try {
                return fs.readFileSync(filename, 'utf-8');
            }
            catch (e) {
                return e;
            }
        }
        else {
            return "";
        }
    };
    App.prototype.main = function () {
        var program = new commander.Command();
        program
            .version("1.0.0")
            .description("Lexter Obfuscator")
            .option("-ob --obfuscate <file name>")
            .parse(process.argv);
        var options = program.opts();
        if (options.obfuscate) {
            var obfu = new obfuscation.Obfuscation(this.load_file(options.obfuscate));
            fs.writeFileSync('./output/obfuscated_'.concat(options.obfuscate.split('/').reverse()[0]), obfu.obfuscate());
        }
    };
    return App;
}());
new App();
