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
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Session_1 = require("qCommon/app/services/Session");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var invoices_constants_1 = require("../constants/invoices.constants");
var InvoicesService = (function (_super) {
    __extends(InvoicesService, _super);
    function InvoicesService(http) {
        return _super.call(this, http) || this;
    }
    InvoicesService.prototype.getDocumentServiceUrl = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DOCUMENT_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        url = Qount_constants_1.PATH.DOCUMENT_SERVICE_URL + url;
        return url;
    };
    InvoicesService.prototype.createPreference = function (data, companyId) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PREFERENCE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.create(url, data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.getPreference = function (companyId, userID) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PREFERENCE, null, { id: userID, companyId: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.updatePreference = function (data, id, companyId) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PREFERENCE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.update(url + "/" + id, data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.createInvoice = function (invoiceData) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.create(url, invoiceData, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.updateInvoice = function (invoiceData) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.update(url + "/" + invoiceData.id, invoiceData, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.invoices = function (state) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url + "?state=" + state, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.invoicesByClientId = function (clientID) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_BY_CLIENTID, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany(), clientId: clientID });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.allInvoices = function () {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.getInvoice = function (invoiceId) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url + "/" + invoiceId, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.deleteInvoice = function (invoiceIds) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_DELETE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.create(url, invoiceIds, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.markAsSentInvoice = function (invoiceIds) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_SENT, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.update(url, invoiceIds, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.getPaymentInvoice = function (invoiceId) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PAY, null, { invoiceID: invoiceId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.payInvoice = function (data, invoiceId) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PAY, null, { invoiceID: invoiceId });
        return this.create(url + "?action=pay", data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.addPayment = function (payment) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PAYMENTS, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.create(url, payment, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.payment = function (paymentId) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PAYMENTS, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url + "/" + paymentId, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.getPayments = function () {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PAYMENTS, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.markAsPaid = function (data, invoiceId) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_PAID, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany(), invoiceId: invoiceId });
        return this.update(url, data, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.getInvoicesCount = function () {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        return this.query(url + "/count", Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.getCompanyLogo = function (companyId, userId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.DOCUMENTS_SERVICE, null, { id: userId, companyId: companyId, type: 'company_invoice', mappedId: companyId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.getDashboardBoxData = function (companyId, startDate, endDate) {
        var url = this.interpolateUrl(invoices_constants_1.INVOICE_PATHS.INVOICE_DASHBOARD_BOX, null, { id: Session_1.Session.getUser().id, companyId: Session_1.Session.getCurrentCompany() });
        var query = "";
        if (startDate && endDate) {
            query = "?startDate=" + startDate + "&endDate=" + endDate;
        }
        return this.query(url + query, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    InvoicesService.prototype.handleError = function (error) {
        return Observable_1.Observable.throw(error.text());
    };
    return InvoicesService;
}(QountServices_1.QountServices));
InvoicesService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], InvoicesService);
exports.InvoicesService = InvoicesService;
