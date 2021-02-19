import { MakeRESTful } from './restful';
const root = 'api'

export const ServerAPI = {
    v1: {
        features: {
            sessions: MakeRESTful(root, 'v1', 'features', 'sessions'),
            systems: MakeRESTful(root, 'v1', 'features', 'systems'),
        },
    },
    static: {
        licenses: MakeRESTful('static', '3rdpartylicenses.txt'),
        license: MakeRESTful('static', 'LICENSE.txt'),
    },
}
export enum Authorization {
    // super administrator
    Root = 1,
}