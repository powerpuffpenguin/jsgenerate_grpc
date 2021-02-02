"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require('child_process');
exports.Merge = void 0;
exports.Env = void 0;
exports.Append = void 0;
exports.ExecFile = void 0;
function Merge(...objs) {
    const result = {}
    for (let i = 0; i < objs.length; i++) {
        const obj = objs[i]
        if (obj) {
            for (const k in obj) {
                result[k] = obj[k]
            }
        }
    }
    return result
}
function Env(obj) {
    return Merge(process.env, obj)
}
/**
 * 
 * @param {string} file 
 * @param {ReadonlyArray<string> | undefined | null} args 
 * @param {child_process.ExecFileOptions} opts 
 */
function ExecFile(file, args, opts) {
    return new Promise((resolve, reject) => {
        child_process.execFile(file, args, opts, (e, stdout, stderr) => {
            process.stdout.write(stdout)
            process.stderr.write(stderr)
            if (e) {
                reject(e)
            } else {
                resolve()
            }
        })
    })
}

function Append(items, ...elems) {
    const obj = []
    obj.push(...items)
    obj.push(...elems)
    return obj
}

exports.Merge = Merge;
exports.Env = Env;
exports.Append = Append;
exports.ExecFile = ExecFile;