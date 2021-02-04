import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getItem } from "../utils/local-storage";

const ThemeKey = 'settings.theme'
export const DefaultTheme = 'deeppurple-amber'
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly theme_ = new BehaviorSubject<string>(loadTheme())
  constructor() { }
  get theme(): Observable<string> {
    return this.theme_
  }
  getTheme(): string {
    return this.theme_.value
  }
  nextTheme(theme: string) {
    if (theme === this.theme_.value) {
      return
    }
    if (theme !== 'deeppurple-amber' &&
      theme !== 'indigo-pink' &&
      theme !== 'pink-bluegrey' &&
      theme !== 'purple-green') {
      throw new Error(`theme not supported : ${theme}`);
    }
    this.theme_.next(theme)
  }
}
function loadTheme(): string {
  let result = getItem(ThemeKey)
  if (result !== 'deeppurple-amber' &&
    result !== 'indigo-pink' &&
    result !== 'pink-bluegrey' &&
    result !== 'purple-green') {
    result = DefaultTheme
  }
  return result
}