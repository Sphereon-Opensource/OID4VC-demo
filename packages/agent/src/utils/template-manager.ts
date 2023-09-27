import {format} from 'date-fns'
import Handlebars from 'handlebars'
import fs from "fs"
import {ICredential} from "@sphereon/ssi-types"

export class TemplateVCGenerator {
    private readonly handlebars: typeof Handlebars
    private readonly timeFormatPattern: string
    private template?: HandlebarsTemplateDelegate
    private lastTemplatePath?: string

    public constructor(timeFormatPattern?: string) {
        this.timeFormatPattern = timeFormatPattern || defaultTimeFormat()
        this.handlebars = Handlebars.create()
        this.registerHelpers()
    }

    public generateCredential(templatePath: string, inputData: object): ICredential {
        const jsonText = this.generateCredentialAsString(templatePath, inputData)
        return JSON.parse(jsonText) as ICredential
    }

    public generateCredentialAsString(templatePath: string, inputData: object): string {
        if (templatePath != this.lastTemplatePath) {
            this.loadTemplate(templatePath)
        }
        return this.template!(inputData)
    }

    private loadTemplate(templatePath: string) {
        console.debug('loading template from path:', templatePath)
        const templateContent = fs.readFileSync(templatePath, 'utf-8')
        this.template = this.handlebars.compile(templateContent)
        this.lastTemplatePath = templatePath
    }

    private registerHelpers() {
        this.handlebars.registerHelper('currentDateTime', () => {
            return format(new Date(), this.timeFormatPattern)
        })


        this.handlebars.registerHelper('collectionOf', function () {
            const lists = Array.prototype.slice.call(arguments, 0, -1) // Remove final argument, which is a Handlebars options object
            return Array.prototype.concat.apply([], lists) // Flatten the array of arrays
        })
    }
}

const defaultTimeFormat = (): string => "yyyy-MM-dd HH:mm:ss.SSS"
