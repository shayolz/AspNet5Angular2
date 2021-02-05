import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {  HttpClientModule } from '@angular/common/http';
import { ApiModule } from './api/api.module';
import { JwtModule } from '@auth0/angular-jwt';
import { RouterModule } from '@angular/router';
import { LoginPageComponent } from './login/login-page/login-page.component';
import { AuthGuard } from './AuthGard';
import { FormsModule } from '@angular/forms';
import { MainContainerComponent } from './home-page/main-container/main-container.component';
import { CommonModule } from '@angular/common';

export function tokenGetter() {
  return localStorage.getItem("jwt");
}

@NgModule({
  declarations: [
    AppComponent,
    MainContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule      ,
    CommonModule ,
    BrowserModule ,
    ApiModule.forRoot({ rootUrl: 'http://localhost:64133' }),
    RouterModule.forRoot([
      { path: '', component: AppComponent, canActivate: [AuthGuard] },
      { path: 'login', component: LoginPageComponent },
    ]),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:5000"],
        disallowedRoutes: []
      }
    })
  ],
  providers: [AuthGuard],

  bootstrap: [AppComponent]
})
export class AppModule { }
