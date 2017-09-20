/**
 * Created by seshagirivellanki on 09/02/17.
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
var InvoiceLineForm = (function (_super) {
    __extends(InvoiceLineForm, _super);
    function InvoiceLineForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InvoiceLineForm.prototype.getForm = function (model) {
        return {
            item_id: [model ? model.item_id : ''],
            description: [model ? model.description : ''],
            quantity: [model ? model.quantity : 0],
            price: [model ? model.price : 0],
            name: [model ? model.name : ''],
            amount: [model ? model.amount : 0],
            destroy: [model ? model.destroy : false],
            type: [model ? model.type : ''],
            tax_id: [model ? model.tax_id : ''],
            id: [model ? model.id : '']
        };
    };
    return InvoiceLineForm;
}(abstractForm_1.abstractForm));
InvoiceLineForm = __decorate([
    core_1.Injectable()
], InvoiceLineForm);
exports.InvoiceLineForm = InvoiceLineForm;
var InvoiceLineTaxesForm = (function (_super) {
    __extends(InvoiceLineTaxesForm, _super);
    function InvoiceLineTaxesForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InvoiceLineTaxesForm.prototype.getForm = function (model) {
        return {
            tax_id: [model ? model.tax_id : ''],
            tax_rate: [model ? model.tax_rate : ''],
            name: [model ? model.name : '']
        };
    };
    return InvoiceLineTaxesForm;
}(abstractForm_1.abstractForm));
InvoiceLineTaxesForm = __decorate([
    core_1.Injectable()
], InvoiceLineTaxesForm);
exports.InvoiceLineTaxesForm = InvoiceLineTaxesForm;
