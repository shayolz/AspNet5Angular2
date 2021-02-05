import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { WeatherForecastService } from 'src/app/api/services';

@Component({
  selector: 'app-ghigo',
  templateUrl: './ghigo.component.html',
  styleUrls: ['./ghigo.component.scss']
})
export class GhigoComponent implements OnInit {

  constructor(private http: HttpClient, private testService: WeatherForecastService) { }
public form:any={
  type:''
}
  public displayData:any = "loading...";
  ngOnInit(): void {
  
    this.http.get("http://localhost:5000/WeatherForecast", {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    }).subscribe((response:any)=> {
      this.displayData = [];

      response.map((x:any)=> this.displayData.push(x.summary + x.temperatureC))
    }, err => {
      console.log(err)
    });
  }

}
