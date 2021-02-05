import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { Closed } from 'src/app/core/utils/closed';
import { RequireNet } from 'src/app/core/utils/requirenet';

@Component({
  selector: 'app-require',
  templateUrl: './require.component.html',
  styleUrls: ['./require.component.scss']
})
export class RequireComponent implements OnInit, AfterViewInit, OnDestroy {
  disabled = false
  content = 'kate beckinsale is so beauty'
  private closed_ = new Closed()
  constructor(
    private readonly toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
  }
  @ViewChild("clipboard")
  private readonly clipboard_: ElementRef | undefined
  private clipboardjs_: any
  ngAfterViewInit() {
    RequireNet('clipboard').then((ClipboardJS) => {
      if (this.closed_.isClosed) {
        return
      }
      this.clipboardjs_ = new ClipboardJS(this.clipboard_?.nativeElement).on('success', () => {
        if (this.closed_.isNotClosed) {
          this.toasterService.pop('info', '', "copied")
        }
      }).on('error', (evt: any) => {
        if (this.closed_.isNotClosed) {
          this.toasterService.pop('error', undefined, "copied error")
          console.error('Action:', evt.action)
          console.error('Trigger:', evt.trigger)
        }
      })
    })
  }
  ngOnDestroy() {
    this.closed_.close()
    if (this.clipboardjs_) {
      this.clipboardjs_.destroy()
      this.clipboardjs_ = null
    }
  }
  onCliCkCopyClipboard() {
    const element = this.clipboard_?.nativeElement
    element?.setAttribute(
      'data-clipboard-text',
      this.content,
    )
    element?.click()
  }
  onClickMD5() {
    if (this.disabled) {
      return
    }
    this.disabled = true
    RequireNet('md5').then((md5) => {
      const at = new Date().toString()
      const v = md5(at)
      console.log(at, v)
      this.toasterService.pop('success', undefined, `${at} : ${v}`)
    }).catch((e) => {
      console.log(e)
      this.toasterService.pop('error', undefined, e)
    }).finally(() => {
      this.disabled = false
    })
  }
  onClickRequireSingle() {
    if (this.disabled) {
      return
    }
    this.disabled = true
    RequireNet('moment').then((moment) => {
      const at = new moment().format('yyyy-MM-DD hh:mm:ss')
      console.log('moment', moment, at)
      this.toasterService.pop('success', undefined, `at ${at}`)
    }).catch((e) => {
      console.log(e)
      this.toasterService.pop('error', undefined, e)
    }).finally(() => {
      this.disabled = false
    })
  }
  onClickRequireMultiple() {
    if (this.disabled) {
      return
    }
    RequireNet('moment', 'jquery').then((ms) => {
      const moment = ms[0]
      const jquery = ms[1]
      const at = new moment().format('yyyy-MM-DD hh:mm:ss')
      const tilte = jquery('title').text()
      console.log(`moment`, moment, at)
      console.log(`jquery`, jquery, tilte)
      this.toasterService.pop('success', undefined, `${tilte} at ${at}`)
    }).catch((e) => {
      console.log(e)
      this.toasterService.pop('error', undefined, e)
    }).finally(() => {
      this.disabled = false
    })
  }
}
