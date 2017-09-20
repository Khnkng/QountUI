"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Nazia on 19-01-2017.
 */
var core_1 = require("@angular/core");
var abstractForm_1 = require("qCommon/app/forms/abstractForm");
var forms_1 = require("@angular/forms");
var TaxesForm = (function (_super) {
    __extends(TaxesForm, _super);
    function TaxesForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TaxesForm.prototype.getTax = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "name": ['', forms_1.Validators.required],
            "tin": ['', forms_1.Validators.required],
            "taxAuthorityName": ['', forms_1.Validators.required],
            "taxAuthorityId": ['', forms_1.Validators.required],
            "taxLiabilityCoa": ['', forms_1.Validators.required],
            "description": ['', forms_1.Validators.required],
            "taxRate": ['', forms_1.Validators.required],
            "compoundTax": ['',],
            "recoverableTax": [''],
            "visibleOnInvoices": ['']
        };
    };
    return TaxesForm;
}(abstractForm_1.abstractForm));
TaxesForm = __decorate([
    core_1.Injectable()
], TaxesForm);
exports.TaxesForm = TaxesForm;
