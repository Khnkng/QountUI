/**
 * Created by seshu on 15-10-2016.
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
require("rxjs/add/operator/filter");
var Socket_service_1 = require("qCommon/app/services/Socket.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Login_service_1 = require("qCommon/app/services/Login.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var AppComponent = (function () {
    function AppComponent(_switchBoard, _router, route, toastService, socketService, titleService, companyService, loadingService, loginService, _toastService) {
        var _this = this;
        this._router = _router;
        this.route = route;
        this.toastService = toastService;
        this.socketService = socketService;
        this.titleService = titleService;
        this.companyService = companyService;
        this.loadingService = loadingService;
        this.loginService = loginService;
        this._toastService = _toastService;
        this.loginSubscription = null;
        this.logoutSubscription = null;
        this.confirmClass = "";
        this.isOffCanvasMenuExpanded = false;
        this.mainCanvasCss = {
            'main-canvas': true,
            'expanded': false
        };
        this.sMenuCss = {
            'small-2': false,
            'sidebar': true,
            'shrink': true
        };
        this.isOverlay = false;
        this.isLoading = false;
        this.pageTitle = '';
        var self = this;
        var data = this.getCookie("dev");
        if (data) {
            var obj = JSON.parse(data);
            if (obj) {
                Session_1.Session.create(obj.user, obj.token);
                Session_1.Session.setLockDate(obj.user['default_company']['lock_date']);
                Session_1.Session.setTTL(obj['ttl'] * 1000);
                Session_1.Session.setRefreshToken(obj['refreshToken']);
                Session_1.Session.setCurrentCompany(obj.user.defaultCompany);
                Session_1.Session.setCurrentCompanyName(obj.user.default_company.name);
                Session_1.Session.setCurrentCompanyCurrency(obj.user.default_company.defaultCurrency);
                Session_1.Session.setFiscalStartDate(obj.user.default_company.fiscalStartDate ? obj.user.default_company.fiscalStartDate : "");
                this.refreshToken();
                if (obj.user.default_company && obj.user.default_company.roles && !obj.user.default_company.roles.includes('Vendor')) {
                    this.fetchCompanies(obj.user);
                }
            }
        }
        else {
            if (Session_1.Session.hasSession()) {
                this.hasLoggedIn = true;
            }
            else {
                /*let link = ['/login'];
                 this._router.navigate(link);*/
                this.logout();
            }
        }
        window.recivedYodleeToken = function () {
            self.switchBoard.onYodleeTokenRecived.next({});
        };
        this.switchBoard = _switchBoard;
        this.toasts = [];
        this.toastClass = "";
        this.switchBoard.onNewToast.subscribe(function (toast) { return _this.addToast(toast); });
        jQuery('.loading-initial-cont').hide();
        jQuery('.loading-cont').show();
        this.switchBoard.onSideBarExpand.subscribe(function (flag) {
            _this.isSideMenuExpanded = flag;
            _this.togglemenu(flag);
        });
        this.switchBoard.onLoadingWheel.subscribe(function (toggle) { return _this.toggleLoader(toggle); });
        this.switchBoard.onPageChange.subscribe(function (title) { return _this.updatePageTitle(title); });
        this.sub = this.route
            .queryParams
            .subscribe(function (params) {
            _this.queryParams = params;
        });
    }
    AppComponent.prototype.refreshToken = function () {
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
    AppComponent.prototype.getCookie = function (cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
    AppComponent.prototype.updateToken = function (data) {
        Session_1.Session.removeToken();
        Session_1.Session.setToken(data.token);
        Session_1.Session.setRefreshToken(data.refreshToken);
        Session_1.Session.setTTL(data.ttl);
    };
    AppComponent.prototype.fetchCompanies = function (user) {
        var base = this;
        setTimeout(function () {
            base.companyService.companies().subscribe(function (companies) { return base.setComapnies(companies); }, function (error) { return base.handleError(error); });
        }, 200);
    };
    AppComponent.prototype.setComapnies = function (companies) {
        var user = Session_1.Session.getUser();
        if (companies.length > 0) {
            var defaultCompany = user.default_company;
            if (!_.isEmpty(defaultCompany)) {
                /*Session.setCurrentCompany(defaultCompany.id);
                Session.setCurrentCompanyName(defaultCompany.name);
                Session.setCurrentCompanyCurrency(defaultCompany.defaultCurrency);
                Session.setFiscalStartDate(defaultCompany.fiscalStartDate?defaultCompany.fiscalStartDate:"");*/
                if (Session_1.Session.hasSession()) {
                    this.hasLoggedIn = true;
                }
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
    AppComponent.prototype.gotoDefaultPage = function () {
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
    AppComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    AppComponent.prototype.addToast = function (toast) {
        var self = this;
        if (toast.type == Qount_constants_1.TOAST_TYPE.confirm) {
            this.confirmClass = "confirm-bg";
        }
        this.toasts.push(toast);
        setTimeout(function () {
            if (toast.type != Qount_constants_1.TOAST_TYPE.confirm) {
                toast.toastClass += " fadeout";
                setTimeout(function () {
                    self.removeToast(toast.toastId);
                }, 2000);
            }
        }, 3000);
    };
    AppComponent.prototype.removeToast = function (toastId) {
        var self = this;
        var index = _.findIndex(self.toasts, function (t) {
            return t.toastId == toastId;
        });
        self.toasts.splice(index, 1);
    };
    AppComponent.prototype.confirm = function (toast) {
        this.switchBoard.onToastConfirm.next({});
        this.removeToast(toast.toastId);
        this.confirmClass = "";
    };
    AppComponent.prototype.cancel = function (toast) {
        this.removeToast(toast.toastId);
        this.confirmClass = "";
    };
    AppComponent.prototype.error = function (toast) {
        this.removeToast(toast.toastId);
        // this.confirmClass = "";
    };
    AppComponent.prototype.loggedIn = function (user) {
        this.user = user;
        this.hasLoggedIn = true;
    };
    AppComponent.prototype.loggedOut = function (obj) {
        this.hasLoggedIn = false;
        /*let link = ['/login'];
        this._router.navigate(link);*/
        this.logout();
    };
    AppComponent.prototype.logout = function () {
        this.loadingService.triggerLoadingEvent(true);
        document.cookie = "dev=;path=/;domain=qount.io";
        window.location.href = 'https://dev-welcome.qount.io/oneapp/login';
    };
    AppComponent.prototype.routeChanged = function (routeChange) {
        if (Session_1.Session.hasSession()) {
            if (routeChange.url == '/activate' || routeChange.url == '/termsAndConditions') {
                this.hasLoggedIn = false;
            }
            else {
                this.hasLoggedIn = true;
            }
        }
        else {
            this.hasLoggedIn = false;
        }
        Session_1.Session.setLastVisitedUrl(this.currentPath);
        this.isLoginPath = routeChange.url == 'login';
        this.currentPath = routeChange.url;
        if (this.currentPath.startsWith("/yodleeToken")) {
            var status_1 = this.queryParams['JSONcallBackStatus'];
            Session_1.Session.put("yodleeStatus", status_1);
            window.parent.recivedYodleeToken();
        }
    };
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.loginSubscription = this.switchBoard.onLogin.subscribe(function (user) { return _this.loggedIn(user); });
        this.logoutSubscription = this.switchBoard.onLogOut.subscribe(function (status) { return _this.loggedOut(status); });
        this._router.events.filter(function (event) { return event instanceof router_1.NavigationEnd; }).subscribe(function (routeChange) {
            _this.routeChanged(routeChange);
        });
        jQuery(document).ready(function () {
            jQuery(document).foundation();
        });
    };
    AppComponent.prototype.goToDefaultPage = function () {
        var link = this.hasLoggedIn ? ['/dashboard'] : ["/login"];
        this._router.navigate(link);
    };
    AppComponent.prototype.redirectToPage = function (routeName) {
        this._router.navigate(routeName);
    };
    AppComponent.prototype.togglemenu = function (menuStatus) {
        this.isSideMenuExpanded = menuStatus;
        this.sMenuCss = {
            'small-2': true,
            'sidebar': true,
            'shrink': false
        };
        this.mainCanvasCss = {
            'main-canvas': true,
            'expanded': true
        };
        if (!this.isSideMenuExpanded) {
            this.sMenuCss = {
                'small-2': false,
                'sidebar': true,
                'shrink': true
            };
            this.mainCanvasCss = {
                'main-canvas': true,
                'expanded': false
            };
        }
        this.switchBoard.onSideMenuResize.next({ 'resize': true });
    };
    AppComponent.prototype.toggleOffCanvasMenu = function () {
        this.isOffCanvasMenuExpanded = !this.isOffCanvasMenuExpanded;
        this.isSideMenuExpanded = this.isOffCanvasMenuExpanded;
        this.switchBoard.onOffCanvasMenuExpand.next(this.isOffCanvasMenuExpanded);
    };
    AppComponent.prototype.ngOnDestroy = function () {
        this.sub.unsubscribe();
    };
    AppComponent.prototype.toggleLoader = function (toggle) {
        this.isLoading = toggle;
        this.isOverlay = toggle;
    };
    AppComponent.prototype.updatePageTitle = function (title) {
        this.pageTitle = title;
    };
    AppComponent.prototype.showPrevious = function () {
        this.switchBoard.onClickPrev.next({});
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'qount-app',
        templateUrl: '/app/views/qountApp.html'
    }),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard, router_1.Router, router_1.ActivatedRoute, Toast_service_1.ToastService, Socket_service_1.SocketService, PageTitle_1.pageTitleService,
        Companies_service_1.CompaniesService, LoadingService_1.LoadingService, Login_service_1.LoginService, Toast_service_1.ToastService])
], AppComponent);
exports.AppComponent = AppComponent;
