import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InputModel } from 'src/app/api/models';
import { LoginService } from 'src/app/api/services';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private testService: LoginService) { }
  public form: InputModel = {
    email: '',
    password: '',
    rememberMe: false
  }
  invalidLogin: boolean = false;;

  ngOnInit(): void {
  }

  login() {
    this.testService.loginPost({ body: this.form }).subscribe(response => {

      var parsedResponse = JSON.parse(<any>response);
      const token = parsedResponse.token;
      localStorage.setItem("jwt", token);
      this.invalidLogin = false;
      this.router.navigate(["/"]);
    }, errors => {
      this.invalidLogin = true;

    });
  }

  logOut() {
    localStorage.removeItem("jwt");
  }
}
