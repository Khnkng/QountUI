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
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var footable_directive_1 = require("qCommon/app/directives/footable.directive");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var CompanyUsers_service_1 = require("qCommon/app/services/CompanyUsers.service");
var Users_form_1 = require("../forms/Users.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var UsersComponent = (function () {
    function UsersComponent(_fb, usersService, _usersForm, _router, _toastService, loadingService, switchBoard, toastService, titleService) {
        var _this = this;
        this._fb = _fb;
        this.usersService = usersService;
        this._usersForm = _usersForm;
        this._router = _router;
        this._toastService = _toastService;
        this.loadingService = loadingService;
        this.switchBoard = switchBoard;
        this.toastService = toastService;
        this.titleService = titleService;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.hasUsersList = false;
        this.canAddUsers = false;
        this.showFlyout = false;
        this.active1 = true;
        this.titleService.setPageTitle("Users");
        this.userForm = this._fb.group(_usersForm.getForm());
        this.companyId = Session_1.Session.getCurrentCompany();
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteUser(toast); });
        var defaultCompany = Session_1.Session.getUser().default_company || {};
        if (!_.isEmpty(defaultCompany)) {
            var roles = defaultCompany.roles;
            if (roles.indexOf('Owner') != -1 || roles.indexOf('Account Manager') != -1 || roles.indexOf('Admin') != -1 || roles.indexOf('Yoda') != -1) {
                this.canAddUsers = true;
            }
        }
        this.usersService.roles().subscribe(function (roles) {
            _.remove(roles, { 'id': 'Admin' });
            _this.roles = roles;
        }, function (error) { return _this.handleError(error); });
        if (this.companyId) {
            this.loadingService.triggerLoadingEvent(true);
            this.usersService.users(this.companyId).subscribe(function (users) {
                _this.buildTableData(users);
            }, function (error) { return _this.handleError(error); });
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
    UsersComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    UsersComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    UsersComponent.prototype.buildTableData = function (users) {
        this.users = users;
        this.hasUsersList = false;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.rows = [];
        this.tableData.columns = [
            { "name": "id", "title": "ID", "filterable": false, "visible": false },
            { "name": "firstName", "title": "First Name" },
            { "name": "lastName", "title": "Last Name" },
            { "name": "email", "title": "Email" },
            { "name": "roleID", "title": "Role" },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        var base = this;
        this.users.forEach(function (customers) {
            var row = {};
            for (var key in base.users[0]) {
                row[key] = customers[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasUsersList = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    UsersComponent.prototype.showCreateUser = function () {
        this.titleService.setPageTitle("CRETAE USER");
        this.editMode = false;
        this.userForm = this._fb.group(this._usersForm.getForm());
        this.newForm1();
        this.showFlyout = true;
    };
    UsersComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditVendor($event);
        }
        else if (action == 'delete') {
            this.removeUser($event);
        }
    };
    UsersComponent.prototype.showVendorProvince = function (role) {
        var countryControl = this.userForm.controls['roleID'];
        countryControl.patchValue(role.id);
    };
    UsersComponent.prototype.deleteUser = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.usersService.removeUser(this.userId, this.companyId)
            .subscribe(function (success) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "User deleted successfully");
            _this.usersService.users(_this.companyId)
                .subscribe(function (customers) { return _this.buildTableData(customers); }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
    };
    UsersComponent.prototype.removeUser = function (row) {
        var user = row;
        this.userId = user.id;
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    UsersComponent.prototype.newForm1 = function () {
        var _this = this;
        this.active1 = false;
        setTimeout(function () { return _this.active1 = true; }, 0);
    };
    UsersComponent.prototype.showEditVendor = function (row) {
        this.titleService.setPageTitle("UPDATE USER");
        this.editMode = true;
        //    jQuery(this.createUser.nativeElement).foundation('open');
        this.showFlyout = true;
        this.row = row;
        this.newForm1();
        this._usersForm.updateForm(this.userForm, row);
        var roleName = row.roleID;
        var role = _.find(this.roles, function (_country) {
            return _country.name == roleName;
        });
        var base = this;
        setTimeout(function () {
            base.userRoleComboBox.setValue(role, 'name');
        }, 100);
    };
    UsersComponent.prototype.submit = function ($event) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        $event && $event.preventDefault();
        var data = this._usersForm.getData(this.userForm);
        this.companyId = Session_1.Session.getCurrentCompany();
        if (this.editMode) {
            data.id = this.row.id;
            this.usersService.updateUser(data, this.companyId)
                .subscribe(function (success) { return _this.showMessage(true, success); }, function (error) { return _this.showMessage(false, error); });
            //   jQuery(this.createUser.nativeElement).foundation('close');
        }
        else {
            this.usersService.addUser(data, this.companyId)
                .subscribe(function (success) {
                _this.showMessage(true, success);
            }, function (error) { return _this.showMessage(false, error); });
        }
        this.showFlyout = false;
    };
    UsersComponent.prototype.showMessage = function (status, obj) {
        var _this = this;
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.hasUsersList = false;
            if (this.editMode) {
                this.usersService.users(this.companyId)
                    .subscribe(function (users) { return _this.buildTableData(users); }, function (error) { return _this.handleError(error); });
                this.newForm1();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "User updated successfully.");
            }
            else {
                this.newForm1();
                this.usersService.users(this.companyId)
                    .subscribe(function (users) { return _this.buildTableData(users); }, function (error) { return _this.handleError(error); });
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "user created successfully.");
            }
        }
        else {
            this.loadingService.triggerLoadingEvent(false);
            this.status = {};
            this.status['error'] = true;
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to update the user");
            this.message = obj;
        }
    };
    UsersComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete Item code?");
    };
    UsersComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Users");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    };
    return UsersComponent;
}());
__decorate([
    core_1.ViewChild('createUser'),
    __metadata("design:type", Object)
], UsersComponent.prototype, "createUser", void 0);
__decorate([
    core_1.ViewChild('userRoleComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], UsersComponent.prototype, "userRoleComboBox", void 0);
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], UsersComponent.prototype, "fooTableDir", void 0);
UsersComponent = __decorate([
    core_1.Component({
        selector: 'users',
        templateUrl: '/app/views/users.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, CompanyUsers_service_1.CompanyUsers, Users_form_1.UsersForm,
        router_1.Router, Toast_service_1.ToastService, LoadingService_1.LoadingService,
        SwitchBoard_1.SwitchBoard, Toast_service_1.ToastService, PageTitle_1.pageTitleService])
], UsersComponent);
exports.UsersComponent = UsersComponent;
