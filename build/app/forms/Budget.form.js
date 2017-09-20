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
var BudgetForm = (function (_super) {
    __extends(BudgetForm, _super);
    function BudgetForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BudgetForm.prototype.getForm = function (model) {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "name": [model ? model.name : '', forms_1.Validators.required],
            /* "amount": [model ? model.amount : '',Validators.required],
             "frequency": [model ? model.frequency : '',Validators.required],*/
            "description": [model ? model.description : ''],
            id: [model ? model.id : ''],
            "year": [model ? model.year : '', forms_1.Validators.required],
            "defaultBudget": [model ? model.defaultBudget : false, forms_1.Validators.required]
        };
    };
    return BudgetForm;
}(abstractForm_1.abstractForm));
BudgetForm = __decorate([
    core_1.Injectable()
], BudgetForm);
exports.BudgetForm = BudgetForm;
var BudgetItemForm = (function (_super) {
    __extends(BudgetItemForm, _super);
    function BudgetItemForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BudgetItemForm.prototype.getForm = function (item) {
        return {
            "coaID": [item ? item.coaID : ''],
            "jan": [item ? item.jan : ''],
            "feb": [item ? item.feb : ''],
            "mar": [item ? item.mar : ''],
            "apr": [item ? item.apr : ''],
            "may": [item ? item.may : ''],
            "jun": [item ? item.jun : ''],
            "jul": [item ? item.jul : ''],
            "aug": [item ? item.aug : ''],
            "sep": [item ? item.sep : ''],
            "oct": [item ? item.oct : ''],
            "nov": [item ? item.nov : ''],
            "dec": [item ? item.dec : ''],
            "total": [item ? item.total : '']
        };
    };
    return BudgetItemForm;
}(abstractForm_1.abstractForm));
BudgetItemForm = __decorate([
    core_1.Injectable()
], BudgetItemForm);
exports.BudgetItemForm = BudgetItemForm;
