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
import {NumeralService} from "qCommon/app/services/Numeral.service";




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
    unreconciledTableOptions:any = {search:true,pageSize:6,selectable:false};
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
    reconType:any='new';
    tabHeight:string;
    @ViewChild('depositsTable') el:ElementRef;
    @ViewChild('expensesTable') el1:ElementRef;
    @ViewChild('global-checkbox') el2:ElementRef;
    editable:boolean = true;
    localeFortmat:string='en-US';

    constructor(private _fb: FormBuilder, private _reconcileForm: ReconcileForm,private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
                private loadingService: LoadingService, private reconcileService: ReconcileService, private accountsService: FinancialAccountsService, private companyService: CompaniesService,private numeralService:NumeralService) {
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
        if($event.type == 'expense'){
            let link = ['/expense', $event.id];
            this._router.navigate(link);
        }
        if($event.type == 'deposit'){
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
        let base = this;
        this.editable = false;
        this.loadingService.triggerLoadingEvent(true);
        this.reconcileService.getReconDetails($event)
            .subscribe(reconcileDetails => {
                this.showForm = false;
                this.reconcileData = reconcileDetails;
                this.selectedDepositsCount = reconcileDetails.deposits.length;
                this.selectedExpensesCount = reconcileDetails.expenses.length;
                if(this.reconcileData.unreconciled_deposits.length > 0){
                    _.each(this.reconcileData.unreconciled_deposits,function(entry){
                        base.reconcileData.deposits.push(entry);
                    });
                }
                if(this.reconcileData.unreconciled_expense.length > 0){
                    _.each(this.reconcileData.unreconciled_expense,function(entry){
                        base.reconcileData.expenses.push(entry);
                    });
                }
                this.selectedBankName = $event.bank;
                let amount = reconcileDetails.ending_balance;
                amount = parseFloat(amount);
                this.endingBalance = amount;
                this.startingBalance = reconcileDetails.starting_balance;
                this.inflow = reconcileDetails.sum_of_deposits;
                this.outflow = reconcileDetails.sum_of_expenses;
                this.statementEndingBalance = amount;
                this.tableOptions.selectable = true;
                this.reconDifference = 0;
                this.buildDepositsTableData();
                this.buildExpensesTableData();
                setTimeout(function(){
                    base.resetDepositsTab(true,'edit');
                    base.resetExpensesTab(true,'edit');
                    //base.updateTabHeight();
                },1000);
                this.selectTab(0,'');
                this.reconType = 'edit';
                //this.loadingService.triggerLoadingEvent(false);
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
        this.reconType = 'new';
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
                this.endingBalance = amount;
                this.buildDepositsTableData();
                this.buildExpensesTableData();
                //this.buildTableData();
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
            {"name": "type", "title": "Type","visible": false},
            {"name": "title", "title": "Title"},
            {"name": "date", "title": "Date"},
            {"name": "amount", "title": "Amount","classes": "currency-align currency-padding"},
            {"name": "id", "title": "Entry ID", "visible": false},
            {"name": "recon", "title": "reconcile", "visible": false},
            {"name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false}];

        this.depositsTableData.rows = [];
        _.each(base.reconcileData.deposits, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
                if(key == 'amount'){
                    let amount = parseFloat(entry[key]);
                    //row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value : amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }
                } else{
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.depositsTableData.rows.push(row);
        });

    };


    buildExpensesTableData(){
        let base = this;
        this.expensesTableData.columns = [
            {"name": "type", "title": "Type","visible": false},
            {"name": "title", "title": "Title"},
            {"name": "due_date", "title": "Date"},
            {"name": "amount", "title": "Amount","classes": "currency-align currency-padding"},
            {"name": "id", "title": "Entry ID", "visible": false},
            {"name": "recon", "title": "reconcile", "visible": false},
            {"name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false}];

        this.expensesTableData.rows = [];
        _.each(base.reconcileData.expenses, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
                if(key == 'amount'){
                    let amount = parseFloat(entry[key]);
                    //row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value : amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }
                } else{
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
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
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
    };

    buildReconActivityTableData(){
        let base = this;
        this.reconActivityTableData.columns = [
            {"name": "company_id", "title": "company ID","visible":false,'filterable': false},
            {"name": "bank_Account_id", "title": "Bank ID","visible":false,'filterable': false},
            {"name": "bank", "title": "Account"},
            {"name": "last_Recon_date", "title": "Recon Date"},
            {"name": "recon_done_date", "title": "Recon Completed On"},
            {"name": "id", "title": "Entry ID", "visible": false,'filterable': false},
            {"name": "ending_balance", "title": "Ending Balance", "formatter": (amount)=>{
                amount = parseFloat(amount);
                return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }, "sortValue": function(value){
                return base.numeralService.value(value);
            },"classes": "currency-align currency-padding"},
            {"name": "actions", "title": "", "type": "html", 'filterable': false}];
        this.reconActivityTableData.rows = [];
        _.each(base.reconActivity, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
                if(key == 'bank_Account_id'){
                    row[key] = entry[key];
                    row['bank'] = base.getBankAccountName(entry[key]);
                }else if(key == 'recon_done_date'){
                    row[key] = moment(entry[key]).format('MM/DD/YYYY');
                }else if(key == 'ending_balance'){
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value : entry[key]
                    }
                }else {
                    row[key] = entry[key];
                }
            });
            base.reconActivityTableData.rows.push(row);
        });
    };

    submitReconcile(){
        let base = this;
        this.hasData = false;
        if(base.selectedDepositRows.length>0 || base.selectedExpenseRows.length > 0) {
            //this.loadingService.triggerLoadingEvent(true);
            let deposits = [];
            let expenses = [];
            let unreconciled_deposits = [];
            let unreconciled_expenses = [];
            let selected = {};
            _.each(this.reconcileDataCopy.deposits,function(deposit) {
                if(!_.find(base.selectedDepositRows,{id:deposit.id})){
                    unreconciled_deposits.push(deposit.id)
                }
            });
            _.each(this.reconcileDataCopy.expenses,function(expense) {
                if(!_.find(base.selectedExpenseRows,{id:expense.id})){
                    unreconciled_expenses.push(expense.id)
                }
            });
            _.each(this.selectedDepositRows, function (row) {
                deposits.push(row.id);
            });
            _.each(this.selectedExpenseRows, function (row) {
                expenses.push(row.id);
            });
            selected["deposits"] = deposits;
            selected["expenses"] = expenses;
            selected["unreconciled_deposits"] = unreconciled_deposits;
            selected["unreconciled_expenses"] = unreconciled_expenses;
            selected["last_recon_ending_balance"] = this.endingBalance;
            selected["last_recon_date"] = this.reconcileDate;
            selected["starting_balance"] = this.startingBalance;
            selected["sum_of_deposits"] = this.inflow;
            selected["sum_of_expenses"] = this.outflow;
            this.reconcileService.createReconcile(selected,base.selectedBank)
                .subscribe(response => {
                    base.toastService.pop(TOAST_TYPE.success, "Reconcilation Successfull");
                    //this.updateStartingBalance();
                    this.resetReconcileForm();
                    this.getAccounts();
                    this.fetchReconActivityData();
                }, error => {
                    base.toastService.pop(TOAST_TYPE.error, "Failed to reconcile data");
                    this.loadingService.triggerLoadingEvent(false);
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
                this.loadingService.triggerLoadingEvent(false);
            }, error =>  {
                this.loadingService.triggerLoadingEvent(false);
                base.toastService.pop(TOAST_TYPE.error, "Failed to update reconcile date");
            });
    }

    resetReconcileForm(){
        this.showForm = true;
        this.inflow= null;
        this.outflow= null;
        this.endingBalance= null;
        this.statementInflow = null;
        this.statementOutflow = null;
        this.statementEndingBalance= null;
        this.selectedRows= [];
        this.startingBalance = null;
        this.selectedDepositRows = [];
        this.selectedExpenseRows = [];
        this.selectedDepositsCount = null;
        this.selectedExpensesCount = null;
        this.tabHeight = '';
        this.editable = true;
        this.reconDifference = null;
        this.tableOptions.selectable = true;
        this.reconType = 'new';
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

    resetDepositsTab(state,type){
        let base =this;
        let selectedRows = [];
        jQuery(this.el.nativeElement).find("tbody tr input.checkbox").each(function(idx,cbox){
            let row = jQuery(cbox).closest('tr').data('__FooTableRow__');
            let obj = row.val();
            if(type =='edit' && obj.recon == 1) {
                jQuery(cbox).attr("disabled", state);
                jQuery(cbox).prop("checked", state);
            }else if(type == 'new'){
                jQuery(cbox).removeAttr('checked');
                jQuery(cbox).prop("checked", state);
                obj.tempIsSelected = state;
                selectedRows.push(obj);
            }
        });
        if(type == 'new') {
            this.handleDepositsSelect(selectedRows);
        }
    }

    resetExpensesTab(state,type) {
        let base =this;
        let selectedRows = [];
        jQuery(this.el1.nativeElement).find("tbody tr input.checkbox").each(function(idx,cbox){
            let row = jQuery(cbox).closest('tr').data('__FooTableRow__');
            let obj = row.val();
            if(type=='edit' && obj.recon == 1) {
                jQuery(cbox).attr("disabled", state);
                jQuery(cbox).prop("checked", state);
            }else if(type == 'new'){
                jQuery(cbox).removeAttr('checked');
                jQuery(cbox).prop("checked", state);
                obj.tempIsSelected = state;
                selectedRows.push(obj);
            }

        });
        if(type == 'new') {
            this.handleExpensesSelect(selectedRows);
        }
        this.loadingService.triggerLoadingEvent(false);
    };

    selectAll(type,state){
        if(type=='deposits'){
            this.resetDepositsTab(state,'new');
        }else{
            this.resetExpensesTab(state,'new');
        }
    }

    ngAfterViewInit() {
        let base = this;
        jQuery(document).ready(function () {
            //base.updateTabHeight();
        });
    }
}
