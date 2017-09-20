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
/**
 * Created by seshu on 18-07-2016.
 */
var forms_1 = require("@angular/forms");
var core_1 = require("@angular/core");
var Companies_service_1 = require("../services/Companies.service");
var Provinces_constants_1 = require("../constants/Provinces.constants");
var comboBox_directive_1 = require("../directives/comboBox.directive");
var Date_constants_1 = require("../constants/Date.constants");
var Qount_constants_1 = require("../constants/Qount.constants");
var Toast_service_1 = require("../services/Toast.service");
var Session_1 = require("../services/Session");
var Currency_constants_1 = require("../constants/Currency.constants");
var router_1 = require("@angular/router");
var Company_Form_1 = require("../forms/Company.Form");
var CreditCardType_1 = require("../models/CreditCardType");
var LoadingService_1 = require("../services/LoadingService");
var Currency_service_1 = require("../services/Currency.service");
var SwitchBoard_1 = require("../services/SwitchBoard");
var address_directive_1 = require("../directives/address.directive");
var AddCompanyComponent = (function () {
    function AddCompanyComponent(_fb, _router, _companyForm, switchBoard, _route, companyService, currencyService, loadingService, _toastService) {
        var _this = this;
        this._fb = _fb;
        this._router = _router;
        this._companyForm = _companyForm;
        this.switchBoard = switchBoard;
        this._route = _route;
        this.companyService = companyService;
        this.currencyService = currencyService;
        this.loadingService = loadingService;
        this._toastService = _toastService;
        this.countries = Provinces_constants_1.PROVINCES.COUNTRIES;
        this.states = [];
        this.paymentInfo = [];
        this.days = Date_constants_1.MONTHS;
        this.years = Date_constants_1.YEARS;
        this.companyTypes = Qount_constants_1.COMPANY_TYPES;
        this.companyClassifications = Qount_constants_1.COMPANY_CLASSIFICATION;
        this.hasCompanyInfo = false;
        this.dwollaFullAcountUrl = "https://uat.dwolla.com/oauth/v2/authenticate?client_id=h18ozPUBDMv5vCkEDpxaxmKRmS4GeOGeOe8E5yS4eSMalHlBbe&response_type=code&redirect_uri=http://bigpay-ui.e0fee844.svc.dockerapp.io/oAuth&scope=AccountInfoFull|Transactions|Send|Funding|Scheduled&verified_account=true";
        this.currencies = Currency_constants_1.CURRENCY;
        this.companyDataSaved = false;
        this.list = [];
        this.existingCompanies = [];
        this.emailValidation = true;
        this.active = true;
        this.creditCardInfo = [];
        this.bankInfo = [];
        this.isValidCreditCard = true;
        this.companyForm = this._fb.group(_companyForm.getForm());
        this.companyService.companies()
            .subscribe(function (companies) {
            _this.existingCompanies = companies;
        }, function (error) { return _this.handleError(error); });
        this.currencyService.currencies()
            .subscribe(function (currencies) {
            _this.currencies = currencies;
        }, function (error) { return _this.handleError(error); });
        if (Session_1.Session.get("pendingCompany")) {
            this.hasCompanyInfo = true;
            Session_1.Session.deleteKey("pendingCompany");
        }
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        this.todaysDate = mm + "/" + dd + "/" + yyyy;
    }
    AddCompanyComponent.prototype.handleError = function (error) {
    };
    AddCompanyComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._companyForm.getData(this.companyForm);
        data.paymentInfo = this.bankInfo.concat(this.creditCardInfo);
        data.group = 'payments';
        if (this.emailValidationRes)
            data.companyEmail = this.emailValidationRes.email;
        var currentUser = Session_1.Session.getUser();
        data.owner = currentUser.user_id;
        Session_1.Session.put("pendingCompany", data);
        this.loadingService.triggerLoadingEvent(true);
        var data1 = this.addressDir.getData();
        data1.country = data.country;
        data.addresses = [data1];
        this.companyService.add(this.cleanData(data))
            .subscribe(function (companyObj) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.switchBoard.onCompanyAddOrDelete.next({});
            _this.handleResponse(companyObj);
        }, function (error) { return _this.showMessage(false, error); });
    };
    AddCompanyComponent.prototype.handleResponse = function (companyObj) {
        this.savedCompany = companyObj;
        this.showMessage(true, companyObj);
    };
    AddCompanyComponent.prototype.showMessage = function (status, obj) {
        this.loadingService.triggerLoadingEvent(false);
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.message = "Company created successfully.";
            this.newForm();
            //this._toastService.pop(TOAST_TYPE.success, "Company updated successfully");
            this.hasCompanyInfo = true;
            this.companyDataSaved = true;
            if (this.existingCompanies.length == 0) {
                Session_1.Session.setCurrentCompany(obj.id);
            }
            var link = ['/companies'];
            this._router.navigate(link);
        }
        else {
            this.status = {};
            this.status['error'] = true;
            this.message = obj;
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to update the company");
        }
    };
    AddCompanyComponent.prototype.selectedededCurrency = function (currency) {
        var countryControl = this.companyForm.controls['defaultCurrency'];
        countryControl.patchValue(currency.code);
    };
    AddCompanyComponent.prototype.showProvince = function (country) {
        var _this = this;
        this.states = _.filter(Provinces_constants_1.PROVINCES.COUNTRY_PROVINCES, function (province) {
            return province.country == country.code;
        });
        var countryControl = this.companyForm.controls['country'];
        countryControl.patchValue(country.name);
        this.countryCode = country.code;
        this.showAddress = false;
        this.updateValidations();
        setTimeout(function () { return _this.showAddress = true; }, 0);
    };
    AddCompanyComponent.prototype.updateValidations = function () {
        var tempForm = _.cloneDeep(this._companyForm.getForm());
        if (this.countryCode == 'US') {
            tempForm.einNumber = ['', forms_1.Validators.required];
        }
        else {
            tempForm.einNumber = [''];
        }
        var tempData = this._companyForm.getData(this.companyForm);
        this.companyForm = this._fb.group(tempForm);
        this._companyForm.updateForm(this.companyForm, tempData);
    };
    AddCompanyComponent.prototype.selectState = function (state) {
        var stateControl = this.companyForm.controls['state'];
        stateControl.patchValue(state.name);
    };
    // Reset the form with a new hero AND restore 'pristine' class state
    // by toggling 'active' flag which causes the form
    // to be removed/re-added in a tick via NgIf
    // TODO: Workaround until NgForm has a reset method (#6822)
    AddCompanyComponent.prototype.newForm = function () {
        var _this = this;
        this.active = false;
        this.showAddress = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    AddCompanyComponent.prototype.setDate = function (date, lockdate) {
        var jeDateControl = this.companyForm.controls['fiscalStartDate'];
        jeDateControl.patchValue(date);
    };
    AddCompanyComponent.prototype.addBankInfo = function (isEdit, paymentType) {
        var info = {};
        if (paymentType == "bank") {
            info.name = this.accountHolderName;
            info.bankName = this.bankName;
            info.accountNumber = this.accountNumber;
            info.routingNumber = this.routingNumber;
            info.paymentType = this.paymentType;
            if (!isEdit && this.accountHolderName && this.bankName && this.accountNumber && this.routingNumber)
                this.bankInfo.push(info);
            else if (isEdit && this.accountHolderName && this.bankName && this.accountNumber && this.routingNumber)
                this.bankInfo.splice(this.index, 1, info);
        }
        else if (paymentType == "creditCard") {
            info.name = this.creditCardHolderName;
            info.type = this.type;
            info.number = this.accountNumber;
            info.cvv = this.cvv;
            info.paymentType = this.paymentType;
            info.nickName = this.nickName;
            info.expiryDate = this.month + "/" + this.year;
            if (!isEdit && this.creditCardHolderName && this.accountNumber && this.cvv && this.month && this.year) {
                var res = new CreditCardType_1.CreditCardType().validateCreditCard(this.accountNumber, this.cvv);
                if (res.valid) {
                    info.type = res.type;
                    this.creditCardInfo.push(info);
                    this.isValidCreditCard = true;
                    this.clearBankInfo();
                }
                else {
                    this.isValidCreditCard = false;
                }
            }
            else if (isEdit && this.creditCardHolderName && this.accountNumber && this.cvv && this.month && this.year) {
                var res = new CreditCardType_1.CreditCardType().validateCreditCard(this.accountNumber, this.cvv);
                if (res.valid) {
                    info.type = res.type;
                    this.creditCardInfo.splice(this.index, 1, info);
                    this.isValidCreditCard = true;
                    this.clearBankInfo();
                }
                else {
                    this.isValidCreditCard = false;
                }
            }
        }
    };
    AddCompanyComponent.prototype.addressValid = function () {
        if (this.addressDir) {
            return this.addressDir.isValid();
        }
        return false;
    };
    AddCompanyComponent.prototype.ngAfterViewInit = function () {
        var base = this;
        this.dialog = jQuery("#importExpenseModal").dialog({
            autoOpen: false,
            width: '50%',
            modal: true,
            closeText: ""
        });
        var defaultCurrency = {
            code: "USD",
            name: "US Dollar",
            html_symbol: "$"
        };
        var self = this;
        this.companyForm = this._fb.group(this._companyForm.getForm());
        this.newForm();
        setTimeout(function () {
            self.currencyComboBox.setValue(defaultCurrency, 'code');
        }, 100);
        jQuery(".ui-dialog-titlebar").hide();
    };
    AddCompanyComponent.prototype.closeModal = function ($event) {
        $event && $event.preventDefault();
        this.dialog.dialog('close');
    };
    AddCompanyComponent.prototype.toggleCompany = function (companyId) {
        this.selectedCompany = _.find(this.existingCompanies, { 'id': companyId });
    };
    AddCompanyComponent.prototype.showImportModal = function () {
        this.dialog.dialog('open');
    };
    AddCompanyComponent.prototype.importExpenseCodes = function () {
        if (this.selectedCompany) {
            var expenseCodesControl = this.companyForm.controls['expenseCodes'];
            expenseCodesControl.patchValue(this.selectedCompany.expenseCodes);
        }
        this.dialog.dialog('close');
    };
    AddCompanyComponent.prototype.removeBankInfo = function (index, paymentType) {
        if (paymentType == "bank") {
            this.bankInfo.splice(index, 1);
        }
        else {
            this.creditCardInfo.splice(index, 1);
        }
    };
    AddCompanyComponent.prototype.editBankInfo = function (bankInfo, index) {
        this.index = index;
        if (bankInfo.paymentType == 'bank') {
            this.accountHolderName = bankInfo.name;
            this.bankName = bankInfo.bankName;
            this.accountNumber = bankInfo.accountNumber;
            this.routingNumber = bankInfo.routingNumber;
        }
        else {
            this.creditCardHolderName = bankInfo.name;
            this.type = bankInfo.type;
            this.accountNumber = bankInfo.number;
            this.cvv = bankInfo.cvv;
            this.paymentType = bankInfo.paymentType;
            this.nickName = bankInfo.nickName;
            this.month = bankInfo.expiryDate.split("/")[0];
            this.year = bankInfo.expiryDate.split("/")[1];
        }
    };
    AddCompanyComponent.prototype.setPaymentType = function ($event) {
        this.paymentType = $event.target.value;
    };
    AddCompanyComponent.prototype.clearBankInfo = function () {
        this.accountHolderName = null;
        this.bankName = null;
        this.accountNumber = null;
        this.routingNumber = null;
        this.nickName = null;
        this.month = null;
        this.year = null;
        this.type = null;
        this.cvv = null;
        this.creditCardHolderName = null;
    };
    AddCompanyComponent.prototype.cleanData = function (data) {
        delete data.accountNumber;
        delete data.routingNumber;
        delete data.creditCardNumber;
        delete data.user;
        delete data.bankName;
        delete data.cardHolderName;
        delete data.accountHolderName;
        delete data.type;
        delete data.paymentType;
        delete data.month;
        delete data.year;
        delete data.cvv;
        delete data.expityDate;
        delete data.nickName;
        delete data.creditCardHolderName;
        return data;
    };
    AddCompanyComponent.prototype.openDwollaWidget = function () {
        location.assign(this.dwollaFullAcountUrl);
    };
    AddCompanyComponent.prototype.savePaymentInfo = function ($event) {
        $event && $event.preventDefault();
        console.log(this.savedCompany.id); // Use this company id while invoking service to save payment information
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Company saved successfully");
        Session_1.Session.deleteKey("pendingCompany");
    };
    AddCompanyComponent.prototype.validateEmail = function () {
        var _this = this;
        var companyEmailId = this.companyForm.controls['companyEmail'];
        if (companyEmailId.value) {
            this.companyService.validateEmail('dev.bills.' + companyEmailId.value + '@qounthq.io')
                .subscribe(function (emailObj) {
                if (emailObj && !emailObj.valid) {
                    _this.emailValidationRes = emailObj;
                    _this.emailValidation = true;
                }
                else {
                    _this.emailValidation = false;
                }
            }, function (error) { return _this.handleValidationError(error); });
        }
    };
    AddCompanyComponent.prototype.handleValidationError = function (error) {
        if (error) {
            this.emailValidation = false;
        }
    };
    AddCompanyComponent.prototype.setDOB = function (date) {
        var dobControl = this.companyForm.controls['contact_date_of_birth'];
        dobControl.patchValue(date);
    };
    return AddCompanyComponent;
}());
__decorate([
    core_1.ViewChild('countryComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], AddCompanyComponent.prototype, "countryComboBox", void 0);
__decorate([
    core_1.ViewChild('currencyComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], AddCompanyComponent.prototype, "currencyComboBox", void 0);
__decorate([
    core_1.ViewChild('stateComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], AddCompanyComponent.prototype, "stateComboBox", void 0);
__decorate([
    core_1.ViewChild('addressDir'),
    __metadata("design:type", address_directive_1.Address)
], AddCompanyComponent.prototype, "addressDir", void 0);
AddCompanyComponent = __decorate([
    core_1.Component({
        selector: 'addCompany',
        templateUrl: '/app/views/addCompany.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.Router, Company_Form_1.CompanyForm, SwitchBoard_1.SwitchBoard,
        router_1.ActivatedRoute, Companies_service_1.CompaniesService, Currency_service_1.CurrencyService,
        LoadingService_1.LoadingService, Toast_service_1.ToastService])
], AddCompanyComponent);
exports.AddCompanyComponent = AddCompanyComponent;
