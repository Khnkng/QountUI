/**
 * Created by seshu on 05-03-2016.
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
var Ripple = (function () {
    function Ripple(el) {
        this.el = el;
        //el.nativeElement.style.backgroundColor = 'yellow';
        el.nativeElement.classList.add('ripple-effect');
    }
    Ripple.prototype.onClick = function (e) {
        var rippler = jQuery(this.el.nativeElement);
        // create .ink element if it doesn't exist
        if (rippler.find(".ink").length == 0) {
            rippler.append("<span class='ink'></span>");
        }
        var ink = rippler.find(".ink");
        // prevent quick double clicks
        ink.removeClass("animate");
        // set .ink diametr
        var d = Math.max(rippler.outerWidth(), rippler.outerHeight());
        ink.css({ height: d, width: d });
        // get click coordinates
        var x = e.pageX - rippler.offset().left - ink.width() / 2;
        var y = e.pageY - rippler.offset().top - ink.height() / 2;
        // set .ink position and add class .animate
        ink.css({
            top: y + 'px',
            left: x + 'px'
        }).addClass("animate");
    };
    return Ripple;
}());
Ripple = __decorate([
    core_1.Directive({
        selector: '[ripple]',
        host: {
            '(click)': 'onClick($event)'
        }
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], Ripple);
exports.Ripple = Ripple;
