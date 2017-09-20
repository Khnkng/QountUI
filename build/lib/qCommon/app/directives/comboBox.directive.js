/**
 * Created by seshu on 19-04-2016.
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
var ComboBox = (function () {
    function ComboBox(el) {
        this.el = el;
        this.list = [];
        this.valueChanged = new core_1.EventEmitter();
    }
    Object.defineProperty(ComboBox.prototype, "listObject", {
        set: function (_objectList) {
            this.list = _objectList;
        },
        enumerable: true,
        configurable: true
    });
    ComboBox.prototype.clearValue = function () {
        jQuery(this.inputBox).val('');
    };
    ComboBox.prototype.setValue = function (value, prop) {
        if (value) {
            jQuery(this.inputBox).val(value[prop]);
        }
        else {
            value = '--None--';
            jQuery(this.inputBox).val(value);
        }
        this.valueChanged.emit(value);
    };
    ComboBox.prototype.ngAfterViewInit = function () {
        var base = this;
        var elem = jQuery(this.el.nativeElement);
        var title = elem.attr('title');
        var placeholder = elem.attr('data-placeholder');
        var clearOnSelect = elem.attr('data-clear-onselect');
        var allowInvalid = elem.attr('data-allow-invalid');
        var onChange = function (value) {
            jQuery(base.el.nativeElement).val(value);
            var index = jQuery(base.el.nativeElement).prop('selectedIndex');
            if (value.label == '--None--' && value.value == '--None--') {
                base.valueChanged.emit(value);
            }
            else {
                if (index != -1) {
                    base.valueChanged.emit(base.list[index]);
                }
                else {
                    base.valueChanged.emit(value);
                }
            }
        };
        elem.combobox({
            allowInvalid: allowInvalid,
            title: title,
            placeholder: placeholder,
            clearOnSelect: clearOnSelect,
            onchange: onChange,
            inputBox: function (input) {
                base.inputBox = input;
            }
        });
    };
    return ComboBox;
}());
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ComboBox.prototype, "valueChanged", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [Array])
], ComboBox.prototype, "listObject", null);
ComboBox = __decorate([
    core_1.Directive({
        selector: '[combo-box]',
        exportAs: 'comboBox'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], ComboBox);
exports.ComboBox = ComboBox;
