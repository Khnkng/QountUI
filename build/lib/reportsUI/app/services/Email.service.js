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
 * Created by Nazia on 28-09-2016.
 */
var http_1 = require("@angular/http");
var core_1 = require("@angular/core");
var QountServices_1 = require("qCommon/app/services/QountServices");
var Rx_1 = require("rxjs/Rx");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var EmailService = (function (_super) {
    __extends(EmailService, _super);
    function EmailService(http) {
        return _super.call(this, http) || this;
    }
    EmailService.prototype.email = function (emailRequest) {
        var url = Qount_constants_1.PATH.EMAIL_SERVICE;
        return this.create(url, emailRequest, Qount_constants_1.SOURCE_TYPE.JAVA).map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    EmailService.prototype.handleError = function (error) {
        return Rx_1.Observable.throw(error.text());
    };
    return EmailService;
}(QountServices_1.QountServices));
EmailService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], EmailService);
exports.EmailService = EmailService;
