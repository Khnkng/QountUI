/**
 * Created by venkatkollikonda on 24/03/17.
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
var Session_1 = require("qCommon/app/services/Session");
var router_1 = require("@angular/router");
var forms_1 = require("@angular/forms");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Reconsile_service_1 = require("../services/Reconsile.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var FinancialAccounts_service_1 = require("qCommon/app/services/FinancialAccounts.service");
var Reconsile_form_1 = require("../forms/Reconsile.form");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var payments_constants_1 = require("reportsUI/app/constants/payments.constants");
var Invoices_service_1 = require("invoicesUI/app/services/Invoices.service");
var ReconcileComponent = (function () {
    function ReconcileComponent(_fb, _reconcileForm, toastService, _router, _route, loadingService, reconcileService, accountsService, companyService, numeralService, stateService, titleService, _switchBoard, reportService, invoiceService) {
        var _this = this;
        this._fb = _fb;
        this._reconcileForm = _reconcileForm;
        this.toastService = toastService;
        this._router = _router;
        this._route = _route;
        this.loadingService = loadingService;
        this.reconcileService = reconcileService;
        this.accountsService = accountsService;
        this.companyService = companyService;
        this.numeralService = numeralService;
        this.stateService = stateService;
        this.titleService = titleService;
        this.reportService = reportService;
        this.invoiceService = invoiceService;
        this.accounts = [];
        this.entries = [];
        this.tableData = {};
        this.depositsTableData = {};
        this.expensesTableData = {};
        this.reconActivityTableData = {};
        this.hasData = false;
        this.tableOptions = { search: false, pageSize: 5, selectable: false };
        this.unreconciledTableOptions = { search: true, pageSize: 6, selectable: false };
        this.showForm = true;
        this.reconcileData = {};
        this.reconcileDataCopy = {};
        this.selectedBank = '';
        this.selectedBankName = '';
        this.selectedRows = [];
        this.selectedDepositRows = [];
        this.selectedExpenseRows = [];
        this.reconActivity = [];
        this.companies = [];
        this.tabDisplay = [{ 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }];
        this.bgColors = [
            '#d45945',
            '#d47e47',
            '#2980b9',
            '#3dc36f'
        ];
        this.tabBackground = "#d45945";
        this.selectedTabColor = "#d45945";
        this.selectedTab = 'deposits';
        this.selectedColor = 'red-tab';
        this.reconType = 'new';
        this.editable = true;
        this.localeFortmat = 'en-US';
        this.isCreditAccount = false;
        this.hasReconcileData = false;
        this.titleService.setPageTitle("Reconcile");
        this.switchPage = 'Books';
        this.reconcileForm = _fb.group(_reconcileForm.getForm());
        this.companyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(function (accounts) {
            _this.accounts = accounts.accounts;
            _this.fetchReconActivityData();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key != 'BOOKS') {
            var state = this.stateService.pop();
            this.fetchReconActivity(state.data, state.selectedId || 0);
        }
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(function (title) { return _this.gotoPrevious(); });
    }
    ReconcileComponent.prototype.gotoPrevious = function () {
        switch (this.switchPage) {
            case 'Books':
                this.showPreviousPage();
                break;
            case 'reconcile':
                this.resetReconcileForm();
                break;
            default:
                this.showPreviousPage();
                break;
        }
    };
    ReconcileComponent.prototype.fetchReconActivityData = function () {
        var _this = this;
        this.reconcileService.getReconActivityRecords()
            .subscribe(function (reconActivityData) {
            _this.reconActivity = reconActivityData;
            _this.buildReconActivityTableData();
            _this.hasData = true;
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    ReconcileComponent.prototype.showPreviousPage = function () {
        var link = ['books', 'deposits'];
        var prevState = this.stateService.getPrevState();
        if (prevState) {
            this._router.navigate([prevState.url]);
        }
        else {
            this._router.navigate(link);
        }
    };
    ReconcileComponent.prototype.ngOnInit = function () {
    };
    ReconcileComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    ReconcileComponent.prototype.getBankAccountName = function (accountId) {
        var account = _.find(this.accounts, { 'id': accountId });
        return account ? account.name : "";
    };
    ReconcileComponent.prototype.redirectToEntryPage = function ($event) {
        var state;
        var prevState = this.stateService.getPrevState();
        if ($event.type == 'expense') {
            prevState.selectedId = 1;
            state = new State_1.State("EXP_SELECTED", this._router.url, null, 1);
            var link = ['/expense', $event.id];
            this._router.navigate(link);
        }
        if ($event.type == 'deposit') {
            prevState.selectedId = 0;
            state = new State_1.State("DEP_SELECTED", this._router.url, null, 0);
            var link = ['/deposit', $event.id];
            this._router.navigate(link);
        }
        this.stateService.addState(state);
    };
    ReconcileComponent.prototype.setDueDate = function (date) {
        var data = this._reconcileForm.getData(this.reconcileForm);
        data.date = date;
        this.reconcileDate = date;
        this._reconcileForm.updateForm(this.reconcileForm, data);
    };
    ReconcileComponent.prototype.setBankAccount = function (account) {
        var data = this._reconcileForm.getData(this.reconcileForm);
        if (account && account.id) {
            data.bankAccountId = account.id;
            this.selectedBank = account.id;
            this.selectedBankName = account.name;
            if (account.type == 'credit') {
                this.isCreditAccount = true;
            }
            else {
                this.isCreditAccount = false;
            }
        }
        else if (!account || account == '--None--') {
            data.bankAccountId = '--None--';
        }
        this._reconcileForm.updateForm(this.reconcileForm, data);
    };
    ReconcileComponent.prototype.handleDepositsSelect = function (event) {
        var unCheckedRowsInPage = [];
        jQuery(this.el.nativeElement).find("tbody tr input.checkbox").each(function (idx, cbox) {
            var row = jQuery(cbox).closest('tr').data('__FooTableRow__');
            if (!jQuery(cbox).is(":checked")) {
                unCheckedRowsInPage.push(row.val());
            }
        });
        for (var i in unCheckedRowsInPage) {
            _.remove(this.selectedDepositRows, { id: unCheckedRowsInPage[i].id });
        }
        var base = this;
        base.inflow = 0;
        base.selectedDepositsCount = 0;
        var deposits = [];
        _.each(event, function (bill) {
            base.selectedDepositRows.push(bill);
        });
        this.selectedDepositRows = _.uniqBy(this.selectedDepositRows, 'id');
        _.remove(this.selectedDepositRows, { 'tempIsSelected': false });
        _.each(this.selectedDepositRows, function (row) {
            base.selectedDepositsCount = base.selectedDepositsCount + 1;
            deposits.push(_.find(base.reconcileDataCopy.deposits, { id: row.id }));
            base.inflow = base.inflow + parseFloat(_.find(base.reconcileDataCopy.deposits, { id: row.id }).amount);
        });
        this.calculateEndingBalance();
        this.calculateReconDifference();
    };
    ReconcileComponent.prototype.handleExpensesSelect = function (event) {
        var unCheckedRowsInPage = [];
        jQuery(this.el1.nativeElement).find("tbody tr input.checkbox").each(function (idx, cbox) {
            var row = jQuery(cbox).closest('tr').data('__FooTableRow__');
            if (!jQuery(cbox).is(":checked")) {
                unCheckedRowsInPage.push(row.val());
            }
        });
        for (var i in unCheckedRowsInPage) {
            _.remove(this.selectedExpenseRows, { id: unCheckedRowsInPage[i].id });
        }
        var base = this;
        base.outflow = 0;
        base.selectedExpensesCount = 0;
        var expenses = [];
        _.each(event, function (bill) {
            base.selectedExpenseRows.push(bill);
        });
        this.selectedExpenseRows = _.uniqBy(this.selectedExpenseRows, 'id');
        _.remove(this.selectedExpenseRows, { 'tempIsSelected': false });
        _.each(this.selectedExpenseRows, function (row) {
            base.selectedExpensesCount = base.selectedExpensesCount + 1;
            expenses.push(_.find(base.reconcileDataCopy.expenses, { id: row.id }));
            base.outflow = base.outflow + parseFloat(_.find(base.reconcileDataCopy.expenses, { id: row.id }).amount);
        });
        this.calculateEndingBalance();
        this.calculateReconDifference();
    };
    ReconcileComponent.prototype.fetchReconActivity = function ($event, selectedTab) {
        var _this = this;
        this.switchPage = "reconcile";
        var base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.reconcileService.getReconDetails($event)
            .subscribe(function (reconcileDetails) {
            _this.showForm = false;
            _this.reconcileData = reconcileDetails;
            _this.hasReconcileData = true;
            _this.selectedDepositsCount = reconcileDetails.deposits.length;
            _this.selectedExpensesCount = reconcileDetails.expenses.length;
            if (_this.reconcileData.unreconciled_deposits.length > 0) {
                _.each(_this.reconcileData.unreconciled_deposits, function (entry) {
                    base.reconcileData.deposits.push(entry);
                });
            }
            if (_this.reconcileData.unreconciled_expense.length > 0) {
                _.each(_this.reconcileData.unreconciled_expense, function (entry) {
                    base.reconcileData.expenses.push(entry);
                });
            }
            var account = _.find(_this.accounts, { 'id': reconcileDetails.bank_Account_id });
            if (account.type === 'credit') {
                _this.isCreditAccount = true;
            }
            else {
                _this.isCreditAccount = false;
            }
            _this.selectedBankName = $event.bank;
            var amount = reconcileDetails.ending_balance;
            amount = parseFloat(amount);
            _this.endingBalance = amount;
            _this.startingBalance = reconcileDetails.starting_balance;
            _this.inflow = reconcileDetails.sum_of_deposits;
            _this.outflow = reconcileDetails.sum_of_expenses;
            _this.statementEndingBalance = amount;
            _this.tableOptions.selectable = false;
            _this.reconDifference = 0;
            _this.buildDepositsTableData();
            _this.buildExpensesTableData();
            base.getCompanyLogo();
            setTimeout(function () {
                base.resetDepositsTab(true, 'edit');
                base.resetExpensesTab(true, 'edit');
            }, 1000);
            _this.selectTab(selectedTab, '');
            _this.reconType = 'edit';
            _this.titleService.setPageTitle("Reconcile | " + _this.selectedBankName);
        }, function (error) {
            base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load reconcile details");
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    ReconcileComponent.prototype.handleReconActivity = function ($event) {
        this.editable = false;
        var state = new State_1.State("RECON_SELECTED", this._router.url, $event, null);
        this.stateService.addState(state);
        this.fetchReconActivity($event, 0);
    };
    ReconcileComponent.prototype.handleReconSelect = function ($event) {
        var _this = this;
        var base = this;
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'pdf') {
            this.loadingService.triggerLoadingEvent(true);
            this.reconcileService.getReconDetails($event)
                .subscribe(function (reconcileDetails) {
                _this.reconcileData = reconcileDetails;
                _this.hasReconcileData = true;
                _this.selectedDepositsCount = reconcileDetails.deposits.length;
                _this.selectedExpensesCount = reconcileDetails.expenses.length;
                var account = _.find(_this.accounts, { 'id': reconcileDetails.bank_Account_id });
                if (account.type === 'credit') {
                    _this.isCreditAccount = true;
                }
                else {
                    _this.isCreditAccount = false;
                }
                _this.selectedBankName = $event.bank;
                var amount = reconcileDetails.ending_balance;
                amount = parseFloat(amount);
                _this.endingBalance = amount;
                _this.startingBalance = reconcileDetails.starting_balance;
                _this.inflow = reconcileDetails.sum_of_deposits;
                _this.outflow = reconcileDetails.sum_of_expenses;
                _this.statementEndingBalance = amount;
                base.getCompanyLogo();
                setTimeout(function () {
                    base.exportToPDF();
                }, 1000);
                _this.loadingService.triggerLoadingEvent(false);
            }, function (error) {
                base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load reconcile details");
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
    };
    ReconcileComponent.prototype.getCompanyLogo = function () {
        var _this = this;
        this.invoiceService.getCompanyLogo(this.companyId, Session_1.Session.getUser().id)
            .subscribe(function (preference) { return _this.processPreference(preference[0]); }, function (error) { return _this.handleError(error); });
    };
    ReconcileComponent.prototype.processPreference = function (preference) {
        if (preference && preference.temporaryURL) {
            this.logoURL = preference.temporaryURL;
        }
    };
    ReconcileComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    ReconcileComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var base = this;
        var data = this._reconcileForm.getData(this.reconcileForm);
        this.statementEndingBalance = data.statementEndingBalance;
        this.loadingService.triggerLoadingEvent(true);
        this.reconType = 'new';
        this.reconcileService.getReconcileData(data)
            .subscribe(function (reconcileData) {
            _this.switchPage = "reconcile";
            _this.reconcileData = reconcileData;
            _this.reconcileDataCopy = reconcileData;
            _this.getStartingBalance();
            _this.titleService.setPageTitle("Reconcile | " + _this.selectedBankName);
        }, function (error) {
            base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load reconcile data");
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    ReconcileComponent.prototype.calculateEndingBalance = function () {
        if (this.inflow == undefined) {
            this.inflow = 0;
        }
        else if (this.outflow == undefined) {
            this.outflow = 0;
        }
        if (this.isCreditAccount) {
            this.endingBalance = this.startingBalance - this.inflow + this.outflow;
        }
        else {
            this.endingBalance = this.startingBalance + this.inflow - this.outflow;
        }
    };
    ;
    ReconcileComponent.prototype.calculateReconDifference = function () {
        this.statementEndingBalance = parseFloat(this.statementEndingBalance);
        this.endingBalance = parseFloat(this.endingBalance);
        this.reconDifference = Math.abs(this.statementEndingBalance.toFixed(2) - this.endingBalance.toFixed(2));
    };
    ReconcileComponent.prototype.getStartingBalance = function () {
        var _this = this;
        var base = this;
        this.reconcileService.getStartingBalance(this.selectedBank)
            .subscribe(function (reconData) {
            _this.showForm = false;
            var amount = reconData.last_recon_ending_balance;
            amount = parseFloat(amount);
            _this.startingBalance = amount;
            _this.endingBalance = amount;
            _this.buildDepositsTableData();
            _this.buildExpensesTableData();
            //this.buildTableData();
            _this.selectTab(0, '');
            _this.reconcileForm.reset();
            setTimeout(function () {
                //base.updateTabHeight();
            });
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            base.reconcileForm.reset();
            base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to get starting balance");
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    ReconcileComponent.prototype.buildDepositsTableData = function () {
        var base = this;
        this.depositsTableData.columns = [
            { "name": "type", "title": "Type", "visible": false },
            { "name": "title", "title": "Title" },
            { "name": "date", "title": "Date" },
            { "name": "amount", "title": "Amount", "classes": "currency-align currency-padding" },
            { "name": "id", "title": "Entry ID", "visible": false },
            { "name": "recon", "title": "reconcile", "visible": false },
            { "name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false },
            { "name": "selectCol", "title": "", "type": "html", "sortable": false, "filterable": false }
        ];
        this.depositsTableData.rows = [];
        _.each(base.reconcileData.deposits, function (entry) {
            var row = {};
            _.each(Object.keys(entry), function (key) {
                if (key == 'amount') {
                    var amount = parseFloat(entry[key]);
                    //row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value: amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    };
                }
                else {
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            row['selectCol'] = "<input type='checkbox' class='checkbox'/>";
            base.depositsTableData.rows.push(row);
        });
    };
    ;
    ReconcileComponent.prototype.buildExpensesTableData = function () {
        var base = this;
        this.expensesTableData.columns = [
            { "name": "type", "title": "Type", "visible": false },
            { "name": "title", "title": "Title" },
            { "name": "due_date", "title": "Date" },
            { "name": "amount", "title": "Amount", "classes": "currency-align currency-padding" },
            { "name": "id", "title": "Entry ID", "visible": false },
            { "name": "recon", "title": "reconcile", "visible": false },
            { "name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false },
            { "name": "selectCol", "title": "", "type": "html", "sortable": false, "filterable": false }
        ];
        this.expensesTableData.rows = [];
        _.each(base.reconcileData.expenses, function (entry) {
            var row = {};
            _.each(Object.keys(entry), function (key) {
                if (key == 'amount') {
                    var amount = parseFloat(entry[key]);
                    //row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value: amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    };
                }
                else {
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            row['selectCol'] = "<input type='checkbox' class='checkbox'/>";
            base.expensesTableData.rows.push(row);
        });
    };
    ;
    ReconcileComponent.prototype.buildTableData = function () {
        var base = this;
        this.tableData.columns = [
            { "name": "type", "title": "Type" },
            { "name": "date", "title": "Date" },
            { "name": "amount", "title": "Amount" },
            { "name": "id", "title": "Entry ID", "visible": false }
        ];
        this.tableData.rows = [];
        var all = base.reconcileData.deposits;
        all = all.concat(base.reconcileData.expenses);
        _.each(all, function (entry) {
            var row = {};
            _.each(Object.keys(entry), function (key) {
                if (key == 'amount') {
                    var amount = parseFloat(entry[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                else {
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
    };
    ;
    ReconcileComponent.prototype.buildReconActivityTableData = function () {
        var base = this;
        this.reconActivityTableData.columns = [
            { "name": "company_id", "title": "company ID", "visible": false, 'filterable': false },
            { "name": "bank_Account_id", "title": "Bank ID", "visible": false, 'filterable': false },
            { "name": "bank", "title": "Account" },
            { "name": "last_Recon_date", "title": "Recon Date" },
            { "name": "recon_done_date", "title": "Recon Completed On" },
            { "name": "id", "title": "Entry ID", "visible": false, 'filterable': false },
            { "name": "ending_balance", "title": "Ending Balance", "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }, "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align currency-padding" },
            { "name": "actions", "title": "", "type": "html", 'filterable': false }
        ];
        this.reconActivityTableData.rows = [];
        _.each(base.reconActivity, function (entry) {
            var row = {};
            _.each(Object.keys(entry), function (key) {
                if (key == 'bank_Account_id') {
                    row[key] = entry[key];
                    row['bank'] = base.getBankAccountName(entry[key]);
                }
                else if (key == 'recon_done_date') {
                    row[key] = moment(entry[key]).format('MM/DD/YYYY');
                }
                else if (key == 'ending_balance') {
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value: entry[key]
                    };
                }
                else {
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='pdf' style='margin:0px 0px 0px 5px;'><i class='icon ion-ios-cloud-download-outline' style='font-size: 1.5rem;'></i></a>";
            base.reconActivityTableData.rows.push(row);
        });
    };
    ;
    ReconcileComponent.prototype.submitReconcile = function () {
        var _this = this;
        var base = this;
        this.hasData = false;
        if (base.selectedDepositRows.length > 0 || base.selectedExpenseRows.length > 0) {
            var deposits_1 = [];
            var expenses_1 = [];
            var unreconciled_deposits_1 = [];
            var unreconciled_expenses_1 = [];
            var selected = {};
            _.each(this.reconcileDataCopy.deposits, function (deposit) {
                if (!_.find(base.selectedDepositRows, { id: deposit.id })) {
                    unreconciled_deposits_1.push(deposit.id);
                }
            });
            _.each(this.reconcileDataCopy.expenses, function (expense) {
                if (!_.find(base.selectedExpenseRows, { id: expense.id })) {
                    unreconciled_expenses_1.push(expense.id);
                }
            });
            _.each(this.selectedDepositRows, function (row) {
                deposits_1.push(row.id);
            });
            _.each(this.selectedExpenseRows, function (row) {
                expenses_1.push(row.id);
            });
            selected["deposits"] = deposits_1;
            selected["expenses"] = expenses_1;
            selected["unreconciled_deposits"] = unreconciled_deposits_1;
            selected["unreconciled_expenses"] = unreconciled_expenses_1;
            selected["last_recon_ending_balance"] = this.endingBalance;
            selected["last_recon_date"] = this.reconcileDate;
            selected["starting_balance"] = this.startingBalance;
            selected["sum_of_deposits"] = this.inflow;
            selected["sum_of_expenses"] = this.outflow;
            this.reconcileService.createReconcile(selected, base.selectedBank)
                .subscribe(function (response) {
                base.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Reconcilation Successfull");
                //this.updateStartingBalance();
                _this.resetReconcileForm();
                _this.getAccounts();
                _this.fetchReconActivityData();
            }, function (error) {
                base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to reconcile data");
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
        else {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "No Records Selected");
        }
    };
    ReconcileComponent.prototype.updateStartingBalance = function () {
        var _this = this;
        var base = this;
        var data = {};
        data["last_recon_ending_balance"] = this.endingBalance;
        data["last_recon_date"] = this.reconcileDate;
        this.reconcileService.updateStartingBalance(data, this.selectedBank)
            .subscribe(function (response) {
            base.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Updated last reconcile data");
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to update reconcile date");
        });
    };
    ReconcileComponent.prototype.resetReconcileForm = function () {
        this.showForm = true;
        this.inflow = null;
        this.outflow = null;
        this.endingBalance = null;
        this.statementInflow = null;
        this.statementOutflow = null;
        this.statementEndingBalance = null;
        this.selectedRows = [];
        this.startingBalance = null;
        this.selectedDepositRows = [];
        this.selectedExpenseRows = [];
        this.selectedDepositsCount = null;
        this.selectedExpensesCount = null;
        this.tabHeight = '';
        this.editable = true;
        this.reconDifference = null;
        this.tableOptions.selectable = false;
        this.reconType = 'new';
        this.titleService.setPageTitle("Reconcile");
        this.isCreditAccount = false;
        this.switchPage = 'Books';
        this.hasReconcileData = false;
    };
    ReconcileComponent.prototype.getAccounts = function () {
        var _this = this;
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(function (accounts) {
            _this.accounts = accounts.accounts;
        }, function (error) {
        });
    };
    ReconcileComponent.prototype.reRoutePage = function (tabId) {
        if (tabId == 0) {
            var link = ['books', 'deposits'];
            this._router.navigate(link);
            return;
        }
        else if (tabId == 1) {
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
    ReconcileComponent.prototype.selectTab = function (tabNo, color) {
        this.selectedTab = tabNo;
        this.selectedColor = color;
        var base = this;
        this.tabDisplay.forEach(function (tab, index) {
            base.tabDisplay[index] = { 'display': 'none' };
        });
        this.tabDisplay[tabNo] = { 'display': 'block' };
        this.tabBackground = this.bgColors[tabNo];
        //this.updateTabHeight();
    };
    ReconcileComponent.prototype.updateTabHeight = function () {
        var base = this;
        if (jQuery('.tab-content') !== undefined) {
            var topOfDiv = jQuery('.tab-content').offset().top;
            topOfDiv = topOfDiv < 150 ? 170 : topOfDiv;
            var bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
            base.tabHeight = (bottomOfVisibleWindow - topOfDiv - 75) + "px";
            jQuery('.tab-content').css('height', base.tabHeight);
            switch (this.selectedTab) {
                case 0:
                    base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                    break;
                case 1:
                    base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                    break;
                case 2:
                    base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                    break;
            }
        }
    };
    ReconcileComponent.prototype.updateDepositRows = function (state, type) {
        var base = this;
        var rows = base.depositsTableData.rows;
        for (var i in rows) {
            if (type == 'edit' && rows[i].recon == 1) {
                rows[i].selectCol = "<input type='checkbox' checked  disabled class='checkbox'/>";
            }
            else if (type == 'new') {
                if (state) {
                    rows[i].selectCol = "<input type='checkbox' checked  class='checkbox'/>";
                }
                else {
                    rows[i].selectCol = "<input type='checkbox' class='checkbox'/>";
                }
            }
        }
        base.depositsTableData.rows = rows;
        base.depositsTableData = _.clone(base.depositsTableData);
    };
    ReconcileComponent.prototype.updateExpenseRows = function (state, type) {
        var base = this;
        var rows = base.expensesTableData.rows;
        for (var i in rows) {
            if (type == 'edit' && rows[i].recon == 1) {
                rows[i].selectCol = "<input type='checkbox' checked class='checkbox' disabled/>";
            }
            else if (type == 'new') {
                if (state) {
                    rows[i].selectCol = "<input type='checkbox' checked  class='checkbox'/>";
                }
                else {
                    rows[i].selectCol = "<input type='checkbox' class='checkbox'/>";
                }
            }
        }
        base.expensesTableData.rows = rows;
        base.expensesTableData = _.clone(base.expensesTableData);
    };
    ReconcileComponent.prototype.resetDepositsTab = function (state, type) {
        var base = this;
        var selectedRows = [];
        base.selectedDepositRows = [];
        this.updateDepositRows(state, type);
        var rows = base.depositsTableData.rows;
        for (var i in rows) {
            var obj = rows[i];
            if (type == 'new') {
                obj.tempIsSelected = state;
                selectedRows.push(obj);
            }
        }
        ;
        if (type == 'new') {
            this.handleDepositsSelect(selectedRows);
        }
    };
    ReconcileComponent.prototype.resetExpensesTab = function (state, type) {
        var base = this;
        var selectedRows = [];
        base.selectedExpenseRows = [];
        this.updateExpenseRows(state, type);
        var rows = base.expensesTableData.rows;
        for (var i in rows) {
            var obj = rows[i];
            if (type == 'new') {
                obj.tempIsSelected = state;
                selectedRows.push(obj);
            }
        }
        ;
        if (type == 'new') {
            this.handleExpensesSelect(selectedRows);
        }
        this.loadingService.triggerLoadingEvent(false);
    };
    ;
    ReconcileComponent.prototype.selectAll = function (type, state) {
        if (type == 'deposits') {
            this.resetDepositsTab(state, 'new');
        }
        else {
            this.resetExpensesTab(state, 'new');
        }
    };
    ReconcileComponent.prototype.exportToPDF = function () {
        var _this = this;
        var imgString = jQuery('#company-img').clone().html();
        var html = jQuery('<div>').append(jQuery('style').clone()).append(jQuery('#numeric').clone()).html();
        if (imgString)
            html = html.replace(imgString, imgString.replace('>', '/>'));
        var pdfReq = {
            "version": "1.1",
            "genericReport": {
                "payload": html
            }
        };
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.PDF_SERVICE, pdfReq)
            .subscribe(function (data) {
            var blob = new Blob([data._body], { type: "application/pdf" });
            var link = jQuery('<a></a>');
            link[0].href = URL.createObjectURL(blob);
            link[0].download = "reconActivity.pdf";
            link[0].click();
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    ReconcileComponent.prototype.ngAfterViewInit = function () {
        var base = this;
        jQuery(document).ready(function () {
            //base.updateTabHeight();
        });
    };
    return ReconcileComponent;
}());
__decorate([
    core_1.ViewChild('depositsTable'),
    __metadata("design:type", core_1.ElementRef)
], ReconcileComponent.prototype, "el", void 0);
__decorate([
    core_1.ViewChild('expensesTable'),
    __metadata("design:type", core_1.ElementRef)
], ReconcileComponent.prototype, "el1", void 0);
__decorate([
    core_1.ViewChild('global-checkbox'),
    __metadata("design:type", core_1.ElementRef)
], ReconcileComponent.prototype, "el2", void 0);
ReconcileComponent = __decorate([
    core_1.Component({
        selector: 'reconcile',
        templateUrl: '/app/views/reconsile.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, Reconsile_form_1.ReconcileForm, Toast_service_1.ToastService, router_1.Router, router_1.ActivatedRoute,
        LoadingService_1.LoadingService, Reconsile_service_1.ReconcileService, FinancialAccounts_service_1.FinancialAccountsService,
        Companies_service_1.CompaniesService, Numeral_service_1.NumeralService, StateService_1.StateService,
        PageTitle_1.pageTitleService, SwitchBoard_1.SwitchBoard, Reports_service_1.ReportService,
        Invoices_service_1.InvoicesService])
], ReconcileComponent);
exports.ReconcileComponent = ReconcileComponent;
