import { HttpHeaders, HttpParams, HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { Observable } from 'rxjs';
export function resolveError(e: any): string {
    console.log(e)
    if (!e) {
        return "nil"
    }
    if (typeof e === "string") {
        return e
    }
    if (e !== null && typeof e === 'object' && typeof e.status === "number") {
        return resolveHttpError(e)
    }
    return "unknow"
}
export function resolveHttpError(e: any) {
    let error = e.error
    const status = e.status
    if (typeof e.error === "string") {
        return `${status} ${error}`
    }
    if (error) {
        if (error.message) {
            return error.message
        } else if (error.description) {
            return `${status} ${error.description}`
        } else if (error.error) {
            error = error.error
            if (error.message) {
                return `${status} ${error.message}`
            }
            return `${status} ${error}`
        }
    } else if (e.message) {
        return `${status} ${e.message}`
    }
    return `${status} ${e.statusText}`
}
function wrapObservable<T>() {
    return (source: Observable<T>) => {
        return new Observable<T>(subscriber => {
            source.subscribe({
                next(v) {
                    try {
                        subscriber.next(v)
                    } catch (e) {
                        subscriber.error(resolveError(e))
                    }
                },
                error(e) {
                    subscriber.error(resolveError(e))
                },
                complete() {
                    subscriber.complete()
                },
            })
        })
    }
}
export class RESTful {
    constructor(public root: string, public version: string, public url: string) {

    }
    get baseURL(): string {
        return `${this.root}/${this.version}/${this.url}`
    }
    getURL(
        queryParams?: {
            [param: string]: string | ReadonlyArray<string>;
        },
        ...id: Array<string | number | boolean>
    ) {
        let url = this.baseURL
        if (id && id.length > 0) {
            for (let i = 0; i < id.length; i++) {
                const codec = new HttpUrlEncodingCodec()
                id[i] = codec.encodeKey(id[i].toString())
            }
            url += '/' + id.join('/')
        }
        if (queryParams) {
            const query = new HttpParams({
                fromObject: queryParams,
            }).toString()
            if (query.length > 0) {
                url = `${url}?${query}`
            }
        }
        return url
    }
    websocketURL(
        queryParams?: {
            [param: string]: string | ReadonlyArray<string>;
        },
        ...id: Array<string | number | boolean>
    ): string {
        const location = document.location
        let addr: string
        // console.log(location.protocol)
        if (location.protocol == "https:") {
            addr = `wss://${location.hostname}`
            if (location.port == "") {
                addr += ":443"
            } else {
                addr += `:${location.port}`
            }
        } else {
            addr = `ws://${location.hostname}`
            if (location.port == "") {
                addr += ":80"
            } else {
                addr += `:${location.port}`
            }
        }
        return `${addr}${this.getURL(queryParams, ...id)}`
    }
}