
import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {DepositsForm, DepositsLineForm} from "../forms/Deposits.form";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {DepositService} from "qCommon/app/services/Deposit.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants"
import {CustomersService} from "qCommon/app/services/Customers.service";

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'deposit',
    templateUrl: '/app/views/Deposits.html',
})

export class DepositComponent{
    depositForm: FormGroup;
    newItemForm: FormGroup;
    //expenseItemsArray: FormArray = new FormArray([]);
    routeSub:any;
    depositID:string;
    newDeposit: boolean = true;
    currentCompanyId: string;
    accounts:Array<any>=[];
    customers:Array<any> = [];
    chartOfAccounts:Array<any> = [];
    isExpensePaid:boolean = false;
    addNewItemFlag:boolean = false;
    editingItem:any;

    @ViewChild("newCOAComboBoxDir") newCOAComboBox: ComboBox;
    @ViewChild("newCustomersComboBoxDir") newCustomersComboBox: ComboBox;

    constructor(private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _depositsForm: DepositsForm,
                private _depositItemForm: DepositsLineForm, private accountsService: FinancialAccountsService, private coaService: ChartOfAccountsService,
                private vendorService: CompaniesService, private depositService: DepositService, private toastService: ToastService,
                private loadingService: LoadingService,private customersService: CustomersService){
        this.routeSub = this._route.params.subscribe(params => {
            this.depositID=params['depositID'];
            if(!this.depositID){
                this.newDeposit = true;
            }
        });
    }

    showDepositPage(){
        let link = ['books', 0];
        this._router.navigate(link);
    }

    setBankAccount(account){
        let data = this._depositsForm.getData(this.depositForm);
        data.bank_account_id = account.id;
        this._depositsForm.updateForm(this.depositForm, data);
    }

    setDate(date){
        let dueDateControl:any = this.depositForm.controls['date'];
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
        let itemsControl:any = this.depositForm.controls['payments'];
        let itemControl:any = itemsControl.controls[index];
        let itemData = this._depositItemForm.getData(itemControl);
        let coa = _.find(this.chartOfAccounts, {'id': itemData.chart_of_account_id});
        let customer = _.find(this.customers, {'customer_id': itemData.customer_id});
        setTimeout(function(){
            base.newCOAComboBox.setValue(coa, 'name');
            base.newCustomersComboBox.setValue(customer, 'customer_name');
        });
        this._depositItemForm.updateForm(this.newItemForm, itemData);
    }

    deleteItem(index){
        let itemsList:any = this.depositForm.controls['payments'];
        itemsList.controls.splice(index, 1);
        //this.expenseItemsArray.controls.splice(index, 1);
    }

    showNewItem(){
        this.addNewItemFlag = true;
        this.newItemForm = this._fb.group(this._depositItemForm.getForm());
    }

    hideNewItem(){
        this.addNewItemFlag = false;
    }

    saveNewItem(){
        this.addNewItemFlag = !this.addNewItemFlag;
        let tempItemForm = _.cloneDeep(this.newItemForm);
        let itemsControl:any = this.depositForm.controls['payments'];
        itemsControl.controls.push(tempItemForm);
    }

    setCOAForNewItem(coa){
        let data = this._depositItemForm.getData(this.newItemForm);
        data.chart_of_account_id = coa.id;
        this._depositItemForm.updateForm(this.newItemForm, data);
    }

    setCOA(coa, index){
        let data = this._depositItemForm.getData(this.depositForm.controls[index]);
        data.chart_of_account_id = coa.id;
        let tempForm = this._fb.group(this.depositForm.controls[index]);
        this._depositItemForm.updateForm(tempForm, data);
    }

    setNewCustomer(customer){
        let data = this._depositItemForm.getData(this.newItemForm);
        data.customer_id = customer.customer_id;
        this._depositItemForm.updateForm(this.newItemForm, data);
    }

    setCustomer(customer, index){
        let data = this._depositItemForm.getData(this.depositForm.controls[index]);
        data.customer_id = customer.customer_id;
        let tempForm = this._fb.group(this.depositForm.controls[index]);
        this._depositItemForm.updateForm(tempForm, data);
    }

    setItemDate(date){
        let data = this._depositItemForm.getData(this.newItemForm);
        data.date = date;
        this._depositItemForm.updateForm(this.newItemForm, data);
    }

    getCOAName(chartOfAccountId){
        let coa = _.find(this.chartOfAccounts, {'id': chartOfAccountId});
        return coa? coa.name: '';
    }

    getCustomerName(customerId){
        let customer = _.find(this.customers, {'customer_id': customerId});
        return customer? customer.customer_name: '';
    }

    updateItem(){
        this.hideNewItem();
        let data = _.cloneDeep(this._depositItemForm.getData(this.newItemForm));
        let expenseItems:any = this. depositForm.controls['payments'];
        let itemControl:any = expenseItems.controls[this.editingItem.index];
        itemControl.controls['title'].patchValue(data.title);
        itemControl.controls['amount'].patchValue(data.amount);
        itemControl.controls['chart_of_account_id'].patchValue(data.chart_of_account_id);
        itemControl.controls['customer_id'].patchValue(data.customer_id);
        itemControl.controls['notes'].patchValue(data.notes);
        this.editingItem = null;
    }

    submit($event){
        $event && $event.preventDefault();
        let data = this._depositsForm.getData(this.depositForm);
        this.depositService.addDeposit(data, this.currentCompanyId)
            .subscribe(response=>{
                this.showDepositPage();
            }, error => {
            });
    }

    ngOnInit(){
        let _form = this._depositsForm.getForm();
        _form['payments'] = new FormArray([]); //this.expenseItemsArray;
        this.depositForm = this._fb.group(_form);

        let _itemForm = this._depositItemForm.getForm();
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
        this.customersService.customers(this.currentCompanyId)
            .subscribe(customers=> {
                this.customers = customers;
            }, error => {

            });
        if(!this.newDeposit){
            this.depositService.deposit(this.depositID, this.currentCompanyId)
                .subscribe(expense => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.processExpense(expense);
                }, error =>{
                    this.toastService.pop(TOAST_TYPE.error, "Failed to load deposit details");
                })
        } else{
            this.loadingService.triggerLoadingEvent(false);
        }
    }
}