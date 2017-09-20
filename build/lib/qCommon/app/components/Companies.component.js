/**
 * Created by seshu on 15-07-2016.
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
var common_1 = require("@angular/common");
var Qount_constants_1 = require("../constants/Qount.constants");
var Toast_service_1 = require("../services/Toast.service");
var Companies_service_1 = require("../services/Companies.service");
var router_1 = require("@angular/router");
var SwitchBoard_1 = require("../services/SwitchBoard");
var LoadingService_1 = require("../services/LoadingService");
var Session_1 = require("../services/Session");
var PageTitle_1 = require("../services/PageTitle");
var CompaniesComponent = (function () {
    function CompaniesComponent(companyService, _router, cp, _toastService, switchBoard, loadingService, titleService) {
        var _this = this;
        this.companyService = companyService;
        this._router = _router;
        this.cp = cp;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.titleService = titleService;
        this.type = "component";
        this.tableData = {};
        this.tableOptions = {};
        this.displayCurrency = 'USD';
        this.verifiedComapnies = [];
        this.isAdmin = false;
        this.titleService.setPageTitle("Companies");
        this.loadingService.triggerLoadingEvent(true);
        this.isAdmin = Session_1.Session.getUser().isAdmin || false;
        this.companyService.companies()
            .subscribe(function (companies) {
            _this.buildTableData(companies);
        }, function (error) { return _this.handleError(error); });
    }
    CompaniesComponent.prototype.buildTableData = function (companies) {
        this.titleService.setPageTitle("COMPANIES");
        this.companies = companies;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "id", "title": "ID", "visible": false, "filterable": false },
            { "name": "name", "title": "Name" },
            { "name": "einNumber", "title": "EIN" },
            { "name": "companyType", "title": "Type" },
            { "name": "owner", "title": "Owner" },
            { "name": "accountManager", "title": "Account Manager" },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        this.tableData.rows = [];
        var base = this;
        this.companies.forEach(function (company) {
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
            row.owner = company.owners ? company.owners.toString().split(',').join('<br/>') : '';
            row.einNumber = company.einNumber;
            row.companyType = company.companyType;
            row.accountManager = company.accountManagers ? company.accountManagers.toString().split(',').join('<br/>') : '';
            // row['status'] = "<a class='button tiny' style='margin: 0 0 0 0;' data-action='verify'>Verify</a>";
            if (company.roles.indexOf('Owner') != -1 || company.roles.indexOf('Account Manager') != -1) {
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            else {
                row['actions'] = "";
            }
            base.tableData.rows.push(row);
        });
        this.hasCompanyList = true;
        this.loadingService.triggerLoadingEvent(false);
    };
    CompaniesComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showCompany($event);
        }
        else if (action == 'delete') {
            this.removeCompany($event);
        }
        else if (action == 'verify') {
            this.verifiedComapnies.push($event.name);
        }
    };
    CompaniesComponent.prototype.isCompanyVerified = function (company) {
        return true;
    };
    CompaniesComponent.prototype.showCompany = function (_company) {
        this.titleService.setPageTitle("UPDATE COMPANY");
        var company = _.find(this.companies, function (comp) {
            return comp.name == _company.name;
        });
        var link = ['/company', company.id];
        this._router.navigate(link);
    };
    CompaniesComponent.prototype.removeCompany = function (row) {
        var _this = this;
        var company = row;
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.removeCompany(company.id)
            .subscribe(function (success) {
            _this.switchBoard.onCompanyAddOrDelete.next();
            _this.loadingService.triggerLoadingEvent(false);
            _.remove(_this.companies, function (_company) {
                return company.id == _company.id;
            });
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Company deleted successfully");
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            if (error)
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, JSON.parse(error).message);
            else
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Fail to delete company");
        });
    };
    CompaniesComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    return CompaniesComponent;
}());
CompaniesComponent = __decorate([
    core_1.Component({
        selector: 'companies',
        templateUrl: '/app/views/companies.html'
    }),
    __metadata("design:paramtypes", [Companies_service_1.CompaniesService, router_1.Router, common_1.CurrencyPipe,
        Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard, LoadingService_1.LoadingService, PageTitle_1.pageTitleService])
], CompaniesComponent);
exports.CompaniesComponent = CompaniesComponent;
