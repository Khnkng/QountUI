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
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var Expenses_form_1 = require("../forms/Expenses.form");
var FinancialAccounts_service_1 = require("qCommon/app/services/FinancialAccounts.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Expense_service_1 = require("qCommon/app/services/Expense.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var DimensionService_service_1 = require("qCommon/app/services/DimensionService.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var Employees_service_1 = require("qCommon/app/services/Employees.service");
var Payments_service_1 = require("qCommon/app/services/Payments.service");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var StateService_1 = require("qCommon/app/services/StateService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var ExpenseComponent = (function () {
    function ExpenseComponent(_fb, _route, _router, _expenseForm, _expenseItemForm, accountsService, coaService, vendorService, expenseService, toastService, loadingService, dimensionService, customerService, employeeService, paymentsService, dateFormater, stateService, titleService, _switchBoard) {
        var _this = this;
        this._fb = _fb;
        this._route = _route;
        this._router = _router;
        this._expenseForm = _expenseForm;
        this._expenseItemForm = _expenseItemForm;
        this.accountsService = accountsService;
        this.coaService = coaService;
        this.vendorService = vendorService;
        this.expenseService = expenseService;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.dimensionService = dimensionService;
        this.customerService = customerService;
        this.employeeService = employeeService;
        this.paymentsService = paymentsService;
        this.dateFormater = dateFormater;
        this.stateService = stateService;
        this.titleService = titleService;
        this.newExpense = false;
        this.accounts = [];
        this.vendors = [];
        this.chartOfAccounts = [];
        this.isExpensePaid = false;
        this.addNewItemFlag = false;
        this.editingItems = {};
        this.itemActive = false;
        this.dimensions = [];
        this.selectedDimensions = [];
        this.stayFlyout = false;
        this.entities = [];
        this.tableColumns = ['groupID', 'title', 'amount', 'date', 'journalID', 'vendorName'];
        this.mappings = [];
        this.hasMappings = false;
        this.tableData = {};
        this.tableOptions = {};
        this.validateLockDate = false;
        this.lineTotal = 0;
        this.currentCompanyId = Session_1.Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.expenseID = params['expenseID'];
            if (!_this.expenseID) {
                _this.newExpense = true;
                _this.defaultDate = moment(new Date()).format(_this.dateFormat);
            }
        });
        this.accountsService.financialAccounts(this.currentCompanyId)
            .subscribe(function (accounts) {
            _this.accounts = accounts.accounts;
            _this.loadExpense();
        }, function (error) {
        });
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.itemActive) {
                _this.hideFlyout();
            }
            else if (_this.mappingFlyoutCSS == "expanded") {
                _this.hideMappingPage();
            }
            else {
                _this.showExpensesPage();
            }
        });
    }
    ExpenseComponent.prototype.showMappingPage = function () {
        var _this = this;
        if (this.selectedMappingID) {
            var link = ['/payments', this.selectedMappingID];
            this._router.navigate(link);
        }
        else {
            if (!this.bankAccountID) {
                this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select bank account.");
                return;
            }
            this.mappingFlyoutCSS = "expanded";
            this.titleService.setPageTitle("Payments");
            this.loadingService.triggerLoadingEvent(true);
            this.paymentsService.mappings(this.currentCompanyId, this.expenseType, "false", this.bankAccountID)
                .subscribe(function (mappings) {
                _this.buildTableData(mappings || []);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
    };
    ExpenseComponent.prototype.hideMappingPage = function () {
        this.mappingFlyoutCSS = "collapsed";
    };
    ExpenseComponent.prototype.showExpensesPage = function (bankID) {
        if (this.stayFlyout) {
            var base_1 = this;
            this.initialize();
            this.dimensionFlyoutCSS = "";
            this.mappingFlyoutCSS = "";
            this.selectedMappingID = null;
            var account_1 = _.find(this.accounts, { 'id': bankID });
            setTimeout(function () {
                base_1.accountComboBox.setValue(account_1, 'name');
            });
            this.setDueDate(this.defaultDate);
            this.setDefaultExpenseType();
        }
        else {
            var prevState = this.stateService.pop();
            if (prevState) {
                this._router.navigate([prevState.url]);
            }
            else {
                var link = ['books', 'expenses'];
                this._router.navigate(link);
            }
        }
    };
    ExpenseComponent.prototype.showFlyout = function ($event, index) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        var base = this;
        this.itemActive = true;
        this.dimensionFlyoutCSS = "expanded";
        var itemsControl = this.expenseForm.controls['expense_items'];
        var data = this._expenseItemForm.getData(itemsControl.controls[index]);
        var coa = _.find(this.chartOfAccounts, { 'id': data.chart_of_account_id });
        var entity = _.find(this.entities, { 'id': data.entity_id });
        this.selectedDimensions = data.dimensions;
        setTimeout(function () {
            base.editCOAComboBox.setValue(coa, 'displayName');
            base.editEntityComboBox.setValue(entity, 'name');
        });
        this.resetAllLinesFromEditing(itemsControl);
        this.editItemForm = this._fb.group(this._expenseItemForm.getForm(data));
        this.editItemIndex = index;
    };
    ExpenseComponent.prototype.hideFlyout = function () {
        this.dimensionFlyoutCSS = "collapsed";
        this.itemActive = false;
        this.editItemIndex = null;
        this.selectedDimensions = [];
    };
    ExpenseComponent.prototype.setCOAForEditingItem = function (chartOfAccount) {
        var data = this._expenseItemForm.getData(this.editItemForm);
        if (chartOfAccount && chartOfAccount.id) {
            data.chart_of_account_id = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            data.chart_of_account_id = '--None--';
        }
        this._expenseItemForm.updateForm(this.editItemForm, data);
    };
    ExpenseComponent.prototype.setEntityForEditingItem = function (entity) {
        var data = this._expenseItemForm.getData(this.editItemForm);
        if (entity && entity.id) {
            data.entity_id = entity.id;
        }
        this._expenseItemForm.updateForm(this.editItemForm, data);
    };
    /*This function will stop event bubbling to avoid default selection of first value in first dimension*/
    ExpenseComponent.prototype.doNothing = function ($event) {
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    };
    ExpenseComponent.prototype.setBankAccount = function (account) {
        var data = this._expenseForm.getData(this.expenseForm);
        if (account && account.id) {
            data.bank_account_id = account.id;
            this.bankAccountID = account.id;
        }
        else if (!account || account == '--None--') {
            data.bank_account_id = '--None--';
        }
        this._expenseForm.updateForm(this.expenseForm, data);
    };
    ExpenseComponent.prototype.togglePaidStatus = function () {
        var base = this;
        setTimeout(function () {
            base.isExpensePaid = Boolean(base.expenseForm.controls['is_paid'].value);
        }, 0);
    };
    ExpenseComponent.prototype.setPaidDate = function (date) {
        var data = this._expenseForm.getData(this.expenseForm);
        data.paid_date = date;
        this._expenseForm.updateForm(this.expenseForm, data);
    };
    ExpenseComponent.prototype.setDueDate = function (date) {
        var data = this._expenseForm.getData(this.expenseForm);
        data.due_date = date;
        this._expenseForm.updateForm(this.expenseForm, data);
    };
    ExpenseComponent.prototype.processExpense = function (expense) {
        var base = this;
        var itemsControl = this.expenseForm.controls['expense_items'];
        this.selectedMappingID = expense.mapping_id;
        expense.due_date = this.dateFormater.formatDate(expense.due_date, this.serviceDateformat, this.dateFormat);
        this.loadEntities(expense.expense_type);
        _.each(expense.expense_items, function (expenseItem) {
            expenseItem.amount = parseFloat(expenseItem.amount);
            itemsControl.controls.push(base._fb.group(base._expenseItemForm.getForm(expenseItem)));
        });
        var account = _.find(this.accounts, { 'id': expense.bank_account_id });
        setTimeout(function () {
            base.accountComboBox.setValue(account, 'name');
        });
        this._expenseForm.updateForm(this.expenseForm, expense);
        this.updateLineTotal();
        this.loadingService.triggerLoadingEvent(false);
    };
    ExpenseComponent.prototype.editItem = function (index, itemForm) {
        var linesControl = this.expenseForm.controls['expense_items'];
        var base = this;
        var itemData = this._expenseItemForm.getData(itemForm);
        //this.editingItems[index] = itemData;
        setTimeout(function () {
            jQuery('#coa-' + index).siblings().children('input').val(base.getCOAName(itemData.chart_of_account_id));
            jQuery('#entity-' + index).siblings().children('input').val(base.getEntityName(itemData.entity_id));
        });
        if (index == this.getLastActiveLineIndex(linesControl)) {
            this.addDefaultLine(1);
        }
        this.resetAllLinesFromEditing(linesControl);
        itemForm.editable = !itemForm.editable;
    };
    ExpenseComponent.prototype.handleKeyEvent = function (event, index, key) {
        var current_ele = jQuery(this.el.nativeElement).find("tr")[index].closest('tr');
        var focusedIndex;
        jQuery(current_ele).find("td input").each(function (id, field) {
            if (jQuery(field).is(':focus')) {
                focusedIndex = id;
            }
        });
        var base = this;
        var expenseLines = this.expenseForm.controls.expense_items;
        if (key === 'Arrow Down') {
            var nextIndex_1 = this.getNextElement(current_ele, index, 'Arrow Down');
            base.editItem(nextIndex_1, expenseLines.controls[nextIndex_1]);
            setTimeout(function () {
                var elem = jQuery(base.el.nativeElement).find("tr")[nextIndex_1];
                jQuery(elem).find("td input").each(function (id, field) {
                    if (id == focusedIndex) {
                        jQuery(field).focus();
                    }
                });
            });
        }
        else {
            var nextIndex_2 = this.getNextElement(current_ele, index, 'Arrow Up');
            base.editItem(nextIndex_2, expenseLines.controls[nextIndex_2]);
            setTimeout(function () {
                var elem = jQuery(base.el.nativeElement).find("tr")[nextIndex_2];
                jQuery(elem).find("td input").each(function (id, field) {
                    if (id == focusedIndex) {
                        jQuery(field).focus();
                    }
                });
            });
        }
    };
    ExpenseComponent.prototype.getNextElement = function (current_ele, curr_index, event) {
        var next_ele;
        if (event === 'Arrow Down') {
            next_ele = jQuery(current_ele).next('tr');
        }
        else {
            next_ele = jQuery(current_ele).prev('tr');
        }
        if (next_ele.length > 0) {
            if (next_ele[0].hidden) {
                return this.getNextElement(next_ele, next_ele[0].sectionRowIndex, event);
            }
            else {
                return next_ele[0].sectionRowIndex;
            }
        }
        else {
            return curr_index;
        }
    };
    ExpenseComponent.prototype.deleteItem = function ($event, index) {
        var base = this;
        $event && $event.stopImmediatePropagation();
        var itemsList = this.expenseForm.controls['expense_items'];
        var itemControl = itemsList.controls[index];
        itemControl.controls['destroy'].patchValue(true);
        setTimeout(function () {
            base.updateLineTotal();
            base.handleKeyEvent($event, index, 'Arrow Down');
        });
    };
    /*showNewItem(){
     this.addNewItemFlag = true;
     this.newItemForm = this._fb.group(this._expenseItemForm.getForm());
     let base=this;
     let account = _.find(this.chartOfAccounts, {'number': '699999'});
     setTimeout(function(){
     if(account)
     base.newCOAComboBox.setValue(account,'name');
     });
     }*/
    /*hideNewItem(){
     this.addNewItemFlag = false;
     }*/
    /*saveNewItem(){
     this.addNewItemFlag = !this.addNewItemFlag;
     let tempItemForm = _.cloneDeep(this.newItemForm);
     let itemsControl:any = this.expenseForm.controls['expense_items'];
     itemsControl.controls.push(tempItemForm);
     }*/
    /*setCOAForNewItem(chartOfAccount){
     let data = this._expenseItemForm.getData(this.newItemForm);
     if(chartOfAccount&&chartOfAccount.id){
     data.chart_of_account_id = chartOfAccount.id;
     }else if(!chartOfAccount||chartOfAccount=='--None--'){
     data.chart_of_account_id='--None--';
     }
     this._expenseItemForm.updateForm(this.newItemForm, data);
     }*/
    ExpenseComponent.prototype.setCOA = function (chartOfAccount, index) {
        var data = this._expenseItemForm.getData(this.expenseForm.controls[index]);
        if (chartOfAccount && chartOfAccount.id) {
            data.chart_of_account_id = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            data.chart_of_account_id = '--None--';
        }
        var tempForm = this._fb.group(this.expenseForm.controls[index]);
        this._expenseItemForm.updateForm(tempForm, data);
    };
    ExpenseComponent.prototype.setVendor = function (entity, index) {
        var data = this._expenseItemForm.getData(this.expenseForm.controls[index]);
        data.entity_id = entity.id;
        var tempForm = this._fb.group(this.expenseForm.controls[index]);
        this._expenseItemForm.updateForm(tempForm, data);
    };
    /*setEntityForNewItem(entity){
     let data = this._expenseItemForm.getData(this.newItemForm);
     data.entity_id = entity.id;
     this._expenseItemForm.updateForm(this.newItemForm, data);
     }*/
    ExpenseComponent.prototype.getCOAName = function (chartOfAccountId) {
        var coa = _.find(this.chartOfAccounts, { 'id': chartOfAccountId });
        return coa ? coa.displayName : '';
    };
    ExpenseComponent.prototype.getEntityName = function (vendorId) {
        var entity = _.find(this.entities, { 'id': vendorId });
        return entity ? entity.name : '';
    };
    ExpenseComponent.prototype.updateItem = function (index, itemForm) {
        var data = _.cloneDeep(this._expenseItemForm.getData(itemForm));
        var expenseItems = this.expenseForm.controls['expense_items'];
        var itemControl = expenseItems.controls[index];
        itemControl.controls['title'].patchValue(data.title);
        itemControl.controls['amount'].patchValue(data.amount);
        itemControl.controls['chart_of_account_id'].patchValue(data.chart_of_account_id);
        itemControl.controls['entity_id'].patchValue(data.entity_id);
        itemControl.controls['notes'].patchValue(data.notes);
        itemForm.editable = !itemForm.editable;
    };
    ExpenseComponent.prototype.toggleLine = function (index, itemForm) {
        itemForm.editable = !itemForm.editable;
        var tempForm = this._fb.group(this._expenseItemForm.getForm(this.editingItems[index]));
        this.updateItem(index, tempForm);
    };
    ExpenseComponent.prototype.setCOAForItem = function (chartOfAccount, itemForm) {
        var data = this._expenseItemForm.getData(itemForm);
        if (chartOfAccount && chartOfAccount.id) {
            data.chart_of_account_id = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            data.chart_of_account_id = '--None--';
        }
        this._expenseItemForm.updateForm(itemForm, data);
    };
    ExpenseComponent.prototype.setEntityForItem = function (entity, itemForm) {
        var data = this._expenseItemForm.getData(itemForm);
        if (entity && entity.id) {
            data.entity_id = entity.id;
        }
        else if (!entity || entity == '--None--') {
            data.entity_id = '--None--';
        }
        this._expenseItemForm.updateForm(itemForm, data);
    };
    ExpenseComponent.prototype.selectValue = function ($event, dimension, value) {
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        _.each(this.selectedDimensions, function (selectedDimension) {
            if (selectedDimension.name == dimension.name) {
                if (selectedDimension.values.indexOf(value) == -1) {
                    selectedDimension.values.push(value);
                }
                else {
                    selectedDimension.values.splice(selectedDimension.values.indexOf(value), 1);
                }
            }
        });
    };
    ExpenseComponent.prototype.isDimensionSelected = function (dimensionName) {
        var selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        return selectedDimensionNames.indexOf(dimensionName) != -1;
    };
    ExpenseComponent.prototype.isValueSelected = function (dimension, value) {
        var currentDimension = _.find(this.selectedDimensions, { 'name': dimension.name });
        if (!_.isEmpty(currentDimension)) {
            if (currentDimension.values.indexOf(value) != -1) {
                return true;
            }
            return false;
        }
        return false;
    };
    ExpenseComponent.prototype.selectDimension = function ($event, dimensionName) {
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        var selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        if (selectedDimensionNames.indexOf(dimensionName) == -1) {
            this.selectedDimensions.push({
                "name": dimensionName,
                "values": []
            });
        }
        else {
            this.selectedDimensions.splice(selectedDimensionNames.indexOf(dimensionName), 1);
        }
    };
    /*When user clicks on save button in the flyout*/
    ExpenseComponent.prototype.saveItem = function () {
        var dimensions = this.editItemForm.controls['dimensions'];
        dimensions.patchValue(this.selectedDimensions);
        var itemData = this._expenseItemForm.getData(this.editItemForm);
        this.updateLineInView(itemData);
        this.selectedDimensions = [];
        this.hideFlyout();
    };
    /*This will just update line details in VIEW*/
    ExpenseComponent.prototype.updateLineInView = function (item) {
        var itemsControl = this.expenseForm.controls['expense_items'];
        var itemControl = itemsControl.controls[this.editItemIndex];
        itemControl.controls['title'].patchValue(item.title);
        itemControl.controls['amount'].patchValue(item.amount);
        itemControl.controls['chart_of_account_id'].patchValue(item.chart_of_account_id);
        itemControl.controls['entity_id'].patchValue(item.entity_id);
        itemControl.controls['notes'].patchValue(item.notes);
        itemControl.controls['dimensions'].patchValue(item.dimensions);
    };
    ExpenseComponent.prototype.getExpenseItemData = function (expenseForm) {
        var base = this;
        var data = [];
        _.each(expenseForm.controls, function (expenseItemControl) {
            var itemData = base._expenseItemForm.getData(expenseItemControl);
            if (itemData.chart_of_account_id == '--None--' || itemData.chart_of_account_id == '') {
                itemData.chart_of_account_id = null;
            }
            if (itemData.entity_id == '--None--' || itemData.entity_id == '') {
                itemData.entity_id = null;
            }
            if (!base.newExpense) {
                data.push(itemData);
            }
            else if (!itemData.destroy) {
                data.push(itemData);
            }
        });
        return data;
    };
    ExpenseComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._expenseForm.getData(this.expenseForm);
        //data.expense_items = this.getExpenseItemData(this.expenseForm.controls['expense_items']);
        data.expense_items = this.getExpenseLineData(this.expenseForm);
        data.amount = this.roundOffValue(data.amount);
        this.updateExpenseLinesData(data);
        if (!this.validateData(data)) {
            return;
        }
        data.due_date = this.dateFormater.formatDate(data.due_date, this.dateFormat, this.serviceDateformat);
        if (this.newExpense) {
            this.loadingService.triggerLoadingEvent(true);
            this.expenseService.addExpense(data, this.currentCompanyId)
                .subscribe(function (response) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Expense Added successfully");
                _this.loadingService.triggerLoadingEvent(false);
                _this.showExpensesPage(data.bank_account_id);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                console.log("expense creation failed", error);
            });
        }
        else {
            this.tempData = data;
            this.checkLockDate();
        }
    };
    ExpenseComponent.prototype.updateExpenseDetails = function () {
        var _this = this;
        this.expenseService.updateExpense(this.tempData, this.currentCompanyId)
            .subscribe(function (response) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Expense Updated successfully");
            _this.showExpensesPage();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            console.log("updating expense failed", error);
        });
    };
    ExpenseComponent.prototype.ngOnInit = function () {
        this.initialize();
    };
    ExpenseComponent.prototype.ngOnDestroy = function () {
        jQuery('#expense-password-conformation').remove();
        this.routeSubscribe.unsubscribe();
    };
    ExpenseComponent.prototype.initialize = function () {
        var _this = this;
        var _form = this._expenseForm.getForm();
        _form['expense_items'] = new forms_1.FormArray([]); //this.expenseItemsArray;
        this.expenseForm = this._fb.group(_form);
        var _itemForm = this._expenseItemForm.getForm();
        this.newItemForm = this._fb.group(_itemForm);
        if (this.newExpense) {
            this.addDefaultLine(2);
        }
        this.currentCompanyId = Session_1.Session.getCurrentCompany();
        this.loadingService.triggerLoadingEvent(true);
        this.dimensionService.dimensions(this.currentCompanyId)
            .subscribe(function (dimensions) {
            _this.dimensions = dimensions;
        }, function (error) {
        });
        this.coaService.chartOfAccounts(this.currentCompanyId)
            .subscribe(function (chartOfAccounts) {
            _.forEach(chartOfAccounts, function (coa) {
                coa['displayName'] = coa.number + ' - ' + coa.name;
            });
            _this.chartOfAccounts = chartOfAccounts;
        }, function (error) {
        });
        if (this.stayFlyout) {
            this.loadingService.triggerLoadingEvent(false);
            this.stayFlyout = false;
        }
    };
    ExpenseComponent.prototype.selectExpenseType = function (type) {
        this.loadEntities(type);
        var expenseItems = this.expenseForm.controls['expense_items'];
        _.each(expenseItems.controls, function (expenseItem) {
            expenseItem.controls['entity_id'].patchValue('');
        });
    };
    ExpenseComponent.prototype.loadEntities = function (type) {
        var _this = this;
        this.entities = [];
        this.expenseType = type;
        if (type == 'bill') {
            this.vendorService.vendors(this.currentCompanyId)
                .subscribe(function (vendors) {
                _this.entities = vendors;
            }, function (error) {
            });
        }
        else if (type == 'payroll') {
            this.employeeService.employees(this.currentCompanyId)
                .subscribe(function (employees) {
                _.forEach(employees, function (employee) {
                    employee['name'] = employee.first_name + "" + employee.last_name;
                });
                _this.entities = employees;
            }, function (error) {
            });
        }
        else if (type == 'salesRefund') {
            this.customerService.customers(this.currentCompanyId)
                .subscribe(function (customers) {
                _.forEach(customers, function (customer) {
                    customer['id'] = customer.customer_id;
                    customer['name'] = customer.customer_name;
                });
                _this.entities = customers;
            }, function (error) {
            });
        }
        else if (type == 'other') {
        }
    };
    /*view changes*/
    ExpenseComponent.prototype.addDefaultLine = function (count) {
        var linesControl = this.expenseForm.controls['expense_items'];
        for (var i = 0; i < count; i++) {
            var lineForm = this._fb.group(this._expenseItemForm.getForm());
            linesControl.controls.push(lineForm);
        }
    };
    ExpenseComponent.prototype.getLineCount = function () {
        var linesControl = this.expenseForm.controls['expense_items'];
        var activeLines = [];
        _.each(linesControl.controls, function (lineControl) {
            if (!lineControl.controls['destroy'].value) {
                activeLines.push(lineControl);
            }
        });
        return activeLines.length;
    };
    ExpenseComponent.prototype.resetAllLinesFromEditing = function (linesControl) {
        _.each(linesControl.controls, function (lineControl) {
            lineControl.editable = false;
        });
    };
    ExpenseComponent.prototype.getLastActiveLineIndex = function (linesControl) {
        var result = false;
        _.each(linesControl.controls, function (lineControl, index) {
            if (!lineControl.controls['destroy'].value) {
                result = index;
            }
        });
        return result;
    };
    ExpenseComponent.prototype.getExpenseLineData = function (expenseForm) {
        var base = this;
        var data = [];
        var linesControl = expenseForm.controls['expense_items'];
        var defaultLine = this._expenseItemForm.getData(this._fb.group(this._expenseItemForm.getForm()));
        _.each(linesControl.controls, function (jeLineControl) {
            var lineData = base._expenseItemForm.getData(jeLineControl);
            if (!_.isEqual(lineData, defaultLine)) {
                if (!base.newExpense) {
                    if (lineData.amount) {
                        data.push(lineData);
                    }
                }
                else if (!lineData.destroy) {
                    if (lineData.amount) {
                        data.push(lineData);
                    }
                }
            }
        });
        return data;
    };
    ExpenseComponent.prototype.loadExpense = function () {
        var _this = this;
        if (!this.newExpense) {
            this.titleService.setPageTitle("UPDATE EXPENSE");
            this.expenseService.expense(this.expenseID, this.currentCompanyId)
                .subscribe(function (expense) {
                _this.processExpense(expense.expenses);
            }, function (error) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load expense details");
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
        else {
            this.titleService.setPageTitle("CREATE EXPENSE");
            this.setDueDate(this.defaultDate);
            this.setDefaultExpenseType();
            this.loadingService.triggerLoadingEvent(false);
        }
    };
    ExpenseComponent.prototype.setDefaultExpenseType = function () {
        var data = this._expenseForm.getData(this.expenseForm);
        data.expense_type = 'other';
        this._expenseForm.updateForm(this.expenseForm, data);
        this.loadEntities('other');
    };
    ExpenseComponent.prototype.buildTableData = function (mappings) {
        this.hasMappings = false;
        this.mappings = mappings;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.singleSelectable = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "groupID", "title": "Id", "visible": false, "filterable": false },
            { "name": "title", "title": "Payment Title" },
            { "name": "amount", "title": "Amount" },
            { "name": "date", "title": "Date" },
            { "name": "journalID", "title": "journalId", "visible": false, "filterable": false },
            { "name": "vendorName", "title": "Vendor" }
        ];
        var base = this;
        mappings.forEach(function (pyment) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                row[key] = pyment[key];
                if (key == 'amount') {
                    var amount = parseFloat(pyment[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasMappings = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    ExpenseComponent.prototype.handleSelect = function (event) {
        if (event && event[0])
            this.selectedMappingID = event[0]['groupID'];
    };
    ExpenseComponent.prototype.saveMappingID = function () {
        var data = this._expenseForm.getData(this.expenseForm);
        data.mapping_id = this.selectedMappingID;
        this._expenseForm.updateForm(this.expenseForm, data);
        this.mappingFlyoutCSS = "collapsed";
    };
    ExpenseComponent.prototype.validateData = function (data) {
        var base = this;
        var result = true;
        if (data.bank_account_id == "--None--" || data.bank_account_id == "") {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select valid bank account");
            return false;
        }
        if (data.amount <= 0) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Expense amount must be greater than zero.");
            return false;
        }
        var itemTotal = _.sumBy(data.expense_items, function (expense) {
            return expense.destroy ? 0 : expense.amount;
        });
        itemTotal = this.roundOffValue(itemTotal);
        if (itemTotal != data.amount) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Expense amount and Item total did not match.");
            return false;
        }
        return result;
    };
    ExpenseComponent.prototype.updateExpenseLinesData = function (data) {
        var base = this;
        _.each(data.expense_items, function (line) {
            if (line.chart_of_account_id == '--None--' || line.chart_of_account_id == '') {
                line.chart_of_account_id = null;
            }
            if (line.entity_id == '--None--' || line.entity_id == '') {
                line.entity_id = null;
            }
            if (line.amount) {
                line.amount = base.roundOffValue(line.amount);
            }
        });
    };
    ExpenseComponent.prototype.checkLockDate = function () {
        if (Session_1.Session.getLockDate()) {
            if (moment(Session_1.Session.getLockDate(), "MM/DD/YYYY").valueOf() > moment().valueOf()) {
                jQuery('#expense-password-conformation').foundation('open');
            }
            else {
                this.updateExpenseDetails();
            }
        }
        else {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please set company lock date");
        }
    };
    ExpenseComponent.prototype.validateLockKey = function () {
        var _this = this;
        var data = {
            "key": this.key
        };
        this.vendorService.validateLockKey(Session_1.Session.getCurrentCompany(), data).subscribe(function (res) {
            _this.validateLockDate = res.validation;
            if (res.validation) {
                _this.closePasswordConfirmation();
                _this.loadingService.triggerLoadingEvent(true);
                _this.updateExpenseDetails();
            }
            else {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invalid key");
            }
        }, function (fail) {
        });
    };
    ExpenseComponent.prototype.closePasswordConfirmation = function () {
        this.resetPasswordConformation();
        jQuery('#expense-password-conformation').foundation('close');
    };
    ExpenseComponent.prototype.checkValidation = function () {
        if (this.key)
            return true;
        else
            return false;
    };
    ExpenseComponent.prototype.resetPasswordConformation = function () {
        this.key = null;
    };
    ExpenseComponent.prototype.updateLineTotal = function () {
        var base = this;
        var expenseLineData = this.expenseForm.controls['expense_items'];
        this.lineTotal = 0;
        _.each(expenseLineData.controls, function (lineForm) {
            var line = base._expenseItemForm.getData(lineForm);
            if (!line.destroy) {
                base.lineTotal += line.amount ? base.roundOffValue(parseFloat(line.amount)) : 0;
            }
        });
    };
    ExpenseComponent.prototype.roundOffValue = function (num) {
        return Math.round(num * 100) / 100;
    };
    return ExpenseComponent;
}());
__decorate([
    core_1.ViewChild("accountComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], ExpenseComponent.prototype, "accountComboBox", void 0);
__decorate([
    core_1.ViewChild("editCOAComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], ExpenseComponent.prototype, "editCOAComboBox", void 0);
__decorate([
    core_1.ViewChild("editEntityComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], ExpenseComponent.prototype, "editEntityComboBox", void 0);
__decorate([
    core_1.ViewChild('list'),
    __metadata("design:type", core_1.ElementRef)
], ExpenseComponent.prototype, "el", void 0);
ExpenseComponent = __decorate([
    core_1.Component({
        selector: 'expense',
        templateUrl: '/app/views/expense.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.ActivatedRoute, router_1.Router, Expenses_form_1.ExpenseForm,
        Expenses_form_1.ExpenseItemForm, FinancialAccounts_service_1.FinancialAccountsService, ChartOfAccounts_service_1.ChartOfAccountsService,
        Companies_service_1.CompaniesService, Expense_service_1.ExpenseService, Toast_service_1.ToastService,
        LoadingService_1.LoadingService, DimensionService_service_1.DimensionService, Customers_service_1.CustomersService,
        Employees_service_1.EmployeeService, Payments_service_1.PaymentsService, DateFormatter_service_1.DateFormater,
        StateService_1.StateService, PageTitle_1.pageTitleService, SwitchBoard_1.SwitchBoard])
], ExpenseComponent);
exports.ExpenseComponent = ExpenseComponent;
