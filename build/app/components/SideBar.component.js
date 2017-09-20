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
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var StateService_1 = require("qCommon/app/services/StateService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SideBarComponent = (function () {
    function SideBarComponent(switchBoard, _router, stateService, titleService) {
        this.switchBoard = switchBoard;
        this._router = _router;
        this.stateService = stateService;
        this.titleService = titleService;
        this.isDashboard = true;
        this.isBooks = false;
        this.isInvoice = false;
        this.isPayments = false;
        this.isExpenses = false;
        this.report = false;
        this.isPayrol = false;
        this.isTaxes = false;
        this.isTools = false;
        this.isReports = false;
        this.currentBoardName = null;
        this.showSwitchCompany = false;
        console.info('QountApp sidebar Component Mounted Successfully7');
        this._router.events.subscribe(function (event) {
            if (event.url == '/dashboard') {
                //this.showPage(PAGES.DASHBOARD,'');
            }
        });
    }
    SideBarComponent.prototype.logout = function () {
        console.log("into logout1");
        Session_1.Session.destroy();
        this.switchBoard.onLogOut.next({ 'loggedOut': true });
    };
    SideBarComponent.prototype.showPage = function (page, $event) {
        $event && $event.stopImmediatePropagation();
        this.isDashboard = false;
        this.isBooks = false;
        this.isInvoice = false;
        this.isExpenses = false;
        this.isReports = false;
        this.isTaxes = false;
        this.isTools = false;
        this.isPayments = false;
        this.stateService.clearAllStates();
        var base = this;
        switch (page) {
            case Qount_constants_1.PAGES.DASHBOARD:
                {
                    var link = ['dashboard'];
                    this._router.navigate(link);
                    base.isDashboard = true;
                }
                break;
            case Qount_constants_1.PAGES.BOOKS:
                {
                    var link = ['books', 'dashboard'];
                    this._router.navigate(link);
                    base.isBooks = true;
                }
                break;
            case Qount_constants_1.PAGES.INVOICES:
                {
                    var link = ['invoices/dashboard', 0];
                    this._router.navigate(link);
                    base.isInvoice = true;
                }
                break;
            case Qount_constants_1.PAGES.REPORT:
                {
                    var link = ['reports/dashboard'];
                    this._router.navigate(link);
                    base.isReports = true;
                }
                break;
            case Qount_constants_1.PAGES.TAX:
                {
                    var link = ['tax'];
                    this._router.navigate(link);
                    base.isTaxes = true;
                }
                break;
            case Qount_constants_1.PAGES.TOOLS:
                {
                    var link = ['tools'];
                    this._router.navigate(link);
                    base.isTools = true;
                }
                break;
            case Qount_constants_1.PAGES.PAYMENTS:
                {
                    var link = ['payments/dashboard', 'dashboard'];
                    this._router.navigate(link);
                    base.isPayments = true;
                }
                break;
        }
    };
    SideBarComponent.prototype.toggleMenu = function () {
        this.isExpanded = false;
        this.switchBoard.onSideBarExpand.next(this.isExpanded);
    };
    SideBarComponent.prototype.showError = function (err) {
    };
    return SideBarComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], SideBarComponent.prototype, "isExpanded", void 0);
SideBarComponent = __decorate([
    core_1.Component({
        selector: 'side-bar',
        templateUrl: '/app/views/sideBar.html'
    }),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard, router_1.Router, StateService_1.StateService, PageTitle_1.pageTitleService])
], SideBarComponent);
exports.SideBarComponent = SideBarComponent;
