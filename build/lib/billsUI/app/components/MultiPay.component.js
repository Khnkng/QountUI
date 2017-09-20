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
 * Created by seshagirivellanki on 17/01/17.
 */
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Session_1 = require("qCommon/app/services/Session");
var Bills_service_1 = require("../services/Bills.service");
var OAuthService_1 = require("../services/OAuthService");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var MultiPayComponent = (function () {
    function MultiPayComponent(companyService, _route, billsService, _router, _oAuthService, _toastService, loadingService) {
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
        this.fundingSource = {};
        this.companyCurrency = 'USD';
        this.selectedBills = [];
        this.selectedCredits = [];
        this.credits = [];
        this.totalCredit = 0;
        this.totalBillAmount = 0;
        this.totalAmount = 0;
        this.creditsConversionList = [];
        this.companyAccounts = [];
        this.futureDate = null;
        this.hasForeignCurrency = false;
        this.markPaid = false;
        /*showDashboard(payLater?) {
            let tabId = 'paid';
            if(payLater) {
                tabId = 'pay';
            }
            let link = ['payments/dashboard', tabId];
            this._router.navigate(link);
        }*/
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
        this.paymentSelected = false;
        this.loadingService.triggerLoadingEvent(true);
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.companyId = params['companyId'];
            _this.loadCompany();
        });
        this.selectedBills = Session_1.Session.get("selectedBills");
        this.paymentMode = this.selectedBills[0].vendorPaymentMethod;
        this.selectedCredits = Session_1.Session.get("selectedCredits");
        this.hasForeignCurrency = Session_1.Session.get("hasForeignCurrency");
        this.vendorName = this.selectedBills[0].vendorName;
        var base = this;
        var currentDate = moment(new Date()).format("YYYY-MM-DD");
        var defaultCompanyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.billsService.credits(this.companyId).subscribe(function (credits) {
            _this.credits = _.filter(credits, function (credit) { return credit.vendorName === base.vendorName; });
            _this.loadingService.triggerLoadingEvent(false);
            _this.credits.forEach(function (credit) {
                var currencyConversionOBJ = {
                    toCurrency: defaultCompanyCurrency,
                    date: currentDate
                };
                var creditFound = _.find(base.selectedCredits, function (_credit) {
                    return _credit.id == credit.id;
                });
                currencyConversionOBJ.id = credit.id;
                currencyConversionOBJ.fromCurrency = credit.currency;
                currencyConversionOBJ.amount = credit.totalAmount;
                if (creditFound) {
                    credit.isSelected = true;
                    /*credit.totalAmount=creditFound.totalAmount;*/
                }
                base.creditsConversionList.push(currencyConversionOBJ);
            });
            _this.billsService.convertCurrency(_this.creditsConversionList)
                .subscribe(function (conversionData) {
                base.credits.forEach(function (credit, index) {
                    var creditFound = _.find(conversionData, function (_credit) {
                        return _credit.id == credit.id;
                    });
                    if (creditFound) {
                        if (credit.currency != Session_1.Session.getCurrentCompanyCurrency()) {
                            credit.totalAmount = creditFound.convertedAmount;
                            credit.conversionRate = creditFound.conversionRate;
                        }
                    }
                });
                base.setTotalAmount();
            }, function (error) { return _this.handleError(error); });
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
        this.billsService.getCompanyAccounts(this.companyId)
            .subscribe(function (accountsList) {
            _this.companyAccounts = accountsList.accounts;
        }, function (error) { return _this.handleError(error); });
    }
    MultiPayComponent.prototype.loadCompany = function () {
        var _this = this;
        this.companyService.company(this.companyId)
            .subscribe(function (company) {
            _this.creditCardInfo = company.paymentInfo;
            _this.companyCurrency = company.defaultCurrency;
        }, function (error) {
        });
    };
    MultiPayComponent.prototype.validateFields = function () {
        if (!this.title) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please Enter Payment Title");
            return false;
        }
        if (!this.selectedBankAccount) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select bank account");
            return false;
        }
        if (this.markPaid) {
            if (!this.payDate) {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select pay date");
                return false;
            }
            if (!this.payNumber) {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please enter pay number");
                return false;
            }
        }
        return true;
    };
    MultiPayComponent.prototype.applyMarkPaid = function () {
        var markPaidBills;
        var bills = [];
        if (!this.validateFields())
            return;
        this.payBills(false);
    };
    MultiPayComponent.prototype.payBills = function (hasSchedulePay) {
        var _this = this;
        if (!this.markPaid) {
            if (!this.validateFields())
                return;
        }
        var base = this;
        var paymentsObj = {};
        paymentsObj.payments = [];
        paymentsObj.credits = [];
        var isValidTransaction = true;
        this.selectedBills.forEach(function (bill) {
            var payAmount = Number(bill.payAmount), unpaidAmount = Number(bill.unpaidAmount);
            if (isValidTransaction) {
                if (payAmount && Number(payAmount.toFixed(2)) <= Number(unpaidAmount.toFixed(2))) {
                    var paymentObj = {};
                    paymentsObj.title = base.title;
                    paymentObj.billID = bill.id;
                    paymentObj.billName = bill.name;
                    paymentObj.amount = bill.payAmount;
                    paymentObj.billNumber = bill.billNumber;
                    paymentObj.currency = "USD";
                    paymentsObj.notes = "";
                    paymentsObj.remarks = "";
                    paymentsObj.destinationID = bill.vendorID;
                    paymentsObj.destinationType = "vendor";
                    paymentsObj.paymentMethod = base.paymentMode;
                    paymentObj.conversionRate = bill.conversionRate ? bill.conversionRate : 1;
                    paymentsObj.bankAccountID = base.selectedBankAccount;
                    paymentsObj.markAsPaid = base.markPaid;
                    if (hasSchedulePay) {
                        paymentsObj.scheduledDate = base.futureDate;
                    }
                    paymentsObj.payments.push(paymentObj);
                    isValidTransaction = true;
                }
                else {
                    isValidTransaction = false;
                }
            }
        });
        this.credits.forEach(function (credit) {
            if (credit.isSelected) {
                var creditObj = {};
                creditObj.id = credit.id;
                creditObj.conversionRate = credit.conversionRate;
                paymentsObj.credits.push(creditObj);
            }
        });
        if (isValidTransaction) {
            this.loadingService.triggerLoadingEvent(true);
            this._oAuthService.multiPay(paymentsObj, this.companyId).subscribe(function (status) {
                _this.loadingService.triggerLoadingEvent(false);
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Funds transfer initiated successfully");
                _this.showPaymentsTab(hasSchedulePay);
            }, function (error) {
                console.log("error", error);
                if (error) {
                    var err = JSON.parse(error).message;
                    _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, err);
                }
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
        else {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "your payment exceeds unpaid amount");
        }
    };
    MultiPayComponent.prototype.showPaymentsTab = function (hasSchedulePay) {
        var tabId = 'paid';
        if (hasSchedulePay) {
            tabId = 'pay';
        }
        var link = ['payments/dashboard', tabId];
        this._router.navigate(link);
    };
    MultiPayComponent.prototype.valueChanged = function (source) {
        this.paymentSelected = true;
        this.fundingSource = source;
        console.log("CHANGED RADIO", source);
    };
    MultiPayComponent.prototype.checkBills = function () {
        var valid = true;
        this.selectedBills.forEach(function (bill) {
            if (bill.payAmount <= 0) {
                valid = false;
            }
        });
        return valid && (this.paymentMode || this.totalAmount <= 0);
    };
    MultiPayComponent.prototype.selectCredit = function (credit) {
        //credit.isSelected = !credit.isSelected;
        this.setTotalAmount();
    };
    MultiPayComponent.prototype.setTotalAmount = function () {
        var totalCredit = 0;
        var totalBillAmount = 0;
        this.selectedBills.forEach(function (bill) {
            if (bill.payAmount) {
                totalBillAmount += parseFloat(bill.payAmount);
            }
        });
        this.credits.forEach(function (credit) {
            if (credit.isSelected && credit.totalAmount) {
                totalCredit += parseFloat(credit.totalAmount);
            }
        });
        this.totalCredit = totalCredit;
        this.totalBillAmount = totalBillAmount;
        this.totalAmount = totalBillAmount - totalCredit;
    };
    MultiPayComponent.prototype.ngOnDestroy = function () {
        jQuery('#pay-later-dropdown').remove();
        this.routeSub.unsubscribe();
    };
    MultiPayComponent.prototype.onBankSelect = function (bankAccount) {
        this.selectedBankAccount = bankAccount.id;
    };
    MultiPayComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    MultiPayComponent.prototype.setFutureDate = function (date) {
        this.futureDate = date;
    };
    MultiPayComponent.prototype.openSchedulePay = function () {
        jQuery('#pay-later-dropdown').foundation('open');
    };
    MultiPayComponent.prototype.setMarkPaidDate = function (date) {
        this.payDate = date;
    };
    MultiPayComponent.prototype.hasMarkPaidApplied = function () {
        this.markPaid = !this.markPaid;
    };
    return MultiPayComponent;
}());
__decorate([
    core_1.ViewChild('bankAccountsComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], MultiPayComponent.prototype, "bankAccountsComboBox", void 0);
MultiPayComponent = __decorate([
    core_1.Component({
        selector: 'multiPay',
        templateUrl: '/app/views/multipay.html',
    }),
    __metadata("design:paramtypes", [Companies_service_1.CompaniesService, router_1.ActivatedRoute, Bills_service_1.BillsService, router_1.Router, OAuthService_1.OAuthService, Toast_service_1.ToastService,
        LoadingService_1.LoadingService])
], MultiPayComponent);
exports.MultiPayComponent = MultiPayComponent;
