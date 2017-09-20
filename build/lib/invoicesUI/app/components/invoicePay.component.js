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
var router_1 = require("@angular/router");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Invoices_service_1 = require("../services/Invoices.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var CodesService_service_1 = require("qCommon/app/services/CodesService.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Invoice_form_1 = require("../forms/Invoice.form");
var forms_1 = require("@angular/forms");
var InvoiceLine_form_1 = require("../forms/InvoiceLine.form");
var Date_constants_1 = require("qCommon/app/constants/Date.constants");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var payments_constants_1 = require("reportsUI/app/constants/payments.constants");
var InvoicePayComponent = (function () {
    function InvoicePayComponent(_fb, _router, _route, loadingService, invoiceService, toastService, codeService, companyService, _invoiceForm, _invoiceLineForm, _invoiceLineTaxesForm, customersService, reportService) {
        var _this = this;
        this._fb = _fb;
        this._router = _router;
        this._route = _route;
        this.loadingService = loadingService;
        this.invoiceService = invoiceService;
        this.toastService = toastService;
        this.codeService = codeService;
        this.companyService = companyService;
        this._invoiceForm = _invoiceForm;
        this._invoiceLineForm = _invoiceLineForm;
        this._invoiceLineTaxesForm = _invoiceLineTaxesForm;
        this.customersService = customersService;
        this.reportService = reportService;
        this.invoiceLineArray = new forms_1.FormArray([]);
        this.taxArray = [];
        this.months = Date_constants_1.MONTHS;
        this.years = Date_constants_1.YEARS;
        this.cards = [];
        this.hasInvoice = false;
        this.isCreditForm = true;
        this.isBankForm = false;
        this.accountType = [{ 'name': 'Checking', 'value': 'checking' }, { 'name': 'Saving', 'value': 'saving' }];
        this.bank = { 'bank_account_holder_first_name': '', 'bank_account_holder_last_name': '', 'bank_account_number': '', 'bank_routing_number': '', 'bank_account_type': '', 'token_type': 'bank_account' };
        this.type = 'credit';
        var _form = this._invoiceForm.getForm();
        _form['invoiceLines'] = this.invoiceLineArray;
        this.invoiceForm = this._fb.group(_form);
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.invoiceID = params['invoiceID'];
            _this.loadInitialData();
        });
    }
    InvoicePayComponent.prototype.setupForm = function () {
        var _this = this;
        var base = this;
        this.invoiceService.getPaymentInvoice(this.invoiceID).subscribe(function (invoice) {
            if (invoice) {
                if (invoice) {
                    _this.invoiceData = invoice;
                    _this.hasInvoice = true;
                    _this.card_exp_month = "";
                    _this.card_exp_year = "";
                }
                _this.invoice = invoice;
                if (_this.invoice.state == 'paid') {
                    _this.isPaid = true;
                }
                if (invoice.payment_spring_customer_id) {
                    _this.getSavedOldCardDetails(invoice.company_id, invoice.payment_spring_customer_id);
                }
                /*let _invoice = _.cloneDeep(invoice);
                delete _invoice.invoiceLines;
                _invoice.customer_name=_invoice.customer.customer_name;
                this._invoiceForm.updateForm(this.invoiceForm, _invoice);
                this.invoice.invoiceLines.forEach(function(invoiceLine:any){
                    invoiceLine.name=invoiceLine.item.name;
                    base.addInvoiceList(invoiceLine);
                });*/
            }
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { return _this.handleError(error); });
    };
    InvoicePayComponent.prototype.loadInitialData = function () {
        this.loadingService.triggerLoadingEvent(true);
        this.setupForm();
    };
    InvoicePayComponent.prototype.ngOnInit = function () {
    };
    InvoicePayComponent.prototype.payInvoice = function (event) {
        this.openCreditCardFlyout();
    };
    InvoicePayComponent.prototype.pay = function (action, paymentSpringToken) {
        var _this = this;
        // this.loadingService.triggerLoadingEvent(true);
        var data = {
            "amountToPay": this.invoice.amount_due,
            "action": action,
            "payment_spring_token": paymentSpringToken
        };
        if (this.type = 'bank') {
            data['payment_type'] = "Bank Account";
        }
        else {
            data['payment_type'] = "Credit Card";
        }
        this.invoiceService.payInvoice(data, this.invoiceID).subscribe(function (res) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.resetCardFields();
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Invoice paid successfully");
            _this.isPaid = true;
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.resetCardFields();
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invoice Payment failed");
        });
    };
    InvoicePayComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    InvoicePayComponent.prototype.openCreditCardFlyout = function () {
        jQuery('#creditcard-details-conformation').foundation('open');
    };
    InvoicePayComponent.prototype.closeCreditCardFlyout = function () {
        this.resetCardFields();
        //jQuery('#creditcard-details-conformation').foundation('close');
    };
    InvoicePayComponent.prototype.checkValidation = function () {
        if (this.card_number && this.card_exp_month && this.card_exp_year && this.csc && this.card_owner_name)
            return true;
        else
            return false;
    };
    InvoicePayComponent.prototype.checkBankValidation = function () {
        if (this.bank.bank_account_holder_first_name && this.bank.bank_account_holder_last_name && this.bank.bank_account_number && this.bank.bank_routing_number && this.bank.bank_account_type)
            return true;
        else
            return false;
    };
    InvoicePayComponent.prototype.getToken = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.customersService.getPaymentSpringToken(this.invoice.company_id)
            .subscribe(function (res) {
            if (!_.isEmpty(res)) {
                _this.publicKey = res.public_key;
                _this.getCardTokenDetails();
            }
            else {
                _this.loadingService.triggerLoadingEvent(false);
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Add company to payment spring");
            }
        }, function (error) { return _this.handleError(error); });
    };
    InvoicePayComponent.prototype.getCardTokenDetails = function () {
        var _this = this;
        var data;
        if (this.type == 'bank') {
            data = this.bank;
            data.token_type = 'bank_account';
        }
        else {
            data = {
                "card_number": this.card_number,
                "card_exp_month": this.card_exp_month,
                "card_exp_year": this.card_exp_year,
                "card_owner_name": this.card_owner_name,
                "csc": this.csc
            };
        }
        this.customersService.getCreditCardToken(data, this.publicKey)
            .subscribe(function (res) {
            _this.pay("one_time_charge", res.id);
            _this.closeCreditCardFlyout();
        }, function (error) {
            var err = JSON.parse(error);
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, err.errors[0].message);
        });
    };
    InvoicePayComponent.prototype.saveCard = function () {
        /* if(this.paymentCard=='newCard'){
             this.getToken();
         }else {
             this.closeCreditCardFlyout();
             this.pay("one_time_customer_charge",this.invoice.payment_spring_customer_id);
         }*/
        this.getToken();
        console.log(this.bank);
    };
    InvoicePayComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
        jQuery('#creditcard-details-conformation').remove();
    };
    InvoicePayComponent.prototype.resetCardFields = function () {
        this.card_number = null;
        this.card_exp_month = null;
        this.card_exp_year = null;
        this.card_owner_name = null;
        this.csc = null;
        this.paymentCard = null;
        this.bank = {};
    };
    InvoicePayComponent.prototype.getSavedOldCardDetails = function (companyID, springToken) {
        var _this = this;
        this.customersService.getSavedCardDetails(companyID, springToken)
            .subscribe(function (res) {
            if (res) {
                _this.cards.push(_this.invoice.customer.card_name + "(XXXX-XXXX-XXXX-" + res.last_4 + ")");
            }
        }, function (error) { return _this.handleError(error); });
    };
    InvoicePayComponent.prototype.downloadInvoice = function () {
        var _this = this;
        var html = jQuery('<div>').append(jQuery('style').clone()).append(jQuery('#payment-preview').clone()).html();
        var pdfReq = {
            "version": "1.1",
            "genericReport": {
                "payload": html
            }
        };
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.PDF_SERVICE, pdfReq)
            .subscribe(function (data) {
            var blob = new Blob([data._body], { type: "application/pdf" });
            var link = jQuery('<a></a>');
            link[0].href = URL.createObjectURL(blob);
            link[0].download = "Invoice.pdf";
            link[0].click();
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    InvoicePayComponent.prototype.printInvoice = function () {
        window.print();
    };
    InvoicePayComponent.prototype.showForm = function (type) {
        if (type == 'bank') {
            this.isBankForm = !this.isBankForm;
        }
        else {
            this.isCreditForm = !this.isCreditForm;
        }
    };
    InvoicePayComponent.prototype.setPaymentMethod = function (event) {
        this.bank.payment_method = event.target.value;
    };
    InvoicePayComponent.prototype.setType = function (type) {
        this.type = type;
        this.isCreditForm = !this.isCreditForm;
    };
    return InvoicePayComponent;
}());
InvoicePayComponent = __decorate([
    core_1.Component({
        selector: 'invoice-pay',
        templateUrl: '/app/views/invoicePay.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.Router, router_1.ActivatedRoute, LoadingService_1.LoadingService,
        Invoices_service_1.InvoicesService, Toast_service_1.ToastService, CodesService_service_1.CodesService, Companies_service_1.CompaniesService,
        Invoice_form_1.InvoiceForm, InvoiceLine_form_1.InvoiceLineForm, InvoiceLine_form_1.InvoiceLineTaxesForm,
        Customers_service_1.CustomersService, Reports_service_1.ReportService])
], InvoicePayComponent);
exports.InvoicePayComponent = InvoicePayComponent;
