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
 * Created by Bighalf-PC on 9/25/2016.
 */
var core_1 = require("@angular/core");
var QountServices_1 = require("qCommon/app/services/QountServices");
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Session_1 = require("qCommon/app/services/Session");
var payments_constants_1 = require("../constants/payments.constants");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var ReportService = (function (_super) {
    __extends(ReportService, _super);
    function ReportService(http) {
        return _super.call(this, http) || this;
    }
    ReportService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    ReportService.prototype.generateReport = function (data) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.REPORT_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: data.companyID });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReportService.prototype.generateAccountReport = function (data, companyId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.ACCOUNTANT_REPORT_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReportService.prototype.generateMetricReport = function (data, companyId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.ACCOUNTANT_METRIC_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReportService.prototype.saveCustomizationObj = function (data) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.REPORTS_SERVICE, null, { userID: Session_1.Session.getUser().id, companyID: data.companyID, reportType: data.reportType });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReportService.prototype.exportReportIntoFile = function (url, data) {
        var headers = new http_1.Headers();
        headers.append("Content-Type", "application/json;charset=UTF-8");
        headers.append('Authorization', 'Bearer ' + Session_1.Session.getToken());
        var options = {
            responseType: http_1.ResponseContentType.ArrayBuffer,
            headers: headers
        };
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.JAVA, options).map(function (res) { return res; })
            .catch(this.handleError);
    };
    ReportService.prototype.getCustomizationObj = function (appName, company, reportType) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.REPORTS_SERVICE, null, { userID: Session_1.Session.getUser().id, companyID: company, reportType: reportType });
        var headers = new http_1.Headers();
        headers.append('app', appName);
        var appNameHeader = {
            'headers': headers
        };
        return this.query(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY, appNameHeader).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReportService.prototype.getBillDetails = function (data, companyID) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CREATE_BILL_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyID });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReportService.prototype.drillDownReport = function (companyId, data) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.REPORT_FILTER_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId, reportType: data.reportType });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    return ReportService;
}(QountServices_1.QountServices));
ReportService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], ReportService);
exports.ReportService = ReportService;
