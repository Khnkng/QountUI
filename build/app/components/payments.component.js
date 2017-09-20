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
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Payments_service_1 = require("qCommon/app/services/Payments.service");
var router_1 = require("@angular/router");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var PaymentsComponent = (function () {
    function PaymentsComponent(switchBoard, toastService, loadingService, paymentsService, _router, _route, numeralService, stateService, titleService) {
        var _this = this;
        this.switchBoard = switchBoard;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.paymentsService = paymentsService;
        this._router = _router;
        this._route = _route;
        this.numeralService = numeralService;
        this.stateService = stateService;
        this.titleService = titleService;
        this.payments = [];
        this.hasPayments = false;
        this.tableData = {};
        this.tableOptions = {};
        this.tableColumns = ['groupID', 'title', 'amount', 'date', 'journalID', 'vendorName', 'bankName'];
        this.bills = [];
        this.fromPayments = false;
        this.localeFortmat = 'en-US';
        this.titleService.setPageTitle("Payments");
        var companyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.routeSub = this._route.params.subscribe(function (params) {
            if (params['paymentID']) {
                _this.getPaymentDetails(params['paymentID']);
            }
            else {
                _this.paymentsService.mappings(companyId, "bill", "true", null)
                    .subscribe(function (payments) {
                    _this.buildTableData(payments || []);
                }, function (error) { return _this.handleError(error); });
            }
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) { return _this.hideFlyout(); });
    }
    PaymentsComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    PaymentsComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.row = {};
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    PaymentsComponent.prototype.ngOnInit = function () {
    };
    PaymentsComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.fromPayments = true;
            var link = ['/payments', $event.groupID];
            this._router.navigate(link);
        }
        else {
            this.navigateToJE($event.journalID);
        }
    };
    PaymentsComponent.prototype.navigateToJE = function (jeID) {
        var link = ['journalEntry', jeID];
        this.stateService.addState(new State_1.State("PAYMENTS_PAGE", this._router.url, null, null));
        this._router.navigate(link);
    };
    PaymentsComponent.prototype.getPaymentDetails = function (id) {
        var _this = this;
        //this.loadingService.triggerLoadingEvent(true);
        this.paymentsService.paymentDetails(id, Session_1.Session.getCurrentCompany())
            .subscribe(function (paymentsDetails) {
            //this.loadingService.triggerLoadingEvent(false);
            _this.bills = paymentsDetails;
            _this.dimensionFlyoutCSS = "expanded";
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { return _this.handleError(error); });
    };
    PaymentsComponent.prototype.buildTableData = function (payments) {
        this.hasPayments = false;
        this.payments = payments;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "groupID", "title": "Id", "visible": false, "filterable": false },
            { "name": "title", "title": "Payment Title" },
            { "name": "amount", "title": "Amount", "sortValue": function (value) {
                    return base.numeralService.value(value);
                } },
            { "name": "date", "title": "Date", "type": "date" },
            { "name": "journalID", "title": "journalId", "visible": false, "filterable": false },
            { "name": "vendorName", "title": "Vendor" },
            { name: "bankName", "title": "Bank" },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        payments.forEach(function (pyment) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                row[key] = pyment[key];
                if (key == 'amount') {
                    var amount = parseFloat(pyment[key]);
                    row[key] = amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                var action = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
                if (pyment.journalID) {
                    action = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>JE</span></a>" + action;
                }
                row["actions"] = action;
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasPayments = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    PaymentsComponent.prototype.hideFlyout = function () {
        if (this.fromPayments) {
            this.dimensionFlyoutCSS = "collapsed";
        }
        else {
            this.goToPreviousPage();
        }
    };
    PaymentsComponent.prototype.moveToBills = function (bill) {
        if (bill.type == 'bill') {
            var link = ['payments/bill', Session_1.Session.getCurrentCompany(), bill.sourceID, 'enter'];
            this._router.navigate(link);
        }
        else if (bill.type == 'credit') {
            var link = ['payments/credit', Session_1.Session.getCurrentCompany(), bill.sourceID];
            this._router.navigate(link);
        }
    };
    PaymentsComponent.prototype.goToPreviousPage = function () {
        var link;
        if (Session_1.Session.getLastVisitedUrl().indexOf('/payments/bill') == 0) {
            link = ["/payments"];
        }
        else {
            link = [Session_1.Session.getLastVisitedUrl()];
        }
        this._router.navigate(link);
    };
    PaymentsComponent.prototype.goToDashboard = function () {
        this._router.navigate(["/payments/dashboard/enter"]);
    };
    return PaymentsComponent;
}());
PaymentsComponent = __decorate([
    core_1.Component({
        selector: 'payments',
        templateUrl: '/app/views/payments.html',
    }),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard, Toast_service_1.ToastService, LoadingService_1.LoadingService,
        Payments_service_1.PaymentsService, router_1.Router, router_1.ActivatedRoute,
        Numeral_service_1.NumeralService, StateService_1.StateService, PageTitle_1.pageTitleService])
], PaymentsComponent);
exports.PaymentsComponent = PaymentsComponent;
