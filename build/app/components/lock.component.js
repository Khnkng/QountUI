/**
 * Created by Nazia on 13-03-2017.
 */
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
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Provinces_constants_1 = require("qCommon/app/constants/Provinces.constants");
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var footable_directive_1 = require("qCommon/app/directives/footable.directive");
var lock_form_1 = require("../forms/lock.form");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var address_directive_1 = require("qCommon/app/directives/address.directive");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var lockComponent = (function () {
    function lockComponent(_fb, companyService, _lockform, _router, loadingService, vendorService, _toastService, titleService, switchBoard, coaService, dateFormater) {
        var _this = this;
        this._fb = _fb;
        this.companyService = companyService;
        this._lockform = _lockform;
        this._router = _router;
        this.loadingService = loadingService;
        this.vendorService = vendorService;
        this._toastService = _toastService;
        this.titleService = titleService;
        this.switchBoard = switchBoard;
        this.coaService = coaService;
        this.dateFormater = dateFormater;
        this.tableData = {};
        this.tableOptions = {};
        this.hasItemCodes = false;
        // tableColumns:Array<string> = ['id','lock_created_at', 'lock_created_by'];
        this.editMode = false;
        this.countries = Provinces_constants_1.PROVINCES.COUNTRIES;
        this.companies = [];
        this.currentCompany = {};
        this.showFlyout = false;
        this.haslockdate = false;
        this.hasnolockdate = true;
        this.titleService.setPageTitle("Lock");
        this.LockForm = this._fb.group(_lockform.getLock());
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.companyId = Session_1.Session.getCurrentCompany();
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteLock(toast); });
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.getLockofCompany(this.companyId)
            .subscribe(function (lockList) {
            _this.buildTableData(lockList);
            _this.lockList = lockList;
            for (var i = 0; i < lockList.length; i++) {
                if (lockList[i].active_lock_date) {
                    _this.lockdate = lockList[i].active_lock_date;
                    lockList.active_lock_date = _this.dateFormater.formatDate(lockList.active_lock_date, _this.serviceDateformat, _this.dateFormat);
                }
            }
            ;
            _this.showFlyout = false;
        }, function (error) { return _this.handleError(error); });
        this.companyService.getcurrentLock(this.companyId)
            .subscribe(function (currentlock) {
            currentlock.min_lock_date = _this.dateFormater.formatDate(currentlock.min_lock_date, _this.serviceDateformat, _this.dateFormat);
            _this.currentlock = currentlock.min_lock_date;
            console.log("this.currentlock", _this.currentlock);
        });
        this.todaysDate = moment(new Date()).format(this.dateFormat);
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showFlyout) {
                _this.hideFlyout();
            }
            else {
                _this.toolsRedirect();
            }
        });
    }
    lockComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    lockComponent.prototype.buildTableData = function (lockList) {
        this.hasItemCodes = false;
        this.lockList = lockList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "id", "title": "id", "visible": false },
            { "name": "lock_date", "title": "Lock" },
            { "name": "created_at", "title": "Created Date" },
            { "name": "created_by", "title": "Created By" },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        _.each(lockList, function (lockList) {
            if (lockList.lock_date) {
                var row = {};
                row['id'] = lockList.id;
                lockList.active_lock_date = base.dateFormater.formatDate(lockList.active_lock_date, base.serviceDateformat, base.dateFormat);
                lockList.created_at = base.dateFormater.formatDate(lockList.created_at, base.serviceDateformat, base.dateFormat);
                lockList.lock_date = base.dateFormater.formatDate(lockList.lock_date, base.serviceDateformat, base.dateFormat);
                row['lock_date'] = lockList.lock_date;
                row['created_at'] = lockList.created_at;
                row['created_by'] = lockList.created_by;
                if (lockList.active_lock_date == lockList.lock_date) {
                    row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
                }
                base.tableData.rows.push(row);
            }
        });
        base.hasItemCodes = false;
        setTimeout(function () {
            base.hasItemCodes = true;
        });
        this.loadingService.triggerLoadingEvent(false);
    };
    lockComponent.prototype.handleAction = function ($event) {
        var _this = this;
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.loadingService.triggerLoadingEvent(true);
            this.companyService.lock(this.companyId, $event.id).subscribe(function (tax) {
                _this.row = tax;
                _this.locksrow = tax.shared_with;
                _this.haslockdate = true;
                _this.hasnolockdate = false;
                _this.showEditLock(_this.row);
            }, function (error) { return _this.handleError(error); });
        }
        else if (action == 'delete') {
            this.removeLock($event);
        }
    };
    lockComponent.prototype.showEditLock = function (row) {
        this.titleService.setPageTitle("UPDATE LOCK");
        this.haslockdate = true;
        this.hasnolockdate = false;
        this.showFlyout = true;
        this.editMode = true;
        this.LockForm = this._fb.group(this._lockform.getLock());
        this.getLockDetails(row);
        this.loadingService.triggerLoadingEvent(false);
    };
    lockComponent.prototype.removeLock = function (row) {
        var vendor = row;
        this.lockId = row.id;
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    lockComponent.prototype.deleteLock = function (toast) {
        // console.log("this.companyId",this.companyId);
        // this.loadingService.triggerLoadingEvent(true);
        // this.companyService.removeLock(this.lockId, this.companyId)
        //     .subscribe(success  => {
        //         this._toastService.pop(TOAST_TYPE.success, "Lock deleted successfully");
        //         this.companyService.getLockofCompany(this.companyId)
        //             .subscribe(lockList  => {
        //                 this.buildTableData(lockList);
        //                 this.loadingService.triggerLoadingEvent(false);
        //                 return;
        //             }, error =>  this.handleError(error));
        //     }, error =>  this.handleError(error));
    };
    lockComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    lockComponent.prototype.getLockDetails = function (row) {
        var base = this;
        row.lock_date = this.dateFormater.formatDate(row.lock_date, this.serviceDateformat, this.dateFormat);
        this.lockdate = row.lock_date;
        var lock_created_at = this.LockForm.controls['lock_date'];
        lock_created_at.patchValue(row.lock_date);
        var key = this.LockForm.controls['key'];
        key.patchValue(row.key);
        // this.locksrow=tax.shared_with;
        this._lockform.updateForm(this.LockForm, row);
    };
    lockComponent.prototype.showCreateLock = function () {
        var _this = this;
        this.titleService.setPageTitle("CREATE LOCK");
        var self = this;
        this.locksrow = [];
        this.haslockdate = false;
        this.hasnolockdate = true;
        this.editMode = false;
        this.LockForm.reset();
        this.companyService.getLockofCompany(this.companyId)
            .subscribe(function (lockList) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.lockList = lockList;
            for (var i = 0; i < lockList.length; i++) {
                if (lockList[i].active_lock_date) {
                    _this.lockdate = lockList[i].active_lock_date;
                    _this.lockdate = _this.dateFormater.formatDate(_this.lockdate, _this.serviceDateformat, _this.dateFormat);
                }
            }
            ;
        }, function (error) { return _this.handleError(error); });
        this.todaysDate = moment(new Date()).format(this.dateFormat);
        this.showFlyout = true;
    };
    lockComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Lock");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    };
    lockComponent.prototype.isValid = function (LockForm) {
        if ((LockForm.value.lock_date) && (LockForm.value.key)) {
            return true;
        }
        return false;
    };
    lockComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._lockform.getData(this.LockForm);
        console.log(data);
        this.companyId = Session_1.Session.getCurrentCompany();
        var Emailaddress = jQuery('#shared_with').tagit("assignedTags");
        data.shared_with = Emailaddress;
        data.lock_date = this.dateFormater.formatDate(data.lock_date, this.dateFormat, this.serviceDateformat);
        data.created_at = this.dateFormater.formatDate(data.created_at, this.dateFormat, this.serviceDateformat);
        this.loadingService.triggerLoadingEvent(true);
        if (this.editMode) {
            data.id = this.row.id;
            this.companyService.updateLock(data, this.companyId)
                .subscribe(function (success) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.showMessage(true, success);
                _this.showFlyout = false;
            }, function (error) { return _this.showMessage(false, error); });
        }
        else {
            delete data.created_at;
            delete data.created_by;
            var Emailaddress = jQuery('#shared_with').tagit("assignedTags");
            data.shared_with = Emailaddress;
            this.companyService.addLock(data, this.companyId)
                .subscribe(function (success) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.showMessage(true, success);
                _this.companyService.getLockofCompany(_this.companyId)
                    .subscribe(function (lockList) {
                    _this.lockList = lockList;
                    for (var i = 0; i < lockList.length; i++) {
                        if (lockList[i].active_lock_date) {
                            _this.lockdate = lockList[i].active_lock_date;
                            _this.lockdate = _this.dateFormater.formatDate(_this.lockdate, _this.serviceDateformat, _this.dateFormat);
                        }
                    }
                    ;
                    console.log("this.lockdatecreated", _this.lockdate);
                }, function (error) { return _this.handleError(error); });
                _this.showFlyout = false;
            }, function (error) { return _this.showMessage(false, error); });
        }
    };
    lockComponent.prototype.setDate = function (date, lockdate) {
        var jeDateControl = this.LockForm.controls['lock_date'];
        jeDateControl.patchValue(date);
    };
    lockComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    lockComponent.prototype.showMessage = function (status, obj) {
        var _this = this;
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.hasItemCodes = false;
            if (this.editMode) {
                this.companyService.getLockofCompany(this.companyId)
                    .subscribe(function (lockList) {
                    for (var i = 0; i < lockList.length; i++) {
                        if (lockList[i].active_lock_date) {
                            _this.lockdate = lockList[i].active_lock_date;
                            _this.lockdate = _this.dateFormater.formatDate(_this.lockdate, _this.serviceDateformat, _this.dateFormat);
                        }
                    }
                    ;
                    _this.buildTableData(lockList);
                    _this.loadingService.triggerLoadingEvent(false);
                    _this.lockList = lockList;
                }, function (error) { return _this.handleError(error); });
                this.LockForm.reset();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Lock updated successfully.");
            }
            else {
                this.companyService.getLockofCompany(this.companyId)
                    .subscribe(function (lockList) {
                    _this.buildTableData(lockList);
                    _this.loadingService.triggerLoadingEvent(false);
                    _this.lockList = lockList;
                }, function (error) { return _this.handleError(error); });
                this.LockForm.reset();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Lock created successfully.");
            }
        }
        else {
            this.status = {};
            this.status['error'] = true;
            try {
                var resp = JSON.parse(obj);
                if (resp.message) {
                    this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, resp.message);
                }
                else {
                    this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
                }
            }
            catch (err) {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
            }
        }
    };
    return lockComponent;
}());
__decorate([
    core_1.ViewChild('createtaxes'),
    __metadata("design:type", Object)
], lockComponent.prototype, "createtaxes", void 0);
__decorate([
    core_1.ViewChild('vendorCountryComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], lockComponent.prototype, "vendorCountryComboBox", void 0);
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], lockComponent.prototype, "fooTableDir", void 0);
__decorate([
    core_1.ViewChild('coaComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], lockComponent.prototype, "coaComboBox", void 0);
__decorate([
    core_1.ViewChild("newVendorComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], lockComponent.prototype, "newVendorComboBox", void 0);
__decorate([
    core_1.ViewChild('addressDir'),
    __metadata("design:type", address_directive_1.Address)
], lockComponent.prototype, "addressDir", void 0);
lockComponent = __decorate([
    core_1.Component({
        selector: 'lock',
        templateUrl: '/app/views/lock.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, Companies_service_1.CompaniesService, lock_form_1.LockForm,
        router_1.Router, LoadingService_1.LoadingService, Companies_service_1.CompaniesService,
        Toast_service_1.ToastService, PageTitle_1.pageTitleService, SwitchBoard_1.SwitchBoard, ChartOfAccounts_service_1.ChartOfAccountsService, DateFormatter_service_1.DateFormater])
], lockComponent);
exports.lockComponent = lockComponent;
