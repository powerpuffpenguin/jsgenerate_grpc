import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { ToasterService } from 'angular2-toaster';
import { Closed } from 'src/app/core/utils/closed';
import { ServerAPI } from 'src/app/core/core/api';
import { md5String } from 'src/app/core/utils/utils';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit, OnDestroy {
  disabled = true
  old = ''
  val = ''
  private closed_ = new Closed()
  constructor(private httpClient: HttpClient,
    private toasterService: ToasterService,
    private matDialogRef: MatDialogRef<PasswordComponent>,) { }
  ngOnInit(): void {
  }
  ngOnDestroy() {
    this.closed_.close()
  }
  onSave() {
    this.disabled = true
    ServerAPI.v1.features.sessions.patch(this.httpClient,
      {
        'old': md5String(this.old),
        'value': md5String(this.val),
      },
      undefined,
      'password',
    ).pipe(
      takeUntil(this.closed_.observable),
      finalize(() => {
        this.disabled = false
      })
    ).subscribe(() => {
      this.toasterService.pop('success', undefined, 'password changed')
    }, (e) => {
      this.toasterService.pop('error', undefined, e)
    })
  }
  onClose() {
    this.matDialogRef.close()
  }
}
