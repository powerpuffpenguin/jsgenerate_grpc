import { promises } from 'fs';
import { join, normalize } from 'path';
import { Command } from '../commander';
import { ExecFile } from './utils';

async function copyFile(src: string, dst: string) {
    try {
        await promises.copyFile(src, dst)
    } catch (e) {
        if (e.code != 'ENOENT') {
            console.warn(e)
            throw e
        }
    }
}
class Source {
    constructor(public readonly view: boolean) {

    }
    async build() {
        const cwd = normalize(join(__dirname, '..', '..'))
        await copyFile(join(cwd, 'view', 'dist', 'view', 'en', '3rdpartylicenses.txt'), join(cwd, 'static', '3rdpartylicenses.txt'))

        await this._buildStatic(cwd)
        await this._buildDocument(cwd)
        if (this.view) {
            await this._buildSource(cwd, 'zh-Hant')
            await this._buildSource(cwd, 'zh-Hans')
            await this._buildSource(cwd, 'en-US')
        }
    }
    private async _buildSource(cwd: string, name: string) {
        const file = 'statik'
        const args = [
            `-src=${join('view', 'dist', 'view', name)}`,
            `-dest=${join('assets', name)}`,
            '-ns', name, '-f',
        ]
        console.log(file, ...args)
        await ExecFile(file, args, {
            cwd: cwd,
        })
    }
    private async _buildDocument(cwd: string) {
        const file = 'statik'
        const args = [
            `-src=${join('static', 'document')}`,
            `-dest=${join('assets', 'document')}`,
            '-ns', 'document', '-f',
        ]
        console.log(file, ...args)
        await ExecFile(file, args, {
            cwd: cwd,
        })
    }
    private async _buildStatic(cwd: string) {
        const file = 'statik'
        const args = [
            `-src=${join('static', 'public')}`,
            `-dest=${join('assets', 'static')}`,
            '-ns', 'static', '-f',
        ]
        console.log(file, ...args)
        await ExecFile(file, args, {
            cwd: cwd,
        })
    }
}

export function BuildSource(program: Command, view: boolean) {
    program.command('source')
        .description(`build static source to golang code`)
        .action(function () {
            const source = new Source(view)
            source.build().catch(() => {
                process.exit(1)
            })
        })
}