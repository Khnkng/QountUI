/**
 * Created by mateen on 17-11-2016.
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
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var CodesService_service_1 = require("qCommon/app/services/CodesService.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var ExpenseCodes_form_1 = require("../forms/ExpenseCodes.form");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var ExpenseCodes_service_1 = require("qCommon/app/services/ExpenseCodes.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var router_1 = require("@angular/router");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var ExpensesCodesComponent = (function () {
    function ExpensesCodesComponent(_fb, _expensesForm, switchBoard, codeService, toastService, _router, coaService, expensesSerice, companiesService, loadingService, titleService) {
        var _this = this;
        this._fb = _fb;
        this._expensesForm = _expensesForm;
        this.switchBoard = switchBoard;
        this.codeService = codeService;
        this.toastService = toastService;
        this._router = _router;
        this.coaService = coaService;
        this.expensesSerice = expensesSerice;
        this.companiesService = companiesService;
        this.loadingService = loadingService;
        this.titleService = titleService;
        this.expenses = [];
        this.paymentChartOfAccounts = [];
        this.invoiceChartOfAccounts = [];
        this.chartOfAccountsArr = [];
        this.newFormActive = true;
        this.hasItemCodes = false;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.tableColumns = ['name', 'id', 'companyID', 'coa_mapping_id', 'desc'];
        this.combo = true;
        this.allCOAList = [];
        this.showFlyout = false;
        this.titleService.setPageTitle("Expense Codes");
        this.expensesForm = this._fb.group(_expensesForm.getForm());
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteExpense(toast); });
        var companyId = Session_1.Session.getCurrentCompany();
        this.loadingService.triggerLoadingEvent(true);
        this.companiesService.companies().subscribe(function (companies) {
            _this.allCompanies = companies;
            if (companyId) {
                _this.currentCompany = _.find(_this.allCompanies, { id: companyId });
            }
            else if (_this.allCompanies.length > 0) {
                _this.currentCompany = _.find(_this.allCompanies, { id: _this.allCompanies[0].id });
            }
            _this.coaService.filterdChartOfAccounts(_this.currentCompany.id, "?categories=Expenses")
                .subscribe(function (chartOfAccounts) {
                _this.filterChartOfAccounts(chartOfAccounts);
            }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (!_this.showFlyout) {
                _this.routeToToolsPage();
            }
            else {
                _this.hideFlyout();
            }
        });
    }
    ExpensesCodesComponent.prototype.ngOnDestroy = function () {
        this.confirmSubscription.unsubscribe();
        this.routeSubscribe.unsubscribe();
    };
    ExpensesCodesComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.row = {};
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    ExpensesCodesComponent.prototype.filterChartOfAccounts = function (chartOfAccounts) {
        var _this = this;
        this.allCOAList = chartOfAccounts;
        this.chartOfAccountsArr = _.filter(chartOfAccounts, function (coa) {
            return coa.type != '';
        });
        _.sortBy(this.chartOfAccountsArr, ['number', 'name']);
        this.expensesSerice.getAllExpenses(this.currentCompany.id)
            .subscribe(function (expenseCodes) { return _this.buildTableData(expenseCodes); }, function (error) { return _this.handleError(error); });
    };
    ExpensesCodesComponent.prototype.showAddItemCode = function () {
        this.titleService.setPageTitle("CREATE EXPENSE CODE");
        this.editMode = false;
        this.expensesForm = this._fb.group(this._expensesForm.getForm());
        this.newForm();
        this.showFlyout = true;
    };
    ExpensesCodesComponent.prototype.showEditExpense = function (row) {
        this.titleService.setPageTitle("UPDATE EXPENSE CODE");
        var base = this;
        this.editMode = true;
        this.newForm();
        this.row = row;
        var selectedCOAIndex = _.findIndex(this.chartOfAccountsArr, function (coa) {
            return coa.id == row.coa_mapping_id;
        });
        setTimeout(function () {
            base.selectedCOAComboBox.setValue(base.chartOfAccountsArr[selectedCOAIndex], 'name');
        }, 0);
        this._expensesForm.updateForm(this.expensesForm, row);
        this.showFlyout = true;
    };
    ExpensesCodesComponent.prototype.deleteExpense = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.expensesSerice.removeExpense(this.currentCompany.id, this.itemCodeId)
            .subscribe(function (coa) {
            //   this.loadingService.triggerLoadingEvent(false);
            _this.expensesSerice.getAllExpenses(_this.currentCompany.id)
                .subscribe(function (expenseCodes) { return _this.buildTableData(expenseCodes); }, function (error) { return _this.handleError(error); });
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Expense code deleted successfully");
        }, function (error) { return _this.handleError(error); });
    };
    ExpensesCodesComponent.prototype.removeExpense = function (row) {
        this.itemCodeId = row.id;
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    ExpensesCodesComponent.prototype.newForm = function () {
        var _this = this;
        this.newFormActive = false;
        setTimeout(function () { return _this.newFormActive = true; }, 0);
    };
    ExpensesCodesComponent.prototype.updateExpenseCOA = function (selectedCOA) {
        var data = this._expensesForm.getData(this.expensesForm);
        if (selectedCOA && selectedCOA.id) {
            data.coa_mapping_id = selectedCOA.id;
        }
        else if (!selectedCOA || selectedCOA == '--None--') {
            data.coa_mapping_id = '--None--';
        }
        this._expensesForm.updateForm(this.expensesForm, data);
    };
    ExpensesCodesComponent.prototype.ngOnInit = function () {
    };
    ExpensesCodesComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditExpense($event);
        }
        else if (action == 'delete') {
            this.removeExpense($event);
        }
    };
    ExpensesCodesComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._expensesForm.getData(this.expensesForm);
        if (data.coa_mapping_id == '--None--' || data.coa_mapping_id == '') {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select Expense COA");
            return;
        }
        this.loadingService.triggerLoadingEvent(true);
        if (this.editMode) {
            data.id = this.row.id;
            data.companyID = this.currentCompany.id;
            this.expensesSerice.updateExpense(data, this.currentCompany.id)
                .subscribe(function (itemCode) {
                base.loadingService.triggerLoadingEvent(false);
                base.row = {};
                base.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Expense updated successfully");
                var index = _.findIndex(base.expenses, { id: data.id });
                base.expenses[index] = itemCode;
                base.buildTableData(base.expenses);
                _this.showFlyout = false;
            }, function (error) { return _this.handleError(error); });
        }
        else {
            //data.companyID = this.currentCompany.id;
            this.expensesSerice.addExpense(data, this.currentCompany.id)
                .subscribe(function (newItemcode) {
                // this.loadingService.triggerLoadingEvent(false);
                _this.handleExpense(newItemcode);
                _this.showFlyout = false;
            }, function (error) { return _this.handleError(error); });
        }
        //this.buildTableData(this.expenses);
    };
    ExpensesCodesComponent.prototype.handleExpense = function (expense) {
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Expense created successfully");
        this.expenses.push(expense);
        this.buildTableData(this.expenses);
    };
    ExpensesCodesComponent.prototype.buildTableData = function (expenses) {
        this.hasItemCodes = false;
        this.expenses = expenses;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "desc", "title": "Description" },
            { "name": "selectedCOAName", "title": "COA" },
            { "name": "coa_mapping_id", "title": "COA id", "visible": false },
            { "name": "companyID", "title": "Company ID", "visible": false },
            { "name": "id", "title": "Id", "visible": false },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        expenses.forEach(function (expense) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                if (key == 'coa_mapping_id') {
                    row['selectedCOAName'] = base.getCOAName(expense[key]);
                    row[key] = expense[key];
                }
                else {
                    row[key] = expense[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasItemCodes = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    ExpensesCodesComponent.prototype.getCOAName = function (coaId) {
        var coa = _.find(this.allCOAList, function (coa) {
            return coa.id == coaId;
        });
        if (coa) {
            return coa.name;
        }
        return "";
    };
    ExpensesCodesComponent.prototype.routeToToolsPage = function () {
        var link = [Session_1.Session.getLastVisitedUrl()];
        this._router.navigate(link);
    };
    ExpensesCodesComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Expense Codes");
        this.row = {};
        this.showFlyout = false;
    };
    return ExpensesCodesComponent;
}());
__decorate([
    core_1.ViewChild('addItemcode'),
    __metadata("design:type", Object)
], ExpensesCodesComponent.prototype, "addItemcode", void 0);
__decorate([
    core_1.ViewChild('selectedCOAComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], ExpensesCodesComponent.prototype, "selectedCOAComboBox", void 0);
ExpensesCodesComponent = __decorate([
    core_1.Component({
        selector: 'expense-codes',
        templateUrl: '/app/views/expensecode.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, ExpenseCodes_form_1.ExpenseCodesForm, SwitchBoard_1.SwitchBoard,
        CodesService_service_1.CodesService, Toast_service_1.ToastService, router_1.Router,
        ChartOfAccounts_service_1.ChartOfAccountsService, ExpenseCodes_service_1.ExpensesService,
        Companies_service_1.CompaniesService, LoadingService_1.LoadingService, PageTitle_1.pageTitleService])
], ExpensesCodesComponent);
exports.ExpensesCodesComponent = ExpensesCodesComponent;
