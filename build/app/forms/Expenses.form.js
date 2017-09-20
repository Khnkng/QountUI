/**
 * Created by Chandu on 06-02-2017.
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
var ExpenseForm = (function (_super) {
    __extends(ExpenseForm, _super);
    function ExpenseForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpenseForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "title": ['', forms_1.Validators.required],
            "amount": ['', forms_1.Validators.required],
            "is_paid": [false],
            "paid_date": [''],
            "due_date": [''],
            "bank_account_id": ['', forms_1.Validators.required],
            "id": [''],
            "type": [''],
            "reference_number": [''],
            "expense_type": [''],
            "mapping_id": ['']
        };
    };
    return ExpenseForm;
}(abstractForm_1.abstractForm));
ExpenseForm = __decorate([
    core_1.Injectable()
], ExpenseForm);
exports.ExpenseForm = ExpenseForm;
var ExpenseItemForm = (function (_super) {
    __extends(ExpenseItemForm, _super);
    function ExpenseItemForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpenseItemForm.prototype.getForm = function (item) {
        return {
            "title": [item ? item.title : ''],
            "amount": [item ? item.amount : 0],
            "notes": [item ? item.notes : ''],
            "entity_id": [item ? item.entity_id : ''],
            "chart_of_account_id": [item ? item.chart_of_account_id : ''],
            "id": [item ? item.id : null],
            "destroy": [item ? item.destroy : false],
            "dimensions": [item ? item.dimensions : []]
        };
    };
    return ExpenseItemForm;
}(abstractForm_1.abstractForm));
ExpenseItemForm = __decorate([
    core_1.Injectable()
], ExpenseItemForm);
exports.ExpenseItemForm = ExpenseItemForm;
