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
var DepositsForm = (function (_super) {
    __extends(DepositsForm, _super);
    function DepositsForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DepositsForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "title": ['', forms_1.Validators.required],
            "amount": ['', forms_1.Validators.required],
            "date": [''],
            "bank_account_id": ['', forms_1.Validators.required],
            "notes": [''],
            "id": [''],
            "deposit_type": ['']
        };
    };
    return DepositsForm;
}(abstractForm_1.abstractForm));
DepositsForm = __decorate([
    core_1.Injectable()
], DepositsForm);
exports.DepositsForm = DepositsForm;
var DepositsLineForm = (function (_super) {
    __extends(DepositsLineForm, _super);
    function DepositsLineForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DepositsLineForm.prototype.getForm = function (model) {
        return {
            amount: [model ? model.amount : 0],
            title: [model ? model.title : ''],
            chart_of_account_id: [model ? model.chart_of_account_id : ''],
            entity_id: [model ? model.entity_id : ''],
            id: [model ? model.id : null],
            invoice_id: [model ? model.invoice_id : ''],
            notes: [model ? model.notes : ''],
            "destroy": [model ? model.destroy : false],
            "dimensions": [model ? model.dimensions : []]
        };
    };
    return DepositsLineForm;
}(abstractForm_1.abstractForm));
DepositsLineForm = __decorate([
    core_1.Injectable()
], DepositsLineForm);
exports.DepositsLineForm = DepositsLineForm;
