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
 * Created by seshu on 18-07-2016.
 */
var core_1 = require("@angular/core");
var QountServices_1 = require("./QountServices");
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var Qount_constants_1 = require("../constants/Qount.constants");
var Session_1 = require("./Session");
var ChartOfAccountsService = (function (_super) {
    __extends(ChartOfAccountsService, _super);
    function ChartOfAccountsService(http) {
        return _super.call(this, http) || this;
    }
    ChartOfAccountsService.prototype.mappings = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.COA_MAPPINGS, null, null);
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ChartOfAccountsService.prototype.chartOfAccounts = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.CHART_OF_ACCOUNTS, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ChartOfAccountsService.prototype.filterdChartOfAccounts = function (companyId, queryStr) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.CHART_OF_ACCOUNTS, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.query(url + queryStr, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ChartOfAccountsService.prototype.addChartOfAccount = function (chartOfAccount, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.CHART_OF_ACCOUNTS, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.create(url, chartOfAccount, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ChartOfAccountsService.prototype.updateCOA = function (id, chartOfAccount, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.CHART_OF_ACCOUNT, null, { id: Session_1.Session.getUser().id, companyId: companyId, coaID: id });
        return this.update(url, chartOfAccount, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ChartOfAccountsService.prototype.removeCOA = function (id, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.CHART_OF_ACCOUNT, null, { id: Session_1.Session.getUser().id, companyId: companyId, coaID: id });
        return this.delete(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ChartOfAccountsService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.json());
    };
    return ChartOfAccountsService;
}(QountServices_1.QountServices));
ChartOfAccountsService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], ChartOfAccountsService);
exports.ChartOfAccountsService = ChartOfAccountsService;
