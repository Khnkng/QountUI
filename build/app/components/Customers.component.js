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
var address_directive_1 = require("qCommon/app/directives/address.directive");
var Provinces_constants_1 = require("qCommon/app/constants/Provinces.constants");
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var footable_directive_1 = require("qCommon/app/directives/footable.directive");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var Customers_form_1 = require("../forms/Customers.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var CustomersComponent = (function () {
    function CustomersComponent(_fb, customersService, _customersForm, _contactLineForm, _router, _toastService, switchBoard, loadingService, coaService, titleService) {
        var _this = this;
        this._fb = _fb;
        this.customersService = customersService;
        this._customersForm = _customersForm;
        this._contactLineForm = _contactLineForm;
        this._router = _router;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.coaService = coaService;
        this.titleService = titleService;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.countries = Provinces_constants_1.PROVINCES.COUNTRIES;
        this.hasCustomersList = false;
        this.companies = [];
        this.showFlyout = false;
        this.ContactLineArray = new forms_1.FormArray([]);
        this.active1 = true;
        // Reset the form with a new hero AND restore 'pristine' class state
        // by toggling 'active' flag which causes the form
        // to be removed/re-added in a tick via NgIf
        // TODO: Workaround until NgForm has a reset method (#6822)
        this.active = true;
        this.titleService.setPageTitle("Customers");
        var _form = this._customersForm.getForm();
        _form['customer_contact_details'] = this.ContactLineArray;
        this.customerForm = this._fb.group(_form);
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteVendor(toast); });
        this.companyId = Session_1.Session.getCurrentCompany();
        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(function (chartOfAccounts) {
            _this.chartOfAccounts = chartOfAccounts ? _.filter(chartOfAccounts, { 'type': 'accountsReceivable' }) : [];
            _.sortBy(_this.chartOfAccounts, ['number', 'name']);
        }, function (error) { return _this.handleError(error); });
        if (this.companyId) {
            this.loadingService.triggerLoadingEvent(true);
            this.customersService.customers(this.companyId).subscribe(function (customers) {
                _this.buildTableData(customers);
            }, function (error) { return _this.handleError(error); });
        }
        else {
            this.loadingService.triggerLoadingEvent(false);
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
    CustomersComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    CustomersComponent.prototype.ngOnDestroy = function () {
        this.confirmSubscription.unsubscribe();
        this.routeSubscribe.unsubscribe();
    };
    CustomersComponent.prototype.buildTableData = function (customers) {
        this.customers = customers;
        this.hasCustomersList = false;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.rows = [];
        this.tableData.columns = [
            { "name": "customer_id", "title": "ID", "visible": false },
            { "name": "customer_name", "title": "Name" },
            { "name": "customer_ein", "title": "Ein" },
            { "name": "email_ids", "title": "Email" },
            { "name": "phone_number", "title": "Phone Number" },
            { "name": "customer_address", "title": "Address", "visible": false },
            { "name": "customer_country", "title": "Country", "visible": false },
            { "name": "customer_state", "title": "State", "visible": false },
            { "name": "customer_city", "title": "City", "visible": false },
            { "name": "customer_zipcode", "title": "Zip code", "visible": false },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        var base = this;
        this.customers.forEach(function (customers) {
            var row = {};
            for (var key in base.customers[0]) {
                row[key] = customers[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasCustomersList = true;
        });
        this.loadingService.triggerLoadingEvent(false);
    };
    CustomersComponent.prototype.showCreateVendor = function () {
        this.titleService.setPageTitle("CREATE CUSTOMER");
        var self = this;
        var defaultCountry = { name: 'United States', code: 'US' };
        this.editMode = false;
        this.addContactList();
        this.newForm1();
        this.showVendorProvince(defaultCountry);
        this.showFlyout = true;
    };
    CustomersComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditVendor($event);
        }
        else if (action == 'delete') {
            this.removeVendor($event);
        }
    };
    CustomersComponent.prototype.showVendorProvince = function (country) {
        var _this = this;
        var countryControl = this.customerForm.controls['customer_country'];
        countryControl.patchValue(country.name);
        this.countryCode = country.code;
        this.showAddress = false;
        setTimeout(function () { return _this.showAddress = true; }, 0);
    };
    CustomersComponent.prototype.deleteVendor = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.customersService.removeCustomer(this.customerId, this.companyId)
            .subscribe(function (success) {
            _this.loadingService.triggerLoadingEvent(false);
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Customer deleted successfully");
            _this.customersService.customers(_this.companyId)
                .subscribe(function (customers) { return _this.buildTableData(customers); }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
    };
    CustomersComponent.prototype.removeVendor = function (row) {
        var customer = row;
        this.customerId = customer.customer_id;
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    CustomersComponent.prototype.newForm1 = function () {
        var _this = this;
        this.active1 = false;
        setTimeout(function () { return _this.active1 = true; }, 0);
    };
    CustomersComponent.prototype.showCOA = function (coa) {
        var data = this._customersForm.getData(this.customerForm);
        if (coa && coa.id) {
            data.coa = coa.id;
        }
        else if (!coa || coa == '--None--') {
            data.coa = '--None--';
        }
        this._customersForm.updateForm(this.customerForm, data);
    };
    CustomersComponent.prototype.showEditVendor = function (row) {
        var _this = this;
        this.titleService.setPageTitle("UPDATE CUSTOMER");
        this.editMode = true;
        this.showFlyout = true;
        this.row = row;
        this.loadingService.triggerLoadingEvent(true);
        this.customersService.customer(row.customer_id, this.companyId)
            .subscribe(function (customer) {
            _this.row = customer;
            _this.loadingService.triggerLoadingEvent(false);
            /*this.row.email_ids=customer.email_ids
             let email_id:any = this.customerForm.controls['email_ids'];
             email_id.patchValue(customer.email_ids);
             let customer_address:any = this.customerForm.controls['customer_address'];
             customer_address.patchValue(customer.customer_address);
             let customer_city:any = this.customerForm.controls['customer_city'];
             customer_city.patchValue(customer.customer_city);
             let customer_state:any = this.customerForm.controls['customer_state'];
             customer_state.patchValue(customer.customer_state);
             let customer_zipcode:any = this.customerForm.controls['customer_zipcode'];
             customer_zipcode.patchValue(customer.customer_zipcode);
             let phone_number:any = this.customerForm.controls['phone_number'];
             phone_number.patchValue(customer.phone_number);
             let term:any = this.customerForm.controls['term'];
             term.patchValue(customer.term);*/
            var coa = _.find(_this.chartOfAccounts, function (_coa) {
                return _coa.id == customer.coa;
            });
            if (!_.isEmpty(coa)) {
                setTimeout(function () {
                    base.coaComboBox.setValue(coa, 'name');
                });
            }
            var countryName = row.customer_country;
            var country = _.find(Provinces_constants_1.PROVINCES.COUNTRIES, function (_country) {
                return _country.name == countryName;
            });
            var stateName = row.state;
            var base = _this;
            base.loadingService.triggerLoadingEvent(false);
            setTimeout(function () {
                base.vendorCountryComboBox.setValue(country, 'name');
            }, 100);
            var contactLineControl = _this.customerForm.controls['customer_contact_details'];
            customer.customer_contact_details.forEach(function (contactLine) {
                contactLineControl.controls.push(base._fb.group(base._contactLineForm.getForm(contactLine)));
            });
            _this._customersForm.updateForm(_this.customerForm, _this.row);
        }, function (error) { return _this.handleError(error); });
    };
    CustomersComponent.prototype.submit = function ($event) {
        $event && $event.preventDefault();
        var data = this._customersForm.getData(this.customerForm);
        this.companyId = Session_1.Session.getCurrentCompany();
        if (data.coa == '--None--' || data.coa == '') {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select payment COA");
            return;
        }
        this.saveDetails();
    };
    CustomersComponent.prototype.saveDetails = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        var data = this._customersForm.getData(this.customerForm);
        data.customer_contact_details = this.getContactData(this.customerForm.controls['customer_contact_details']);
        if (this.editMode) {
            data.customer_id = this.row.customer_id;
            this.customersService.updateCustomer(data, this.companyId)
                .subscribe(function (success) {
                _this.showMessage(true, success);
            }, function (error) { return _this.showMessage(false, error); });
            this.showFlyout = false;
        }
        else {
            this.customersService.addCustomer(data, this.companyId)
                .subscribe(function (success) {
                _this.showMessage(true, success);
            }, function (error) { return _this.showMessage(false, error); });
            this.showFlyout = false;
        }
    };
    CustomersComponent.prototype.showMessage = function (status, obj) {
        var _this = this;
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.hasCustomersList = false;
            if (this.editMode) {
                this.resetForm();
                this.customersService.customers(this.companyId)
                    .subscribe(function (customers) { return _this.buildTableData(customers); }, function (error) { return _this.handleError(error); });
                this.newForm1();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Customer updated successfully.");
            }
            else {
                this.newForm1();
                this.resetForm();
                this.customersService.customers(this.companyId)
                    .subscribe(function (customers) { return _this.buildTableData(customers); }, function (error) { return _this.handleError(error); });
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Customer created successfully.");
            }
            this.newCustomer();
        }
        else {
            this.loadingService.triggerLoadingEvent(false);
            this.resetForm();
            this.status = {};
            this.status['error'] = true;
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to update the customer");
            this.message = obj;
        }
    };
    CustomersComponent.prototype.addressValid = function () {
        if (this.addressDir) {
            return this.addressDir.isValid();
        }
        return false;
    };
    CustomersComponent.prototype.newCustomer = function () {
        var _this = this;
        this.active = false;
        this.showAddress = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    CustomersComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    CustomersComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Customers");
        this.row = {};
        this.showFlyout = !this.showFlyout;
        this.resetForm();
    };
    CustomersComponent.prototype.getEmailIds = function () {
        var data = this._customersForm.getData(this.customerForm);
        return data.email_ids || [];
    };
    CustomersComponent.prototype.addContactList = function (line) {
        var customer = {};
        var _form = this._contactLineForm.getForm(line);
        var contactListForm = this._fb.group(_form);
        //this.ContactLineArray.push(contactListForm);
        if (!line) {
            var contactControl = this.customerForm.controls['customer_contact_details'];
            contactControl.controls.push(contactListForm);
            this._customersForm.updateForm(this.customerForm, customer);
        }
    };
    CustomersComponent.prototype.resetForm = function () {
        var _form = this._customersForm.getForm();
        _form['customer_contact_details'] = new forms_1.FormArray([]);
        this.customerForm = this._fb.group(_form);
    };
    CustomersComponent.prototype.getContactData = function (customerForm) {
        var base = this;
        var data = [];
        _.each(customerForm.controls, function (contactControl) {
            var itemData = base._contactLineForm.getData(contactControl);
            if (itemData.email)
                data.push(itemData);
        });
        return data;
    };
    return CustomersComponent;
}());
__decorate([
    core_1.ViewChild('createVendor'),
    __metadata("design:type", Object)
], CustomersComponent.prototype, "createVendor", void 0);
__decorate([
    core_1.ViewChild('vendorCountryComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], CustomersComponent.prototype, "vendorCountryComboBox", void 0);
__decorate([
    core_1.ViewChild('addressDir'),
    __metadata("design:type", address_directive_1.Address)
], CustomersComponent.prototype, "addressDir", void 0);
__decorate([
    core_1.ViewChild('coaComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], CustomersComponent.prototype, "coaComboBox", void 0);
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], CustomersComponent.prototype, "fooTableDir", void 0);
CustomersComponent = __decorate([
    core_1.Component({
        selector: 'vendors',
        templateUrl: '/app/views/customers.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, Customers_service_1.CustomersService,
        Customers_form_1.CustomersForm, Customers_form_1.ContactLineForm, router_1.Router, Toast_service_1.ToastService,
        SwitchBoard_1.SwitchBoard, LoadingService_1.LoadingService, ChartOfAccounts_service_1.ChartOfAccountsService, PageTitle_1.pageTitleService])
], CustomersComponent);
exports.CustomersComponent = CustomersComponent;
