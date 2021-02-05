import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPageComponent } from './login-page/login-page.component';
import { FormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login.routing';



@NgModule({
  declarations: [LoginPageComponent],
  imports: [
    CommonModule,
    FormsModule ,
    LoginRoutingModule     
  ]
})
export class LoginModule { }
