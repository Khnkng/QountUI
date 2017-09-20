/**
 * Created by yvadugu.
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
/*export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CustomTagComponent),
  multi: true
};*/
var CustomTagComponent = (function () {
    //propagateChange:any = (_: any) => {};
    function CustomTagComponent(elementRef) {
        this.elementRef = elementRef;
        if (this.inputType === "") {
            this.inputType = 'text';
        }
        this.height = "125px";
    }
    CustomTagComponent.prototype.validateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return (re.test(email));
    };
    CustomTagComponent.prototype.ngAfterViewInit = function () {
    };
    CustomTagComponent.prototype.writeValue = function (value) {
        if (value) {
            this._list = value;
        }
    };
    /*registerOnChange(fn) {
      this.propagateChange = fn;
    }*/
    CustomTagComponent.prototype.registerOnTouched = function () { };
    CustomTagComponent.prototype.addItem = function (event) {
        event.preventDefault();
        event.stopPropagation();
        if ((this.inputType != 'email') || (this.inputType == 'email' && this.validateEmail(event.target.value))) {
            /*this will help Pipe on this array to be immutable*/
            var _tempList = _.map(this._list, function (item) { return item.toLowerCase(); });
            if (_tempList.indexOf(event.target.value.toLowerCase()) == -1) {
                if (this._list && this._list.length > 0) {
                    this._list = [event.target.value].concat(this._list);
                }
                else {
                    this._list = [event.target.value];
                }
                //this.propagateChange(this._list);
                event.target.value = "";
                this.group.controls[this.controlName].patchValue(this._list);
            }
        }
        else {
            console.log("Please check Email format");
        }
        return false;
    };
    CustomTagComponent.prototype.removeItem = function (index) {
        this._list.splice(index, 1);
        this.group.controls[this.controlName].patchValue(this._list);
        //this.propagateChange(this._list);
    };
    return CustomTagComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], CustomTagComponent.prototype, "inputType", void 0);
__decorate([
    core_1.Input('_list'),
    __metadata("design:type", Object)
], CustomTagComponent.prototype, "_list", void 0);
__decorate([
    core_1.Input('placeholder'),
    __metadata("design:type", Object)
], CustomTagComponent.prototype, "placeholder", void 0);
__decorate([
    core_1.Input('height'),
    __metadata("design:type", String)
], CustomTagComponent.prototype, "height", void 0);
__decorate([
    core_1.Input('group'),
    __metadata("design:type", forms_1.FormGroup)
], CustomTagComponent.prototype, "group", void 0);
__decorate([
    core_1.Input('controlName'),
    __metadata("design:type", String)
], CustomTagComponent.prototype, "controlName", void 0);
CustomTagComponent = __decorate([
    core_1.Component({
        selector: 'custom-tag',
        templateUrl: '/app/views/customTag.html'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], CustomTagComponent);
exports.CustomTagComponent = CustomTagComponent;
