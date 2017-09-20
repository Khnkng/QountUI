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
var RuleForm = (function (_super) {
    __extends(RuleForm, _super);
    function RuleForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RuleForm.prototype.getForm = function () {
        return {
            "sourceType": ['Expense', forms_1.Validators.required],
            "source": ['', forms_1.Validators.required],
            "ruleName": [''],
            "attributeName": [''],
            "vendorValue": [''],
            "vendorType": [''],
            "sourceType": [''],
            "customerValue": [''],
            "customerType": [''],
            "comparisionType": ['', forms_1.Validators.required],
            "comparisionValue": ['', forms_1.Validators.required],
            "logicalOperator": [''],
            "effectiveDate": [''],
            "endDate": [''],
            "attributeName1": [''],
            "comparisionValue2": [''],
            "chartOfAccount": [''],
            "comparisionType1": ['', forms_1.Validators.required],
            "comparisionValue1": ['', forms_1.Validators.required]
        };
    };
    return RuleForm;
}(abstractForm_1.abstractForm));
RuleForm = __decorate([
    core_1.Injectable()
], RuleForm);
exports.RuleForm = RuleForm;
var RuleActionForm = (function (_super) {
    __extends(RuleActionForm, _super);
    function RuleActionForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RuleActionForm.prototype.getForm = function (model) {
        return {
            action: [model ? model.action : ''],
            actionValue: [model ? model.actionValue : ''],
            id: [model ? model.id : '', forms_1.Validators.required]
        };
    };
    return RuleActionForm;
}(abstractForm_1.abstractForm));
RuleActionForm = __decorate([
    core_1.Injectable()
], RuleActionForm);
exports.RuleActionForm = RuleActionForm;
