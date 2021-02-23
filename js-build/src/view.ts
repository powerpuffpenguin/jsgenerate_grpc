import { promises } from 'fs';
import { join, normalize } from 'path';
import { Command } from '../commander';
import { ExecFile } from './utils';
async function opencc(cwd: string, src: string, dst: string) {
    const args = ['-i', src, '-o', dst, '-c', 't2s.json']
    const file = 'opencc'
    console.log(`cwd=${cwd}`)
    console.log(file, args.join(' '))
    await ExecFile(file, args, {
        cwd: cwd,
    })
    const filename = join(cwd, dst)
    const buffer = await promises.readFile(filename)
    const str = buffer.toString('utf8')
    await promises.writeFile(filename, str.replace('zh-Hant', 'zh-Hans'))
}
export function BuildView(program: Command, view: boolean) {
    program.command('view')
        .description(`build angular view`)
        .option(`-i18n`, 'update i18n source')
        .option(`-opencc`, 'run opencc')
        .action(function () {
            let file: string
            let args: Array<string>
            const opts = this.opts()
            const cwd = normalize(join(__dirname, '..', '..', 'view'))
            if (opts['I18n']) {
                file = 'ng'
                args = ['extract-i18n']
            } else if (opts['Opencc']) {
                opencc(cwd, join('src', 'locale', 'zh-Hant.xlf'), join('src', 'locale', 'zh-Hans.xlf')).catch((e) => {
                    console.log(e)
                    process.exit(1)
                })
                return
            } else {
                file = 'ng'
                args = ['build', '--prod', '--base-href', '/view/', '--localize']
            }
            console.log(`cwd=${cwd}`)
            console.log(file, args.join(' '))
            ExecFile(file, args, {
                cwd: cwd,
            }).catch(() => {
                process.exit(1)
            })
        })
}