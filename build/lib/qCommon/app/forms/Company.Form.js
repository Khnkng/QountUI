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
 * Created by seshu on 18-07-2016.
 */
var core_1 = require("@angular/core");
var abstractForm_1 = require("./abstractForm");
var forms_1 = require("@angular/forms");
var CompanyForm = (function (_super) {
    __extends(CompanyForm, _super);
    function CompanyForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CompanyForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "name": ['', forms_1.Validators.required],
            "einNumber": ['', forms_1.Validators.compose(numberValidator)],
            "companyType": [''],
            "companyClassification": [''],
            "country": [''],
            "phoneNumber": [''],
            "accountNumber": [''],
            "routingNumber": [''],
            "creditCardNumber": [''],
            //"user": [''],
            //      "invitedUserEmails": [[]],
            "bankName": [''],
            "cardHolderName": [''],
            "accountHolderName": [''],
            "type": [''],
            "fiscalStartDate": [''],
            "paymentType": [''],
            "month": [''],
            "year": [''],
            "cvv": [''],
            "expiryDate": [''],
            "nickName": [''],
            "creditCardHolderName": [''],
            "defaultCurrency": [''],
            "companyEmail": ['', forms_1.Validators.required],
            'email_id': ['', forms_1.Validators.required],
            'contact_first_name': ['', forms_1.Validators.required],
            'contact_last_name': ['', forms_1.Validators.required],
            'contact_date_of_birth': ['', forms_1.Validators.required]
        };
    };
    return CompanyForm;
}(abstractForm_1.abstractForm));
CompanyForm = __decorate([
    core_1.Injectable()
], CompanyForm);
exports.CompanyForm = CompanyForm;
