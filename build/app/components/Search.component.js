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
var router_1 = require("@angular/router");
var Session_1 = require("qCommon/app/services/Session");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var SearchComponent = (function () {
    function SearchComponent(_router, coaService, companyService, customersService, loadingService, toastService, titleService, _switchBoard, stateService) {
        var _this = this;
        this._router = _router;
        this.coaService = coaService;
        this.companyService = companyService;
        this.customersService = customersService;
        this.loadingService = loadingService;
        this.toastService = toastService;
        this.titleService = titleService;
        this.stateService = stateService;
        this.source = [];
        this.amount = 0;
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.chartOfAccounts = [];
        this.vendors = [];
        this.customers = [];
        this.hasSearchResults = false;
        this.showSearchCriteria = true;
        this.showtable = false;
        this.tableData = {};
        this.tableOptions = {};
        this.currency = 'USD';
        this.locale = "en-US";
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.companyId = Session_1.Session.getCurrentCompany();
        this.titleService.setPageTitle("Search");
        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(function (chartOfAccounts) {
            _this.chartOfAccounts = chartOfAccounts;
        }, function (error) {
        });
        this.companyService.vendors(this.companyId)
            .subscribe(function (vendors) {
            _this.vendors = vendors;
        }, function (error) {
        });
        this.customersService.customers(this.companyId)
            .subscribe(function (customers) {
            _this.customers = customers;
        }, function (error) {
        });
        this.amountCondition = 'greaterthan';
        this.textCondition = 'beginsWith';
        this.dateCondition = 'equals';
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showtable == true) {
                _this.stateService.pop();
                _this.showtable = false;
                _this.titleService.setPageTitle("Search");
            }
            else {
                _this.showPreviousPage();
            }
        });
    }
    SearchComponent.prototype.ngOnInit = function () {
        var base = this;
        this._router.events.filter(function (event) { return event instanceof router_1.NavigationEnd; }).subscribe(function (routeChange) {
            base.source = [];
        });
        jQuery(document).ready(function () {
            jQuery(document).foundation();
        });
        var criteria = sessionStorage.getItem("searchcriteria");
        if (criteria) {
            this.getSearchResults(JSON.parse(criteria));
            this.stateService.pop();
        }
    };
    SearchComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    SearchComponent.prototype.showPreviousPage = function () {
        var prevState = this.stateService.pop();
        if (prevState) {
            this._router.navigate([prevState.url]);
        }
        else {
            var link = [''];
            this._router.navigate(link);
        }
    };
    SearchComponent.prototype.isCompSelected = function (component) {
        var url = Session_1.Session.getLastVisitedUrl();
        if (this.source.indexOf(component) != -1) {
            return 'selected-button';
        }
        else if (url.indexOf(component.toLowerCase()) != -1) {
            this.source.push(component);
            return 'selected-button';
        }
        return 'hollow';
    };
    SearchComponent.prototype.selectComponent = function (component) {
        if (this.source.indexOf(component) == -1) {
            this.source.push(component);
        }
        else {
            this.source.splice(this.source.indexOf(component), 1);
        }
    };
    SearchComponent.prototype.setDate = function (date, key) {
        this[key] = date;
    };
    SearchComponent.prototype.resetCriteria = function () {
        this.source = [];
        this.beginDate = '';
        this.endDate = '';
        this.amount = 0;
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.text = '';
        this.amountCondition = '';
    };
    SearchComponent.prototype.setChartOfAccount = function (chartOfAccount) {
        if (chartOfAccount && chartOfAccount.id) {
            this.chartOfAccount = chartOfAccount.id;
        }
        else if (chartOfAccount == '--None--') {
            this.chartOfAccount = null;
        }
    };
    SearchComponent.prototype.setVendor = function (vendor) {
        if (vendor && vendor.id) {
            this.vendor = vendor.id;
        }
        else if (vendor == '--None--') {
            this.vendor = null;
        }
    };
    SearchComponent.prototype.setCustomer = function (customer) {
        if (customer && customer.customer_id) {
            this.customer = customer.customer_id;
        }
        else if (customer == '--None--') {
            this.customer = null;
        }
    };
    SearchComponent.prototype.validate = function () {
        if (this.amountCondition != 'between' && isNaN(this.amount)) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please enter numbers in the amount");
            return false;
        }
        if (this.amountCondition == 'between' && (isNaN(this.lowerLimit) || isNaN(this.upperLimit))) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please enter numbers in the amount fields");
            return false;
        }
        return true;
    };
    SearchComponent.prototype.getSortedAmount = function () {
        return _.sortBy([this.lowerLimit, this.upperLimit]);
    };
    SearchComponent.prototype.doSearch = function () {
        if (!this.validate()) {
            return;
        }
        var data = {
            source: this.source,
            criteria: {}
        };
        if (this.vendor) {
            data.criteria.vendor = this.vendor;
        }
        if (this.chartOfAccount) {
            data.criteria.chartOfAccount = this.chartOfAccount;
        }
        if (this.customer) {
            data.criteria.customer = this.customer;
        }
        if (this.amountCondition && (this.amount || (this.upperLimit && this.lowerLimit))) {
            data.criteria['amount'] = {
                "condition": this.amountCondition,
                "value": this.amountCondition == 'between' ? this.getSortedAmount() : this.amount
            };
        }
        if (this.dateCondition && (this.date || (this.beginDate && this.endDate))) {
            data.criteria['date'] = {
                "condition": this.dateCondition,
                "value": this.dateCondition == 'between' ? [this.beginDate, this.endDate] : this.date
            };
        }
        if (this.textCondition && this.text) {
            data.criteria['text'] = {
                "condition": this.textCondition,
                "value": this.text
            };
        }
        sessionStorage.setItem("searchcriteria", JSON.stringify(data));
        this.getSearchResults(data);
    };
    SearchComponent.prototype.getSearchResults = function (data) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.doSearch(data, this.companyId)
            .subscribe(function (results) {
            _this.showtable = true;
            _this.addSearchState(data);
            _this.titleService.setPageTitle("Search Results");
            _this.buildResultsTableData(results);
        }, function (error) {
            _this.showtable = true;
            _this.loadingService.triggerLoadingEvent(false);
            console.log(error);
        });
    };
    SearchComponent.prototype.addSearchState = function (data) {
        this.stateService.addState(new State_1.State('search_results', this._router.url, data, null));
    };
    SearchComponent.prototype.handleAction = function ($event) {
        var link = [];
        if ($event.action == 'edit') {
            if ($event.type == 'Bill') {
                link = ['payments/bill', this.companyId, $event.id, 'entry'];
            }
            else if ($event.type == 'Deposit') {
                link = ['deposit', $event.id];
            }
            else if ($event.type == 'Expense') {
                link = ['expense', $event.id];
            }
            else if ($event.type == 'Journal') {
                link = ['journalEntry', $event.id];
            }
            else if ($event.type == 'Credit') {
                link = ['payments/credit', this.companyId, $event.id];
            }
            else if ($event.type == 'Payments') {
                link = ['payments', $event.id];
            }
            else if ($event.type == 'Invoice') {
                link = ['invoices/edit', $event.id];
            }
        }
        this._router.navigate(link);
    };
    SearchComponent.prototype.buildResultsTableData = function (searchResults) {
        var base = this;
        this.hasSearchResults = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 10;
        this.tableData.columns = [
            { "name": "type", "title": "Type" },
            { "name": "title", "title": "Title" },
            { "name": "amount", "title": "Amount" },
            { "name": "date", "title": "Date" },
            { "name": "id", "title": "Id", "visible": false, "filterable": false },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        _.each(searchResults, function (result) {
            var row = {};
            var currency = result.currency ? result.currency : 'USD';
            _.each(Object.keys(result), function (key) {
                if (key == 'bill_amount' || key == 'amount') {
                    var amount = parseFloat(result[key]);
                    row['amount'] = amount.toLocaleString('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                else if (key == 'type') {
                    row['type'] = result[key] ? (result[key].charAt(0).toUpperCase() + result[key].slice(1)) : '';
                }
                else if (key == 'bill_date' || key == 'invoice_date' || key.toLowerCase() == 'date') {
                    row['date'] = result[key];
                }
                else if (key == 'title' || key.toLowerCase() == 'name' || key.toLowerCase() == 'number') {
                    row['title'] = result[key];
                }
                else {
                    row[key] = result[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
        this.loadingService.triggerLoadingEvent(false);
        setTimeout(function () {
            base.hasSearchResults = true;
        });
    };
    return SearchComponent;
}());
SearchComponent = __decorate([
    core_1.Component({
        selector: 'search-widget',
        templateUrl: '/app/views/search.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, ChartOfAccounts_service_1.ChartOfAccountsService, Companies_service_1.CompaniesService,
        Customers_service_1.CustomersService, LoadingService_1.LoadingService,
        Toast_service_1.ToastService, PageTitle_1.pageTitleService, SwitchBoard_1.SwitchBoard, StateService_1.StateService])
], SearchComponent);
exports.SearchComponent = SearchComponent;
