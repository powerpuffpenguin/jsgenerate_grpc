import { Component, OnInit } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { RequireNet } from 'src/app/core/utils/requirenet';

@Component({
  selector: 'app-require',
  templateUrl: './require.component.html',
  styleUrls: ['./require.component.scss']
})
export class RequireComponent implements OnInit {
  disabled = false
  constructor(
    private readonly toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
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
