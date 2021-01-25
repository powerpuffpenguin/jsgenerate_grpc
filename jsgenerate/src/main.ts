import { Context } from "./context";
import { existsSync } from "fs";
import { Exclude, NameService } from "./helper";
import { join } from "path";
export const tag = 'gateway db'
export const description = 'google grpc frame template'
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
    db = false
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
            tag.forEach((v) => {
                if (v == 'gateway') {
                    this.gateway = true
                } else if (v == 'db') {
                    this.db = true
                }
            })
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
            // if (existsSync(filename)) {
            //     throw new Error(`file exists : ${filename}`);
            // }
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
