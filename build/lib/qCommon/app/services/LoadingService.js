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
 * Created by yaswanthvadugu on 11/30/16.
 */
var core_1 = require("@angular/core");
var SwitchBoard_1 = require("./SwitchBoard");
var LoadingService = (function () {
    /*loading:Observable<string>;
    listener:Observer<string>;
    loaderTimeout:number = 10000;
    delay:number = 300;
    delayTimeout:number;
    closeDelay:number=600;
    closeDelayTimeout:number;*/
    function LoadingService(switchBoard) {
        this.switchBoard = switchBoard;
        /*this.loading = new Observable(observer=>{
            this.listener = observer;
        }).share();*/
    }
    LoadingService.prototype.triggerLoadingEvent = function (text) {
        this.switchBoard.onLoadingWheel.next(text);
        /*/!* there is no need for loading wheel if request gets processed under less than 300ms*!/
        var self = this;
        if(this.listener){
            if(text){
                this.delayTimeout = setTimeout(function () {
                    self.listener.next(text);
                }, this.delay);
            }else {
                this.closeDelayTimeout = setTimeout(function () {
                    self.listener.next(text);
                }, this.closeDelay);
            }


        }else{
            this.cancelDelay();
        }
        /!* this will disable loading wheel if clear is not called on it *!/
        setTimeout(function () {
            text = false;
            self.cancelDelay();
            self.listener.next(text);
        }, this.loaderTimeout)*/
    };
    return LoadingService;
}());
LoadingService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard])
], LoadingService);
exports.LoadingService = LoadingService;
