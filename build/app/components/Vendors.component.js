/**
 * Created by seshu on 15-07-2016.
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
var Vendor_form_1 = require("qCommon/app/forms/Vendor.form");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var address_directive_1 = require("qCommon/app/directives/address.directive");
var CompanyUsers_service_1 = require("qCommon/app/services/CompanyUsers.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var VendorComponent = (function () {
    function VendorComponent(_fb, companyService, _vendorForm, _router, loadingService, _toastService, switchBoard, coaService, usersService, titleService) {
        var _this = this;
        this._fb = _fb;
        this.companyService = companyService;
        this._vendorForm = _vendorForm;
        this._router = _router;
        this.loadingService = loadingService;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.coaService = coaService;
        this.usersService = usersService;
        this.titleService = titleService;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.countries = Provinces_constants_1.PROVINCES.COUNTRIES;
        this.hasVendorsList = false;
        this.companies = [];
        this.currentCompany = {};
        this.showFlyout = false;
        this.showMailFlyout = false;
        this.vendorTypes = {
            company: "Business",
            individual: "Individual"
        };
        this.showFirstStep = true;
        this.showSecondStep = false;
        this.active1 = true;
        this.titleService.setPageTitle("Vendors");
        this.vendorForm = this._fb.group(_vendorForm.getForm());
        this.companyId = Session_1.Session.getCurrentCompany();
        ;
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteVendor(toast); });
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.companies().subscribe(function (companies) {
            _this.companies = companies;
            if (_this.companyId) {
                _this.currentCompany = _.find(_this.companies, { id: _this.companyId });
            }
            else if (_this.companies.length > 0) {
                _this.currentCompany = _.find(_this.companies, { id: _this.companies[0].id });
            }
            _this.companyService.vendors(_this.companyId).subscribe(function (vendors) {
                _this.buildTableData(vendors);
            }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(function (chartOfAccounts) {
            _this.chartOfAccounts = chartOfAccounts ? _.filter(chartOfAccounts, { 'type': 'accountsPayable' }) : [];
            _.sortBy(_this.chartOfAccounts, ['number', 'name']);
        }, function (error) { return _this.handleError(error); });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showMailFlyout) {
                _this.hideMailFlyout();
            }
            else if (_this.showFlyout) {
                if (_this.showFirstStep) {
                    _this.hideFlyout();
                }
                else if (_this.showSecondStep) {
                    _this.hideSecondStep();
                }
            }
            else {
                _this.toolsRedirect();
            }
        });
    }
    VendorComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    VendorComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
        jQuery('.ui-autocomplete').remove();
        jQuery('#invite-vendor').remove();
    };
    VendorComponent.prototype.getCompanyName = function (companyId) {
        var company = _.find(this.companies, { id: companyId });
        if (company) {
            return company.name;
        }
    };
    VendorComponent.prototype.buildTableData = function (vendors) {
        this.vendors = vendors;
        this.hasVendorsList = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "type", "title": "Type" },
            { "name": "einssn", "title": "EIN/SSN" },
            { "name": "email", "title": "Email" },
            { "name": "address", "title": "Address", "visible": false },
            { "name": "phoneNumber", "title": "Phone Number" },
            { "name": "country", "title": "Country", "visible": false },
            { "name": "state", "title": "State", "visible": false },
            { "name": "city", "title": "City", "visible": false },
            { "name": "zipcode", "title": "Zip code", "visible": false },
            { "name": "id", "title": "ID", "visible": false },
            { "name": "type", "title": "Vendor Type", "visible": false },
            { "name": "ein", "title": "EIN", "visible": false },
            { "name": "ssn", "title": "SSN", "visible": false },
            { "name": "has1099", "title": "1099", "visible": false },
            { "name": "paymentMethod", "title": "Payment Method", "visible": false },
            { "name": "accountNumber", "title": "Reference Number", "visible": false },
            { "name": "accountNumbers", "title": "Reference Numbers", "visible": false },
            { "name": "routingNumber", "title": "RoutingNumber", "visible": false },
            { "name": "coa", "title": "COA", "visible": false },
            { "name": "name_on_bank_account", "title": "name on bank account", "visible": false },
            { "name": "bank_account_type", "title": "bank account type", "visible": false },
            { "name": "bank_account_holder_type", "title": "accountholder type", "visible": false },
            { "name": "bank_account_number", "title": "bank account number", "visible": false },
            { "name": "bank_account_routing_number", "title": "account routing number", "visible": false },
            { "name": "contact_first_name", "title": "First Name", "visible": false },
            { "name": "contact_last_name", "title": "Last Name", "visible": false },
            { "name": "creditCardNumber", "title": "Credit Card Number", "visible": false },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        var base = this;
        this.vendors.forEach(function (vendor) {
            var row = {};
            for (var key in base.vendors[0]) {
                row[key] = vendor[key];
                if (key == 'type') {
                    if (vendor[key] == base.vendorTypes.individual) {
                        row['einssn'] = vendor['ssn'];
                    }
                    else if (vendor[key] == base.vendorTypes.company) {
                        row['einssn'] = vendor['ein'];
                    }
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            if (vendor.addresses.length > 0) {
                row['phoneNumber'] = vendor.addresses[0].phone_number;
            }
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasVendorsList = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    VendorComponent.prototype.showCreateVendor = function () {
        this.titleService.setPageTitle("CREATE VENDOR");
        var defaultCountry = { name: 'United States', code: 'US' };
        var self = this;
        this.editMode = false;
        this.vendorForm = this._fb.group(this._vendorForm.getForm());
        this.newForm1();
        setTimeout(function () {
            self.vendorCountryComboBox.setValue(defaultCountry, 'name');
        }, 100);
        this.showVendorProvince(defaultCountry);
        this.editAddress = {};
        this.showFlyout = true;
    };
    VendorComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditVendor($event);
        }
        else if (action == 'delete') {
            this.vendorDelete($event);
        }
    };
    VendorComponent.prototype.showVendorProvince = function (country) {
        var countryControl = this.vendorForm.controls['country'];
        countryControl.patchValue(country.name);
        this.countryCode = country.code;
        var base = this;
        if (this.editAddress && this.editAddress.country == country.name) {
            setTimeout(function () {
                base.addressDir.setData(base.editAddress);
            }, 500);
        }
    };
    VendorComponent.prototype.showCOA = function (coa) {
        var data = this._vendorForm.getData(this.vendorForm);
        if (coa && coa.id) {
            data.coa = coa.id;
        }
        else if (!coa || coa == '--None--') {
            data.coa = '--None--';
        }
        this._vendorForm.updateForm(this.vendorForm, data);
    };
    VendorComponent.prototype.deleteVendor = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.removeVendor(this.vendorId, this.companyId)
            .subscribe(function (success) {
            _this.companyService.vendors(_this.companyId)
                .subscribe(function (vendors) {
                _this.buildTableData(vendors);
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Vendor deleted successfully");
            }, function (error) { return _this.handleError1(error); });
        }, function (error) { return _this.handleError(error); });
    };
    VendorComponent.prototype.handleError1 = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    VendorComponent.prototype.vendorDelete = function (row) {
        var vendor = row;
        this.vendorId = row.id;
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    VendorComponent.prototype.newForm1 = function () {
        var _this = this;
        this.active1 = false;
        setTimeout(function () { return _this.active1 = true; }, 0);
    };
    VendorComponent.prototype.showEditVendor = function (row) {
        this.titleService.setPageTitle("UPDATE VENDOR");
        this.showFlyout = true;
        this.editMode = true;
        this.vendorForm = this._fb.group(this._vendorForm.getForm());
        this.getVendorDetails(row.id);
    };
    VendorComponent.prototype.nextStep = function ($event) {
        $event && $event.preventDefault();
        var data = this._vendorForm.getData(this.vendorForm);
        var addressData = this.addressDir.getData();
        addressData.country = data.country;
        data.addresses = [addressData];
        if (data.coa == '--None--' || data.coa == '') {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select COA");
            return;
        }
        if (addressData.state == '--None--' || addressData.state == '') {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select state");
            return;
        }
        this.showFirstStep = false;
        this.showSecondStep = true;
    };
    VendorComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        this.companyId = Session_1.Session.getCurrentCompany();
        var data = this._vendorForm.getData(this.vendorForm);
        var addressData = this.addressDir.getData();
        addressData.country = data.country;
        data.addresses = [addressData];
        this.loadingService.triggerLoadingEvent(true);
        if (this.editMode) {
            data.id = this.row.id;
            this.companyService.updateVendor(data, this.companyId)
                .subscribe(function (success) {
                _this.showMessage(true, success);
                _this.hideFlyout();
            }, function (error) { return _this.showMessage(false, error); });
        }
        else {
            this.companyService.addVendor(data, this.companyId)
                .subscribe(function (success) {
                _this.showMessage(true, success);
                _this.hideFlyout();
            }, function (error) { return _this.showMessage(false, error); });
        }
    };
    VendorComponent.prototype.isValid = function (vendorForm) {
        return vendorForm.valid;
    };
    VendorComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Vendors");
        this.row = {};
        this.showFlyout = !this.showFlyout;
        this.showFirstStep = true;
        this.showSecondStep = false;
    };
    VendorComponent.prototype.hideSecondStep = function () {
        this.showFirstStep = true;
        this.showSecondStep = false;
    };
    VendorComponent.prototype.hideMailFlyout = function () {
        this.showMailFlyout = !this.showMailFlyout;
    };
    VendorComponent.prototype.addressValid = function () {
        if (this.addressDir) {
            return this.addressDir.isValid();
        }
        return false;
    };
    VendorComponent.prototype.showMessage = function (status, obj) {
        var _this = this;
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.hasVendorsList = false;
            if (this.editMode) {
                this.companyService.vendors(this.companyId)
                    .subscribe(function (vendors) { return _this.buildTableData(vendors); }, function (error) { return _this.handleError(error); });
                this.newForm1();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Vendor updated successfully.");
            }
            else {
                this.newForm1();
                this.companyService.vendors(this.companyId)
                    .subscribe(function (vendors) { return _this.buildTableData(vendors); }, function (error) { return _this.handleError(error); });
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Vendor created successfully.");
            }
        }
        else {
            this.loadingService.triggerLoadingEvent(false);
            this.showFirstStep = true;
            this.showSecondStep = false;
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
    VendorComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    VendorComponent.prototype.setVendorType = function (vendorType, vendor) {
        var validator = [forms_1.Validators.required, forms_1.Validators.pattern];
        var tempForm = _.cloneDeep(this._vendorForm.getForm());
        var ein = this.row ? this.row.ein : '';
        var ssn = this.row ? this.row.ssn : '';
        vendorType = vendorType ? vendorType : 'Business';
        if (vendorType == this.vendorTypes.company) {
            tempForm.ein = [ein || '', validator];
            tempForm.ssn = [ssn || ''];
        }
        else {
            tempForm.ein = [ein || ''];
            tempForm.ssn = [ssn || '', validator];
        }
        if (!vendor) {
            tempForm.type = [vendorType, [forms_1.Validators.required]];
            var tempData = this._vendorForm.getData(this.vendorForm);
            this.vendorForm = this._fb.group(tempForm);
            this._vendorForm.updateForm(this.vendorForm, tempData);
        }
        else {
            this.vendorForm = this._fb.group(tempForm);
        }
    };
    VendorComponent.prototype.isVendorCompany = function (form) {
        var data = this._vendorForm.getData(form);
        if (data.type == this.vendorTypes.company) {
            return true;
        }
        return false;
    };
    VendorComponent.prototype.getAccountNumbers = function () {
        var data = this._vendorForm.getData(this.vendorForm);
        return data.accountNumbers || [];
    };
    VendorComponent.prototype.getVendorDetails = function (vendorID) {
        var _this = this;
        var base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.vendor(this.companyId, vendorID).subscribe(function (vendor) {
            if (vendor.addresses[0]) {
                _this.row = vendor;
                var countryName_1 = vendor.addresses[0].country;
                _this.editAddress = vendor.addresses[0];
                var country_1 = _.find(Provinces_constants_1.PROVINCES.COUNTRIES, function (_country) {
                    return _country.name == countryName_1;
                });
                setTimeout(function () {
                    base.vendorCountryComboBox.setValue(country_1, 'name');
                }, 100);
            }
            var coa = _.find(_this.chartOfAccounts, function (_coa) {
                return _coa.id == vendor.coa;
            });
            if (!_.isEmpty(coa)) {
                setTimeout(function () {
                    base.coaComboBox.setValue(coa, 'name');
                });
            }
            vendor.has1099 = vendor.has1099 == 'true' || vendor.has1099 == true;
            _this.setVendorType(vendor.type, vendor);
            var accountNumbersControl = _this.vendorForm.controls['accountNumbers'];
            accountNumbersControl.patchValue(vendor.accountNumbers);
            _this._vendorForm.updateForm(_this.vendorForm, vendor);
            setTimeout(function () {
                base.loadingService.triggerLoadingEvent(false);
            }, 500);
        }, function (error) { return _this.handleError(error); });
    };
    VendorComponent.prototype.inviteVendor = function () {
        this.titleService.setPageTitle("INVITE VENDOR");
        this.showMailFlyout = true;
        this.mailID = '';
        //jQuery('#invite-vendor').foundation('open');
    };
    VendorComponent.prototype.closeVendor = function () {
        jQuery('#invite-vendor').foundation('close');
    };
    VendorComponent.prototype.checkValidation = function () {
        if (this.mailID)
            return true;
        return false;
    };
    VendorComponent.prototype.saveInvitedVendor = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        var userObj = {
            id: this.mailID,
            roleID: 'Vendor',
            email: this.mailID
        };
        this.usersService.addUser(userObj, this.companyId)
            .subscribe(function (success) {
            _this.loadingService.triggerLoadingEvent(false);
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "vendor invited successfully.");
            _this.mailID = null;
            _this.showMailFlyout = false;
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "failed to invite vendor.");
            _this.showMailFlyout = false;
        });
    };
    VendorComponent.prototype.gotoFirstStep = function () {
        this.showFirstStep = true;
        this.showSecondStep = false;
    };
    return VendorComponent;
}());
__decorate([
    core_1.ViewChild('createVendor'),
    __metadata("design:type", Object)
], VendorComponent.prototype, "createVendor", void 0);
__decorate([
    core_1.ViewChild('vendorCountryComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], VendorComponent.prototype, "vendorCountryComboBox", void 0);
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], VendorComponent.prototype, "fooTableDir", void 0);
__decorate([
    core_1.ViewChild('coaComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], VendorComponent.prototype, "coaComboBox", void 0);
__decorate([
    core_1.ViewChild('addressDir'),
    __metadata("design:type", address_directive_1.Address)
], VendorComponent.prototype, "addressDir", void 0);
VendorComponent = __decorate([
    core_1.Component({
        selector: 'vendors',
        templateUrl: '/app/views/vendors.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, Companies_service_1.CompaniesService, Vendor_form_1.VendorForm,
        router_1.Router, LoadingService_1.LoadingService,
        Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard, ChartOfAccounts_service_1.ChartOfAccountsService,
        CompanyUsers_service_1.CompanyUsers, PageTitle_1.pageTitleService])
], VendorComponent);
exports.VendorComponent = VendorComponent;
