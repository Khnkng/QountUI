/**
 * Created by venkatkollikonda on 11/06/17.
 */
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
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var CurrentCompanyComponent = (function () {
    function CurrentCompanyComponent(_router, _route, toastService, switchBoard, loadingService) {
        var _this = this;
        this._router = _router;
        this._route = _route;
        this.toastService = toastService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.currentCompany = {};
        this.displayCurrency = 'USD';
        this.currentCompanyName = '';
        this.switchCompany = function () {
            var link = ['/switchCompany'];
            this._router.navigate(link);
        };
        this.loadingService.triggerLoadingEvent(true);
        this.currentCompanyId = Session_1.Session.getCurrentCompany();
        this.currentCompanyName = Session_1.Session.getCurrentCompanyName();
        this.switchBoard.onCompanyUpdate.subscribe(function (company) {
            _this.currentCompanyName = Session_1.Session.getCurrentCompanyName();
            _this.currentCompanyId = Session_1.Session.getCurrentCompany();
        });
        this.switchBoard.onSwitchCompany.subscribe(function (company) {
            _this.currentCompanyName = Session_1.Session.getCurrentCompanyName();
        });
        this.loadingService.triggerLoadingEvent(false);
    }
    return CurrentCompanyComponent;
}());
CurrentCompanyComponent = __decorate([
    core_1.Component({
        selector: 'current-company',
        templateUrl: '/app/views/currentCompany.html',
    }),
    __metadata("design:paramtypes", [router_1.Router, router_1.ActivatedRoute, Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard,
        LoadingService_1.LoadingService])
], CurrentCompanyComponent);
exports.CurrentCompanyComponent = CurrentCompanyComponent;
