import { Component } from '@angular/core';
import { WeatherForecastService } from './api/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private testService: WeatherForecastService){

  }
  title = 'Angular2TestApp';
  collapsed:boolean = false;

 ngOnInit(){
    this.testService.weatherForecastGet$Json().subscribe(response=> console.log("response",response));
  }
}
