(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "+Q7D":
/*!****************************************!*\
  !*** ./src/app/api/request-builder.ts ***!
  \****************************************/
/*! exports provided: RequestBuilder */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RequestBuilder", function() { return RequestBuilder; });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* tslint:disable */
/* eslint-disable */

/**
 * Custom parameter codec to correctly handle the plus sign in parameter
 * values. See https://github.com/angular/angular/issues/18261
 */
class ParameterCodec {
    encodeKey(key) {
        return encodeURIComponent(key);
    }
    encodeValue(value) {
        return encodeURIComponent(value);
    }
    decodeKey(key) {
        return decodeURIComponent(key);
    }
    decodeValue(value) {
        return decodeURIComponent(value);
    }
}
const ParameterCodecInstance = new ParameterCodec();
/**
 * Base class for a parameter
 */
class Parameter {
    constructor(name, value, options, defaultStyle, defaultExplode) {
        this.name = name;
        this.value = value;
        this.options = options;
        this.options = options || {};
        if (this.options.style === null || this.options.style === undefined) {
            this.options.style = defaultStyle;
        }
        if (this.options.explode === null || this.options.explode === undefined) {
            this.options.explode = defaultExplode;
        }
    }
    serializeValue(value, separator = ',') {
        if (value === null || value === undefined) {
            return '';
        }
        else if (value instanceof Array) {
            return value.map(v => this.serializeValue(v).split(separator).join(encodeURIComponent(separator))).join(separator);
        }
        else if (typeof value === 'object') {
            const array = [];
            for (const key of Object.keys(value)) {
                let propVal = value[key];
                if (propVal !== null && propVal !== undefined) {
                    propVal = this.serializeValue(propVal).split(separator).join(encodeURIComponent(separator));
                    if (this.options.explode) {
                        array.push(`${key}=${propVal}`);
                    }
                    else {
                        array.push(key);
                        array.push(propVal);
                    }
                }
            }
            return array.join(separator);
        }
        else {
            return String(value);
        }
    }
}
/**
 * A parameter in the operation path
 */
class PathParameter extends Parameter {
    constructor(name, value, options) {
        super(name, value, options, 'simple', false);
    }
    append(path) {
        let value = this.value;
        if (value === null || value === undefined) {
            value = '';
        }
        let prefix = this.options.style === 'label' ? '.' : '';
        let separator = this.options.explode ? prefix === '' ? ',' : prefix : ',';
        if (this.options.style === 'matrix') {
            // The parameter name is just used as prefix, except in some cases...
            prefix = `;${this.name}=`;
            if (this.options.explode && typeof value === 'object') {
                prefix = ';';
                if (value instanceof Array) {
                    // For arrays we have to repeat the name for each element
                    value = value.map(v => `${this.name}=${this.serializeValue(v, ';')}`);
                    separator = ';';
                }
                else {
                    // For objects we have to put each the key / value pairs
                    value = this.serializeValue(value, ';');
                }
            }
        }
        value = prefix + this.serializeValue(value, separator);
        // Replace both the plain variable and the corresponding variant taking in the prefix and explode into account
        path = path.replace(`{${this.name}}`, value);
        path = path.replace(`{${prefix}${this.name}${this.options.explode ? '*' : ''}}`, value);
        return path;
    }
}
/**
 * A parameter in the query
 */
class QueryParameter extends Parameter {
    constructor(name, value, options) {
        super(name, value, options, 'form', true);
    }
    append(params) {
        if (this.value instanceof Array) {
            // Array serialization
            if (this.options.explode) {
                for (const v of this.value) {
                    params = params.append(this.name, this.serializeValue(v));
                }
            }
            else {
                const separator = this.options.style === 'spaceDelimited'
                    ? ' ' : this.options.style === 'pipeDelimited'
                    ? '|' : ',';
                return params.append(this.name, this.serializeValue(this.value, separator));
            }
        }
        else if (this.value !== null && typeof this.value === 'object') {
            // Object serialization
            if (this.options.style === 'deepObject') {
                // Append a parameter for each key, in the form `name[key]`
                for (const key of Object.keys(this.value)) {
                    const propVal = this.value[key];
                    if (propVal !== null && propVal !== undefined) {
                        params = params.append(`${this.name}[${key}]`, this.serializeValue(propVal));
                    }
                }
            }
            else if (this.options.explode) {
                // Append a parameter for each key without using the parameter name
                for (const key of Object.keys(this.value)) {
                    const propVal = this.value[key];
                    if (propVal !== null && propVal !== undefined) {
                        params = params.append(key, this.serializeValue(propVal));
                    }
                }
            }
            else {
                // Append a single parameter whose values are a comma-separated list of key,value,key,value...
                const array = [];
                for (const key of Object.keys(this.value)) {
                    const propVal = this.value[key];
                    if (propVal !== null && propVal !== undefined) {
                        array.push(key);
                        array.push(propVal);
                    }
                }
                params = params.append(this.name, this.serializeValue(array));
            }
        }
        else if (this.value !== null && this.value !== undefined) {
            // Plain value
            params = params.append(this.name, this.serializeValue(this.value));
        }
        return params;
    }
}
/**
 * A parameter in the HTTP request header
 */
class HeaderParameter extends Parameter {
    constructor(name, value, options) {
        super(name, value, options, 'simple', false);
    }
    append(headers) {
        if (this.value !== null && this.value !== undefined) {
            if (this.value instanceof Array) {
                for (const v of this.value) {
                    headers = headers.append(this.name, this.serializeValue(v));
                }
            }
            else {
                headers = headers.append(this.name, this.serializeValue(this.value));
            }
        }
        return headers;
    }
}
/**
 * Helper to build http requests from parameters
 */
class RequestBuilder {
    constructor(rootUrl, operationPath, method) {
        this.rootUrl = rootUrl;
        this.operationPath = operationPath;
        this.method = method;
        this._path = new Map();
        this._query = new Map();
        this._header = new Map();
    }
    /**
     * Sets a path parameter
     */
    path(name, value, options) {
        this._path.set(name, new PathParameter(name, value, options || {}));
    }
    /**
     * Sets a query parameter
     */
    query(name, value, options) {
        this._query.set(name, new QueryParameter(name, value, options || {}));
    }
    /**
     * Sets a header parameter
     */
    header(name, value, options) {
        this._header.set(name, new HeaderParameter(name, value, options || {}));
    }
    /**
     * Sets the body content, along with the content type
     */
    body(value, contentType = 'application/json') {
        if (value instanceof Blob) {
            this._bodyContentType = value.type;
        }
        else {
            this._bodyContentType = contentType;
        }
        if (this._bodyContentType === 'application/x-www-form-urlencoded' && value !== null && typeof value === 'object') {
            // Handle URL-encoded data
            const pairs = [];
            for (const key of Object.keys(value)) {
                let val = value[key];
                if (!(val instanceof Array)) {
                    val = [val];
                }
                for (const v of val) {
                    const formValue = this.formDataValue(v);
                    if (formValue !== null) {
                        pairs.push([key, formValue]);
                    }
                }
            }
            this._bodyContent = pairs.map(p => `${encodeURIComponent(p[0])}=${encodeURIComponent(p[1])}`).join('&');
        }
        else if (this._bodyContentType === 'multipart/form-data') {
            // Handle multipart form data
            const formData = new FormData();
            if (value !== null && value !== undefined) {
                for (const key of Object.keys(value)) {
                    const val = value[key];
                    if (val instanceof Array) {
                        for (const v of val) {
                            const toAppend = this.formDataValue(v);
                            if (toAppend !== null) {
                                formData.append(key, toAppend);
                            }
                        }
                    }
                    else {
                        const toAppend = this.formDataValue(val);
                        if (toAppend !== null) {
                            formData.set(key, toAppend);
                        }
                    }
                }
            }
            this._bodyContent = formData;
        }
        else {
            // The body is the plain content
            this._bodyContent = value;
        }
    }
    formDataValue(value) {
        if (value === null || value === undefined) {
            return null;
        }
        if (value instanceof Blob) {
            return value;
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }
    /**
     * Builds the request with the current set parameters
     */
    build(options) {
        options = options || {};
        // Path parameters
        let path = this.operationPath;
        for (const pathParam of this._path.values()) {
            path = pathParam.append(path);
        }
        const url = this.rootUrl + path;
        // Query parameters
        let httpParams = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpParams"]({
            encoder: ParameterCodecInstance
        });
        for (const queryParam of this._query.values()) {
            httpParams = queryParam.append(httpParams);
        }
        // Header parameters
        let httpHeaders = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpHeaders"]();
        if (options.accept) {
            httpHeaders = httpHeaders.append('Accept', options.accept);
        }
        for (const headerParam of this._header.values()) {
            httpHeaders = headerParam.append(httpHeaders);
        }
        // Request content headers
        if (this._bodyContentType && !(this._bodyContent instanceof FormData)) {
            httpHeaders = httpHeaders.set('Content-Type', this._bodyContentType);
        }
        // Perform the request
        return new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpRequest"](this.method.toUpperCase(), url, this._bodyContent, {
            params: httpParams,
            headers: httpHeaders,
            responseType: options.responseType,
            reportProgress: options.reportProgress
        });
    }
}


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Progetti\AspNet5WithAngular2\TestProject\AspNet5Angular2\AspNet5Angular2\WebApp\src\main.ts */"zUnb");


/***/ }),

/***/ "0bJW":
/*!**********************************************************!*\
  !*** ./src/app/login/login-page/login-page.component.ts ***!
  \**********************************************************/
/*! exports provided: LoginPageComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginPageComponent", function() { return LoginPageComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var src_app_api_services__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/api/services */ "Do6i");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _clr_angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @clr/angular */ "8MG2");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ "ofXK");







function LoginPageComponent_div_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, " Invalid user name or password ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
class LoginPageComponent {
    constructor(http, router, testService) {
        this.http = http;
        this.router = router;
        this.testService = testService;
        this.form = {
            email: '',
            password: '',
            rememberMe: false
        };
        this.invalidLogin = false;
    }
    ;
    ngOnInit() {
    }
    login() {
        this.testService.loginPost({ body: this.form }).subscribe(response => {
            var parsedResponse = JSON.parse(response);
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
LoginPageComponent.ɵfac = function LoginPageComponent_Factory(t) { return new (t || LoginPageComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_api_services__WEBPACK_IMPORTED_MODULE_3__["LoginService"])); };
LoginPageComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: LoginPageComponent, selectors: [["app-login-page"]], decls: 24, vars: 4, consts: [[1, "login-wrapper"], [1, "login", 3, "ngSubmit"], [1, "title"], [1, "welcome"], [1, "hint"], [1, "login-group"], [1, "clr-sr-only"], ["type", "text", "name", "email", "clrInput", "", "placeholder", "Email", 3, "ngModel", "ngModelChange"], ["type", "password", "name", "password", "clrPassword", "", "placeholder", "Password", 3, "ngModel", "ngModelChange"], ["type", "checkbox", "name", "rememberMe", "clrCheckbox", "", 3, "ngModel", "ngModelChange"], ["class", "error active", 4, "ngIf"], ["type", "submit", 1, "btn", "btn-primary"], [1, "error", "active"]], template: function LoginPageComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "form", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngSubmit", function LoginPageComponent_Template_form_ngSubmit_1_listener() { return ctx.login(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "section", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4, "Welcome to");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, " Ghigo Industry ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "h5", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7, "User email \"prova\" and password \"prova\" to login ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "clr-input-container");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "label", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](11, "Username");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "input", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngModelChange", function LoginPageComponent_Template_input_ngModelChange_12_listener($event) { return ctx.form.email = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "clr-password-container");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "label", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](15, "Password");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "input", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngModelChange", function LoginPageComponent_Template_input_ngModelChange_16_listener($event) { return ctx.form.password = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "clr-checkbox-wrapper");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](19, "Remember me");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](20, "input", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngModelChange", function LoginPageComponent_Template_input_ngModelChange_20_listener($event) { return ctx.form.rememberMe = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](21, LoginPageComponent_div_21_Template, 2, 0, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](22, "button", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](23, "Login");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngModel", ctx.form.email);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngModel", ctx.form.password);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngModel", ctx.form.rememberMe);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.invalidLogin);
    } }, directives: [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgForm"], _clr_angular__WEBPACK_IMPORTED_MODULE_5__["ClrInputContainer"], _clr_angular__WEBPACK_IMPORTED_MODULE_5__["ClrLabel"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["DefaultValueAccessor"], _clr_angular__WEBPACK_IMPORTED_MODULE_5__["ClrInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgModel"], _clr_angular__WEBPACK_IMPORTED_MODULE_5__["ClrPasswordContainer"], _clr_angular__WEBPACK_IMPORTED_MODULE_5__["ClrPassword"], _clr_angular__WEBPACK_IMPORTED_MODULE_5__["ClrCheckboxWrapper"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["CheckboxControlValueAccessor"], _clr_angular__WEBPACK_IMPORTED_MODULE_5__["ClrCheckbox"], _angular_common__WEBPACK_IMPORTED_MODULE_6__["NgIf"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsb2dpbi1wYWdlLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ "1SBL":
/*!**********************************************************!*\
  !*** ./src/app/api/services/weather-forecast.service.ts ***!
  \**********************************************************/
/*! exports provided: WeatherForecastService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WeatherForecastService", function() { return WeatherForecastService; });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _base_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../base-service */ "VVgf");
/* harmony import */ var _request_builder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../request-builder */ "+Q7D");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _api_configuration__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../api-configuration */ "Fy9I");







class WeatherForecastService extends _base_service__WEBPACK_IMPORTED_MODULE_1__["BaseService"] {
    constructor(config, http) {
        super(config, http);
    }
    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `weatherForecastGet$Plain()` instead.
     *
     * This method doesn't expect any request body.
     */
    weatherForecastGet$Plain$Response(params) {
        const rb = new _request_builder__WEBPACK_IMPORTED_MODULE_2__["RequestBuilder"](this.rootUrl, WeatherForecastService.WeatherForecastGetPath, 'get');
        if (params) {
        }
        return this.http.request(rb.build({
            responseType: 'text',
            accept: 'text/plain'
        })).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["filter"])((r) => r instanceof _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpResponse"]), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])((r) => {
            return r;
        }));
    }
    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `weatherForecastGet$Plain$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    weatherForecastGet$Plain(params) {
        return this.weatherForecastGet$Plain$Response(params).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])((r) => r.body));
    }
    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `weatherForecastGet$Json()` instead.
     *
     * This method doesn't expect any request body.
     */
    weatherForecastGet$Json$Response(params) {
        const rb = new _request_builder__WEBPACK_IMPORTED_MODULE_2__["RequestBuilder"](this.rootUrl, WeatherForecastService.WeatherForecastGetPath, 'get');
        if (params) {
        }
        return this.http.request(rb.build({
            responseType: 'json',
            accept: 'text/json'
        })).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["filter"])((r) => r instanceof _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpResponse"]), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])((r) => {
            return r;
        }));
    }
    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `weatherForecastGet$Json$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    weatherForecastGet$Json(params) {
        return this.weatherForecastGet$Json$Response(params).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])((r) => r.body));
    }
}
/**
 * Path part for operation weatherForecastGet
 */
WeatherForecastService.WeatherForecastGetPath = '/WeatherForecast';
WeatherForecastService.ɵfac = function WeatherForecastService_Factory(t) { return new (t || WeatherForecastService)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_api_configuration__WEBPACK_IMPORTED_MODULE_5__["ApiConfiguration"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpClient"])); };
WeatherForecastService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjectable"]({ token: WeatherForecastService, factory: WeatherForecastService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ "5KXc":
/*!***********************************!*\
  !*** ./src/app/api/api.module.ts ***!
  \***********************************/
/*! exports provided: ApiModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ApiModule", function() { return ApiModule; });
/* harmony import */ var _api_configuration__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./api-configuration */ "Fy9I");
/* harmony import */ var _services_login_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./services/login.service */ "xUJI");
/* harmony import */ var _services_weather_forecast_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./services/weather-forecast.service */ "1SBL");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ "tk/3");





/**
 * Module that provides all services and configuration.
 */
class ApiModule {
    constructor(parentModule, http) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
                'See also https://github.com/angular/angular/issues/20575');
        }
    }
    static forRoot(params) {
        return {
            ngModule: ApiModule,
            providers: [
                {
                    provide: _api_configuration__WEBPACK_IMPORTED_MODULE_0__["ApiConfiguration"],
                    useValue: params
                }
            ]
        };
    }
}
ApiModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({ type: ApiModule });
ApiModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjector"]({ factory: function ApiModule_Factory(t) { return new (t || ApiModule)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](ApiModule, 12), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"], 8)); }, providers: [
        _services_login_service__WEBPACK_IMPORTED_MODULE_1__["LoginService"],
        _services_weather_forecast_service__WEBPACK_IMPORTED_MODULE_2__["WeatherForecastService"],
        _api_configuration__WEBPACK_IMPORTED_MODULE_0__["ApiConfiguration"]
    ], imports: [[]] });


/***/ }),

/***/ "5qVs":
/*!****************************************************!*\
  !*** ./src/app/home-page/ghigo/ghigo.component.ts ***!
  \****************************************************/
/*! exports provided: GhigoComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GhigoComponent", function() { return GhigoComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var src_app_api_services__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/api/services */ "Do6i");



class GhigoComponent {
    constructor(http, testService) {
        this.http = http;
        this.testService = testService;
        this.displayData = "loading...";
    }
    ngOnInit() {
        this.testService.weatherForecastGet$Json().subscribe(response => {
            setTimeout(() => {
                this.displayData = [];
                response.map((x) => this.displayData.push(x.summary + x.temperatureC));
            }, 1000);
        }, errors => {
            console.log(errors);
        });
    }
}
GhigoComponent.ɵfac = function GhigoComponent_Factory(t) { return new (t || GhigoComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_api_services__WEBPACK_IMPORTED_MODULE_2__["WeatherForecastService"])); };
GhigoComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: GhigoComponent, selectors: [["app-ghigo"]], decls: 4, vars: 1, consts: [[2, "font-size", "32px", "font-weight", "700"]], template: function GhigoComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "ghigo works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"]("\n", ctx.displayData, "\n");
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJnaGlnby5jb21wb25lbnQuc2NzcyJ9 */"] });


/***/ }),

/***/ "AytR":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "Do6i":
/*!*********************************!*\
  !*** ./src/app/api/services.ts ***!
  \*********************************/
/*! exports provided: LoginService, WeatherForecastService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _services_login_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./services/login.service */ "xUJI");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LoginService", function() { return _services_login_service__WEBPACK_IMPORTED_MODULE_0__["LoginService"]; });

/* harmony import */ var _services_weather_forecast_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./services/weather-forecast.service */ "1SBL");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WeatherForecastService", function() { return _services_weather_forecast_service__WEBPACK_IMPORTED_MODULE_1__["WeatherForecastService"]; });





/***/ }),

/***/ "Fy9I":
/*!******************************************!*\
  !*** ./src/app/api/api-configuration.ts ***!
  \******************************************/
/*! exports provided: ApiConfiguration */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ApiConfiguration", function() { return ApiConfiguration; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

/**
 * Global configuration
 */
class ApiConfiguration {
    constructor() {
        this.rootUrl = '';
    }
}
ApiConfiguration.ɵfac = function ApiConfiguration_Factory(t) { return new (t || ApiConfiguration)(); };
ApiConfiguration.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: ApiConfiguration, factory: ApiConfiguration.ɵfac, providedIn: 'root' });


/***/ }),

/***/ "Sy1n":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _api_services__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./api/services */ "Do6i");
/* harmony import */ var _auth0_angular_jwt__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @auth0/angular-jwt */ "Nm8O");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "tyNb");





class AppComponent {
    constructor(http, testService, jwtHelper, router) {
        this.http = http;
        this.testService = testService;
        this.jwtHelper = jwtHelper;
        this.router = router;
        this.title = 'Angular2TestApp';
        this.logOut = () => {
            localStorage.removeItem("jwt");
        };
    }
    ngOnInit() {
    }
    isUserAuthenticated() {
        const token = localStorage.getItem("jwt");
        if (token && !this.jwtHelper.isTokenExpired(token)) {
            return true;
        }
        else {
            return false;
        }
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_api_services__WEBPACK_IMPORTED_MODULE_2__["WeatherForecastService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_auth0_angular_jwt__WEBPACK_IMPORTED_MODULE_3__["JwtHelperService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"])); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 1, vars: 0, template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "router-outlet");
    } }, directives: [_angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterOutlet"]], styles: ["#techedgers[_ngcontent-%COMP%] {\n  font-size: 100px;\n  padding: 40px;\n  font-weight: 700;\n  color: #2ebdb7;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcYXBwLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsZ0JBQUE7RUFDQSxhQUFBO0VBQ0EsZ0JBQUE7RUFDQSxjQUFBO0FBQ0YiLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiI3RlY2hlZGdlcnMge1xyXG4gIGZvbnQtc2l6ZTogMTAwcHg7XHJcbiAgcGFkZGluZzogNDBweDtcclxuICBmb250LXdlaWdodDogNzAwO1xyXG4gIGNvbG9yOiAjMmViZGI3O1xyXG59XHJcbiJdfQ== */"] });


/***/ }),

/***/ "VVgf":
/*!*************************************!*\
  !*** ./src/app/api/base-service.ts ***!
  \*************************************/
/*! exports provided: BaseService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BaseService", function() { return BaseService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _api_configuration__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./api-configuration */ "Fy9I");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "tk/3");



/**
 * Base class for services
 */
class BaseService {
    constructor(config, http) {
        this.config = config;
        this.http = http;
        this._rootUrl = '';
    }
    /**
     * Returns the root url for all operations in this service. If not set directly in this
     * service, will fallback to `ApiConfiguration.rootUrl`.
     */
    get rootUrl() {
        return this._rootUrl || this.config.rootUrl;
    }
    /**
     * Sets the root URL for API operations in this service.
     */
    set rootUrl(rootUrl) {
        this._rootUrl = rootUrl;
    }
}
BaseService.ɵfac = function BaseService_Factory(t) { return new (t || BaseService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_api_configuration__WEBPACK_IMPORTED_MODULE_1__["ApiConfiguration"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"])); };
BaseService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: BaseService, factory: BaseService.ɵfac });


/***/ }),

/***/ "ZAI4":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: tokenGetter, AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tokenGetter", function() { return tokenGetter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app-routing.module */ "vY5A");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.component */ "Sy1n");
/* harmony import */ var _clr_angular__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @clr/angular */ "8MG2");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/platform-browser/animations */ "R1ws");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _api_api_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./api/api.module */ "5KXc");
/* harmony import */ var _auth0_angular_jwt__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @auth0/angular-jwt */ "Nm8O");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _login_login_page_login_page_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./login/login-page/login-page.component */ "0bJW");
/* harmony import */ var _AuthGard__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./AuthGard */ "lIrG");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _home_page_main_container_main_container_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./home-page/main-container/main-container.component */ "d8lQ");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _interceptor_http_interceptor_token__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./interceptor/http-interceptor-token */ "fT9+");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @ionic/angular */ "TEn/");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/core */ "fXoL");





















function tokenGetter() {
    return localStorage.getItem("jwt");
}
class AppModule {
}
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵdefineInjector"]({ factory: function AppModule_Factory(t) { return new (t || AppModule)(); }, providers: [
        { provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HTTP_INTERCEPTORS"], useClass: _interceptor_http_interceptor_token__WEBPACK_IMPORTED_MODULE_14__["httpInterceptor"], multi: true },
        _AuthGard__WEBPACK_IMPORTED_MODULE_10__["AuthGuard"]
    ], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_1__["AppRoutingModule"],
            _clr_angular__WEBPACK_IMPORTED_MODULE_3__["ClarityModule"],
            _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_4__["BrowserAnimationsModule"],
            _angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClientModule"],
            _angular_forms__WEBPACK_IMPORTED_MODULE_11__["FormsModule"],
            _angular_common__WEBPACK_IMPORTED_MODULE_13__["CommonModule"],
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _api_api_module__WEBPACK_IMPORTED_MODULE_6__["ApiModule"].forRoot({ rootUrl: 'http://localhost:5000' }),
            _angular_router__WEBPACK_IMPORTED_MODULE_8__["RouterModule"].forRoot([
                { path: '', component: _app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"], canActivate: [_AuthGard__WEBPACK_IMPORTED_MODULE_10__["AuthGuard"]] },
                { path: 'login', component: _login_login_page_login_page_component__WEBPACK_IMPORTED_MODULE_9__["LoginPageComponent"] },
            ]),
            _auth0_angular_jwt__WEBPACK_IMPORTED_MODULE_7__["JwtModule"].forRoot({
                config: {
                    tokenGetter: tokenGetter,
                    allowedDomains: ["localhost:5000"],
                    disallowedRoutes: []
                }
            }),
            _ionic_angular__WEBPACK_IMPORTED_MODULE_15__["IonicModule"].forRoot()
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"],
        _home_page_main_container_main_container_component__WEBPACK_IMPORTED_MODULE_12__["MainContainerComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_1__["AppRoutingModule"],
        _clr_angular__WEBPACK_IMPORTED_MODULE_3__["ClarityModule"],
        _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_4__["BrowserAnimationsModule"],
        _angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClientModule"],
        _angular_forms__WEBPACK_IMPORTED_MODULE_11__["FormsModule"],
        _angular_common__WEBPACK_IMPORTED_MODULE_13__["CommonModule"],
        _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"], _api_api_module__WEBPACK_IMPORTED_MODULE_6__["ApiModule"], _angular_router__WEBPACK_IMPORTED_MODULE_8__["RouterModule"], _auth0_angular_jwt__WEBPACK_IMPORTED_MODULE_7__["JwtModule"], _ionic_angular__WEBPACK_IMPORTED_MODULE_15__["IonicModule"]] }); })();


/***/ }),

/***/ "d8lQ":
/*!**********************************************************************!*\
  !*** ./src/app/home-page/main-container/main-container.component.ts ***!
  \**********************************************************************/
/*! exports provided: MainContainerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MainContainerComponent", function() { return MainContainerComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _clr_angular__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @clr/angular */ "8MG2");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ionic/angular */ "TEn/");




class MainContainerComponent {
    constructor() {
        this.collapsed = false;
    }
    ngOnInit() {
    }
}
MainContainerComponent.ɵfac = function MainContainerComponent_Factory(t) { return new (t || MainContainerComponent)(); };
MainContainerComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: MainContainerComponent, selectors: [["app-main-container"]], decls: 20, vars: 2, consts: [[1, "main-container"], [1, "header", "header-6"], [1, "branding"], ["href", "javascript://", 1, "nav-link"], ["shape", "vm-bug"], [1, "title"], [1, "header-actions"], ["href", "javascript://", "aria-label", "settings", 1, "nav-link", "nav-icon"], ["shape", "cog"], [1, "content-container"], [1, "content-area"], [3, "clrVerticalNavCollapsible", "clrVerticalNavCollapsed", "clrVerticalNavCollapsedChange"], ["clrVerticalNavLink", "", "routerLink", "./ghigo", "routerLinkActive", "active"], ["clrVerticalNavIcon", "", "shape", "user"], ["clrVerticalNavLink", "", "routerLink", "./simo", "routerLinkActive", "active"], ["clrVerticalNavIcon", "", "shape", "bolt"]], template: function MainContainerComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "header", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "a", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](4, "clr-icon", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "span", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6, "Project Clarity");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "a", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](9, "clr-icon", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](12, "router-outlet");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "clr-vertical-nav", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("clrVerticalNavCollapsedChange", function MainContainerComponent_Template_clr_vertical_nav_clrVerticalNavCollapsedChange_13_listener($event) { return ctx.collapsed = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "a", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](15, "clr-icon", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](16, " Ghigo ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "a", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](18, "clr-icon", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](19, " Simo ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("clrVerticalNavCollapsible", true)("clrVerticalNavCollapsed", ctx.collapsed);
    } }, directives: [_clr_angular__WEBPACK_IMPORTED_MODULE_1__["ClrIconCustomTag"], _angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterOutlet"], _clr_angular__WEBPACK_IMPORTED_MODULE_1__["ClrVerticalNav"], _angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterLinkWithHref"], _clr_angular__WEBPACK_IMPORTED_MODULE_1__["ClrVerticalNavLink"], _ionic_angular__WEBPACK_IMPORTED_MODULE_3__["RouterLinkDelegate"], _angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterLinkActive"], _clr_angular__WEBPACK_IMPORTED_MODULE_1__["ClrVerticalNavIcon"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJtYWluLWNvbnRhaW5lci5jb21wb25lbnQuc2NzcyJ9 */"] });


/***/ }),

/***/ "fT9+":
/*!*******************************************************!*\
  !*** ./src/app/interceptor/http-interceptor-token.ts ***!
  \*******************************************************/
/*! exports provided: httpInterceptor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "httpInterceptor", function() { return httpInterceptor; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

class httpInterceptor {
    intercept(request, newRequest) {
        //Get Token data from local storage
        var token = localStorage.getItem("jwt");
        console.log("Current token request: ", token);
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
httpInterceptor.ɵfac = function httpInterceptor_Factory(t) { return new (t || httpInterceptor)(); };
httpInterceptor.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: httpInterceptor, factory: httpInterceptor.ɵfac });


/***/ }),

/***/ "hQMU":
/*!**************************************************!*\
  !*** ./src/app/home-page/simo/simo.component.ts ***!
  \**************************************************/
/*! exports provided: SimoComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SimoComponent", function() { return SimoComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

class SimoComponent {
    constructor() { }
    ngOnInit() {
    }
}
SimoComponent.ɵfac = function SimoComponent_Factory(t) { return new (t || SimoComponent)(); };
SimoComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SimoComponent, selectors: [["app-simo"]], decls: 2, vars: 0, template: function SimoComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "simo works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzaW1vLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ "kLfG":
/*!*****************************************************************************************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm lazy ^\.\/.*\.entry\.js$ include: \.entry\.js$ exclude: \.system\.entry\.js$ namespace object ***!
  \*****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./ion-action-sheet.entry.js": [
		"dUtr",
		"common",
		0
	],
	"./ion-alert.entry.js": [
		"Q8AI",
		"common",
		1
	],
	"./ion-app_8.entry.js": [
		"hgI1",
		"common",
		2
	],
	"./ion-avatar_3.entry.js": [
		"CfoV",
		"common",
		3
	],
	"./ion-back-button.entry.js": [
		"Nt02",
		"common",
		4
	],
	"./ion-backdrop.entry.js": [
		"Q2Bp",
		5
	],
	"./ion-button_2.entry.js": [
		"0Pbj",
		"common",
		6
	],
	"./ion-card_5.entry.js": [
		"ydQj",
		"common",
		7
	],
	"./ion-checkbox.entry.js": [
		"4fMi",
		"common",
		8
	],
	"./ion-chip.entry.js": [
		"czK9",
		"common",
		9
	],
	"./ion-col_3.entry.js": [
		"/CAe",
		10
	],
	"./ion-datetime_3.entry.js": [
		"WgF3",
		"common",
		11
	],
	"./ion-fab_3.entry.js": [
		"uQcF",
		"common",
		12
	],
	"./ion-img.entry.js": [
		"wHD8",
		13
	],
	"./ion-infinite-scroll_2.entry.js": [
		"2lz6",
		14
	],
	"./ion-input.entry.js": [
		"ercB",
		"common",
		15
	],
	"./ion-item-option_3.entry.js": [
		"MGMP",
		"common",
		16
	],
	"./ion-item_8.entry.js": [
		"9bur",
		"common",
		17
	],
	"./ion-loading.entry.js": [
		"cABk",
		"common",
		18
	],
	"./ion-menu_3.entry.js": [
		"kyFE",
		"common",
		19
	],
	"./ion-modal.entry.js": [
		"TvZU",
		"common",
		20
	],
	"./ion-nav_2.entry.js": [
		"vnES",
		"common",
		21
	],
	"./ion-popover.entry.js": [
		"qCuA",
		"common",
		22
	],
	"./ion-progress-bar.entry.js": [
		"0tOe",
		"common",
		23
	],
	"./ion-radio_2.entry.js": [
		"h11V",
		"common",
		24
	],
	"./ion-range.entry.js": [
		"XGij",
		"common",
		25
	],
	"./ion-refresher_2.entry.js": [
		"nYbb",
		"common",
		26
	],
	"./ion-reorder_2.entry.js": [
		"smMY",
		"common",
		27
	],
	"./ion-ripple-effect.entry.js": [
		"STjf",
		28
	],
	"./ion-route_4.entry.js": [
		"k5eQ",
		"common",
		29
	],
	"./ion-searchbar.entry.js": [
		"OR5t",
		"common",
		30
	],
	"./ion-segment_2.entry.js": [
		"fSgp",
		"common",
		31
	],
	"./ion-select_3.entry.js": [
		"lfGF",
		"common",
		32
	],
	"./ion-slide_2.entry.js": [
		"5xYT",
		33
	],
	"./ion-spinner.entry.js": [
		"nI0H",
		"common",
		34
	],
	"./ion-split-pane.entry.js": [
		"NAQR",
		35
	],
	"./ion-tab-bar_2.entry.js": [
		"knkW",
		"common",
		36
	],
	"./ion-tab_2.entry.js": [
		"TpdJ",
		"common",
		37
	],
	"./ion-text.entry.js": [
		"ISmu",
		"common",
		38
	],
	"./ion-textarea.entry.js": [
		"U7LX",
		"common",
		39
	],
	"./ion-toast.entry.js": [
		"L3sA",
		"common",
		40
	],
	"./ion-toggle.entry.js": [
		"IUOf",
		"common",
		41
	],
	"./ion-virtual-scroll.entry.js": [
		"8Mb5",
		42
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(function() {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function() {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = "kLfG";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "lIrG":
/*!*****************************!*\
  !*** ./src/app/AuthGard.ts ***!
  \*****************************/
/*! exports provided: AuthGuard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthGuard", function() { return AuthGuard; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _auth0_angular_jwt__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth0/angular-jwt */ "Nm8O");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");



class AuthGuard {
    constructor(jwtHelper, router) {
        this.jwtHelper = jwtHelper;
        this.router = router;
    }
    canActivate() {
        console.log("can Activate");
        const token = localStorage.getItem("jwt");
        if (token && !this.jwtHelper.isTokenExpired(token)) {
            return true;
        }
        console.log("redirect to login");
        this.router.navigate(["login"]);
        return false;
    }
}
AuthGuard.ɵfac = function AuthGuard_Factory(t) { return new (t || AuthGuard)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_auth0_angular_jwt__WEBPACK_IMPORTED_MODULE_1__["JwtHelperService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"])); };
AuthGuard.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: AuthGuard, factory: AuthGuard.ɵfac });


/***/ }),

/***/ "vY5A":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _AuthGard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AuthGard */ "lIrG");
/* harmony import */ var _home_page_ghigo_ghigo_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./home-page/ghigo/ghigo.component */ "5qVs");
/* harmony import */ var _home_page_main_container_main_container_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./home-page/main-container/main-container.component */ "d8lQ");
/* harmony import */ var _home_page_simo_simo_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./home-page/simo/simo.component */ "hQMU");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");







const routes = [
    {
        path: 'login',
        loadChildren: () => __webpack_require__.e(/*! import() | login-login-module */ "login-login-module").then(__webpack_require__.bind(null, /*! ./login/login.module */ "X3zk")).then(m => m.LoginModule),
    },
    { path: '', component: _home_page_main_container_main_container_component__WEBPACK_IMPORTED_MODULE_3__["MainContainerComponent"], canActivate: [_AuthGard__WEBPACK_IMPORTED_MODULE_1__["AuthGuard"]],
        children: [
            { path: 'ghigo', component: _home_page_ghigo_ghigo_component__WEBPACK_IMPORTED_MODULE_2__["GhigoComponent"] },
            { path: 'simo', component: _home_page_simo_simo_component__WEBPACK_IMPORTED_MODULE_4__["SimoComponent"] },
        ] }
];
class AppRoutingModule {
}
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjector"]({ factory: function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"].forRoot(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] }); })();


/***/ }),

/***/ "xUJI":
/*!***********************************************!*\
  !*** ./src/app/api/services/login.service.ts ***!
  \***********************************************/
/*! exports provided: LoginService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginService", function() { return LoginService; });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _base_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../base-service */ "VVgf");
/* harmony import */ var _request_builder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../request-builder */ "+Q7D");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _api_configuration__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../api-configuration */ "Fy9I");







class LoginService extends _base_service__WEBPACK_IMPORTED_MODULE_1__["BaseService"] {
    constructor(config, http) {
        super(config, http);
    }
    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `loginPost()` instead.
     *
     * This method sends `application/*+json` and handles request body of type `application/*+json`.
     */
    loginPost$Response(params) {
        const rb = new _request_builder__WEBPACK_IMPORTED_MODULE_2__["RequestBuilder"](this.rootUrl, LoginService.LoginPostPath, 'post');
        if (params) {
            rb.body(params.body, 'application/*+json');
        }
        return this.http.request(rb.build({
            responseType: 'text',
            accept: '*/*'
        })).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["filter"])((r) => r instanceof _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpResponse"]), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])((r) => {
            return r.clone({ body: undefined });
        }));
    }
    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `loginPost$Response()` instead.
     *
     * This method sends `application/*+json` and handles request body of type `application/*+json`.
     */
    loginPost(params) {
        return this.loginPost$Response(params).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])((r) => r.body));
    }
}
/**
 * Path part for operation loginPost
 */
LoginService.LoginPostPath = '/Login';
LoginService.ɵfac = function LoginService_Factory(t) { return new (t || LoginService)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_api_configuration__WEBPACK_IMPORTED_MODULE_5__["ApiConfiguration"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpClient"])); };
LoginService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjectable"]({ token: LoginService, factory: LoginService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ "zUnb":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "ZAI4");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "AytR");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ "zn8P":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "zn8P";

/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map