"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildGRPC = void 0;
class GRPC {
    constructor(language, uuid) {
        this.language = language;
        this.uuid = uuid;
    }
}
function BuildGRPC(program, uuid) {
    program.command('grpc')
        .description('build *.proto to grpc code')
        .option('-l,--language [go dart]', 'grpc target language')
        .action(function () {
        const opts = this.opts();
        const grpc = new GRPC(opts['language'], uuid);
        console.log(grpc);
        throw grpc;
    });
}
exports.BuildGRPC = BuildGRPC;
