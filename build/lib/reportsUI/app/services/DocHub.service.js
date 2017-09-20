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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by seshu on 08-08-2016.
 */
var http_1 = require("@angular/http");
var core_1 = require("@angular/core");
var QountServices_1 = require("qCommon/app/services/QountServices");
var Rx_1 = require("rxjs/Rx");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Session_1 = require("qCommon/app/services/Session");
var payments_constants_1 = require("../constants/payments.constants");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var DocHubService = (function (_super) {
    __extends(DocHubService, _super);
    function DocHubService(http) {
        var _this = _super.call(this, http) || this;
        _this.downLoadAnchor = document.createElement("a");
        document.body.appendChild(_this.downLoadAnchor);
        _this.downLoadAnchor.style = "display: none";
        return _this;
    }
    DocHubService.prototype.getLink = function (docHubModel) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.DOCHUB_SERVICE, null, { id: Session_1.Session.getUser().id });
        var queryParams = "?accessLinkFlag=" + docHubModel.accessLinkFlag;
        queryParams += "&bucketName=" + docHubModel.bucketName;
        queryParams += "&keyName=" + docHubModel.keyName;
        queryParams += "&token=" + docHubModel.token;
        return this.query(url + queryParams, Qount_constants_1.SOURCE_TYPE.DOCHUB)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DocHubService.prototype.getStream = function (docHubModel) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.DOCHUB_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.create(url, docHubModel, Qount_constants_1.SOURCE_TYPE.DOCHUB)
            .catch(this.handleError);
    };
    DocHubService.prototype.getStreamLink = function (docHubModel) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.DOCHUB_SERVICE, null, { id: Session_1.Session.getUser().id });
        var queryParams = "?download=true";
        queryParams += "&bucketName=" + docHubModel.bucketName;
        queryParams += "&keyName=" + docHubModel.keyName;
        queryParams += "&token=" + docHubModel.token;
        return payments_constants_1.PAYMENTSPATHS.DOCHUB_SERVICE_URL + url + queryParams;
    };
    DocHubService.prototype.downloadFile = function (data, fileName) {
        //let json = JSON.stringify(data);
        var byteArray = new Uint8Array(data['_body']);
        var blob = new Blob([byteArray], { type: data.headers.get('Content-Type') });
        //let url:string = window.URL.createObjectURL(blob);
        //let uriContent = "data:application/octet-stream," + encodeURIComponent(url);
        //window.location.href = uriContent
        //this.downLoadAnchor.href = encodeURIComponent(url);
        /* this.downLoadAnchor.href = url;
         this.downLoadAnchor.download = fileName;
         this.downLoadAnchor.click();
         window.URL.revokeObjectURL(url);*/
        saveAs(blob, fileName);
    };
    DocHubService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    return DocHubService;
}(QountServices_1.QountServices));
DocHubService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], DocHubService);
exports.DocHubService = DocHubService;
