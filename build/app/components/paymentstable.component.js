/**
 * Created by NAZIA on 20-04-2017.
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
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var HighChart_directive_1 = require("reportsUI/app/directives/HighChart.directive");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var router_1 = require("@angular/router");
var footable_directive_1 = require("qCommon/app/directives/footable.directive");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var paymenttableComponent = (function () {
    function paymenttableComponent(_router, _route, companyService, loadingService, reportService, stateService, titleService, _switchBoard) {
        var _this = this;
        this._router = _router;
        this._route = _route;
        this.companyService = companyService;
        this.loadingService = loadingService;
        this.reportService = reportService;
        this.stateService = stateService;
        this.titleService = titleService;
        this.report = {};
        this.tableData = {};
        this.tableOptions = {};
        this.hasItemCodes = false;
        this.showFlyout = true;
        this.tableColumns = ['bill_id', 'vendor_name', 'current_state', 'bill_date', 'due_date', 'amount'];
        this.reportasas = false;
        this.payable = false;
        this.billstatus = false;
        this.companyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.currentpayment = params['PaymentstableID'];
            if (_this.currentpayment == 'totalpayable') {
                _this.billstate = 'Payables';
                _this.billstatus = true;
            }
            else if (_this.currentpayment == 'pastdue') {
                _this.billstate = 'Past Due';
                _this.billstatus = true;
            }
            else if (_this.currentpayment == 'approve') {
                _this.billstate = 'Approve';
                _this.billstatus = true;
            }
            else if (_this.currentpayment == 'pay') {
                _this.billstate = 'Pay';
                _this.billstatus = true;
            }
            else if (_this.currentpayment == '30days') {
                _this.billstate = 'Paid Bills';
                _this.companyService.getpaidcounttable(_this.companyId)
                    .subscribe(function (paiddata) {
                    _this.paiddata = paiddata;
                }, function (error) {
                    _this.loadingService.triggerLoadingEvent(false);
                });
                _this.billstatus = true;
            }
            else {
                console.log("error");
            }
            _this.titleService.setPageTitle(_this.billstate);
        });
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.getpaidcounttable(this.companyId)
            .subscribe(function (paiddata) {
            _this.paiddata = paiddata;
            console.log("this.paiddata", _this.paiddata);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
        this.companyService.getpaymenttable(this.companyId, this.currentpayment)
            .subscribe(function (paymentTabledata) {
            _this.paymenttabledata = paymentTabledata;
            _this.companyService.credits(_this.companyId)
                .subscribe(function (credits) {
                _this.credits = credits;
                _this.buildTableData();
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
            });
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(function (title) { return _this.hideFlyout(); });
    }
    paymenttableComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.stateService.addState(new State_1.State("PAYMENTS_TABLE", this._router.url, null, null));
            var link = ['payments/bill', Session_1.Session.getCurrentCompany(), $event.bill_id, $event.current_state];
            this._router.navigate(link);
        }
    };
    paymenttableComponent.prototype.hideFlyout = function () {
        var link = ['payments/dashboard', 'dashboard'];
        this._router.navigate(link);
    };
    paymenttableComponent.prototype.buildTableData = function () {
        this.hasItemCodes = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "bill_id", "title": "Bill ID", "visible": false },
            { "name": "vendor_name", "title": "Vendor Name" },
            { "name": "bill_date", "title": "Bill Date" },
            { "name": "due_date", "title": "Due Date" },
            { "name": "current_state", "title": "Current State" },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }, "classes": "currency-align currency-padding" },
            { "name": "daysToPay", "title": "Days to Pay" },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        this.paymenttabledata.forEach(function (expense) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                if (key == 'amount') {
                    var amount = parseFloat(expense[key]);
                    row[key] = {
                        'options': {
                            "classes": "currency-align"
                        },
                        value: amount.toFixed(2)
                    };
                }
                else {
                    row[key] = expense[key];
                }
                var currentDate = moment(new Date()).format("YYYY-MM-DD");
                var daysToPay = moment(expense['due_date'], "MM/DD/YYYY").diff(currentDate, 'days');
                if (daysToPay <= 0) {
                    daysToPay = '<span color="red" style="color: red">' + daysToPay + '</span>';
                }
                row['daysToPay'] = daysToPay;
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        this.credits.forEach(function (credit) {
            var row = {};
            var billAmount = credit['totalAmount'] ? credit['totalAmount'] : 0;
            var currency = credit['currency'] ? credit['currency'] : 'USD';
            row['bill_id'] = credit['customID'];
            row['bill_date'] = credit['creditDate'];
            row['vendor_name'] = credit['vendorName'];
            row['current_state'] = credit['current_state'];
            row['amount'] = {
                'options': {
                    "classes": "currency-align"
                },
                value: '-' + billAmount
            };
            row['actions'] = "<a class='action' data-action='creditPayment'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='Enter' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function () {
            base.hasItemCodes = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    paymenttableComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    return paymenttableComponent;
}());
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], paymenttableComponent.prototype, "fooTableDir", void 0);
__decorate([
    core_1.ViewChild('hChart1'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], paymenttableComponent.prototype, "hChart1", void 0);
__decorate([
    core_1.ViewChild('createtaxes'),
    __metadata("design:type", Object)
], paymenttableComponent.prototype, "createtaxes", void 0);
paymenttableComponent = __decorate([
    core_1.Component({
        selector: 'bills',
        templateUrl: '/app/views/paymentstable.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, router_1.ActivatedRoute, Companies_service_1.CompaniesService,
        LoadingService_1.LoadingService, Reports_service_1.ReportService, StateService_1.StateService, PageTitle_1.pageTitleService, SwitchBoard_1.SwitchBoard])
], paymenttableComponent);
exports.paymenttableComponent = paymenttableComponent;
