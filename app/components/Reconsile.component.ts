/**
 * Created by venkatkollikonda on 24/03/17.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ReconcileService} from "../services/Reconsile.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {ReconcileForm} from "../forms/Reconsile.form";
import {ExpenseService} from "qCommon/app/services/Expense.service";



declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
    selector: 'reconcile',
    templateUrl: '/app/views/reconsile.html',
})

export class ReconcileComponent{
    reconcileForm: FormGroup;
    companyId:string;
    accounts:Array<any> = [];
    entries:Array<any> = [];
    companyCurrency:string;
    tableData:any = {};
    hasEntries:boolean = false;
    tableOptions:any = {search:false, pageSize:6,selectable:true};
    showForm:boolean = true;
    reconcileData:Array<any> = [];
    reconcileDataCopy:Array<any> = [];
    selectedBank:any='';
    startingBalance:any;
    statementInflow:any;
    statementOutflow:any;
    statementEndingBalance:any;
    endingBalance:any;
    inflow:number;
    outflow:number;
    selectedRows:Array<any> = [];
    reconcileDate:any;


    constructor(private _fb: FormBuilder, private _reconcileForm: ReconcileForm,private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
                private loadingService: LoadingService, private expenseService: ExpenseService, private reconcileService: ReconcileService, private accountsService: FinancialAccountsService) {
        this.reconcileForm = _fb.group(_reconcileForm.getForm());
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(accounts =>{
                this.accounts = accounts.accounts;

            }, error=>{

            });
    }

    showPreviousPage(){
        let link = ['books', 'deposits'];
        this._router.navigate(link);
    }

    ngOnInit(){

    }


    getBankAccountName(accountId){
        let account = _.find(this.accounts, {'id': accountId});
        return account? account.name: "";
    }

    redirectToEntryPage($event){
        if($event.type == 'Expense'){
            let link = ['/expense', $event.id];
            this._router.navigate(link);
        }
        if($event.type == 'Deposit'){
            let link = ['/deposit', $event.id];
            this._router.navigate(link);
        }
    }

    setDueDate(date){
        let data = this._reconcileForm.getData(this.reconcileForm);
        data.date = date;
        this.reconcileDate = date;
        this._reconcileForm.updateForm(this.reconcileForm, data);
    }

    setBankAccount(account){
        let data = this._reconcileForm.getData(this.reconcileForm);
        if(account && account.id){
            data.bankAccountId = account.id;
            this.selectedBank = account.id;
        }else if(!account||account=='--None--'){
            data.bankAccountId='--None--';
        }
        this._reconcileForm.updateForm(this.reconcileForm, data);
    }

    handleSelect(event:any) {
        let base = this;
        base.inflow = 0;
        base.outflow= 0;
        let deposits = [];
        let expenses = [];
        _.each(event, function(bill){
            base.selectedRows.push(bill);
        });
        this.selectedRows = _.uniqBy(this.selectedRows, 'id');
        _.remove(this.selectedRows, {'tempIsSelected': false});
        _.each(this.selectedRows,function(row){
            if(row.type == 'deposit') {
               deposits.push(_.find(base.reconcileDataCopy, {id: row.id}));
                base.inflow = base.inflow+parseFloat(_.find(base.reconcileDataCopy, {id: row.id}).amount);
            }else{
                expenses.push(_.find(base.reconcileDataCopy, {id: row.id}));
                base.outflow = base.outflow+parseFloat(_.find(base.reconcileDataCopy, {id: row.id}).amount);
            }
        });
        this.calculateEndingBalance();
    }


    submit($event){
        $event && $event.preventDefault();
        let base = this;
        let data = this._reconcileForm.getData(this.reconcileForm);
        this.loadingService.triggerLoadingEvent(true);
        this.reconcileService.getReconcileData(data)
            .subscribe(reconcileData  => {
                this.reconcileData = reconcileData;
                this.reconcileDataCopy = reconcileData;
                if(reconcileData.length > 0){
                    this.getStartingBalance();
                    this.buildTableData();
                    this.showForm = false;
                }else{
                    base.toastService.pop(TOAST_TYPE.success, "No Entries Found");
                    this.hasEntries = false;
                    this.showForm = true;
                }
                }, error =>  {
                this.loadingService.triggerLoadingEvent(false);
                base.toastService.pop(TOAST_TYPE.error, "Failed to load reconcile data");
            });
    }

    calculateEndingBalance(){
        this.endingBalance = this.startingBalance+this.inflow-this.outflow;
    };

    getStartingBalance(){
        let base = this;
        this.reconcileService.getStartingBalance(this.selectedBank)
            .subscribe(startingBalance  => {
                let amount = startingBalance;
                amount = parseFloat(amount);
                this.startingBalance = amount;
            }, error =>  {
                base.toastService.pop(TOAST_TYPE.error, "Failed to get starting balance");
            });
    }

    buildTableData(){
        let base = this;
        this.tableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "date", "title": "Date"},
            {"name": "amount", "title": "Amount"},
            {"name": "id", "title": "Entry ID", "visible": false}];
        this.tableData.rows = [];
        _.each(base.reconcileData, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
               if(key == 'amount'){
                    let amount = parseFloat(entry[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else{
                    row[key] = entry[key];
                }
            });
            base.tableData.rows.push(row);
        });
        if(this.tableData.rows.length > 0){
            this.hasEntries = true;
        }
    };

    submitReconcile(){
        if(this.selectedRows.length>0) {
            let base = this;
            this.loadingService.triggerLoadingEvent(true);
            let selected = [];
            let createRow = {};
            _.each(this.selectedRows, function (row) {
                createRow['type'] = row.type;
                createRow['id'] = row.id;
                selected.push(createRow);
            });
            this.reconcileService.createReconcile(selected)
                .subscribe(response => {
                    base.toastService.pop(TOAST_TYPE.success, "Reconcilation Successfull");
                    this.updateStartingBalance();
                    this.resetReconcileForm();
                    this.getAccounts();
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                    base.toastService.pop(TOAST_TYPE.error, "Failed to reconcile data");
                });
        }else{
            this.toastService.pop(TOAST_TYPE.success,"No Records Selected");
        }
    }

    updateStartingBalance(){
        let base = this;
        let data = {};
        data["endingBalance"] = this.endingBalance;
        data["date"] = this.reconcileDate;
        this.reconcileService.updateStartingBalance(data)
            .subscribe(response  => {
            }, error =>  {
                base.toastService.pop(TOAST_TYPE.error, "Failed to update reconcile date");
            });
    }

    resetReconcileForm(){
        this.showForm = true;
        this.inflow= 0;
        this.outflow= 0;
        this.endingBalance= 0;
        this.statementInflow = 0;
        this.statementOutflow = 0;
        this.statementEndingBalance= 0;
        this.selectedRows= [];
        this.reconcileDate = '';
    }
    getAccounts() {
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(accounts => {
                this.accounts = accounts.accounts;
            }, error => {
            });
    }

}
