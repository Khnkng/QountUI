/**
 * Created by seshu on 06-12-2016.
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
var USAddress_form_1 = require("../forms/USAddress.form");
var INDAddress_form_1 = require("../forms/INDAddress.form");
var Provinces_constants_1 = require("../constants/Provinces.constants");
var comboBox_directive_1 = require("../directives/comboBox.directive");
var USAddressContent = (function () {
    function USAddressContent(_fb, _addressForm) {
        this._fb = _fb;
        this._addressForm = _addressForm;
        this.allProvinces = Provinces_constants_1.PROVINCES.COUNTRY_PROVINCES;
        this.addressForm = this._fb.group(_addressForm.getForm());
    }
    USAddressContent.prototype.filterStates = function (stateName) {
        this.states = _.filter(this.allProvinces, function (state) {
            return state.country == stateName;
        });
    };
    USAddressContent.prototype.isValid = function () {
        return this.addressForm.valid;
    };
    USAddressContent.prototype.getData = function () {
        return this._addressForm.getData(this.addressForm);
    };
    USAddressContent.prototype.updateAddressForm = function (data) {
        var base = this;
        this._addressForm.updateForm(this.addressForm, data);
        var stateIndex = _.findIndex(this.states, function (state) {
            return state.name == data.state;
        });
        setTimeout(function () {
            base.stateComboBox.setValue(base.states[stateIndex], 'name');
        }, 0);
    };
    USAddressContent.prototype.setState = function (state) {
        if (state && state.name) {
            var data = this._addressForm.getData(this.addressForm);
            data.state = state.name;
            data.stateCode = state.short;
            this._addressForm.updateForm(this.addressForm, data);
        }
    };
    return USAddressContent;
}());
__decorate([
    core_1.ViewChild('stateComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], USAddressContent.prototype, "stateComboBox", void 0);
USAddressContent = __decorate([
    core_1.Component({
        selector: 'us-address-content',
        templateUrl: '/app/views/USAddress.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, USAddress_form_1.USAddressForm])
], USAddressContent);
exports.USAddressContent = USAddressContent;
var INAddressContent = (function () {
    function INAddressContent(_fb, _addressForm) {
        this._fb = _fb;
        this._addressForm = _addressForm;
        this.allProvinces = Provinces_constants_1.PROVINCES.COUNTRY_PROVINCES;
        this.addressForm = this._fb.group(_addressForm.getForm());
    }
    INAddressContent.prototype.isValid = function () {
        return this.addressForm.valid;
    };
    INAddressContent.prototype.getData = function () {
        return this._addressForm.getData(this.addressForm);
    };
    INAddressContent.prototype.updateAddressForm = function (data) {
        var base = this;
        this._addressForm.updateForm(this.addressForm, data);
        var stateIndex = _.findIndex(this.states, function (state) {
            return state.name == data.state;
        });
        setTimeout(function () {
            base.stateComboBox.setValue(base.states[stateIndex], 'name');
        }, 0);
    };
    INAddressContent.prototype.filterStates = function (stateName) {
        this.states = _.filter(this.allProvinces, function (state) {
            return state.country == stateName;
        });
    };
    INAddressContent.prototype.setState = function (state) {
        if (state && state.name) {
            var data = this._addressForm.getData(this.addressForm);
            data.state = state.name;
            data.stateCode = state.short;
            this._addressForm.updateForm(this.addressForm, data);
        }
    };
    return INAddressContent;
}());
__decorate([
    core_1.ViewChild('stateComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], INAddressContent.prototype, "stateComboBox", void 0);
INAddressContent = __decorate([
    core_1.Component({
        selector: 'IND-address-content',
        templateUrl: '/app/views/INDAddress.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, INDAddress_form_1.INDAddressForm])
], INAddressContent);
exports.INAddressContent = INAddressContent;
