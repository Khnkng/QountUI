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
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Bills_service_1 = require("../services/Bills.service");
var OAuthService_1 = require("../services/OAuthService");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var BillPayComponent = (function () {
    function BillPayComponent(companyService, _route, billsService, _router, _oAuthService, _toastService, loadingService) {
        var _this = this;
        this.companyService = companyService;
        this._route = _route;
        this.billsService = billsService;
        this._router = _router;
        this._oAuthService = _oAuthService;
        this._toastService = _toastService;
        this.loadingService = loadingService;
        this.bankInfo = [];
        this.creditCardInfo = [];
        this.fundingSources = [];
        this.vendor = null;
        this.fundingSource = {};
        this.unpaidAmount = 0;
        this.amountPaid = 0;
        this.companyCurrency = 'USD';
        this.convertedBillAmount = 0;
        this.companyAccounts = [];
        this.paymentSelected = false;
        this.loadingService.triggerLoadingEvent(true);
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.companyId = params['companyId'];
            _this.billId = params['id'];
            _this.loadCompany();
            _this.billsService.getCompanyAccounts(_this.companyId)
                .subscribe(function (accountsList) {
                _this.companyAccounts = accountsList.accounts;
            }, function (error) { return _this.handleError(error); });
        });
    }
    BillPayComponent.prototype.loadCompany = function () {
        var _this = this;
        this.companyService.company(this.companyId)
            .subscribe(function (company) {
            _this.creditCardInfo = company.paymentInfo;
            _this.companyCurrency = company.defaultCurrency;
            _this.loadBill();
        }, function (error) {
        });
    };
    BillPayComponent.prototype.getVendor = function () {
        var _this = this;
        this.companyService.vendor(this.companyId, this.bill.vendorID.toLowerCase())
            .subscribe(function (vendor) {
            _this.vendor = vendor;
            if (_this.vendor.paymentMethod) {
                _this.paymentMode = _this.vendor.paymentMethod;
            }
            else {
                _this.paymentMode = 'ach';
            }
        }, function (error) {
        });
    };
    BillPayComponent.prototype.loadBill = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.billsService.bill(this.companyId, this.billId)
            .subscribe(function (bill) {
            _this.bill = bill;
            _this.billAmount = bill.amount;
            _this.amountPaid = bill.amountPaid ? bill.amountPaid : 0;
            _this.payAmount = (_this.billAmount - _this.amountPaid) ? (_this.billAmount - _this.amountPaid).toFixed(2) : 0;
            _this.unpaidAmount = _this.billAmount - _this.amountPaid;
            _this.dueDate = bill.dueDate;
            _this.billCurrency = bill.currency;
            if (_this.billCurrency != _this.companyCurrency) {
                _this.billsService.getConvertedCurrencyValue(_this.billCurrency, _this.companyCurrency, moment(new Date()).format("YYYY-MM-DD"))
                    .subscribe(function (res) {
                    _this.unpaidAmount = _this.unpaidAmount * res.result;
                    _this.convertedBillAmount = _this.billAmount * res.result;
                    _this.payAmount = Number((_this.convertedBillAmount - _this.amountPaid).toFixed(2));
                    _this.unpaidAmount = _this.payAmount;
                }, function (error) {
                    _this.loadingService.triggerLoadingEvent(false);
                });
            }
            _this.getVendor();
        }, function (error) {
        });
    };
    BillPayComponent.prototype.payBill = function () {
        /*this.bill.lines=JSON.parse(this.bill.lines);
         this.bill.action = 'submit';
         this.billsService.updateBill(<BillModel>this.cleanBillData(this.bill))
         .subscribe(success  => {
         let link = ['Dashboard'];
         this._router.navigate(link);
         }, error =>  {
         let link = ['BillEntry', {"companyId": this.companyId,"id":this.billId}];
         this._router.navigate(link);
         });*/
        var _this = this;
        var actualAmount = (this.companyCurrency != this.billCurrency) ? this.convertedBillAmount : this.billAmount;
        if (Number(this.payAmount) + this.amountPaid > actualAmount) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Payment amount exceeds bill amount");
            return;
        }
        if (!this.selectedBankAccount) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select bank account");
            return;
        }
        var transferObj = {
            "billID": this.bill.id,
            "billName": this.bill.name,
            "amount": this.payAmount,
            "billNumber": this.bill.billID,
            "currency": "USD",
            "notes": "",
            "remarks": "",
            "destinationID": this.vendor.id,
            "destinationType": "vendor",
            "paymentMethod": this.paymentMode,
            "bankAccountID": this.selectedBankAccount
            //"fundingSource": this.fundingSource['_links']['self']['href']
        };
        var paymentsObj = {};
        paymentsObj.payments = [transferObj];
        this.loadingService.triggerLoadingEvent(true);
        this._oAuthService.multiPay(paymentsObj, this.companyId).subscribe(function (status) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.paymentMode = null;
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Funds transfer initiated successfully");
            //this.updateBill();
            _this.showDashboard();
        }, function (error) {
            console.log("error", error);
            if (error) {
                var err = JSON.parse(error).message;
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, err);
            }
        });
    };
    BillPayComponent.prototype.showDashboard = function (payLater) {
        var tabId = 3;
        if (payLater) {
            tabId = 2;
        }
        var link = ['payments/dashboard', tabId];
        this._router.navigate(link);
    };
    /*updateBill() {
  
        this.bill.lines=JSON.parse(this.bill.lines);
        this.bill.action = 'submit';
        this.billsService.updateBill(<BillModel>this.cleanBillData(this.bill))
          .subscribe(success  => {
            let link = ['Dashboard'];
            this._router.navigate(link);
          }, error =>  {
            let link = ['BillEntry', {"companyId": this.companyId,"id":this.billId}];
            this._router.navigate(link);
          });
  
    }*/
    BillPayComponent.prototype.cleanBillData = function (data) {
        delete data.history;
        delete data.lastUpdated;
        delete data.dueDateLong;
        delete data.lastUpdatedBy;
        delete data.subState;
        delete data.bucketName;
        delete data.documentKeyName;
        delete data.currentUsers;
        delete data.link;
        delete data['userID'];
        delete data.ownerID;
        delete data.createdTime;
        delete data.billNumber;
        delete data.currentState;
        return data;
    };
    BillPayComponent.prototype.setFutureDate = function (date) {
        this.futureDate = date;
    };
    BillPayComponent.prototype.makeFuturePayment = function () {
        var _this = this;
        var transferObj = {
            "billID": this.bill.id,
            "billName": this.bill.name,
            "amount": this.payAmount,
            "currency": "USD",
            "notes": "",
            "remarks": "",
            "destinationID": this.vendor.id,
            "destinationType": "vendor",
            "fundingSource": this.fundingSource['id'],
            "scheduledDate": this.futureDate,
            "pin": this.accountPin,
            "billNumber": this.bill.billID,
            "paymentMethod": this.paymentMode
        };
        this.loadingService.triggerLoadingEvent(true);
        this._oAuthService.futureFundTransfer(transferObj, this.companyId).subscribe(function (status) {
            _this.loadingService.triggerLoadingEvent(false);
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Funds transfer initiated successfully");
            //this.updateBill();
            _this.showDashboard(true);
        }, function (error) {
            if (error) {
                var err = JSON.parse(error).message;
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, err);
            }
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    BillPayComponent.prototype.valueChanged = function (source) {
        if (this.billAmount)
            this.paymentSelected = true;
        this.fundingSource = source;
        console.log("CHANGED RADIO", source);
    };
    BillPayComponent.prototype.onBankSelect = function (bankAccount) {
        this.selectedBankAccount = bankAccount.id;
    };
    BillPayComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
    };
    BillPayComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    return BillPayComponent;
}());
__decorate([
    core_1.ViewChild('bankAccountsComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], BillPayComponent.prototype, "bankAccountsComboBox", void 0);
BillPayComponent = __decorate([
    core_1.Component({
        selector: 'billPay',
        templateUrl: '/app/views/billpay.html',
    }),
    __metadata("design:paramtypes", [Companies_service_1.CompaniesService, router_1.ActivatedRoute, Bills_service_1.BillsService, router_1.Router, OAuthService_1.OAuthService, Toast_service_1.ToastService,
        LoadingService_1.LoadingService])
], BillPayComponent);
exports.BillPayComponent = BillPayComponent;
