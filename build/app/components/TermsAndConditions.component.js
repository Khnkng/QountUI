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
var CompanyUsers_service_1 = require("qCommon/app/services/CompanyUsers.service");
var TermsAndConditionsComponent = (function () {
    function TermsAndConditionsComponent(_router, switchBoard, companyUsersService) {
        this._router = _router;
        this.switchBoard = switchBoard;
        this.companyUsersService = companyUsersService;
        console.log("Terms and conditions component initialized...");
    }
    TermsAndConditionsComponent.prototype.accept = function () {
        var _this = this;
        this.switchBoard.onLogin.next(Session_1.Session.get('user'));
        this.companyUsersService.acceptTerms(Session_1.Session.getUser().default_company.id)
            .subscribe(function (resp) {
            _this._router.navigate(['']);
        }, function (error) {
        });
    };
    TermsAndConditionsComponent.prototype.decline = function () {
        Session_1.Session.destroy();
        this.switchBoard.onLogOut.next({ 'loggedOut': true });
    };
    return TermsAndConditionsComponent;
}());
TermsAndConditionsComponent = __decorate([
    core_1.Component({
        'selector': 'terms-conditions',
        'templateUrl': '/app/views/TermsAndConditions.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, SwitchBoard_1.SwitchBoard, CompanyUsers_service_1.CompanyUsers])
], TermsAndConditionsComponent);
exports.TermsAndConditionsComponent = TermsAndConditionsComponent;
