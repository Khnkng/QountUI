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
var SwitchBoard_1 = require("./SwitchBoard");
var core_1 = require("@angular/core");
var PrintEventService = (function () {
    function PrintEventService(switchBoard) {
        this.switchBoard = switchBoard;
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
    }
    PrintEventService.prototype.beforePrint = function () {
        debugger;
        console.log("kllooo");
        this.switchBoard.onPrintWindowClose.next(true);
    };
    PrintEventService.prototype.afterPrint = function () {
        console.log("kllooo");
        this.switchBoard.onPrintWindowClose.next(false);
    };
    return PrintEventService;
}());
PrintEventService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard])
], PrintEventService);
exports.PrintEventService = PrintEventService;
