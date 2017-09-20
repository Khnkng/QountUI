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
var Focus = (function () {
    function Focus(el) {
        this.el = el;
    }
    Focus.prototype.ngOnChanges = function (changes) {
        var base = this;
        // Empty the changeLog whenever 'reset' property changes
        // hint: this is a way to respond programmatically to external value changes.
        if (changes['status']) {
            var prop = changes['status'];
            var cur_1 = JSON.stringify(prop.currentValue);
            var prev = JSON.stringify(prop.previousValue);
            setTimeout(function () {
                if (cur_1) {
                    base.el.nativeElement.focus();
                }
            }, 0);
        }
    };
    return Focus;
}());
__decorate([
    core_1.Input('focus'),
    __metadata("design:type", Boolean)
], Focus.prototype, "status", void 0);
Focus = __decorate([
    core_1.Directive({
        selector: '[focus]'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], Focus);
exports.Focus = Focus;
