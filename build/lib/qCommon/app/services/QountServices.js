/**
 * Created by seshu on 07-03-2016.
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Qount_constants_1 = require("../constants/Qount.constants");
var http_1 = require("@angular/http");
var InterPolateUrl_service_1 = require("./InterPolateUrl.service");
var Session_1 = require("./Session");
var QountServices = (function (_super) {
    __extends(QountServices, _super);
    function QountServices(http) {
        var _this = _super.call(this) || this;
        _this.http = http;
        _this.headers = new http_1.Headers();
        _this.headers.append('Content-Type', 'application/json');
        return _this;
    }
    QountServices.prototype.getUrl = function (servicePath, sourceType) {
        var url = "";
        switch (sourceType) {
            case Qount_constants_1.SOURCE_TYPE.NODE:
                {
                    url = Qount_constants_1.PATH.NODE_SERVICE_URL + servicePath;
                }
                break;
            case Qount_constants_1.SOURCE_TYPE.JAVA:
                {
                    url = Qount_constants_1.PATH.JAVA_SERVICE_URL + servicePath;
                }
                break;
            case Qount_constants_1.SOURCE_TYPE.BIG_PAY:
                {
                    url = Qount_constants_1.PATH.BIGPAY_SERVICE_URL + servicePath;
                }
                break;
            case Qount_constants_1.SOURCE_TYPE.WORKFLOW:
                {
                    url = Qount_constants_1.PATH.WORKFLOW_SERVICE_URL + servicePath;
                }
                break;
            case Qount_constants_1.SOURCE_TYPE.DOCHUB:
                {
                    url = Qount_constants_1.PATH.DOCHUB_SERVICE_URL + servicePath;
                }
                break;
            case Qount_constants_1.SOURCE_TYPE.DWOLLA:
                {
                    url = Qount_constants_1.PATH.DWOLLA_SERVICE_URL + servicePath;
                }
                break;
            case Qount_constants_1.SOURCE_TYPE.DOCUMENT:
                {
                    url = Qount_constants_1.PATH.DOCUMENT_SERVICE_URL + servicePath;
                }
                break;
            case Qount_constants_1.SOURCE_TYPE.LOCALHOST:
                {
                    url = Qount_constants_1.PATH.LOCALHOST_SERVICE_URL + servicePath;
                }
                break;
        }
        return url;
    };
    QountServices.prototype.create = function (servicePath, model, sourceType, options) {
        this.setHeaders();
        var url = this.getUrl(servicePath, sourceType);
        var options = options ? options : this.defaultOptionsArgs;
        return this.http.post(url, JSON.stringify(model), options);
    };
    QountServices.prototype.update = function (servicePath, model, sourceType, options) {
        this.setHeaders();
        var url = this.getUrl(servicePath, sourceType);
        var options = options ? options : this.defaultOptionsArgs;
        return this.http.put(url, JSON.stringify(model), options);
    };
    QountServices.prototype.updateWithoutJson = function (servicePath, sourceType, options) {
        this.setHeaders();
        var url = this.getUrl(servicePath, sourceType);
        var options = options ? options : this.defaultOptionsArgs;
        return this.http.put(url, null, options);
    };
    QountServices.prototype.delete = function (servicePath, sourceType, options) {
        this.setHeaders();
        var url = this.getUrl(servicePath, sourceType);
        var options = options ? options : this.defaultOptionsArgs;
        return this.http.delete(url, options);
    };
    QountServices.prototype.query = function (servicePath, sourceType, options) {
        this.setHeaders();
        var url = this.getUrl(servicePath, sourceType);
        var options = options ? options : this.defaultOptionsArgs;
        return this.http.get(url, options);
    };
    QountServices.prototype.createEmail = function (servicePath, model, sourceType, options) {
        this.setHeaders();
        var url = this.getUrl(servicePath, sourceType);
        var options = options ? options : this.defaultOptionsArgs;
        return this.http.post(url, (model), options);
    };
    QountServices.prototype.createExcel = function (servicePath, model, sourceType, options) {
        this.setHeaders();
        var url = this.getUrl(servicePath, sourceType);
        var options = options ? options : this.defaultOptionsArgs;
        return this.http.post(url, (model), options);
    };
    QountServices.prototype.createWithHeader = function (url, model, token) {
        this.headers.delete("Authorization");
        if (token) {
            this.headers.append('Authorization', 'Basic ' + btoa(token));
        }
        this.defaultOptionsArgs = {
            'headers': this.headers
        };
        return this.http.post(url, (model), this.defaultOptionsArgs);
    };
    QountServices.prototype.setHeaders = function () {
        this.headers.delete("Authorization");
        if (Session_1.Session.getToken() && Session_1.Session.getToken() != 'undefined') {
            this.headers.append('Authorization', 'Bearer ' + Session_1.Session.getToken());
        }
        this.defaultOptionsArgs = {
            'headers': this.headers
        };
    };
    return QountServices;
}(InterPolateUrl_service_1.InterPolateUrlService));
exports.QountServices = QountServices;
