
import {Component} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";
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
    newLineForm: FormGroup;
    expenseItemsArray: FormArray = new FormArray([]);
    routeSub:any;
    expenseID:string;
    newExpense: boolean = true;
    currentCompanyId: string;
    accounts:Array<any>=[];
    vendors:Array<any> = [];
    chartOfAccounts:Array<any> = [];
    isExpensePaid:boolean = false;
    addNewItemFlag:boolean = false;

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
            base.isExpensePaid = !Boolean(base.expenseForm.controls['is_paid'].value);
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

    editItem(itemForm){
        itemForm.editable = !itemForm.editable;
    }

    addNewItem(){
        this.addNewItemFlag = true;
    }

    setCOAForNewItem(coa){
        let data = this._expenseItemForm.getData(this.newLineForm);
        data.chart_of_account_id = coa.id;
        this._expenseItemForm.updateForm(this.newLineForm, data);
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
        let data = this._expenseItemForm.getData(this.newLineForm);
        data.vendor_id = vendor.id;
        this._expenseItemForm.updateForm(this.newLineForm, data);
    }

    updateItem(itemForm){
        itemForm.editable = !itemForm.editable;
    }

    ngOnInit(){
        let _form = this._expenseForm.getForm();
        _form['expense_items'] = this.expenseItemsArray;
        this.expenseForm = this._fb.group(_form);

        let _itemForm = this._expenseItemForm.getForm();
        this.newLineForm = this._fb.group(_itemForm);

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