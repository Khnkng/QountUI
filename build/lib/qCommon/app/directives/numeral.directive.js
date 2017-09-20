/**
 * Created by seshagirivellanki on 15/02/17.
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
var forms_1 = require("@angular/forms");
var Numeral_service_1 = require("../services/Numeral.service");
var Numeral = (function () {
    function Numeral(model, el, numeralService) {
        this.model = model;
        this.el = el;
        this.numeralService = numeralService;
        this.input = jQuery(this.el.nativeElement);
    }
    Numeral.prototype.ngOnInit = function () {
        var _this = this;
        this.onBlur();
        this.model['update'].subscribe(function (value) {
            if (!jQuery(_this.input).is(':focus')) {
                _this.model.valueAccessor.writeValue(_this.numeralService.format(_this.format, _this.input.val()));
            }
        });
    };
    Numeral.prototype.onBlur = function (e) {
        var base = this;
        this.switchLocale();
        var value = this.numeralService.value(this.input.val());
        if (!value) {
            value = this.numeralService.value(this.model['model']);
        }
        if (value) {
            var formatVal_1 = this.numeralService.format(this.format, value);
            this.model.viewToModelUpdate(value);
            this.model.control.setValue(value);
            setTimeout(function () {
                base.model.valueAccessor.writeValue(formatVal_1);
            }, 50);
        }
    };
    Numeral.prototype.onKeyUp = function ($event) {
        if (this.unsigned && $event.keyCode == 189) {
            var value = this.input.val();
            value = value.replace(/-/g, "");
            this.input.val(value);
        }
    };
    Numeral.prototype.onFocus = function (e) {
        this.model.valueAccessor.writeValue(this.numeralService.value(this.input.val()));
        /*let value = this.numeralService.value(this.input.val());
        if(value == 0){
            this.model.valueAccessor.writeValue('');
        } else{
            this.model.valueAccessor.writeValue(value);
        }*/
    };
    Numeral.prototype.switchLocale = function () {
        this.numeralService.switchLocale(this.locale);
    };
    Numeral.prototype.ngOnChanges = function (changes) {
        if (this.hasInitialized && (changes['locale'])) {
            this.switchLocale();
        }
    };
    Numeral.prototype.ngOnDestroy = function () {
    };
    return Numeral;
}());
Numeral = __decorate([
    core_1.Directive({
        selector: '[numeral]',
        host: {
            '(blur)': 'onBlur($event)',
            '(focus)': 'onFocus($event)',
            '(keyup)': 'onKeyUp($event)'
        },
        inputs: ['locale', 'format', 'unsigned']
    }),
    __metadata("design:paramtypes", [forms_1.NgControl, core_1.ElementRef, Numeral_service_1.NumeralService])
], Numeral);
exports.Numeral = Numeral;
