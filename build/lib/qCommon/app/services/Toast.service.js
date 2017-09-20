/**
 * Created by nazia on 13-03-2016.
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
var SwitchBoard_1 = require("./SwitchBoard");
var ToastService = (function () {
    function ToastService(switchBoard) {
        this.switchBoard = switchBoard;
    }
    ToastService.prototype.pop = function (type, message) {
        var toastObj = {
            toastId: Math.floor(Math.random() * 1000),
            type: type,
            message: message || "",
            toastClass: "toast-success"
        };
        switch (type) {
            case 'success': {
                toastObj.toastClass = "toast-success";
                break;
            }
            case 'error': {
                toastObj.toastClass = "toast-error";
                break;
            }
            case 'info': {
                toastObj.toastClass = "toast-info";
                break;
            }
            case 'warning': {
                toastObj.toastClass = "toast-warning";
                break;
            }
            case 'confirm': {
                toastObj.toastClass = "toast-confirm";
                break;
            }
        }
        this.switchBoard.onNewToast.next(toastObj);
    };
    return ToastService;
}());
ToastService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard])
], ToastService);
exports.ToastService = ToastService;
