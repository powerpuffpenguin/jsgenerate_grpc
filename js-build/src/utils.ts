import { execFile, ExecFileOptions } from 'child_process'
export interface Dict {
    [key: string]: any;
}

export function Merge(...objs: Array<Dict>): Dict {
    const result = {} as Dict
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
export function Env(obj: Dict) {
    return Merge(process.env, obj)
}
export function ExecFile(file: string, args: Array<string>, opts: ExecFileOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        execFile(file, args, opts, (e, stdout, stderr) => {
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

export function Append(items: Array<any>, ...elems: Array<any>) {
    const obj = []
    obj.push(...items)
    obj.push(...elems)
    return obj
}
export async function ClearDirectory(filename: string): Promise<void> {

}