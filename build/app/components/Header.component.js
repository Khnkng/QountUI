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
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var fullscreen_service_1 = require("qCommon/app/services/fullscreen.service");
var Notification_service_1 = require("qCommon/app/services/Notification.service");
var Session_1 = require("qCommon/app/services/Session");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var HeaderComponent = (function () {
    function HeaderComponent(_router, switchBoard, _fullscreen, notificationServie, stateService) {
        this._router = _router;
        this.switchBoard = switchBoard;
        this._fullscreen = _fullscreen;
        this.notificationServie = notificationServie;
        this.stateService = stateService;
        this.isSideMenuExpanded = false;
        this.unreadNotifications = [];
        this.unreadNotificationCount = 0;
        this.shareLength = 0;
        this.commentLength = 0;
        this.groupByLength = 0;
        this.alertsLength = 0;
        this.mainCanvasCss = {
            'main-canvas': true,
            'expanded': false
        };
        this.sMenuCss = {
            'small-2': false,
            'sidebar': true,
            'shrink': true
        };
        /*Search fields*/
        this.selectedComponents = [];
        this.amount = 0;
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.togglemenu = new core_1.EventEmitter();
        this.redirect = new core_1.EventEmitter();
        /*this.switchBoard.onNotificationCountUpdate.subscribe(notification => {
          console.log(notification,'notification');
          this.handleNotifications(notification);
        });
        notificationServie.getNotificationsCount()
          .subscribe(notifications => this.handleNotifications(notifications), error => this.showError(error));*/
        //this.getNotifications();
        /*this.switchBoard.onNewQountNotification.subscribe(notification => {
          this.handleQountNotifications(notification);
        });*/
        this.fullScreenIcon = "ion-arrow-expand";
        this.searchText = "";
        //this.switchBoard.onNotificationMarkRead.subscribe(status => this.getNotifications());
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
    }
    HeaderComponent.prototype.getNotifications = function () {
        var _this = this;
        this.notificationServie.getNotifications().subscribe(function (notifications) {
            _this.unreadNotifications = _.filter(notifications, function (notification) {
                return notification.notification_type == "Comments" || notification.notification_type == "BillPay";
            });
            _this.unreadNotificationCount = _this.unreadNotifications.length;
            _this.parseUnreadNotifications();
        }, function (error) { return _this.showError(error); });
    };
    HeaderComponent.prototype.logout = function () {
        console.log("into logout1");
        Session_1.Session.destroy();
        this.switchBoard.onLogOut.next({ 'loggedOut': true });
    };
    HeaderComponent.prototype.parseUnreadNotifications = function () {
        var unreadNotificationsCopy = this.unreadNotifications;
        this.unreadNotifications = [];
        if (unreadNotificationsCopy.length > 0) {
            var noOfNotifications = 0;
            noOfNotifications = unreadNotificationsCopy.length > 5 ? 5 : unreadNotificationsCopy.length;
            for (var index = 0; index < noOfNotifications; index++) {
                var parsedData = JSON.parse(unreadNotificationsCopy[index].data);
                console.log("parsedData", parsedData);
                for (var prop in parsedData) {
                    unreadNotificationsCopy[index][prop] = parsedData[prop];
                }
                this.unreadNotifications.splice(index, 0, unreadNotificationsCopy[index]);
            }
        }
    };
    HeaderComponent.prototype.handleQountNotifications = function (notification) {
        console.log('notification', notification);
        this.unreadNotificationCount = this.unreadNotificationCount + 1;
        this.unreadNotifications.splice(0, 0, notification);
    };
    /*handleNotifications(notifications){
      this.alertsLength=notifications.alerts;
      this.groupByLength=notifications.groups;
      this.commentLength=notifications.messages;
      this.shareLength=notifications.shares;
      this.unreadNotifications=this.alertsLength+this.groupByLength+this.commentLength+this.shareLength;
    }
  */
    HeaderComponent.prototype.viewAll = function () {
        var link = ['/Notification'];
        this.redirect.emit(link);
    };
    HeaderComponent.prototype.showError = function (error) {
    };
    HeaderComponent.prototype.showFullScreen = function () {
        if (this.isFullScreen) {
            this._fullscreen.exitFullscreen();
            this.fullScreenIcon = "ion-arrow-expand";
        }
        else {
            this.fullScreenIcon = "ion-arrow-shrink";
            this._fullscreen.launchFullscreen(document.documentElement);
        }
        this.isFullScreen = !this.isFullScreen;
    };
    HeaderComponent.prototype.toggleSideMenuStatus = function ($event) {
        this.isSideMenuExpanded = !this.isSideMenuExpanded;
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
        this.togglemenu.emit(this.isSideMenuExpanded);
        this.switchBoard.onSideMenuResize.next({ 'resize': true });
    };
    HeaderComponent.prototype.ngOnInit = function () {
        jQuery(document).ready(function () {
            jQuery(document).foundation();
        });
    };
    HeaderComponent.prototype.toggleSearch = function () {
        this.showSearch = !this.showSearch;
    };
    HeaderComponent.prototype.viewUserProfilePage = function ($event) {
        var link = ["/user-profile"];
        this.redirect.emit(link);
    };
    HeaderComponent.prototype.showSearchPage = function () {
        sessionStorage.removeItem('searchcriteria');
        this.addCurrentState();
        var link = ['search'];
        this._router.navigate(link);
    };
    HeaderComponent.prototype.addCurrentState = function () {
        this.stateService.addState(new State_1.State('', this._router.url, null, null));
    };
    return HeaderComponent;
}());
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], HeaderComponent.prototype, "togglemenu", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], HeaderComponent.prototype, "redirect", void 0);
HeaderComponent = __decorate([
    core_1.Component({
        selector: 'qount-header',
        templateUrl: '/app/views/header.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, SwitchBoard_1.SwitchBoard, fullscreen_service_1.FullScreenService,
        Notification_service_1.NotificationService, StateService_1.StateService])
], HeaderComponent);
exports.HeaderComponent = HeaderComponent;
