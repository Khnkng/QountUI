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
var CustomTags = (function () {
    function CustomTags(el) {
        this.el = el;
        this.list = [];
        this.valueChanged = new core_1.EventEmitter();
    }
    Object.defineProperty(CustomTags.prototype, "tagsList", {
        set: function (tagsList) {
            this.list = tagsList;
        },
        enumerable: true,
        configurable: true
    });
    CustomTags.prototype.ngAfterViewInit = function () {
        console.log("TAGS VIEW");
        var base = this;
        var elem = jQuery(this.el.nativeElement)[0];
        jQuery(elem).tagit({
            onchange: onChange,
            allowSpaces: true
        });
        if (this.list) {
            this.list.forEach(function (tag) {
                jQuery(elem).tagit("createTag", tag);
            });
        }
        var onChange = function (value) {
            debugger;
            /*jQuery(base.el.nativeElement).val(value);
            let index = jQuery(base.el.nativeElement).prop('selectedIndex');
            if(index != -1) {
              base.valueChanged.emit(<any> base.list[index]);
            } else {
              base.valueChanged.emit(<any> value);
            }*/
        };
    };
    return CustomTags;
}());
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], CustomTags.prototype, "valueChanged", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [Array])
], CustomTags.prototype, "tagsList", null);
CustomTags = __decorate([
    core_1.Directive({
        selector: '[custom-tags]'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], CustomTags);
exports.CustomTags = CustomTags;
