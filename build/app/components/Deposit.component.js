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
var Deposits_form_1 = require("../forms/Deposits.form");
var FinancialAccounts_service_1 = require("qCommon/app/services/FinancialAccounts.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var DimensionService_service_1 = require("qCommon/app/services/DimensionService.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var Deposit_service_1 = require("qCommon/app/services/Deposit.service");
var Invoices_service_1 = require("invoicesUI/app/services/Invoices.service");
var Payments_service_1 = require("qCommon/app/services/Payments.service");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var StateService_1 = require("qCommon/app/services/StateService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var DepositComponent = (function () {
    function DepositComponent(_fb, _route, _router, _depositForm, _depositLineForm, accountsService, coaService, depositService, toastService, loadingService, dimensionService, customersService, invoiceService, vendorService, paymentsService, dateFormater, stateService, titleService, _switchBoard) {
        var _this = this;
        this._fb = _fb;
        this._route = _route;
        this._router = _router;
        this._depositForm = _depositForm;
        this._depositLineForm = _depositLineForm;
        this.accountsService = accountsService;
        this.coaService = coaService;
        this.depositService = depositService;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.dimensionService = dimensionService;
        this.customersService = customersService;
        this.invoiceService = invoiceService;
        this.vendorService = vendorService;
        this.paymentsService = paymentsService;
        this.dateFormater = dateFormater;
        this.stateService = stateService;
        this.titleService = titleService;
        this.newDeposit = false;
        this.accounts = [];
        this.customers = [];
        this.invoices = [];
        this.chartOfAccounts = [];
        // addNewItemFlag:boolean = false;
        this.editingItems = {};
        this.itemActive = false;
        this.dimensions = [];
        this.selectedDimensions = [];
        this.stayFlyout = false;
        this.entities = [];
        this.validateLockDate = false;
        this.lineTotal = 0;
        this.currentCompanyId = Session_1.Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.depositID = params['depositID'];
            if (!_this.depositID) {
                _this.newDeposit = true;
                _this.defaultDate = moment(new Date()).format(_this.dateFormat);
            }
        });
        this.accountsService.financialAccounts(this.currentCompanyId)
            .subscribe(function (accounts) {
            _this.accounts = accounts.accounts;
            _this.loaddeposit();
        }, function (error) {
        });
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.itemActive) {
                _this.hideFlyout();
            }
            else {
                _this.showDepositsPage();
            }
        });
    }
    DepositComponent.prototype.showDepositsPage = function (bankID) {
        if (this.stayFlyout) {
            var base_1 = this;
            this.initialize();
            this.dimensionFlyoutCSS = "";
            var account_1 = _.find(this.accounts, { 'id': bankID });
            setTimeout(function () {
                base_1.accountComboBox.setValue(account_1, 'name');
            });
            this.setDueDate(this.defaultDate);
            this.setDefaultDepositType();
        }
        else {
            var prevState = this.stateService.pop();
            if (prevState) {
                this._router.navigate([prevState.url]);
            }
            else {
                var link = ['books', 'deposits'];
                this._router.navigate(link);
            }
        }
    };
    DepositComponent.prototype.showFlyout = function ($event, index) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        var base = this;
        this.itemActive = true;
        this.dimensionFlyoutCSS = "expanded";
        var itemsControl = this.depositForm.controls['payments'];
        var data = this._depositLineForm.getData(itemsControl.controls[index]);
        var coa = _.find(this.chartOfAccounts, { 'id': data.chart_of_account_id });
        var entity = _.find(this.entities, { 'id': data.entity_id });
        var invoice = _.find(this.invoices, { 'id': data.invoice_id });
        this.selectedDimensions = data.dimensions;
        setTimeout(function () {
            base.editCOAComboBox.setValue(coa, 'displayName');
            base.editEntityComboBox.setValue(entity, 'name');
            base.editInvoiceComboBox.setValue(invoice, 'po_number');
        });
        this.resetAllLinesFromEditing(itemsControl);
        this.editItemForm = this._fb.group(this._depositLineForm.getForm(data));
        this.editItemIndex = index;
    };
    DepositComponent.prototype.hideFlyout = function () {
        this.dimensionFlyoutCSS = "collapsed";
        this.itemActive = false;
        this.editItemIndex = null;
        this.selectedDimensions = [];
    };
    DepositComponent.prototype.setCOAForEditingItem = function (chartOfAccount) {
        var data = this._depositLineForm.getData(this.editItemForm);
        if (chartOfAccount && chartOfAccount.id) {
            data.chart_of_account_id = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            data.chart_of_account_id = '--None--';
        }
        this._depositLineForm.updateForm(this.editItemForm, data);
    };
    DepositComponent.prototype.setEntityForEditingItem = function (entity) {
        var data = this._depositLineForm.getData(this.editItemForm);
        if (entity && entity.id) {
            data.entity_id = entity.id;
        }
        else if (!entity || entity == '--None--') {
            data.entity_id = '--None--';
        }
        this._depositLineForm.updateForm(this.editItemForm, data);
    };
    DepositComponent.prototype.setInvoiceForEditingItem = function (invoice) {
        var data = this._depositLineForm.getData(this.editItemForm);
        if (invoice && invoice.id) {
            data.invoice_id = invoice.id;
        }
        else if (!invoice || invoice == '--None--') {
            data.invoice_id = '--None--';
        }
        this._depositLineForm.updateForm(this.editItemForm, data);
    };
    /*This function will stop event bubbling to avoid default selection of first value in first dimension*/
    DepositComponent.prototype.doNothing = function ($event) {
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    };
    DepositComponent.prototype.setBankAccount = function (account) {
        var data = this._depositForm.getData(this.depositForm);
        if (account && account.id) {
            data.bank_account_id = account.id;
        }
        else if (!account || account == '--None--') {
            data.bank_account_id = '--None--';
        }
        this._depositForm.updateForm(this.depositForm, data);
    };
    DepositComponent.prototype.setDueDate = function (date) {
        var data = this._depositForm.getData(this.depositForm);
        data.date = date;
        this._depositForm.updateForm(this.depositForm, data);
    };
    DepositComponent.prototype.processDeposits = function (deposits) {
        var base = this;
        var itemsControl = this.depositForm.controls['payments'];
        deposits.date = this.dateFormater.formatDate(deposits.date, this.serviceDateformat, this.dateFormat);
        this.loadEntities(deposits.deposit_type);
        _.each(deposits.payments, function (depositItem) {
            depositItem.amount = parseFloat(depositItem.amount);
            itemsControl.controls.push(base._fb.group(base._depositLineForm.getForm(depositItem)));
        });
        var account = _.find(this.accounts, { 'id': deposits.bank_account_id });
        setTimeout(function () {
            base.accountComboBox.setValue(account, 'name');
        });
        this._depositForm.updateForm(this.depositForm, deposits);
        this.updateLineTotal();
        this.loadingService.triggerLoadingEvent(false);
    };
    DepositComponent.prototype.editItem = function (index, itemForm) {
        var linesControl = this.depositForm.controls['payments'];
        var base = this;
        itemForm.editable = !itemForm.editable;
        var itemData = this._depositLineForm.getData(itemForm);
        setTimeout(function () {
            jQuery('#coa-' + index).siblings().children('input').val(base.getCOAName(itemData.chart_of_account_id));
            jQuery('#entity-' + index).siblings().children('input').val(base.getEntityName(itemData.entity_id));
            jQuery('#invoice-' + index).siblings().children('input').val(base.getInvoiceName(itemData.invoice_id));
        });
        if (index == this.getLastActiveLineIndex(linesControl)) {
            this.addDefaultLine(1);
        }
        this.resetAllLinesFromEditing(linesControl);
        itemForm.editable = !itemForm.editable;
    };
    DepositComponent.prototype.handleKeyEvent = function (event, index, key) {
        var current_ele = jQuery(this.el.nativeElement).find("tr")[index].closest('tr');
        var focusedIndex;
        jQuery(current_ele).find("td input").each(function (id, field) {
            if (jQuery(field).is(':focus')) {
                focusedIndex = id;
            }
        });
        var base = this;
        var depositLines = this.depositForm.controls.payments;
        if (key === 'Arrow Down') {
            var nextIndex_1 = this.getNextElement(current_ele, index, 'Arrow Down');
            base.editItem(nextIndex_1, depositLines.controls[nextIndex_1]);
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
            base.editItem(nextIndex_2, depositLines.controls[nextIndex_2]);
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
    DepositComponent.prototype.getNextElement = function (current_ele, curr_index, event) {
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
    DepositComponent.prototype.deleteItem = function ($event, index) {
        $event && $event.stopImmediatePropagation();
        var itemsList = this.depositForm.controls['payments'];
        var itemControl = itemsList.controls[index];
        itemControl.controls['destroy'].patchValue(true);
        var base = this;
        setTimeout(function () {
            base.updateLineTotal();
            base.handleKeyEvent($event, index, 'Arrow Down');
        });
    };
    /*showNewItem(){
     this.addNewItemFlag = true;
     this.newItemForm = this._fb.group(this._depositLineForm.getForm());
     let base=this;
     let account = _.find(this.chartOfAccounts, {'number': '499999'});
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
     let itemsControl:any = this.depositForm.controls['payments'];
     itemsControl.controls.push(tempItemForm);
     }*/
    /*setCOAForNewItem(chartOfAccount){
     let data = this._depositLineForm.getData(this.newItemForm);
     if(chartOfAccount && chartOfAccount.id){
     data.chart_of_account_id = chartOfAccount.id;
     }else if(!chartOfAccount||chartOfAccount=='--None--'){
     data.chart_of_account_id='--None--';
     }
     this._depositLineForm.updateForm(this.newItemForm, data);
     }

     setEntityForNewItem(entity){
     let data = this._depositLineForm.getData(this.newItemForm);
     if(entity && entity.id){
     data.entity_id = entity.id;
     }else if(!entity||entity=='--None--'){
     data.entity_id='--None--';
     }
     this._depositLineForm.updateForm(this.newItemForm, data);
     }

     setInvoiceForNewItem(invoice){
     let data = this._depositLineForm.getData(this.newItemForm);
     if(invoice && invoice.id){
     data.invoice_id = invoice.id;
     }else if(!invoice||invoice=='--None--'){
     data.invoice_id='--None--';
     }
     this._depositLineForm.updateForm(this.newItemForm, data);
     }*/
    DepositComponent.prototype.setCOA = function (chartOfAccount, index) {
        var data = this._depositLineForm.getData(this.depositForm.controls[index]);
        if (chartOfAccount && chartOfAccount.id) {
            data.chart_of_account_id = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            data.chart_of_account_id = '--None--';
        }
        var tempForm = this._fb.group(this.depositForm.controls[index]);
        this._depositLineForm.updateForm(tempForm, data);
    };
    DepositComponent.prototype.getCOAName = function (chartOfAccountId) {
        var coa = _.find(this.chartOfAccounts, { 'id': chartOfAccountId });
        return coa ? coa.displayName : '';
    };
    DepositComponent.prototype.getEntityName = function (entityId) {
        var entity = _.find(this.entities, { 'id': entityId });
        return entity ? entity.name : '';
    };
    DepositComponent.prototype.getInvoiceName = function (invoiceId) {
        var invoice = _.find(this.invoices, { 'id': invoiceId });
        return invoice ? invoice.po_number : '';
    };
    DepositComponent.prototype.updateItem = function (index, itemForm) {
        var data = _.cloneDeep(this._depositLineForm.getData(itemForm));
        var depositItems = this.depositForm.controls['payments'];
        var itemControl = depositItems.controls[index];
        itemControl.controls['title'].patchValue(data.title);
        itemControl.controls['amount'].patchValue(data.amount);
        itemControl.controls['chart_of_account_id'].patchValue(data.chart_of_account_id);
        itemControl.controls['entity_id'].patchValue(data.entity_id);
        itemControl.controls['invoice_id'].patchValue(data.invoice_id);
        itemControl.controls['notes'].patchValue(data.notes);
        itemForm.editable = !itemForm.editable;
    };
    DepositComponent.prototype.toggleLine = function (index, itemForm) {
        itemForm.editable = !itemForm.editable;
        var tempForm = this._fb.group(this._depositLineForm.getForm(this.editingItems[index]));
        this.updateItem(index, tempForm);
    };
    DepositComponent.prototype.setCOAForItem = function (chartOfAccount, itemForm) {
        var data = this._depositLineForm.getData(itemForm);
        if (chartOfAccount && chartOfAccount.id) {
            data.chart_of_account_id = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            data.chart_of_account_id = '--None--';
        }
        this._depositLineForm.updateForm(itemForm, data);
    };
    DepositComponent.prototype.setEntityForItem = function (entity, itemForm) {
        if (entity && entity.id) {
            var data = this._depositLineForm.getData(itemForm);
            data.entity_id = entity.id;
            this._depositLineForm.updateForm(itemForm, data);
        }
        else {
            var data = this._depositLineForm.getData(itemForm);
            data.entity_id = null;
            this._depositLineForm.updateForm(itemForm, data);
        }
    };
    DepositComponent.prototype.setInvoiceForItem = function (invoice, itemForm) {
        if (invoice && invoice.id) {
            var data = this._depositLineForm.getData(itemForm);
            data.invoice_id = invoice.id;
            this._depositLineForm.updateForm(itemForm, data);
        }
        else {
            var data = this._depositLineForm.getData(itemForm);
            data.invoice_id = null;
            this._depositLineForm.updateForm(itemForm, data);
        }
    };
    DepositComponent.prototype.selectValue = function ($event, dimension, value) {
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
    DepositComponent.prototype.isDimensionSelected = function (dimensionName) {
        var selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        return selectedDimensionNames.indexOf(dimensionName) != -1;
    };
    DepositComponent.prototype.isValueSelected = function (dimension, value) {
        var currentDimension = _.find(this.selectedDimensions, { 'name': dimension.name });
        if (!_.isEmpty(currentDimension)) {
            if (currentDimension.values.indexOf(value) != -1) {
                return true;
            }
            return false;
        }
        return false;
    };
    DepositComponent.prototype.selectDimension = function ($event, dimensionName) {
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
    DepositComponent.prototype.saveItem = function () {
        var dimensions = this.editItemForm.controls['dimensions'];
        dimensions.patchValue(this.selectedDimensions);
        var itemData = this._depositLineForm.getData(this.editItemForm);
        this.updateLineInView(itemData);
        this.selectedDimensions = [];
        this.hideFlyout();
    };
    /*This will just update line details in VIEW*/
    DepositComponent.prototype.updateLineInView = function (item) {
        var itemsControl = this.depositForm.controls['payments'];
        var itemControl = itemsControl.controls[this.editItemIndex];
        itemControl.controls['title'].patchValue(item.title);
        itemControl.controls['amount'].patchValue(item.amount);
        itemControl.controls['chart_of_account_id'].patchValue(item.chart_of_account_id);
        itemControl.controls['entity_id'].patchValue(item.entity_id);
        itemControl.controls['invoice_id'].patchValue(item.invoice_id);
        itemControl.controls['notes'].patchValue(item.notes);
        itemControl.controls['dimensions'].patchValue(item.dimensions);
    };
    DepositComponent.prototype.getDepositItemData = function (depositForm) {
        var base = this;
        var data = [];
        _.each(depositForm.controls, function (depositItemControl) {
            var itemData = base._depositLineForm.getData(depositItemControl);
            if (itemData.chart_of_account_id == '--None--' || itemData.chart_of_account_id == '') {
                itemData.chart_of_account_id = null;
            }
            if (itemData.entity_id == '--None--' || itemData.entity_id == '') {
                itemData.entity_id = null;
            }
            if (itemData.invoice_id == '--None--' || itemData.invoice_id == '') {
                itemData.invoice_id = null;
            }
            if (!base.newDeposit) {
                data.push(itemData);
            }
            else if (!itemData.destroy) {
                data.push(itemData);
            }
        });
        return data;
    };
    DepositComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._depositForm.getData(this.depositForm);
        // data.payments = this.getDepositItemData(this.depositForm.controls['payments']);
        data.payments = this.getDepositLineData(this.depositForm);
        data.amount = this.roundOffValue(data.amount);
        this.updateDepositLinesData(data);
        if (!this.validateData(data)) {
            return;
        }
        data.date = this.dateFormater.formatDate(data.date, this.dateFormat, this.serviceDateformat);
        if (this.newDeposit) {
            this.loadingService.triggerLoadingEvent(true);
            this.depositService.addDeposit(data, this.currentCompanyId)
                .subscribe(function (response) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Deposit Added successfully");
                _this.loadingService.triggerLoadingEvent(false);
                _this.showDepositsPage(data.bank_account_id);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                console.log("deposit creation failed", error);
            });
        }
        else {
            this.tempData = data;
            this.checkLockDate();
        }
    };
    DepositComponent.prototype.ngOnInit = function () {
        this.initialize();
    };
    DepositComponent.prototype.ngOnDestroy = function () {
        jQuery('#deposit-password-conformation').remove();
        this.routeSubscribe.unsubscribe();
    };
    DepositComponent.prototype.updateDepositDetails = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.depositService.updateDeposit(this.tempData, this.currentCompanyId)
            .subscribe(function (response) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Deposit Edited successfully");
            _this.loadingService.triggerLoadingEvent(false);
            _this.showDepositsPage();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            console.log("updating deposit failed", error);
        });
    };
    DepositComponent.prototype.initialize = function () {
        var _this = this;
        var _form = this._depositForm.getForm();
        _form['payments'] = new forms_1.FormArray([]); //this.depositItemsArray;
        this.depositForm = this._fb.group(_form);
        var _itemForm = this._depositLineForm.getForm();
        this.newItemForm = this._fb.group(_itemForm);
        if (this.newDeposit) {
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
        this.invoiceService.invoices()
            .subscribe(function (invoices) {
            _this.invoices = invoices.invoices || [];
        }, function (error) {
        });
        if (this.stayFlyout) {
            this.loadingService.triggerLoadingEvent(false);
            this.stayFlyout = false;
        }
    };
    DepositComponent.prototype.selectDepositType = function (type) {
        this.loadEntities(type);
        var depositItems = this.depositForm.controls['payments'];
        _.each(depositItems.controls, function (expenseItem) {
            expenseItem.controls['entity_id'].patchValue('');
        });
    };
    DepositComponent.prototype.loadEntities = function (type) {
        var _this = this;
        this.entities = [];
        // this.expenseType=type;
        if (type == 'expenseRefund') {
            this.vendorService.vendors(this.currentCompanyId)
                .subscribe(function (vendors) {
                _this.entities = vendors;
            }, function (error) {
            });
        }
        else if (type == 'invoice') {
            this.customersService.customers(this.currentCompanyId)
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
    DepositComponent.prototype.addDefaultLine = function (count) {
        var linesControl = this.depositForm.controls['payments'];
        for (var i = 0; i < count; i++) {
            var lineForm = this._fb.group(this._depositLineForm.getForm());
            linesControl.controls.push(lineForm);
        }
    };
    DepositComponent.prototype.getLineCount = function () {
        var linesControl = this.depositForm.controls['payments'];
        var activeLines = [];
        _.each(linesControl.controls, function (lineControl) {
            if (!lineControl.controls['destroy'].value) {
                activeLines.push(lineControl);
            }
        });
        return activeLines.length;
    };
    DepositComponent.prototype.resetAllLinesFromEditing = function (linesControl) {
        _.each(linesControl.controls, function (lineControl) {
            lineControl.editable = false;
        });
    };
    DepositComponent.prototype.getLastActiveLineIndex = function (linesControl) {
        var result = false;
        _.each(linesControl.controls, function (lineControl, index) {
            if (!lineControl.controls['destroy'].value) {
                result = index;
            }
        });
        return result;
    };
    DepositComponent.prototype.getDepositLineData = function (depositForm) {
        var base = this;
        var data = [];
        var linesControl = depositForm.controls['payments'];
        var defaultLine = this._depositLineForm.getData(this._fb.group(this._depositLineForm.getForm()));
        _.each(linesControl.controls, function (jeLineControl) {
            var lineData = base._depositLineForm.getData(jeLineControl);
            if (!_.isEqual(lineData, defaultLine)) {
                if (!base.newDeposit) {
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
    DepositComponent.prototype.loaddeposit = function () {
        var _this = this;
        if (!this.newDeposit) {
            this.titleService.setPageTitle("UPDATE DEPOSIT");
            this.depositService.deposit(this.depositID, this.currentCompanyId)
                .subscribe(function (deposit) {
                _this.processDeposits(deposit.deposit);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load deposit details");
            });
        }
        else {
            this.titleService.setPageTitle("CREATE DEPOSIT");
            this.setDueDate(this.defaultDate);
            this.setDefaultDepositType();
            this.loadingService.triggerLoadingEvent(false);
        }
    };
    DepositComponent.prototype.setDefaultDepositType = function () {
        var data = this._depositForm.getData(this.depositForm);
        data.deposit_type = 'other';
        this._depositForm.updateForm(this.depositForm, data);
        this.loadEntities('other');
    };
    DepositComponent.prototype.validateData = function (data) {
        var base = this;
        var result = true;
        if (data.bank_account_id == "--None--" || data.bank_account_id == "") {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select valid bank account");
            return false;
        }
        if (data.amount <= 0) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Deposit amount must be greater than zero.");
            return false;
        }
        var itemTotal = _.sumBy(data.payments, function (payment) {
            return payment.destroy ? 0 : payment.amount;
        });
        itemTotal = this.roundOffValue(itemTotal);
        if (itemTotal != data.amount) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Deposit amount and Item total did not match.");
            return false;
        }
        /*_.each(data.payments, function(line){
            if(!line.destroy){
                if(!line.chart_of_account_id){
                    base.toastService.pop(TOAST_TYPE.error, "Chat of Account is not selected for line");
                    result=false;
                    return false;
                }
            }
        });*/
        return result;
    };
    DepositComponent.prototype.updateDepositLinesData = function (data) {
        var base = this;
        _.each(data.payments, function (line) {
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
    /*mapping changes*/
    /*showMappingPage(){
     if(this.selectedMappingID){
     let link = ['/payments', this.selectedMappingID];
     this._router.navigate(link);
     }else {
     this.mappingFlyoutCSS="expanded";
     this.loadingService.triggerLoadingEvent(true);
     this.paymentsService.mappings(this.currentCompanyId,"bill","false")
     .subscribe(mappings => {
     let mappings=mappings?mappings:[];
     this.buildTableData(mappings);
     }, error => {
     this.loadingService.triggerLoadingEvent(false);
     });
     }
     }
     hideMappingPage(){
     this.mappingFlyoutCSS="collapsed";
     }

     buildTableData(mappings) {
     this.hasMappings = false;
     this.mappings = mappings;
     this.tableData.rows = [];
     this.tableOptions.search = true;
     this.tableOptions.singleSelectable = true;
     this.tableOptions.pageSize = 9;
     this.tableData.columns = [
     {"name": "groupID", "title": "Id","visible":false,"filterable": false},
     {"name": "title", "title": "Payment Title"},
     {"name": "amount", "title": "Amount"},
     {"name": "date", "title": "Date"},
     {"name": "journalID", "title": "journalId","visible":false,"filterable": false},
     {"name": "vendorName", "title": "Vendor"}
     ];
     let base = this;
     mappings.forEach(function(pyment) {
     let row:any = {};
     _.each(base.tableColumns, function(key) {
     row[key] = pyment[key];
     if(key == 'amount'){
     let amount = parseFloat(pyment[key]);
     row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
     }
     });
     base.tableData.rows.push(row);
     });
     setTimeout(function(){
     base.hasMappings = true;
     }, 0);
     this.loadingService.triggerLoadingEvent(false);
     }
     handleSelect(event:any) {
     if(event&&event[0])
     this.selectedMappingID=event[0]['groupID'];
     }

     saveMappingID(){
     let data = this._depositForm.getData(this.depositForm);
     data.mapping_id = this.selectedMappingID;
     this._depositForm.updateForm(this.depositForm, data);
     this.mappingFlyoutCSS="collapsed";
     }*/
    DepositComponent.prototype.checkLockDate = function () {
        if (Session_1.Session.getLockDate()) {
            if (moment(Session_1.Session.getLockDate(), "MM/DD/YYYY").valueOf() > moment().valueOf()) {
                jQuery('#deposit-password-conformation').foundation('open');
            }
            else {
                this.updateDepositDetails();
            }
        }
        else {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please set company lock date");
        }
    };
    DepositComponent.prototype.validateLockKey = function () {
        var _this = this;
        var data = {
            "key": this.key
        };
        this.vendorService.validateLockKey(Session_1.Session.getCurrentCompany(), data).subscribe(function (res) {
            _this.validateLockDate = res.validation;
            if (res.validation) {
                _this.closePasswordConfirmation();
                _this.loadingService.triggerLoadingEvent(true);
                _this.updateDepositDetails();
            }
            else {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invalid key");
            }
        }, function (fail) {
        });
    };
    DepositComponent.prototype.closePasswordConfirmation = function () {
        this.resetPasswordConformation();
        jQuery('#deposit-password-conformation').foundation('close');
    };
    DepositComponent.prototype.checkValidation = function () {
        if (this.key)
            return true;
        else
            return false;
    };
    DepositComponent.prototype.resetPasswordConformation = function () {
        this.key = null;
    };
    DepositComponent.prototype.updateLineTotal = function () {
        var base = this;
        var deposliLineData = this.depositForm.controls['payments'];
        this.lineTotal = 0;
        _.each(deposliLineData.controls, function (lineForm) {
            var line = base._depositLineForm.getData(lineForm);
            if (!line.destroy) {
                base.lineTotal += line.amount ? base.roundOffValue(parseFloat(line.amount)) : 0;
            }
        });
    };
    DepositComponent.prototype.roundOffValue = function (num) {
        return Math.round(num * 100) / 100;
    };
    return DepositComponent;
}());
__decorate([
    core_1.ViewChild("accountComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], DepositComponent.prototype, "accountComboBox", void 0);
__decorate([
    core_1.ViewChild("editCOAComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], DepositComponent.prototype, "editCOAComboBox", void 0);
__decorate([
    core_1.ViewChild("editEntityComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], DepositComponent.prototype, "editEntityComboBox", void 0);
__decorate([
    core_1.ViewChild("editInvoiceComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], DepositComponent.prototype, "editInvoiceComboBox", void 0);
__decorate([
    core_1.ViewChild('list'),
    __metadata("design:type", core_1.ElementRef)
], DepositComponent.prototype, "el", void 0);
DepositComponent = __decorate([
    core_1.Component({
        selector: 'deposit',
        templateUrl: '/app/views/Deposits.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.ActivatedRoute, router_1.Router, Deposits_form_1.DepositsForm,
        Deposits_form_1.DepositsLineForm, FinancialAccounts_service_1.FinancialAccountsService, ChartOfAccounts_service_1.ChartOfAccountsService,
        Deposit_service_1.DepositService, Toast_service_1.ToastService,
        LoadingService_1.LoadingService, DimensionService_service_1.DimensionService, Customers_service_1.CustomersService,
        Invoices_service_1.InvoicesService, Companies_service_1.CompaniesService, Payments_service_1.PaymentsService,
        DateFormatter_service_1.DateFormater, StateService_1.StateService, PageTitle_1.pageTitleService, SwitchBoard_1.SwitchBoard])
], DepositComponent);
exports.DepositComponent = DepositComponent;
