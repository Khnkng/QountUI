/**
 * Created by seshu on 25-07-2016.
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
var http_1 = require("@angular/http");
var core_1 = require("@angular/core");
var QountServices_1 = require("qCommon/app/services/QountServices");
var Observable_1 = require("rxjs/Observable");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Session_1 = require("qCommon/app/services/Session");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var payments_constants_1 = require("../constants/payments.constants");
var BillsService = (function (_super) {
    __extends(BillsService, _super);
    function BillsService(http) {
        return _super.call(this, http) || this;
    }
    BillsService.prototype.bills = function (companyId, filter) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.BILLS_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        if (filter) {
            url = url + "?filter=" + filter;
        }
        return this.query(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.credits = function (companyId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CREDITS_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.bill = function (companyID, billID) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.BILL_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyID, billID: billID });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.credit = function (companyID, creditID) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CREDIT_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyID, creditID: creditID });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.createBill = function (bill, companyId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CREATE_BILL_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.create(url, bill, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.createCredit = function (credit, companyId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CREATE_CREDIT_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.create(url, credit, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.updateCredit = function (credit, companyId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CREATE_CREDIT_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.update(url + '/' + credit.id, credit, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.updateBill = function (bill) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.BILL_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: bill.companyID, billID: bill.id });
        return this.update(url, bill, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.deleteBill = function (bill, companyID) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.BILL_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: companyID, billID: bill.id });
        return this.delete(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.deleteCredit = function (bill) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CREDIT_SERVICE, null, { id: Session_1.Session.getUser().id, companyID: bill.companyID, creditID: bill.id });
        return this.delete(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.getConvertedCurrencyValue = function (from, to, date) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CURRENCY_CONVERSION_SERVICE, null, { userId: Session_1.Session.getUser().id, from: from, to: to, date: date });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.getDocumentServiceUrl = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DOCUMENT_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        url = Qount_constants_1.PATH.DOCUMENT_SERVICE_URL + url;
        return url;
    };
    BillsService.prototype.getDocumentByBill = function (companyId, billId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DOCUMENTS_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId, type: 'bill', mappedId: billId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.deleteDocumentBySource = function (sourceId, documentId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.SOURCES_DELETE_SERVICE, null, { id: Session_1.Session.getUser().id, sourceId: sourceId, documentId: documentId });
        return this.delete(url, Qount_constants_1.SOURCE_TYPE.DOCUMENT).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.updateBillDocument = function (docObj) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DOCUMENT_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.update(url, docObj, Qount_constants_1.SOURCE_TYPE.DOCUMENT).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.addBillLine = function (companyId, billId, line) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.BILL_LINE_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId, billID: billId });
        return this.create(url, line, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.getBillLine = function (companyId, billId, lineId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.BILL_LINE_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId, billID: billId });
        return this.query(url + '/' + lineId, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.updateLineData = function (billId, companyId, lineData) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.BILL_LINE_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId, billID: billId });
        return this.update(url + '/' + lineData.billLineId, lineData, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.deleteBillLine = function (companyId, billId, lineId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.BILL_LINE_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId, billID: billId });
        return this.delete(url + '/' + lineId, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.get1099Data = function () {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS._1099_SERVICE, null, null);
        return this.query(url, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.convertCurrency = function (billsList) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.CURRENCY_CONVERT_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.create(url, billsList, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.getCompanyAccounts = function (companyId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.COMPANY_ACCOUNTS_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.markPaidBills = function (bills, companyId) {
        var url = this.interpolateUrl(payments_constants_1.PAYMENTSPATHS.MARK_PAID, null, { id: Session_1.Session.getUser().id, companyID: companyId });
        return this.update(url, bills, Qount_constants_1.SOURCE_TYPE.BIG_PAY).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    BillsService.prototype.handleError = function (error) {
        return Observable_1.Observable.throw(error.text());
    };
    return BillsService;
}(QountServices_1.QountServices));
BillsService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], BillsService);
exports.BillsService = BillsService;
