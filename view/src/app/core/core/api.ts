import { RESTful } from './restful';
const root = '/api'

export const ServerAPI = {
    v1: {
        features: {
            sessions: new RESTful(root, 'v1', 'features/sessions'),
            systems: new RESTful(root, 'v1', 'features/systems'),
        },
    },
    static: {
        licenses: '/static/3rdpartylicenses.txt',
        license: '/static/LICENSE.txt',
    },
}
export enum Authorization {
    // super administrator
    Root = 1,
}