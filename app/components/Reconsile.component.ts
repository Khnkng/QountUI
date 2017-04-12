/**
 * Created by venkatkollikonda on 24/03/17.
 */

import {Component, ViewChild,ElementRef} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ReconcileService} from "../services/Reconsile.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {ReconcileForm} from "../forms/Reconsile.form";
import {CompaniesService} from "qCommon/app/services/Companies.service";





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
    reconActivityTableData:any = {};
    hasData:boolean = false;
    tableOptions:any = {search:false, pageSize:5,selectable:true};
    unreconciledTableOptions:any = {search:false, pageSize:6};
    showForm:boolean = true;
    reconcileData:any = {};
    reconcileDataCopy:Array<any> = [];
    selectedBank:any='';
    selectedBankName:string='';
    startingBalance:any;
    statementInflow:any;
    statementOutflow:any;
    statementEndingBalance:any;
    endingBalance:any;
    inflow:number;
    outflow:number;
    selectedRows:Array<any> = [];
    selectedDepositRows:Array<any> = [];
    selectedExpenseRows:Array<any> = [];
    selectedDepositsCount:number;
    selectedExpensesCount:number;
    /*unreconciledRecords:Array<any> = [];*/
    reconActivity:Array<any> = [];
    reconcileDate:any;
    reconDifference:number;
    companies:Array<any> = [];
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
    @ViewChild('depositsTable') el:ElementRef;
    @ViewChild('expensesTable') el1:ElementRef;
    editable:boolean = true;

    constructor(private _fb: FormBuilder, private _reconcileForm: ReconcileForm,private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
                private loadingService: LoadingService, private reconcileService: ReconcileService, private accountsService: FinancialAccountsService, private companyService: CompaniesService) {
        this.reconcileForm = _fb.group(_reconcileForm.getForm());
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(accounts =>{
                this.accounts = accounts.accounts;
                this.fetchReconActivityData();
            }, error=>{
                this.loadingService.triggerLoadingEvent(false);
            });

    }

    fetchReconActivityData(){
        this.reconcileService.getReconActivityRecords()
            .subscribe(reconActivityData  => {
                this.reconActivity = reconActivityData;
                this.buildReconActivityTableData();
                this.hasData = true;
                this.loadingService.triggerLoadingEvent(false);
            }, error =>  {
                this.loadingService.triggerLoadingEvent(false);
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
            this.selectedBankName = account.name;
        }else if(!account||account=='--None--'){
            data.bankAccountId='--None--';
        }
        this._reconcileForm.updateForm(this.reconcileForm, data);
    }

    handleDepositsSelect(event:any) {
        let base = this;
        base.inflow = 0;
        base.selectedDepositsCount = 0;
        let deposits = [];
        _.each(event, function(bill){
            base.selectedDepositRows.push(bill);
        });
        this.selectedDepositRows = _.uniqBy(this.selectedDepositRows, 'id');
        _.remove(this.selectedDepositRows, {'tempIsSelected': false});
        _.each(this.selectedDepositRows,function(row){
                base.selectedDepositsCount = base.selectedDepositsCount+1;
                deposits.push(_.find(base.reconcileDataCopy.deposits, {id: row.id}));
                base.inflow = base.inflow+parseFloat(_.find(base.reconcileDataCopy.deposits, {id: row.id}).amount);
        });
        this.calculateEndingBalance();
        this.calculateReconDifference();
    }
    handleExpensesSelect(event:any) {
        let base = this;
        base.outflow= 0;
        base.selectedExpensesCount = 0;
        let expenses = [];
        _.each(event, function(bill){
            base.selectedExpenseRows.push(bill);
        });
        this.selectedExpenseRows = _.uniqBy(this.selectedExpenseRows, 'id');
        _.remove(this.selectedExpenseRows, {'tempIsSelected': false});
        _.each(this.selectedExpenseRows,function(row){
                base.selectedExpensesCount = base.selectedExpensesCount+1;
                expenses.push(_.find(base.reconcileDataCopy.expenses, {id: row.id}));
                base.outflow = base.outflow+parseFloat(_.find(base.reconcileDataCopy.expenses, {id: row.id}).amount);
        });
        this.calculateEndingBalance();
        this.calculateReconDifference();
    }

    handleReconActivity($event) {
        console.log($event);
        let base = this;
        this.editable = false;
        this.loadingService.triggerLoadingEvent(true);
        this.reconcileService.getReconDetails($event)
            .subscribe(reconcileDetails => {
                this.showForm = false;
                this.reconcileData = reconcileDetails;
                this.reconcileDataCopy = reconcileDetails;
                this.selectedBankName = $event.bank;
                let amount = reconcileDetails.last_recon_ending_balance;
                amount = parseFloat(amount);
                this.endingBalance = amount;
                this.startingBalance = reconcileDetails.startingBalance;
                this.inflow = reconcileDetails.sum_of_deposits;
                this.outflow = reconcileDetails.sum_of_expenses;
                this.statementEndingBalance = amount;
                this.selectedDepositsCount = reconcileDetails.deposits.length;
                this.selectedExpensesCount = reconcileDetails.expenses.length;
                this.tableOptions.selectable = false;
                this.buildDepositsTableData();
                this.buildExpensesTableData();
                this.selectTab(0,'');
                this.loadingService.triggerLoadingEvent(false);
            }, error =>  {
                base.toastService.pop(TOAST_TYPE.error, "Failed to load reconcile details");
                this.loadingService.triggerLoadingEvent(false);
            });
    }


    submit($event){
        $event && $event.preventDefault();
        let base = this;
        let data = this._reconcileForm.getData(this.reconcileForm);
        this.statementEndingBalance = data.statementEndingBalance;
        this.loadingService.triggerLoadingEvent(true);
        this.reconcileService.getReconcileData(data)
            .subscribe(reconcileData  => {
                this.reconcileData = reconcileData;
                this.reconcileDataCopy = reconcileData;
                this.getStartingBalance();
            }, error =>  {
                base.toastService.pop(TOAST_TYPE.error, "Failed to load reconcile data");
                this.loadingService.triggerLoadingEvent(false);
            });
    }

    calculateEndingBalance(){
        if(this.inflow == undefined){
            this.inflow = 0;
        }else if(this.outflow == undefined){
            this.outflow = 0;
        }
        this.endingBalance = this.startingBalance+this.inflow-this.outflow;
    };

    calculateReconDifference(){
        this.reconDifference = this.statementEndingBalance - this.endingBalance;
    }

    getStartingBalance(){
        let base = this;
        this.reconcileService.getStartingBalance(this.selectedBank)
            .subscribe(reconData  => {
                this.showForm = false;
                let amount = reconData.last_recon_ending_balance;
                amount = parseFloat(amount);
                this.startingBalance = amount;
                this.buildDepositsTableData();
                this.buildExpensesTableData();
                this.buildTableData();
                this.selectTab(0,'');
                this.reconcileForm.reset();
                setTimeout(function(){
                   //base.updateTabHeight();
                });
                this.loadingService.triggerLoadingEvent(false);
            }, error =>  {
                base.reconcileForm.reset();
                base.toastService.pop(TOAST_TYPE.error, "Failed to get starting balance");
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
            {"name": "due_date", "title": "Date"},
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

    buildReconActivityTableData(){
        let base = this;
        this.reconActivityTableData.columns = [
            {"name": "company_id", "title": "company ID","visible":false},
            {"name": "bank_Account_id", "title": "Bank ID","visible":false},
            {"name": "bank", "title": "Bank"},
            {"name": "recon_date", "title": "Recon Date"},
            {"name": "id", "title": "Entry ID", "visible": false},
            {"name": "actions", "title": "", "type": "html", 'filterable': false}];
        this.reconActivityTableData.rows = [];
        _.each(base.reconActivity, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
                if(key == 'bank_Account_id'){
                    row[key] = entry[key];
                    row['bank'] = base.getBankAccountName(entry[key]);
                }else {
                    row[key] = entry[key];
                }
            });
            base.reconActivityTableData.rows.push(row);
        });
    };

    submitReconcile(){
        let base = this;
        if(base.selectedDepositRows.length>0 || base.selectedExpenseRows.length > 0) {
            this.loadingService.triggerLoadingEvent(true);
            let deposits = [];
            let expenses = [];
            let selected = {};
            _.each(this.selectedDepositRows, function (row) {
                let createRow = {};
                createRow['id'] = row.id;
                createRow['bank_account_id'] = base.selectedBank;
                deposits.push(createRow);
            });
            _.each(this.selectedExpenseRows, function (row) {
                let createRow = {};
                createRow['id'] = row.id;
                createRow['bank_account_id'] = base.selectedBank;
                expenses.push(createRow);
            });
            selected["deposits"] = deposits;
            selected["expenses"] = expenses;
            selected["last_recon_ending_balance"] = this.endingBalance;
            selected["last_recon_date"] = this.reconcileDate;
            selected["startingBalance"] = this.startingBalance;
            selected["sum_of_deposits"] = this.inflow;
            selected["sum_of_expenses"] = this.outflow;
            console.log(selected);
            /*this.reconcileService.createReconcile(selected,base.selectedBank)
                .subscribe(response => {
                    base.toastService.pop(TOAST_TYPE.success, "Reconcilation Successfull");
                    //this.updateStartingBalance();
                    this.resetReconcileForm();
                    this.getAccounts();
                    this.fetchReconActivityData();
                }, error => {
                    base.toastService.pop(TOAST_TYPE.error, "Failed to reconcile data");
                    this.loadingService.triggerLoadingEvent(false);
                });*/
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
                this.loadingService.triggerLoadingEvent(false);
            }, error =>  {
                this.loadingService.triggerLoadingEvent(false);
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
        this.selectedDepositRows = [];
        this.selectedExpenseRows = [];
        this.selectedDepositsCount = 0;
        this.selectedExpensesCount = 0;
        this.tabHeight = '';
        this.editable = true;
        this.tableOptions.selectable = true;
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
        //this.updateTabHeight();
    }

    updateTabHeight(){
        let base = this;
        if(jQuery('.tab-content') !== undefined) {
            let topOfDiv = jQuery('.tab-content').offset().top;
            topOfDiv = topOfDiv < 150 ? 170 : topOfDiv;
            let bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
            base.tabHeight = (bottomOfVisibleWindow - topOfDiv - 75) + "px";
            jQuery('.tab-content').css('height', base.tabHeight);
            switch (this.selectedTab) {
                case 0:
                    base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                    break;
                case 1:
                    base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                    break;
                case 2:
                    base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                    break;
            }
        }
    }

    resetDepositsTab(){
        let base =this;
        let selectedRows = [];
        jQuery(this.el.nativeElement).find("tbody tr input.checkbox").each(function(idx,cbox){
            let row = jQuery(cbox).closest('tr').data('__FooTableRow__');
            let obj = row.val();
            jQuery(cbox).attr("checked", true);
            obj.tempIsSelected = true;
            selectedRows.push(obj);
        });
        this.handleDepositsSelect(selectedRows);

    }

    resetExpensesTab() {
        let base =this;
        let selectedRows = [];
        jQuery(this.el1.nativeElement).find("tbody tr input.checkbox").each(function(idx,cbox){
            let row = jQuery(cbox).closest('tr').data('__FooTableRow__');
            let obj = row.val();
            jQuery(cbox).attr("checked", true);
            obj.tempIsSelected = true;
            selectedRows.push(obj);
        });
        this.handleExpensesSelect(selectedRows);
        this.loadingService.triggerLoadingEvent(false);

    }
    ngAfterViewInit() {
        if(!this.showForm) {
            let base = this;
            jQuery(document).ready(function () {
                //base.updateTabHeight();
            });
        }
    }
}
