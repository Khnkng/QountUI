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
    depositsTableData:any = {};
    expensesTableData:any = {};
    tableOptions:any = {search:false, pageSize:6,selectable:true};
    unreconciledTableOptions:any = {search:false, pageSize:6};
    showForm:boolean = true;
    reconcileData:any = {};
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
    /*unreconciledRecords:Array<any> = [];*/
    reconcileDate:any;
    tabDisplay:Array<any> = [{'display':'none'},{'display':'none'},{'display':'none'},{'display':'none'}];
    bgColors:Array<string>=[
        '#d45945',
        '#d47e47',
        '#2980b9',
        '#3dc36f'
    ];
    tabBackground:string = "#d45945";
    selectedTabColor:string = "#d45945";
    selectedTab:any='deposits';
    selectedColor:any='red-tab';
    tabHeight:string;


    constructor(private _fb: FormBuilder, private _reconcileForm: ReconcileForm,private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
                private loadingService: LoadingService, private reconcileService: ReconcileService, private accountsService: FinancialAccountsService) {
        this.reconcileForm = _fb.group(_reconcileForm.getForm());
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(accounts =>{
                this.accounts = accounts.accounts;
                this.loadingService.triggerLoadingEvent(false);
            }, error=>{
                this.loadingService.triggerLoadingEvent(false);
            });
        /*this.reconcileService.getUnreconciledRecords()
            .subscribe(reconData  => {
                this.unreconciledRecords = reconData;
                this.buildUnreconciledTableData();
                }, error =>  {
            });*/
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
                    this.getStartingBalance();
                    this.buildDepositsTableData();
                    this.buildExpensesTableData();
                    this.buildTableData();
                    this.loadingService.triggerLoadingEvent(false);
                    this.selectTab(0,'');
            }, error =>  {
                base.toastService.pop(TOAST_TYPE.error, "Failed to load reconcile data");
                this.loadingService.triggerLoadingEvent(false);
            });
    }

    calculateEndingBalance(){
        this.endingBalance = this.startingBalance+this.inflow-this.outflow;
    };

    getStartingBalance(){
        let base = this;
        this.reconcileService.getStartingBalance(this.selectedBank)
            .subscribe(reconData  => {
                this.showForm = false;
                let amount = reconData.last_recon_ending_balance;
                amount = parseFloat(amount);
                this.startingBalance = amount;
                this.loadingService.triggerLoadingEvent(false);
            }, error =>  {
                base.toastService.pop(TOAST_TYPE.error, "Failed to get starting balance");
                this.showForm = true;
                this.loadingService.triggerLoadingEvent(false);
            });
    }

    buildDepositsTableData(){
        let base = this;
        this.depositsTableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "date", "title": "Date"},
            {"name": "amount", "title": "Amount"},
            {"name": "id", "title": "Entry ID", "visible": false}];
        this.depositsTableData.rows = [];
        _.each(base.reconcileData.deposits, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
               if(key == 'amount'){
                    let amount = parseFloat(entry[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else{
                    row[key] = entry[key];
                }
            });
            base.depositsTableData.rows.push(row);
        });
    };

    buildExpensesTableData(){
        let base = this;
        this.expensesTableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "date", "title": "Date"},
            {"name": "amount", "title": "Amount"},
            {"name": "id", "title": "Entry ID", "visible": false}];
        this.expensesTableData.rows = [];
        _.each(base.reconcileData.expenses, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
               if(key == 'amount'){
                    let amount = parseFloat(entry[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else{
                    row[key] = entry[key];
                }
            });
            base.expensesTableData.rows.push(row);
        });
    };
    buildTableData(){
        let base = this;
        this.tableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "date", "title": "Date"},
            {"name": "amount", "title": "Amount"},
            {"name": "id", "title": "Entry ID", "visible": false}];
        this.tableData.rows = [];
        let all = base.reconcileData.deposits;
        all = all.concat(base.reconcileData.expenses);
        _.each(all, function(entry){
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
    };

   /* buildUnreconciledTableData(){
        let base = this;
        this.tableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "date", "title": "Date"},
            {"name": "amount", "title": "Amount"},
            {"name": "id", "title": "Entry ID", "visible": false}];
        this.tableData.rows = [];
        _.each(base.unreconciledRecords, function(entry){
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
    };*/

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
                    this.updateTabHeight();
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
        data["last_recon_ending_balance"] = this.endingBalance;
        data["last_recon_date"] = this.reconcileDate;
        this.reconcileService.updateStartingBalance(data,this.selectedBank)
            .subscribe(response  => {
                base.toastService.pop(TOAST_TYPE.success, "Updated last reconcile data");
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
        this.startingBalance = 0;
    }
    getAccounts() {
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(accounts => {
                this.accounts = accounts.accounts;
            }, error => {
            });
    }

    reRoutePage(tabId) {
        if(tabId==0){
            let link = ['books', 'deposits'];
            this._router.navigate(link);
            return;
        }
        else if(tabId==1){
            let link = ['books', 'expenses'];
            this._router.navigate(link);
            return;
        }
        else{
            let link = ['books', 'journalEntries'];
            this._router.navigate(link);
            return;
        }

    }
    selectTab(tabNo, color) {
        this.selectedTab=tabNo;
        this.selectedColor=color;
        let base = this;
        this.tabDisplay.forEach(function(tab, index){
            base.tabDisplay[index] = {'display':'none'}
        });
        this.tabDisplay[tabNo] = {'display':'block'};
        this.tabBackground = this.bgColors[tabNo];
        this.loadingService.triggerLoadingEvent(true);
    }

    updateTabHeight(){
        let base = this;
        let topOfDiv = jQuery('.tab-content').offset().top;
        topOfDiv = topOfDiv<150? 170:topOfDiv;
        let bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
        base.tabHeight = (bottomOfVisibleWindow - topOfDiv -25)+"px";
        jQuery('.tab-content').css('height', base.tabHeight);
        switch(this.selectedTab){
            case 0:
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 1:
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 2:
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
        }
    }
    ngAfterViewInit() {
        if(!this.showForm) {
            let base = this;
            jQuery(document).ready(function () {
                base.updateTabHeight();
            });
        }
    }
}
