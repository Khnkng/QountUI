/**
 * Created by Chandu on 28-09-2016.
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
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var Session_1 = require("qCommon/app/services/Session");
var router_1 = require("@angular/router");
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var FinancialAccounts_service_1 = require("qCommon/app/services/FinancialAccounts.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var FinancialAccount_form_1 = require("../forms/FinancialAccount.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Yodlee_service_1 = require("../services/Yodlee.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var FinancialAccountsComponent = (function () {
    function FinancialAccountsComponent(_router, _fb, _financialAccountForm, coaService, loadingService, financialAccountsService, toastService, yodleeService, switchBoard, dateFormater, numeralService, titleService) {
        var _this = this;
        this._router = _router;
        this._fb = _fb;
        this._financialAccountForm = _financialAccountForm;
        this.coaService = coaService;
        this.loadingService = loadingService;
        this.financialAccountsService = financialAccountsService;
        this.toastService = toastService;
        this.yodleeService = yodleeService;
        this.switchBoard = switchBoard;
        this.dateFormater = dateFormater;
        this.numeralService = numeralService;
        this.titleService = titleService;
        this.accounts = [];
        this.newFormActive = true;
        this.hasAccounts = false;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.tempValues = [];
        this.tableColumns = ['name', 'id', 'starting_balance', 'current_balance', 'no_effect_on_pl', 'is_credit_account', 'starting_balance_date', 'chart_of_account_id', 'transit_chart_of_account_id'];
        this.importType = 'MANUAL';
        /*banks:Array<any> = [];*/
        this.showFlyout = false;
        this.chartOfAccounts = [];
        this.showYodleeWidget = false;
        this.rsession = "";
        this.token = "";
        this.callBackUrl = "";
        this.companyCurrency = 'USD';
        this.showPaymentInfo = false;
        this.localeFortmat = 'en-US';
        this.bankCoa = [];
        this.creditCoa = [];
        this.titleService.setPageTitle("Financial Accounts");
        this.accountForm = this._fb.group(_financialAccountForm.getForm());
        this.currentCompany = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        if (this.currentCompany) {
            this.loadingService.triggerLoadingEvent(true);
            this.coaService.chartOfAccounts(this.currentCompany)
                .subscribe(function (chartOfAccounts) {
                _this.bankCoa = _.filter(chartOfAccounts, { 'type': 'bank' });
                _this.creditCoa = _.filter(chartOfAccounts, { 'type': 'creditCard' });
                _this.chartOfAccounts = chartOfAccounts;
                _this.getFinancialAccounts(_this.currentCompany);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load chart of accounts");
            });
        }
        else {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.warning, "No default company set. Please Hop to a company.");
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
    FinancialAccountsComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    FinancialAccountsComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.row = {};
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    FinancialAccountsComponent.prototype.setBalanceDate = function (date) {
        var dateControl = this.accountForm.controls['starting_balance_date'];
        dateControl.patchValue(date);
    };
    FinancialAccountsComponent.prototype.showAddAccount = function () {
        this.titleService.setPageTitle("CRETAE ACCOUNT");
        this.editMode = false;
        this.newForm();
        this.accountForm = this._fb.group(this._financialAccountForm.getForm());
        this.showFlyout = true;
    };
    FinancialAccountsComponent.prototype.showEditAccount = function (row) {
        this.titleService.setPageTitle("UPDATE ACCOUNT");
        this.editMode = true;
        this.newForm();
        this.getAccountDetails(row.id);
    };
    FinancialAccountsComponent.prototype.getAccountDetails = function (accountId) {
        var _this = this;
        var base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.financialAccountsService.financialAccount(accountId, this.currentCompany)
            .subscribe(function (account) {
            account = account.account || {};
            _this.onTypeSelect(account.type);
            _this.selectedAccount = account;
            _this.showFlyout = true;
            _this.loadingService.triggerLoadingEvent(false);
            account.starting_balance_date = base.dateFormater.formatDate(account.starting_balance_date, base.serviceDateformat, base.dateFormat);
            _this._financialAccountForm.updateForm(_this.accountForm, account);
            var coa = _.find(_this.chartOfAccounts, { 'id': account.chart_of_account_id });
            var transitCOA = _.find(_this.chartOfAccounts, { 'id': account.transit_chart_of_account_id }); //
            setTimeout(function () {
                base.coaComboBox.setValue(coa, 'name');
                base.transitCOAComboBox.setValue(transitCOA, 'name');
            }, 0);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load financial account details");
        });
    };
    FinancialAccountsComponent.prototype.removeAccount = function (row) {
        var _this = this;
        var accountId = row.id;
        this.loadingService.triggerLoadingEvent(true);
        this.financialAccountsService.removeAccount(accountId, this.currentCompany)
            .subscribe(function (response) {
            _this.getFinancialAccounts(_this.currentCompany);
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Deleted Account successfully");
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to delete account.");
        });
    };
    FinancialAccountsComponent.prototype.newForm = function () {
        var _this = this;
        this.newFormActive = false;
        setTimeout(function () { return _this.newFormActive = true; }, 0);
    };
    FinancialAccountsComponent.prototype.ngOnInit = function () {
    };
    FinancialAccountsComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
    };
    FinancialAccountsComponent.prototype.updateChartOfAccount = function (coa) {
        var data = this._financialAccountForm.getData(this.accountForm);
        if (coa && coa.id) {
            data.chart_of_account_id = coa.id;
        }
        else if (!coa || coa == '--None--') {
            data.chart_of_account_id = '--None--';
        }
        this._financialAccountForm.updateForm(this.accountForm, data);
    };
    FinancialAccountsComponent.prototype.updateTransitChartOfAccount = function (transitCOA) {
        var data = this._financialAccountForm.getData(this.accountForm);
        if (transitCOA && transitCOA.id) {
            data.transit_chart_of_account_id = transitCOA.id;
        }
        else if (!transitCOA || transitCOA == '--None--') {
            data.transit_chart_of_account_id = '--None--';
        }
        this._financialAccountForm.updateForm(this.accountForm, data);
    };
    FinancialAccountsComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditAccount($event);
        }
        else if (action == 'delete') {
            this.removeAccount($event);
        }
        else if (action == 'Navigation') {
            var link = ['Verification', $event.id];
            this._router.navigate(link);
        }
    };
    FinancialAccountsComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._financialAccountForm.getData(this.accountForm);
        data.starting_balance_date = this.dateFormater.formatDate(data.starting_balance_date, this.dateFormat, this.serviceDateformat);
        this.loadingService.triggerLoadingEvent(true);
        if (data.chart_of_account_id == '--None--' || data.chart_of_account_id == '') {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.warning, "Please select Chart of Account");
            this.loadingService.triggerLoadingEvent(false);
            return;
        }
        if (data.transit_chart_of_account_id == '--None--' || data.transit_chart_of_account_id == '') {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.warning, "Please select Transit COA");
            this.loadingService.triggerLoadingEvent(false);
            return;
        }
        delete data.importType;
        if (this.editMode) {
            this.financialAccountsService.updateAccount(data, this.currentCompany)
                .subscribe(function (response) {
                _this.currentAccountId = response.id;
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Updated Financial account successfully");
                _this.getFinancialAccounts(_this.currentCompany);
                _this.accountSubmitted = true;
                _this.showFlyout = false;
                if (_this.showYodleeWidget) {
                    _this.launchYodleeWidget();
                }
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to update financial account");
                _this.showFlyout = false;
            });
        }
        else {
            this.financialAccountsService.addAccount(data, this.currentCompany)
                .subscribe(function (response) {
                _this.currentAccountId = response.id;
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Financial account created successfully");
                _this.getFinancialAccounts(_this.currentCompany);
                _this.accountSubmitted = true;
                _this.showFlyout = false;
                if (_this.showYodleeWidget) {
                    _this.launchYodleeWidget();
                }
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to create Account");
                _this.showFlyout = false;
            });
        }
    };
    FinancialAccountsComponent.prototype.handleAccount = function (newAccount) {
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Financial Account created successfully");
        this.accounts.push(newAccount);
        this.buildTableData(this.accounts);
    };
    FinancialAccountsComponent.prototype.getFinancialAccounts = function (companyId) {
        var _this = this;
        this.financialAccountsService.financialAccounts(companyId)
            .subscribe(function (response) {
            _this.buildTableData(response.accounts);
        }, function (error) { return _this.handleError(error); });
    };
    FinancialAccountsComponent.prototype.getCOAName = function (id) {
        var coa = _.find(this.chartOfAccounts, { 'id': id });
        return (coa && coa.name) ? coa.name : "";
    };
    FinancialAccountsComponent.prototype.buildTableData = function (accounts) {
        this.hasAccounts = false;
        this.accounts = accounts;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "chart_of_account", "title": "Chart of Account" },
            { "name": "starting_balance_date", "title": "Start Balance Date", "type": "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "starting_balance", "title": "Starting Balance", "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align" },
            { "name": "current_balance", "title": "Current Balance", "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align" },
            { "name": "id", "title": "Id", "visible": false },
            { "name": "yodlee_provider_id", "title": "Yodle_Provider", "visible": false },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        this.accounts.forEach(function (account) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                row[key] = account[key];
                if (key == 'chart_of_account_id') {
                    row['chart_of_account'] = base.getCOAName(account[key]);
                }
                if (key == 'transit_chart_of_account_id') {
                    row['transit_chart_of_account_id'] = base.getCOAName(account[key]);
                }
                if (key == 'starting_balance') {
                    var starting_balance = account['starting_balance'] ? Number(account['starting_balance']) : 0;
                    //row['starting_balance'] =starting_balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    row[key] = {
                        'options': {
                            "classes": "text-right currency-padding"
                        },
                        value: starting_balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session_1.Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    };
                }
                if (key == 'current_balance') {
                    var current_balance = account['current_balance'] ? Number(account['current_balance']) : 0;
                    //row['current_balance'] =current_balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    row[key] = {
                        'options': {
                            "classes": "text-right currency-padding"
                        },
                        value: current_balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session_1.Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    };
                }
                if (key == 'starting_balance_date') {
                    row[key] = base.dateFormater.formatDate(account[key], base.serviceDateformat, base.dateFormat);
                }
                var yodlee_action = "";
                if (account.yodlee_provider_id) {
                    yodlee_action = "<a class='action'><i class='icon ion-reply'></i></a>";
                }
                if (account.drop_verified == false) {
                    var verify = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>V</span></a>";
                    row['actions'] = yodlee_action + verify + "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
                }
                else {
                    row['actions'] = yodlee_action + "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
                }
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasAccounts = true;
            base.loadingService.triggerLoadingEvent(false);
        }, 0);
    };
    FinancialAccountsComponent.prototype.setImportType = function (type) {
        this.importType = type;
    };
    FinancialAccountsComponent.prototype.isValid = function (form) {
        var data = this._financialAccountForm.getData(form);
        if (data.importType == 'AUTO') {
            if (!data.id || !data.user_name || !data.password) {
                return true;
            }
        }
        return false;
    };
    FinancialAccountsComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Financial Accounts");
        this.row = {};
        this.showFlyout = !this.showFlyout;
        this.showPaymentInfo = false;
        this.accountForm.reset();
    };
    FinancialAccountsComponent.prototype.launchYodleeWidget = function () {
        var _this = this;
        jQuery('#output_frame').attr('src', "");
        jQuery('#yodleewgt').foundation('open');
        this.yodleeService.getAccessToken(Session_1.Session.getCurrentCompany()).subscribe(function (resp) {
            _this.rsession = resp.userSessionToken;
            _this.token = resp.userAccessToken;
            _this.callBackUrl = "http://dev-oneapp.qount.io" + "/yodleeToken";
            setTimeout(function () {
                jQuery("#yodleeForm").submit();
            }, 100);
        }, function (error) { });
        this.switchBoard.onYodleeTokenRecived.subscribe(function (recived) {
            var status = JSON.parse(Session_1.Session.get("yodleeStatus"));
            _this.loadingService.triggerLoadingEvent(true);
            jQuery('#yodleewgt').foundation('close');
            _this.yodleeService.submitStatus(Session_1.Session.getCurrentCompany(), _this.currentAccountId, status[0]).subscribe(function (resp) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Account linked successfully");
                _this.getFinancialAccounts(_this.currentCompany);
                _this.loadingService.triggerLoadingEvent(false);
            });
        });
    };
    FinancialAccountsComponent.prototype.unlinkYodleeAccount = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.yodleeService.unlink(Session_1.Session.getCurrentCompany(), this.selectedAccount.id, this.selectedAccount.yodlee_provider_id).subscribe(function (resp) {
            _this.selectedAccount.yodlee_provider_id = null;
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Account unlinked successfully");
        });
    };
    FinancialAccountsComponent.prototype.changeShowPaymentInfo = function () {
        var data = this._financialAccountForm.getData(this.accountForm);
        if (data.showPaymentInfo) {
            this.showPaymentInfo = true;
        }
        else {
            this.showPaymentInfo = false;
        }
    };
    FinancialAccountsComponent.prototype.onTypeSelect = function (type) {
        this.chartOfAccounts = [];
        if (type == 'credit') {
            this.chartOfAccounts = this.creditCoa;
        }
        else {
            this.chartOfAccounts = this.bankCoa;
        }
    };
    return FinancialAccountsComponent;
}());
__decorate([
    core_1.ViewChild('addAccount'),
    __metadata("design:type", Object)
], FinancialAccountsComponent.prototype, "addAccount", void 0);
__decorate([
    core_1.ViewChild('coaComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], FinancialAccountsComponent.prototype, "coaComboBox", void 0);
__decorate([
    core_1.ViewChild('transitCOAComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], FinancialAccountsComponent.prototype, "transitCOAComboBox", void 0);
FinancialAccountsComponent = __decorate([
    core_1.Component({
        selector: 'financial-accounts',
        templateUrl: '/app/views/financialAccounts.html',
    }),
    __metadata("design:paramtypes", [router_1.Router, forms_1.FormBuilder, FinancialAccount_form_1.FinancialAccountForm, ChartOfAccounts_service_1.ChartOfAccountsService, LoadingService_1.LoadingService,
        FinancialAccounts_service_1.FinancialAccountsService, Toast_service_1.ToastService, Yodlee_service_1.YodleeService, SwitchBoard_1.SwitchBoard, DateFormatter_service_1.DateFormater, Numeral_service_1.NumeralService, PageTitle_1.pageTitleService])
], FinancialAccountsComponent);
exports.FinancialAccountsComponent = FinancialAccountsComponent;
