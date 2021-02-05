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
    constructor(public readonly root: string, public readonly version: string, public readonly url: string) {
        this.baseURL_ = `${root}/${version}/${url}`
    }
    private baseURL_ = ''
    get baseURL(): string {
        return this.baseURL_
    }
    httpURL(...path: Array<string | number | boolean>): string {
        let url = this.baseURL
        if (path && path.length > 0) {
            for (let i = 0; i < path.length; i++) {
                const codec = new HttpUrlEncodingCodec()
                path[i] = codec.encodeKey(path[i].toString())
            }
            url += '/' + path.join('/')
        }
        return url
    }
    websocketURL(
        ...path: Array<string | number | boolean>
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
        return `${addr}${this.httpURL(...path)}`
    }
    get<T>(client: HttpClient,
        options?: {
            headers?: HttpHeaders | {
                [header: string]: string | string[];
            };
            observe?: 'body';
            params?: HttpParams | {
                [param: string]: string | string[];
            };
            reportProgress?: boolean;
            responseType?: 'json';
            withCredentials?: boolean;
        },
        ...path: Array<string | number | boolean>
    ): Observable<T>;
    get(client: HttpClient,
        options: {
            headers?: HttpHeaders | {
                [header: string]: string | string[];
            };
            observe?: 'body';
            params?: HttpParams | {
                [param: string]: string | string[];
            };
            reportProgress?: boolean;
            responseType: 'text';
            withCredentials?: boolean;
        },
        ...path: Array<string | number | boolean>
    ): Observable<string>;
    get(client: HttpClient, options?: any, ...path: Array<string | number | boolean>): any {
        return client.get(this.httpURL(...path), options).pipe(wrapObservable())
    }
    post<T>(client: HttpClient, body: any | null,
        options?: {
            headers?: HttpHeaders | {
                [header: string]: string | string[];
            };
            observe?: 'body';
            params?: HttpParams | {
                [param: string]: string | string[];
            };
            reportProgress?: boolean;
            responseType?: 'json';
            withCredentials?: boolean;
        },
        ...path: Array<string | number | boolean>
    ): Observable<T> {
        return client.post<T>(this.httpURL(...path), body, options).pipe(wrapObservable())
    }
    delete<T>(client: HttpClient,
        options?: {
            headers?: HttpHeaders | {
                [header: string]: string | string[];
            };
            observe?: 'body';
            params?: HttpParams | {
                [param: string]: string | string[];
            };
            reportProgress?: boolean;
            responseType?: 'json';
            withCredentials?: boolean;
        },
        ...path: Array<string | number | boolean>
    ): Observable<T> {
        return client.delete<T>(this.httpURL(...path), options).pipe(wrapObservable())
    }
    put<T>(client: HttpClient, body: any | null,
        options?: {
            headers?: HttpHeaders | {
                [header: string]: string | string[];
            };
            observe?: 'body';
            params?: HttpParams | {
                [param: string]: string | string[];
            };
            reportProgress?: boolean;
            responseType?: 'json';
            withCredentials?: boolean;
        },
        ...path: Array<string | number | boolean>
    ): Observable<T> {
        return client.put<T>(this.httpURL(...path), body, options).pipe(wrapObservable())
    }
    patch<T>(client: HttpClient, body: any | null,
        options?: {
            headers?: HttpHeaders | {
                [header: string]: string | string[];
            };
            observe?: 'body';
            params?: HttpParams | {
                [param: string]: string | string[];
            };
            reportProgress?: boolean;
            responseType?: 'json';
            withCredentials?: boolean;
        },
        ...path: Array<string | number | boolean>
    ): Observable<T> {
        return client.patch<T>(this.httpURL(...path), body, options).pipe(wrapObservable())
    }
}