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
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var Session_1 = require("qCommon/app/services/Session");
var State_1 = require("qCommon/app/models/State");
var StateService_1 = require("qCommon/app/services/StateService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var ReportsComponent = (function () {
    function ReportsComponent(_router, stateService, titleService) {
        this._router = _router;
        this.stateService = stateService;
        this.titleService = titleService;
        this.activeTab = "businessOverview";
        this.titleService.setPageTitle("Reports");
        var reports = ["aging", "agingDetail", "paymentHistory", "vendorSummary", "vendorBalance", "vendorExpenses", "gainloss",
            "paymentRegister", "tb", "incomeStatement", "balanceSheet", "incomeDetailStatement", "detailedBalanceSheet", "cashFlowStatement"];
        _.each(reports, function (report) {
            Session_1.Session.clearReportCriteria(report);
            Session_1.Session.clearReportData(report + '-data');
        });
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this.setActiveTab(prevState.selectedId);
        }
        this.stateService.clearAllStates();
    }
    ReportsComponent.prototype.handleError = function (error) {
    };
    ReportsComponent.prototype.goToReport = function (type) {
        var link = ['Report', { type: type }];
        this._router.navigate(link);
    };
    ReportsComponent.prototype.goToReports = function (name) {
        this.stateService.addState(new State_1.State('REPORTS_HOME', this._router.url, null, this.activeTab));
        var link = [name];
        this._router.navigate(link);
    };
    ReportsComponent.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    ReportsComponent.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        //this.titleService.setPageTitle(tab);
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    ReportsComponent.prototype.resetSelection = function () {
        jQuery("#a-businessOverview").attr("aria-selected", "false");
        jQuery("#a-accountant").attr("aria-selected", "flase");
        jQuery("#a-payments").attr("aria-selected", "flase");
        jQuery("#a-management").attr("aria-selected", "false");
    };
    return ReportsComponent;
}());
ReportsComponent = __decorate([
    core_1.Component({
        selector: 'reports',
        templateUrl: '/app/views/reports.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, StateService_1.StateService, PageTitle_1.pageTitleService])
], ReportsComponent);
exports.ReportsComponent = ReportsComponent;
