/**
 * Created by seshu on 03-03-2016.
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
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Login_service_1 = require("qCommon/app/services/Login.service");
var Login_form_1 = require("../forms/Login.form");
var ForgotPassword_form_1 = require("../forms/ForgotPassword.form");
var Session_1 = require("qCommon/app/services/Session");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var LogInComponent = (function () {
    function LogInComponent(fb, _router, switchBoard, loginService, _loginForm, loadingService, _forgotPasswordForm, _route, _toastService, companyService, numeralService) {
        var _this = this;
        this._router = _router;
        this.switchBoard = switchBoard;
        this.loginService = loginService;
        this._loginForm = _loginForm;
        this.loadingService = loadingService;
        this._forgotPasswordForm = _forgotPasswordForm;
        this._route = _route;
        this._toastService = _toastService;
        this.companyService = companyService;
        this.numeralService = numeralService;
        this.status = null;
        this.showLoginPage = true;
        this.forgotPwdStatus = false;
        this.resetPasswordHidden = true;
        // Reset the form with a new hero AND restore 'pristine' class state
        // by toggling 'active' flag which causes the form
        // to be removed/re-added in a tick via NgIf
        // TODO: Workaround until NgForm has a reset method (#6822)
        this.active = true;
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.resetPasswordToken = params['resetPasswordToken'];
        });
        this.loginForm = fb.group(_loginForm.getForm());
        this.forgotPasswordForm = fb.group(_forgotPasswordForm.getForm());
    }
    LogInComponent.prototype.submit = function ($event) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        $event && $event.preventDefault();
        var data = this._loginForm.getData(this.loginForm);
        data["username"] = data.id;
        this.loginService.login(data)
            .subscribe(function (success) { _this.showMessage(true, success); }, function (error) { return _this.showMessage(false, error); });
    };
    LogInComponent.prototype.showMessage = function (status, obj) {
        if (status) {
            Session_1.Session.create(obj.user, obj.token);
            Session_1.Session.setLockDate(obj.user['default_company']['lock_date']);
            Session_1.Session.setTTL(obj['ttl'] * 1000);
            Session_1.Session.setRefreshToken(obj['refreshToken']);
            this.refreshToken();
            if (obj.user.default_company && obj.user.default_company.roles && !obj.user.default_company.roles.includes('Vendor')) {
                this.fetchCompanies(obj.user);
            }
            else {
                this.showLoginError();
            }
        }
        else {
            this.showLoginError(obj);
            this.loadingService.triggerLoadingEvent(false);
        }
    };
    LogInComponent.prototype.refreshToken = function () {
        var base = this;
        var interval = setInterval(function () {
            var data = {
                token: Session_1.Session.getToken(),
                refreshToken: Session_1.Session.getRefreshToken(),
                ttl: Number(Session_1.Session.getTTL()) / 1000
            };
            base.loginService.refreshToken(data).subscribe(function (data) { base.updateToken(data); }, function (error) { });
        }, 55 * 60 * 1000);
        Session_1.Session.setTimer(interval);
    };
    LogInComponent.prototype.updateToken = function (data) {
        Session_1.Session.removeToken();
        Session_1.Session.setToken(data.token);
        Session_1.Session.setRefreshToken(data.refreshToken);
        Session_1.Session.setTTL(data.ttl);
    };
    LogInComponent.prototype.showLoginError = function (obj) {
        this.status = {};
        this.status['error'] = true;
        this.message = obj ? obj : 'Username or password incorrect';
        this.loadingService.triggerLoadingEvent(false);
    };
    LogInComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    LogInComponent.prototype.setComapnies = function (companies) {
        var user = Session_1.Session.getUser();
        if (companies.length > 0) {
            var defaultCompany = user.default_company;
            if (!_.isEmpty(defaultCompany)) {
                Session_1.Session.setCurrentCompany(defaultCompany.id);
                Session_1.Session.setCurrentCompanyName(defaultCompany.name);
                Session_1.Session.setCurrentCompanyCurrency(defaultCompany.defaultCurrency);
                if (defaultCompany.defaultCurrency) {
                    this.numeralService.switchLocale(defaultCompany.defaultCurrency);
                }
                else {
                    this.numeralService.switchLocale("USD");
                }
                Session_1.Session.setFiscalStartDate(defaultCompany.fiscalStartDate ? defaultCompany.fiscalStartDate : "");
            }
        }
        else {
            if (user.isAdmin) {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.warning, "No companies added yet. Please add a company to start.");
                this._router.navigate(['addCompany']);
            }
            else {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.warning, "No companies found. Please contact admin to create companies.");
            }
        }
        this.gotoDefaultPage();
    };
    LogInComponent.prototype.fetchCompanies = function (user) {
        var base = this;
        setTimeout(function () {
            base.companyService.companies().subscribe(function (companies) { return base.setComapnies(companies); }, function (error) { return base.handleError(error); });
        }, 200);
    };
    LogInComponent.prototype.newLogin = function () {
        var _this = this;
        this.active = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    LogInComponent.prototype.gotoDefaultPage = function () {
        var link = 'dashboard';
        if (Session_1.Session.get('user').tempPassword) {
            link = 'activate';
        }
        else {
            var defaultCompany = Session_1.Session.getUser().default_company;
            if (!_.isEmpty(defaultCompany) && (defaultCompany.roles.indexOf('Owner') != -1 || defaultCompany.roles.indexOf('Yoda') != -1)) {
                if (!defaultCompany.tcAccepted) {
                    link = 'termsAndConditions';
                }
            }
        }
        if (link == 'dashboard') {
            this.switchBoard.onLogin.next(Session_1.Session.get('user'));
        }
        this._router.navigate([link]);
        this.loadingService.triggerLoadingEvent(false);
    };
    LogInComponent.prototype.changePassword = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._forgotPasswordForm.getData(this.forgotPasswordForm);
        data["activationLink"] = Qount_constants_1.PATH.ACTIVATION_LINK;
        data["username"] = data.id;
        this.loginService.forgotPassword(data).subscribe(function (success) { return _this.handleForgotPassword(true, success); }, function (error) { return _this.handleForgotPassword(false, error); });
    };
    LogInComponent.prototype.handleForgotPassword = function (status, obj) {
        if (status) {
            this.forgotPwdStatus = true;
            this.fpStatus = {};
            this.fpStatus['success'] = true;
            this.fpMessage = "Password reset successful";
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, obj._body);
            this.showLoginPage = true;
            var link = ['Login'];
            this._router.navigate(link);
        }
        else {
            this.forgotPwdStatus = true;
            this.fpStatus = {};
            this.fpStatus['error'] = true;
            this.fpMessage = obj;
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, obj);
        }
    };
    LogInComponent.prototype.checkForgotPasswordValidity = function () {
        if (!this.forgotPasswordForm.valid) {
            return false;
        }
        return true;
    };
    LogInComponent.prototype.checkValidity = function () {
        if (!this.loginForm.valid) {
            return false;
        }
        return true;
    };
    LogInComponent.prototype.ngOnInit = function () {
    };
    LogInComponent.prototype.resetPassword = function () {
        var _this = this;
        var resetPassword = jQuery("#resetPassword").val();
        var resetPasswordConfirmation = jQuery("#resetPasswordConfirmation").val();
        if (!resetPassword && !resetPasswordConfirmation) {
            this.forgotPwdStatus = true;
            this.fpStatus = {};
            this.fpStatus['error'] = true;
            this.fpMessage = 'please enter passwords';
        }
        else if (resetPassword != resetPasswordConfirmation) {
            this.forgotPwdStatus = true;
            this.fpStatus = {};
            this.fpStatus['error'] = true;
            this.fpMessage = 'passwords donot match';
        }
        else {
            var data = {};
            data['password'] = resetPassword;
            data['token'] = this.resetPasswordToken;
            this.loginService.resetPassword(data).subscribe(function (success) { return _this.handleForgotPassword(true, success); }, function (error) { return _this.handleForgotPassword(false, error); });
        }
    };
    LogInComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
    };
    return LogInComponent;
}());
LogInComponent = __decorate([
    core_1.Component({
        selector: 'qount-login',
        templateUrl: '/app/views/login.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.Router, SwitchBoard_1.SwitchBoard, Login_service_1.LoginService, Login_form_1.LoginForm, LoadingService_1.LoadingService,
        ForgotPassword_form_1.ForgotPassword, router_1.ActivatedRoute, Toast_service_1.ToastService, Companies_service_1.CompaniesService,
        Numeral_service_1.NumeralService])
], LogInComponent);
exports.LogInComponent = LogInComponent;
