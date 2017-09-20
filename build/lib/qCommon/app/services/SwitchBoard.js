/**
 * Created by seshu on 11-03-2016.
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
var Subject_1 = require("rxjs/Subject");
var core_1 = require("@angular/core");
var SwitchBoard = (function () {
    function SwitchBoard() {
        this.onLogin = new Subject_1.Subject();
        this.onLogOut = new Subject_1.Subject();
        this.onSideMenuResize = new Subject_1.Subject();
        this.onNewAlert = new Subject_1.Subject();
        this.onNewComment = new Subject_1.Subject();
        this.onNewNotification = new Subject_1.Subject();
        this.onNewQountNotification = new Subject_1.Subject();
        this.onNewToast = new Subject_1.Subject();
        this.onNotificationCountUpdate = new Subject_1.Subject();
        this.onSideBarExpand = new Subject_1.Subject();
        this.onSubmitReport = new Subject_1.Subject();
        this.onToastConfirm = new Subject_1.Subject();
        this.onFetchCompanies = new Subject_1.Subject();
        this.onPrintWindowClose = new Subject_1.Subject();
        this.onNotificationMarkRead = new Subject_1.Subject();
        this.onCompanyUpdate = new Subject_1.Subject();
        this.onSwitchCompany = new Subject_1.Subject();
        this.onOffCanvasMenuExpand = new Subject_1.Subject();
        this.onCompanyAddOrDelete = new Subject_1.Subject();
        this.onYodleeTokenRecived = new Subject_1.Subject();
        this.onLoadingWheel = new Subject_1.Subject();
        this.onPageChange = new Subject_1.Subject();
        this.onClickPrev = new Subject_1.Subject();
    }
    return SwitchBoard;
}());
SwitchBoard = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], SwitchBoard);
exports.SwitchBoard = SwitchBoard;
