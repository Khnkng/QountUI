/**
 * Created by seshu on 26-02-2016.
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
var router_1 = require("@angular/router");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Expense_service_1 = require("qCommon/app/services/Expense.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var FinancialAccounts_service_1 = require("qCommon/app/services/FinancialAccounts.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var CategorizationComponent = (function () {
    function CategorizationComponent(toastService, _router, _route, loadingService, expenseService, accountsService, numeralService, _switchBoard, titleService, stateService) {
        var _this = this;
        this.toastService = toastService;
        this._router = _router;
        this._route = _route;
        this.loadingService = loadingService;
        this.expenseService = expenseService;
        this.accountsService = accountsService;
        this.numeralService = numeralService;
        this.titleService = titleService;
        this.stateService = stateService;
        this.accounts = [];
        this.entries = [];
        this.tableData = {};
        this.hasEntries = false;
        this.tableOptions = { search: false, pageSize: 12 };
        this.localeFortmat = 'en-US';
        this.titleService.setPageTitle("Categorization");
        this.companyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(function (accounts) {
            _this.accounts = accounts.accounts;
            _this.fetchUncategorizedEntries();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(function (title) { return _this.showPreviousPage(); });
    }
    CategorizationComponent.prototype.showPreviousPage = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState) {
            this._router.navigate([prevState.url]);
        }
    };
    CategorizationComponent.prototype.ngOnInit = function () {
    };
    CategorizationComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    CategorizationComponent.prototype.fetchUncategorizedEntries = function () {
        var _this = this;
        var base = this;
        this.expenseService.uncategorizedEntries(this.companyId)
            .subscribe(function (entries) {
            _this.loadingService.triggerLoadingEvent(false);
            _.each(entries.Deposits, function (entry) {
                entry.type = 'Deposit';
                base.entries.push(entry);
            });
            _.each(entries.Expenses, function (entry) {
                entry.type = 'Expense';
                base.entries.push(entry);
            });
            _this.buildTableData();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    CategorizationComponent.prototype.getBankAccountName = function (accountId) {
        var account = _.find(this.accounts, { 'id': accountId });
        return account ? account.name : "";
    };
    CategorizationComponent.prototype.redirectToEntryPage = function ($event) {
        if ($event.type == 'Expense') {
            var link = ['/expense', $event.id];
            this._router.navigate(link);
        }
        if ($event.type == 'Deposit') {
            var link = ['/deposit', $event.id];
            this._router.navigate(link);
        }
    };
    CategorizationComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.redirectToEntryPage($event);
            this.addCategorizationState();
        }
    };
    CategorizationComponent.prototype.buildTableData = function () {
        var base = this;
        this.tableData.columns = [
            { "name": "type", "title": "Type" },
            { "name": "title", "title": "Title" },
            { "name": "amount", "title": "Amount", "sortValue": function (value) {
                    return base.numeralService.value(value);
                } },
            { "name": "bank_account_id", "title": "Bank Account" },
            { "name": "id", "title": "Entry ID", "visible": false },
            { "name": "actions", "title": "", "type": "html", "sortable": false }
        ];
        this.tableData.rows = [];
        _.each(this.entries, function (entry) {
            var row = {};
            _.each(Object.keys(entry), function (key) {
                if (key == 'bank_account_id') {
                    row[key] = base.getBankAccountName(entry[key]);
                }
                else if (key == 'amount') {
                    var amount = parseFloat(entry[key]);
                    row[key] = amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                else {
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
        if (this.tableData.rows.length > 0) {
            this.hasEntries = true;
        }
    };
    CategorizationComponent.prototype.addCategorizationState = function () {
        this.stateService.addState(new State_1.State('CATEGORIZATION', this._router.url, null, null));
    };
    return CategorizationComponent;
}());
CategorizationComponent = __decorate([
    core_1.Component({
        selector: 'categorize',
        templateUrl: '/app/views/categorization.html',
    }),
    __metadata("design:paramtypes", [Toast_service_1.ToastService, router_1.Router, router_1.ActivatedRoute,
        LoadingService_1.LoadingService, Expense_service_1.ExpenseService, FinancialAccounts_service_1.FinancialAccountsService, Numeral_service_1.NumeralService, SwitchBoard_1.SwitchBoard, PageTitle_1.pageTitleService, StateService_1.StateService])
], CategorizationComponent);
exports.CategorizationComponent = CategorizationComponent;
