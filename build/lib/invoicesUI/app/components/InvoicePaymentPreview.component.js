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
var InvoicePaymentPreview = (function () {
    function InvoicePaymentPreview(switchBoard, _router, _route, toastService, loadingService, titleService, invoiceService, customerService) {
        this.switchBoard = switchBoard;
        this._router = _router;
        this._route = _route;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.titleService = titleService;
        this.invoiceService = invoiceService;
        this.customerService = customerService;
        this.customers = [];
        this.taskInvoices = [];
        this.itemInvoices = [];
        this.termsList = { "net30": "Net 30", "net45": "Net 45", "net60": "Net 60", "net90": "Net 90", "custom": "Custom" };
    }
    Object.defineProperty(InvoicePaymentPreview.prototype, "invoices", {
        set: function (invoices) {
            invoices.term = this.termsList[invoices.term];
            this.invoiceData = invoices;
            if (invoices.logoURL) {
                this.logoURL = invoices.logoURL;
            }
            else {
                this.getCompanyLogo();
            }
            this.loadInvoiceData();
        },
        enumerable: true,
        configurable: true
    });
    InvoicePaymentPreview.prototype.loadInvoiceData = function () {
        this.taskInvoices = _.filter(this.invoiceData.invoiceLines, function (invoice) { return invoice.type == 'task'; });
        this.itemInvoices = _.filter(this.invoiceData.invoiceLines, function (invoice) { return invoice.type == 'item'; });
    };
    InvoicePaymentPreview.prototype.loadCustomers = function (companyId) {
        var _this = this;
        this.customerService.customers(companyId)
            .subscribe(function (customers) {
            _this.customers = customers;
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load your customers");
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    InvoicePaymentPreview.prototype.getCompanyLogo = function () {
        var _this = this;
        this.invoiceService.getCompanyLogo(this.invoiceData.company_id, this.invoiceData.user_id)
            .subscribe(function (preference) { return _this.processPreference(preference[0]); }, function (error) { return _this.handleError(error); });
    };
    InvoicePaymentPreview.prototype.processPreference = function (preference) {
        if (preference && preference.temporaryURL) {
            this.logoURL = preference.temporaryURL;
        }
    };
    InvoicePaymentPreview.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    InvoicePaymentPreview.prototype.ngOnDestroy = function () {
    };
    InvoicePaymentPreview.prototype.ngOnInit = function () {
    };
    return InvoicePaymentPreview;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], InvoicePaymentPreview.prototype, "invoices", null);
InvoicePaymentPreview = __decorate([
    core_1.Component({
        selector: 'invoicePaymentPreview',
        templateUrl: '/app/views/invoicePaymentPreview.html',
    }),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard, router_1.Router, router_1.ActivatedRoute, Toast_service_1.ToastService,
        LoadingService_1.LoadingService, PageTitle_1.pageTitleService, Invoices_service_1.InvoicesService, Customers_service_1.CustomersService])
], InvoicePaymentPreview);
exports.InvoicePaymentPreview = InvoicePaymentPreview;
