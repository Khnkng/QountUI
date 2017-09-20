/**
 * Created by seshu on 05-03-2016.
 * @ngModule ShareModule
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
var FullScreenService = (function () {
    function FullScreenService() {
        console.info('QountApp Header Component Mounted Successfully7');
        // Events
        document.addEventListener("fullscreenchange", function (e) {
            console.log("fullscreenchange event! ", e);
        });
        document.addEventListener("mozfullscreenchange", function (e) {
            console.log("mozfullscreenchange event! ", e);
        });
        document.addEventListener("webkitfullscreenchange", function (e) {
            console.log("webkitfullscreenchange event! ", e);
        });
        document.addEventListener("msfullscreenchange", function (e) {
            console.log("msfullscreenchange event! ", e);
        });
    }
    // Find the right method, call on correct element
    FullScreenService.prototype.launchFullscreen = function (element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    };
    FullScreenService.prototype.exitFullscreen = function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    };
    return FullScreenService;
}());
FullScreenService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], FullScreenService);
exports.FullScreenService = FullScreenService;
