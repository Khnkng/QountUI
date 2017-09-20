/**
 * Created by Nazia on 15-07-2016.
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
var Taxes_form_1 = require("../forms/Taxes.form");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var address_directive_1 = require("qCommon/app/directives/address.directive");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var TaxesComponent = (function () {
    function TaxesComponent(_fb, companyService, _taxesForm, _router, loadingService, vendorService, _toastService, switchBoard, coaService, titleService) {
        var _this = this;
        this._fb = _fb;
        this.companyService = companyService;
        this._taxesForm = _taxesForm;
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
        this.showFlyout = false;
        this.active1 = true;
        this.titleService.setPageTitle("Taxes");
        this.TaxesForm = this._fb.group(_taxesForm.getTax());
        this.companyId = Session_1.Session.getCurrentCompany();
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteTax(toast); });
        this.loadingService.triggerLoadingEvent(true);
        // this.companyService.companies().subscribe(companies => {
        //     this.companies = companies;
        //     if(this.companyId){
        //         this.currentCompany = _.find(this.companies, {id: this.companyId});
        //     } else if(this.companies.length> 0){
        //         this.currentCompany = _.find(this.companies, {id: this.companies[0].id});
        //     }
        this.vendorService.vendors(this.companyId)
            .subscribe(function (vendors) {
            _this.vendors = vendors;
        }, function (error) {
        });
        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(function (chartOfAccounts) {
            // this.buildTableData(chartOfAccounts);
            _this.chartOfAccounts = chartOfAccounts;
        }, function (error) { return _this.handleError(error); });
        this.companyService.getTaxofCompany(this.companyId)
            .subscribe(function (taxesList) {
            _this.buildTableData(taxesList);
            _this.taxesList = taxesList;
            console.log("taxesListtaxesList", taxesList);
            // this.showMessage(true, success);
            _this.showFlyout = false;
        }, function (error) { return _this.handleError(error); });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showFlyout) {
                _this.hideFlyout();
            }
            else {
                _this.toolsRedirect();
            }
        });
    }
    TaxesComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    TaxesComponent.prototype.buildTableData = function (taxesList) {
        this.hasItemCodes = false;
        this.taxesList = taxesList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "id", "title": "id", "visible": false },
            { "name": "name", "title": "Tax Name" },
            { "name": "tin", "title": "Tax Number" },
            { "name": "visibleOnInvoices", "title": "Display Invoices" },
            { "name": "taxAuthorityName", "title": "Tax Authority Name" },
            { "name": "taxRate", "title": "Tax Rate" },
            { "name": "coa_name", "title": "COA" },
            { "name": "recoverableTax", "title": "Recoverable Tax" },
            { "name": "compoundTax", "title": "Compound Tax" },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        taxesList.forEach(function (expense) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                if (key == 'taxRate') {
                    console.log("taxRate");
                    row[key] = expense[key] + "%";
                }
                else {
                    row[key] = expense[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function () {
            base.hasItemCodes = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    TaxesComponent.prototype.getCompanyName = function (companyId) {
        var company = _.find(this.companies, { id: companyId });
        if (company) {
            return company.name;
        }
    };
    TaxesComponent.prototype.setVendorForitem = function (vendor) {
        var data = this._taxesForm.getData(this.TaxesForm);
        data.taxAuthorityName = vendor.id;
        this._taxesForm.updateForm(this.TaxesForm, data);
    };
    TaxesComponent.prototype.showCreateTax = function () {
        this.titleService.setPageTitle("CREATE TAX");
        var defaultCountry = { name: 'United States', code: 'US' };
        var self = this;
        this.editMode = false;
        this.TaxesForm.reset();
        // setTimeout(function () {
        //     self.vendorCountryComboBox.setValue(defaultCountry, 'name');
        // },100);
        // this.showVendorProvince(defaultCountry);
        // this.editAddress = {};
        this.showFlyout = true;
    };
    TaxesComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            console.log("dmsnfbjhf");
            this.showEditTax($event);
        }
        else if (action == 'delete') {
            this.removeTax($event);
        }
    };
    TaxesComponent.prototype.showCOA = function (coa) {
        var data = this._taxesForm.getData(this.TaxesForm);
        if (coa && coa.id) {
            data.taxLiabilityCoa = coa.id;
        }
        else if (!coa || coa == '--None--') {
            data.taxLiabilityCoa = '--None--';
        }
        this._taxesForm.updateForm(this.TaxesForm, data);
    };
    TaxesComponent.prototype.deleteTax = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.removeTax(this.taxId, this.companyId)
            .subscribe(function (success) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Tax deleted successfully");
            _this.companyService.getTaxofCompany(_this.companyId)
                .subscribe(function (taxesList) {
                _this.buildTableData(taxesList);
                _this.loadingService.triggerLoadingEvent(false);
                return;
            }, function (error) { return _this.handleError1(error); });
        }, function (error) { return _this.handleError(error); });
    };
    TaxesComponent.prototype.handleError1 = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    TaxesComponent.prototype.removeTax = function (row) {
        var vendor = row;
        this.taxId = row.id;
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    TaxesComponent.prototype.newForm1 = function () {
        var _this = this;
        this.active1 = false;
        setTimeout(function () { return _this.active1 = true; }, 0);
    };
    TaxesComponent.prototype.showEditTax = function (row) {
        this.titleService.setPageTitle("UPDATE TAX");
        this.showFlyout = true;
        this.editMode = true;
        this.TaxesForm = this._fb.group(this._taxesForm.getTax());
        this.getTaxDetails(row.id);
    };
    TaxesComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    TaxesComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._taxesForm.getData(this.TaxesForm);
        this.companyId = Session_1.Session.getCurrentCompany();
        if (data.taxLiabilityCoa == '--None--' || _.isEmpty(data.taxLiabilityCoa)) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select Tax Liability COA");
            return;
        }
        this.loadingService.triggerLoadingEvent(true);
        if (this.editMode) {
            data.id = this.row.id;
            if (data.taxRate.includes("%")) {
                var res = data.taxRate.split('%');
                data.taxRate = res[0];
            }
            this.companyService.updateTax(data, this.companyId)
                .subscribe(function (success) {
                _this.showMessage(true, success);
                _this.showFlyout = false;
            }, function (error) { return _this.showMessage(false, error); });
        }
        else {
            if (data.taxRate.includes("%")) {
                var res = data.taxRate.split('%');
                data.taxRate = res[0];
            }
            else {
                data.taxRate = data.taxRate;
            }
            this.companyService.addTax(data, this.companyId)
                .subscribe(function (success) {
                _this.showMessage(true, success);
                _this.showFlyout = false;
            }, function (error) { return _this.showMessage(false, error); });
        }
    };
    TaxesComponent.prototype.isValid = function (TaxesForm) {
        if (TaxesForm.value.name == "" || TaxesForm.value.name == null && TaxesForm.value.tin == "" || TaxesForm.value.tin == null
            && TaxesForm.value.taxAuthorityName == "" || TaxesForm.value.taxAuthorityName == null && TaxesForm.value.taxAuthorityId == "" || TaxesForm.value.taxAuthorityId == null
            && TaxesForm.value.taxLiabilityCoa == "" || TaxesForm.value.taxLiabilityCoa == null
            && TaxesForm.value.description == "" || TaxesForm.value.description == null
            && TaxesForm.value.taxRate == "" || TaxesForm.value.taxRate == null) {
            return false;
        }
        return true;
    };
    TaxesComponent.prototype.showCOA = function (coa) {
        var data = this._taxesForm.getData(this.TaxesForm);
        if (coa && coa.id) {
            data.taxLiabilityCoa = coa.id;
        }
        else if (!coa || coa == '--None--') {
            data.taxLiabilityCoa = '--None--';
        }
        this._taxesForm.updateForm(this.TaxesForm, data);
    };
    TaxesComponent.prototype.getCoa = function () {
        var _this = this;
        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(function (chartOfAccounts) {
            _this.loadingService.triggerLoadingEvent(false);
            // this.buildTableData(chartOfAccounts);
        }, function (error) { return _this.handleError(error); });
    };
    TaxesComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Taxes");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    };
    TaxesComponent.prototype.showMessage = function (status, obj) {
        var _this = this;
        if (status) {
            this.status = {};
            this.status['success'] = true;
            if (this.editMode) {
                this.companyService.getTaxofCompany(this.companyId)
                    .subscribe(function (taxesList) {
                    _this.buildTableData(taxesList);
                    _this.taxesList = taxesList;
                }, function (error) { return _this.handleError(error); });
                this.TaxesForm.reset();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Tax updated successfully.");
            }
            else {
                this.companyService.getTaxofCompany(this.companyId)
                    .subscribe(function (taxesList) {
                    _this.buildTableData(taxesList);
                }, function (error) { return _this.handleError(error); });
                this.TaxesForm.reset();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Tax created successfully.");
            }
        }
        else {
            this.status = {};
            this.status['error'] = true;
            this.loadingService.triggerLoadingEvent(false);
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
    TaxesComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    TaxesComponent.prototype.ratetax = function () {
        var taxRate = this.TaxesForm.controls['taxRate'];
        taxRate.patchValue(taxRate.value + "%");
    };
    TaxesComponent.prototype.getTaxDetails = function (vendorID) {
        var _this = this;
        var base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.tax(this.companyId, vendorID).subscribe(function (tax) {
            _this.row = tax;
            var selectedCOAControl = _this.TaxesForm.controls['name'];
            selectedCOAControl.patchValue(tax.name);
            var tin = _this.TaxesForm.controls['tin'];
            tin.patchValue(tax.tin);
            var taxAuthorityName = _this.TaxesForm.controls['taxAuthorityName'];
            taxAuthorityName.patchValue(tax.taxAuthorityName);
            var taxAuthorityId = _this.TaxesForm.controls['taxAuthorityId'];
            taxAuthorityId.patchValue(tax.taxAuthorityId);
            var coa = _.find(_this.chartOfAccounts, function (_coa) {
                return _coa.id == tax.taxLiabilityCoa;
            });
            if (!_.isEmpty(coa)) {
                setTimeout(function () {
                    base.coaComboBox.setValue(coa, 'name');
                });
            }
            var description = _this.TaxesForm.controls['description'];
            description.patchValue(tax.description);
            var taxRate = _this.TaxesForm.controls['taxRate'];
            tax.taxRate = tax.taxRate + "%";
            taxRate.patchValue(tax.taxRate);
            var compoundTax = _this.TaxesForm.controls['compoundTax'];
            compoundTax.patchValue(tax.compoundTax);
            var recoverableTax = _this.TaxesForm.controls['recoverableTax'];
            recoverableTax.patchValue(tax.recoverableTax);
            var visibleOnInvoices = _this.TaxesForm.controls['visibleOnInvoices'];
            visibleOnInvoices.patchValue(tax.visibleOnInvoices);
            _this._taxesForm.updateForm(_this.TaxesForm, tax);
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { return _this.handleError(error); });
    };
    return TaxesComponent;
}());
__decorate([
    core_1.ViewChild('createtaxes'),
    __metadata("design:type", Object)
], TaxesComponent.prototype, "createtaxes", void 0);
__decorate([
    core_1.ViewChild('vendorCountryComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], TaxesComponent.prototype, "vendorCountryComboBox", void 0);
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], TaxesComponent.prototype, "fooTableDir", void 0);
__decorate([
    core_1.ViewChild('coaComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], TaxesComponent.prototype, "coaComboBox", void 0);
__decorate([
    core_1.ViewChild("newVendorComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], TaxesComponent.prototype, "newVendorComboBox", void 0);
__decorate([
    core_1.ViewChild('addressDir'),
    __metadata("design:type", address_directive_1.Address)
], TaxesComponent.prototype, "addressDir", void 0);
TaxesComponent = __decorate([
    core_1.Component({
        selector: 'taxes',
        templateUrl: '/app/views/taxes.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, Companies_service_1.CompaniesService, Taxes_form_1.TaxesForm,
        router_1.Router, LoadingService_1.LoadingService, Companies_service_1.CompaniesService,
        Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard, ChartOfAccounts_service_1.ChartOfAccountsService, PageTitle_1.pageTitleService])
], TaxesComponent);
exports.TaxesComponent = TaxesComponent;
