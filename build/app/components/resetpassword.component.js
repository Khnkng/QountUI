/**
 * Created by Nazia on 20-12-2016.
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
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Login_service_1 = require("qCommon/app/services/Login.service");
var router_1 = require("@angular/router");
var ResetPasswordComponent = (function () {
    function ResetPasswordComponent(_router, _toastService, _route, loginService) {
        var _this = this;
        this._router = _router;
        this._toastService = _toastService;
        this._route = _route;
        this.loginService = loginService;
        this.notValid = false;
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.token = params['token'];
        });
    }
    ResetPasswordComponent.prototype.ngOnDestroy = function () {
    };
    ResetPasswordComponent.prototype.handleError = function (err) {
    };
    ResetPasswordComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        if (this.checkPasswordsMatch()) {
            var data = {
                "action": "reset",
                "password": this.password,
                "token": this.token
            };
            this.loginService.resetPassword(data).subscribe(function (res) {
                if (res) {
                    _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Password reset was successful");
                    _this._router.navigate(['login']);
                }
            }, function (error) {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to reset password");
            });
        }
    };
    ResetPasswordComponent.prototype.checkPasswordsMatch = function () {
        if (this.password === this.confirmPassword) {
            this.notValid = false;
            return true;
        }
        else {
            this.notValid = true;
            return false;
        }
    };
    return ResetPasswordComponent;
}());
ResetPasswordComponent = __decorate([
    core_1.Component({
        selector: 'reset-password',
        templateUrl: '/app/views/resetpassword.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Toast_service_1.ToastService, router_1.ActivatedRoute,
        Login_service_1.LoginService])
], ResetPasswordComponent);
exports.ResetPasswordComponent = ResetPasswordComponent;
