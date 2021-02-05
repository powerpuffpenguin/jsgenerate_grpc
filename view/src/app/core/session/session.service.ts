import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TouristService } from './tourist.service';
class Session {

}
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private readonly httpClient: HttpClient,
    private readonly touristService: TouristService,
  ) { }

  async login(name: string, password: string, remember: boolean) {
    const tourist = await this.touristService.access()
    console.log(tourist)
    return new Session()
  }
}
