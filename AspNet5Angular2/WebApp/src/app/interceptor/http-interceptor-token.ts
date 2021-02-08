import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class httpInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, newRequest: HttpHandler): Observable<HttpEvent<any>> {

        //Get Token data from local storage
        var token = localStorage.getItem("jwt");
        console.log("Current token request: ", token)

        if (token) {
            // add authorization header to request
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json;charset=utf-8;'
                }
            });
        }

        return newRequest.handle(request);
    }
}