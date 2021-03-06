/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE,JE_CATEGORIES} from "qCommon/app/constants/Qount.constants";
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
import {StateService} from "qCommon/app/services/StateService";
import {ReportService} from "reportsUI/app/services/Reports.service";
import {State} from "qCommon/app/models/State";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {Observable} from "rxjs/Rx";
import {CURRENCY_LOCALE_MAPPER} from "qCommon/app/constants/Currency.constants";

declare let _:any;
declare let jQuery:any;
declare let moment:any;
declare let Highcharts:any;

@Component({
  selector: 'books',
  templateUrl: '../views/books.html',
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
  reportCurrency: string;

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
  id:string;
  navigationType:string;
  key:string;
  validateLockDate:boolean=false;
  tempData:any;
  userAction:string;
  categoryData:any = JE_CATEGORIES;
  searchString: string;

  //Dashboard related declarataions
  currentFiscalStart: any;
  asOfDate: any;
  currentCompanyId: string;

  hasBoxData:boolean = false;
  reportRequest: any = {};
  hasOpexData:boolean  = false;
  opexChartOptions: any = {};
  groupedOpexDataOptions: any = {};
  hasCashBurnData: boolean = false;
  showDetailedChart: boolean = false;
  hasProfitTrendData: boolean = false;
  cashBurnDataOptions:any = {};
  profitTrendDataOptions: any = {};
  detailedReportChartOptions: any = {};
  metrics: any = {};
  routeSubscribe: any = {};
  chartColors:Array<any> = ['#44B6E8','#18457B','#00B1A9','#F06459','#22B473','#384986','#4554A4','#808CC5'];
  depositsTableColumns: Array<any> = ['Title', 'Date', 'Financial Account Name', 'Amount'];
  expenseTableColumns: Array<any> = ['Title', 'Expense Date', 'Financial Account', 'Amount'];
  journalEntriesTableColumns: Array<any> = ['Number', 'Date', 'Category', 'Source'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
  depositTypes:any={"expenseRefund":"Expense Refund","other":"Other","invoice":"Invoice","shareholder":"Shareholder"};
  showDownloadIcon:boolean = false;

  constructor(private _router:Router,private _route: ActivatedRoute, private journalService: JournalEntriesService,
              private toastService: ToastService,private switchBoard:SwitchBoard, private loadingService:LoadingService, private companiesService: CompaniesService,
              private expenseService: ExpenseService, private accountsService: FinancialAccountsService,private depositService: DepositService,
              private badgesService: BadgeService, private reconcileService: ReconcileService,private dateFormater: DateFormater,
              private numeralService:NumeralService, private stateService: StateService, private titleService:pageTitleService,
              private reportsService: ReportService) {
    let today = moment();
    this.currentCompanyId = Session.getCurrentCompany();
    this.companyCurrency = Session.getCurrentCompanyCurrency();
    this.reportCurrency = Session.getCompanyReportCurrency()? Session.getCompanyReportCurrency(): this.companyCurrency;
    this.numeralService.switchLocale(this.reportCurrency);
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
    this.localeFortmat=CURRENCY_LOCALE_MAPPER[this.companyCurrency]?CURRENCY_LOCALE_MAPPER[this.companyCurrency]:'en-US';
    this.currentFiscalStart = moment().subtract(11, 'months').startOf('month').format("MM/DD/YYYY");
    this.asOfDate = moment().format('MM/DD/YYYY');
    this.reportRequest = {
      "basis":"accrual",
      "companyID": this.currentCompanyId,
      "companyCurrency": this.companyCurrency,
      "asOfDate": this.asOfDate,
      "startDate": this.currentFiscalStart
    };
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => {
      switch (this.selectedTab) {
        case 1:
          this.removeDepo(toast);
          break;
        case 2:
          this.removeExp(toast);
          break;
        case 3:
          this.removeJournal(toast);
          break;
        default:
          this.removeDepo(toast);
          break;
      }
    });
    this.routeSub = this._route.params.subscribe(params => {
      this.setBookCurrency();
      if(params['tabId']=='dashboard'){
        this.setReportCurrency();
        this.selectTab(0,"");
      } else if(params['tabId']=='deposits'){
        this.selectTab(1,"");
        this.hasDeposits = false;
        this.showDownloadIcon = false;
      } else if(params['tabId']=='expenses'){
        this.selectTab(2,"");
        this.hasExpenses = false;
        this.showDownloadIcon = false;
      } else if(params['tabId']=='journalEntries'){
        this.selectTab(3,"");
        this.hasJournalEntries = false;
        this.showDownloadIcon = false;
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
    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      if(this.showDetailedChart){
        this.showDetailedChart = !this.showDetailedChart;
      }
    });
    this.getBookBadges();
    let state = this.stateService.pop();
    if(state){
      let data = state.data;
      this.searchString = data.searchString;
    }
  }

  setBookCurrency(){
    this.numeralService.switchLocale(this.companyCurrency);
  }

  setReportCurrency(){
    this.numeralService.switchLocale(this.reportCurrency);
  }

  addBookState(){
    let data = {
      "searchString": this.searchString
    };
    this.stateService.addState(new State('BOOKS', this._router.url, data, null, []));
  }

  setSearchString($event){
    this.searchString = $event || "";
  }

  getBookBadges(){
    this.badgesService.getBooksBadgeCount(this.currentCompanyId).subscribe(badges => {
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
    this.addBookState();
    this._router.navigate(link);
  }
  showReconsileScreen(){
    let link = ['reconcilation'];
    this.addBookState();
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
    this.accountsService.financialAccounts(this.currentCompanyId)
      .subscribe(accounts => {
        this.accounts = accounts.accounts;
        this.expenseService.expenses(this.currentCompanyId)
          .subscribe(expenses => {
            this.buildExpenseTableData(expenses.expenses);
          }, error => this.handleError(error));
      }, error=> {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  fetchDeposits(){
    this.accountsService.financialAccounts(this.currentCompanyId)
      .subscribe(accounts => {
        this.accounts = accounts.accounts;
        this.depositService.deposits(this.currentCompanyId)
          .subscribe(deposits => {
            this.buildDepositTableData(deposits.deposits);
          }, error => this.handleError(error));
      }, error=> {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  selectTab(tabNo, color) {
    this.searchString = "";
    this.selectedTab=tabNo;
    this.selectedColor=color;
    let base = this;
    this.tabDisplay.forEach(function(tab, index){
      base.tabDisplay[index] = {'display':'none'}
    });
    this.tabDisplay[tabNo] = {'display':'block'};
    this.tabBackground = this.bgColors[tabNo];
    this.loadingService.triggerLoadingEvent(true);
    this.hasBoxData = false;
    if(this.selectedTab == 0){
      this.getDashboardData();
      this.titleService.setPageTitle("BOOKS DASHBOARD");
    } else if(this.selectedTab == 1){
      this.isLoading = true;
      this.fetchDeposits();
      this.titleService.setPageTitle("DEPOSITS");
    } else if(this.selectedTab == 2){
      this.isLoading = true;
      this.fetchExpenses();
      this.titleService.setPageTitle("EXPENSES");
    } else if(this.selectedTab == 3){
      this.isLoading = true;
      this.fetchJournalEntries();
      this.titleService.setPageTitle("JOURNAL ENTRIES");
    }
  }

  fetchJournalEntries(){
    this.journalService.journalEntries(this.currentCompanyId)
      .subscribe(journalEntries => {
        this.buildTableData(journalEntries);
      }, error => this.handleError(error));
  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.addBookState();
      this.showJournalEntry($event);
    }else if(action=='je-duplicate'){
      let link = ['journalEntry/duplicate', $event.id];
      this._router.navigate(link);
    } else if(action == 'reverse'){
      this.addBookState();
      this.showReverseBill($event);
    } else if(action == 'delete'){
      this.removeJournalEntry($event);
    } else if(action=='Navigation'){
      this.addBookState();
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
    } else if (action === 'collaboration') {
      this.addBookState();
      const link = ['collaboration', 'journal', $event.id];
      this._router.navigate(link);
    }
  }

  showReverseBill(journalEntry){
    let link = ['journalEntry', journalEntry.id, 'reverse'];
    this._router.navigate(link);
  }


  removeJournalEntry(row:any){
    this.journalToDelete = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are You Sure You Want To Delete?");
  }
  removeJournal(toast){
    let base = this;
    this.loadingService.triggerLoadingEvent(true);
    this.journalService.removeJournalEntry(this.journalToDelete, this.currentCompanyId)
      .subscribe(response => {
        this.loadingService.triggerLoadingEvent(false);
        base.toastService.pop(TOAST_TYPE.success, "Deleted Journal Entry Successfully");
        this.hasJournalEntries = false;
        this.selectTab(3,"");
        this.getBookBadges();
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
        base.toastService.pop(TOAST_TYPE.error, "Failed To Delete Journal Entry");
      });
  }

  showJournalEntry(journalEntry){
    let link = ['journalEntry', journalEntry.id];
    this._router.navigate(link);
  }

  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
    this.toastService.pop(TOAST_TYPE.error, "Could Not Perform Operation")
  }

  handleBadges(length, selectedTab){
    if(selectedTab ==0 ){
      this.badges.deposits = length;
      this.localBadges[0] = length;
      sessionStorage.setItem('localBooksBadges', JSON.stringify(this.localBadges));
    } else if(selectedTab == 1){
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
    this.expensesTableData.defSearch = true;
    this.expensesTableData.defSearchString = this.searchString;
    this.handleBadges(data.length, 1);
    this.expensesTableData.columns = [
      {"name": "title", "title": "Title"},
      {"name": "due_date", "title": "Expense Date","type":"text","sortValue": function(value){
        return moment(value,base.dateFormat).valueOf();
      }},
      {"name": "bank_account_id", "title": "Financial Account"},
      {"name": "id", "title": "id", 'visible': false, 'filterable': false},
      {"name": "journal_id", "title": "Journal ID", 'visible': false, 'filterable': false},
      {"name": "cash_only_journal_id", "title": "Journal ID", 'visible': false, 'filterable': false},
      {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
        amount = parseFloat(amount);
        return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }, "sortValue": function(value){
        return base.numeralService.value(value);
      },
        "classes": "currency-align currency-padding"
      },
      {"name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false}];
    this.expensesTableData.rows = [];

    data.forEach(function(expense){
      let row:any = {};
      _.each(Object.keys(expense), function(key){
        if(key == 'bank_account_id'){
          row[key] = base.getBankAccountName(expense[key]);
        } else if(key == 'amount'){
          let amount = parseFloat(expense[key]);
          //row[key] = amount.toFixed(2); // just to support regular number with .00
          row[key] = {
            'options': {
              "classes": "text-right"
            },
            value : amount.toFixed(2)
          }
        }else if(key == 'due_date'){
          row[key] = (expense[key]) ? base.dateFormater.formatDate(expense[key],base.serviceDateformat,base.dateFormat) : expense[key];
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
      const postString = "<a class='action' data-action='collaboration'><span class='comment-badge'><i class='material-icons'>comment</i></span></a>";
      if(expense.journal_id&&expense.cash_only_journal_id){
        row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='je2navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>" + postString;
      }else if(expense.journal_id){
        row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>" + postString;
      } else{
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>" + postString;
      }
      base.expensesTableData.rows.push(row);
    });
    if(data.length > 0){
      this.hasExpenses = true;
      this.isLoading=false;
      this.displayFooTableDropdown(690);
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
    this.depositsTableData.defSearch = true;
    this.depositsTableData.defSearchString = this.searchString;
    this.depositsTableData.columns = [
      {"name": "title", "title": "Title"},
      {"name": "date", "title": "Deposit Date","type":"text","sortValue": function(value){
        return moment(value,base.dateFormat).valueOf();
      }},
      {"name": "bank_account_id", "title": "Financial Account"},
      {"name": "id", "title": "id", 'visible': false, 'filterable': false},
      {"name": "journal_id", "title": "Journal ID", 'visible': false, 'filterable': false},
      {"name": "cash_only_journal_id", "title": "Journal ID", 'visible': false, 'filterable': false},
      {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
        amount = parseFloat(amount);
        return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }, "sortValue": function(value){
        return base.numeralService.value(value);
      },
        "classes": "currency-align currency-padding"
      },
      {"name": "deposit_type", "title": "Deposit Type"},
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
          //row[key] = amount.toFixed(2);
          row[key] = {
            'options': {
              "classes": "currency-align"
            },
            value : amount.toFixed(2)
          }
        }else if(key == 'date'){
          row[key] = (expense[key]) ? base.dateFormater.formatDate(expense[key],base.serviceDateformat,base.dateFormat) : expense[key];
        }else if(key=='deposit_type'){
          row[key]=base.depositTypes[expense[key]];
        }else{
          row[key] = expense[key];
        }
      });
      const postString = "<a class='action' data-action='collaboration'><span class='comment-badge'><i class='material-icons'>comment</i></span></a>";
      if(expense.journal_id&&expense.cash_only_journal_id){
        row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='je2navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>"+ postString;
      }else if(expense.journal_id){
        row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>"+ postString;
      } else{
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>" + postString;
      }
      base.depositsTableData.rows.push(row);
    });
    if(data.length > 0){
      this.hasDeposits = true;
      this.isLoading=false;
      this.displayFooTableDropdown(700);
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
    this.jeTableData.defSearch = true;
    this.jeTableData.defSearchString = this.searchString;
    this.jeTableData.columns = [
      {"name": "number", "title": "Number", "type": "html"},
      {"name": "date", "title": "Date","type":"text","sortValue": function(value){
        return moment(value,base.dateFormat).valueOf();
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
          row['source']=journalEntry[key];
        }else if(key == 'category'){
          row['categoryValue'] = base.categoryData[journalEntry[key]];
        }else if(key == 'date'){
          row[key] = (journalEntry[key]) ? base.dateFormater.formatDate(journalEntry[key],base.serviceDateformat,base.dateFormat) : journalEntry[key];
        } else if (key == 'number') {
          row[key] = "<a class='actionOnId' data-action='edit'><span class='icon'>"+ journalEntry[key] +"</span></a>";
        }else {
          row[key] = journalEntry[key];
        }
      });
      let action = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
      if(row['createdBY']!='system'){
        action= action+"<a class='action' data-action='je-duplicate' style='margin:0px 0px 0px 5px;color: #44B6E8 !important'><i class='icon ion-ios-copy'></i></a>";
      }
      const postString = "<a class='action' data-action='collaboration'><span class='comment-badge'><i class='material-icons'>comment</i></span></a>";

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
      row['actions'] = action + postString;

      if(row['type'] == 'Original' && journalEntry['source'] === 'Manual' && !base.isAlreadyReversed(journalEntry['id']) && journalEntry['sourceID']){
        row['reverse'] = "<a style='font-size:0.1rem;color:#ffffff;margin:0px 5px 0px 0px;' class='button small action reverseButton' data-action='reverse'>Reverse</a>";
      }
      base.jeTableData.rows.push(row);
    });
    if(data.length > 0){
      this.hasJournalEntries = true;
      this.isLoading=false;
      this.displayFooTableDropdown(780);
    }else{
      this.hasJournalEntries = false;
      this.isLoading=false;
    }
    this.loadingService.triggerLoadingEvent(false);
  }

  displayFooTableDropdown(time){
    let base = this;
    setTimeout(function() {
        base.showDownloadIcon = true;
    },time);
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
      this.tempData=$event;
      this.navigationType="expense";
      this.userAction="delete";
      this.checkLockDate();
    } else if(action == 'edit'){
      this.id=$event.id;
      this.navigationType="expense";
      this.navigateToDetails();
    } else if(action == 'navigation'){
      this.addBookState();
      let link = ['journalEntry', $event.journal_id];
      this._router.navigate(link);
    } else if(action == 'je2navigation'){
      this.addBookState();
      let link = ['journalEntry', $event.cash_only_journal_id];
      this._router.navigate(link);
    } else if (action === 'collaboration') {
      this.addBookState();
      const link = ['collaboration', 'expense', $event.id];
      this._router.navigate(link);
    }
  }

  handleDepositAction($event) {
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if (action == 'delete') {
      this.tempData=$event;
      this.navigationType="deposit";
      this.userAction="delete";
      this.checkLockDate();
    } else if (action == 'edit') {
      this.id=$event.id;
      this.navigationType="deposit";
      this.userAction="edit";
      this.navigateToDetails();
    }  else if(action == 'navigation'){
      this.addBookState();
      let link = ['journalEntry', $event.journal_id];
      this._router.navigate(link);
    } else if(action == 'je2navigation'){
      this.addBookState();
      let link = ['journalEntry', $event.cash_only_journal_id];
      this._router.navigate(link);
    } else if (action === 'collaboration') {
      this.addBookState();
      const link = ['collaboration', 'deposit', $event.id];
      this._router.navigate(link);
    }
  }

  removeDepo(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.depositService.removeDeposit(this.DepositToDelete, this.currentCompanyId)
      .subscribe(response=> {
        this.toastService.pop(TOAST_TYPE.success, " Deposit Deleted successfully");
        // this.fetchDeposits();
        this.hasDeposits = false;
        this.selectTab(1,"");
        this.getBookBadges();
      }, error=>{
        this.loadingService.triggerLoadingEvent(false);
        if(error&&JSON.parse(error))
          this.toastService.pop(TOAST_TYPE.error, JSON.parse(error).message);
        else
        this.toastService.pop(TOAST_TYPE.error, "Failed To Delete Deposit");
      });
  }
  removeDeposit(row:any){
    this.DepositToDelete = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are You Sure You Want To Delete?");
  }
  removeExpense(row:any){
    this.ruleToDelete = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are You Sure You Want To Delete?");
  }
  removeExp(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.expenseService.removeExpense(this.ruleToDelete, this.currentCompanyId)
      .subscribe(response=> {
        this.toastService.pop(TOAST_TYPE.success, "Expense Deleted Successfully");
        // this.fetchExpenses();
        this.hasExpenses = false;
        this.selectTab(2,"");
        this.getBookBadges();
      }, error=>{
        this.loadingService.triggerLoadingEvent(false);
        if(error&&JSON.parse(error))
          this.toastService.pop(TOAST_TYPE.error, JSON.parse(error).message);
        else
          this.toastService.pop(TOAST_TYPE.error, "Failed To Delete Expense");
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


  ngOnInit() {
  }

  updateTabHeight() {
    let base = this;
    let topOfDiv = jQuery('.tab-content').offset().top;
    topOfDiv = topOfDiv < 150 ? 150 : topOfDiv;
    let bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
    base.tabHeight = (bottomOfVisibleWindow - topOfDiv - 25) + "px";
    jQuery('.tab-content').css('min-height', base.tabHeight);
    base.depositsTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
    base.expensesTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
    base.jeTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
  }


  reRoutePage(tabId) {
    if(tabId == 0){
      let link = ['books', 'dashboard'];
      this._router.navigate(link);
      return;
    } else if(tabId == 1){
      let link = ['books', 'deposits'];
      this._router.navigate(link);
      return;
    } else if(tabId == 2){
      let link = ['books', 'expenses'];
      this._router.navigate(link);
      return;
    } else{
      let link = ['books', 'journalEntries'];
      this._router.navigate(link);
      return;
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
    this.setBookCurrency();
    jQuery('#password-conformation').remove();
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

  checkLockDate(){
    if(Session.getLockDate()){
      if(moment(Session.getLockDate(),"MM/DD/YYYY").valueOf() > moment().valueOf()){
        jQuery('#password-conformation').foundation('open');
      }else {
        this.deleteDeposit();
      }
    }else {
      this.toastService.pop(TOAST_TYPE.error, "Please Set Company Lock Date");
    }
  }

  validateLockKey(){
    let data={
      "key":this.key
    };
    this.companiesService.validateLockKey(Session.getCurrentCompany(),data).subscribe(res=>{
      this.validateLockDate=res.validation;
      if(res.validation){
        this.closePasswordConfirmation();
        this.deleteDeposit();
      }else {
        this.toastService.pop(TOAST_TYPE.error, "Invalid Key");
      }
    },fail=>{

    })
  }
  closePasswordConfirmation(){
    this.resetPasswordConformation();
    jQuery('#password-conformation').foundation('close');
  }

  checkValidation(){
    if(this.key)
      return true;
    else return false;
  }

  navigateToDetails(){
    this.addBookState();
    if(this.navigationType==="deposit"){
      let link = ['/deposit', this.id];
      this._router.navigate(link);
    }else if(this.navigationType==="expense"){
      let link = ['/expense', this.id];
      this._router.navigate(link);
    }
  }

  deleteDeposit(){
    if(this.navigationType==="deposit"){
      this.removeDeposit(this.tempData);
    }else if(this.navigationType==="expense"){
      this.removeExpense(this.tempData);
    }
  }

  resetPasswordConformation(){
    this.key=null;
  }

  getDashboardData(){
    this.getBalanceSheetData();
    this.getOpexChartData();
    this.getCashBurnChartData();
    this.getProfitTrendData();
  }

  formatNumber(value){
    return this.numeralService.format("0.00", value);
  }

  getBalanceSheetData(){
    let base = this;
    this.loadingService.triggerLoadingEvent(true);
    this.reportRequest.type = "balanceSheet";
    let balanceSheet = this.reportsService.generateAccountReport(this.reportRequest, this.currentCompanyId);
    this.reportRequest.type = "cashBalance";
    let cashBalance = this.reportsService.generateAccountReport(this.reportRequest, this.currentCompanyId);
    this.reportRequest.type = "incomeStatement";
    let incomeStatement = this.reportsService.generateAccountReport(this.reportRequest, this.currentCompanyId);
    Observable.forkJoin(balanceSheet, cashBalance, incomeStatement).subscribe(results => {
      base.hasBoxData = true;
      this.metrics["currentRatio"] = this.formatNumber(results[0].metrics.currentRatio || 0);
      this.metrics["quickRatio"] = this.formatNumber(results[0].metrics.quickRatio || 0);
      this.metrics["cashBalance"] = this.getFormattedAmount(results[1].cashBalance || 0);
      this.metrics["gpMargin"] = this.formatNumber(results[2].margins.grossProfitMargin || 0);
      this.metrics["npMargin"] = this.formatNumber(results[2].margins.netProfitMargin || 0);
      this.metrics["opexValue"] = this.getFormattedAmount(results[2].expenses.opex.totals.total.value || 0);
      this.metrics["cogsValue"] = this.getFormattedAmount(results[2].cogs.cogs.totals.total.value || 0);
      this.loadingService.triggerLoadingEvent(false);
    }, error => {
      this.loadingService.triggerLoadingEvent(false);
      this.toastService.pop(TOAST_TYPE.error, "Failed To Get Box Data");
    });
  }

  getOpexChartData(){
    let base = this;
    this.reportRequest.type = "incomeStatement";
    this.reportRequest.metricsType = "opexPie";
    this.reportsService.generateMetricReport(this.reportRequest, this.currentCompanyId).subscribe(metricData => {
      this.hasOpexData = true;
      this.opexChartOptions = {
        colors: this.chartColors,
        credits: {
          enabled: false
        },
        legend: {
          enabled: true
        },
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
          style: {
            fontFamily: 'NiveauGroteskRegular'
          }
        },
        title: {
          text: 'Operational Expenses',
          style: {
            color: '#878787',
            fontFamily: 'NiveauGroteskLight',
            fontSize:'24'
          }
        },
        tooltip: {
          pointFormatter: function(){
            return '<b>Total: '+base.getFormattedAmount(this.y)+'</b><b>('+base.getFormattedPercentage(this.percentage)+'%)</b>';
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: false
            },
            showInLegend: true
          }
        },
        series: [{
          colorByPoint: true,
          data: base.getOpexData(metricData.data)
        }]
      };
      this.groupedOpexDataOptions = {
        colors: this.chartColors,
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
          style: {
            fontFamily: 'NiveauGroteskRegular'
          }
        },
        title: {
          text: 'Operational Expenses',
          align:'left',
          style: {
            color: '#878787',
            fontFamily: 'NiveauGroteskLight',
            fontSize:'24'
          }
        },
        subtitle: {
          text: ''
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        tooltip: {
          pointFormatter: function(){
            return '<b>Total: '+base.getFormattedAmount(this.y)+'</b><b>('+base.getFormattedPercentage(this.percentage)+'%)</b>';
          }
        },
        pie: {
          dataLabels: {
            enabled: true,
            inside: true,
            formatter: function(){
              return this.y;
            },
            distance: -40,
            color: 'white'
          },
          showInLegend: true
        },
        series: [{
          colorByPoint: true,
          data: base.getOpexData(metricData.groupedData)
        }]
      };
      this.loadingService.triggerLoadingEvent(false);
    }, error => this.handleError(error));
  }

  getOpexData(data){
    let result = [];
    _.each(data, function(obj){
      result.push({
        "name": obj.displayName,
        "y": obj.value
      });
    });
    return result;
  }

  getCashBurnChartData(){
    let base = this;
    this.reportRequest.type = "cashFlowStatement";
    this.reportRequest.metricsType = "cashBurn";
    this.reportsService.generateMetricReport(this.reportRequest, this.currentCompanyId).subscribe(metricData => {
      this.hasCashBurnData = true;
      let categories = [];
      _.each(metricData.CashFlowMOM, function(value,key){
        categories.push(key);
      });
      this.cashBurnDataOptions = {
        colors: this.chartColors,
        chart: {
          zoomType: 'xy',
          style: {
            fontFamily: 'NiveauGroteskRegular'
          }
        },
        title: {
          text: 'Cash Burn',
          align:'left',
          style: {
            color: '#878787',
            fontFamily: 'NiveauGroteskLight',
            fontSize:'24'
          }
        },
        subtitle: {
          text: '',
          align:'left'
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        xAxis: [{
          categories: categories,
          crosshair: true,
          labels: {
            style: {
              fontSize:'13px',
              fontWeight:'bold',
              color:'#878787',
              fill:'#878787'
            }
          }
        }],
        tooltip: {
          pointFormatter: function(){
            return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>: <b>'+base.getFormattedAmount(this.y)+'</b><br/>'
          },
          shared: true
        },
        yAxis: [{ // Primary yAxis
          labels: {
            style: {
              fontSize:'13px',
              color:'#878787',
              fill:'#878787'
            }
          },
          title: {
            text: '',
            style: {
              color: Highcharts.getOptions().colors[2]
            }
          },
          opposite: true

        }, { // Secondary yAxis
          gridLineWidth: 0,
          title: {
            text: '',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          labels: {
            style: {
              fontSize:'13px',
              color:'#878787',
              fill:'#878787'
            }
          }

        }, { // Tertiary yAxis
          gridLineWidth: 0,
          title: {
            text: '',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          labels: {
            format: '{value} %',
            style: {
              fontSize:'13px',
              color:'#878787',
              fill:'#878787'
            }
          },
          opposite: true
        }],
        series: [{
          name: 'Cash Burn',
          type: 'line',
          yAxis: 1,
          data: this.getDataArray(metricData["CashFlowMOM"], categories)
        }]
      };
      this.loadingService.triggerLoadingEvent(false);
    }, error => {

    });
  }

    getProfitTrendData(){
        let base = this;
        this.reportRequest.type = "incomeStatement";
        this.reportRequest.metricsType = "profitTrend";
        this.reportsService.generateMetricReport(this.reportRequest, this.currentCompanyId).subscribe(metricData => {
            this.hasProfitTrendData = true;
            this.profitTrendDataOptions = {
                colors: this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Revenue vs Expenses',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: [{
                    categories: metricData.categories,
                    crosshair: true,
                    labels: {
                        style: {
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: '#878787',
                            fill: '#878787'
                        }
                    }
                }],
                yAxis: [{ // Primary yAxis
                    labels: {
                        formatter: function () {
                            return base.getFormattedAmount(this.value);
                        },
                        style: {
                            fontSize: '13px',
                            color: '#878787',
                            fill: '#878787'
                        }
                    },
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[2]
                        }
                    },
                }],
                tooltip: {
                    pointFormatter: function(){
                        return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>: <b>'+base.getFormattedAmount(this.y)+'</b><br/>'
                    },
                    shared: true
                },
                series: [{
                    name: 'Revenue',
                    type: 'column',
                    data: this.getDataArray(metricData.Income, metricData.categories)
                }, {
                    name: 'Expenses',
                    type: 'column',
                    data: this.getDataArray(metricData.Expenses, metricData.categories)
                }]
            };
            this.loadingService.triggerLoadingEvent(false);
        }, error => {});
    }

    getDataArray(obj, categories){
      let result = [];
      _.each(categories, function(category){
        let value = obj[category] || 0;
        result.push(value);
      });
      return result;
    }

  getFormattedAmount(amount){
    return this.numeralService.format("$0,0.00", amount);
  }

  getFormattedPercentage(value){
    return this.numeralService.format("00.00", value);
  }

  formatCategories(categories){
    let result = [];
    _.each(categories, function(value){
      if(value.length > 0){
        result.push(value[0].toUpperCase()+value.slice(1));
      } else{
        result.push(value);
      }
    });
    return result;
  }

  showOtherCharts(type){
    this.showDetailedChart = true;
    if(type=='opexChart'){
      this.detailedReportChartOptions = _.clone(this.opexChartOptions);
    } else if(type=='profitTrend'){
      this.detailedReportChartOptions = _.clone(this.profitTrendDataOptions);
    } else if(type=='cashBurnChart'){
      this.detailedReportChartOptions = _.clone(this.cashBurnDataOptions);
    }
    this.detailedReportChartOptions.legend = {enabled: true};
  }


  getDepositsData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;
    // console.log("Temp Table data === ", tempData);
    for( var i in  tempData) {
      tempJsonArray = {};
      tempData[i].amount = parseFloat(tempData[i].amount.value).toLocaleString(this.localeFortmat, { style: 'currency', currency: this.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      tempJsonArray["Title"] = tempData[i].title;
      tempJsonArray["Date"] = tempData[i].date;
      tempJsonArray["Financial Account Name"] = tempData[i].bank_account_id;
      tempJsonArray["Amount"] = tempData[i].amount;

      newTableData.push(tempJsonArray);
    }
    return newTableData;
  }

  getExpensesData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempData[i].amount = parseFloat(tempData[i].amount.value).toLocaleString(this.localeFortmat, { style: 'currency', currency: this.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
      tempJsonArray["Title"] = tempData[i].title;
      tempJsonArray["Expense Date"] = tempData[i].due_date;
      tempJsonArray["Financial Account"] = tempData[i].bank_account_id;
      tempJsonArray["Amount"] = tempData[i].amount;

      newTableData.push(tempJsonArray);
    }
    return newTableData;
  }

  getJournalEntriesData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["Number"] = tempData[i].number;
      tempJsonArray["Date"] = tempData[i].date;
      tempJsonArray["Category"] = tempData[i].categoryValue;
      tempJsonArray["Source"] = tempData[i].sourceValue;

      newTableData.push(tempJsonArray);
    }
    return newTableData;
  }

  buildPdfTabledata(tabId, fileType){
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    if(tabId == 'deposits'){
      this.pdfTableData.tableHeader.values = this.depositsTableColumns;
      this.pdfTableData.tableRows.rows = this.getDepositsData(this.depositsTableData.rows);
    }else if(tabId == 'expenses'){
      this.pdfTableData.tableHeader.values = this.expenseTableColumns;
      this.pdfTableData.tableRows.rows = this.getExpensesData(this.expensesTableData.rows);
    }else if(tabId == 'journalEntries'){
      this.pdfTableData.tableHeader.values = this.journalEntriesTableColumns;
      this.pdfTableData.tableRows.rows = this.getJournalEntriesData(this.jeTableData.rows);
    }

  }

  exportToExcel(tabId) {
    this.buildPdfTabledata(tabId, "excel");
    this.reportsService.exportFooTableIntoFile(this.currentCompanyId, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = tabId+".xls";
        link.click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF(tabId) {
    this.buildPdfTabledata(tabId, "pdf");
    // let html = jQuery('<div>').append(jQuery('style').clone()).append(jQuery('#numeric').clone()).html();
    // let pdfReq={
    //   "version" : "1.1",
    //   "genericReport": {
    //     "payload": html,
    //     "footer": moment(new Date()).format("MMMM DD, YYYY HH:mm a")
    //   }
    // };

    this.reportsService.exportFooTableIntoFile(this.currentCompanyId, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = tabId+".pdf";
        link[0].click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into PDF");
      });

  }
}
