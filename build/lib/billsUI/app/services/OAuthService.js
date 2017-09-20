/**
 * Created by seshu on 30-08-2016.
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
var QountServices_1 = require("qCommon/app/services/QountServices");
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var Session_1 = require("qCommon/app/services/Session");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var payments_constants_1 = require("../constants/payments.constants");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var OAuthService = (function (_super) {
    __extends(OAuthService, _super);
    function OAuthService(http) {
        return _super.call(this, http) || this;
    }
    OAuthService.prototype.submitCode = function (code, company) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.DWOLLA_CODE_SUBMISSION_SERVICE, null, { id: Session_1.Session.getUser().id, company: company });
        return this.create(url, code, Qount_constants_1.SOURCE_TYPE.DWOLLA)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    OAuthService.prototype.fundingSources = function (company) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.DWOLLA_FUNDING_SOURCES_SERVICE, null, { id: Session_1.Session.getUser().id, company: company });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.DWOLLA)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    OAuthService.prototype.fundTransfer = function (transferObj, company) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.DWOLLA_TRANSFER_FUND_SERVICE, null, { id: Session_1.Session.getUser().id, company: company });
        return this.create(url, transferObj, Qount_constants_1.SOURCE_TYPE.DWOLLA)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    OAuthService.prototype.multiPay = function (transferObj, company) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.MULTI_PAYMENT_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: company });
        return this.update(url, transferObj, Qount_constants_1.SOURCE_TYPE.DWOLLA)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    OAuthService.prototype.futureFundTransfer = function (transferObj, company) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.DWOLLA_TRANSFER_FUND_SERVICE, null, { id: Session_1.Session.getUser().id, company: company });
        return this.create(url, transferObj, Qount_constants_1.SOURCE_TYPE.DWOLLA)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    OAuthService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    return OAuthService;
}(QountServices_1.QountServices));
OAuthService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], OAuthService);
exports.OAuthService = OAuthService;
