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
import {BadgeService} from "qCommon/app/services/Badge.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {ReconcileService} from "../services/Reconsile.service";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";



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

    uncategorizedEntries:any = 0;
    depositsTableData:any = {};
    depositsTableOptions:any = {search:true, pageSize:7};
    expensesTableData:any = {};
    expensesTableOptions:any = {search:true, pageSize:7};
    jeTableData:any = {};
    jeTableOptions:any = {search:true, pageSize:7};

    tabHeight:string;
    badges:any = [];
    selectedTab:any='deposits';
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
    ruleToDelete:any;
    confirmSubscription: any;
    DepositToDelete:any;
    journalToDelete:any;
    unreconciledCount:number;
    dateFormat:string;
    serviceDateformat:string;
    localeFortmat:string='en-US';
    categoryData:any = {'depreciation':'Depreciation','payroll':'Payroll','apBalance':'AP balance','arBalance':'AR balance','inventory':'Inventory','credit':'Credit','bill':'Bill','billPayment':'Payment','deposit':'Deposit','expense':'Expense','amortization':'Amortization','openingEntry':'Opening Entry','creditMemo':'Credit Memo','cashApplication':'Cash Application','other':'Other'};
    constructor(private _router:Router,private _route: ActivatedRoute, private journalService: JournalEntriesService,
                private toastService: ToastService,private switchBoard:SwitchBoard, private loadingService:LoadingService, private companiesService: CompaniesService,
                private expenseService: ExpenseService, private accountsService: FinancialAccountsService,private depositService: DepositService,
                private badgesService: BadgeService, private reconcileService: ReconcileService,private dateFormater: DateFormater,private numeralService:NumeralService) {
        let companyId = Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();

        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => {
            switch (this.selectedTab) {
                case 0:
                    this.removeDepo(toast);
                    break;
                case 1:
                    this.removeExp(toast);
                    break;
                case 2:
                    this.removeJournal(toast);
                    break;
                default:
                    this.removeDepo(toast);
                    break;
            }
        });
        this.companiesService.companies().subscribe(companies => {
            this.allCompanies = companies;
            if(companyId){
                this.currentCompany = _.find(this.allCompanies, {id: companyId});
            } else if(this.allCompanies.length> 0){
                this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
            }
            this.routeSub = this._route.params.subscribe(params => {
                if(params['tabId']=='deposits'){
                    this.selectTab(0,"");
                    this.hasDeposits = false;
                }
                else if(params['tabId']=='expenses'){
                    this.selectTab(1,"");
                    this.hasExpenses = false;
                }
                else if(params['tabId']=='journalEntries'){
                    this.selectTab(2,"");
                    this.hasJournalEntries = false;
                }
                else{
                    console.log("error");
                }
            });
            this.localBadges=JSON.parse(sessionStorage.getItem("localBooksBadges"));
            if(!this.localBadges){
                this.localBadges = {'deposits':0,'expenses':0,'journalEntries':0};
                sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
            } else{
                this.localBadges = JSON.parse(sessionStorage.getItem("localBooksBadges"));
            }
            this.getBookBadges();
        }, error => this.handleError(error));
        this.companyCurrency = Session.getCurrentCompanyCurrency();
    }

    getBookBadges(){
        this.badgesService.getBooksBadgeCount(this.currentCompany.id).subscribe(badges => {
            let journalCount = badges.journals;
            let depositCount = badges.deposits;
            let expenseCount = badges.expenses;
            this.uncategorizedEntries = badges.total_uncategorized;
            this.localBadges = {'deposits':depositCount,'expenses':expenseCount,'journalEntries':journalCount};
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }, error => this.handleError(error));

        this.reconcileService.getUnreconciledCount().subscribe(response => {
            this.unreconciledCount = response.unreconciled_count;
        }, error => this.handleError(error));
    }

    showCategorizationScreen(){
        let link = ['categorization'];
        this._router.navigate(link);
    }
    showReconsileScreen(){
        let link = ['reconcilation'];
        this._router.navigate(link);
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

    fetchExpenses(){
        this.accountsService.financialAccounts(this.currentCompany.id)
            .subscribe(accounts => {
                this.accounts = accounts.accounts;
                this.expenseService.expenses(this.currentCompany.id)
                    .subscribe(expenses => {
                        this.buildExpenseTableData(expenses.expenses);
                    }, error => this.handleError(error));
            }, error=> {
                this.loadingService.triggerLoadingEvent(false);
            });
    }

    fetchDeposits(){
        this.accountsService.financialAccounts(this.currentCompany.id)
            .subscribe(accounts => {
                this.accounts = accounts.accounts;
                this.depositService.deposits(this.currentCompany.id)
                    .subscribe(deposits => {
                        this.buildDepositTableData(deposits.deposits);
                    }, error => this.handleError(error));
            }, error=> {
                this.loadingService.triggerLoadingEvent(false);
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
        this.loadingService.triggerLoadingEvent(true);
        if(this.selectedTab == 0){
            this.isLoading = true;
            this.fetchDeposits();
        } else if(this.selectedTab == 1){
            this.isLoading = true;
            this.fetchExpenses();
        } else if(this.selectedTab == 2){
            this.isLoading = true;
            this.fetchJournalEntries();
        }
    }

    fetchJournalEntries(){
        this.journalService.journalEntries(this.currentCompany.id)
            .subscribe(journalEntries => {
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
        } else if(action=='Navigation'){
            if($event.sourceID&&$event.sourceType=='bill'&&$event.source=='accountsPayable'){
                let link = ['payments/bill',Session.getCurrentCompany(),$event.sourceID,'enter'];
                this._router.navigate(link);
            }else if($event.sourceID&&$event.sourceType=='credit'){
                let link = ['payments/credit',Session.getCurrentCompany(),$event.sourceID];
                this._router.navigate(link);
            }else if($event.sourceID&&$event.sourceType=='deposit'&&$event.source=='inflow'){
                let link = ['/deposit',$event.sourceID];
                this._router.navigate(link);
            }else if($event.sourceID&&$event.sourceType=='expense'&&$event.source=='outflow'){
                let link = ['/expense',$event.sourceID];
                this._router.navigate(link);
            }else if($event.sourceID&&$event.sourceType=='payment'&&$event.source=='accountsPayable'){
                let link = ['/payments', $event.sourceID];
                this._router.navigate(link);

            }
        }
    }

    showReverseBill(journalEntry){
        let link = ['journalEntry', journalEntry.id, 'reverse'];
        this._router.navigate(link);
    }


    removeJournalEntry(row:any){
        this.journalToDelete = row.id;
        this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }
    removeJournal(toast){
        let base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.journalService.removeJournalEntry(this.journalToDelete, this.currentCompany.id)
            .subscribe(response => {
                this.loadingService.triggerLoadingEvent(false);
                base.toastService.pop(TOAST_TYPE.success, "Deleted Journal Entry successfully");
                this.hasJournalEntries = false;
                this.selectTab(2,"");
                this.getBookBadges();
            }, error => {
                this.loadingService.triggerLoadingEvent(false);
                base.toastService.pop(TOAST_TYPE.error, "Failed to delete Journal Entry");
            });
    }

    showJournalEntry(journalEntry){
        let link = ['journalEntry', journalEntry.id];
        this._router.navigate(link);
    }

    handleError(error){
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(TOAST_TYPE.error, "Could not perform action.")
    }

    handleBadges(length, selectedTab){
        if(selectedTab ==0 ){
            this.badges.deposits = length;
            this.localBadges[0] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }
        else if(selectedTab == 1){
            this.badges.expenses = length;
            this.localBadges[1] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        } else if(selectedTab == 2){
            this.badges.journalEntries = length;
            this.localBadges[2] = length;
            sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
        }
    }

    getBankAccountName(accountId){
        let account = _.find(this.accounts, {'id': accountId});
        return account? account.name: "";
    }

    buildExpenseTableData(data){
        let base = this;
        this.expensesTableData.search = true;
        this.handleBadges(data.length, 1);
        this.expensesTableData.columns = [
            {"name": "title", "title": "Title"},
            {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
                amount = parseFloat(amount);
                return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }, "sortValue": function(value){
                return base.numeralService.value(value);
            }},
            //{"name": "status", "title": "Status", "type": "html", "sortable": false},
            //{"name": "paid_date", "title": "Paid Date"},
            {"name": "due_date", "title": "Expense Date","type":"date","sortValue": function(value){
                return moment(value,"MM/DD/YYYY").valueOf();
            }},
            {"name": "bank_account_id", "title": "Bank Account"},
            {"name": "id", "title": "id", 'visible': false, 'filterable': false},
            {"name": "journal_id", "title": "Journal ID", 'visible': false, 'filterable': false},
            {"name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false}];
        this.expensesTableData.rows = [];
        data.forEach(function(expense){


            let row:any = {};
            _.each(Object.keys(expense), function(key){
                if(key == 'bank_account_id'){
                    row[key] = base.getBankAccountName(expense[key]);
                } else if(key == 'amount'){
                    let amount = parseFloat(expense[key]);
                    row[key] = amount.toFixed(2); // just to support regular number with .00
                }else if(key == 'due_date'){
                    row[key] = base.dateFormater.formatDate(expense[key],base.serviceDateformat,base.dateFormat);
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
            if(expense.journal_id){
                row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            } else{
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.expensesTableData.rows.push(row);
        });
        if(data.length > 0){
            this.hasExpenses = true;
            this.isLoading=false;
        }else {
            this.hasExpenses = false;
            this.isLoading=false;
        }
        /*this.hasExpenses = false;
         setTimeout(function(){
         base.hasExpenses = true;
         });*/
        this.loadingService.triggerLoadingEvent(false);
    }

    buildDepositTableData(data){
        let base = this;
        this.handleBadges(data.length, 0);
        this.depositsTableData.search = true;
        this.depositsTableData.columns = [
            {"name": "title", "title": "Title"},
            {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
                amount = parseFloat(amount);
                return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }, "sortValue": function(value){
                return base.numeralService.value(value);
            }},
            {"name": "date", "title": "Date","type":"date","sortValue": function(value){
                return moment(value,"MM/DD/YYYY").valueOf();
            }},
            {"name": "bank_account_id", "title": "Bank Account"},
            {"name": "id", "title": "id", 'visible': false, 'filterable': false},
            {"name": "journal_id", "title": "Journal ID", 'visible': false, 'filterable': false},
            {"name": "actions", "title": "", "type": "html", "sortable": false, 'filterable': false}];
        this.depositsTableData.rows = [];
        data.forEach(function(expense){
            let row:any = {};
            _.each(Object.keys(expense), function(key){
                if(key == 'bank_account_id'){
                    row[key] = base.getBankAccountName(expense[key]);

                }  else if(key == 'amount'){
                    let amount = parseFloat(expense[key]);
                    //row[key] = amount.toLocaleString(base.companyCurrency, {currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }) // just to support regular number with .00
                    row[key] = amount.toFixed(2);
                }else if(key == 'date'){
                    row[key] = base.dateFormater.formatDate(expense[key],base.serviceDateformat,base.dateFormat);
                }else{
                    row[key] = expense[key];
                }
            });
            if(expense.journal_id){
                row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            } else{
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.depositsTableData.rows.push(row);
        });
        if(data.length > 0){
            this.hasDeposits = true;
            this.isLoading=false;
        }else {
            this.hasDeposits = false;
            this.isLoading=false;
        }
        /*this.hasDeposits = false;
         setTimeout(function(){
         base.hasDeposits = true;
         });*/
        base.loadingService.triggerLoadingEvent(false);
    }
    buildTableData(data){
        let base = this;
        this.handleBadges(data.length, 2);
        this.jeTableData.columns = [
            {"name": "number", "title": "Number"},
            {"name": "date", "title": "Date","type":"date","sortValue": function(value){
                return moment(value,"MM/DD/YYYY").valueOf();
            }},
            {"name": "type", "title": "Journal Type","visible":false, 'filterable': false},
            {"name": "categoryValue", "title": "Category"},
            {"name": "sourceValue", "title": "Source"},
            {"name": "source", "title": "Source", 'visible': false, 'filterable': false},
            {"name": "desc", "title": "Description","visible": false, 'filterable': false},
            {"name": "category", "title": "Category","visible": false, 'filterable': false},
            {"name": "autoReverse", "title": "Auto Reverse","visible": false, 'filterable': false},
            {"name": "reversalDate", "title": "Reversal Date","visible": false, 'filterable': false},
            {"name": "recurring", "title": "Recurring","visible": false, 'filterable': false},
            {"name": "nextJEDate", "title": "Next JE Date","visible": false, 'filterable': false},
            {"name": "sourceID", "title": "Bill ID","visible": false, 'filterable': false},
            {"name": "sourceType", "title": "Type","visible": false, 'filterable': false},
            {"name": "source", "title": "source","visible": false, 'filterable': false},
            {"name": "id", "title": "Jounral ID","visible": false, 'filterable': false},
            {"name": "recurringFrequency", "title": "Recurring Frequency","visible": false, 'filterable': false},
            {"name": "reverse", "title": "", "type": "html", 'filterable': false},
            {"name": "actions", "title": "", "type": "html", 'filterable': false}];
        this.jeTableData.rows = [];
        data.forEach(function(journalEntry) {
            let row: any = {};
            _.each(Object.keys(journalEntry), function (key) {
                if(key == 'source'){
                    row['sourceValue']=base.getSourceName(journalEntry[key]);
                }else if(key == 'category'){
                    row['categoryValue'] = base.categoryData[journalEntry[key]];
                }else if(key == 'date'){
                    row[key] = base.dateFormater.formatDate(journalEntry[key],base.serviceDateformat,base.dateFormat);
                }else {
                    row[key] = journalEntry[key];
                }
            });
            let action="<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            if(journalEntry['source'] === 'Manual'){
                action= action+"<a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            if(journalEntry['sourceID'] && journalEntry['source'] === 'accountsPayable'){
                if(journalEntry['sourceType'] === 'payment'){
                    action="<a class='action' data-action='Navigation'><span class='icon badge je-badge'>P</span></a>"+action;
                }else{
                    action="<a class='action' data-action='Navigation'><span class='icon badge je-badge'>B</span></a>"+action;
                }
            }else if(journalEntry['sourceID'] && journalEntry['source'] === 'outflow'){
                action="<a class='action' data-action='Navigation'><span class='icon badge je-badge'>E</span></a>"+action;
            }else if(journalEntry['sourceID'] && journalEntry['source'] === 'inflow'){
                action="<a class='action' data-action='Navigation'><span class='icon badge je-badge'>D</span></a>"+action;
            }else if(journalEntry['sourceID'] && journalEntry['sourceType'] === 'credit'){
                action="<a class='action' data-action='Navigation'><span class='icon badge je-badge'>C</span></a>"+action;
            }
            row['actions'] = action;

            if(row['type'] == 'Original' && journalEntry['source'] === 'Manual' && !base.isAlreadyReversed(journalEntry['id']) && journalEntry['sourceID']){
                row['reverse'] = "<a style='font-size:0.1rem;color:#ffffff;margin:0px 5px 0px 0px;' class='button small action reverseButton' data-action='reverse'>Reverse</a>";
            }
            base.jeTableData.rows.push(row);
        });
        if(data.length > 0){
            this.hasJournalEntries = true;
            this.isLoading=false;
        }else{
            this.hasJournalEntries = false;
            this.isLoading=false;
        }
        /*this.hasJournalEntries = false;
         setTimeout(function(){
         base.hasJournalEntries = true;
         });*/
        this.loadingService.triggerLoadingEvent(false);
    }

    isAlreadyReversed(journalId){
        let jeIndex = _.findIndex(this.jeTableData.rows, {'reversedFrom': journalId});
        if(jeIndex != -1){
            return true;
        }
        return false;
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
        } else if(action == 'navigation'){
            let link = ['journalEntry', $event.journal_id];
            this._router.navigate(link);
        }
    }

    handleDepositAction($event) {
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'delete') {
            this.removeDeposit($event);
        } else if (action == 'edit') {
            let link = ['/deposit', $event.id];
            this._router.navigate(link);
        }  else if(action == 'navigation'){
            let link = ['journalEntry', $event.journal_id];
            this._router.navigate(link);
        }
    }

    removeDepo(toast){
        this.loadingService.triggerLoadingEvent(true);
        this.depositService.removeDeposit(this.DepositToDelete, this.currentCompany.id)
            .subscribe(response=> {
                this.toastService.pop(TOAST_TYPE.success, "Deleted deposit successfully");
                // this.fetchDeposits();
                this.hasDeposits = false;
                this.selectTab(0,"");
                this.getBookBadges();
            }, error=>{
                this.loadingService.triggerLoadingEvent(false);
                this.toastService.pop(TOAST_TYPE.error, "Failed to delete expense");
            });
    }
    removeDeposit(row:any){
        this.DepositToDelete = row.id;
        this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }
    removeExpense(row:any){
        this.ruleToDelete = row.id;
        this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }
    removeExp(toast){
        this.loadingService.triggerLoadingEvent(true);
        this.expenseService.removeExpense(this.ruleToDelete, this.currentCompany.id)
            .subscribe(response=> {
                this.toastService.pop(TOAST_TYPE.success, "Deleted expense successfully");
                // this.fetchExpenses();
                this.hasExpenses = false;
                this.selectTab(1,"");
                this.getBookBadges();
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
            case 'inflow':
                result = 'Inflow';
                break;
            case 'outflow':
                result = 'Outflow';
                break;
        }
        return result;
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
        this.confirmSubscription.unsubscribe();
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
