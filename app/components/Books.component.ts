/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {JournalEntriesService} from "qCommon/app/services/JournalEntries.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ExpenseService} from "qCommon/app/services/Expense.service";
import {DepositService} from "qCommon/app/services/Deposit.service";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";

declare var _:any;
declare var jQuery:any;
declare var moment:any;

@Component({
    selector: 'books',
    templateUrl: '/app/views/books.html',
})

export class BooksComponent{
    tabBackground:string = "#d45945";
    selectedTabColor:string = "#d45945";
    tabDisplay:Array<any> = [{'display':'none'},{'display':'none'},{'display':'none'},{'display':'none'}];
    bgColors:Array<string>=[
        '#d45945',
        '#d47e47',
        '#2980b9',
        '#3dc36f'
    ];

    depositsTableData:any = {};
    depositsTableOptions:any = {search:false, pageSize:7};
    expensesTableData:any = {};
    expensesTableOptions:any = {search:false, pageSize:7};
    jeTableData:any = {};
    jeTableOptions:any = {search:false, pageSize:7};

    tabHeight:string;
    badges:any = [];
    selectedTab:any=0;
    isLoading:boolean=true;
    localBadges:any={};
    boxInfo;
    routeSub:any;
    hideBoxes :boolean = true;
    selectedColor:any='red-tab';
    hasJournalEntries:boolean = false;
    hasExpenses:boolean = false;
    hasDeposits:boolean = false;
    allCompanies:Array<any>;
    currentCompany:any;
    accounts:Array<any>;
    companyCurrency: string;

    constructor(private _router:Router,private _route: ActivatedRoute, private journalService: JournalEntriesService,
                private toastService: ToastService, private loadingService:LoadingService, private companiesService: CompaniesService,
                private expenseService: ExpenseService, private accountsService: FinancialAccountsService,private depositService: DepositService) {
        let companyId = Session.getCurrentCompany();
        this.companiesService.companies().subscribe(companies => {
            this.allCompanies = companies;
            if(companyId){
                this.currentCompany = _.find(this.allCompanies, {id: companyId});
            } else if(this.allCompanies.length> 0){
                this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
            }
            this.routeSub = this._route.params.subscribe(params => {
                this.selectedTab=params['tabId'];
                this.selectTab(this.selectedTab,"");
                this.hasJournalEntries = false;
            });
            this.localBadges=JSON.parse(sessionStorage.getItem("localBooksBadges"));
            if(!this.localBadges){
                this.localBadges = {'deposits':0,'expenses':0,'journalEntries':0};
                sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
            } else{
                this.localBadges = JSON.parse(sessionStorage.getItem("localBooksBadges"));
            }
        }, error => this.handleError(error));
        this.companyCurrency = Session.getCurrentCompanyCurrency();
    }

    animateBoxInfo(boxInfo) {
        this.animateValue('payables', boxInfo.payables);
        this.animateValue('pastDue', boxInfo.pastDue);
        this.animateValue('dueToday', boxInfo.dueToday);
        this.animateValue('dueThisWeek', boxInfo.dueThisWeek);
    }

    animateValue(param, value) {
        let base = this;
        jQuery({val: value/2}).stop(true).animate({val: value}, {
            duration : 2000,
            easing: "easeOutExpo",
            step: function () {
                var _val = this.val;
                base.boxInfo[param] = Number(_val.toFixed(2));
            }
        }).promise().done(function () {
            base.boxInfo[param] = value;
        });
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
        if(this.selectedTab == 0){
            this.isLoading = false;
            this.isLoading = true;
            this.loadingService.triggerLoadingEvent(true);
            this.accountsService.financialAccounts(this.currentCompany.id)
                .subscribe(accounts => {
                    this.accounts = accounts.accounts;
                    this.depositService.deposits(this.currentCompany.id)
                        .subscribe(deposits => {
                            this.loadingService.triggerLoadingEvent(false);
                            this.buildDepositTableData(deposits.deposits);
                        }, error => this.handleError(error));
                }, error=> {

                });
        } else if(this.selectedTab == 1){
            this.isLoading = true;
            this.loadingService.triggerLoadingEvent(true);
            this.accountsService.financialAccounts(this.currentCompany.id)
                .subscribe(accounts => {
                    this.accounts = accounts.accounts;
                    this.expenseService.expenses(this.currentCompany.id)
                        .subscribe(expenses => {
                            this.loadingService.triggerLoadingEvent(false);
                            this.buildExpenseTableData(expenses.expenses);
                        }, error => this.handleError(error));
                }, error=> {

                });
        } else if(this.selectedTab == 2){
            this.isLoading = true;
            this.loadingService.triggerLoadingEvent(true);
            this.fetchJournalEntries();
        }
    }

    fetchJournalEntries(){
        this.journalService.journalEntries(this.currentCompany.id)
            .subscribe(journalEntries => {
                this.loadingService.triggerLoadingEvent(false);
                this.buildTableData(journalEntries);
            }, error => this.handleError(error));
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.showJournalEntry($event);
        } else if(action == 'reverse'){
            this.showReverseBill($event);
        } else if(action == 'delete'){
            this.removeJournalEntry($event);
        }
    }

    showReverseBill(journalEntry){
        let link = ['journalEntry', journalEntry.id, 'reverse'];
        this._router.navigate(link);
    }

    removeJournalEntry(journalEntry){
        let base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.journalService.removeJournalEntry(journalEntry.id, this.currentCompany.id)
            .subscribe(response => {
                this.loadingService.triggerLoadingEvent(false);
                base.toastService.pop(TOAST_TYPE.success, "Deleted Journal Entry successfully");
                this.fetchJournalEntries();
            }, error => {
                base.toastService.pop(TOAST_TYPE.error, "Failed to delete Journal Entry");
            });
    }

    showJournalEntry(journalEntry){
        let link = ['journalEntry', journalEntry.id];
        this._router.navigate(link);
    }

    handleError(error){
        this.toastService.pop(TOAST_TYPE.error, "Could not perform action.")
    }

    handleBadges(length, selectedTab){
        if(selectedTab ==0 ){
            this.badges.deposits = length;
            this.localBadges['deposits'] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }
        else if(selectedTab == 1){
            this.badges.expenses = length;
            this.localBadges['expenses'] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        } else if(selectedTab == 2){
            this.badges.journalEntries = length;
            this.localBadges['journalEntries'] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }
    }

    getBankAccountName(accountId){
        let account = _.find(this.accounts, {'id': accountId});
        return account? account.name: "";
    }

    buildExpenseTableData(data){
        let base = this;
        this.isLoading = false;
        this.handleBadges(data.length, 1);
        this.expensesTableData.columns = [
            {"name": "title", "title": "Title"},
            {"name": "amount", "title": "Amount"},
            //{"name": "status", "title": "Status", "type": "html", "sortable": false},
            //{"name": "paid_date", "title": "Paid Date"},
            {"name": "due_date", "title": "Expense Date"},
            {"name": "bank_account_id", "title": "Bank Account"},
            {"name": "id", "title": "id", 'visible': false},
            {"name": "actions", "title": "", "type": "html", "sortable": false}];
        this.expensesTableData.rows = [];
        data.forEach(function(expense){
            let row:any = {};
            _.each(Object.keys(expense), function(key){
                if(key == 'bank_account_id'){
                    row[key] = base.getBankAccountName(expense[key]);
                } else if(key == 'amount'){
                    let amount = parseFloat(expense[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else{
                    row[key] = expense[key];
                }

                /*else if(key == 'is_paid'){
                    if(expense.is_paid || expense.paid_date){
                        row['status']= "<button class='hollow button success'>Paid</button>";
                    } else{
                        row['status']= "<button class='hollow button alert'>Not Paid</button>";
                    }
                    row[key] = expense.is_paid? "PAID": "UNPAID";
                }*/
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.expensesTableData.rows.push(row);
        });
        if(this.expensesTableData.rows.length > 0){
            this.hasExpenses = true;
        }
    }

    buildDepositTableData(data){
        let base = this;
        this.isLoading = false;
        this.handleBadges(data.length, 0);
        this.depositsTableData.columns = [
            {"name": "title", "title": "Title"},
            {"name": "amount", "title": "Amount"},
            {"name": "date", "title": "Date"},
            {"name": "bank_account_id", "title": "Bank Account"},
            {"name": "id", "title": "id", 'visible': false},
            {"name": "actions", "title": "", "type": "html", "sortable": false}];
        this.depositsTableData.rows = [];
        data.forEach(function(expense){
            let row:any = {};
            _.each(Object.keys(expense), function(key){
                if(key == 'bank_account_id'){
                    row[key] = base.getBankAccountName(expense[key]);
                } else if(key == 'amount'){
                    let amount = parseFloat(expense[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else{
                    row[key] = expense[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.depositsTableData.rows.push(row);
        });
        if(this.depositsTableData.rows.length > 0){
            this.hasDeposits = true;
        }
    }

    buildTableData(data){
        let base = this;
        this.isLoading = false;
        this.handleBadges(data.length, 2);
        this.jeTableData.columns = [
            {"name": "number", "title": "Number"},
            {"name": "date", "title": "Date"},
            {"name": "type", "title": "Journal Type"},
            {"name": "sourceValue", "title": "Source"},
            {"name": "source", "title": "Source", 'visible': false},
            {"name": "desc", "title": "Description","visible": false},
            {"name": "category", "title": "Category","visible": false},
            {"name": "autoReverse", "title": "Auto Reverse","visible": false},
            {"name": "reversalDate", "title": "Reversal Date","visible": false},
            {"name": "recurring", "title": "Recurring","visible": false},
            {"name": "nextJEDate", "title": "Next JE Date","visible": false},
            {"name": "id", "title": "Jounral ID","visible": false},
            {"name": "recurringFrequency", "title": "Recurring Frequency","visible": false},
            {"name": "actions", "title": "", "type": "html"},
            {"name": "reverse", "title": "", "type": "html"}];
        this.jeTableData.rows = [];
        data.forEach(function(journalEntry) {
            let row: any = {};
            _.each(Object.keys(journalEntry), function (key) {
                if(key == 'source'){
                    row['sourceValue']=base.getSourceName(journalEntry[key]);
                }
                row[key] = journalEntry[key];
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            if(row['type'] == 'Original'){
                row['reverse'] = "<a style='font-size:0.6rem;color:#ffffff;margin:0px 5px 0px 0px;' class='button small action' data-action='reverse'>Reverse</a>";
            }
            base.jeTableData.rows.push(row);
        });
        if(this.jeTableData.rows.length > 0){
            this.hasJournalEntries = true;
        }
        this.hasJournalEntries = false;
        setTimeout(function(){
           base.hasJournalEntries = true;
        });
    }

    handleExpenseAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'delete'){
            this.removeExpense($event);
        } else if(action == 'edit'){
            let link = ['/expense', $event.id];
            this._router.navigate(link);
        }
    }

    handleDepositAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'delete'){
            this.removeDeposit($event);
        } else if(action == 'edit'){
            let link = ['/deposit', $event.id];
            this._router.navigate(link);
        }
    }

    removeDeposit($event){
        this.loadingService.triggerLoadingEvent(true);
        this.depositService.removeDeposit($event.id, this.currentCompany)
            .subscribe(response=> {
                this.loadingService.triggerLoadingEvent(false);
                this.badges.deposits = this.badges.deposits-1;
                this.localBadges['deposits'] = this.localBadges['deposits']-1;
                sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
                this.toastService.pop(TOAST_TYPE.success, "Deleted deposit successfully");
            }, error=>{
                this.loadingService.triggerLoadingEvent(false);
                this.toastService.pop(TOAST_TYPE.error, "Failed to delete expense");
            });
    }

    removeExpense($event){
        this.loadingService.triggerLoadingEvent(true);
        this.expenseService.removeExpense($event.id, this.currentCompany)
            .subscribe(response=> {
                this.loadingService.triggerLoadingEvent(false);
                this.badges.expenses = this.badges.expenses-1;
                this.localBadges['expenses'] = this.localBadges['expenses']-1;
                sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
                this.toastService.pop(TOAST_TYPE.success, "Deleted expense successfully");
            }, error=>{
                this.loadingService.triggerLoadingEvent(false);
                this.toastService.pop(TOAST_TYPE.error, "Failed to delete expense");
            });
    }

    getSourceName(source){
        let result = source;
        switch(source){
            case 'manual':
                result = 'Manual';
                break;
            case 'payroll':
                result = 'Payroll';
                break;
            case 'accountsPayable':
                result = 'Accounts Payable';
                break;
            case 'accountsReceivable':
                result = 'Accounts Receivable';
                break;
            case 'inventory':
                result = 'Inventory';
                break;
        }
        return result;
    }

    reRoutePage(tabId) {
        let link = ['books', tabId];
        this._router.navigate(link);
    }

    ngOnInit() {
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
                base.depositsTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 1:
                base.expensesTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 2:
                base.jeTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
        }
    }
    ngAfterViewInit() {
        let base = this;
        jQuery(document).ready(function() {
            base.updateTabHeight();
        });
    }

    ngOnDestroy(){
        this.routeSub.unsubscribe();
    }

    addNewJE(){
        let link = ['JournalEntry'];
        this._router.navigate(link);
    }

    createNewExpense(){
        let link = ['Expense'];
        this._router.navigate(link);
    }
    createDeposit(){
        let link = ['deposit'];
        this._router.navigate(link);
    }
}
