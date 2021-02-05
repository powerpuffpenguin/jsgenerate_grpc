import { RESTful } from './restful';
const root = '/api'

export const ServerAPI = {
    v1: {
        features: {
            session: new RESTful(root, 'v1', 'features/session'),
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