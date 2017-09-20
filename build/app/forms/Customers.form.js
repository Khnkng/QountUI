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
var CustomersForm = (function (_super) {
    __extends(CustomersForm, _super);
    function CustomersForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomersForm.prototype.getForm = function () {
        return {
            "customer_name": ['', forms_1.Validators.required],
            "customer_ein": [''],
            "customer_country": ['', forms_1.Validators.required],
            /*"email_ids": [['']],
            "customer_address":[''],*/
            "coa": [''],
            "customer_city": ['', forms_1.Validators.required],
            "customer_state": ['', forms_1.Validators.required],
            "customer_zipcode": ['', forms_1.Validators.required],
            "phone_number": ['', forms_1.Validators.required],
            "term": [''],
            "street_1": ['', forms_1.Validators.required],
            "street_2": [''],
            "fax": ['']
        };
    };
    return CustomersForm;
}(abstractForm_1.abstractForm));
CustomersForm = __decorate([
    core_1.Injectable()
], CustomersForm);
exports.CustomersForm = CustomersForm;
var ContactLineForm = (function (_super) {
    __extends(ContactLineForm, _super);
    function ContactLineForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContactLineForm.prototype.getForm = function (item) {
        return {
            "first_name": [item ? item.first_name : ''],
            "last_name": [item ? item.last_name : ''],
            "mobile": [item ? item.mobile : ''],
            "email": [item ? item.email : ''],
            "id": [item ? item.id : null],
            "other": [item ? item.other : ""]
        };
    };
    return ContactLineForm;
}(abstractForm_1.abstractForm));
ContactLineForm = __decorate([
    core_1.Injectable()
], ContactLineForm);
exports.ContactLineForm = ContactLineForm;
