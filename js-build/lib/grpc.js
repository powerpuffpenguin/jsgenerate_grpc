"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildGRPC = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("./utils");
class GRPC {
    constructor(builders) {
        this.builders = builders;
        this.names = new Array();
        builders.forEach((builder) => {
            this.names.push(builder.name);
        });
    }
    async build(language, output) {
        const builders = this.builders;
        for (let i = 0; i < builders.length; i++) {
            const builder = builders[i];
            if (language === builder.name) {
                return builder.build(output);
            }
        }
        const e = new Error(`not supported language : ${language}`);
        console.warn(e);
        throw e;
    }
}
class WalkResult {
    constructor() {
        this.files = new Array();
        this.dirs = new Array();
    }
}
async function Walk(root, dir) {
    const result = new WalkResult();
    const names = await fs_1.promises.readdir(path_1.join(root, dir));
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const filename = path_1.join(root, dir, name);
        const stat = await fs_1.promises.stat(filename);
        if (stat.isDirectory()) {
            result.dirs.push(path_1.join(dir, name));
        }
        else if (stat.isFile()) {
            result.files.push(path_1.join(dir, name));
        }
    }
    return result;
}
class Builder {
    constructor(name, uuid, gateway) {
        this.name = name;
        this.uuid = uuid;
        this.gateway = gateway;
        this.cwd_ = '';
        this.root_ = '';
        this.include = new Array();
        this.cwd_ = path_1.normalize(path_1.join(__dirname, '..', '..'));
        const root = path_1.join('pb', this.uuid);
        this.root_ = path_1.normalize(path_1.join(this.cwd_, root));
        this.include.push('-I', root);
        if (this.gateway) {
            const gopath = process.env['GOPATH'];
            const strs = gopath.split(path_1.delimiter);
            for (let i = 0; i < strs.length; i++) {
                const str = strs[0].trim();
                if (str.length > 0) {
                    this.include.push('-I', path_1.normalize(path_1.join(str, 'src', 'github.com', 'grpc-ecosystem', 'grpc-gateway', 'third_party', 'googleapis')));
                    break;
                }
            }
        }
    }
    get cwd() {
        return this.cwd_;
    }
    get root() {
        return this.root_;
    }
    async build(output) {
        if (typeof output != 'string' || output.length == 0) {
            output = path_1.join('bin', 'protocol', 'dart');
        }
        await this._build(output, '.');
    }
    async _build(output, dir) {
        const result = await Walk(this.root, dir);
        if (result.files.length > 0) {
            await this.buildGRPC(output, ...result.files);
        }
        const dirs = result.dirs;
        for (let i = 0; i < dirs.length; i++) {
            await this._build(output, dirs[i]);
        }
    }
    async buildGRPC(output, ...files) {
        throw Error('build grpc not impl');
    }
}
class Dart extends Builder {
    constructor(uuid, gateway) {
        super('dart', uuid, gateway);
    }
    async buildGRPC(output, ...files) {
        const args = [
            ...this.include,
            `--dart_out=grpc:${output}`,
            ...files,
        ];
        console.log(`protoc ${args.join(' ')}`);
        console.log(this.cwd, args);
        await utils_1.ExecFile('protoc', args, {
            cwd: this.cwd,
        });
    }
}
function BuildGRPC(program, uuid, gateway) {
    const grpc = new GRPC([
        new Dart(uuid, gateway),
    ]);
    program.command('grpc')
        .description('build *.proto to grpc code')
        .option(`-l,--language [${grpc.names.join(' ')}]', 'grpc target language`)
        .option(`-o,--output []', 'grpc output directory`)
        .action(function () {
        const opts = this.opts();
        grpc.build(opts['language'], opts['output']).catch(() => {
            process.exit(1);
        });
    });
}
exports.BuildGRPC = BuildGRPC;
