import { promises } from 'fs';
import { join, normalize, delimiter } from 'path';
import { Command } from '../commander';
import { ExecFile } from './utils';

class GRPC {
    names = new Array<string>()
    constructor(public readonly builders: Array<Builder>) {
        builders.forEach((builder) => {
            this.names.push(builder.name)
        })
    }
    async build(language: string, output: string): Promise<void> {
        const builders = this.builders
        for (let i = 0; i < builders.length; i++) {
            const builder = builders[i]
            if (language === builder.name) {
                return builder.build(output)
            }
        }
        const e = new Error(`not supported language : ${language}`)
        console.warn(e)
        throw e
    }
}
class WalkResult {
    files = new Array<string>()
    dirs = new Array<string>()
}
async function Walk(root: string, dir: string): Promise<WalkResult> {
    const result = new WalkResult()
    const names = await promises.readdir(join(root, dir))
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        const filename = join(root, dir, name)
        const stat = await promises.stat(filename)
        if (stat.isDirectory()) {
            result.dirs.push(join(dir, name))
        } else if (stat.isFile()) {
            result.files.push(join(dir, name))
        }
    }
    return result
}
class Builder {
    private cwd_ = ''
    get cwd(): string {
        return this.cwd_
    }
    private root_ = ''
    get root(): string {
        return this.root_
    }
    readonly include = new Array<string>()
    constructor(public readonly name: string,
        public readonly uuid: string,
        public readonly gateway: boolean,
    ) {
        this.cwd_ = normalize(join(__dirname, '..', '..'))
        const root = join('pb', this.uuid)
        this.root_ = normalize(join(this.cwd_, root))
        this.include.push('-I', root)
        if (this.gateway) {
            const gopath = process.env['GOPATH']
            const strs = gopath.split(delimiter)
            for (let i = 0; i < strs.length; i++) {
                const str = strs[0].trim()
                if (str.length > 0) {
                    this.include.push('-I', normalize(join(str, 'src', 'github.com', 'grpc-ecosystem', 'grpc-gateway', 'third_party', 'googleapis')))
                    break
                }
            }
        }
    }
    async build(output: string): Promise<void> {
        if (typeof output != 'string' || output.length == 0) {
            output = join('bin', 'protocol', 'dart')
        }
        await this._build(output, '.')
    }
    async _build(output: string, dir: string): Promise<void> {
        const result = await Walk(this.root, dir)
        if (result.files.length > 0) {
            await this.buildGRPC(output, ...result.files)
        }
        const dirs = result.dirs
        for (let i = 0; i < dirs.length; i++) {
            await this._build(output, dirs[i])
        }
    }
    async buildGRPC(output: string, ...files: Array<string>) {
        throw Error('build grpc not impl')
    }
}
class Dart extends Builder {
    constructor(uuid: string, gateway: boolean) {
        super('dart', uuid, gateway)
    }
    async buildGRPC(output: string, ...files: Array<string>) {
        const args = [
            ...this.include,
            `--dart_out=grpc:${output}`,
            ...files,
        ]
        console.log(`protoc ${args.join(' ')}`)
        await ExecFile('protoc', args, {
            cwd: this.cwd,
        })
    }
}
export function BuildGRPC(program: Command, uuid: string, gateway: boolean) {
    const grpc = new GRPC([
        new Dart(uuid, gateway),
    ])
    program.command('grpc')
        .description('build *.proto to grpc code')
        .option(`-l,--language [${grpc.names.join(' ')}]', 'grpc target language`)
        .option(`-o,--output []', 'grpc output directory`)
        .action(function () {
            const opts = this.opts()
            grpc.build(opts['language'], opts['output']).catch(() => {
                process.exit(1)
            })
        })
}