import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing.module';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { QueryComponent } from './query/query.component';


@NgModule({
  declarations: [QueryComponent],
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatFormFieldModule, MatCheckboxModule,
    MatInputModule, MatPaginatorModule, MatTableModule,
    MatTooltipModule, MatIconModule,
    UserRoutingModule
  ]
})
export class UserModule { }
