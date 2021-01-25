import { Context } from "./context";
import { promises, constants } from "fs";
import { Exclude, NameService } from "./helper";
import { join } from "path";
export const tag = 'all gateway gin db view'
export const description = 'google grpc frame template'
async function exists(filename: string): Promise<boolean> {
    try {
        await promises.access(filename, constants.F_OK)
        return true
    } catch (e) {

    }
    return false
}
class Metadata {
    readonly date = new Date()
    private project_ = ''
    get project(): string {
        return this.project_
    }
    private pkg_ = ''
    get pkg(): string {
        return this.pkg_
    }
    gateway = false
    gin = false
    db = false
    view = false
    grpcPrefix = 'jsgenerate_'
    constructor(pkg: string,
        name: string,
        tag: Array<string>,
    ) {
        pkg = pkg.replace('.', '/').replace('@', '').replace('-', '_')
        pkg = pkg.replace('//', '/').replace('__', '_')
        this.pkg_ = pkg
        name = name.replace('.', '').replace('@', '').replace('-', '_').replace('/', '')
        name = name.replace('__', '_')
        this.project_ = name
        this.grpcPrefix += name

        if (Array.isArray(tag)) {
            for (let i = 0; i < tag.length; i++) {
                const v = tag[i]
                if (v == 'all') {
                    this.gateway = true
                    this.gin = true
                    this.db = true
                    this.view = true
                } else if (v == 'gateway') {
                    this.gateway = true
                } else if (v == 'gin') {
                    this.gin = true
                } else if (v == 'db') {
                    this.db = true
                } else if (v == 'view') {
                    this.view = true
                }
            }
        }
    }
}
export function jsgenerate(context: Context) {
    const md = new Metadata(context.pkg, context.name, context.tag)
    const exclude = ['.git']
    if (!md.db) {
        exclude.push(join('configure', 'db.go'))
    }
    const nameService = new NameService(context.output,
        new Exclude(
            ['.git/'],
            [],
            exclude,
        ),
    ).rename(
        `${md.project}.jsonnet`, `example.jsonnet`, `bin`
    )
    context.serve(
        async function (name, src, stat): Promise<undefined> {
            if (nameService.checkExclude(name)) {
                return
            }
            const filename = nameService.getOutput(name)
            if (exists(filename)) {
                // throw new Error(`file already exists`)
            }
            if (nameService.isTemplate(name)) {
                const text = context.template(src, md)
                context.writeFile(filename, text, stat.mode)
            } else {
                await context.copyFile(filename, src, stat.mode)
            }
        },
        async function (name, _, stat): Promise<undefined> {
            if (nameService.checkExclude(name)) {
                return
            }
            const filename = nameService.getOutput(name)
            await context.mkdir(filename, true, stat.mode)
        },
    )
}
