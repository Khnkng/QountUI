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
var CustomDatepicker1 = (function () {
    function CustomDatepicker1(el) {
        this.el = el;
        this.valueChanged = new core_1.EventEmitter();
    }
    /* @Input() set format(_format: string){
       this.fmt = _format;
     }*/
    CustomDatepicker1.prototype.ngAfterViewInit = function () {
        console.log("INIT VIEW");
        var base = this;
        var elem = jQuery(this.el.nativeElement)[0];
        var picker = new Pikaday({ field: elem, format: this.fmt ? this.fmt : 'MM/DD/YYYY', minDate: new Date(),
            onSelect: function (date) {
                var dt = picker.toString(base.fmt || '');
                elem.value = dt;
                base.valueChanged.emit(dt);
            }
        });
    };
    return CustomDatepicker1;
}());
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], CustomDatepicker1.prototype, "valueChanged", void 0);
__decorate([
    core_1.Input('customDatepicker1'),
    __metadata("design:type", String)
], CustomDatepicker1.prototype, "fmt", void 0);
CustomDatepicker1 = __decorate([
    core_1.Directive({
        selector: '[customDatepicker1]'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], CustomDatepicker1);
exports.CustomDatepicker1 = CustomDatepicker1;
