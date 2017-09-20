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
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Session_1 = require("qCommon/app/services/Session");
var SearchResultsComponent = (function () {
    function SearchResultsComponent(_router, companyService, toastService, loadingService) {
        var _this = this;
        this._router = _router;
        this.companyService = companyService;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.results = [];
        this.hasResults = false;
        this.tableData = {};
        this.tableOptions = {};
        this.companyId = Session_1.Session.getCurrentCompany();
        var searchCriteria = sessionStorage.getItem("searchcriteria");
        if (searchCriteria) {
            this.loadingService.triggerLoadingEvent(true);
            searchCriteria = JSON.parse(searchCriteria);
            this.companyService.doSearch(searchCriteria, this.companyId)
                .subscribe(function (searchResults) {
                _this.results = []; //searchResults;
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, 'Could not perform search.');
            });
        }
    }
    SearchResultsComponent.prototype.ngOnInit = function () {
    };
    SearchResultsComponent.prototype.ngOnDestroy = function () {
    };
    SearchResultsComponent.prototype.redirectPage = function (data) {
        var link = [];
        if (data.type == 'bill') {
            link = ['payments/bill', this.companyId, data.id, 'enter'];
        }
        else if (data.type == 'expense') {
            link = ['/expense', data.id];
        }
        else if (data.type == 'deposit') {
            link = ['/deposit', data.id];
        }
        else if (data.type == 'journal') {
            link = ['journalEntry', data.id, 'enter'];
        }
        else if (data.type == 'payment') {
            link = ['/payments', data.id];
        }
        this._router.navigate(link);
    };
    SearchResultsComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.redirectPage($event);
        }
    };
    SearchResultsComponent.prototype.buildResultsTableData = function () {
        var base = this;
        this.loadingService.triggerLoadingEvent(false);
        this.hasResults = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 15;
        this.tableData.columns = [
            { "name": "type", "title": "Type" },
            { "name": "name", "title": "Name/Number" },
            { "name": "amount", "title": "Amount" },
            { "name": "id", "title": "Id", "visible": false },
            { "name": "actions", "title": "Actions", "type": "html" }
        ];
        this.results.forEach(function (result) {
            var row = {};
            _.each(Object.keys(result), function (key) {
                row[key] = result[key];
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasResults = true;
        }, 0);
    };
    SearchResultsComponent.prototype.goToPreviousPage = function () {
        var link = [Session_1.Session.getLastVisitedUrl()];
        this._router.navigate(link);
    };
    return SearchResultsComponent;
}());
SearchResultsComponent = __decorate([
    core_1.Component({
        selector: 'search-results',
        templateUrl: '/app/views/searchResults.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Companies_service_1.CompaniesService, Toast_service_1.ToastService,
        LoadingService_1.LoadingService])
], SearchResultsComponent);
exports.SearchResultsComponent = SearchResultsComponent;
