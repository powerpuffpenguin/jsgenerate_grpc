import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequireNet } from '../utils/requirenet';
import { TouristService, Token, loadToken, RefreshResponse, Response, generateHeader } from './tourist.service';
import { Completer } from '../utils/completer';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServerAPI } from '../core/api';
import { setItem } from "../utils/local-storage";
import { getUnix, getUUID, md5String } from '../utils/utils';

const AccessKey = 'token.session.access'
const RefreshKey = 'token.session.refresh'
class Session {
  constructor(public readonly access?: Token, public readonly refresh?: Token) {
  }
}
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly ready_ = new Completer<void>()
  get ready(): Promise<void> {
    return this.ready_.promise
  }
  get session(): Promise<Session | undefined> {
    return this.ready.then(() => {
      return this.subject_.value
    })
  }
  private readonly subject_ = new BehaviorSubject<Session | undefined>(undefined)
  get observable(): Observable<Session | undefined> {
    return this.subject_
  }
  private remember_ = false
  constructor(private readonly httpClient: HttpClient,
    private readonly touristService: TouristService,
  ) {
    let access: Token | undefined
    let refresh: Token | undefined
    try {
      const token = loadToken(AccessKey)
      if (token) {
        access = token
        console.log(`load session access token`, token)
      }
    } catch (e) {
      console.warn(`load session access token error :`, e)
    }
    try {
      const token = loadToken(RefreshKey)
      if (token) {
        refresh = token
        console.log(`load session refresh token`, token)
      }
    } catch (e) {
      console.warn(`load session refresh token error :`, e)
    }
    this._restore(access, refresh)
  }
  private async _restore(access?: Token, refresh?: Token) {
    let session: Session | undefined
    try {
      if (access) {
        console.log(`restore session access token :`, access)
        if (refresh) {
          console.log(`restore session refresh token :`, refresh)
        }
        session = new Session(access, refresh)
      } else if (refresh) {
        console.log(`restore session refresh token :`, refresh)
        const access = await this._refresh(refresh)
        console.log(`refresh session access token :`, access)
        session = new Session(access, refresh)
      }
    } catch (e) {
      console.error(`restore session token error : `, e)
    } finally {
      this.ready_.resolve()
      if (session) {
        this.remember_ = true
        this.subject_.next(session)
      }
    }
  }
  private async _refresh(refresh: Token): Promise<Token> {
    const response = await ServerAPI.v1.features.sessions.post<RefreshResponse>(this.httpClient,
      undefined,
      {
        headers: generateHeader(getUnix(), refresh.data.salt, refresh.token),
      },
      'refresh',
    ).toPromise()
    return new Token(response.access)
  }
  private refresh_: Completer<string | undefined> | undefined
  async refresh(slat: string, accessToken: string): Promise<string | undefined> {
    const session = this.subject_.value
    if (!session || accessToken !== session.access?.token) {
      return
    }
    const refresh = session.refresh
    if (!refresh || refresh.seconds < 60 * 5) {
      return
    }

    if (!this.refresh_) {
      this.refresh_ = new Completer<string | undefined>()
      try {
        const token = await this._refreshAccess(slat, accessToken, refresh.token)
        this.refresh_.resolve(token)
      } catch (e) {
        this.refresh_.reject(e)
        const promise = this.refresh_.promise
        this.refresh_ = undefined
        return promise
      }
    }
    return this.refresh_.promise
  }
  private async _refreshAccess(slat: string, accessToken: string, refreshToken: string): Promise<string> {
    const response = await ServerAPI.v1.features.sessions.post<RefreshResponse>(this.httpClient,
      undefined,
      {
        headers: generateHeader(getUnix(), slat, refreshToken),
      },
      'refresh',
    ).toPromise()
    const session = this.subject_.value
    if (!session || session.access?.token != accessToken || session.refresh?.token != refreshToken) {
      throw new Error("refresh expired")
    }
    const access = new Token(response.access)
    if (this.remember_ && access.seconds > 60) {
      setItem(AccessKey, access.token)
    }
    return access.token
  }
  private readonly signining_ = new BehaviorSubject<boolean>(false)
  get signining(): Observable<boolean> {
    return this.signining_
  }
  async signin(name: string, password: string, remember: boolean) {
    if (this.signining_.value) {
      console.warn('wait signing completed')
      return
    }
    this.signining_.next(true)
    try {
      const tourist = await this.touristService.accessValid()
      const unix = getUnix()
      password = md5String(md5String(password) + tourist.data.salt + unix)

      const response = await ServerAPI.v1.features.sessions.post<Response>(this.httpClient,
        {
          name: name,
          password: password,
        },
        {
          headers: generateHeader(unix, tourist.data.salt, tourist.token),
        },
      ).toPromise()
      const access = new Token(response.access)
      if (remember && access.seconds > 60) {
        setItem(AccessKey, access.token)
      }
      let refresh: Token | undefined
      if (remember && typeof response.refresh === "string" && response.refresh.length > 0) {
        try {
          refresh = new Token(response.refresh)
          if (refresh.seconds > 60 * 5) {
            setItem(RefreshKey, refresh.token)
          }
        } catch (e) {
          console.warn('new session refresh token error :', e)
        }
      }
      this.remember_ = remember
      this.subject_.next(new Session(access, refresh))
    } finally {
      this.signining_.next(false)
    }
  }
}
