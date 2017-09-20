/**
 * Created by NAZIA on 04-05-2017.
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
var router_1 = require("@angular/router");
var footable_directive_1 = require("qCommon/app/directives/footable.directive");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var paidtablecomponent = (function () {
    function paidtablecomponent(_router, _route, companyService, loadingService, stateService, titleService, _switchBoard) {
        var _this = this;
        this._router = _router;
        this._route = _route;
        this.companyService = companyService;
        this.loadingService = loadingService;
        this.stateService = stateService;
        this.titleService = titleService;
        this.report = {};
        this.tableData = {};
        this.tableOptions = {};
        this.hasItemCodes = false;
        this.showFlyout = true;
        this.tablecol = ['vendorName', 'id', 'paidDate', 'billDate', 'dueDate', 'amount', 'currentState'];
        this.reportasas = false;
        this.payable = false;
        this.billstatus = false;
        this.companyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.currentpayment = params['PaymentstableID'];
        });
        this.loadingService.triggerLoadingEvent(true);
        if (this.currentpayment == '30days') {
            this.companyService.getpaidcounttable(this.companyId)
                .subscribe(function (paiddata) {
                _this.paiddata = paiddata;
                _this.buildTableDataPaid(_this.paiddata.bills);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
        else {
            this.companyService.getpaidTransits(this.companyId)
                .subscribe(function (paiddata) {
                _this.paiddata = paiddata;
                _this.buildTableDataPaid(_this.paiddata);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
        this.titleService.setPageTitle("paid");
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(function (title) { return _this.hideFlyout(); });
    }
    paidtablecomponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.stateService.addState(new State_1.State("BILLS_DRILL_DOWN", this._router.url, null, null));
            var link = ['payments/bill', Session_1.Session.getCurrentCompany(), $event.id, $event.currentState];
            this._router.navigate(link);
        }
    };
    paidtablecomponent.prototype.hideFlyout = function () {
        var link = ['payments/dashboard', 'dashboard'];
        this._router.navigate(link);
    };
    paidtablecomponent.prototype.buildTableDataPaid = function (paiddata) {
        this.hasItemCodes = false;
        this.paiddata = paiddata;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "id", "title": "Bill ID", "visible": false },
            { "name": "currentState", "title": "Current State", "visible": false },
            { "name": "vendorName", "title": "Vendor Name" },
            { "name": "paidDate", "title": "Paid Date" },
            { "name": "billDate", "title": "Bill Date" },
            { "name": "dueDate", "title": "Due Date" },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }, "classes": "currency-align currency-padding" },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        paiddata.forEach(function (expense) {
            var row = {};
            _.each(base.tablecol, function (key) {
                if (key == 'amount') {
                    var amount = parseFloat(expense[key]);
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value: amount.toFixed(2)
                    };
                }
                else {
                    row[key] = expense[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function () {
            base.hasItemCodes = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    paidtablecomponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    return paidtablecomponent;
}());
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], paidtablecomponent.prototype, "fooTableDir", void 0);
__decorate([
    core_1.ViewChild('hChart1'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], paidtablecomponent.prototype, "hChart1", void 0);
__decorate([
    core_1.ViewChild('createtaxes'),
    __metadata("design:type", Object)
], paidtablecomponent.prototype, "createtaxes", void 0);
paidtablecomponent = __decorate([
    core_1.Component({
        selector: 'paid',
        templateUrl: '/app/views/paidtable.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, router_1.ActivatedRoute, Companies_service_1.CompaniesService,
        LoadingService_1.LoadingService, StateService_1.StateService, PageTitle_1.pageTitleService, SwitchBoard_1.SwitchBoard])
], paidtablecomponent);
exports.paidtablecomponent = paidtablecomponent;
