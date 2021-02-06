import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http'
import { from, Observable } from 'rxjs';
import { getUnix, getUUID, md5String } from '../utils/utils';
import { Manager } from '../session/manager';
import { catchError, concatAll, first, mapTo } from 'rxjs/operators';


@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor() { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers = req.headers
    if (headers.has(`Interceptor`)) {
      const interceptor = headers.get(`Interceptor`)
      headers = headers.delete(`Interceptor`)
      if (interceptor === 'none') {
        return next.handle(req.clone({
          headers: headers,
        }))
      }
    }

    if (req.method == "GET" || req.method == "HEAD") {
      headers = headers.set('ngsw-bypass', '')
    }
    const access = Manager.instance.access
    if (access) {
      if (!headers.has('Authorization')) {
        headers = headers.set('Authorization', `Bearer ${access.token}`)
      }
      if (!headers.has(`Signature`) && access.data.salt) {
        try {
          const unix = getUnix().toString()
          const nonce = getUUID()
          const signature = md5String(md5String(unix + nonce) + access.data.salt)
          headers = headers.set(`Unix`, unix)
          headers = headers.set(`Nonce`, nonce)
          headers = headers.set(`Signature`, signature)
        } catch (e) {
          console.log(e)
        }
      }
    }
    return next.handle(req.clone({
      headers: headers,
    })).pipe(
      catchError((err, caught) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            return from(new Promise<void>((resolve, reject) => {
              // setTimeout(() => {
              //   reject(new Error('test'))
              //   // resolve()
              // }, 1000 * 5);
              resolve()
            })).pipe(
              mapTo(caught),
              concatAll(),
            )
          }
        }
        throw err
      }),
    )
  }
}
