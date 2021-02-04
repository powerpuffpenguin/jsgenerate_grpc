import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private fullscreen_ = new BehaviorSubject<boolean>(false)
  constructor() {

  }
}
