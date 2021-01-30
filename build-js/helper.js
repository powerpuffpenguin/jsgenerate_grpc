"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require('child_process');
const { join } = require('path');
exports.Target = void 0;
class Target {
    constructor(os, arch, ext) {
        this.os = os;
        this.arch = arch;
        this.ext = ext;
    }
    build(name, debug) {
        if (debug) {
            name = join('bin', name + 'd')
        } else {
            name = join('bin', name)
        }
        console.log(`go build -o "${name}"`)
        name = join(__dirname, '..', name)
        child_process.execFile(`go`, ['build', '-o', name])
    }
}
exports.Target = Target;
