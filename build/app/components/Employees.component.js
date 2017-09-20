"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var footable_directive_1 = require("qCommon/app/directives/footable.directive");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Employees_service_1 = require("qCommon/app/services/Employees.service");
var Employees_form_1 = require("../forms/Employees.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var EmployeesComponent = (function () {
    function EmployeesComponent(_fb, employeeService, _employeesForm, _router, _toastService, switchBoard, loadingService, titleService) {
        var _this = this;
        this._fb = _fb;
        this.employeeService = employeeService;
        this._employeesForm = _employeesForm;
        this._router = _router;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.titleService = titleService;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.hasEmployeesList = false;
        this.companies = [];
        this.showFlyout = false;
        this.active1 = true;
        // Reset the form with a new hero AND restore 'pristine' class state
        // by toggling 'active' flag which causes the form
        // to be removed/re-added in a tick via NgIf
        // TODO: Workaround until NgForm has a reset method (#6822)
        this.active = true;
        this.titleService.setPageTitle("Employees");
        this.employeesForm = this._fb.group(_employeesForm.getForm());
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteEmployee(toast); });
        this.companyId = Session_1.Session.getCurrentCompany();
        if (this.companyId) {
            this.loadingService.triggerLoadingEvent(true);
            this.employeeService.employees(this.companyId).subscribe(function (employees) {
                _this.buildTableData(employees);
            }, function (error) { return _this.handleError(error); });
        }
        else {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please add company first");
        }
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showFlyout) {
                _this.hideFlyout();
            }
            else {
                _this.toolsRedirect();
            }
        });
    }
    EmployeesComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    EmployeesComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    EmployeesComponent.prototype.buildTableData = function (employees) {
        this.employees = employees;
        this.hasEmployeesList = false;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.rows = [];
        this.tableData.columns = [
            { "name": "id", "title": "ID", "visible": false },
            { "name": "first_name", "title": "FirstName" },
            { "name": "last_name", "title": "LastName" },
            { "name": "ssn", "title": "SSN" },
            { "name": "email_id", "title": "Email" },
            { "name": "phone_number", "title": "Phone" },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        var base = this;
        this.employees.forEach(function (employees) {
            var row = {};
            for (var key in base.employees[0]) {
                row[key] = employees[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasEmployeesList = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    EmployeesComponent.prototype.showCreateEmployee = function () {
        this.titleService.setPageTitle("CREATE EMPLOYEE");
        var self = this;
        this.editMode = false;
        this.employeesForm = this._fb.group(this._employeesForm.getForm());
        this.newForm1();
        this.showFlyout = true;
    };
    EmployeesComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditEmployee($event);
        }
        else if (action == 'delete') {
            this.removeEmployee($event);
        }
    };
    EmployeesComponent.prototype.deleteEmployee = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.employeeService.removeEmployee(this.employeeId, this.companyId)
            .subscribe(function (success) {
            _this.loadingService.triggerLoadingEvent(false);
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Customer deleted successfully");
            _this.employeeService.employees(_this.companyId)
                .subscribe(function (customers) { return _this.buildTableData(customers); }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
    };
    EmployeesComponent.prototype.removeEmployee = function (row) {
        var employee = row;
        this.employeeId = employee.id;
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    EmployeesComponent.prototype.newForm1 = function () {
        var _this = this;
        this.active1 = false;
        setTimeout(function () { return _this.active1 = true; }, 0);
    };
    EmployeesComponent.prototype.showEditEmployee = function (row) {
        var _this = this;
        this.titleService.setPageTitle("UPDATE EMPLOYEE");
        this.editMode = true;
        this.showFlyout = true;
        this.row = row;
        this.employeeService.employee(row.id, this.companyId)
            .subscribe(function (employee) {
            _this.row = employee;
            var email_id = _this.employeesForm.controls['email_id'];
            email_id.patchValue(employee.email_id);
            var phone_number = _this.employeesForm.controls['phone_number'];
            phone_number.patchValue(employee.phone_number);
            var base = _this;
            _this._employeesForm.updateForm(_this.employeesForm, row);
        }, function (error) { return _this.handleError(error); });
    };
    EmployeesComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._employeesForm.getData(this.employeesForm);
        this.companyId = Session_1.Session.getCurrentCompany();
        this.loadingService.triggerLoadingEvent(true);
        if (this.editMode) {
            data.id = this.row.id;
            this.employeeService.updateEmployee(data, this.companyId)
                .subscribe(function (success) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.showMessage(true, success);
            }, function (error) { return _this.showMessage(false, error); });
            this.showFlyout = false;
        }
        else {
            this.employeeService.addEmployee(data, this.companyId)
                .subscribe(function (success) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.showMessage(true, success);
            }, function (error) { return _this.showMessage(false, error); });
            this.showFlyout = false;
        }
    };
    EmployeesComponent.prototype.showMessage = function (status, obj) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(false);
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.hasEmployeesList = false;
            if (this.editMode) {
                this.employeeService.employees(this.companyId)
                    .subscribe(function (employees) { return _this.buildTableData(employees); }, function (error) { return _this.handleError(error); });
                this.newForm1();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Employee updated successfully.");
            }
            else {
                this.newForm1();
                this.employeeService.employees(this.companyId)
                    .subscribe(function (employees) { return _this.buildTableData(employees); }, function (error) { return _this.handleError(error); });
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Employee created successfully.");
            }
            this.newCustomer();
        }
        else {
            this.status = {};
            this.status['error'] = true;
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to update the Employee");
            this.message = obj;
        }
    };
    EmployeesComponent.prototype.setDateOfBirth = function (date) {
        var empDateControl = this.employeesForm.controls['dob'];
        empDateControl.patchValue(date);
    };
    EmployeesComponent.prototype.newCustomer = function () {
        var _this = this;
        this.active = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    EmployeesComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    EmployeesComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Employees");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    };
    return EmployeesComponent;
}());
__decorate([
    core_1.ViewChild('createVendor'),
    __metadata("design:type", Object)
], EmployeesComponent.prototype, "createVendor", void 0);
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], EmployeesComponent.prototype, "fooTableDir", void 0);
EmployeesComponent = __decorate([
    core_1.Component({
        selector: 'employees',
        templateUrl: '/app/views/employees.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, Employees_service_1.EmployeeService,
        Employees_form_1.EmployeesForm, router_1.Router, Toast_service_1.ToastService,
        SwitchBoard_1.SwitchBoard, LoadingService_1.LoadingService, PageTitle_1.pageTitleService])
], EmployeesComponent);
exports.EmployeesComponent = EmployeesComponent;
