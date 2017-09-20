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
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var YodleeTokenComponent = (function () {
    function YodleeTokenComponent(switchBoard) {
        this.switchBoard = switchBoard;
        var status = this.getURLParameter("JSONcallBackStatus");
        localStorage.setItem("providerAccountId", status[0].providerAccountId);
        this.switchBoard.onYodleeTokenRecived.next({});
    }
    YodleeTokenComponent.prototype.getURLParameter = function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    };
    return YodleeTokenComponent;
}());
YodleeTokenComponent = __decorate([
    core_1.Component({
        selector: 'vendors',
        templateUrl: '/app/views/yodleeToken.html'
    }),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard])
], YodleeTokenComponent);
exports.YodleeTokenComponent = YodleeTokenComponent;
