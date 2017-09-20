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
 * Created by seshu on 26-02-2016.
 */
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var Bills_service_1 = require("../services/Bills.service");
var platform_browser_1 = require("@angular/platform-browser");
var DocHub_service_1 = require("../services/DocHub.service");
var DocHub_model_1 = require("../models/DocHub.model");
var Session_1 = require("qCommon/app/services/Session");
var Box_service_1 = require("../services/Box.service");
var Box_model_1 = require("../models/Box.model");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var OAuthService_1 = require("../services/OAuthService");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var payments_constants_1 = require("../constants/payments.constants");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var ExpenseCodes_service_1 = require("qCommon/app/services/ExpenseCodes.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Payments_service_1 = require("qCommon/app/services/Payments.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var HighChart_directive_1 = require("qCommon/app/directives/HighChart.directive");
var StateService_1 = require("qCommon/app/services/StateService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var DashBoardComponent = (function () {
    /*end of dashboard variables*/
    function DashBoardComponent(billsService, boxService, docHubService, dss, _router, _route, _oAuthService, _toastService, companyService, switchBoard, expensesService, loadingService, paymentsService, numeralService, stateService, dateFormater, reportService, titleService) {
        var _this = this;
        this.billsService = billsService;
        this.boxService = boxService;
        this.docHubService = docHubService;
        this.dss = dss;
        this._router = _router;
        this._route = _route;
        this._oAuthService = _oAuthService;
        this._toastService = _toastService;
        this.companyService = companyService;
        this.switchBoard = switchBoard;
        this.expensesService = expensesService;
        this.loadingService = loadingService;
        this.paymentsService = paymentsService;
        this.numeralService = numeralService;
        this.stateService = stateService;
        this.dateFormater = dateFormater;
        this.reportService = reportService;
        this.titleService = titleService;
        this.tabBackground = "#d45945";
        this.selectedTabColor = "#d45945";
        this.tabDisplay = [{ 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }];
        this.bgColors = [
            '#d45945',
            '#d47e47',
            '#2980b9',
            '#3dc36f'
        ];
        this.hasBillsList = false;
        this.billsTableData = {};
        this.billsTableOptions = { search: true, pageSize: 7 };
        this.bills = [];
        this.credits = [];
        this.badges = [];
        this.selectedTab = 'dashboard';
        this.isLoading = true;
        this.displayCurrency = 'USD';
        this.showPreview = false;
        this.localBadges = {};
        this.boxInfo = new Box_model_1.BoxModel();
        this.hideBoxes = true;
        this.expenseCodeCount = 0;
        this.paymentsCount = 0;
        this.selectedRows = [];
        this.tabStates = ['dashboard', 'enter', 'approve', 'pay', 'paid'];
        this.localeFortmat = 'en-US';
        this.allSelectedRows = [];
        /*dashboard variables*/
        this.report = {};
        this.hasItemCodes = false;
        this.tableData = {};
        this.tableColumns = ['bill_date', 'vendor_name', 'current_state', 'due_date', 'amount', 'daysToPay'];
        this.tableOptions = {};
        this.reportasas = false;
        this.payable = false;
        this.isTransit = false;
        this.showCharts = false;
        this.paycount = false;
        this.payablecount = false;
        this.payableBalance = false;
        this.detailedChartIcons = 'apply';
        this.chartColors = ['#44B6E8', '#808CC5', '#00B1A9', '#F06459', '#22B473', '#384986', '#4554A4', '#808CC5'];
        this.selectedColor = 'red-tab';
        this.currencyConversionList = [];
        this.loadingService.triggerLoadingEvent(true);
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteBill(toast); });
        this.stateService.clearAllStates();
        this.routeSub = this._route.params.subscribe(function (params) {
            if (params['tabId'] == 'dashboard') {
                _this.selectedTab = 0;
                _this.titleService.setPageTitle("dashboard");
            }
            else if (params['tabId'] == 'enter') {
                _this.selectedTab = 1;
                _this.titleService.setPageTitle("enter");
            }
            else if (params['tabId'] == 'approve') {
                _this.selectedTab = 2;
                _this.titleService.setPageTitle("approve");
            }
            else if (params['tabId'] == 'pay') {
                _this.selectedTab = 3;
                _this.titleService.setPageTitle("pay");
            }
            else if (params['tabId'] == 'paid') {
                _this.selectedTab = 4;
                _this.titleService.setPageTitle("paid");
            }
            else {
                console.log("error");
            }
            _this.companyId = Session_1.Session.getCurrentCompany();
            _this.billsService.getCompanyAccounts(_this.companyId)
                .subscribe(function (accountsList) {
                _this.companyAccountsList = _.map(accountsList.accounts, 'name');
                _this.companyAccounts = accountsList.accounts;
            }, function (error) { return _this.handleError(error); });
            if (_this.companyId) {
                _this.expensesService.getAllExpenses(_this.companyId)
                    .subscribe(function (expenseCodes) {
                    _this.expenseCodeCount = expenseCodes ? expenseCodes.length : 0;
                }, function (error) { return _this.handleError(error); });
            }
            _this.paymentsService.paymentsCount(_this.companyId)
                .subscribe(function (payments) {
                _this.paymentsCount = payments ? payments.paymentCount : 0;
            }, function (error) { return _this.handleError(error); });
            /*dashboard constructor*/
            _this.dateFormat = dateFormater.getFormat();
            _this.serviceDateformat = dateFormater.getServiceDateformat();
            _this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
            _this.companyService.getpaymentcount(_this.companyId)
                .subscribe(function (paymentcount) {
                _this.paymentcount = paymentcount;
                _this.payable = true;
            });
            _this.companyService.getlastpaidcount(_this.companyId)
                .subscribe(function (paidcount) {
                _this.paidcount = paidcount;
                _this.payablecount = true;
            });
            _this.companyService.getbookcount(_this.companyId)
                .subscribe(function (bookcount) {
                _this.bookcount = bookcount;
                _this.payableBalance = true;
            });
            _this.companyService.getcurrentpaymenttable(_this.companyId)
                .subscribe(function (tablelist) {
                _this.tablelist = tablelist;
                _this.buildTableData(tablelist);
                // this.showMessage(true, success);
            }, function (error) { return console.log("error"); });
            _this.companyService.getPaymentsInTransit(_this.companyId)
                .subscribe(function (paymentsTransit) {
                _this.paymentsInTransit = paymentsTransit;
                _this.isTransit = true;
            }, function (error) { return console.log("error"); });
            _this.generateChart();
            /*end of dashboard constructor*/
            _this.loadTabData();
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showCharts) {
                _this.hideFlyout();
            }
        });
        /*this.boxService.boxInfo()
         .subscribe(boxInfo  => this.animateBoxInfo(boxInfo), error =>  this.handleError(error));*/
        /*this.companyService.allVendors()
         .subscribe(data =>{
         console.log(data);
         });*/
    }
    DashBoardComponent.prototype.onResize = function (event) {
        var base = this;
        if (this.tabDisplay[0].display == 'block' && !this.showCharts) {
            base.hChart1.redraw();
            base.hChart2.redraw();
            base.hChart3.redraw();
        }
        else if (this.showCharts) {
            base.hChart4.redraw();
        }
        else {
        }
    };
    DashBoardComponent.prototype.refreshCompany = function (currentCompany) {
        var _this = this;
        this.expensesService.getAllExpenses(currentCompany.id)
            .subscribe(function (expenseCodes) {
            _this.expenseCodeCount = expenseCodes ? expenseCodes.length : 0;
        }, function (error) { return _this.handleError(error); });
    };
    DashBoardComponent.prototype.animateBoxInfo = function (boxInfo) {
        this.animateValue('payables', boxInfo.payables);
        this.animateValue('pastDue', boxInfo.pastDue);
        this.animateValue('dueToday', boxInfo.dueToday);
        this.animateValue('dueThisWeek', boxInfo.dueThisWeek);
    };
    DashBoardComponent.prototype.animateValue = function (param, value) {
        var base = this;
        jQuery({ val: value / 2 }).stop(true).animate({ val: value }, {
            duration: 2000,
            easing: "easeOutExpo",
            step: function () {
                var _val = this.val;
                base.boxInfo[param] = Number(_val.toFixed(2));
            }
        }).promise().done(function () {
            // hard set the value after animation is done to be
            // sure the value is correct
            base.boxInfo[param] = value;
        });
    };
    DashBoardComponent.prototype.loadTabData = function () {
        this.selectTab(this.selectedTab, "");
    };
    DashBoardComponent.prototype.ngOnInit = function () {
        var base = this;
        this.payTabColumns = [
            { "name": "id", "title": "ID", "visible": false },
            { "name": "billID", "title": "Bill Number" },
            { "name": "name", "title": "Title", "visible": false },
            /*{"name": "companyID", "title": "Company",'breakpoints': 'xs sm'},*/
            { "name": "vendorName", "title": "Vendor" },
            { "name": "vendorID", "title": "Vendor ID", "visible": false },
            { "name": "billAmount", "title": "Bill Amount", "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align currency-padding" },
            { "name": "dueAmount", "title": "Due Amount", "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align currency-padding" },
            { "name": "vendorPaymentMethod", "title": "Payment Method", 'visible': false },
            { "name": "payByDate", "title": "Pay by Date", type: "date", 'breakpoints': 'xs sm', "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "dueDate", "title": "Due Date", type: "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "daysToPay", "title": "Days to Pay" },
            { "name": "state", "title": "", "type": "html", "filterable": false },
            { "name": "payActions", "title": "", "type": "html", "filterable": false, 'breakpoints': 'xs sm' },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        this.approveTabColumns = [
            { "name": "id", "title": "ID", "visible": false },
            { "name": "billID", "title": "Bill Number" },
            { "name": "name", "title": "Title", "visible": false },
            /*{"name": "companyID", "title": "Company"},*/
            { "name": "vendorName", "title": "Vendor" },
            { "name": "vendorID", "title": "Vendor ID", "visible": false },
            { "name": "vendorPaymentMethod", "title": "Payment Method", "visible": false },
            { "name": "billAmount", "title": "Bill Amount", "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align currency-padding" },
            { "name": "payByDate", "title": "Pay by Date", type: "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "dueDate", "title": "Due Date", 'breakpoints': 'xs sm', type: "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "daysToPay", "title": "Days to Pay" },
            { "name": "state", "title": "", "type": "html", "filterable": false, 'breakpoints': 'xs sm' },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        this.payedTabColumns = [
            { "name": "id", "title": "ID", "visible": false },
            { "name": "billID", "title": "Bill Number" },
            { "name": "name", "title": "Title", "visible": false },
            /*{"name": "companyID", "title": "Company",'breakpoints': 'xs sm'},*/
            { "name": "vendorName", "title": "Vendor" },
            { "name": "vendorID", "title": "Vendor ID", "visible": false },
            { "name": "vendorPaymentMethod", "title": "Payment Method", "visible": false },
            { "name": "paidDate", "title": "Paid Date", "type": "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "billAmount", "title": "Bill Amount", "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align currency-padding" },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
    };
    DashBoardComponent.prototype.reRoutePage = function (tabId) {
        if (tabId == 0) {
            var link = ['payments/dashboard', 'dashboard'];
            this._router.navigate(link);
            return;
        }
        else if (tabId == 1) {
            var link = ['payments/dashboard', 'enter'];
            this._router.navigate(link);
            return;
        }
        else if (tabId == 2) {
            var link = ['payments/dashboard', 'approve'];
            this._router.navigate(link);
            return;
        }
        else if (tabId == 3) {
            var link = ['payments/dashboard', 'pay'];
            this._router.navigate(link);
            return;
        }
        else if (tabId == 4) {
            var link = ['payments/dashboard', 'paid'];
            this._router.navigate(link);
            return;
        }
    };
    DashBoardComponent.prototype.buildBillsTableData = function (bills, fromTab) {
        var _this = this;
        this.bills = bills || [];
        this.billsTableData.columns = [
            { "name": "id", "title": "ID", "visible": false },
            { "name": "billID", "title": "Bill Number" },
            { "name": "vendorName", "title": "Vendor" },
            { "name": "billAmount", "title": "Bill Amount", "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align currency-padding" },
            { "name": "billDate", "title": "Bill Date", "type": "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "name", "title": "Title", "visible": false },
            /*{"name": "companyID", "title": "Company"},*/
            /*{"name": "dueDate", "title": "Due Date","visible": false},*/
            { "name": "lastUpdated", "title": "Last Updated", 'breakpoints': 'xs sm', "visible": false },
            { "name": "lastUpdatedBy", "title": "Last Updated By", "classes": "last-updated-by", "visible": false },
            { "name": "state", "title": "", "type": "html", "filterable": false, 'breakpoints': 'xs sm' },
            { "name": "actions", "title": "", "type": "html", "filterable": false }
        ];
        this.billsTableOptions.selectable = false;
        if ((this.selectedTab == 3) || (this.selectedTab == 2)) {
            this.billsTableData.columns[2] = { "name": "dueDate", "title": "Due Date", "visible": true };
        }
        if (this.selectedTab == 2) {
            this.billsTableData.columns = this.approveTabColumns;
        }
        if (this.selectedTab == 3) {
            this.billsTableData.columns = this.payTabColumns;
            this.billsTableOptions.selectable = true;
        }
        if (this.selectedTab == 4) {
            this.billsTableData.columns = this.payedTabColumns;
        }
        this.billsTableData.rows = [];
        var base = this;
        var currentDate = moment(new Date(), "MM/DD/YYYY");
        this.bills.forEach(function (bill) {
            var row = {};
            var billAmount = bill['amount'] ? bill['amount'] : 0;
            var currency = bill['currency'] ? bill['currency'] : 'USD';
            var billDateCompanyAmount = bill['billDateCompanyAmount'] ? bill['billDateCompanyAmount'] : 0;
            var amountPaid = bill['amountPaid'] ? bill['amountPaid'] : 0;
            var dueAmount = billDateCompanyAmount - amountPaid;
            row['billID'] = bill['billID'];
            row['name'] = bill['name'];
            row['id'] = bill['id'];
            /*row['companyID'] = bill['companyName'];*/
            row['vendorName'] = bill['vendorName'];
            row['vendorID'] = bill['vendorID'];
            row['vendorPaymentMethod'] = base.getPaymentMethod(bill['vendorPaymentMethod']);
            row['billAmount'] = {
                'options': {
                    "classes": "text-right"
                },
                value: billAmount.toLocaleString(base.localeFortmat, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            };
            row['dueAmount'] = {
                'options': {
                    "classes": "text-right"
                },
                value: dueAmount.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session_1.Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 })
            };
            row['lastUpdated'] = bill['lastUpdated'];
            row['lastUpdatedBy'] = bill['lastUpdatedBy'];
            row['dueDate'] = bill['dueDate'];
            row['paidDate'] = bill['paidDate'];
            if (bill.currentState == 'Approve' || bill.currentState == 'Pay') {
                row['payByDate'] = bill['payByDate'];
            }
            if (bill['subState']) {
                row['state'] = "";
                if (bill['subState'] == 'draft') {
                    row['state'] = "<i class='icon ion-clipboard' style='color:#e6604a;font-size: 1.2rem'></i>";
                }
                if (bill['subState'] == 'rejected') {
                    row['state'] = "<i class='icon ion-thumbsdown' style='color:#e6604a;font-size: 1.2rem'></i>";
                }
                if (bill['subState'] && bill['subState'].toLowerCase() == 'scheduled') {
                    if (bill['payments'] && bill['payments'].length > 0 && bill['payments'][bill['payments'].length - 1].scheduledOn) {
                        row['state'] = "<span class='label success' style='background:#0FB45A'>" + moment(bill['payments'][bill['payments'].length - 1].scheduledOn, 'MM-DD-YYYY').format('DD MMM').toUpperCase() + "</span>";
                    }
                }
            }
            else {
                row['state'] = "";
            }
            if (base.selectedTab == 2 || base.selectedTab == 3) {
                var dueDate = bill['dueDate'];
                var daysToPay = moment(bill['dueDate'], "MM/DD/YYYY").diff(currentDate, 'days');
                if (daysToPay <= 0) {
                    daysToPay = '<span color="red" style="color: red">' + daysToPay + '</span>';
                }
                row['daysToPay'] = daysToPay;
                row['actions'] = "<a class='action' data-action='bill'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='Enter' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            if (base.selectedTab == 3) {
                row['id'] = bill['id'];
                if (bill['subState'] && bill['subState'].toLowerCase() != 'scheduled') {
                    row['payActions'] = "<a style='font-size:0.6rem;color:#ffffff;margin:0px 5px 0px 0px;' class='button small action reverseButton' data-action='pay'>Pay</a>";
                }
            }
            if (base.selectedTab == 1) {
                row['billDate'] = bill['billDate'];
                row['actions'] = "<a class='action' data-action='Enter' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            if (base.selectedTab == 4) {
                row['actions'] = "<a class='action' data-action='billPayment'><span class='icon badge je-badge payment-je-badge'>JE</span></a><a class='action' data-action='Enter' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.billsTableData.rows.push(row);
        });
        if (this.bills.length > 0) {
            if (base.selectedTab == 3) {
                this.billsService.credits(this.companyId).subscribe(function (credits) {
                    _this.credits = credits;
                    var base = _this;
                    if (credits.length > 0) {
                        _this.credits.forEach(function (credit) {
                            var row = {};
                            var billAmount = credit['totalAmount'] ? credit['totalAmount'] : 0;
                            var currency = credit['currency'] ? credit['currency'] : 'USD';
                            row['billID'] = credit['customID'];
                            row['name'] = credit['name'];
                            /*row['companyID'] = bill['companyName'];*/
                            row['vendorName'] = credit['vendorName'];
                            row['vendorID'] = credit['vendorID'];
                            row['billAmount'] = {
                                'options': {
                                    "classes": "text-right"
                                },
                                value: '-' + billAmount.toLocaleString(base.localeFortmat, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            };
                            row['lastUpdated'] = credit['``lastUpdated'];
                            row['lastUpdatedBy'] = credit['lastUpdatedBy'];
                            row['dueDate'] = credit['endDate'];
                            row['paidDate'] = credit['paidDate'];
                            //row['state'] = "<i class='icon' style='color:#e6604a;font-size: 1.2rem'>C</i>";
                            row['actions'] = "<a class='action' data-action='creditPayment'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='Enter' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
                            row['id'] = credit['id'];
                            base.billsTableData.rows.push(row);
                            base.hasBillsList = true;
                            base.isLoading = false;
                        });
                        _this.loadingService.triggerLoadingEvent(false);
                    }
                    else {
                        _this.hasBillsList = true;
                        _this.isLoading = false;
                        _this.loadingService.triggerLoadingEvent(false);
                    }
                });
            }
            else {
                this.hasBillsList = true;
                this.isLoading = false;
                this.loadingService.triggerLoadingEvent(false);
            }
        }
        else {
            this.loadingService.triggerLoadingEvent(false);
        }
        if (base.selectedTab != 3)
            this.isLoading = false;
    };
    DashBoardComponent.prototype.handleError1 = function (error) {
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
        this.loadingService.triggerLoadingEvent(false);
    };
    DashBoardComponent.prototype.handleError = function (error) {
    };
    DashBoardComponent.prototype.addFreshBill = function () {
        var link = ['payments/newBill'];
        this._router.navigate(link);
    };
    DashBoardComponent.prototype.addCredit = function () {
        var link = ['payments/newCredit', this.companyId];
        this._router.navigate(link);
    };
    DashBoardComponent.prototype.updateTabHeight = function () {
        var base = this;
        var topOfDiv = jQuery('.tab-content').offset().top;
        topOfDiv = topOfDiv < 150 ? 150 : topOfDiv;
        var bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
        base.tabHeight = (bottomOfVisibleWindow - topOfDiv - 25) + "px";
        jQuery('.tab-content').css('min-height', base.tabHeight);
        base.billsTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
    };
    DashBoardComponent.prototype.ngAfterViewInit = function () {
        var base = this;
        jQuery(document).ready(function () {
            base.updateTabHeight();
        });
    };
    DashBoardComponent.prototype.selectTab = function (tabNo, color) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.isLoading = true;
        this.selectedTab = tabNo;
        this.selectedColor = color;
        this.hasBillsList = false;
        var filters = ['dashboard', 'Enter', 'Approve', 'Pay', 'Paid'];
        var base = this;
        this.tabDisplay.forEach(function (tab, index) {
            base.tabDisplay[index] = { 'display': 'none' };
        });
        this.localBadges = JSON.parse(sessionStorage.getItem("localBadges"));
        this.tabDisplay[tabNo] = { 'display': 'block' };
        this.tabBackground = this.bgColors[tabNo];
        jQuery('.loading-initial-cont').hide();
        this.billsService.bills(this.companyId, filters[tabNo])
            .subscribe(function (billsData) {
            _this.buildBillsTableData(billsData.bills, filters[tabNo]);
            _this.badges = billsData.badges;
            sessionStorage.setItem("localBadges", JSON.stringify(billsData.badges));
            _this.localBadges = JSON.parse(sessionStorage.getItem("localBadges"));
        }, function (error) { return _this.handleError(error); });
    };
    DashBoardComponent.prototype.showBill = function (bill) {
        var selectedBill = _.find(this.bills, function (_bill) {
            return _bill.id == bill.id;
        });
        if (selectedBill) {
            var link = ['payments/bill', this.companyId, selectedBill.id, this.tabStates[this.selectedTab]];
            this._router.navigate(link);
        }
        else {
            var selectedBill_1 = _.find(this.credits, function (_bill) {
                return _bill.id == bill.id;
            });
            var link = ['payments/credit', this.companyId, selectedBill_1.id];
            this._router.navigate(link);
        }
    };
    DashBoardComponent.prototype.removeBill = function (bill) {
        this.billToDelete = bill;
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    DashBoardComponent.prototype.deleteBill = function (toast) {
        var _this = this;
        var billdeleted = this.billToDelete;
        var selectedBill = _.find(this.bills, function (_bill) {
            return _bill.id == billdeleted.id;
        });
        if (selectedBill) {
            this.billsService.deleteBill(selectedBill, this.companyId).subscribe(function (success) {
                _this.selectTab(_this.selectedTab, _this.selectedColor);
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Bill deleted successfully.");
            }, function (error) { return _this.handleError1(error); });
        }
        else {
            var selectedBill_2 = _.find(this.credits, function (_bill) {
                var billtodeleted = this.billToDelete;
                return _bill.id == billtodeleted.id;
            });
            this.billsService.deleteCredit(selectedBill_2).subscribe(function (success) {
                _this.selectTab(_this.selectedTab, _this.selectedColor);
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Bill deleted successfully.");
            }, function (error) { return _this.handleError1(error); });
        }
    };
    DashBoardComponent.prototype.showBillPreview = function (bill) {
        var _this = this;
        var base = this;
        this.hoveredBill = _.find(this.bills, function (_bill) {
            return _bill.id == bill.id;
        });
        if (!this.hoveredBill) {
            this.hoveredBill = _.find(this.credits, function (_bill) {
                return _bill.id == bill.id;
            });
        }
        this.showPreview = true;
        var docHubModel = new DocHub_model_1.DocHubModel();
        docHubModel.bucketName = this.hoveredBill.bucketName;
        docHubModel.keyName = this.hoveredBill.documentKeyName;
        docHubModel.token = Session_1.Session.getToken();
        docHubModel.accessLinkFlag = true;
        /* this.docHubService.getLink(docHubModel).subscribe(docResp  => {
         let link = docResp.message;
         if(link.indexOf(".pdf") == -1) {
         this.isPdf = false;
         setTimeout(function(){
         base.billImageLink = base.dss.bypassSecurityTrustUrl(link);
         }, 500);
         } else {
         this.isPdf = true;
         link = 'http://docs.google.com/gview?embedded=true&url='+link;
         setTimeout(function(){
         base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl(link);
         }, 500);
         }
         }, error =>  this.handleError(error));*/
        var link = "";
        this.billsService.getDocumentBySource(this.hoveredBill.id).subscribe(function (sources) {
            _this.document = sources[0];
            link = _this.document.temporaryURL;
            _this.downloadLink = link;
            if (_this.document.name.indexOf(".pdf") == -1) {
                _this.isPdf = false;
                /*this.docHubService.getLink(docHubModel).subscribe(docResp  => {
                 link = docResp.message;
                 }, error =>  this.handleError(error));*/
                setTimeout(function () {
                    base.billImageLink = base.dss.bypassSecurityTrustUrl(link);
                }, 500);
            }
            else {
                _this.isPdf = true;
                link = 'http://docs.google.com/gview?embedded=true&url=' + encodeURIComponent(link);
                setTimeout(function () {
                    base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl(link);
                }, 500);
            }
        });
        /*this.downloadLink = this.docHubService.getStreamLink(docHubModel);
         let link = this.docHubService.getStreamLink(docHubModel);*/
    };
    DashBoardComponent.prototype.download = function () {
        var _this = this;
        var docHubModel = new DocHub_model_1.DocHubModel();
        var base = this;
        docHubModel.bucketName = this.hoveredBill.bucketName;
        docHubModel.keyName = this.hoveredBill.documentKeyName;
        docHubModel.token = Session_1.Session.getToken();
        docHubModel.download = true;
        this.docHubService.getStream(docHubModel).subscribe(function (docResp) { return _this.docHubService.downloadFile(docResp, _this.hoveredBill.name); }, function (error) { return _this.handleError(error); });
    };
    DashBoardComponent.prototype.handleAction = function (event) {
        var action = event.action;
        delete event.action;
        this.tempData = event;
        if (action == 'Enter') {
            this.userAction = 'edit';
            this.showBill(this.tempData);
        }
        else if (action == 'delete') {
            this.userAction = 'delete';
            this.checkLockDate();
        }
        else if (action == 'pay') {
            this.userAction = 'pay';
            this.checkLockDate();
        }
        else if (action == 'view') {
            this.showBillPreview(event);
        }
        else if (action == 'bill' || action == 'billPayment') {
            this.hoveredBill = _.find(this.bills, function (_bill) {
                return _bill.id == event.id;
            });
            if (this.hoveredBill.journalID)
                this.navigateToJE(this.hoveredBill.journalID);
        }
        else if (action == 'creditPayment') {
            this.hoveredBill = _.find(this.credits, function (_credit) {
                return _credit.id == event.id;
            });
            if (this.hoveredBill.journalID)
                this.navigateToJE(this.hoveredBill.journalID);
        }
    };
    DashBoardComponent.prototype.navigateToJE = function (jeID) {
        var link = ['journalEntry', jeID];
        this._router.navigate(link);
    };
    DashBoardComponent.prototype.onRowClick = function (event) {
        var id = event.id;
        var selectedBill = _.find(this.bills, function (_bill) {
            return _bill.id == id;
        });
        if (selectedBill) {
            var link = ['payments/bill', this.companyId, id, this.tabStates[this.selectedTab]];
            this._router.navigate(link);
        }
        else {
            var selectedBill_3 = _.find(this.credits, function (_bill) {
                return _bill.id == id;
            });
            var link = ['payments/credit', this.companyId, id];
            this._router.navigate(link);
        }
    };
    DashBoardComponent.prototype.handleSelect = function (event) {
        var base = this;
        _.each(event, function (bill) {
            base.selectedRows.push(bill);
            base.allSelectedRows.push(bill);
        });
        this.selectedRows = _.uniqBy(this.selectedRows, 'id');
        _.remove(this.selectedRows, { 'tempIsSelected': false });
        this.allSelectedRows = _.uniqBy(this.allSelectedRows, 'id');
        _.remove(this.allSelectedRows, { 'tempIsSelected': false });
    };
    DashBoardComponent.prototype.payBill = function () {
        var _this = this;
        var transferObj = {
            "billID": this.hoveredBill.id,
            "billName": this.hoveredBill.name,
            "amount": this.hoveredBill.amount,
            "currency": "USD",
            "notes": "",
            "remarks": "",
            "destinationID": this.hoveredBill.vendorID,
            "destinationType": "vendor"
            //"fundingSource": fundingSource['_links']['self']['href']
        };
        this._oAuthService.fundTransfer(transferObj, this.hoveredBill.companyID).subscribe(function (status) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Funds transfer initiated successfully");
            _this.showPaymentsTab();
        }, function (error) {
            console.log("error", error);
            if (error) {
                var err = JSON.parse(error).message;
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, err);
            }
        });
    };
    DashBoardComponent.prototype.showPaymentsTab = function () {
        var link = ['payments/dashboard', 'approve'];
        this._router.navigate(link);
    };
    /*getFundingSource(paymentType?) {
     let fundingSource;
     this._oAuthService.fundingSources(this.hoveredBill.companyID).subscribe(fundingSourcesObj  => {
     if(fundingSourcesObj['_embedded']) {
     let fundingSources=fundingSourcesObj['_embedded']['funding-sources'];
  
     _.remove(fundingSources, function(source) {
     return source['type'] == 'balance';
     })
     fundingSource = fundingSources[0];
     if(paymentType && paymentType == 'makeFuturePayment') {
     this.makeFuturePayment(fundingSource);
     } else {
     this.payBill();
     //this.payBill(fundingSource);
     }
     return fundingSource;
     }
     }, error =>  {
  
     });
     return null;
     }*/
    DashBoardComponent.prototype.makeFuturePayment = function (bill) {
        var _this = this;
        var transferObj = {
            "billID": this.hoveredBill.id,
            "billName": this.hoveredBill.name,
            "amount": bill.payAmount,
            "currency": "USD",
        };
        var paymentsObj = {};
        paymentsObj.notes = "",
            paymentsObj.remarks = "",
            paymentsObj.destinationID = this.hoveredBill.vendorID,
            paymentsObj.destinationType = "vendor",
            paymentsObj.scheduledDate = this.futureDate,
            paymentsObj.billNumber = this.hoveredBill.billID,
            paymentsObj.bankAccountID = this.selectedBankAccount;
        paymentsObj.payments = [transferObj];
        this._oAuthService.multiPay(paymentsObj, this.hoveredBill.companyID).subscribe(function (status) {
            _this.loadingService.triggerLoadingEvent(false);
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Funds transfer initiated successfully");
            _this.resetSchedulePayFields();
            _this.showPaymentsTab();
        }, function (error) {
            _this.resetSchedulePayFields();
            _this.loadingService.triggerLoadingEvent(false);
            if (error) {
                var err = JSON.parse(error).message;
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, err);
            }
            console.log("error", error);
        });
    };
    DashBoardComponent.prototype.setFutureDate = function (date) {
        var base = this;
        setTimeout(function () {
            base.futureDate = date;
        });
    };
    DashBoardComponent.prototype.hideBillPreview = function () {
        this.hoveredBill = null;
        this.showPreview = false;
    };
    DashBoardComponent.prototype.getPaymentMethod = function (label) {
        if (label)
            return payments_constants_1.PAYMENTMETHOD[label];
    };
    DashBoardComponent.prototype.ngOnDestroy = function () {
        jQuery('#dashboard-pay-later-dropdown').remove();
        this.routeSub.unsubscribe();
        this.confirmSubscription.unsubscribe();
        jQuery('.bill-modal-container').remove();
        jQuery("#bill-password-conformation").remove();
        this.routeSubscribe.unsubscribe();
    };
    DashBoardComponent.prototype.goToTools = function (val) {
        if (val == 'workflow') {
            var link = ['payments/workflow'];
            this._router.navigate(link);
        }
        else if (val == 'expenseCode') {
            var link = ['/expensecode'];
            this._router.navigate(link);
        }
        else if (val == 'payments') {
            var link = ['/payments'];
            this._router.navigate(link);
        }
    };
    DashBoardComponent.prototype.validatePaySelected = function () {
        this.userAction = 'multipay';
        this.checkLockDate();
    };
    DashBoardComponent.prototype.paySelected = function () {
        var base = this;
        var creditIndexes = [];
        var selectedCredits = [];
        var currentDate = moment(new Date()).format("YYYY-MM-DD");
        var defaultCompanyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.selectedRows = _.cloneDeep(this.allSelectedRows);
        this.selectedRows.forEach(function (bill, index) {
            var currencyConversionOBJ = {
                toCurrency: defaultCompanyCurrency,
                date: currentDate
            };
            var billFound = _.find(base.bills, function (_bill) {
                return _bill.id == bill.id;
            });
            if (billFound) {
                bill.amountPaid = billFound.amountPaid ? billFound.amountPaid : 0;
                bill.payAmount = (billFound.amount - bill.amountPaid) ? (billFound.amount - bill.amountPaid).toFixed(2) : 0;
                bill.unpaidAmount = billFound.amount - bill.amountPaid;
                bill.id = billFound.id;
                bill.billNumber = billFound.billNumber;
                bill.currency = billFound.currency;
                bill.vendorPaymentMethod = billFound.vendorPaymentMethod;
                currencyConversionOBJ.id = billFound.id;
                currencyConversionOBJ.fromCurrency = billFound.currency;
                currencyConversionOBJ.amount = billFound.amount;
                base.currencyConversionList.push(currencyConversionOBJ);
            }
            else {
                creditIndexes.push(index);
                var creditFound = _.find(base.credits, function (_bill) {
                    return _bill.id == bill.id;
                });
                if (creditFound) {
                    currencyConversionOBJ.id = creditFound.id;
                    currencyConversionOBJ.fromCurrency = creditFound.currency;
                    currencyConversionOBJ.amount = creditFound.totalAmount;
                    base.currencyConversionList.push(currencyConversionOBJ);
                    selectedCredits.push(creditFound);
                }
            }
        });
        creditIndexes.forEach(function (idx, index) {
            base.selectedRows.splice(idx - index, 1);
        });
        var billVendorNames = [];
        var creditsVendorNames = [];
        if (base.selectedRows.length > 0) {
            billVendorNames = _.map(this.selectedRows, 'vendorName');
            creditsVendorNames = _.map(selectedCredits, 'vendorName');
            if (!_.isEmpty(billVendorNames) && !_.isEmpty(creditsVendorNames)) {
                if (_.uniq(billVendorNames).length == 1 && _.uniq(creditsVendorNames).length == 1 && _.isEqual(billVendorNames[0], creditsVendorNames[0])) {
                    this.navigateTOMultiPay(selectedCredits);
                }
                else {
                    this._toastService.pop(Qount_constants_1.TOAST_TYPE.warning, "Please select same vendors bills and credits");
                }
            }
            else if (creditsVendorNames.length == 0 && !_.isEmpty(billVendorNames) && _.uniq(billVendorNames).length == 1) {
                this.navigateTOMultiPay(selectedCredits);
            }
            else {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.warning, "Please select same vendors bills or credits");
            }
        }
        else {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.warning, "Please select atleast one bill");
        }
    };
    DashBoardComponent.prototype.navigateTOMultiPay = function (selectedCredits) {
        var _this = this;
        var base = this;
        var foreignCurrency = false;
        this.billsService.convertCurrency(this.currencyConversionList)
            .subscribe(function (conversionData) {
            base.selectedRows.forEach(function (bill, index) {
                var billFound = _.find(conversionData, function (_bill) {
                    return _bill.id == bill.id;
                });
                if (billFound) {
                    if (bill.currency != Session_1.Session.getCurrentCompanyCurrency()) {
                        foreignCurrency = true;
                        bill.amountPaid = bill.amountPaid ? bill.amountPaid : 0;
                        bill.payAmount = (billFound.convertedAmount - bill.amountPaid) ? (billFound.convertedAmount - bill.amountPaid).toFixed(2) : 0;
                        bill.unpaidAmount = billFound.convertedAmount - bill.amountPaid;
                        bill.conversionRate = billFound.conversionRate;
                    }
                }
            });
            selectedCredits.forEach(function (credit, index) {
                var creditFound = _.find(conversionData, function (_credit) {
                    return _credit.id == credit.id;
                });
                if (creditFound) {
                    if (credit.currency != Session_1.Session.getCurrentCompanyCurrency()) {
                        credit.totalAmount = creditFound.convertedAmount;
                    }
                }
            });
            Session_1.Session.put("selectedBills", _this.selectedRows);
            Session_1.Session.put("selectedCredits", selectedCredits);
            Session_1.Session.put("hasForeignCurrency", foreignCurrency);
            var link = ['payments/multipay', _this.companyId];
            base._router.navigate(link);
        }, function (error) { return _this.handleError(error); });
    };
    DashBoardComponent.prototype.onBankSelect = function (bankAccount) {
        if (bankAccount)
            this.selectedBankAccount = bankAccount.id;
    };
    DashBoardComponent.prototype.checkValidation = function () {
        if (this.futureDate && this.selectedBankAccount)
            return true;
        else
            return false;
    };
    DashBoardComponent.prototype.closeSchedulePay = function () {
        jQuery('#dashboard-pay-later-dropdown').foundation('close');
        this.resetSchedulePayFields();
    };
    DashBoardComponent.prototype.resetSchedulePayFields = function () {
        this.futureDate = null;
        this.selectedBankAccount = '';
    };
    DashBoardComponent.prototype.calculateSchedulePayAmount = function () {
        var _this = this;
        var bill = this.hoveredBill;
        if (bill.currency != Session_1.Session.getCurrentCompanyCurrency()) {
            var currencyConversionOBJ = {
                toCurrency: Session_1.Session.getCurrentCompanyCurrency(),
                date: moment(new Date()).format("YYYY-MM-DD")
            };
            currencyConversionOBJ.id = bill.id;
            currencyConversionOBJ.fromCurrency = bill.currency;
            currencyConversionOBJ.amount = bill.amount;
            var bills = [currencyConversionOBJ];
            this.billsService.convertCurrency(bills)
                .subscribe(function (conversionData) {
                var billFound = conversionData[0];
                bill.amountPaid = bill.amountPaid ? bill.amountPaid : 0;
                bill.payAmount = (billFound.convertedAmount - bill.amountPaid) ? (billFound.convertedAmount - bill.amountPaid).toFixed(2) : 0;
                bill.unpaidAmount = billFound.convertedAmount - bill.amountPaid;
                _this.makeFuturePayment(bill);
            }, function (error) {
                _this.resetSchedulePayFields();
                _this.handleError(error);
            });
        }
        else {
            bill.amountPaid = bill.amountPaid ? bill.amountPaid : 0;
            bill.payAmount = (bill.amount - bill.amountPaid) ? (bill.amount - bill.amountPaid).toFixed(2) : 0;
            bill.unpaidAmount = bill.amount - bill.amountPaid;
            this.makeFuturePayment(bill);
        }
    };
    DashBoardComponent.prototype.navigateToPay = function () {
        var base = this;
        this.hoveredBill = _.find(this.bills, function (_bill) {
            return _bill.id == base.tempData.id;
        });
        if (this.hoveredBill) {
            var billAmount = this.hoveredBill.amount ? this.hoveredBill.amount : 0;
            var currency = this.hoveredBill.currency ? this.hoveredBill.currency : 'USD';
            this.hoveredBill.billAmount = billAmount.toLocaleString(this.localeFortmat, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
            this.selectedRows.push(this.hoveredBill);
            this.allSelectedRows.push(this.hoveredBill);
            this.paySelected();
        }
    };
    DashBoardComponent.prototype.checkLockDate = function () {
        if (moment(Session_1.Session.getLockDate(), "MM/DD/YYYY").valueOf() > moment().valueOf()) {
            jQuery('#bill-password-conformation').foundation('open');
        }
        else {
            this.navigateToDetails();
        }
    };
    DashBoardComponent.prototype.validateLockKey = function () {
        var _this = this;
        var data = {
            "key": this.key
        };
        this.companyService.validateLockKey(Session_1.Session.getCurrentCompany(), data).subscribe(function (res) {
            _this.validateLockDate = res.validation;
            if (res.validation) {
                _this.closePasswordConfirmation();
                _this.navigateToDetails();
            }
            else {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invalid key");
            }
        }, function (fail) {
        });
    };
    DashBoardComponent.prototype.closePasswordConfirmation = function () {
        this.resetPasswordConformation();
        jQuery('#bill-password-conformation').foundation('close');
    };
    DashBoardComponent.prototype.checkValidation = function () {
        if (this.key)
            return true;
        else
            return false;
    };
    DashBoardComponent.prototype.navigateToDetails = function () {
        if (this.userAction == 'delete') {
            this.removeBill(this.tempData);
        }
        else if (this.userAction == 'pay') {
            this.navigateToPay();
        }
        else if (this.userAction == 'multipay') {
            this.paySelected();
        }
    };
    DashBoardComponent.prototype.resetPasswordConformation = function () {
        this.key = null;
    };
    /*dashboard code*/
    DashBoardComponent.prototype.removeCurrency = function (values) {
        var _values = [];
        var base = this;
        values.forEach(function (value) {
            _values.push(base.numeralService.value(value));
        });
        return _values;
    };
    DashBoardComponent.prototype.payableclick = function (payableclick) {
        var link = ['bills', payableclick];
        this._router.navigate(link);
    };
    DashBoardComponent.prototype.paidclick = function (payableclick) {
        var link = ['paid', payableclick];
        this._router.navigate(link);
    };
    DashBoardComponent.prototype.hideFlyout = function () {
        this.showCharts = !this.showCharts;
    };
    DashBoardComponent.prototype.showOtherCharts = function (type) {
        if (type == 'stackedbar') {
            this.detailedReportChartOptions = this.reportChartOptionsStackedlegend;
        }
        else if (type == 'pie') {
            this.detailedReportChartOptions = this.reportChartOptionspielegend;
        }
        else if (type == "bar") {
            this.detailedReportChartOptions = this.reportChartOptions;
        }
        this.showCharts = !this.showCharts;
        this.generateChart();
    };
    DashBoardComponent.prototype.generateChart = function () {
        var _this = this;
        this.todaysDate = moment(new Date()).format(this.dateFormat);
        this.ttt = {
            "type": "aging",
            "companyID": this.companyId,
            "companyCurrency": "USD",
            "period": "Today",
            "asOfDate": this.todaysDate,
            "daysPerAgingPeriod": "30",
            "numberOfPeriods": "3"
        };
        this.reportService.generateReport(this.ttt).subscribe(function (report) {
            _this.isLoading = false;
            if (report) {
                _this.showChartExpansion = true;
                var _report = _.cloneDeep(report);
                var columns = _report.columns || [];
                columns.splice(_report.columns.length - 1, 1);
                var keys = Object.keys(_report.data);
                var serieskkk = [];
                var seriesttt = [];
                var series = [];
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    if (key != 'TOTAL') {
                        var vendor = _report.data[key];
                        var vendorId = vendor['VendorID'];
                        var q = _report.data[key];
                        var values = q.TOTAL;
                        var rtrtr = _this.numeralService.value(values);
                        serieskkk.push({
                            name: vendorId,
                            y: rtrtr
                        });
                    }
                }
                var sliced = serieskkk[0];
                sliced['sliced'] = true;
                sliced['selected'] = true;
                for (var _a = 0, keys_2 = keys; _a < keys_2.length; _a++) {
                    var key = keys_2[_a];
                    if (key == 'TOTAL') {
                        var vendor = _report.data[key];
                        var vendorId = vendor['VendorID'];
                        delete vendor['TOTAL'];
                        delete vendor['VendorID'];
                        var values = Object.values(vendor);
                        var v = Object.keys(vendor);
                        values = _this.removeCurrency(values);
                        /*let current = values.pop();
                        values.splice(0, 0, current);*/
                        for (var i = 0; i < values.length; i++) {
                            seriesttt.push({
                                name: v[i],
                                y: values[i]
                            });
                        }
                    }
                }
                for (var _b = 0, keys_3 = keys; _b < keys_3.length; _b++) {
                    var key = keys_3[_b];
                    if (key != 'TOTAL') {
                        var vendor = _report.data[key];
                        var vendorId = vendor['VendorID'];
                        delete vendor['TOTAL'];
                        delete vendor['VendorID'];
                        delete vendor['type'];
                        var values = Object.values(vendor);
                        values = _this.removeCurrency(values);
                        /*let current = values.pop();
                        values.splice(0, 0, current);*/
                        series.push({
                            name: vendorId,
                            data: values
                        });
                    }
                }
                Highcharts.setOptions({
                    lang: {
                        thousandsSep: ','
                    },
                    colors: _this.chartColors
                });
                _this.reportChartOptionsStackedlegend = {
                    chart: {
                        type: 'bar',
                        marginRight: 50,
                        style: {
                            fontFamily: 'NiveauGroteskRegular'
                        }
                    },
                    title: {
                        text: 'Aging By Vendor',
                        align: 'left',
                        style: {
                            color: '#878787',
                            fontFamily: 'NiveauGroteskLight',
                            fontSize: '24'
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        categories: columns
                    },
                    tooltip: {
                        headerFormat: '<b>{point.x}</b><br/>',
                        pointFormat: '<span style="color:{series.color}">{series.name}: ${point.y:,.2f}</span><br/>',
                        shared: true
                    },
                    yAxis: {
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        min: 0,
                        title: {
                            text: 'Payable Amount',
                            style: {
                                fontSize: '15px'
                            }
                        },
                        stackLabels: {
                            enabled: true,
                            formatter: function () {
                                return '$' + Highcharts.numberFormat(this.total, 2);
                            },
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                                // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                            }
                        },
                        labels: {
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    },
                    legend: {
                        enabled: true
                    },
                    plotOptions: {
                        enabled: true,
                        series: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: false,
                                format: '${y}',
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787',
                                style: {
                                    fontSize: '13px'
                                },
                            }
                        },
                    },
                    series: series
                };
                _this.reportChartOptionsStacked = {
                    chart: {
                        type: 'bar',
                        marginRight: 50,
                        style: {
                            fontFamily: 'NiveauGroteskRegular'
                        }
                    },
                    title: {
                        text: 'Aging By Vendor',
                        align: 'left',
                        style: {
                            color: '#878787',
                            fontFamily: 'NiveauGroteskLight',
                            fontSize: '24'
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        categories: columns
                    },
                    tooltip: {
                        headerFormat: '<b>{point.x}</b><br/>',
                        pointFormat: '<span style="color:{series.color}">{series.name}: ${point.y:,.2f}</span><br/>',
                        shared: true
                    },
                    yAxis: {
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        min: 0,
                        title: {
                            text: 'Payable Amount',
                            style: {
                                fontSize: '15px'
                            }
                        },
                        stackLabels: {
                            enabled: true,
                            formatter: function () {
                                return '$' + Highcharts.numberFormat(this.total, 2);
                            },
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                                // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                            }
                        },
                        labels: {
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        enabled: true,
                        series: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: false,
                                format: '${y}',
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787',
                                style: {
                                    fontSize: '13px'
                                },
                            }
                        },
                    },
                    series: series
                };
                _this.reportChartOptionspielegend = {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie',
                        style: {
                            fontFamily: 'NiveauGroteskRegular'
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: 'Total Payables by Vendor',
                        align: 'left',
                        style: {
                            color: '#878787',
                            fontFamily: 'NiveauGroteskLight',
                            fontSize: '24'
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    series: [{
                            colorByPoint: true,
                            data: serieskkk
                        }],
                };
                _this.reportChartOptionspie = {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie',
                        style: {
                            fontFamily: 'NiveauGroteskRegular'
                        }
                    },
                    title: {
                        text: 'Total Payables by Vendor',
                        align: 'left',
                        style: {
                            color: '#878787',
                            fontFamily: 'NiveauGroteskLight',
                            fontSize: '24'
                        }
                    },
                    tooltip: {
                        pointFormat: 'TOTAL: <b>${point.y:,.2f}</b> <br/>{point.percentage:,.2f}%',
                    },
                    credits: {
                        enabled: false
                    },
                    pie: {
                        dataLabels: {
                            enabled: true,
                            inside: true,
                            formatter: function () {
                                return this.y;
                            },
                            distance: -40,
                            color: 'white'
                        },
                        showInLegend: true
                    },
                    series: [{
                            colorByPoint: true,
                            data: serieskkk
                        }],
                };
                _this.reportChartOptions = {
                    chart: {
                        type: 'column',
                        style: {
                            fontFamily: 'NiveauGroteskRegular'
                        }
                    },
                    title: {
                        text: 'AP Aging Summary',
                        align: 'left',
                        style: {
                            color: '#878787',
                            fontFamily: 'NiveauGroteskLight',
                            fontSize: '24'
                        }
                    },
                    subtitle: {},
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'category',
                        labels: {
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Total Amount',
                            style: {
                                fontSize: '15px'
                            }
                        },
                        labels: {
                            style: {
                                fontSize: '13px'
                            }
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            borderWidth: 0,
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    return '$' + Highcharts.numberFormat(this.y, 2);
                                },
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787',
                                style: {
                                    fontSize: '13px'
                                }
                            }
                        }
                    },
                    tooltip: {
                        pointFormat: '<span style="color:{point.color};font-size: 13px">TOTAL</span>: <b>${point.y:,.2f}</b><br/>',
                    },
                    series: [{
                            colorByPoint: true,
                            data: seriesttt
                        }],
                };
                _this.reportasas = true;
            }
        }, function (fail) {
            _this.isLoading = false;
        });
    };
    DashBoardComponent.prototype.buildTableData = function (tablelist) {
        this.hasItemCodes = false;
        this.tablelist = tablelist;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "bill_date", "title": "Bill Date" },
            { "name": "vendor_name", "title": "Vendor Name" },
            { "name": "current_state", "title": "Current State" },
            { "name": "due_date", "title": "Due Date" },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } },
            { "name": "daysToPay", "title": "Days to Pay" }
        ];
        var base = this;
        tablelist.forEach(function (expense) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                if (key == 'amount') {
                    var amount = parseFloat(expense[key]);
                    row[key] = amount.toFixed(2); // just to support regular number with .00
                }
                else {
                    row[key] = expense[key];
                }
                var currentDate = moment(new Date()).format("YYYY-MM-DD");
                var daysToPay = moment(expense['due_date'], "MM/DD/YYYY").diff(currentDate, 'days');
                if (daysToPay <= 0) {
                    daysToPay = '<span color="red" style="color: red">' + daysToPay + '</span>';
                }
                row['daysToPay'] = daysToPay;
                // row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function () {
            base.hasItemCodes = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
        base.detailedChartIcons = 'notApply';
    };
    ;
    return DashBoardComponent;
}());
__decorate([
    core_1.ViewChild('hChart1'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], DashBoardComponent.prototype, "hChart1", void 0);
__decorate([
    core_1.ViewChild('hChart2'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], DashBoardComponent.prototype, "hChart2", void 0);
__decorate([
    core_1.ViewChild('hChart3'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], DashBoardComponent.prototype, "hChart3", void 0);
__decorate([
    core_1.ViewChild('hChart4'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], DashBoardComponent.prototype, "hChart4", void 0);
__decorate([
    core_1.ViewChild('createtaxes'),
    __metadata("design:type", Object)
], DashBoardComponent.prototype, "createtaxes", void 0);
__decorate([
    core_1.HostListener('window:resize', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashBoardComponent.prototype, "onResize", null);
DashBoardComponent = __decorate([
    core_1.Component({
        selector: 'dashboard',
        templateUrl: '/app/views/dashBoard.html'
    }),
    __metadata("design:paramtypes", [Bills_service_1.BillsService, Box_service_1.BoxService, DocHub_service_1.DocHubService, platform_browser_1.DomSanitizer,
        router_1.Router, router_1.ActivatedRoute, OAuthService_1.OAuthService, Toast_service_1.ToastService, Companies_service_1.CompaniesService,
        SwitchBoard_1.SwitchBoard, ExpenseCodes_service_1.ExpensesService, LoadingService_1.LoadingService,
        Payments_service_1.PaymentsService, Numeral_service_1.NumeralService, StateService_1.StateService, DateFormatter_service_1.DateFormater, Reports_service_1.ReportService, PageTitle_1.pageTitleService])
], DashBoardComponent);
exports.DashBoardComponent = DashBoardComponent;
