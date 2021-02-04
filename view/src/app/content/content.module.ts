import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AboutComponent } from './about/about.component';
import { LicenseComponent } from './license/license.component';


@NgModule({
  declarations: [AboutComponent, LicenseComponent],
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule,
    ContentRoutingModule
  ]
})
export class ContentModule { }
