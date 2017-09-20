/**
 * Created by venkatkollikonda on 23/02/17.
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
var EmployeesForm = (function (_super) {
    __extends(EmployeesForm, _super);
    function EmployeesForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EmployeesForm.prototype.getForm = function () {
        return {
            "id": [''],
            "first_name": ['', forms_1.Validators.required],
            "last_name": ['', forms_1.Validators.required],
            "ssn": ['', forms_1.Validators.required],
            "email_id": ['', forms_1.Validators.required],
            "phone_number": ['', forms_1.Validators.required],
            "dob": [''],
        };
    };
    return EmployeesForm;
}(abstractForm_1.abstractForm));
EmployeesForm = __decorate([
    core_1.Injectable()
], EmployeesForm);
exports.EmployeesForm = EmployeesForm;
