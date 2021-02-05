import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServerAPI } from '../core/api';
import jwtDecode from 'jwt-decode';
import { getItem, setItem } from "../utils/local-storage";
import { Completer } from '../utils/completer';
const AccessKey = 'token.tourist.access'
const RefreshKey = 'token.tourist.refresh'
interface RefreshResponse {
  // access jwt token
  access: string
}
interface Response extends RefreshResponse {
  // refresh jwt token
  refresh: string
}
interface Data {
  readonly id: string
  readonly name?: string
  readonly authorization?: Array<number>
  readonly nickname?: string

  // tourist or user
  readonly tourist: boolean
  // access or refresh
  readonly access: boolean
  // expiration unix
  readonly exp: number
  // encryption salt
  readonly salt: string
  readonly sub: "tourist access" | "tourist refresh" | "access" | "refresh"
}
export class Token {
  private data_: Data
  get data(): Data {
    return this.data_
  }
  constructor(public readonly token: string) {
    this.data_ = jwtDecode<Data>(token)
  }
  /**
 * Return how long it will expire, if less than or equal to 0, it has expired
 */
  get seconds(): number {
    const now = Math.floor(Date.now() / 1000)
    return this.data_.exp - now
  }
  get valid(): boolean {
    return this.seconds >= 0
  }
}
export function loadToken(key: string): Token | undefined {
  const tokenString = getItem(key)
  if (typeof tokenString === "string" && tokenString.length > 0) {
    const tokent = new Token(tokenString)
    if (tokent.valid) {
      return tokent
    }
  }
  return undefined
}
@Injectable({
  providedIn: 'root'
})
export class TouristService {
  private access_: Completer<Token> | undefined
  private refresh_: Token | undefined
  constructor(private readonly httpClient: HttpClient,
  ) {
    try {
      const token = loadToken(AccessKey)
      if (token) {
        const completer = new Completer<Token>()
        completer.resolve(token)
        this.access_ = completer
        console.log(`load tourist access token`, token)
      }
    } catch (e) {
      console.warn(`load tourist access token error :`, e)
    }
    try {
      const token = loadToken(RefreshKey)
      if (token) {
        this.refresh_ = token
        console.log(`load tourist refresh token`, token)
      }
    } catch (e) {
      console.warn(`load tourist refresh token error :`, e)
    }
  }
  async accessValid(): Promise<Token> {
    const token = await this.access()
    if (!token.valid) {
      this.access_ = undefined
      return await this.access()
    }
    return token
  }
  async access(): Promise<Token> {
    this.access_ = undefined
    if (!this.access_) {
      this.access_ = new Completer<Token>()
      try {
        const token = await this._refreshAccess()
        this.access_.resolve(token)
      } catch (e) {
        this.access_.reject(e)
        const promise = this.access_.promise
        this.access_ = undefined
        return promise
      }
    }
    return this.access_.promise
  }
  private async _refreshAccess(): Promise<Token> {
    console.log(this.refresh_, this.refresh_?.valid)
    if (this.refresh_ && this.refresh_.valid) {
      // request refresh token
      try {
        const response = await ServerAPI.v1.features.sessions.post<RefreshResponse>(this.httpClient,
          undefined,
          {
            headers: {
              'Content-Type': 'application/json',
              // 'Interceptor': 'none',
            },
          },
          'refresh',
        ).toPromise()
        const access = new Token(response.access)
        if (access.seconds > 60) {
          setItem(AccessKey, access.token)
        }
        return access
      } catch (e) {
        throw e
        console.warn('tourist refresh tokent error :', e)
      }
    }
    // request new token
    const response = await ServerAPI.v1.features.sessions.get<Response>(this.httpClient,
      {
        headers: {
          'Interceptor': 'none',
        },
      },
      'tourist',
    ).toPromise()
    const access = new Token(response.access)
    if (access.seconds > 60) {
      //setItem(AccessKey, access.token)
    }
    if (typeof response.refresh === "string" && response.refresh.length > 0) {
      try {
        const refresh = new Token(response.refresh)
        if (refresh.seconds > 60) {
          setItem(RefreshKey, refresh.token)
        }
      } catch (e) {
        console.warn('new refresh token error :', e)
      }
    }
    return access
  }
}
