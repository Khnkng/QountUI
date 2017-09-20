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
var JournalEntryForm = (function (_super) {
    __extends(JournalEntryForm, _super);
    function JournalEntryForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JournalEntryForm.prototype.getForm = function () {
        var numberValidator = [];
        numberValidator.push(forms_1.Validators.pattern);
        numberValidator.push(forms_1.Validators.required);
        return {
            "number": ['', forms_1.Validators.required],
            "date": ['', forms_1.Validators.required],
            "source": ['Manual'],
            "type": ['Original'],
            "category": [''],
            "autoReverse": [false],
            "reversalDate": [''],
            "reversedFrom": [''],
            "recurring": [false],
            "nextJEDate": [''],
            "endDate": [''],
            "recurringFrequency": [''],
            "desc": [''],
            "jeType": ['Other'],
            "newType": [],
            "newTitle": [],
            "newCoa": [],
            "newDimensions": [],
            "newEntryType": [],
            "newAmount": [],
            "newMemo": [],
            "basis": ['Accrual']
        };
    };
    return JournalEntryForm;
}(abstractForm_1.abstractForm));
JournalEntryForm = __decorate([
    core_1.Injectable()
], JournalEntryForm);
exports.JournalEntryForm = JournalEntryForm;
var JournalLineForm = (function (_super) {
    __extends(JournalLineForm, _super);
    function JournalLineForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JournalLineForm.prototype.getForm = function (model) {
        return {
            type: [model ? model.type : ''],
            title: [model ? model.title : ''],
            coa: [model ? model.coa : ''],
            entryType: [model ? model.entryType : ''],
            amount: [model ? model.amount : 0],
            creditAmount: [model ? model.creditAmount : 0],
            debitAmount: [model ? model.debitAmount : 0],
            notes: [model ? model.notes : ''],
            entity: [model ? model.entity : ''],
            destroy: [model ? model.destroy : false],
            id: [model ? model.id : null],
            dimensions: [model ? model.dimensions : []],
            entityType: [model ? model.entityType : ''],
        };
    };
    return JournalLineForm;
}(abstractForm_1.abstractForm));
JournalLineForm = __decorate([
    core_1.Injectable()
], JournalLineForm);
exports.JournalLineForm = JournalLineForm;
