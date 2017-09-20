/**
 * Created by Nazia on 28-03-2016.
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
var footable_directive_1 = require("qCommon/app/directives/footable.directive");
var verify_form_1 = require("../forms/verify.form");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var router_2 = require("@angular/router");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var VerificationComponent = (function () {
    function VerificationComponent(_fb, _route, companyService, _VerifyForm, _router, loadingService, vendorService, _toastService, switchBoard, coaService, titleService) {
        var _this = this;
        this._fb = _fb;
        this._route = _route;
        this.companyService = companyService;
        this._VerifyForm = _VerifyForm;
        this._router = _router;
        this.loadingService = loadingService;
        this.vendorService = vendorService;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.coaService = coaService;
        this.titleService = titleService;
        this.tableData = {};
        this.tableOptions = {};
        this.hasItemCodes = false;
        this.editMode = false;
        this.countries = Provinces_constants_1.PROVINCES.COUNTRIES;
        this.companies = [];
        this.currentCompany = {};
        this.tableColumns = ['id', 'name', 'tin', 'visibleOnInvoices', 'taxAuthorityName', 'taxRate', 'coa_name', 'recoverableTax', 'compoundTax'];
        this.showFlyout = true;
        this.titleService.setPageTitle("Verify Account");
        this.companyId = Session_1.Session.getCurrentCompany();
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.currentverificationId = params['VerificationID'];
        });
        this.VerifyForm = this._fb.group(_VerifyForm.getVerified());
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showFlyout) {
                _this.hideFlyout();
            }
            else {
                _this.toolsRedirect();
            }
        });
    }
    VerificationComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    VerificationComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    VerificationComponent.prototype.hideFlyout = function () {
        var link = ['financialAccounts'];
        this._router.navigate(link);
        this.showFlyout = !this.showFlyout;
    };
    VerificationComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._VerifyForm.getData(this.VerifyForm);
        data.amount1 = Number(data.amount1);
        data.amount2 = Number(data.amount2);
        this.companyService.updateAccount(data, this.companyId, this.currentverificationId)
            .subscribe(function (success) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.showMessage(true, success);
            _this.showFlyout = false;
        }, function (error) { return _this.handleError(error); });
    };
    VerificationComponent.prototype.handleError = function (error) {
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    VerificationComponent.prototype.isValid = function (VerifyForm) {
        if ((VerifyForm.value.amount1) && (VerifyForm.value.amount2)) {
            return false;
        }
        return true;
    };
    VerificationComponent.prototype.showMessage = function (status, obj) {
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Verification created successfully.");
            var link = ['financialAccounts'];
            this._router.navigate(link);
        }
    };
    return VerificationComponent;
}());
__decorate([
    core_1.ViewChild('createtaxes'),
    __metadata("design:type", Object)
], VerificationComponent.prototype, "createtaxes", void 0);
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], VerificationComponent.prototype, "fooTableDir", void 0);
VerificationComponent = __decorate([
    core_1.Component({
        selector: 'Verification',
        templateUrl: '/app/views/Verification.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_2.ActivatedRoute, Companies_service_1.CompaniesService, verify_form_1.VerifyForm,
        router_1.Router, LoadingService_1.LoadingService, Companies_service_1.CompaniesService,
        Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard, ChartOfAccounts_service_1.ChartOfAccountsService, PageTitle_1.pageTitleService])
], VerificationComponent);
exports.VerificationComponent = VerificationComponent;
