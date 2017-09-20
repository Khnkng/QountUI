/**
 * Created by seshu on 19-07-2016.
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
var Companies_service_1 = require("../services/Companies.service");
var forms_1 = require("@angular/forms");
var core_1 = require("@angular/core");
var footable_directive_1 = require("../directives/footable.directive");
var comboBox_directive_1 = require("../directives/comboBox.directive");
var Provinces_constants_1 = require("../constants/Provinces.constants");
var Qount_constants_1 = require("../constants/Qount.constants");
var Toast_service_1 = require("../services/Toast.service");
var Date_constants_1 = require("../constants/Date.constants");
var Currency_constants_1 = require("../constants/Currency.constants");
var router_1 = require("@angular/router");
var Company_Form_1 = require("../forms/Company.Form");
var CreditCardType_1 = require("../models/CreditCardType");
var Session_1 = require("../services/Session");
var SwitchBoard_1 = require("../services/SwitchBoard");
var Currency_service_1 = require("../services/Currency.service");
var address_directive_1 = require("../directives/address.directive");
var LoadingService_1 = require("../services/LoadingService");
var PageTitle_1 = require("../services/PageTitle");
var CompanyComponent = (function () {
    function CompanyComponent(_fb, _route, _router, companyService, _companyForm, _toastService, currencyService, switchBoard, loadingService, titleService) {
        var _this = this;
        this._fb = _fb;
        this._route = _route;
        this._router = _router;
        this.companyService = companyService;
        this._companyForm = _companyForm;
        this._toastService = _toastService;
        this.currencyService = currencyService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.titleService = titleService;
        this.type = "component";
        this.company = {};
        this.tableData = {};
        this.tableOptions = { search: false };
        this.editMode = false;
        this.companyUsers = [];
        this.countries = Provinces_constants_1.PROVINCES.COUNTRIES;
        this.states = [];
        this.days = Date_constants_1.MONTHS;
        this.years = Date_constants_1.YEARS;
        this.companyTypes = Qount_constants_1.COMPANY_TYPES;
        this.companyClassifications = Qount_constants_1.COMPANY_CLASSIFICATION;
        this.dwollaFullAcountUrl = "https://uat.dwolla.com/oauth/v2/authenticate?client_id=h18ozPUBDMv5vCkEDpxaxmKRmS4GeOGeOe8E5yS4eSMalHlBbe&response_type=code&redirect_uri=http://bigpay-ui.e0fee844.svc.dockerapp.io/oAuth&scope=AccountInfoFull|Transactions|Send|Funding|Scheduled&verified_account=true";
        this.currencies = Currency_constants_1.CURRENCY;
        this.havingCompanyMail = false;
        this.emailValidation = true;
        this.showFlyout = false;
        // Reset the form with a new hero AND restore 'pristine' class state
        // by toggling 'active' flag which causes the form
        // to be removed/re-added in a tick via NgIf
        // TODO: Workaround until NgForm has a reset method (#6822)
        this.active = true;
        this.active1 = true;
        this.creditCardInfo = [];
        this.bankInfo = [];
        this.isValidCreditCard = true;
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.companyId = params['id'];
        });
        this.companyForm = this._fb.group(_companyForm.getForm());
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        this.todaysDate = mm + "/" + dd + "/" + yyyy;
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showFlyout) {
                _this.hideFlyout();
            }
            else {
                _this.toolsRedirect();
            }
        });
    }
    CompanyComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    CompanyComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    CompanyComponent.prototype.companySubmit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._companyForm.getData(this.companyForm);
        data.id = this.company.id;
        Session_1.Session.setCurrentCompanyName(data.name);
        this.switchBoard.onCompanyUpdate.next();
        data.paymentInfo = this.bankInfo.concat(this.creditCardInfo);
        data.group = 'payments';
        if (this.emailValidationRes)
            data.companyEmail = this.emailValidationRes.email;
        var data1 = this.addressDir.getData();
        data1.country = data.country;
        data1.address_id = this.company.addresses[0].address_id;
        data.addresses = [data1];
        this.companyService.updateCompany(this.cleanData(data))
            .subscribe(function (success) { return _this.showCompanyMessage(true, data); }, function (error) { return _this.showCompanyMessage(false, error); });
    };
    CompanyComponent.prototype.selectedededCurrency = function (currency) {
        console.log("currency", currency);
        var countryControl = this.companyForm.controls['defaultCurrency'];
        countryControl.patchValue(currency.code);
    };
    CompanyComponent.prototype.showProvince = function (country) {
        this.states = _.filter(Provinces_constants_1.PROVINCES.COUNTRY_PROVINCES, function (province) {
            return province.country == country.code;
        });
        var countryControl = this.companyForm.controls['country'];
        countryControl.patchValue(country.name);
        this.countryCode = country.code;
        var base = this;
        if (this.company.addresses[0] && this.company.addresses[0].country == country.name) {
            setTimeout(function () {
                base.addressDir.setData(base.company.addresses[0]);
            }, 500);
        }
    };
    CompanyComponent.prototype.selectState = function (state) {
        var stateControl = this.companyForm.controls['state'];
        stateControl.patchValue(state.name);
    };
    CompanyComponent.prototype.showCompanyMessage = function (status, obj) {
        this.switchBoard.onCompanyAddOrDelete.next();
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.message = "Company updated successfully.";
            this.newForm1();
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Company updated successfully");
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
    CompanyComponent.prototype.newForm = function () {
        var _this = this;
        this.active = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    CompanyComponent.prototype.newForm1 = function () {
        var _this = this;
        this.active1 = false;
        this.showAddress = false;
        setTimeout(function () { return _this.active1 = true; }, 0);
    };
    CompanyComponent.prototype.setPaymentType = function ($event) {
        this.paymentType = $event.target.value;
    };
    CompanyComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    CompanyComponent.prototype.addBankInfo = function (isEdit, paymentType) {
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
    CompanyComponent.prototype.removeBankInfo = function (index, paymentType) {
        if (paymentType == "bank") {
            this.bankInfo.splice(index, 1);
        }
        else {
            this.creditCardInfo.splice(index, 1);
        }
    };
    CompanyComponent.prototype.editBankInfo = function (bankInfo, index) {
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
    CompanyComponent.prototype.clearBankInfo = function () {
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
    CompanyComponent.prototype.cleanData = function (data) {
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
    CompanyComponent.prototype.setDate = function (date, lockdate) {
        var jeDateControl = this.companyForm.controls['fiscalStartDate'];
        jeDateControl.patchValue(date);
    };
    CompanyComponent.prototype.openDwollaWidget = function () {
        location.assign(this.dwollaFullAcountUrl);
    };
    CompanyComponent.prototype.validateEmail = function () {
        var _this = this;
        var base = this;
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
    CompanyComponent.prototype.handleValidationError = function (error) {
        if (error) {
            this.emailValidation = false;
        }
    };
    CompanyComponent.prototype.addressValid = function () {
        if (this.addressDir) {
            return this.addressDir.isValid();
        }
        return false;
    };
    CompanyComponent.prototype.fetchCompanyData = function () {
        var _this = this;
        if (this.companyId) {
            this.companyService.company(this.companyId)
                .subscribe(function (company) {
                _this.company = company;
                _this._companyForm.updateForm(_this.companyForm, _this.company);
                var countryName = _this.company.addresses[0].country;
                var country = _.find(Provinces_constants_1.PROVINCES.COUNTRIES, function (_country) {
                    return _country.name == countryName;
                });
                var currencyCode = _this.company.defaultCurrency;
                var currency = _.find(_this.currencies, function (_currency) {
                    return _currency.code == currencyCode;
                });
                if (company.companyEmail) {
                    _this.havingCompanyMail = true;
                }
                var base = _this;
                setTimeout(function () {
                    base.countryComboBox.setValue(country, 'name');
                }, 500);
                setTimeout(function () {
                    base.currencyComboBox.setValue(currency, 'code');
                }, 500);
                setTimeout(function () {
                    base.loadingService.triggerLoadingEvent(false);
                }, 1500);
                _this.bankInfo = _.filter(company.paymentInfo, ['paymentType', 'bank']);
                _this.creditCardInfo = _.filter(company.paymentInfo, ['paymentType', 'creditCard']);
            }, function (error) { return _this.handleError(error); });
        }
        else {
            this.loadingService.triggerLoadingEvent(false);
        }
    };
    CompanyComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.currencyService.currencies()
            .subscribe(function (currencies) {
            _this.currencies = currencies;
            _this.fetchCompanyData();
        }, function (error) { return _this.handleError(error); });
    };
    CompanyComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Companies");
        var link = ['companies'];
        this._router.navigate(link);
    };
    CompanyComponent.prototype.setDOB = function (date) {
        var dobControl = this.companyForm.controls['contact_date_of_birth'];
        dobControl.patchValue(date);
    };
    return CompanyComponent;
}());
__decorate([
    core_1.ViewChild('createVendor'),
    __metadata("design:type", Object)
], CompanyComponent.prototype, "createVendor", void 0);
__decorate([
    core_1.ViewChild('countryComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], CompanyComponent.prototype, "countryComboBox", void 0);
__decorate([
    core_1.ViewChild('currencyComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], CompanyComponent.prototype, "currencyComboBox", void 0);
__decorate([
    core_1.ViewChild('vendorCountryComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], CompanyComponent.prototype, "vendorCountryComboBox", void 0);
__decorate([
    core_1.ViewChild('stateComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], CompanyComponent.prototype, "stateComboBox", void 0);
__decorate([
    core_1.ViewChild('vendorStateComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], CompanyComponent.prototype, "vendorStateComboBox", void 0);
__decorate([
    core_1.ViewChild('addressDir'),
    __metadata("design:type", address_directive_1.Address)
], CompanyComponent.prototype, "addressDir", void 0);
__decorate([
    core_1.ViewChild('fooTableDir'),
    __metadata("design:type", footable_directive_1.FTable)
], CompanyComponent.prototype, "fooTableDir", void 0);
CompanyComponent = __decorate([
    core_1.Component({
        selector: 'company',
        templateUrl: '/app/views/company.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.ActivatedRoute, router_1.Router, Companies_service_1.CompaniesService,
        Company_Form_1.CompanyForm, Toast_service_1.ToastService, Currency_service_1.CurrencyService,
        SwitchBoard_1.SwitchBoard, LoadingService_1.LoadingService, PageTitle_1.pageTitleService])
], CompanyComponent);
exports.CompanyComponent = CompanyComponent;
