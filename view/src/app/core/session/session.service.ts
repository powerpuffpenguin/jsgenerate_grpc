import { Injectable } from '@angular/core';
class Session {

}
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  async login(name: string, password: string, remember: boolean) {
    return new Session()
  }
}
