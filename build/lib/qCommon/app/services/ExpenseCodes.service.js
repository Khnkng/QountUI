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
/**
 * Created by seshu on 18-07-2016.
 */
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var QountServices_1 = require("./QountServices");
var Session_1 = require("./Session");
var Qount_constants_1 = require("../constants/Qount.constants");
var ExpensesService = (function (_super) {
    __extends(ExpensesService, _super);
    function ExpensesService(http) {
        return _super.call(this, http) || this;
    }
    ExpensesService.prototype.getAllExpenses = function (company_id) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.EXPENSE_SERVICE, null, { id: Session_1.Session.getUser().id, cid: company_id });
        return this.query(url, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ExpensesService.prototype.addExpense = function (expense, company_id) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.EXPENSE_SERVICE, null, { id: Session_1.Session.getUser().id, cid: company_id });
        return this.create(url, expense, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ExpensesService.prototype.updateExpense = function (expense, company_id) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.EXPENSE_SERVICE, null, { id: Session_1.Session.getUser().id, cid: company_id });
        return this.update(url, expense, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ExpensesService.prototype.removeExpense = function (company_id, expense_id) {
        var url = this.interpolateUrl(Qount_constants_1.PATH.EXPENSE_SERVICE, null, { id: Session_1.Session.getUser().id, cid: company_id });
        return this.delete(url + "/" + expense_id, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ExpensesService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    return ExpensesService;
}(QountServices_1.QountServices));
ExpensesService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], ExpensesService);
exports.ExpensesService = ExpensesService;
