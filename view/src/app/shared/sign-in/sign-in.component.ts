import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToasterService } from 'angular2-toaster';
import { SessionService } from 'src/app/core/session/session.service';
import { Closed } from 'src/app/core/utils/closed';

@Component({
  selector: 'shared-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {
  constructor(private readonly sessionService: SessionService,
    private readonly matDialogRef: MatDialogRef<SignInComponent>,
    private readonly toasterService: ToasterService,
  ) { }
  disabled = false

  name = ''
  password = ''
  remember = true
  visibility = false
  private closed_ = new Closed()
  ngOnInit(): void {
  }
  ngOnDestroy() {
    this.closed_.close()
  }
  onClose() {
    this.matDialogRef.close()
  }
  onSubmit() {
    if (this.disabled) {
      return
    }

    this.disabled = true
    this.closed_.watchPromise(
      this.sessionService.login(this.name, this.password, this.remember),
      (session) => {
        console.log(session)
      },
      (e) => {
        this.toasterService.pop('error', undefined, e)
      },
      () => {
        this.disabled = false
      },
    )
  }
}
