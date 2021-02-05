import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { ToasterModule, ToasterService } from 'angular2-toaster';

import { SharedModule } from "./shared/shared.module";



import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, FormsModule,
    HttpClientModule,
    SharedModule,
    AppRoutingModule, ToasterModule.forRoot()
  ],
  providers: [ToasterService],
  bootstrap: [AppComponent]
})
export class AppModule { }
