/**
 * Created by seshu on 25-07-2016.
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
var BillForm = (function (_super) {
    __extends(BillForm, _super);
    function BillForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BillForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "title": ['', forms_1.Validators.required],
            "vendorID": [''],
            "amount": [0, forms_1.Validators.required],
            "companyID": [''],
            "elibleFor1099": [''],
            "id": [''],
            "link": [''],
            "userID": [''],
            "currentUsers": [''],
            "poNumber": [''],
            "accountNumber": [''],
            "notes": [''],
            "lineAmount": [''],
            "lineDescription": [''],
            "quantity": [''],
            "unitPrice": [''],
            "dueDate": ['', forms_1.Validators.required],
            "term": ['', forms_1.Validators.required],
            "billDate": ['', forms_1.Validators.required],
            "endDate": [''],
            "recurring": ['', forms_1.Validators.required],
            "itemCode": [''],
            "expenseCode": [''],
            "currency": [''],
            "billID": [''],
            "has1099": [''],
            "tags": [[]],
            "_1099Amount": [0],
            "vendorName": ['', forms_1.Validators.required],
            "hasPaidApplied": [false],
            "vendorPaymentMethod": [''],
            "_1099Mapping": ['']
        };
    };
    return BillForm;
}(abstractForm_1.abstractForm));
BillForm = __decorate([
    core_1.Injectable()
], BillForm);
exports.BillForm = BillForm;
