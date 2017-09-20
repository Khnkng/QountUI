/**
 * Created by seshu on 10-03-2016.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Session = (function () {
    function Session() {
    }
    Session.create = function (user, token) {
        this.put('user', user);
        this.put('token', token);
    };
    Session.hasSession = function () {
        if (localStorage.getItem('user') && localStorage.getItem('token')) {
            return true;
        }
        return false;
    };
    Session.getLastVisitedUrl = function () {
        if (this.lastVisitedUrl) {
            return this.lastVisitedUrl;
        }
        return "";
    };
    Session.setLastVisitedUrl = function (url) {
        this.lastVisitedUrl = url;
    };
    Session.setCurrentCompany = function (companyId) {
        localStorage.setItem('currentCompany', companyId);
    };
    Session.setCurrentCompanyName = function (companyName) {
        localStorage.setItem('currentCompanyName', companyName);
    };
    Session.setCurrentCompanyCurrency = function (companyCurrency) {
        localStorage.setItem('companyCurrency', companyCurrency);
    };
    Session.setFiscalStartDate = function (date) {
        localStorage.setItem('fiscalStartDate', date);
    };
    Session.getCurrentCompany = function () {
        return localStorage.getItem('currentCompany');
    };
    Session.getCurrentCompanyName = function () {
        return localStorage.getItem('currentCompanyName');
    };
    Session.getCurrentCompanyCurrency = function () {
        return localStorage.getItem('companyCurrency');
    };
    Session.getFiscalStartDate = function () {
        return localStorage.getItem('fiscalStartDate');
    };
    Session.getUser = function () {
        return this.get('user');
    };
    Session.getToken = function () {
        return localStorage.getItem('token');
    };
    Session.setToken = function (token) {
        localStorage.setItem('token', token);
    };
    Session.removeToken = function () {
        localStorage.removeItem('token');
    };
    Session.put = function (key, value) {
        if (key == 'token')
            localStorage.setItem(key, value);
        else
            localStorage.setItem(key, JSON.stringify(value));
    };
    Session.getKey = function (key) {
        return localStorage.getItem(key) ? localStorage.getItem(key).replace(/"/g, "") : null;
    };
    Session.deleteKey = function (key) {
        return localStorage.removeItem(key);
    };
    Session.get = function (key) {
        return JSON.parse(localStorage.getItem(key));
    };
    Session.getJSON = function (key) {
        return JSON.parse(localStorage.getItem(key));
    };
    Session.setVendor = function (vendorID) {
        localStorage.setItem('vendorID', vendorID);
    };
    Session.getVendor = function () {
        return localStorage.getItem('vendorID');
    };
    Session.getReportCriteria = function (reportType) {
        return JSON.parse(localStorage.getItem(reportType));
    };
    Session.setReportCriteria = function (reportType, criteria) {
        localStorage.setItem(reportType, JSON.stringify(criteria));
    };
    Session.clearReportCriteria = function (reportType) {
        localStorage.removeItem(reportType);
    };
    Session.getReportData = function (reportType) {
        return JSON.parse(localStorage.getItem(reportType));
    };
    Session.setReportData = function (reportType, data) {
        localStorage.setItem(reportType, JSON.stringify(data));
    };
    Session.getTTL = function () {
        return localStorage.getItem("ttl");
    };
    Session.setTTL = function (ttl) {
        localStorage.setItem("ttl", ttl);
    };
    Session.getRefreshToken = function () {
        return localStorage.getItem("refreshToken");
    };
    Session.setRefreshToken = function (token) {
        localStorage.setItem("refreshToken", token);
    };
    Session.getLockDate = function () {
        return localStorage.getItem("lockDate");
    };
    Session.setLockDate = function (lockDate) {
        localStorage.setItem("lockDate", lockDate);
    };
    Session.clearReportData = function (reportType) {
        localStorage.removeItem(reportType);
    };
    Session.setTimer = function (lockDate) {
        localStorage.setItem("timer", lockDate);
    };
    Session.destroy = function () {
        if (localStorage.getItem("timer")) {
            clearInterval(Number(localStorage.getItem("timer")));
        }
        localStorage.clear();
        sessionStorage.clear();
    };
    return Session;
}());
Session = __decorate([
    core_1.Injectable()
], Session);
exports.Session = Session;
