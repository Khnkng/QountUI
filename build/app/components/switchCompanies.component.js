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
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var UserProfile_service_1 = require("qCommon/app/services/UserProfile.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SwitchCompanyComponent = (function () {
    function SwitchCompanyComponent(_router, _route, toastService, switchBoard, companiesService, loadingService, userProfileService, titleService) {
        var _this = this;
        this._router = _router;
        this._route = _route;
        this.toastService = toastService;
        this.switchBoard = switchBoard;
        this.companiesService = companiesService;
        this.loadingService = loadingService;
        this.userProfileService = userProfileService;
        this.titleService = titleService;
        this.currentCompany = {};
        this.tableData = {};
        this.tableOptions = {};
        this.displayCurrency = 'USD';
        this.currentCompanyName = '';
        this.loadingService.triggerLoadingEvent(true);
        this.currentCompanyId = Session_1.Session.getCurrentCompany();
        this.currentCompanyName = Session_1.Session.getCurrentCompanyName();
        this.compSubscription = this.switchBoard.onCompanyAddOrDelete.subscribe(function (msg) { return _this.fetchCompanies(); });
        this.fetchCompanies();
        this.titleService.setPageTitle("Switch Company");
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            var link = ['/dashboard'];
            _this._router.navigate(link);
        });
    }
    SwitchCompanyComponent.prototype.fetchCompanies = function () {
        var _this = this;
        this.companiesService.companies().subscribe(function (companies) {
            _this.allCompanies = companies;
            if (_this.currentCompanyId) {
                _this.currentCompany = _.find(_this.allCompanies, { id: _this.currentCompanyId });
            }
            else if (_this.allCompanies.length > 0) {
                _this.currentCompany = _.find(_this.allCompanies, { id: _this.allCompanies[0].id });
            }
            _this.buildTableData(_this.allCompanies);
        }, function (error) { return _this.handleError(error); });
    };
    SwitchCompanyComponent.prototype.ngAfterViewInit = function () {
    };
    SwitchCompanyComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    SwitchCompanyComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    SwitchCompanyComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'switch-company') {
            this.changeCompany($event);
        }
        else if (action == 'delete') {
        }
        else if (action == 'verify') {
        }
    };
    SwitchCompanyComponent.prototype.buildTableData = function (companies) {
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "id", "title": "ID", "visible": false, "filterable": false },
            { "name": "name", "title": "Name" },
            { "name": "einNumber", "title": "EIN" },
            { "name": "companyType", "title": "Type" },
            { "name": "owner", "title": "Owner" },
            { "name": "accountManager", "title": "Account Manager" },
            { "name": "defaultCurrency", "title": "Currency", "visible": false },
            { "name": "fiscalStartDate", "title": "Fiscal Date", "visible": false },
            { "name": "lockDate", "title": "Lock Date", "visible": false },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        this.tableData.rows = [];
        var base = this;
        companies.forEach(function (company) {
            var row = {};
            var payabels = 0;
            var pastDate = 0;
            if (company.payables) {
                payabels = company.payables;
            }
            if (company.payables) {
                pastDate = company.pastDue;
            }
            row.id = company.id;
            row.name = company.name;
            row.payables = payabels.toLocaleString(base.displayCurrency, { style: 'currency', currency: base.displayCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
            row.pastDue = payabels.toLocaleString(base.displayCurrency, { style: 'currency', currency: base.displayCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
            row.owner = company.owner;
            row.einNumber = company.einNumber;
            row.companyType = company.companyType;
            row.accountManager = company.accountManager;
            row.defaultCurrency = company.defaultCurrency;
            row.lockDate = company.lock_date;
            row.fiscalStartDate = company.fiscalStartDate;
            if (row.id != base.currentCompanyId) {
                row['actions'] = "<a class='action switch-company-label' data-action='switch-company'><span class='label'>Hop</span></a>";
            }
            base.tableData.rows.push(row);
        });
        this.hasCompanyList = false;
        setTimeout(function () {
            base.hasCompanyList = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    SwitchCompanyComponent.prototype.refreshTable = function () {
        var base = this;
        this.buildTableData(this.allCompanies);
        this.hasCompanyList = false;
        setTimeout(function () {
            base.hasCompanyList = true;
        }, 0);
    };
    SwitchCompanyComponent.prototype.setDefaultCompany = function (companyId) {
        var data = {
            "firstName": Session_1.Session.getUser().firstName,
            "lastName": Session_1.Session.getUser().lastName,
            "phoneNumber": Session_1.Session.getUser().phone_number,
            "defaultCompany": companyId
        };
        this.userProfileService.updateUserProfile(data)
            .subscribe(function (test) { return console.log(test); });
    };
    SwitchCompanyComponent.prototype.changeCompany = function (company) {
        Session_1.Session.setCurrentCompany(company.id);
        Session_1.Session.setCurrentCompanyName(company.name);
        Session_1.Session.setFiscalStartDate(company.fiscalStartDate);
        Session_1.Session.setCurrentCompanyCurrency(company.defaultCurrency);
        Session_1.Session.setLockDate(company.lockDate);
        this.switchBoard.onSwitchCompany.next({});
        this.currentCompanyName = company.name;
        this.currentCompanyId = company.id;
        this.currentCompany = company;
        this.refreshTable();
        this.setDefaultCompany(company.id);
        var link = ['/dashboard'];
        this._router.navigate(link);
    };
    return SwitchCompanyComponent;
}());
SwitchCompanyComponent = __decorate([
    core_1.Component({
        selector: 'switch-company',
        templateUrl: '/app/views/switchCompany.html',
    }),
    __metadata("design:paramtypes", [router_1.Router, router_1.ActivatedRoute, Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard,
        Companies_service_1.CompaniesService, LoadingService_1.LoadingService, UserProfile_service_1.UserProfileService, PageTitle_1.pageTitleService])
], SwitchCompanyComponent);
exports.SwitchCompanyComponent = SwitchCompanyComponent;
