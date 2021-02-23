"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildView = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("./utils");
async function opencc(cwd, src, dst) {
    const args = ['-i', src, '-o', dst, '-c', 't2s.json'];
    const file = 'opencc';
    console.log(`cwd=${cwd}`);
    console.log(file, args.join(' '));
    await utils_1.ExecFile(file, args, {
        cwd: cwd,
    });
    const filename = path_1.join(cwd, dst);
    const buffer = await fs_1.promises.readFile(filename);
    const str = buffer.toString('utf8');
    await fs_1.promises.writeFile(filename, str.replace('zh-Hant', 'zh-Hans'));
}
function BuildView(program, view) {
    program.command('view')
        .description(`build angular view`)
        .option(`-i18n`, 'update i18n source')
        .option(`-opencc`, 'run opencc')
        .action(function () {
        let file;
        let args;
        const opts = this.opts();
        const cwd = path_1.normalize(path_1.join(__dirname, '..', '..', 'view'));
        if (opts['I18n']) {
            file = 'ng';
            args = ['extract-i18n'];
        }
        else if (opts['Opencc']) {
            opencc(cwd, path_1.join('src', 'locale', 'zh-Hant.xlf'), path_1.join('src', 'locale', 'zh-Hans.xlf')).catch((e) => {
                console.log(e);
                process.exit(1);
            });
            return;
        }
        else {
            file = 'ng';
            args = ['build', '--prod', '--base-href', '/view/', '--localize'];
        }
        console.log(`cwd=${cwd}`);
        console.log(file, args.join(' '));
        utils_1.ExecFile(file, args, {
            cwd: cwd,
        }).catch(() => {
            process.exit(1);
        });
    });
}
exports.BuildView = BuildView;
