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
var CustomDatepicker = (function () {
    function CustomDatepicker(el) {
        this.el = el;
        this.minDate = new Date();
        this.valueChanged = new core_1.EventEmitter();
    }
    Object.defineProperty(CustomDatepicker.prototype, "format", {
        set: function (_format) {
            this.fmt = _format;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CustomDatepicker.prototype, "mindate", {
        set: function (_mindate) {
            if (_mindate == 'past') {
                this.minDate = null;
            }
            else if (moment(_mindate, "MM/DD/YYYY", true).isValid()) {
                this.minDate = new Date(_mindate);
            }
        },
        enumerable: true,
        configurable: true
    });
    CustomDatepicker.prototype.ngAfterViewInit = function () {
        var base = this;
        var elem = jQuery(this.el.nativeElement)[0];
        var picker = new Pikaday({ field: elem, format: this.fmt ? this.fmt : 'MM/DD/YYYY', minDate: this.minDate,
            onSelect: function (date) {
                var dt = picker.toString(base.fmt || '');
                elem.value = dt;
                base.valueChanged.emit(dt);
            }
        });
    };
    return CustomDatepicker;
}());
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], CustomDatepicker.prototype, "valueChanged", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], CustomDatepicker.prototype, "format", null);
__decorate([
    core_1.Input(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], CustomDatepicker.prototype, "mindate", null);
CustomDatepicker = __decorate([
    core_1.Directive({
        selector: '[custom-datepicker]'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], CustomDatepicker);
exports.CustomDatepicker = CustomDatepicker;
