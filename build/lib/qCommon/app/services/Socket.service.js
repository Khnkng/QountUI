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
/**
 * Created by seshu on 24-03-2016.
 */
var SwitchBoard_1 = require("./SwitchBoard");
var core_1 = require("@angular/core");
var Session_1 = require("./Session");
var Qount_constants_1 = require("../constants/Qount.constants");
var Companies_service_1 = require("./Companies.service");
var SocketServiceType;
(function (SocketServiceType) {
    SocketServiceType[SocketServiceType["ALERTS_COMMENTS"] = 0] = "ALERTS_COMMENTS";
    SocketServiceType[SocketServiceType["NOTIFICATIONS"] = 1] = "NOTIFICATIONS";
    SocketServiceType[SocketServiceType["QOUNT_NOTIFICATIONS"] = 2] = "QOUNT_NOTIFICATIONS";
})(SocketServiceType = exports.SocketServiceType || (exports.SocketServiceType = {}));
var SocketService = (function () {
    function SocketService(switchBoard, companyService) {
        var _this = this;
        this.switchBoard = switchBoard;
        this.companyService = companyService;
        var base = this;
        if (window.matchMedia) {
            var mediaQueryList = window.matchMedia('print');
            mediaQueryList.addListener(function (mql) {
                if (mql.matches) {
                    base.beforePrint();
                }
                else {
                    base.afterPrint();
                }
            });
        }
        window.onbeforeprint = this.beforePrint;
        window.onafterprint = this.afterPrint;
        console.log("into alerts...");
        /*var base = this;
         this.alertsCommentsSocket = io.connect(PATH.ALERTS_AND_COMMENTS_URL, {path: PATH.ALERTS_AND_COMMENTS_PATH});
         this.notificationsSocket = io.connect(PATH.NOTIFICATIONS_URL, {path: PATH.NOTIFICATIONS_PATH});
         this.alertsCommentsSocket.on('connect', function() {
         console.log('alerts connected');
         base.emitUserStatus();
         base.defaultEvents(SocketServiceType.ALERTS_COMMENTS);
         });
         this.notificationsSocket.on('connect', function() {
         console.log('notifications connected');
         base.emitUserStatus();
         base.defaultEvents(SocketServiceType.NOTIFICATIONS);
         });
         this.switchBoard.onLogin.subscribe(status => this.emitUserStatus());
         this.switchBoard.onLogOut.subscribe(status => this.disconnect());*/
        var base = this;
        this.notificationsSocket = io.connect(Qount_constants_1.PATH.NOTIFICATIONS_URL, { path: Qount_constants_1.PATH.NOTIFICATIONS_PATH });
        this.notificationsSocket.on('connect', function () {
            console.log('notifications connected');
            base.emitUserStatus();
        });
        this.qountNotificationsSocket = io.connect(Qount_constants_1.PATH.QOUNT_NOTIFICATIONS_URL, { path: Qount_constants_1.PATH.NOTIFICATIONS_PATH });
        this.qountNotificationsSocket.on('connect', function () {
            console.log('qnotifications connected');
            base.emitUserStatus();
        });
        base.defaultEvents(SocketServiceType.NOTIFICATIONS);
        base.defaultEvents(SocketServiceType.QOUNT_NOTIFICATIONS);
        this.switchBoard.onLogin.subscribe(function (status) { return _this.emitUserStatus(); });
        this.switchBoard.onLogOut.subscribe(function (status) { return _this.disconnect(); });
    }
    SocketService.prototype.on = function (event, type, callBack) {
        switch (type) {
            case SocketServiceType.ALERTS_COMMENTS:
                {
                    console.log("intooooo1", event);
                    this.alertsCommentsSocket.on(event, callBack);
                }
                break;
            case SocketServiceType.NOTIFICATIONS:
                {
                    console.log("intooooo2", event);
                    this.notificationsSocket.on(event, callBack);
                }
                break;
            case SocketServiceType.QOUNT_NOTIFICATIONS:
                {
                    console.log("intooooo3", event);
                    this.qountNotificationsSocket.on(event, callBack);
                }
                break;
        }
    };
    SocketService.prototype.emit = function (event, type, obj) {
        switch (type) {
            case SocketServiceType.ALERTS_COMMENTS:
                {
                    this.alertsCommentsSocket.emit(event, obj);
                }
                break;
            case SocketServiceType.NOTIFICATIONS:
                {
                    this.notificationsSocket.emit(event, obj);
                }
                break;
            case SocketServiceType.QOUNT_NOTIFICATIONS:
                {
                    this.qountNotificationsSocket.emit(event, obj);
                }
                break;
        }
    };
    SocketService.prototype.disconnect = function () {
        //this.alertsCommentsSocket.emit('disconnect', {});
        this.notificationsSocket.emit('disconnect', {});
        this.qountNotificationsSocket.emit('disconnect', {});
    };
    SocketService.prototype.defaultEvents = function (type) {
        var _this = this;
        switch (type) {
            case SocketServiceType.ALERTS_COMMENTS:
                {
                    this.on('new:card_alert', type, function (alert) { return _this.handleAlerts(alert); });
                    this.on('new:comment', type, function (comment) { return _this.handleComments(comment); });
                }
                break;
            case SocketServiceType.NOTIFICATIONS:
                {
                    this.on('new:notification', type, function (notification) { return _this.handleNotifications(notification); });
                    this.on('new:notification_count', type, function (notification) { return _this.handleNotificationCount(notification); });
                }
                break;
            case SocketServiceType.QOUNT_NOTIFICATIONS:
                {
                    this.on('new:qount-notification', type, function (notification) { return _this.handleQountNotifications(notification); });
                }
                break;
        }
    };
    SocketService.prototype.emitUserStatus = function () {
        var _this = this;
        if (Session_1.Session.hasSession()) {
            //this.emit('new:user', SocketServiceType.ALERTS_COMMENTS, {userId : Session.getUser().id});
            this.emit('new:user', SocketServiceType.NOTIFICATIONS, { userId: Session_1.Session.getUser().id });
            this.companyService.companies()
                .subscribe(function (companies) {
                _this.emit('new:user', SocketServiceType.QOUNT_NOTIFICATIONS, { userId: Session_1.Session.getUser().id, companies: companies });
            }, function (error) { });
        }
    };
    SocketService.prototype.handleAlerts = function (alert) {
        console.log("got alert event", alert);
        this.switchBoard.onNewAlert.next(alert);
    };
    SocketService.prototype.handleComments = function (comment) {
        console.log("got comment event", comment);
        this.switchBoard.onNewComment.next(comment);
    };
    SocketService.prototype.handleNotifications = function (notifications) {
        console.log("got notification event", notifications);
        this.switchBoard.onNewNotification.next(notifications);
    };
    SocketService.prototype.handleQountNotifications = function (notifications) {
        console.log("got qount notification event", notifications);
        this.switchBoard.onNewQountNotification.next(notifications);
    };
    SocketService.prototype.handleNotificationCount = function (notifications) {
        console.log("got notification count event", notifications);
        this.switchBoard.onNotificationCountUpdate.next(notifications);
    };
    SocketService.prototype.beforePrint = function () {
        this.switchBoard.onPrintWindowClose.next(true);
    };
    SocketService.prototype.afterPrint = function () {
        this.switchBoard.onPrintWindowClose.next(false);
    };
    return SocketService;
}());
SocketService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard, Companies_service_1.CompaniesService])
], SocketService);
exports.SocketService = SocketService;
