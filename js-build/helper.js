"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require('child_process');
const { join, normalize } = require('path');
exports.Target = void 0;
exports.Build = void 0;
exports.Append = void 0;
exports.BuildTest = void 0;
function getEnv(obj) {
    const env = {}
    for (const k in process.env) {
        env[k] = process.env[k]
    }
    if (obj) {
        for (const k in obj) {
            env[k] = obj[k]
        }
    }
    return env
}
/**
 * 
 * @param {string} file 
 * @param {ReadonlyArray<string> | undefined | null} args 
 * @param {child_process.ExecFileOptions} opts 
 */
function execFile(file, args, opts) {
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
class Target {
    constructor(os, arch, name, ext, debug) {
        this.os = os
        this.arch = arch
        this.ext = ext
        this.name = name
        this.debug = debug
        if (debug) {
            this.name_ = name + 'd'
        } else {
            this.name_ = name
        }
        if (typeof this.ext === "string") {
            this.name_ += this.ext
        }
    }
    build() {
        const name = join('bin', this.name_)
        console.log(`go build -o "${name}"`)
        const env = getEnv({
            GOOS: this.os,
            GOARCH: this.arch,
        })
        return execFile(`go`, ['build', '-o', name], {
            cwd: normalize(join(__dirname, '..')),
            env: env,
        })
    }
    pack(algorithm, ...names) {
        if (typeof algorithm === "string") {
            let output = `${this.os}-${this.arch}`
            let file
            const args = []
            switch (algorithm) {
                case '7z':
                    file = '7z'
                    args.push('a')
                    output += `.7z`
                    break;
                case 'zip':
                    file = 'zip'
                    args.push('-r')
                    output += `.zip`
                    break;
                case 'gz':
                    file = 'tar'
                    args.push('-zcvf')
                    output += `.tar.gz`
                    break
                case 'bz2':
                    file = 'tar'
                    args.push('-jcvf')
                    output += `.tar.bz2`
                    break
                case 'xz':
                    file = 'tar'
                    args.push('-Jcvf')
                    output += `.tar.xz`
                    break
                default:
                    throw new Error(`not supported pack algorithm : ${algorithm}`)
            }
            args.push(output)
            args.push(this.name_)
            for (let i = 0; i < names.length; i++) {
                args.push(names[i])
            }
            console.log(file, ...args)
            return execFile(file, args, {
                cwd: normalize(join(__dirname, '..', 'bin')),
            })
        }
    }
}
function Build(program, os, arch, name, ext, ...packs) {
    const pack = '7z gz bz2 xz zip'
    program.command(os)
        .description(`build code to os`)
        .option(`--arch [${arch.join(' ')}]`, 'GOARCH default use amd64')
        .option(`-p,--pack [${pack}]`, 'Pack to compressed package')
        .option('--debug', 'build as debug')
        .action(function () {
            const opts = this.opts()
            let arch = opts['arch']
            if (arch === undefined) {
                arch = 'amd64'
            }
            const taget = new Target(os, arch, name, ext, opts['debug'])
            taget.build().then(() => {
                return taget.pack(opts['pack'],
                    ...packs,
                )
            }).catch((e) => {
                console.warn(e)
                process.exit(1)
            })
        })
}
function Append(items, ...elems) {
    const obj = []
    obj.push(...items)
    obj.push(...elems)
    return obj
}
async function test(pkg, args, ...names) {
    const cwd = normalize(join(__dirname, '..'))
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        if (name.length > 0) {
            await execFile('go', Append(args, `${pkg}/${name}`), {
                cwd: cwd,
            })
        }
    }
}
function BuildTest(program, pkg, unit, bench) {
    program.command('test')
        .description(`run go test`)
        .option(`-v`, 'prints the full')
        .option(`-run []`, 'run func name')
        .option(`-b, --bench`, 'test bench')
        .action(function () {
            const opts = this.opts()
            const args = ['test']
            if (opts['v']) {
                args.push('-v')
            }
            const run = opts['Run']
            if (opts['bench']) {
                if (typeof run === "string") {
                    args.push(`-run=^$`)
                }
                args.push('-benchmem', '-bench')
                if (typeof run === "string") {
                    args.push(`${run}`)
                } else {
                    args.push('.')
                }
                test(pkg, args, ...bench)
            } else {
                if (typeof run === "string") {
                    args.push(`-run=${run}`)
                }
                test(pkg, args, ...unit)
            }
        })
}

exports.Target = Target;
exports.Build = Build;
exports.Append = Append;
exports.BuildTest = BuildTest;