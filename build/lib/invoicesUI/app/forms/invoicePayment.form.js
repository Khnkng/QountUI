/**
 * Created by seshagirivellanki on 06/07/17.
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
var forms_1 = require("@angular/forms");
var abstractForm_1 = require("qCommon/app/forms/abstractForm");
var InvoicePaymentForm = (function (_super) {
    __extends(InvoicePaymentForm, _super);
    function InvoicePaymentForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InvoicePaymentForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "id": [""],
            "receivedFrom": ["", forms_1.Validators.required],
            "paymentAmount": ["", numberValidator],
            "currencyCode": ["", forms_1.Validators.required],
            "referenceNo": ["", forms_1.Validators.required],
            "paymentDate": ["", forms_1.Validators.required],
            "type": ["", forms_1.Validators.required],
            "memo": [""],
            "paymentNote": [""],
            "depositedTo": [""]
        };
    };
    return InvoicePaymentForm;
}(abstractForm_1.abstractForm));
InvoicePaymentForm = __decorate([
    core_1.Injectable()
], InvoicePaymentForm);
exports.InvoicePaymentForm = InvoicePaymentForm;
