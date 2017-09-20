"use strict";
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
var core_1 = require("@angular/core");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var router_1 = require("@angular/router");
var Invoices_service_1 = require("../services/Invoices.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var StateService_1 = require("qCommon/app/services/StateService");
var InvoiceAddPayment = (function () {
    function InvoiceAddPayment(switchBoard, _router, _route, toastService, loadingService, titleService, stateService, invoiceService, customerService, dateFormater) {
        var _this = this;
        this.switchBoard = switchBoard;
        this._router = _router;
        this._route = _route;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.titleService = titleService;
        this.stateService = stateService;
        this.invoiceService = invoiceService;
        this.customerService = customerService;
        this.dateFormater = dateFormater;
        this.localeFortmat = 'en-US';
        this.hasInvoiceData = false;
        this.applyObject = { 'reference_number': '', 'invoice_date': '', 'payment_method': 'cash', 'amount': '' };
        this.paymentOptions = [{ 'name': 'Cash', 'value': 'cash' }, { 'name': 'Credit/Debit', 'value': 'card' }, { 'name': 'Cheque', 'value': 'cheque' }, { 'name': 'PayPal', 'value': 'paypal' }];
        this.titleService.setPageTitle("Add Payment To Invoice");
        this.dateFormat = dateFormater.getFormat();
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.invoiceID = params['invoiceID'];
            _this.loadInvoiceData();
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    InvoiceAddPayment.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState) {
            this._router.navigate([prevState.url]);
        }
    };
    InvoiceAddPayment.prototype.loadInvoiceData = function () {
        var _this = this;
        var base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.invoiceService.getInvoice(this.invoiceID).subscribe(function (invoices) {
            if (invoices) {
                base.invoiceData = invoices;
                _this.applyObject.reference_number = invoices.number;
                _this.applyObject.invoice_date = invoices.invoice_date;
                base.hasInvoiceData = true;
            }
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { return _this.handleError(error); });
    };
    InvoiceAddPayment.prototype.setPaymentMethod = function (paymentMethod) {
        this.applyObject.payment_method = paymentMethod.target.value;
    };
    InvoiceAddPayment.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    InvoiceAddPayment.prototype.applyPayment = function () {
        var _this = this;
        console.log(this.applyObject);
        this.applyObject['state'] = 'paid';
        this.applyObject['currency'] = this.invoiceData.currency;
        this.applyObject['customer_id'] = this.invoiceData.customer_id;
        this.invoiceService.markAsPaid(this.applyObject, this.invoiceID).subscribe(function (success) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Invoice paid successfully.");
            _this.navigateToDashborad();
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invoice payment failed.");
        });
    };
    InvoiceAddPayment.prototype.navigateToDashborad = function () {
        var link = ['invoices/dashboard', 2];
        this._router.navigate(link);
    };
    InvoiceAddPayment.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    InvoiceAddPayment.prototype.ngOnInit = function () {
    };
    return InvoiceAddPayment;
}());
InvoiceAddPayment = __decorate([
    core_1.Component({
        selector: 'addInvoicePayment',
        templateUrl: '/app/views/addPaymentsToInvoice.html',
    }),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard, router_1.Router, router_1.ActivatedRoute, Toast_service_1.ToastService,
        LoadingService_1.LoadingService, PageTitle_1.pageTitleService, StateService_1.StateService, Invoices_service_1.InvoicesService, Customers_service_1.CustomersService, DateFormatter_service_1.DateFormater])
], InvoiceAddPayment);
exports.InvoiceAddPayment = InvoiceAddPayment;
