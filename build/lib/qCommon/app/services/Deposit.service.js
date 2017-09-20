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
 * Created by Chandu on 06-02-2017.
 */
var core_1 = require("@angular/core");
var QountServices_1 = require("./QountServices");
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var Qount_constants_1 = require("../constants/Qount.constants");
var Session_1 = require("./Session");
var DepositService = (function (_super) {
    __extends(DepositService, _super);
    function DepositService(http) {
        return _super.call(this, http) || this;
    }
    DepositService.prototype.deposits = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DEPOSITS_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DepositService.prototype.deposit = function (depositId, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DEPOSITS_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.query(url + '/' + depositId, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DepositService.prototype.addDeposit = function (deposit, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DEPOSITS_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.create(url, deposit, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DepositService.prototype.updateDeposit = function (deposit, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DEPOSITS_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.update(url + '/' + deposit.id, deposit, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DepositService.prototype.removeDeposit = function (id, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DEPOSITS_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.delete(url + '/' + id, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DepositService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    return DepositService;
}(QountServices_1.QountServices));
DepositService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], DepositService);
exports.DepositService = DepositService;
