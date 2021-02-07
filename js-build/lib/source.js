"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildSource = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("./utils");
async function copyFile(src, dst) {
    try {
        await fs_1.promises.copyFile(src, dst);
    }
    catch (e) {
        if (e.code != 'ENOENT') {
            console.warn(e);
            throw e;
        }
    }
}
class Source {
    constructor(view) {
        this.view = view;
    }
    async build() {
        const cwd = path_1.normalize(path_1.join(__dirname, '..', '..'));
        await copyFile(path_1.join(cwd, 'view', 'dist', 'view', 'en', '3rdpartylicenses.txt'), path_1.join(cwd, 'static', 'public', '3rdpartylicenses.txt'));
        await this._buildStatic(cwd);
        await this._buildDocument(cwd);
        if (this.view) {
            await this._buildSource(cwd, 'zh-Hant');
            await this._buildSource(cwd, 'zh-Hans');
            await this._buildSource(cwd, 'en-US');
        }
    }
    async _buildSource(cwd, name) {
        const file = 'statik';
        const args = [
            `-src=${path_1.join('view', 'dist', 'view', name)}`,
            `-dest=${path_1.join('assets', name)}`,
            '-ns', name, '-f',
        ];
        console.log(file, ...args);
        await utils_1.ExecFile(file, args, {
            cwd: cwd,
        });
    }
    async _buildDocument(cwd) {
        const file = 'statik';
        const args = [
            `-src=${path_1.join('static', 'document')}`,
            `-dest=${path_1.join('assets', 'document')}`,
            '-ns', 'document', '-f',
        ];
        console.log(file, ...args);
        await utils_1.ExecFile(file, args, {
            cwd: cwd,
        });
    }
    async _buildStatic(cwd) {
        const file = 'statik';
        const args = [
            `-src=${path_1.join('static', 'public')}`,
            `-dest=${path_1.join('assets', 'static')}`,
            '-ns', 'static', '-f',
        ];
        console.log(file, ...args);
        await utils_1.ExecFile(file, args, {
            cwd: cwd,
        });
    }
}
function BuildSource(program, view) {
    program.command('source')
        .description(`build static source to golang code`)
        .action(function () {
        const source = new Source(view);
        source.build().catch(() => {
            process.exit(1);
        });
    });
}
exports.BuildSource = BuildSource;
