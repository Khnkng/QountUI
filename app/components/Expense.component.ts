
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
    //expenseItemsArray: FormArray = new FormArray([]);
    routeSub:any;
    expenseID:string;
    newExpense: boolean = true;
    currentCompanyId: string;
    accounts:Array<any>=[];
    vendors:Array<any> = [];
    chartOfAccounts:Array<any> = [];
    isExpensePaid:boolean = false;
    addNewItemFlag:boolean = false;
    editingItem:any;

    @ViewChild("newCOAComboBoxDir") newCOAComboBox: ComboBox;
    @ViewChild("newVendorComboBoxDir") newVendorComboBox: ComboBox;

    constructor(private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _expenseForm: ExpenseForm,
            private _expenseItemForm: ExpenseItemForm, private accountsService: FinancialAccountsService, private coaService: ChartOfAccountsService,
            private vendorService: CompaniesService, private expenseService: ExpenseService, private toastService: ToastService,
            private loadingService: LoadingService){
        this.routeSub = this._route.params.subscribe(params => {
            this.expenseID=params['expenseID'];
            if(!this.expenseID){
                this.newExpense = true;
            }
        });
    }

    showExpensesPage(){
        let link = ['books', 1];
        this._router.navigate(link);
    }

    setBankAccount(account){
        let accountControl:any = this.expenseForm.controls['bank_account_id'];
        accountControl.patchValue(account.id);
    }

    togglePaidStatus(){
        let base = this;
        setTimeout(function(){
            base.isExpensePaid = Boolean(base.expenseForm.controls['is_paid'].value);
        }, 0);
    }

    setPaidDate(date){
        let paidDateControl:any = this.expenseForm.controls['paid_date'];
        paidDateControl.patchValue(date);
    }

    setDueDate(date){
        let dueDateControl:any = this.expenseForm.controls['due_date'];
        dueDateControl.patchValue(date);
    }

    processExpense(expense){

    }

    editItem(index){
        let base = this;
        this.editingItem = {
          "index": index
        };
        this.showNewItem();
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        let itemControl:any = itemsControl.controls[index];
        let itemData = this._expenseItemForm.getData(itemControl);
        let coa = _.find(this.chartOfAccounts, {'id': itemData.chart_of_account_id});
        let vendor = _.find(this.vendors, {'id': itemData.vendor_id});
        setTimeout(function(){
            base.newCOAComboBox.setValue(coa, 'name');
            base.newVendorComboBox.setValue(vendor, 'name');
        });
        this._expenseItemForm.updateForm(this.newItemForm, itemData);
    }

    deleteItem(index){
        let itemsList:any = this.expenseForm.controls['expense_items'];
        itemsList.controls.splice(index, 1);
        //this.expenseItemsArray.controls.splice(index, 1);
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

    setCOAForNewItem(coa){
        let data = this._expenseItemForm.getData(this.newItemForm);
        data.chart_of_account_id = coa.id;
        this._expenseItemForm.updateForm(this.newItemForm, data);
    }

    setCOA(coa, index){
        let data = this._expenseItemForm.getData(this.expenseForm.controls[index]);
        data.chart_of_account_id = coa.id;
        let tempForm = this._fb.group(this.expenseForm.controls[index]);
        this._expenseItemForm.updateForm(tempForm, data);
    }

    setVendor(vendor, index){
        let data = this._expenseItemForm.getData(this.expenseForm.controls[index]);
        data.chart_of_account_id = vendor.id;
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

    updateItem(){
        this.hideNewItem();
        let data = _.cloneDeep(this._expenseItemForm.getData(this.newItemForm));
        let expenseItems:any = this.expenseForm.controls['expense_items'];
        let itemControl:any = expenseItems.controls[this.editingItem.index];
        itemControl.controls['title'].patchValue(data.title);
        itemControl.controls['amount'].patchValue(data.amount);
        itemControl.controls['chart_of_account_id'].patchValue(data.chart_of_account_id);
        itemControl.controls['vendor_id'].patchValue(data.vendor_id);
        itemControl.controls['notes'].patchValue(data.notes);
        this.editingItem = null;
    }

    submit($event){
        $event && $event.preventDefault();
        let data = this._expenseForm.getData(this.expenseForm);
        this.expenseService.addExpense(data, this.currentCompanyId)
            .subscribe(response=>{
               console.log("Created expense");
               this.showExpensesPage();
            }, error => {
                console.log("expense creation failed");
            });
    }

    ngOnInit(){
        let _form = this._expenseForm.getForm();
        _form['expense_items'] = new FormArray([]); //this.expenseItemsArray;
        this.expenseForm = this._fb.group(_form);

        let _itemForm = this._expenseItemForm.getForm();
        this.newItemForm = this._fb.group(_itemForm);

        this.currentCompanyId = Session.getCurrentCompany();
        this.loadingService.triggerLoadingEvent(true);
        this.accountsService.financialAccounts(this.currentCompanyId)
            .subscribe(accounts=> {
               this.accounts = accounts.accounts;
            }, error => {

            });
        this.coaService.chartOfAccounts(this.currentCompanyId)
            .subscribe(chartOfAccounts=> {
                this.chartOfAccounts = chartOfAccounts;
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
                    this.processExpense(expense);
                }, error =>{
                    this.toastService.pop(TOAST_TYPE.error, "Failed to load expense details");
                })
        } else{
            this.loadingService.triggerLoadingEvent(false);
        }
    }
}