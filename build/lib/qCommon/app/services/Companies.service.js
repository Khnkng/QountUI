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
var CompaniesService = (function (_super) {
    __extends(CompaniesService, _super);
    function CompaniesService(http) {
        return _super.call(this, http) || this;
    }
    CompaniesService.prototype.companies = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.COMPANIES_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.removeVendor = function (vendorName, id) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.VENDORS_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.delete(url + "/" + id + "/vendors/" + vendorName, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.updateAccount = function (data, companyId, currentverificationId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.VERIFY_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.update(url + "/" + companyId + "/accounts" + "/" + currentverificationId + "/verify", data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.addLock = function (vendor, id, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.LOCK_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.create(url + "/" + id + "/companylockdate", vendor, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getLockofCompany = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.GetLOCK_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/companylockdate", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.updateLock = function (lock, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.LOCKUPDATE_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.update(url + "/" + lock.id, lock, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getcurrentLock = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.LOCKCURRENT_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/minLockDate", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getpaymentcount = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.PAYMENTCOUNT_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/paymentdashboard/count", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getPaymentsInTransit = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.PAYMENTSTRANSIT_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getpaymenttable = function (companyId, currentpayment) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.PAYMENTTABLE_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/paymentdashboard/details?filter=" + currentpayment, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getpaidcounttable = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.PAIDTABLE_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/bills?filter=Paid&billperiod=last_30_days", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getpaidTransits = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.PAIDTRANSITS_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getbookcount = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.BANKCOUNT_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/accounts/totalcurrentbalance", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getlastpaidcount = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.PAIDCOUNT_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/bills/totalpaidamount?billperiod=last_30_days", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.credits = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.CREDITS_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getcurrentpaymenttable = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.PAYMENTCURRENTTABLE_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/paymentdashboard/details", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.vendors = function (companyName) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.VENDORS_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyName + "/vendors", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.getTaxofCompany = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.GetTaxes_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyId + "/taxes", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.addVendor = function (vendor, id) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.VENDORS_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.create(url + "/" + id + "/vendors", vendor, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.addTax = function (vendor, id, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.TAXES_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.create(url + "/" + id + "/taxes", vendor, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.updateTax = function (vendor, id, companyId, rowId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.TAXES_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.update(url + "/" + id + "/taxes/" + vendor.id, vendor, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.updateVendor = function (vendor, id) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.VENDORS_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.update(url + "/" + id + "/vendors/" + vendor.id, vendor, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.removeCompany = function (companyID) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.COMPANIES_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.delete(url + "/" + companyID, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.company = function (companyName) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.COMPANIES_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + companyName, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.add = function (company) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.COMPANIES_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.create(url, company, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.updateCompany = function (company) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.COMPANIES_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.update(url + "/" + company.id, company, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.vendor = function (id, vendorId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.VENDORS_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + id + "/vendors/" + vendorId, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.tax = function (id, vendorId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.TAXES_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + id + "/taxes/" + vendorId, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.lock = function (id, vendorId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.LOCKROW_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url + "/" + id + "/companylockdate/" + vendorId, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.removeTax = function (id, vendorId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.TAXES_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.delete(url + "/" + vendorId + "/taxes/" + id, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.removeLock = function (id, vendorId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.LOCKDELETE_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.delete(url + "/" + vendorId + "/companylockdate/" + id, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.allVendors = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.VENDOR_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.payments = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.COMPANIES_PAYMENT_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.validateEmail = function (mailId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.MAIL_SERVICE, null, { id: mailId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.doSearch = function (data, companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.SEARCH_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.validateLockKey = function (companyId, key) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.LOCK_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.create(url + "/" + companyId + "/companylockdate/password_validation", key, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompaniesService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    return CompaniesService;
}(QountServices_1.QountServices));
CompaniesService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], CompaniesService);
exports.CompaniesService = CompaniesService;
