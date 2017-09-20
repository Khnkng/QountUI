/**
 * Created by Mateen on 12-03-2016.
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var Observable_1 = require("rxjs/Observable");
var http_1 = require("@angular/http");
var Qount_constants_1 = require("../constants/Qount.constants");
var QountServices_1 = require("./QountServices");
var core_1 = require("@angular/core");
var Session_1 = require("./Session");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var NotificationService = (function (_super) {
    __extends(NotificationService, _super);
    function NotificationService(http) {
        var _this = _super.call(this, http) || this;
        _this.userId = Session_1.Session.getUser().id;
        return _this;
    }
    NotificationService.prototype.getNotifications = function () {
        //var url = this.interpolateUrl(PATH.BOARDS_SERVICE,null,{userId: this.userId})
        return this.query(Qount_constants_1.PATH.UNREAD_NOTIFICATIONS_SERVICE, Qount_constants_1.SOURCE_TYPE.NODE)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    NotificationService.prototype.getNotificationsCount = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.NOTIFICATIONS_COUNT, null, { userId: this.userId });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.NODE)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    NotificationService.prototype.markNotificationsAsRead = function (notif_id) {
        return this.updateWithoutJson(Qount_constants_1.PATH.NOTIFICATIONS_SERVICE + "/" + notif_id, Qount_constants_1.SOURCE_TYPE.NODE)
            .map(function (res) { return res; })
            .catch(this.handleError);
    };
    NotificationService.prototype.handleError = function (error) {
        return Observable_1.Observable.throw(error.text());
    };
    return NotificationService;
}(QountServices_1.QountServices));
NotificationService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], NotificationService);
exports.NotificationService = NotificationService;
