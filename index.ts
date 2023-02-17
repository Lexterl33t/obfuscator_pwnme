import * as obfuscation from "./obfuscation"
import * as commander from 'commander'
import * as process from 'process'
import * as fs from 'fs';


class App {

    constructor() {
        this.main()
    }

    load_file(filename) : string {
        if(filename) {
            try {
                return fs.readFileSync(filename, 'utf-8')
            } catch(e) {
                return e
            }
        } else {
            return ""
        }
    }

    main() : void {

        const program = new commander.Command()
        program
            .version("1.0.0")
            .description("Lexter Obfuscator")
            .option("-ob --obfuscate <file name>")
            .parse(process.argv)

            
        const options = program.opts()

        if (options.obfuscate) {
            let obfu : obfuscation.Obfuscation = new obfuscation.Obfuscation(this.load_file(options.obfuscate))

            fs.writeFileSync('./output/obfuscated_'.concat(options.obfuscate.split('/').reverse()[0]), obfu.obfuscate()); 
        }
    }
}

new App()


