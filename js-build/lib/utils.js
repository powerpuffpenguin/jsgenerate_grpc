"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Append = exports.ExecFile = exports.Env = exports.Merge = void 0;
const child_process_1 = require("child_process");
function Merge(...objs) {
    const result = {};
    for (let i = 0; i < objs.length; i++) {
        const obj = objs[i];
        if (obj) {
            for (const k in obj) {
                result[k] = obj[k];
            }
        }
    }
    return result;
}
exports.Merge = Merge;
function Env(obj) {
    return Merge(process.env, obj);
}
exports.Env = Env;
function ExecFile(file, args, opts) {
    return new Promise((resolve, reject) => {
        child_process_1.execFile(file, args, opts, (e, stdout, stderr) => {
            process.stdout.write(stdout);
            process.stderr.write(stderr);
            if (e) {
                reject(e);
            }
            else {
                resolve();
            }
        });
    });
}
exports.ExecFile = ExecFile;
function Append(items, ...elems) {
    const obj = [];
    obj.push(...items);
    obj.push(...elems);
    return obj;
}
exports.Append = Append;
