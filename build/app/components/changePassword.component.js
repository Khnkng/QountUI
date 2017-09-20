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
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var CompanyUsers_service_1 = require("qCommon/app/services/CompanyUsers.service");
var ChangePasswordComponent = (function () {
    function ChangePasswordComponent(_router, _toastService, loadingService, CompanyUsersService) {
        this._router = _router;
        this._toastService = _toastService;
        this.loadingService = loadingService;
        this.CompanyUsersService = CompanyUsersService;
        this.notValid = false;
    }
    ChangePasswordComponent.prototype.ngOnDestroy = function () {
    };
    ChangePasswordComponent.prototype.handleError = function (err) {
    };
    ChangePasswordComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        if (this.checkPasswordsMatch()) {
            var data = {
                "action": "change",
                "password": this.password
            };
            this.CompanyUsersService.updatePassword(data).subscribe(function (res) {
                if (res) {
                    var defaultCompany = Session_1.Session.getUser().default_company;
                    if (!_.isEmpty(defaultCompany) && (defaultCompany.roles.indexOf('Owner') != -1 || defaultCompany.roles.indexOf('Yoda') != -1)) {
                        if (defaultCompany.tcAccepted) {
                            _this._router.navigate(['']);
                        }
                        else {
                            _this._router.navigate(['termsAndConditions']);
                        }
                    }
                    else {
                        _this._router.navigate(['']);
                    }
                }
            }, function (error) {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to update password");
            });
        }
    };
    ChangePasswordComponent.prototype.checkPasswordsMatch = function () {
        if (this.password === this.confirmPassword) {
            this.notValid = false;
            return true;
        }
        else {
            this.notValid = true;
            return false;
        }
    };
    return ChangePasswordComponent;
}());
ChangePasswordComponent = __decorate([
    core_1.Component({
        selector: 'activate',
        templateUrl: '/app/views/changePassword.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Toast_service_1.ToastService,
        LoadingService_1.LoadingService, CompanyUsers_service_1.CompanyUsers])
], ChangePasswordComponent);
exports.ChangePasswordComponent = ChangePasswordComponent;
