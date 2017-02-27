
import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {ExpenseForm, ExpenseItemForm} from "../forms/Expenses.form";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ExpenseService} from "qCommon/app/services/Expense.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants"

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'expense',
    templateUrl: '/app/views/expense.html',
})

export class ExpenseComponent{
    expenseForm: FormGroup;
    newItemForm: FormGroup;
    editItemForm: FormGroup;
    routeSub:any;
    expenseID:string;
    newExpense: boolean = false;
    currentCompanyId: string;
    accounts:Array<any>=[];
    vendors:Array<any> = [];
    chartOfAccounts:Array<any> = [];
    isExpensePaid:boolean = false;
    addNewItemFlag:boolean = false;
    editingItems:any={};
    dimensionFlyoutCSS:any;
    itemActive:boolean = false;
    dimensions:Array<any> = [];
    selectedDimensions:Array<any> = [];
    editItemIndex:number;
    companyCurrency:string;

    @ViewChild("accountComboBoxDir") accountComboBox: ComboBox;
    @ViewChild("newCOAComboBoxDir") newCOAComboBox: ComboBox;
    @ViewChild("newVendorComboBoxDir") newVendorComboBox: ComboBox;
    @ViewChild("editCOAComboBoxDir") editCOAComboBox: ComboBox;
    @ViewChild("editVendorComboBoxDir") editVendorComboBox: ComboBox;

    constructor(private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _expenseForm: ExpenseForm,
            private _expenseItemForm: ExpenseItemForm, private accountsService: FinancialAccountsService, private coaService: ChartOfAccountsService,
            private vendorService: CompaniesService, private expenseService: ExpenseService, private toastService: ToastService,
            private loadingService: LoadingService, private dimensionService: DimensionService){
        this.routeSub = this._route.params.subscribe(params => {
            this.expenseID=params['expenseID'];
            if(!this.expenseID){
                this.newExpense = true;
            }
        });
        this.companyCurrency = Session.getCurrentCompanyCurrency();
    }

    showExpensesPage(){
        let link = [Session.getLastVisitedUrl()];
        this._router.navigate(link);
    }

    showFlyout(index) {
        let base = this;
        this.itemActive = true;
        this.dimensionFlyoutCSS = "expanded";
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        let data = this._expenseItemForm.getData(itemsControl.controls[index]);
        let coa = _.find(this.chartOfAccounts, {'id': data.chart_of_account_id});
        let vendor = _.find(this.vendors, {'id': data.vendor_id});
        this.selectedDimensions = data.dimensions;
        setTimeout(function(){
            base.editCOAComboBox.setValue(coa, 'name');
            base.editVendorComboBox.setValue(vendor, 'name');
        });
        this.editItemForm = this._fb.group(this._expenseItemForm.getForm(data));
        this.editItemIndex = index;
    }

    hideFlyout(){
        this.dimensionFlyoutCSS = "collapsed";
        this.itemActive = false;
        this.editItemIndex = null;
        this.selectedDimensions = [];
    }

    setCOAForEditingItem(chartOfAccount){
        let data = this._expenseItemForm.getData(this.editItemForm);
        if(chartOfAccount && chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        this._expenseItemForm.updateForm(this.editItemForm, data);
    }

    setVendorForEditingItem(vendor){
        let data = this._expenseItemForm.getData(this.editItemForm);
        if(vendor && vendor.id){
            data.vendor_id = vendor.id;
        }
        this._expenseItemForm.updateForm(this.editItemForm, data);
    }

    /*This function will stop event bubbling to avoid default selection of first value in first dimension*/
    doNothing($event){
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    }

    setBankAccount(account){
        let data = this._expenseForm.getData(this.expenseForm);
        if(account && account.id){
            data.bank_account_id = account.id;
        }else if(!account||account=='--None--'){
            data.bank_account_id='--None--';
        }
        this._expenseForm.updateForm(this.expenseForm, data);
    }

    togglePaidStatus(){
        let base = this;
        setTimeout(function(){
            base.isExpensePaid = Boolean(base.expenseForm.controls['is_paid'].value);
        }, 0);
    }

    setPaidDate(date){
        let data = this._expenseForm.getData(this.expenseForm);
        data.paid_date = date;
        this._expenseForm.updateForm(this.expenseForm, data);
    }

    setDueDate(date){
        let data = this._expenseForm.getData(this.expenseForm);
        data.due_date = date;
        this._expenseForm.updateForm(this.expenseForm, data);
    }

    processExpense(expense){
        let base = this;
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        _.each(expense.expense_items, function(expenseItem){
            expenseItem.amount = parseFloat(expenseItem.amount);
            itemsControl.controls.push(base._fb.group(base._expenseItemForm.getForm(expenseItem)));
        });
        let account = _.find(this.accounts, {'id': expense.bank_account_id});
        setTimeout(function(){
           base.accountComboBox.setValue(account, 'name');
        });
        this._expenseForm.updateForm(this.expenseForm, expense);
    }

    editItem(index, itemForm){
        let base = this;
        itemForm.editable = !itemForm.editable;
        let itemData = this._expenseItemForm.getData(itemForm);
        this.editingItems[index] = itemData;
        setTimeout(function(){
            jQuery('#coa-'+index).siblings().children('input').val(base.getCOAName(itemData.chart_of_account_id));
            jQuery('#vendor-'+index).siblings().children('input').val(base.getVendorName(itemData.vendor_id));
        });
    }

    deleteItem(index){
        let itemsList:any = this.expenseForm.controls['expense_items'];
        let itemControl = itemsList.controls[index];
        itemControl.controls['destroy'].patchValue(true);
    }

    showNewItem(){
        this.addNewItemFlag = true;
        this.newItemForm = this._fb.group(this._expenseItemForm.getForm());
    }

    hideNewItem(){
        this.addNewItemFlag = false;
    }

    saveNewItem(){
        this.addNewItemFlag = !this.addNewItemFlag;
        let tempItemForm = _.cloneDeep(this.newItemForm);
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        itemsControl.controls.push(tempItemForm);
    }

    setCOAForNewItem(chartOfAccount){
        let data = this._expenseItemForm.getData(this.newItemForm);
        if(chartOfAccount&&chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        this._expenseItemForm.updateForm(this.newItemForm, data);
    }

    setCOA(chartOfAccount, index){
        let data = this._expenseItemForm.getData(this.expenseForm.controls[index]);
        if(chartOfAccount&&chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        let tempForm = this._fb.group(this.expenseForm.controls[index]);
        this._expenseItemForm.updateForm(tempForm, data);
    }

    setVendor(vendor, index){
        let data = this._expenseItemForm.getData(this.expenseForm.controls[index]);
        data.vendor_id = vendor.id;
        let tempForm = this._fb.group(this.expenseForm.controls[index]);
        this._expenseItemForm.updateForm(tempForm, data);
    }

    setVendorForNewItem(vendor){
        let data = this._expenseItemForm.getData(this.newItemForm);
        data.vendor_id = vendor.id;
        this._expenseItemForm.updateForm(this.newItemForm, data);
    }

    getCOAName(chartOfAccountId){
        let coa = _.find(this.chartOfAccounts, {'id': chartOfAccountId});
        return coa? coa.name: '';
    }

    getVendorName(vendorId){
        let vendor = _.find(this.vendors, {'id': vendorId});
        return vendor? vendor.name: '';
    }

    updateItem(index, itemForm){
        let data = _.cloneDeep(this._expenseItemForm.getData(itemForm));
        let expenseItems:any = this.expenseForm.controls['expense_items'];
        let itemControl:any = expenseItems.controls[index];
        itemControl.controls['title'].patchValue(data.title);
        itemControl.controls['amount'].patchValue(data.amount);
        itemControl.controls['chart_of_account_id'].patchValue(data.chart_of_account_id);
        itemControl.controls['vendor_id'].patchValue(data.vendor_id);
        itemControl.controls['notes'].patchValue(data.notes);
        itemForm.editable = !itemForm.editable;
    }

    toggleLine(index, itemForm){
        itemForm.editable = !itemForm.editable;
        let tempForm = this._fb.group(this._expenseItemForm.getForm(this.editingItems[index]));
        this.updateItem(index, tempForm);
    }

    setCOAForItem(chartOfAccount, itemForm){
        let data = this._expenseItemForm.getData(itemForm);
        if(chartOfAccount && chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount || chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        this._expenseItemForm.updateForm(itemForm, data);
    }

    setVendorForItem(vendor, itemForm){
        let data = this._expenseItemForm.getData(itemForm);
        if(vendor && vendor.id){
            data.vendor_id = vendor.id;
        }else if(!vendor || vendor=='--None--'){
            data.vendor_id='--None--';
        }
        this._expenseItemForm.updateForm(itemForm, data);
    }

    selectValue($event, dimension, value){
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        _.each(this.selectedDimensions, function (selectedDimension) {
            if(selectedDimension.name == dimension.name){
                if(selectedDimension.values.indexOf(value) == -1){
                    selectedDimension.values.push(value);
                } else{
                    selectedDimension.values.splice(selectedDimension.values.indexOf(value), 1);
                }
            }
        });
    }

    isDimensionSelected(dimensionName){
        let selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        return selectedDimensionNames.indexOf(dimensionName) != -1;
    }

    isValueSelected(dimension, value){
        let currentDimension = _.find(this.selectedDimensions, {'name': dimension.name});
        if(!_.isEmpty(currentDimension)){
            if(currentDimension.values.indexOf(value) != -1){
                return true;
            }
            return false;
        }
        return false;
    }

    selectDimension($event, dimensionName){
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        let selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        if(selectedDimensionNames.indexOf(dimensionName) == -1){
            this.selectedDimensions.push({
                "name": dimensionName,
                "values": []
            });
        } else{
            this.selectedDimensions.splice(selectedDimensionNames.indexOf(dimensionName), 1);
        }
    }

    /*When user clicks on save button in the flyout*/
    saveItem(){
        let dimensions = this.editItemForm.controls['dimensions'];
        dimensions.patchValue(this.selectedDimensions);
        let itemData = this._expenseItemForm.getData(this.editItemForm);
        this.updateLineInView(itemData);
        this.selectedDimensions = [];
        this.hideFlyout();
    }

    /*This will just update line details in VIEW*/
    updateLineInView(item){
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        let itemControl = itemsControl.controls[this.editItemIndex];
        itemControl.controls['title'].patchValue(item.title);
        itemControl.controls['amount'].patchValue(item.amount);
        itemControl.controls['chart_of_account_id'].patchValue(item.chart_of_account_id);
        itemControl.controls['vendor_id'].patchValue(item.vendor_id);
        itemControl.controls['notes'].patchValue(item.notes);
        itemControl.controls['dimensions'].patchValue(item.dimensions);
    }

    getExpenseItemData(expenseForm){
        let base = this;
        let data = [];
        _.each(expenseForm.controls, function(expenseItemControl){
            let itemData = base._expenseItemForm.getData(expenseItemControl);
            if(itemData.chart_of_account_id=='--None--'||itemData.chart_of_account_id==''){
                itemData.chart_of_account_id=null;
            }
            if(itemData.vendor_id=='--None--'||itemData.vendor_id==''){
                itemData.vendor_id=null;
            }
            data.push(itemData);
        });
        return data;
    }

    submit($event){
        $event && $event.preventDefault();
        let data = this._expenseForm.getData(this.expenseForm);
        data.expense_items = this.getExpenseItemData(this.expenseForm.controls['expense_items']);
        let itemTotal = _.sumBy(data.expense_items, 'amount');
        if(itemTotal != data.amount){
            this.toastService.pop(TOAST_TYPE.error, "Expense amount and Item total did not match.");
            return;
        }
        this.loadingService.triggerLoadingEvent(true);
        if(this.newExpense){
            this.expenseService.addExpense(data, this.currentCompanyId)
                .subscribe(response=>{
                    this.loadingService.triggerLoadingEvent(false);
                    this.showExpensesPage();
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                    console.log("expense creation failed", error);
                });
        } else{
            this.expenseService.updateExpense(data, this.currentCompanyId)
                .subscribe(response =>{
                    this.loadingService.triggerLoadingEvent(false);
                    this.showExpensesPage();
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                    console.log("updating expense failed", error);
                });
        }
    }

    ngOnInit(){
        let _form = this._expenseForm.getForm();
        _form['expense_items'] = new FormArray([]); //this.expenseItemsArray;
        this.expenseForm = this._fb.group(_form);

        let _itemForm = this._expenseItemForm.getForm();
        this.newItemForm = this._fb.group(_itemForm);

        this.currentCompanyId = Session.getCurrentCompany();
        this.loadingService.triggerLoadingEvent(true);
        this.dimensionService.dimensions(this.currentCompanyId)
            .subscribe(dimensions =>{
                this.dimensions = dimensions;
            }, error => {

            });
        this.accountsService.financialAccounts(this.currentCompanyId)
            .subscribe(accounts=> {
               this.accounts = accounts.accounts;
            }, error => {

            });
        this.coaService.chartOfAccounts(this.currentCompanyId)
            .subscribe(chartOfAccounts=> {
                this.chartOfAccounts = _.filter(chartOfAccounts, function(chartOfAccount){
                    return chartOfAccount.type == 'expenses' || chartOfAccount.type == 'otherExpense';
                });
            }, error => {

            });
        this.vendorService.vendors(this.currentCompanyId)
            .subscribe(vendors=> {
                this.vendors = vendors;
            }, error => {

            });
        if(!this.newExpense){
            this.expenseService.expense(this.expenseID, this.currentCompanyId)
                .subscribe(expense => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.processExpense(expense.expenses);
                }, error =>{
                    this.toastService.pop(TOAST_TYPE.error, "Failed to load expense details");
                })
        } else{
            this.loadingService.triggerLoadingEvent(false);
        }
    }
}