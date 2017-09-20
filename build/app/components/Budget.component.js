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
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var Budget_service_1 = require("qCommon/app/services/Budget.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Budget_form_1 = require("../forms/Budget.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var Date_constants_1 = require("qCommon/app/constants/Date.constants");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var router_1 = require("@angular/router");
var Date_constants_2 = require("qCommon/app/constants/Date.constants");
var BudgetComponent = (function () {
    function BudgetComponent(_fb, _budgetForm, switchBoard, _router, budgetService, toastService, loadingService, coaService, numeralService, _budgetItemForm, titleService) {
        var _this = this;
        this._fb = _fb;
        this._budgetForm = _budgetForm;
        this.switchBoard = switchBoard;
        this._router = _router;
        this.budgetService = budgetService;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.coaService = coaService;
        this.numeralService = numeralService;
        this._budgetItemForm = _budgetItemForm;
        this.titleService = titleService;
        this.budgetList = [];
        this.newFormActive = true;
        this.hasBudget = false;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.tableColumns = ['name', 'id', 'total', 'grossProfit', 'netProfit'];
        this.combo = true;
        this.allCOAList = [];
        this.showFlyout = false;
        this.localeFortmat = 'en-US';
        this.chartOfAccounts = [];
        this.revenueCOA = [];
        this.cogsCOA = [];
        this.expenseCOA = [];
        this.itemActive = false;
        this.orderedMonths = [];
        this.incomeTotal = 0;
        this.cogsTotal = 0;
        this.expenseTotal = 0;
        this.years = Date_constants_2.YEARS;
        this.budgetYears = Date_constants_2.BUDGET_YEARS;
        this.isSingleFisicalYear = false;
        /*This will just update line details in VIEW*/
        this.lineItemNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'total'];
        // this.budgetForm = this._fb.group(_budgetForm.getForm());
        this.titleService.setPageTitle("Budget");
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteBudgetCode(toast); });
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.currentCompany = Session_1.Session.getCurrentCompany();
        this.calculateMonthsOrder();
        if (Session_1.Session.getFiscalStartDate()) {
            var momentdate = moment(Session_1.Session.getFiscalStartDate(), 'MM/DD/YYYY');
            if (momentdate.month() == 0 && momentdate.date() == 1) {
                this.isSingleFisicalYear = true;
            }
        }
        this.loadingService.triggerLoadingEvent(true);
        this.loadBudgets();
        this.coaService.chartOfAccounts(this.currentCompany)
            .subscribe(function (chartOfAccounts) {
            _this.chartOfAccounts = chartOfAccounts;
            _this.revenueCOA = _.filter(chartOfAccounts, { 'category': 'Revenue' });
            _.sortBy(_this.revenueCOA, ['name']);
            _this.expenseCOA = _.filter(chartOfAccounts, function (coa) {
                return coa.category == 'Expenses' && coa.type != 'costOfGoodsSold';
            });
            _this.expenseCOA = _.sortBy(_this.expenseCOA, ['name']);
            _.filter(chartOfAccounts, { 'category': 'Expenses' });
            _this.cogsCOA = _.filter(chartOfAccounts, { 'type': 'costOfGoodsSold' });
            _this.cogsCOA = _.sortBy(_this.cogsCOA, ['name']);
        }, function (error) {
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.itemActive) {
                _this.hideFlyout();
            }
            else if (_this.showFlyout) {
                _this.closeFlyout();
            }
            else {
                _this.toolsRedirect();
            }
        });
    }
    BudgetComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    BudgetComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    BudgetComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    BudgetComponent.prototype.filterChartOfAccounts = function (chartOfAccounts) {
        this.allCOAList = chartOfAccounts;
    };
    BudgetComponent.prototype.loadBudgets = function () {
        var _this = this;
        this.budgetService.budget(this.currentCompany)
            .subscribe(function (budget) {
            _this.budgetList = budget;
            _this.buildTableData(_this.budgetList);
        }, function (error) { return _this.handleError(error); });
    };
    BudgetComponent.prototype.showAddBudget = function () {
        this.titleService.setPageTitle("CREATE BUDGET");
        this.editMode = false;
        this.newForm();
        var budget = {};
        var base = this;
        var revenueItemsControl = this.budgetForm.controls['income'];
        _.each(this.revenueCOA, function (item) {
            item.coaID = item.id;
            revenueItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(item)));
        });
        var cogsItemsControl = this.budgetForm.controls['costOfGoodsSold'];
        _.each(this.cogsCOA, function (item) {
            item.coaID = item.id;
            cogsItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(item)));
        });
        var expenseItemsControl = this.budgetForm.controls['expenses'];
        _.each(this.expenseCOA, function (item) {
            item.coaID = item.id;
            expenseItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(item)));
        });
        this._budgetForm.updateForm(this.budgetForm, budget);
        this.showFlyout = true;
    };
    BudgetComponent.prototype.showEditBudget = function (row) {
        var _this = this;
        this.titleService.setPageTitle("UPDATE BUDGET");
        this.loadingService.triggerLoadingEvent(true);
        this.budgetService.getBudget(row.id, this.currentCompany)
            .subscribe(function (budget) {
            _this.processBudget(budget);
        }, function (error) { return _this.handleError(error); });
    };
    BudgetComponent.prototype.processBudget = function (budget) {
        this.editMode = true;
        this.newForm();
        var base = this;
        var revenueItemsControl = this.budgetForm.controls['income'];
        _.each(budget.budget.income, function (revenueItem) {
            base.incomeTotal = base.incomeTotal + revenueItem.total;
            revenueItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(revenueItem)));
        });
        var cogsItemsControl = this.budgetForm.controls['costOfGoodsSold'];
        _.each(budget.budget.costOfGoodsSold, function (cogsItem) {
            base.cogsTotal = base.cogsTotal + cogsItem.total;
            cogsItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(cogsItem)));
        });
        var expenseItemsControl = this.budgetForm.controls['expenses'];
        _.each(budget.budget.expenses, function (expenseItem) {
            base.expenseTotal = base.expenseTotal + expenseItem.total;
            expenseItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(expenseItem)));
        });
        this._budgetForm.updateForm(this.budgetForm, budget);
        this.showFlyout = true;
        this.loadingService.triggerLoadingEvent(false);
    };
    BudgetComponent.prototype.deleteBudgetCode = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        var base = this;
        this.budgetService.removeBudget(this.budgetId, this.currentCompany)
            .subscribe(function (budget) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Budget deleted successfully");
            _.remove(_this.budgetList, function (budget) {
                return budget.id == base.budgetId;
            });
            _this.buildTableData(_this.budgetList);
        }, function (error) { return _this.handleError(error); });
    };
    BudgetComponent.prototype.removeBudget = function (row) {
        this.budgetId = row.id;
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    BudgetComponent.prototype.newForm = function () {
        var _this = this;
        this.newFormActive = false;
        setTimeout(function () { return _this.newFormActive = true; }, 0);
    };
    BudgetComponent.prototype.ngOnInit = function () {
        var _form = this._budgetForm.getForm();
        _form['income'] = new forms_1.FormArray([]);
        _form['costOfGoodsSold'] = new forms_1.FormArray([]);
        _form['expenses'] = new forms_1.FormArray([]);
        //this.expenseItemsArray;
        this.budgetForm = this._fb.group(_form);
    };
    BudgetComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditBudget($event);
        }
        else if (action == 'delete') {
            this.removeBudget($event);
        }
    };
    BudgetComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._budgetForm.getData(this.budgetForm);
        var budget = {
            income: this.getBudgetItemData(this.budgetForm.controls['income']),
            costOfGoodsSold: this.getBudgetItemData(this.budgetForm.controls['costOfGoodsSold']),
            expenses: this.getBudgetItemData(this.budgetForm.controls['expenses'])
        };
        data['budget'] = budget;
        this.loadingService.triggerLoadingEvent(true);
        /*if(data.frequency=='yearly'){
         data.startDate=Session.getFiscalStartDate();
         }*/
        data.netProfit = this.incomeTotal - (this.cogsTotal + this.expenseTotal);
        data.grossProfit = this.incomeTotal - this.cogsTotal;
        delete data.income;
        delete data.costOfGoodsSold;
        delete data.expenses;
        if (this.editMode) {
            this.budgetService.updateBudget(data, this.currentCompany)
                .subscribe(function (budget) {
                base.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Budget updated successfully");
                _this.loadBudgets();
                _this.showFlyout = false;
                _this.resetForm();
            }, function (error) { return _this.handleError(error); });
        }
        else {
            this.budgetService.addBudget(data, this.currentCompany)
                .subscribe(function (newBudget) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Budget created successfully");
                _this.showFlyout = false;
                _this.loadBudgets();
                _this.resetForm();
            }, function (error) { return _this.handleError(error); });
        }
    };
    BudgetComponent.prototype.buildTableData = function (budgetList) {
        this.hasBudget = false;
        this.budgetList = budgetList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "grossProfit", "title": "Gross Profit", "sortValue": function (value) {
                    return base.numeralService.value(value);
                } },
            { "name": "netProfit", "title": "Net Profit", "sortValue": function (value) {
                    return base.numeralService.value(value);
                } },
            { "name": "id", "title": "Id", "visible": false },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        budgetList.forEach(function (budget) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                row[key] = budget[key];
                if (key == 'grossProfit') {
                    if (budget[key]) {
                        var total = parseFloat(budget[key]);
                        row['grossProfit'] = total.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session_1.Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                    else {
                        var total = 0.00;
                        row['grossProfit'] = total.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session_1.Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                }
                else if (key == 'netProfit') {
                    if (budget[key]) {
                        var total = parseFloat(budget[key]);
                        row['netProfit'] = total.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session_1.Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                    else {
                        var total = 0.00;
                        row['netProfit'] = total.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session_1.Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasBudget = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    BudgetComponent.prototype.closeFlyout = function () {
        this.showFlyout = !this.showFlyout;
        this.resetForm();
    };
    BudgetComponent.prototype.resetForm = function () {
        var _form = this._budgetForm.getForm();
        _form['income'] = new forms_1.FormArray([]);
        _form['costOfGoodsSold'] = new forms_1.FormArray([]);
        _form['expenses'] = new forms_1.FormArray([]);
        this.budgetForm = this._fb.group(_form);
        this.cogsTotal = 0;
        this.incomeTotal = 0;
        this.expenseTotal = 0;
    };
    BudgetComponent.prototype.setStartDate = function (date) {
        var data = this._budgetForm.getData(this.budgetForm);
        data.startDate = date;
        this._budgetForm.updateForm(this.budgetForm, data);
    };
    /*---------------------------------------------budget changes-------------------------------*/
    BudgetComponent.prototype.addDefaultLine = function (count) {
        var linesControl = this.budgetForm.controls['income'];
        var cogsLinesControl = this.budgetForm.controls['costOfGoodsSold'];
        var expenseLinesControl = this.budgetForm.controls['expenses'];
        for (var i = 0; i < count; i++) {
            var lineForm = this._fb.group(this._budgetItemForm.getForm());
            linesControl.controls.push(lineForm);
        }
        for (var i = 0; i < count; i++) {
            var lineForm = this._fb.group(this._budgetItemForm.getForm());
            cogsLinesControl.controls.push(lineForm);
        }
        for (var i = 0; i < count; i++) {
            var lineForm = this._fb.group(this._budgetItemForm.getForm());
            expenseLinesControl.controls.push(lineForm);
        }
    };
    BudgetComponent.prototype.resetAllLinesFromEditing = function (linesControl) {
        _.each(linesControl.controls, function (lineControl) {
            lineControl.editable = false;
        });
    };
    BudgetComponent.prototype.getLastActiveLineIndex = function (linesControl) {
        var result = false;
        _.each(linesControl.controls, function (lineControl, index) {
            if (!lineControl.controls['destroy'].value) {
                result = index;
            }
        });
        return result;
    };
    BudgetComponent.prototype.editItem = function (index, itemForm, type) {
        this.resetAllLinesFromEditing(this.budgetForm.controls['income']);
        this.resetAllLinesFromEditing(this.budgetForm.controls['costOfGoodsSold']);
        this.resetAllLinesFromEditing(this.budgetForm.controls['expenses']);
        itemForm.editable = !itemForm.editable;
    };
    BudgetComponent.prototype.getCOAName = function (chartOfAccountId) {
        var coa = _.find(this.chartOfAccounts, { 'id': chartOfAccountId });
        return coa ? coa.name : '';
    };
    BudgetComponent.prototype.getBudgetItemData = function (expenseForm) {
        var base = this;
        var data = [];
        _.each(expenseForm.controls, function (expenseItemControl) {
            var itemData = base._budgetItemForm.getData(expenseItemControl);
            for (var i = 0; i < base.lineItemNames.length; i++) {
                var val = base.lineItemNames[i];
                itemData[val] = base.roundOffValue(itemData[val]);
            }
            data.push(itemData);
        });
        return data;
    };
    BudgetComponent.prototype.editBudgetCoaLine = function ($event, index, type) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        var base = this, data, itemsControl;
        this.selectedGroup = type;
        this.itemActive = true;
        this.dimensionFlyoutCSS = "expanded";
        if (type == 'income') {
            itemsControl = this.budgetForm.controls['income'];
            data = this._budgetItemForm.getData(itemsControl.controls[index]);
        }
        else if (type == 'costOfGoodsSold') {
            itemsControl = this.budgetForm.controls['costOfGoodsSold'];
            data = this._budgetItemForm.getData(itemsControl.controls[index]);
        }
        else if (type == 'expenses') {
            itemsControl = this.budgetForm.controls['expenses'];
            data = this._budgetItemForm.getData(itemsControl.controls[index]);
        }
        this.resetAllLinesFromEditing(itemsControl);
        this.editItemForm = this._fb.group(this._budgetItemForm.getForm(data));
        this.editItemIndex = index;
    };
    BudgetComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Budget");
        this.dimensionFlyoutCSS = "collapsed";
        this.itemActive = false;
        this.editItemIndex = null;
    };
    /*When user clicks on save button in the flyout*/
    BudgetComponent.prototype.saveItem = function () {
        var itemData = this._budgetItemForm.getData(this.editItemForm);
        this.updateLineInView(itemData);
        this.hideFlyout();
    };
    BudgetComponent.prototype.updateLineInView = function (item) {
        var itemsControl;
        if (this.selectedGroup == 'income') {
            itemsControl = this.budgetForm.controls['income'];
        }
        else if (this.selectedGroup == 'costOfGoodsSold') {
            itemsControl = this.budgetForm.controls['costOfGoodsSold'];
        }
        else if (this.selectedGroup == 'expenses') {
            itemsControl = this.budgetForm.controls['expenses'];
        }
        var itemControl = itemsControl.controls[this.editItemIndex];
        for (var i = 0; i < this.lineItemNames.length; i++) {
            var val = this.lineItemNames[i];
            itemControl.controls[val].patchValue(item[val]);
            if (val == 'total') {
                this.updateTotals(item[val], this.selectedGroup);
            }
        }
    };
    BudgetComponent.prototype.updateTotalAmount = function (val, form, type) {
        var total = 0;
        for (var i = 0; i < this.lineItemNames.length - 1; i++) {
            var val = this.lineItemNames[i];
            total = total + this.checkNumber(form.controls[val].value);
        }
        form.controls['total'].patchValue(total);
        this.updateTotals(total, type);
    };
    BudgetComponent.prototype.updateBudgetLineAmount = function (val, form, type) {
        var total = this.checkNumber(form.controls['total'].value);
        if (total) {
            var avgVal = Math.round((total / 12) * 100) / 100;
            for (var i = 0; i < this.lineItemNames.length - 1; i++) {
                var val = this.lineItemNames[i];
                form.controls[val].patchValue(avgVal);
            }
            this.updateTotals(total, type);
        }
    };
    BudgetComponent.prototype.updateTotals = function (total, type) {
        var total = 0;
        if (type) {
            var formControls = this.budgetForm.controls[type]['controls'];
            for (var i = 0; i < formControls.length; i++) {
                total = total + Number(formControls[i].controls.total.value);
            }
        }
        if (type == 'income') {
            this.incomeTotal = total;
        }
        else if (type == 'costOfGoodsSold') {
            this.cogsTotal = total;
        }
        else {
            this.expenseTotal = total;
        }
    };
    BudgetComponent.prototype.duplicateAll = function (form) {
        var janValue = this.checkNumber(form.controls['jan'].value);
        if (janValue) {
            for (var i = 0; i < this.lineItemNames.length - 1; i++) {
                var val = this.lineItemNames[i];
                form.controls[val].patchValue(janValue);
            }
            this.updateTotalAmount(null, form, this.selectedGroup);
        }
        else {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please fill Jan month for duplication");
        }
    };
    BudgetComponent.prototype.checkNumber = function (val) {
        if ((val || val == 0) && !isNaN(val)) {
            var _val = parseFloat(val);
            return this.roundOffValue(_val);
        }
        return null;
    };
    BudgetComponent.prototype.calculateMonthsOrder = function () {
        var allMonths = Date_constants_1.MONTHS_NAMES;
        if (Session_1.Session.getFiscalStartDate()) {
            var today = new Date(Session_1.Session.getFiscalStartDate());
            var monthIndex = today.getMonth();
            var i;
            for (i = 0; i < 12; i++) {
                this.orderedMonths.push(allMonths[monthIndex]);
                monthIndex++;
                if (monthIndex > 11) {
                    monthIndex = 0;
                }
            }
        }
        else {
            this.orderedMonths = Date_constants_1.MONTHS_NAMES;
        }
        this.orderedMonths.push('total');
    };
    BudgetComponent.prototype.roundOffValue = function (num) {
        return Math.round(num * 100) / 100;
    };
    return BudgetComponent;
}());
__decorate([
    core_1.ViewChild('list'),
    __metadata("design:type", core_1.ElementRef)
], BudgetComponent.prototype, "el", void 0);
BudgetComponent = __decorate([
    core_1.Component({
        selector: 'budgetdetails',
        templateUrl: '/app/views/budget.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, Budget_form_1.BudgetForm, SwitchBoard_1.SwitchBoard, router_1.Router,
        Budget_service_1.BudgetService, Toast_service_1.ToastService, LoadingService_1.LoadingService,
        ChartOfAccounts_service_1.ChartOfAccountsService, Numeral_service_1.NumeralService, Budget_form_1.BudgetItemForm, PageTitle_1.pageTitleService])
], BudgetComponent);
exports.BudgetComponent = BudgetComponent;
