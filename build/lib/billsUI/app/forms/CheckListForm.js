/**
 * Created by seshu on 06-08-2016.
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
var checkBox_validator_1 = require("../validators/checkBox.validator");
var abstractForm_1 = require("qCommon/app/forms/abstractForm");
var CheckListForm = (function (_super) {
    __extends(CheckListForm, _super);
    function CheckListForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckListForm.prototype.getForm = function (model) {
        return {
            item: [model ? model.item : ''],
            acknowledged: [model ? model.acknowledged : '', checkBox_validator_1.CheckBoxValidator.hasChecked]
        };
    };
    return CheckListForm;
}(abstractForm_1.abstractForm));
CheckListForm = __decorate([
    core_1.Injectable()
], CheckListForm);
exports.CheckListForm = CheckListForm;
var LineListForm = (function (_super) {
    __extends(LineListForm, _super);
    function LineListForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LineListForm.prototype.getForm = function (model) {
        return {
            number: [model ? model.number : 0],
            description: [model ? model.description : ''],
            unitPrice: [model ? model.unitPrice : 0],
            quantity: [model ? model.quantity : 0],
            amount: [model ? model.amount : 0],
            itemCode: [model ? model.itemCode : ''],
            expenseCode: [model ? model.expenseCode : ''],
            has1099: [model ? model.has1099 : false],
            hasAsset: [model ? model.hasAsset : false],
            _1099Mapping: [model ? model._1099Mapping : ''],
            tags: [model ? model.tags : []],
            billLineId: [model ? model.billLineId : null],
            dimensions: [model ? model.dimensions : []],
            destroy: [model ? model.destroy : false]
        };
    };
    return LineListForm;
}(abstractForm_1.abstractForm));
LineListForm = __decorate([
    core_1.Injectable()
], LineListForm);
exports.LineListForm = LineListForm;
var CreditLineListForm = (function (_super) {
    __extends(CreditLineListForm, _super);
    function CreditLineListForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreditLineListForm.prototype.getForm = function (model) {
        return {
            id: [model ? model.id : ''],
            creditID: [model ? model.creditID : ''],
            number: [model ? model.number : 0],
            description: [model ? model.description : ''],
            unitPrice: [model ? model.unitPrice : 0],
            quantity: [model ? model.quantity : 0],
            totalAmount: [model ? model.totalAmount : 0],
            notes: [model ? model.notes : ''],
            itemCode: [model ? model.itemCode : ''],
            expenseCode: [model ? model.expenseCode : ''],
        };
    };
    return CreditLineListForm;
}(abstractForm_1.abstractForm));
CreditLineListForm = __decorate([
    core_1.Injectable()
], CreditLineListForm);
exports.CreditLineListForm = CreditLineListForm;
