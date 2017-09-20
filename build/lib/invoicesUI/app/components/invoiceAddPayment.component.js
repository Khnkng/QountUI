/**
 * Created by seshagirivellanki on 06/07/17.
 */
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
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Session_1 = require("qCommon/app/services/Session");
var Invoices_service_1 = require("../services/Invoices.service");
var forms_1 = require("@angular/forms");
var invoicePayment_form_1 = require("../forms/invoicePayment.form");
var router_1 = require("@angular/router");
var StateService_1 = require("qCommon/app/services/StateService");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var FinancialAccounts_service_1 = require("qCommon/app/services/FinancialAccounts.service");
var State_1 = require("qCommon/app/models/State");
var InvoiceAddPaymentComponent = (function () {
    function InvoiceAddPaymentComponent(_fb, loadingService, customerService, toastService, invoiceService, _invoicePaymentForm, _router, numeralService, _route, stateService, switchBoard, accountsService) {
        var _this = this;
        this._fb = _fb;
        this.loadingService = loadingService;
        this.customerService = customerService;
        this.toastService = toastService;
        this.invoiceService = invoiceService;
        this._invoicePaymentForm = _invoicePaymentForm;
        this._router = _router;
        this.numeralService = numeralService;
        this._route = _route;
        this.stateService = stateService;
        this.switchBoard = switchBoard;
        this.accountsService = accountsService;
        this.customers = [];
        this.invoices = [];
        this.paymentLines = [];
        this.type = 'cheque';
        this.showInvoices = false;
        this.currentClientName = "";
        this.currentLocale = "";
        this.accounts = [];
        this.loadCustomers(Session_1.Session.getCurrentCompany());
        this.invoicePaymentForm = _fb.group(_invoicePaymentForm.getForm());
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.paymentId = params['paymentID'];
            if (_this.paymentId) {
                _this.loadPayment();
            }
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
        var previousState = this.stateService.getPrevState();
        if (previousState && previousState.key == "New-Payment-Invoice") {
            this.invoicePaymentForm.setValue(previousState.data);
            this.loadInvoices();
            this.stateService.pop();
        }
        ;
        this.loadAccounts();
    }
    InvoiceAddPaymentComponent.prototype.loadAccounts = function () {
        var _this = this;
        this.accountsService.financialAccounts(Session_1.Session.getCurrentCompany())
            .subscribe(function (accounts) {
            _this.accounts = accounts.accounts;
        }, function (error) {
        });
    };
    InvoiceAddPaymentComponent.prototype.gotoPreviousState = function () {
        /*let prevState = this.stateService.getPrevState();
         if (prevState) {
         this._router.navigate([prevState.url]);
         }*/
        var link = ['invoices/dashboard', 1];
        this._router.navigate(link);
    };
    InvoiceAddPaymentComponent.prototype.loadPayment = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.invoiceService.payment(this.paymentId).subscribe(function (payment) {
            _this.payment = payment;
            var paymentFormValues = _.clone(_this.payment);
            if (!paymentFormValues.memo) {
                paymentFormValues.memo = "";
            }
            if (!paymentFormValues.id) {
                paymentFormValues.id = "";
            }
            if (!paymentFormValues.paymentNote) {
                paymentFormValues.paymentNote = "";
            }
            if (!paymentFormValues.depositedTo) {
                paymentFormValues.depositedTo = null;
            }
            delete paymentFormValues['paymentLines'];
            _this.invoicePaymentForm.setValue(paymentFormValues);
            setTimeout(function () {
                _this.setCustomerName();
            }, 50);
        });
    };
    InvoiceAddPaymentComponent.prototype.loadCustomers = function (companyId) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.customerService.customers(companyId)
            .subscribe(function (customers) {
            _this.customers = customers;
            _this.closeLoader();
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load your customers");
            _this.closeLoader();
        });
    };
    InvoiceAddPaymentComponent.prototype.loadInvoices = function () {
        var _this = this;
        var clientID = this.invoicePaymentForm.controls['receivedFrom'].value;
        this.invoiceService.invoicesByClientId(clientID).subscribe(function (invoices) {
            _this.invoices = invoices;
            _this.addPaymentLines(_this.invoices);
            _this.closeLoader();
        }, function (error) {
            _this.handleError(error);
            _this.closeLoader();
        });
    };
    InvoiceAddPaymentComponent.prototype.setType = function (type) {
        this.type = type;
        this.invoicePaymentForm.controls['type'].setValue(type);
    };
    InvoiceAddPaymentComponent.prototype.handleError = function (error) {
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    InvoiceAddPaymentComponent.prototype.closeLoader = function () {
        this.loadingService.triggerLoadingEvent(false);
    };
    InvoiceAddPaymentComponent.prototype.setPaymentDate = function (date) {
        var paymentDateControl = this.invoicePaymentForm.controls['paymentDate'];
        paymentDateControl.setValue(date);
    };
    InvoiceAddPaymentComponent.prototype.save = function () {
        var _this = this;
        this.saving = true;
        this.loadingService.triggerLoadingEvent(true);
        var payment = this.invoicePaymentForm.value;
        payment.paymentLines = this.paymentLines;
        console.log("pament--", payment);
        if (!payment.depositedTo) {
            payment.depositedTo = null;
        }
        var paymentAmount = parseFloat(this.invoicePaymentForm.controls['paymentAmount'].value) || 0;
        /*if(this.paymentLines.length == 0) {
            this.toastService.pop(TOAST_TYPE.error, "Add atlease one invoice");
            this.loadingService.triggerLoadingEvent(false);
            return;
        }*/
        if (this.getAppliedAmount() <= paymentAmount) {
            this.invoiceService.addPayment(payment).subscribe(function (response) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Payment created successfully");
                _this.loadingService.triggerLoadingEvent(false);
                var link = ['invoices/dashboard', 1];
                _this._router.navigate(link);
            }, function (error) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to create payment");
                _this.saving = false;
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
        else {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Applied amount cannot be greater than payment amount");
            this.saving = false;
            this.loadingService.triggerLoadingEvent(false);
        }
    };
    InvoiceAddPaymentComponent.prototype.setCustomerName = function () {
        this.loadInvoices();
        var clientId = this.invoicePaymentForm.controls['receivedFrom'].value;
        if (clientId) {
            var customer = _.find(this.customers, function (customer) {
                return customer.customer_id == clientId;
            });
            this.currentClientName = customer.customer_name;
        }
        else {
            this.currentClientName = "";
        }
    };
    InvoiceAddPaymentComponent.prototype.removeOtherPaymentInvoices = function (_invoices) {
        var _this = this;
        var invoices = [];
        _invoices.forEach(function (invoice) {
            var line;
            if (_this.payment) {
                line = _.find(_this.payment.paymentLines, function (_line) {
                    return _line.invoiceId === invoice.id;
                });
            }
            if (line || !invoice.amount_paid || (invoice.amount_paid < invoice.amount)) {
                if (!line) {
                    invoice.amount_paid = 0; // making this to not display any previous amount payed;
                }
                else {
                    // adding this so that we can use it for knowing if the present invoice is already paid under present payment.
                    invoice.paymentLine = line;
                }
                invoices.push(invoice);
            }
        });
        return invoices;
    };
    InvoiceAddPaymentComponent.prototype.addPaymentLines = function (_invoices) {
        var _this = this;
        this.paymentLines = [];
        var invoices = this.removeOtherPaymentInvoices(_invoices);
        invoices = _.sortBy(invoices, function (_invoice) {
            return _invoice.paymentLine ? _invoice.paymentLine.amount : 0;
        }).reverse();
        invoices.forEach(function (invoice) {
            var paymentLine = {};
            paymentLine.invoiceId = invoice.id;
            paymentLine.number = invoice.number;
            paymentLine.invoiceAmount = invoice.amount;
            paymentLine.dueAmount = invoice.amount_due || "";
            paymentLine.invoiceDate = invoice.invoice_date;
            paymentLine.state = invoice.state;
            var date = new Date(invoice.invoice_date);
            var termDays = invoice.term ? parseInt(invoice.term.replace("net")) : 0;
            date.setDate(date + termDays);
            //paymentLine.dueDate =  termDays ? date.toString() : "";
            paymentLine.dueDate = invoice.due_date;
            if (!_this.paymentId) {
                paymentLine.amount = "";
                if (invoice.state != "paid" && invoice.state != "draft") {
                    _this.paymentLines.push(paymentLine);
                }
            }
            else {
                if (invoice.state == "partially_paid" && !invoice.paymentLine) {
                    paymentLine.amount = 0;
                }
                else {
                    paymentLine.amount = invoice.paymentLine ? invoice.paymentLine.amount : 0;
                }
                var paymentAmount = parseFloat(_this.invoicePaymentForm.controls['paymentAmount'].value) || 0;
                if (invoice.state != "draft" && _this.getAppliedAmount() < paymentAmount) {
                    _this.paymentLines.push(paymentLine);
                    var appliedAmount = _this.getAppliedAmount();
                    if (appliedAmount > paymentAmount) {
                        _this.paymentLines.pop();
                    }
                }
            }
        });
    };
    InvoiceAddPaymentComponent.prototype.getAppliedAmount = function () {
        var appliedAmount = 0;
        this.paymentLines.forEach(function (line) {
            appliedAmount += line.amount ? parseFloat(line.amount) : 0;
        });
        return appliedAmount;
    };
    InvoiceAddPaymentComponent.prototype.getAppliedText = function () {
        var appliedAmount = this.getAppliedAmount();
        var text = this.numeralService.format("$0,0.00", appliedAmount);
        text += " of ";
        var paymentAmount = this.invoicePaymentForm.controls['paymentAmount'].value || 0;
        text += this.numeralService.format("$0,0.00", paymentAmount) + " applied";
        return text;
    };
    InvoiceAddPaymentComponent.prototype.getOutstandingBalance = function () {
        var outstanding = 0;
        this.paymentLines.forEach(function (line) {
            outstanding += line.dueAmount ? parseFloat(line.dueAmount) : 0;
        });
        return this.numeralService.format("$0,0.00", outstanding || 0);
    };
    InvoiceAddPaymentComponent.prototype.gotoInvoice = function () {
        var tempData = this.invoicePaymentForm.value;
        this.stateService.addState(new State_1.State('New-Payment-Invoice', this._router.url, tempData, null));
        var link = ['invoices/NewInvoice'];
        this._router.navigate(link);
    };
    InvoiceAddPaymentComponent.prototype.setLocale = function () {
        this.currentLocale = this.invoicePaymentForm.controls['currencyCode'].value;
        this.numeralService.switchLocale(this.currentLocale);
    };
    InvoiceAddPaymentComponent.prototype.ngAfterViewInit = function () {
        this.invoicePaymentForm.controls['type'].setValue("cheque");
        this.invoicePaymentForm.controls['currencyCode'].setValue("USD");
        this.numeralService.switchLocale("USD");
    };
    InvoiceAddPaymentComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    return InvoiceAddPaymentComponent;
}());
InvoiceAddPaymentComponent = __decorate([
    core_1.Component({
        selector: 'invoice-payments',
        templateUrl: '/app/views/invoiceAddPayment.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, LoadingService_1.LoadingService,
        Customers_service_1.CustomersService,
        Toast_service_1.ToastService, Invoices_service_1.InvoicesService,
        invoicePayment_form_1.InvoicePaymentForm, router_1.Router,
        Numeral_service_1.NumeralService, router_1.ActivatedRoute,
        StateService_1.StateService, SwitchBoard_1.SwitchBoard,
        FinancialAccounts_service_1.FinancialAccountsService])
], InvoiceAddPaymentComponent);
exports.InvoiceAddPaymentComponent = InvoiceAddPaymentComponent;
