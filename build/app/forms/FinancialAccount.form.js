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
var FinancialAccountForm = (function (_super) {
    __extends(FinancialAccountForm, _super);
    function FinancialAccountForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FinancialAccountForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "name": ['', forms_1.Validators.required],
            "starting_balance": ['', forms_1.Validators.required],
            "starting_balance_date": ['', forms_1.Validators.required],
            "user_name": [''],
            "id": [''],
            "password": [''],
            "account_holder_type": ['company', forms_1.Validators.required],
            "type": ['', forms_1.Validators.required],
            "importType": ['MANUAL'],
            "chart_of_account_id": [''],
            "account_number": [''],
            "routing_number": [''],
            "name_on_account": ['', forms_1.Validators.required],
            "transit_chart_of_account_id": [''],
            "showPaymentInfo": [false]
        };
    };
    return FinancialAccountForm;
}(abstractForm_1.abstractForm));
FinancialAccountForm = __decorate([
    core_1.Injectable()
], FinancialAccountForm);
exports.FinancialAccountForm = FinancialAccountForm;
