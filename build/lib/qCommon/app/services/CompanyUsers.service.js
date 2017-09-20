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
var core_1 = require("@angular/core");
var QountServices_1 = require("./QountServices");
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var Qount_constants_1 = require("../constants/Qount.constants");
var Session_1 = require("./Session");
var CompanyUsers = (function (_super) {
    __extends(CompanyUsers, _super);
    function CompanyUsers(http) {
        return _super.call(this, http) || this;
    }
    CompanyUsers.prototype.acceptTerms = function (companyId) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.ACCEPT_TERMS_SERVICE, null, { id: Session_1.Session.getUser().id, companyId: companyId });
        return this.create(url, {}, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompanyUsers.prototype.users = function (companyID) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.USER_ROLE_SERVICE, null, { userId: Session_1.Session.getUser().id, companyId: companyID });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompanyUsers.prototype.addUser = function (user, companyID) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.USER_ROLE_SERVICE, null, { userId: Session_1.Session.getUser().id, companyId: companyID });
        return this.create(url, user, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompanyUsers.prototype.updateUser = function (user, companyID) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.USER_ROLE_SERVICE, null, { userId: Session_1.Session.getUser().id, companyId: companyID });
        return this.update(url + '/' + user.id, user, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompanyUsers.prototype.removeUser = function (userID, companyID) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.USER_ROLE_SERVICE, null, { userId: Session_1.Session.getUser().id, companyId: companyID });
        return this.delete(url + '/' + userID, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompanyUsers.prototype.user = function (userID) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.USER_ROLE_SERVICE, null, { userId: Session_1.Session.getUser().id });
        return this.query(url + "/" + userID, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompanyUsers.prototype.roles = function () {
        var url = this.interpolateUrl(Qount_constants_1.PATH.ROLES_SERVICE, null, { userId: Session_1.Session.getUser().id });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompanyUsers.prototype.updatePassword = function (user) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.PASSWORD_SERVICE, null, { id: Session_1.Session.getUser().id });
        return this.update(url, user, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    CompanyUsers.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    return CompanyUsers;
}(QountServices_1.QountServices));
CompanyUsers = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], CompanyUsers);
exports.CompanyUsers = CompanyUsers;
