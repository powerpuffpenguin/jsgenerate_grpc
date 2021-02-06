import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServerAPI } from '../core/api';
import jwtDecode from 'jwt-decode';
import { getItem, setItem } from "../utils/local-storage";
import { Completer } from '../utils/completer';
import { getUnix, getUUID, md5String } from '../utils/utils';
const AccessKey = 'token.tourist.access'
const RefreshKey = 'token.tourist.refresh'
export interface RefreshResponse {
  // access jwt token
  access: string
}
export interface Response extends RefreshResponse {
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
    if (token.seconds < 60 * 5) {
      this.access_ = undefined
      return await this.access()
    }
    return token
  }
  async access(): Promise<Token> {
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
    if (this.refresh_ && this.refresh_.seconds < 60 * 5) {
      // request refresh token
      try {
        const tokent = this.refresh_
        const response = await ServerAPI.v1.features.sessions.post<RefreshResponse>(this.httpClient,
          undefined,
          {
            headers: generateHeader(getUnix(), tokent.data.salt, tokent.token),
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
      }
    }
    // request new token
    const response = await ServerAPI.v1.features.sessions.get<Response>(this.httpClient,
      {
        headers: generateHeader(),
      },
      'tourist',
    ).toPromise()
    const access = new Token(response.access)
    if (access.seconds > 60 * 5) {
      setItem(AccessKey, access.token)
    }
    if (typeof response.refresh === "string" && response.refresh.length > 0) {
      try {
        const refresh = new Token(response.refresh)
        if (refresh.seconds > 60 * 5) {
          setItem(RefreshKey, refresh.token)
        }
      } catch (e) {
        console.warn('new tourist refresh token error :', e)
      }
    }
    return access
  }
}
export function generateHeader(
  unix?: number,
  slat?: string,
  authorization?: string,
): {
  [header: string]: string | string[];
} {
  const headers: {
    [header: string]: string | string[];
  } = {
    'Interceptor': 'none',
  }
  if (authorization) {
    headers['Authorization'] = `Bearer ${authorization}`
  }
  if (unix) {
    headers['Unix'] = unix.toString()
    if (slat) {
      const nonce = getUUID()
      headers['Nonce'] = nonce
      const signature = md5String(md5String(unix + nonce) + slat)
      headers['Signature'] = signature
    }
  }
  return headers
}