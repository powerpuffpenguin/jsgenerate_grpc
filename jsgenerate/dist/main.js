"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsgenerate = exports.description = exports.tag = void 0;
const fs_1 = require("fs");
const helper_1 = require("./helper");
const path_1 = require("path");
exports.tag = 'all gateway gin db view';
exports.description = 'google grpc frame template';
async function exists(filename) {
    try {
        await fs_1.promises.access(filename, fs_1.constants.F_OK);
        return true;
    }
    catch (e) {
    }
    return false;
}
class Metadata {
    constructor(pkg, name, tag, uuid) {
        this.uuid = uuid;
        this.date = new Date();
        this.project_ = '';
        this.pkg_ = '';
        this.gateway = false;
        this.gin = false;
        this.db = false;
        this.view = false;
        this.grpcPrefix = 'jsgenerate_';
        pkg = pkg.replace('.', '/').replace('@', '').replace('-', '_');
        pkg = pkg.replace('//', '/').replace('__', '_');
        this.pkg_ = pkg;
        name = name.replace('.', '').replace('@', '').replace('-', '_').replace('/', '');
        name = name.replace('__', '_');
        this.project_ = name;
        this.grpcPrefix += name;
        if (Array.isArray(tag)) {
            for (let i = 0; i < tag.length; i++) {
                const v = tag[i];
                if (v == 'all') {
                    this.gateway = true;
                    this.gin = true;
                    this.db = true;
                    this.view = true;
                }
                else if (v == 'gateway') {
                    this.gateway = true;
                }
                else if (v == 'gin') {
                    this.gin = true;
                    this.gateway = true;
                }
                else if (v == 'db') {
                    this.db = true;
                }
                else if (v == 'view') {
                    this.view = true;
                }
            }
        }
    }
    get project() {
        return this.project_;
    }
    get pkg() {
        return this.pkg_;
    }
}
function jsgenerate(context) {
    const uuid = context.uuidv1();
    const md = new Metadata(context.pkg, context.name, context.tag, uuid);
    const prefix = [
        '.git' + path_1.sep,
        path_1.join('view', 'node_modules'),
    ];
    const exclude = ['.git'];
    if (!md.db) {
        exclude.push(path_1.join('configure', 'db.go'));
    }
    if (!md.gateway) {
        exclude.push(path_1.join('cmd', 'internal', 'daemon', 'proxy.go'));
    }
    if (!md.gin) {
        prefix.push('web' + path_1.sep);
        exclude.push('web');
        prefix.push('static' + path_1.sep);
        exclude.push('static');
        prefix.push('view' + path_1.sep);
        exclude.push('view');
        exclude.push(path_1.join('cmd', 'internal', 'daemon', 'gin.go'));
    }
    const nameService = new helper_1.NameService(context.output, uuid, new helper_1.Exclude(prefix, [], exclude)).rename(`${md.project}.jsonnet`, `example.jsonnet`, `bin`);
    context.serve(async function (name, src, stat) {
        if (nameService.checkExclude(name)) {
            return;
        }
        const filename = nameService.getOutput(name);
        if (exists(filename)) {
            // throw new Error(`file already exists`)
        }
        if (nameService.isTemplate(name)) {
            const text = context.template(src, md);
            context.writeFile(filename, text, stat.mode);
        }
        else {
            await context.copyFile(filename, src, stat.mode);
        }
    }, async function (name, _, stat) {
        if (nameService.checkExclude(name)) {
            return;
        }
        const filename = nameService.getOutput(name);
        await context.mkdir(filename, true, stat.mode);
    }).then(() => {
        console.log(`jsgenerate success`);
        console.log(`package : ${md.pkg}`);
        console.log(`project : ${md.project}`);
        console.log(`uuid : ${uuid}`);
    });
}
exports.jsgenerate = jsgenerate;
