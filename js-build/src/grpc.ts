import { Command } from '../commander'
class GRPC {
    constructor(public readonly language: string, public readonly uuid: string) {
    }
}
export function BuildGRPC(program: Command, uuid: string) {
    program.command('grpc')
        .description('build *.proto to grpc code')
        .option('-l,--language [go dart]', 'grpc target language')
        .action(function () {
            const opts = this.opts()
            const grpc = new GRPC(opts['language'], uuid)
            console.log(grpc)
            throw grpc
        })
}