/**
 * Created by Chandu on 28-09-2016.
 */
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
var core_1 = require("@angular/core");
var abstractForm_1 = require("qCommon/app/forms/abstractForm");
var forms_1 = require("@angular/forms");
var InvoiceSettingsForm = (function (_super) {
    __extends(InvoiceSettingsForm, _super);
    function InvoiceSettingsForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InvoiceSettingsForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "templateType": ["Contemporary"],
            "companyLogo": [""],
            "documentId": [""],
            "displayLogo": [false],
            "accentColor": ["", forms_1.Validators.required],
            "defaultPaymentTerms": [""],
            "defaultTitle": ["", forms_1.Validators.required],
            "defaultSubHeading": [""],
            "defaultFooter": [""],
            "standardMemo": [""],
            "items": ["Items"],
            "units": ["Units"],
            "price": ["Price"],
            "amount": ["Amount"],
            "hideItemName": [false],
            "hideItemDescription": [false],
            "hideUnits": [false],
            "hidePrice": [false],
            "hideAmount": [false],
            "otherItems": [""],
            "otherUnits": [""],
            "otherPrice": [""],
            "otherAmount": [""]
        };
    };
    return InvoiceSettingsForm;
}(abstractForm_1.abstractForm));
InvoiceSettingsForm = __decorate([
    core_1.Injectable()
], InvoiceSettingsForm);
exports.InvoiceSettingsForm = InvoiceSettingsForm;
