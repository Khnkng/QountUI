/**
 * Created by seshu on 19-07-2016.
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
var VendorForm = (function (_super) {
    __extends(VendorForm, _super);
    function VendorForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VendorForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "vendorType": ['', forms_1.Validators.required],
            "name": ['', forms_1.Validators.required],
            "ein": [''],
            "ssn": [''],
            "accountNumber": [''],
            "accountNumbers": [['']],
            "email": ['', forms_1.Validators.compose(numberValidator)],
            "address": ['', forms_1.Validators.required],
            "routingNumber": [''],
            "creditCardNumber": [''],
            "country": ['', forms_1.Validators.required],
            "state": ['', forms_1.Validators.required],
            "city": ['', forms_1.Validators.required],
            "zipcode": [''],
            "has1099": [''],
            "paymentMethod": [''],
            "coa": [''],
            "name_on_bank_account": [''],
            "bank_account_type": [''],
            "bank_account_holder_type": ['company'],
            "bank_account_number": [''],
            "bank_account_routing_number": [''],
            "contact_first_name": ['', forms_1.Validators.required],
            "contact_last_name": ['', forms_1.Validators.required]
        };
    };
    return VendorForm;
}(abstractForm_1.abstractForm));
VendorForm = __decorate([
    core_1.Injectable()
], VendorForm);
exports.VendorForm = VendorForm;
