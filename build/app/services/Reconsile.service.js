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
 * Created by venkatkollikonda on 27/03/17.
 */
var core_1 = require("@angular/core");
var QountServices_1 = require("qCommon/app/services/QountServices");
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Session_1 = require("qCommon/app/services/Session");
var ReconcileService = (function (_super) {
    __extends(ReconcileService, _super);
    function ReconcileService(http) {
        return _super.call(this, http) || this;
    }
    ReconcileService.prototype.getReconcileData = function (data) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.RECONCILE_GET_RECON, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReconcileService.prototype.createReconcile = function (data, bankId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.RECONCILE_CREATE_RECON, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany(), bankId: bankId });
        return this.update(url, data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReconcileService.prototype.getStartingBalance = function (bankId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.RECONCILE_RECON_STARTING_BALANCE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany(), bankId: bankId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReconcileService.prototype.updateStartingBalance = function (data, bankId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.RECONCILE_RECON_DATE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany(), bankId: bankId });
        return this.update(url, data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReconcileService.prototype.getUnreconciledCount = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.RECONCILE_RECON_COUNT, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReconcileService.prototype.getReconActivityRecords = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.RECONCILE_RECON_ACTIVITY, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReconcileService.prototype.getUnreconciledRecords = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.RECONCILE_UNRECON_DATA, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReconcileService.prototype.getReconDetails = function (data) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.RECONCILE_RECON_DETAILS, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany(), bankId: data.bank_Account_id, reconActivityID: data.id });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ReconcileService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    return ReconcileService;
}(QountServices_1.QountServices));
ReconcileService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], ReconcileService);
exports.ReconcileService = ReconcileService;
