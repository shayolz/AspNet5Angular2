import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { WeatherForecastService } from './api/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private http: HttpClient, private testService: WeatherForecastService, private jwtHelper: JwtHelperService, private router: Router){

  }
  title = 'Angular2TestApp';
  collapsed:boolean = false;

 ngOnInit(){
    // this.testService.weatherForecastGet$Json().subscribe(response=> console.log("response",response));
  
    // this.http.get("http://localhost:5000/WeatherForecast", {
    //   headers: new HttpHeaders({
    //     "Content-Type": "application/json"
    //   })
    // }).subscribe(response => {
    //   console.log("response",response)
    // }, err => {
    //   console.log(err)
    // });
  }

  isUserAuthenticated() {
    const token: any = localStorage.getItem("jwt");
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return true;
    }
    else {
      return false;
    }
  }
  public logOut = () => {
    localStorage.removeItem("jwt");
  }
}
