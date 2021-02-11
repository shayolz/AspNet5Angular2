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

  public displayData: any = "loading...";
  ngOnInit(): void {

    this.testService.weatherForecastGet$Json().subscribe(response => {

      setTimeout(   ()=>{
        this.displayData = [];
        response.map((x: any) => this.displayData.push(x.summary + x.temperatureC))
      }
        ,1000)
    }, errors => {
      console.log(errors)
    });
  }
}