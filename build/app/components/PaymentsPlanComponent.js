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
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var PaymentsPlan_service_1 = require("qCommon/app/services/PaymentsPlan.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var PaymentsPlan_form_1 = require("../forms/PaymentsPlan.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var router_1 = require("@angular/router");
var Date_constants_1 = require("qCommon/app/constants/Date.constants");
var PaymentsPlanComponent = (function () {
    function PaymentsPlanComponent(_fb, _paymentPlanForm, switchBoard, _router, codeService, toastService, loadingService, titleService) {
        var _this = this;
        this._fb = _fb;
        this._paymentPlanForm = _paymentPlanForm;
        this.switchBoard = switchBoard;
        this._router = _router;
        this.codeService = codeService;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.titleService = titleService;
        this.paymentPlans = [];
        this.newFormActive = true;
        this.hasPaymentPlans = false;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.tableColumns = ['name', 'id', 'frequency', 'ends_after'];
        this.showFlyout = false;
        this.dayOfWeek = Date_constants_1.DAYS_OF_WEEK;
        this.dayOfMonth = Date_constants_1.DAYS_OF_MONTH;
        this.weekOfMonth = Date_constants_1.WEEK_OF_MONTH;
        this.monthOfQuarter = Date_constants_1.MONTH_OF_QUARTER;
        this.monthOfYear = Date_constants_1.MONTH_OF_YEAR;
        this.titleService.setPageTitle("Payments Plan");
        this.paymentPlanForm = this._fb.group(_paymentPlanForm.getForm());
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteItemCode(toast); });
        this.companyID = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showFlyout) {
                _this.hideFlyout();
            }
            else {
                _this.toolsRedirect();
            }
        });
        this.codeService.paymentPlans(this.companyID)
            .subscribe(function (paymentPlans) { return _this.buildTableData(paymentPlans); }, function (error) { return _this.handleError(error); });
    }
    PaymentsPlanComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    PaymentsPlanComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    PaymentsPlanComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.row = {};
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    PaymentsPlanComponent.prototype.showPaymentPlan = function () {
        this.titleService.setPageTitle("Create Payment Plan");
        this.editMode = false;
        this.paymentPlanForm = this._fb.group(this._paymentPlanForm.getForm());
        this.newForm();
        this.showFlyout = true;
    };
    PaymentsPlanComponent.prototype.showEditPaymentPlan = function (row) {
        var _this = this;
        this.titleService.setPageTitle("Update Payment Plan");
        this.loadingService.triggerLoadingEvent(true);
        this.codeService.getPaymentPlan(row.id, this.companyID)
            .subscribe(function (item) {
            _this.row = item;
            _this._paymentPlanForm.updateForm(_this.paymentPlanForm, _this.row);
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { return _this.handleError(error); });
        this.editMode = true;
        this.showFlyout = true;
    };
    PaymentsPlanComponent.prototype.deleteItemCode = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.codeService.removePaymentPlan(this.paymentPlanId, this.companyID)
            .subscribe(function (coa) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Payment plan deleted successfully");
            _this.codeService.paymentPlans(_this.companyID)
                .subscribe(function (paymentPlans) { return _this.buildTableData(paymentPlans); }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
    };
    PaymentsPlanComponent.prototype.removePaymentPlan = function (row) {
        this.paymentPlanId = row.id;
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    PaymentsPlanComponent.prototype.newForm = function () {
        var _this = this;
        this.newFormActive = false;
        setTimeout(function () { return _this.newFormActive = true; }, 0);
    };
    PaymentsPlanComponent.prototype.ngOnInit = function () {
    };
    PaymentsPlanComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditPaymentPlan($event);
        }
        else if (action == 'delete') {
            this.removePaymentPlan($event);
        }
    };
    PaymentsPlanComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._paymentPlanForm.getData(this.paymentPlanForm);
        if (data.frequency != 'daily' && !data.day) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select day");
            return;
        }
        else if ((data.frequency == 'quarterly' || data.frequency == 'yearly') && !data.month) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select month");
            return;
        }
        data.amount = data.amount + "";
        data.ends_after = moment(data.ends_after, 'MM/DD/YYYY').format("YYYY-MM-DD");
        if (data.frequency == 'quarterly' || data.frequency == 'yearly') {
            var dayObj = {};
            dayObj.month = data.month;
            dayObj.day = data.day;
            data.day_map = dayObj;
            delete data.day;
        }
        this.loadingService.triggerLoadingEvent(true);
        if (this.editMode) {
            data.id = this.row.id;
            this.codeService.updatePaymentPlan(data, this.companyID)
                .subscribe(function (itemCode) {
                base.row = {};
                base.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Payment plan updated successfully");
                var index = _.findIndex(base.paymentPlans, { id: data.id });
                base.paymentPlans[index] = itemCode;
                base.buildTableData(base.paymentPlans);
                _this.showFlyout = false;
            }, function (error) { return _this.handleError(error); });
        }
        else {
            this.codeService.addPaymentPlan(data, this.companyID)
                .subscribe(function (newItemcode) {
                _this.handleItemCode(newItemcode);
                _this.showFlyout = false;
            }, function (error) { return _this.handleError(error); });
        }
    };
    PaymentsPlanComponent.prototype.handleItemCode = function (newItemCode) {
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Payment plan created successfully");
        this.paymentPlans.push(newItemCode);
        this.buildTableData(this.paymentPlans);
    };
    PaymentsPlanComponent.prototype.buildTableData = function (paymentPlans) {
        this.hasPaymentPlans = false;
        this.paymentPlans = paymentPlans;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "frequency", "title": "Frequency" },
            { "name": "ends_after", "title": "End Date" },
            { "name": "id", "title": "Id", "visible": false },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        paymentPlans.forEach(function (itemCode) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                row[key] = itemCode[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasPaymentPlans = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    PaymentsPlanComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Payments Plan");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    };
    PaymentsPlanComponent.prototype.setPlanEndDate = function (date) {
        var planEndDateControl = this.paymentPlanForm.controls['ends_after'];
        planEndDateControl.patchValue(date);
    };
    return PaymentsPlanComponent;
}());
PaymentsPlanComponent = __decorate([
    core_1.Component({
        selector: 'payments-plan',
        templateUrl: '/app/views/PaymentsPlan.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, PaymentsPlan_form_1.PaymentsPlan, SwitchBoard_1.SwitchBoard, router_1.Router,
        PaymentsPlan_service_1.PaymentsPlanService, Toast_service_1.ToastService, LoadingService_1.LoadingService,
        PageTitle_1.pageTitleService])
], PaymentsPlanComponent);
exports.PaymentsPlanComponent = PaymentsPlanComponent;
