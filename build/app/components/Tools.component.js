/**
 * Created by seshu on 27-02-2016.
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
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Badge_service_1 = require("qCommon/app/services/Badge.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var ToolsComponent = (function () {
    function ToolsComponent(switchBoard, _router, badgeService, titleService) {
        this.switchBoard = switchBoard;
        this._router = _router;
        this.badgeService = badgeService;
        this.titleService = titleService;
        this.companyCount = 0;
        this.vendorCount = 0;
        this.taxesCount = 0;
        this.rulesCount = 0;
        this.modulesCount = 0;
        this.customerCount = 0;
        this.employeeCount = 0;
        this.itemCount = 0;
        this.coaCount = 0;
        this.expenseCodeCount = 0;
        this.billCount = 0;
        this.dimensionCount = 0;
        this.usersCount = 0;
        this.accountsCount = 0;
        this.ruleCount = 0;
        this.employeesCount = 0;
        this.titleService.setPageTitle("TOOLS");
        var currentCompany = Session_1.Session.getCurrentCompany();
        if (currentCompany) {
            this.refreshCompany({ id: currentCompany });
        }
    }
    ToolsComponent.prototype.refreshCompany = function (company) {
        var _this = this;
        this.badgeService.getToolsBadgeCount(company.id).subscribe(function (badges) {
            _this.coaCount = badges.chartOfAccounts;
            _this.companyCount = badges.companies;
            _this.customerCount = badges.customers;
            _this.expenseCodeCount = badges.expenseCodes;
            _this.itemCount = badges.itemCodes;
            _this.vendorCount = badges.vendors;
            _this.taxesCount = badges.taxesCount;
            _this.rulesCount = badges.rulesCount;
            _this.modulesCount = badges.modulesCount;
            _this.usersCount = badges.companyUsers;
            _this.dimensionCount = badges.dimensions;
            _this.accountsCount = badges.accounts;
        }, function (error) { return _this.handleError(error); });
    };
    ToolsComponent.prototype.handleError = function (error) {
    };
    ToolsComponent.prototype.showPage = function (page, $event) {
        $event && $event.stopImmediatePropagation();
        switch (page) {
            case 'companies':
                {
                    var link = ['companies'];
                    this._router.navigate(link);
                }
                break;
            case 'vendors':
                {
                    var link = ['vendors'];
                    this._router.navigate(link);
                }
                break;
            case 'chartofaccounts':
                {
                    var link = ['chartOfAccounts'];
                    this._router.navigate(link);
                }
                break;
            case 'dimensions':
                {
                    var link = ['dimensions'];
                    this._router.navigate(link);
                }
                break;
            case 'accounts':
                {
                    var link = ['financialAccounts'];
                    this._router.navigate(link);
                }
                break;
            case 'reports':
                {
                    var link = ['reports/dashboard'];
                    this._router.navigate(link);
                }
                break;
            case 'workflow':
                {
                    var link = ['payments/workflow'];
                    this._router.navigate(link);
                }
                break;
            case 'invoice_settings':
                {
                    var link = ['invoices/invoiceSettings'];
                    this._router.navigate(link);
                }
                break;
            case 'items':
                {
                    var link = ['itemCodes'];
                    this._router.navigate(link);
                }
                break;
            case 'expensecode':
                {
                    var link = ['expensecode'];
                    this._router.navigate(link);
                }
                break;
            case 'customers':
                {
                    var link = ['customers'];
                    this._router.navigate(link);
                }
                break;
            case 'users':
                {
                    var link = ['users'];
                    this._router.navigate(link);
                }
                break;
            case 'taxes':
                {
                    var link = ['taxes'];
                    this._router.navigate(link);
                }
                break;
            case 'modules':
                {
                    var link = ['modules'];
                    this._router.navigate(link);
                }
                break;
            case 'rules':
                {
                    var link = ['rules'];
                    this._router.navigate(link);
                }
                break;
            case 'employees':
                {
                    var link = ['employees'];
                    this._router.navigate(link);
                }
                break;
            case 'documents':
                {
                    var link = ['documents', 'receipts'];
                    this._router.navigate(link);
                }
                break;
            case 'budget':
                {
                    var link = ['budget'];
                    this._router.navigate(link);
                }
                break;
            case 'lock':
                {
                    var link = ['lock'];
                    this._router.navigate(link);
                }
                break;
            case 'plans': {
                var link = ['plans'];
                this._router.navigate(link);
            }
        }
    };
    return ToolsComponent;
}());
ToolsComponent = __decorate([
    core_1.Component({
        selector: 'tools',
        templateUrl: '/app/views/tools.html'
    }),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard, router_1.Router, Badge_service_1.BadgeService, PageTitle_1.pageTitleService])
], ToolsComponent);
exports.ToolsComponent = ToolsComponent;
