/**
 * Created by seshu on 26-02-2016.
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
var router_1 = require("@angular/router");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var JournalEntries_service_1 = require("qCommon/app/services/JournalEntries.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Expense_service_1 = require("qCommon/app/services/Expense.service");
var Deposit_service_1 = require("qCommon/app/services/Deposit.service");
var FinancialAccounts_service_1 = require("qCommon/app/services/FinancialAccounts.service");
var Badge_service_1 = require("qCommon/app/services/Badge.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Reconsile_service_1 = require("../services/Reconsile.service");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var StateService_1 = require("qCommon/app/services/StateService");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var State_1 = require("qCommon/app/models/State");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var Rx_1 = require("rxjs/Rx");
var BooksComponent = (function () {
    function BooksComponent(_router, _route, journalService, toastService, switchBoard, loadingService, companiesService, expenseService, accountsService, depositService, badgesService, reconcileService, dateFormater, numeralService, stateService, titleService, reportsService) {
        var _this = this;
        this._router = _router;
        this._route = _route;
        this.journalService = journalService;
        this.toastService = toastService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.companiesService = companiesService;
        this.expenseService = expenseService;
        this.accountsService = accountsService;
        this.depositService = depositService;
        this.badgesService = badgesService;
        this.reconcileService = reconcileService;
        this.dateFormater = dateFormater;
        this.numeralService = numeralService;
        this.stateService = stateService;
        this.titleService = titleService;
        this.reportsService = reportsService;
        this.tabBackground = "#d45945";
        this.selectedTabColor = "#d45945";
        this.tabDisplay = [{ 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }];
        this.bgColors = [
            '#d45945',
            '#d47e47',
            '#2980b9',
            '#3dc36f'
        ];
        this.uncategorizedEntries = 0;
        this.depositsTableData = {};
        this.depositsTableOptions = { search: true, pageSize: 7 };
        this.expensesTableData = {};
        this.expensesTableOptions = { search: true, pageSize: 7 };
        this.jeTableData = {};
        this.jeTableOptions = { search: true, pageSize: 7 };
        this.badges = [];
        this.selectedTab = 'deposits';
        this.isLoading = true;
        this.localBadges = {};
        this.hideBoxes = true;
        this.selectedColor = 'red-tab';
        this.hasJournalEntries = false;
        this.hasExpenses = false;
        this.hasDeposits = false;
        this.localeFortmat = 'en-US';
        this.validateLockDate = false;
        this.categoryData = Qount_constants_1.JE_CATEGORIES;
        this.hasBoxData = false;
        this.reportRequest = {};
        this.hasOpexData = false;
        this.opexChartOptions = {};
        this.groupedOpexDataOptions = {};
        this.hasCashBurnData = false;
        this.showDetailedChart = false;
        this.hasProfitTrendData = false;
        this.cashBurnDataOptions = {};
        this.profitTrendDataOptions = {};
        this.detailedReportChartOptions = {};
        this.metrics = {};
        this.routeSubscribe = {};
        this.chartColors = ['#44B6E8', '#18457B', '#00B1A9', '#F06459', '#22B473', '#384986', '#4554A4', '#808CC5'];
        this.currentCompanyId = Session_1.Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.stateService.clearAllStates();
        var today = moment();
        var fiscalStartDate = moment(Session_1.Session.getFiscalStartDate(), 'MM/DD/YYYY');
        this.currentFiscalStart = moment([today.get('year'), fiscalStartDate.get('month'), 1]);
        if (today < fiscalStartDate) {
            this.currentFiscalStart = moment([today.get('year') - 1, fiscalStartDate.get('month'), 1]);
        }
        this.currentFiscalStart = this.currentFiscalStart.format('MM/DD/YYYY');
        this.asOfDate = moment().format('MM/DD/YYYY');
        this.reportRequest = {
            "basis": "accrual",
            "companyID": this.currentCompanyId,
            "companyCurrency": this.companyCurrency,
            "asOfDate": this.asOfDate,
            "startDate": this.currentFiscalStart
        };
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) {
            switch (_this.selectedTab) {
                case 1:
                    _this.removeDepo(toast);
                    break;
                case 2:
                    _this.removeExp(toast);
                    break;
                case 3:
                    _this.removeJournal(toast);
                    break;
                default:
                    _this.removeDepo(toast);
                    break;
            }
        });
        this.routeSub = this._route.params.subscribe(function (params) {
            if (params['tabId'] == 'dashboard') {
                _this.selectTab(0, "");
            }
            else if (params['tabId'] == 'deposits') {
                _this.selectTab(1, "");
                _this.hasDeposits = false;
            }
            else if (params['tabId'] == 'expenses') {
                _this.selectTab(2, "");
                _this.hasExpenses = false;
            }
            else if (params['tabId'] == 'journalEntries') {
                _this.selectTab(3, "");
                _this.hasJournalEntries = false;
            }
            else {
                console.log("error");
            }
        });
        this.localBadges = JSON.parse(sessionStorage.getItem("localBooksBadges"));
        if (!this.localBadges) {
            this.localBadges = { 'deposits': 0, 'expenses': 0, 'journalEntries': 0 };
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }
        else {
            this.localBadges = JSON.parse(sessionStorage.getItem("localBooksBadges"));
        }
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showDetailedChart) {
                _this.showDetailedChart = !_this.showDetailedChart;
            }
        });
        this.getBookBadges();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
    }
    BooksComponent.prototype.addBookState = function () {
        this.stateService.addState(new State_1.State('BOOKS', this._router.url, null, null));
    };
    BooksComponent.prototype.getBookBadges = function () {
        var _this = this;
        this.badgesService.getBooksBadgeCount(this.currentCompanyId).subscribe(function (badges) {
            var journalCount = badges.journals;
            var depositCount = badges.deposits;
            var expenseCount = badges.expenses;
            _this.uncategorizedEntries = badges.total_uncategorized;
            _this.localBadges = { 'deposits': depositCount, 'expenses': expenseCount, 'journalEntries': journalCount };
            sessionStorage.setItem('localBooksBadges', JSON.stringify(_this.localBadges));
        }, function (error) { return _this.handleError(error); });
        this.reconcileService.getUnreconciledCount().subscribe(function (response) {
            _this.unreconciledCount = response.unreconciled_count;
        }, function (error) { return _this.handleError(error); });
    };
    BooksComponent.prototype.showCategorizationScreen = function () {
        var link = ['categorization'];
        this.addBookState();
        this._router.navigate(link);
    };
    BooksComponent.prototype.showReconsileScreen = function () {
        var link = ['reconcilation'];
        this.addBookState();
        this._router.navigate(link);
    };
    BooksComponent.prototype.animateBoxInfo = function (boxInfo) {
        this.animateValue('payables', boxInfo.payables);
        this.animateValue('pastDue', boxInfo.pastDue);
        this.animateValue('dueToday', boxInfo.dueToday);
        this.animateValue('dueThisWeek', boxInfo.dueThisWeek);
    };
    BooksComponent.prototype.animateValue = function (param, value) {
        var base = this;
        jQuery({ val: value / 2 }).stop(true).animate({ val: value }, {
            duration: 2000,
            easing: "easeOutExpo",
            step: function () {
                var _val = this.val;
                base.boxInfo[param] = Number(_val.toFixed(2));
            }
        }).promise().done(function () {
            base.boxInfo[param] = value;
        });
    };
    BooksComponent.prototype.fetchExpenses = function () {
        var _this = this;
        this.accountsService.financialAccounts(this.currentCompanyId)
            .subscribe(function (accounts) {
            _this.accounts = accounts.accounts;
            _this.expenseService.expenses(_this.currentCompanyId)
                .subscribe(function (expenses) {
                _this.buildExpenseTableData(expenses.expenses);
            }, function (error) { return _this.handleError(error); });
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    BooksComponent.prototype.fetchDeposits = function () {
        var _this = this;
        this.accountsService.financialAccounts(this.currentCompanyId)
            .subscribe(function (accounts) {
            _this.accounts = accounts.accounts;
            _this.depositService.deposits(_this.currentCompanyId)
                .subscribe(function (deposits) {
                _this.buildDepositTableData(deposits.deposits);
            }, function (error) { return _this.handleError(error); });
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    BooksComponent.prototype.selectTab = function (tabNo, color) {
        this.selectedTab = tabNo;
        this.selectedColor = color;
        var base = this;
        this.tabDisplay.forEach(function (tab, index) {
            base.tabDisplay[index] = { 'display': 'none' };
        });
        this.tabDisplay[tabNo] = { 'display': 'block' };
        this.tabBackground = this.bgColors[tabNo];
        this.loadingService.triggerLoadingEvent(true);
        this.hasBoxData = false;
        if (this.selectedTab == 0) {
            this.getDashboardData();
            this.titleService.setPageTitle("BOOKS DASHBOARD");
        }
        else if (this.selectedTab == 1) {
            this.isLoading = true;
            this.fetchDeposits();
            this.titleService.setPageTitle("DEPOSITS");
        }
        else if (this.selectedTab == 2) {
            this.isLoading = true;
            this.fetchExpenses();
            this.titleService.setPageTitle("EXPENSES");
        }
        else if (this.selectedTab == 3) {
            this.isLoading = true;
            this.fetchJournalEntries();
            this.titleService.setPageTitle("JOURNAL ENTRIES");
        }
    };
    BooksComponent.prototype.fetchJournalEntries = function () {
        var _this = this;
        this.journalService.journalEntries(this.currentCompanyId)
            .subscribe(function (journalEntries) {
            _this.buildTableData(journalEntries);
        }, function (error) { return _this.handleError(error); });
    };
    BooksComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.addBookState();
            this.showJournalEntry($event);
        }
        else if (action == 'reverse') {
            this.addBookState();
            this.showReverseBill($event);
        }
        else if (action == 'delete') {
            this.removeJournalEntry($event);
        }
        else if (action == 'Navigation') {
            this.addBookState();
            if ($event.sourceID && $event.sourceType == 'bill' && $event.source == 'accountsPayable') {
                var link = ['payments/bill', Session_1.Session.getCurrentCompany(), $event.sourceID, 'enter'];
                this._router.navigate(link);
            }
            else if ($event.sourceID && $event.sourceType == 'credit') {
                var link = ['payments/credit', Session_1.Session.getCurrentCompany(), $event.sourceID];
                this._router.navigate(link);
            }
            else if ($event.sourceID && $event.sourceType == 'deposit' && $event.source == 'inflow') {
                var link = ['/deposit', $event.sourceID];
                this._router.navigate(link);
            }
            else if ($event.sourceID && $event.sourceType == 'expense' && $event.source == 'outflow') {
                var link = ['/expense', $event.sourceID];
                this._router.navigate(link);
            }
            else if ($event.sourceID && $event.sourceType == 'payment' && $event.source == 'accountsPayable') {
                var link = ['/payments', $event.sourceID];
                this._router.navigate(link);
            }
        }
    };
    BooksComponent.prototype.showReverseBill = function (journalEntry) {
        var link = ['journalEntry', journalEntry.id, 'reverse'];
        this._router.navigate(link);
    };
    BooksComponent.prototype.removeJournalEntry = function (row) {
        this.journalToDelete = row.id;
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    BooksComponent.prototype.removeJournal = function (toast) {
        var _this = this;
        var base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.journalService.removeJournalEntry(this.journalToDelete, this.currentCompanyId)
            .subscribe(function (response) {
            _this.loadingService.triggerLoadingEvent(false);
            base.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Deleted Journal Entry successfully");
            _this.hasJournalEntries = false;
            _this.selectTab(3, "");
            _this.getBookBadges();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to delete Journal Entry");
        });
    };
    BooksComponent.prototype.showJournalEntry = function (journalEntry) {
        var link = ['journalEntry', journalEntry.id];
        this._router.navigate(link);
    };
    BooksComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform action.");
    };
    BooksComponent.prototype.handleBadges = function (length, selectedTab) {
        if (selectedTab == 0) {
            this.badges.deposits = length;
            this.localBadges[0] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }
        else if (selectedTab == 1) {
            this.badges.expenses = length;
            this.localBadges[1] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }
        else if (selectedTab == 2) {
            this.badges.journalEntries = length;
            this.localBadges[2] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }
    };
    BooksComponent.prototype.getBankAccountName = function (accountId) {
        var account = _.find(this.accounts, { 'id': accountId });
        return account ? account.name : "";
    };
    BooksComponent.prototype.buildExpenseTableData = function (data) {
        var base = this;
        this.expensesTableData.search = true;
        this.handleBadges(data.length, 1);
        this.expensesTableData.columns = [
            { "name": "title", "title": "Title" },
            { "name": "due_date", "title": "Expense Date", "type": "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "bank_account_id", "title": "Bank Account" },
            { "name": "id", "title": "id", 'visible': false, 'filterable': false },
            { "name": "journal_id", "title": "Journal ID", 'visible': false, 'filterable': false },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }, "sortValue": function (value) {
                    return base.numeralService.value(value);
                },
                "classes": "currency-align currency-padding"
            },
            { "name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false }
        ];
        this.expensesTableData.rows = [];
        data.forEach(function (expense) {
            var row = {};
            _.each(Object.keys(expense), function (key) {
                if (key == 'bank_account_id') {
                    row[key] = base.getBankAccountName(expense[key]);
                }
                else if (key == 'amount') {
                    var amount = parseFloat(expense[key]);
                    //row[key] = amount.toFixed(2); // just to support regular number with .00
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value: amount.toFixed(2)
                    };
                }
                else if (key == 'due_date') {
                    row[key] = base.dateFormater.formatDate(expense[key], base.serviceDateformat, base.dateFormat);
                }
                else {
                    row[key] = expense[key];
                }
                /*else if(key == 'is_paid'){
                 if(expense.is_paid || expense.paid_date){
                 row['status']= "<button class='hollow button success'>Paid</button>";
                 } else{
                 row['status']= "<button class='hollow button alert'>Not Paid</button>";
                 }
                 row[key] = expense.is_paid? "PAID": "UNPAID";
                 }*/
            });
            if (expense.journal_id) {
                row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            else {
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.expensesTableData.rows.push(row);
        });
        if (data.length > 0) {
            this.hasExpenses = true;
            this.isLoading = false;
        }
        else {
            this.hasExpenses = false;
            this.isLoading = false;
        }
        /*this.hasExpenses = false;
         setTimeout(function(){
         base.hasExpenses = true;
         });*/
        this.loadingService.triggerLoadingEvent(false);
    };
    BooksComponent.prototype.buildDepositTableData = function (data) {
        var base = this;
        this.handleBadges(data.length, 0);
        this.depositsTableData.search = true;
        this.depositsTableData.columns = [
            { "name": "title", "title": "Title" },
            { "name": "date", "title": "Date", "type": "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "bank_account_id", "title": "Bank Account" },
            { "name": "id", "title": "id", 'visible': false, 'filterable': false },
            { "name": "journal_id", "title": "Journal ID", 'visible': false, 'filterable': false },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }, "sortValue": function (value) {
                    return base.numeralService.value(value);
                },
                "classes": "currency-align currency-padding"
            },
            { "name": "actions", "title": "", "type": "html", "sortable": false, 'filterable': false }
        ];
        this.depositsTableData.rows = [];
        data.forEach(function (expense) {
            var row = {};
            _.each(Object.keys(expense), function (key) {
                if (key == 'bank_account_id') {
                    row[key] = base.getBankAccountName(expense[key]);
                }
                else if (key == 'amount') {
                    var amount = parseFloat(expense[key]);
                    //row[key] = amount.toLocaleString(base.companyCurrency, {currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }) // just to support regular number with .00
                    //row[key] = amount.toFixed(2);
                    row[key] = {
                        'options': {
                            "classes": "currency-align"
                        },
                        value: amount.toFixed(2)
                    };
                }
                else if (key == 'date') {
                    row[key] = base.dateFormater.formatDate(expense[key], base.serviceDateformat, base.dateFormat);
                }
                else {
                    row[key] = expense[key];
                }
            });
            if (expense.journal_id) {
                row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            else {
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.depositsTableData.rows.push(row);
        });
        if (data.length > 0) {
            this.hasDeposits = true;
            this.isLoading = false;
        }
        else {
            this.hasDeposits = false;
            this.isLoading = false;
        }
        /*this.hasDeposits = false;
         setTimeout(function(){
         base.hasDeposits = true;
         });*/
        base.loadingService.triggerLoadingEvent(false);
    };
    BooksComponent.prototype.buildTableData = function (data) {
        var base = this;
        this.handleBadges(data.length, 2);
        this.jeTableData.columns = [
            { "name": "number", "title": "Number" },
            { "name": "date", "title": "Date", "type": "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "type", "title": "Journal Type", "visible": false, 'filterable': false },
            { "name": "categoryValue", "title": "Category" },
            { "name": "sourceValue", "title": "Source" },
            { "name": "source", "title": "Source", 'visible': false, 'filterable': false },
            { "name": "desc", "title": "Description", "visible": false, 'filterable': false },
            { "name": "category", "title": "Category", "visible": false, 'filterable': false },
            { "name": "autoReverse", "title": "Auto Reverse", "visible": false, 'filterable': false },
            { "name": "reversalDate", "title": "Reversal Date", "visible": false, 'filterable': false },
            { "name": "recurring", "title": "Recurring", "visible": false, 'filterable': false },
            { "name": "nextJEDate", "title": "Next JE Date", "visible": false, 'filterable': false },
            { "name": "sourceID", "title": "Bill ID", "visible": false, 'filterable': false },
            { "name": "sourceType", "title": "Type", "visible": false, 'filterable': false },
            { "name": "id", "title": "Jounral ID", "visible": false, 'filterable': false },
            { "name": "recurringFrequency", "title": "Recurring Frequency", "visible": false, 'filterable': false },
            { "name": "reverse", "title": "", "type": "html", 'filterable': false },
            { "name": "actions", "title": "", "type": "html", 'filterable': false }
        ];
        this.jeTableData.rows = [];
        data.forEach(function (journalEntry) {
            var row = {};
            _.each(Object.keys(journalEntry), function (key) {
                if (key == 'source') {
                    row['sourceValue'] = base.getSourceName(journalEntry[key]);
                    row['source'] = journalEntry[key];
                }
                else if (key == 'category') {
                    row['categoryValue'] = base.categoryData[journalEntry[key]];
                }
                else if (key == 'date') {
                    row[key] = base.dateFormater.formatDate(journalEntry[key], base.serviceDateformat, base.dateFormat);
                }
                else {
                    row[key] = journalEntry[key];
                }
            });
            var action = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            if (journalEntry['source'] === 'Manual') {
                action = action + "<a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            if (journalEntry['sourceID'] && journalEntry['source'] === 'accountsPayable') {
                if (journalEntry['sourceType'] === 'payment') {
                    action = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>P</span></a>" + action;
                }
                else {
                    action = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>B</span></a>" + action;
                }
            }
            else if (journalEntry['sourceID'] && journalEntry['source'] === 'outflow') {
                action = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>E</span></a>" + action;
            }
            else if (journalEntry['sourceID'] && journalEntry['source'] === 'inflow') {
                action = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>D</span></a>" + action;
            }
            else if (journalEntry['sourceID'] && journalEntry['sourceType'] === 'credit') {
                action = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>C</span></a>" + action;
            }
            row['actions'] = action;
            if (row['type'] == 'Original' && journalEntry['source'] === 'Manual' && !base.isAlreadyReversed(journalEntry['id']) && journalEntry['sourceID']) {
                row['reverse'] = "<a style='font-size:0.1rem;color:#ffffff;margin:0px 5px 0px 0px;' class='button small action reverseButton' data-action='reverse'>Reverse</a>";
            }
            base.jeTableData.rows.push(row);
        });
        if (data.length > 0) {
            this.hasJournalEntries = true;
            this.isLoading = false;
        }
        else {
            this.hasJournalEntries = false;
            this.isLoading = false;
        }
        this.loadingService.triggerLoadingEvent(false);
    };
    BooksComponent.prototype.isAlreadyReversed = function (journalId) {
        var jeIndex = _.findIndex(this.jeTableData.rows, { 'reversedFrom': journalId });
        if (jeIndex != -1) {
            return true;
        }
        return false;
    };
    BooksComponent.prototype.handleExpenseAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'delete') {
            this.tempData = $event;
            this.navigationType = "expense";
            this.userAction = "delete";
            this.checkLockDate();
        }
        else if (action == 'edit') {
            this.id = $event.id;
            this.navigationType = "expense";
            this.navigateToDetails();
        }
        else if (action == 'navigation') {
            this.addBookState();
            var link = ['journalEntry', $event.journal_id];
            this._router.navigate(link);
        }
    };
    BooksComponent.prototype.handleDepositAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'delete') {
            this.tempData = $event;
            this.navigationType = "deposit";
            this.userAction = "delete";
            this.checkLockDate();
        }
        else if (action == 'edit') {
            this.id = $event.id;
            this.navigationType = "deposit";
            this.userAction = "edit";
            this.navigateToDetails();
        }
        else if (action == 'navigation') {
            this.addBookState();
            var link = ['journalEntry', $event.journal_id];
            this._router.navigate(link);
        }
    };
    BooksComponent.prototype.removeDepo = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.depositService.removeDeposit(this.DepositToDelete, this.currentCompanyId)
            .subscribe(function (response) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Deleted deposit successfully");
            // this.fetchDeposits();
            _this.hasDeposits = false;
            _this.selectTab(1, "");
            _this.getBookBadges();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to delete expense");
        });
    };
    BooksComponent.prototype.removeDeposit = function (row) {
        this.DepositToDelete = row.id;
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    BooksComponent.prototype.removeExpense = function (row) {
        this.ruleToDelete = row.id;
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    BooksComponent.prototype.removeExp = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.expenseService.removeExpense(this.ruleToDelete, this.currentCompanyId)
            .subscribe(function (response) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Deleted expense successfully");
            // this.fetchExpenses();
            _this.hasExpenses = false;
            _this.selectTab(2, "");
            _this.getBookBadges();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to delete expense");
        });
    };
    BooksComponent.prototype.getSourceName = function (source) {
        var result = source;
        switch (source) {
            case 'manual':
                result = 'Manual';
                break;
            case 'payroll':
                result = 'Payroll';
                break;
            case 'accountsPayable':
                result = 'Accounts Payable';
                break;
            case 'accountsReceivable':
                result = 'Accounts Receivable';
                break;
            case 'inventory':
                result = 'Inventory';
                break;
            case 'inflow':
                result = 'Inflow';
                break;
            case 'outflow':
                result = 'Outflow';
                break;
        }
        return result;
    };
    BooksComponent.prototype.ngOnInit = function () {
    };
    BooksComponent.prototype.updateTabHeight = function () {
        var base = this;
        var topOfDiv = jQuery('.tab-content').offset().top;
        topOfDiv = topOfDiv < 150 ? 150 : topOfDiv;
        var bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
        base.tabHeight = (bottomOfVisibleWindow - topOfDiv - 25) + "px";
        jQuery('.tab-content').css('min-height', base.tabHeight);
        base.depositsTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
        base.expensesTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
        base.jeTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
    };
    BooksComponent.prototype.reRoutePage = function (tabId) {
        if (tabId == 0) {
            var link = ['books', 'dashboard'];
            this._router.navigate(link);
            return;
        }
        else if (tabId == 1) {
            var link = ['books', 'deposits'];
            this._router.navigate(link);
            return;
        }
        else if (tabId == 2) {
            var link = ['books', 'expenses'];
            this._router.navigate(link);
            return;
        }
        else {
            var link = ['books', 'journalEntries'];
            this._router.navigate(link);
            return;
        }
    };
    BooksComponent.prototype.ngAfterViewInit = function () {
        var base = this;
        jQuery(document).ready(function () {
            base.updateTabHeight();
        });
    };
    BooksComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
        this.confirmSubscription.unsubscribe();
        jQuery('#password-conformation').remove();
    };
    BooksComponent.prototype.addNewJE = function () {
        var link = ['JournalEntry'];
        this._router.navigate(link);
    };
    BooksComponent.prototype.createNewExpense = function () {
        var link = ['Expense'];
        this._router.navigate(link);
    };
    BooksComponent.prototype.createDeposit = function () {
        var link = ['deposit'];
        this._router.navigate(link);
    };
    BooksComponent.prototype.checkLockDate = function () {
        if (Session_1.Session.getLockDate()) {
            if (moment(Session_1.Session.getLockDate(), "MM/DD/YYYY").valueOf() > moment().valueOf()) {
                jQuery('#password-conformation').foundation('open');
            }
            else {
                this.deleteDeposit();
            }
        }
        else {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please set company lock date");
        }
    };
    BooksComponent.prototype.validateLockKey = function () {
        var _this = this;
        var data = {
            "key": this.key
        };
        this.companiesService.validateLockKey(Session_1.Session.getCurrentCompany(), data).subscribe(function (res) {
            _this.validateLockDate = res.validation;
            if (res.validation) {
                _this.closePasswordConfirmation();
                _this.deleteDeposit();
            }
            else {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invalid key");
            }
        }, function (fail) {
        });
    };
    BooksComponent.prototype.closePasswordConfirmation = function () {
        this.resetPasswordConformation();
        jQuery('#password-conformation').foundation('close');
    };
    BooksComponent.prototype.checkValidation = function () {
        if (this.key)
            return true;
        else
            return false;
    };
    BooksComponent.prototype.navigateToDetails = function () {
        this.addBookState();
        if (this.navigationType === "deposit") {
            var link = ['/deposit', this.id];
            this._router.navigate(link);
        }
        else if (this.navigationType === "expense") {
            var link = ['/expense', this.id];
            this._router.navigate(link);
        }
    };
    BooksComponent.prototype.deleteDeposit = function () {
        if (this.navigationType === "deposit") {
            this.removeDeposit(this.tempData);
        }
        else if (this.navigationType === "expense") {
            this.removeExpense(this.tempData);
        }
    };
    BooksComponent.prototype.resetPasswordConformation = function () {
        this.key = null;
    };
    BooksComponent.prototype.getDashboardData = function () {
        this.getBalanceSheetData();
        this.getOpexChartData();
        this.getCashBurnChartData();
        this.getProfitTrendData();
    };
    BooksComponent.prototype.formatNumber = function (value) {
        return this.numeralService.format("0.00", value);
    };
    BooksComponent.prototype.getBalanceSheetData = function () {
        var _this = this;
        var base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.reportRequest.type = "balanceSheet";
        var balanceSheet = this.reportsService.generateAccountReport(this.reportRequest, this.currentCompanyId);
        this.reportRequest.type = "cashFlowStatement";
        var cashFlowstatement = this.reportsService.generateAccountReport(this.reportRequest, this.currentCompanyId);
        this.reportRequest.type = "incomeStatement";
        var incomeStatement = this.reportsService.generateAccountReport(this.reportRequest, this.currentCompanyId);
        Rx_1.Observable.forkJoin(balanceSheet, cashFlowstatement, incomeStatement).subscribe(function (results) {
            base.hasBoxData = true;
            _this.metrics["currentRatio"] = _this.formatNumber(results[0].metrics.currentRatio || 0);
            _this.metrics["quickRatio"] = _this.formatNumber(results[0].metrics.quickRatio || 0);
            _this.metrics["cashBalance"] = _this.getFormattedAmount(results[1].cashAtEndOfPeriod || 0);
            _this.metrics["gpMargin"] = _this.formatNumber(results[2].margins.grossProfitMargin || 0);
            _this.metrics["npMargin"] = _this.formatNumber(results[2].margins.netProfitMargin || 0);
            _this.metrics["opexValue"] = _this.getFormattedAmount(results[2].expenses.opex.totals.total.value || 0);
            _this.metrics["cogsValue"] = _this.getFormattedAmount(results[2].cogs.cogs.totals.total.value || 0);
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to get box data");
        });
    };
    BooksComponent.prototype.getOpexChartData = function () {
        var _this = this;
        var base = this;
        this.reportRequest.type = "incomeStatement";
        this.reportRequest.metricsType = "opexPie";
        this.reportsService.generateMetricReport(this.reportRequest, this.currentCompanyId).subscribe(function (metricData) {
            _this.hasOpexData = true;
            _this.opexChartOptions = {
                colors: _this.chartColors,
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: true
                },
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
                    text: 'Operational Expenses',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                tooltip: {
                    pointFormatter: function () {
                        return '<b>Total: ' + base.getFormattedAmount(this.y) + '</b><b>(' + base.getFormattedPercentage(this.percentage) + '%)</b>';
                    }
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
                        data: base.getOpexData(metricData.data)
                    }]
            };
            _this.groupedOpexDataOptions = {
                colors: _this.chartColors,
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
                    text: 'Operational Expenses',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                subtitle: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormatter: function () {
                        return '<b>Total: ' + base.getFormattedAmount(this.y) + '</b><b>(' + base.getFormattedPercentage(this.percentage) + '%)</b>';
                    }
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
                        data: base.getOpexData(metricData.groupedData)
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { return _this.handleError(error); });
    };
    BooksComponent.prototype.getOpexData = function (data) {
        var result = [];
        _.each(data, function (obj) {
            result.push({
                "name": obj.displayName,
                "y": obj.value
            });
        });
        return result;
    };
    BooksComponent.prototype.getCashBurnChartData = function () {
        var _this = this;
        var base = this;
        this.reportRequest.type = "cashFlowStatement";
        this.reportRequest.metricsType = "cashBurn";
        this.reportsService.generateMetricReport(this.reportRequest, this.currentCompanyId).subscribe(function (metricData) {
            _this.hasCashBurnData = true;
            var categories = [];
            _.each(metricData.CashFlowMOM, function (value, key) {
                categories.push(key);
            });
            _this.cashBurnDataOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Cash Burn',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                subtitle: {
                    text: '',
                    align: 'left'
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: [{
                        categories: categories,
                        crosshair: true,
                        labels: {
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    }],
                tooltip: {
                    pointFormatter: function () {
                        return '<span style="color:' + this.series.color + '">' + this.series.name + '</span>: <b>' + base.getFormattedAmount(this.y) + '</b><br/>';
                    },
                    shared: true
                },
                yAxis: [{
                        labels: {
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                        opposite: true
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        labels: {
                            format: '{value} %',
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        opposite: true
                    }],
                series: [{
                        name: 'Cash Burn',
                        type: 'line',
                        yAxis: 1,
                        data: _this.getDataArray(metricData["CashFlowMOM"], categories),
                        tooltip: {
                            valueDecimals: 2,
                            valuePrefix: metricData.currencySymbol
                        }
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
        });
    };
    BooksComponent.prototype.getProfitTrendData = function () {
        var _this = this;
        var base = this;
        this.reportRequest.type = "incomeStatement";
        this.reportRequest.metricsType = "profitTrend";
        this.reportsService.generateMetricReport(this.reportRequest, this.currentCompanyId).subscribe(function (metricData) {
            _this.hasProfitTrendData = true;
            _this.profitTrendDataOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Revnue vs Expenses',
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
                legend: {
                    enabled: false
                },
                xAxis: [{
                        categories: metricData.categories,
                        crosshair: true,
                        labels: {
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    }],
                yAxis: [{
                        labels: {
                            formatter: function () {
                                return base.getFormattedAmount(this.value);
                            },
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                    }],
                tooltip: {
                    pointFormatter: function () {
                        return '<span style="color:' + this.series.color + '">' + this.series.name + '</span>: <b>' + base.getFormattedAmount(this.y) + '</b><br/>';
                    },
                    shared: true
                },
                series: [{
                        name: 'Revenue',
                        type: 'column',
                        data: _this.getDataArray(metricData.Income, metricData.categories),
                        tooltip: {
                            valuePrefix: metricData.currencySymbol
                        }
                    }, {
                        name: 'Expenses',
                        type: 'column',
                        data: _this.getDataArray(metricData.Expenses, metricData.categories),
                        tooltip: {
                            valuePrefix: metricData.currencySymbol
                        }
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { });
    };
    BooksComponent.prototype.getDataArray = function (obj, categories) {
        var result = [];
        _.each(obj, function (value, key) {
            result.push(value);
        });
        return result;
    };
    BooksComponent.prototype.getFormattedAmount = function (amount) {
        return this.numeralService.format("$0,0.00", amount);
    };
    BooksComponent.prototype.getFormattedPercentage = function (value) {
        return this.numeralService.format("00.00", value);
    };
    BooksComponent.prototype.formatCategories = function (categories) {
        var result = [];
        _.each(categories, function (value) {
            if (value.length > 0) {
                result.push(value[0].toUpperCase() + value.slice(1));
            }
            else {
                result.push(value);
            }
        });
        return result;
    };
    BooksComponent.prototype.showOtherCharts = function (type) {
        this.showDetailedChart = true;
        if (type == 'opexChart') {
            this.detailedReportChartOptions = _.clone(this.opexChartOptions);
        }
        else if (type == 'profitTrend') {
            this.detailedReportChartOptions = _.clone(this.profitTrendDataOptions);
        }
        else if (type == 'cashBurnChart') {
            this.detailedReportChartOptions = _.clone(this.cashBurnDataOptions);
        }
        this.detailedReportChartOptions.legend = { enabled: true };
    };
    return BooksComponent;
}());
BooksComponent = __decorate([
    core_1.Component({
        selector: 'books',
        templateUrl: '/app/views/books.html',
    }),
    __metadata("design:paramtypes", [router_1.Router, router_1.ActivatedRoute, JournalEntries_service_1.JournalEntriesService,
        Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard, LoadingService_1.LoadingService, Companies_service_1.CompaniesService,
        Expense_service_1.ExpenseService, FinancialAccounts_service_1.FinancialAccountsService, Deposit_service_1.DepositService,
        Badge_service_1.BadgeService, Reconsile_service_1.ReconcileService, DateFormatter_service_1.DateFormater,
        Numeral_service_1.NumeralService, StateService_1.StateService, PageTitle_1.pageTitleService,
        Reports_service_1.ReportService])
], BooksComponent);
exports.BooksComponent = BooksComponent;
