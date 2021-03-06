/**
 * Created by Chandu on 28-09-2016.
 */

import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {ToastService} from "qCommon/app/services/Toast.service";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {TOAST_TYPE, PATH} from "qCommon/app/constants/Qount.constants";
import {FinancialAccountForm} from "../forms/FinancialAccount.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {YodleeService} from "../services/Yodlee.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {CURRENCY_LOCALE_MAPPER} from "qCommon/app/constants/Currency.constants";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare var jQuery:any;
declare var _:any;
declare var moment:any;

@Component({
  selector: 'financial-accounts',
  templateUrl: '../views/financialAccounts.html',
})

export class FinancialAccountsComponent{
  accountForm: FormGroup;
  accounts = [];
  newFormActive:boolean = true;
  @ViewChild('addAccount') addAccount;
  @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
  @ViewChild('transitCOAComboBoxDir') transitCOAComboBox: ComboBox;
  hasAccounts: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  currentCompany:any;
  row:any;
  tempValues:Array<string> = [];
  tableColumns:Array<string> = ['name', 'id', 'starting_balance', 'current_balance', 'no_effect_on_pl', 'is_credit_account', 'starting_balance_date', 'chart_of_account_id','transit_chart_of_account_id'];
  importType:string = 'MANUAL';
  /*banks:Array<any> = [];*/
  showFlyout:boolean = false;
  chartOfAccounts:Array<any>=[];

  showYodleeWidget:boolean = false;
  rsession:string = "";
  token:string = "";
  callBackUrl = "";
  currentAccountId:string;
  accountSubmitted:boolean;

  companyCurrency:string='USD';
  showPaymentInfo:boolean = false;
  dateFormat:string;
  serviceDateformat:string;

  selectedAccount:any;
  localeFortmat:string='en-US';
  bankCoa:Array<any>=[];
  creditCoa:Array<any>=[];
  routeSubscribe:any;
  finActTableColumns: Array<any> = ['Name', 'Chart of Account', 'Start Balance Date', 'Starting Balance', 'Current Balance'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
  showDownloadIcon:string = "hidden";

  constructor(private _router:Router,private _fb: FormBuilder, private _financialAccountForm: FinancialAccountForm, private coaService: ChartOfAccountsService, private loadingService:LoadingService,
              private financialAccountsService: FinancialAccountsService, private toastService: ToastService,
              private yodleeService: YodleeService, private switchBoard:SwitchBoard,private dateFormater: DateFormater,
              private numeralService:NumeralService,private titleService:pageTitleService, private reportsService: ReportService){
    this.titleService.setPageTitle("Financial Accounts");
    this.accountForm = this._fb.group(_financialAccountForm.getForm());
    this.currentCompany = Session.getCurrentCompany();
    this.companyCurrency=Session.getCurrentCompanyCurrency();
    this.localeFortmat=CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]?CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]:'en-US';
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
    if(this.currentCompany){
      this.loadingService.triggerLoadingEvent(true);
      this.coaService.chartOfAccounts(this.currentCompany)
          .subscribe(chartOfAccounts => {
            chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
            this.bankCoa=_.filter(chartOfAccounts, {'type': 'bank'});
            this.creditCoa=_.filter(chartOfAccounts, {'type': 'creditCard'});
            this.chartOfAccounts = chartOfAccounts;
            this.getFinancialAccounts(this.currentCompany);
          }, error =>{
            this.loadingService.triggerLoadingEvent(false);
            this.toastService.pop(TOAST_TYPE.error, "Failed To Load Chart Of Accounts");
          });
    } else{
      this.toastService.pop(TOAST_TYPE.warning, "No Default Company set. Please Hop To A Company");
    }

    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      if(this.showFlyout){
        this.hideFlyout();
      }else {
        this.toolsRedirect();
      }
    });
  }

  toolsRedirect(){
    let link = ['tools'];
    this._router.navigate(link);
  }

  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could Not Perform Operation");
  }

  setBalanceDate(date){
    let dateControl:any = this.accountForm.controls['starting_balance_date'];
    dateControl.patchValue(date);
  }

  showAddAccount() {
    this.titleService.setPageTitle("CRETAE ACCOUNT");
    this.editMode = false;
    this.newForm();
    this.accountForm = this._fb.group(this._financialAccountForm.getForm());
    this.showFlyout = true;
  }

  showEditAccount(row: any){
    this.titleService.setPageTitle("UPDATE ACCOUNT");
    this.editMode = true;
    this.newForm();
    this.getAccountDetails(row.id);
  }

  getAccountDetails(accountId){
    let base = this;
    this.loadingService.triggerLoadingEvent(true);
    this.financialAccountsService.financialAccount(accountId, this.currentCompany)
        .subscribe(account => {
          account = account.account || {};
          this.onTypeSelect(account.type);
          this.selectedAccount = account;
          this.showFlyout = true;
          this.loadingService.triggerLoadingEvent(false);
          account.starting_balance_date = base.dateFormater.formatDate(account.starting_balance_date,base.serviceDateformat,base.dateFormat);
          this._financialAccountForm.updateForm(this.accountForm, account);
          let coa = _.find(this.chartOfAccounts, {'id': account.chart_of_account_id});
          let transitCOA=_.find(this.chartOfAccounts, {'id': account.transit_chart_of_account_id});//
          setTimeout(function(){
            base.coaComboBox.setValue(coa, 'name');
            base.transitCOAComboBox.setValue(transitCOA, 'name');
          },0);
        }, error => {
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.error, "Failed To Load Financial Account Details");
        });
  }

  removeAccount(row: any){
    let accountId = row.id;
    this.loadingService.triggerLoadingEvent(true);
    this.financialAccountsService.removeAccount(accountId, this.currentCompany)
        .subscribe(response => {
          this.getFinancialAccounts(this.currentCompany);
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.success, "Financial Account Deleted Successfully");
        }, error =>{
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.error, "Failed To Delete Financial Account");
        })
  }

  newForm(){
    this.newFormActive = false;
    setTimeout(()=> this.newFormActive=true, 0);
  }

  ngOnInit(){

  }

  ngOnDestroy(){
    this.routeSubscribe.unsubscribe();
  }

  updateChartOfAccount(coa){
    let data = this._financialAccountForm.getData(this.accountForm);
    if(coa && coa.id){
      data.chart_of_account_id = coa.id;
    }else if(!coa||coa=='--None--'){
      data.chart_of_account_id='--None--';
    }
    this._financialAccountForm.updateForm(this.accountForm, data);
  }

  updateTransitChartOfAccount(transitCOA){
    let data = this._financialAccountForm.getData(this.accountForm);
    if(transitCOA && transitCOA.id){
      data.transit_chart_of_account_id = transitCOA.id;
    }else if(!transitCOA||transitCOA=='--None--'){
      data.transit_chart_of_account_id='--None--';
    }
    this._financialAccountForm.updateForm(this.accountForm, data);
  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditAccount($event);
    } else if(action == 'delete'){
      this.removeAccount($event);
    }
    else if(action == 'Navigation'){
      let link = ['Verification', $event.id];
      this._router.navigate(link);
    }
  }

  submit($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._financialAccountForm.getData(this.accountForm);
    data.starting_balance_date = this.dateFormater.formatDate(data.starting_balance_date,this.dateFormat,this.serviceDateformat);
    this.loadingService.triggerLoadingEvent(true);
    if(data.chart_of_account_id=='--None--'||data.chart_of_account_id==''){
      this.toastService.pop(TOAST_TYPE.warning, "Please Select Chart Of Account");
      this.loadingService.triggerLoadingEvent(false);
      return;
    }if(data.transit_chart_of_account_id=='--None--'||data.transit_chart_of_account_id==''){
      this.toastService.pop(TOAST_TYPE.warning, "Please Select Transit COA");
      this.loadingService.triggerLoadingEvent(false);
      return;
    }
    delete data.importType;
    if(this.editMode){
      this.financialAccountsService.updateAccount(data, this.currentCompany)
          .subscribe(response => {

            this.currentAccountId = response.id;
            this.toastService.pop(TOAST_TYPE.success, "Financial Account Updated Successfully");
            this.getFinancialAccounts(this.currentCompany);
            this.accountSubmitted = true;
            this.showFlyout = false;
            if(this.showYodleeWidget) {
              this.launchYodleeWidget();
            }
            this.titleService.setPageTitle("Financial Accounts");
          }, error =>{
            this.loadingService.triggerLoadingEvent(false);
            this.handleCreateError(JSON.parse(error));
            this.showFlyout = false;
          });
    } else{
      this.financialAccountsService.addAccount(data, this.currentCompany)
          .subscribe(response => {
            this.currentAccountId = response.id;
            this.toastService.pop(TOAST_TYPE.success, "Financial Account Created Successfully");
            this.getFinancialAccounts(this.currentCompany);
            this.accountSubmitted = true;
            this.showFlyout = false;
            if(this.showYodleeWidget) {
              this.launchYodleeWidget();
            }
            this.titleService.setPageTitle("Financial Accounts");
          }, error => {
            this.loadingService.triggerLoadingEvent(false);
            this.handleCreateError(JSON.parse(error));
            this.showFlyout = false;
          });
    }
  }

  handleCreateError(obj) {
    this.toastService.pop(TOAST_TYPE.error, obj.message);
  }


  handleAccount(newAccount){
    this.toastService.pop(TOAST_TYPE.success, "Financial Account Created Successfully");
    this.accounts.push(newAccount);
    this.buildTableData(this.accounts);
  }

  getFinancialAccounts(companyId){
    this.financialAccountsService.financialAccounts(companyId)
        .subscribe(response => {
          this.buildTableData(response.accounts);
        }, error => this.handleError(error));
  }

  getCOAName(id){
    let coa = _.find(this.chartOfAccounts, {'id': id});
    return (coa && coa.name) ? coa.name : "";
  }

  buildTableData(accounts) {
    this.hasAccounts = false;
    this.accounts = accounts;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "chart_of_account", "title": "Chart of Account"},
      {"name": "starting_balance_date", "title": "Start Balance Date","type":"date","sortValue": function(value){
        return moment(value,"MM/DD/YYYY").valueOf();
      }},
      {"name": "starting_balance", "title": "Starting Balance", "sortValue": function(value){
        return base.numeralService.value(value);
      },"classes": "currency-align"},
      {"name": "current_balance", "title": "Current Balance", "sortValue": function(value){
        return base.numeralService.value(value);
      },"classes": "currency-align"},
      {"name": "id", "title": "Id", "visible": false},
      {"name": "yodlee_provider_id", "title": "Yodle_Provider", "visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    this.accounts.forEach(function(account) {
      let row:any = {};
      _.each(base.tableColumns, function(key) {
        row[key] = account[key];
        if(key == 'chart_of_account_id'){
          row['chart_of_account'] = base.getCOAName(account[key]);
        }if(key=='transit_chart_of_account_id'){
          row['transit_chart_of_account_id'] = base.getCOAName(account[key]);
        }
        if(key=='starting_balance'){
          let starting_balance=account['starting_balance']?Number(account['starting_balance']):0;
          //row['starting_balance'] =starting_balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
          row[key] = {
            'options': {
              "classes": "text-right currency-padding"
            },
            value : starting_balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 })
          }
        }
        if(key=='current_balance'){
          let current_balance=account['current_balance']?Number(account['current_balance']):0;
          //row['current_balance'] =current_balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
          row[key] = {
            'options': {
              "classes": "text-right currency-padding"
            },
            value : current_balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 })
          }
        }
        if(key == 'starting_balance_date'){
          row[key] = base.dateFormater.formatDate(account[key],base.serviceDateformat,base.dateFormat);
        }
        let yodlee_action="";
        if(account.yodlee_provider_id){
          yodlee_action = "<a class='action'><i class='icon ion-reply'></i></a>";
        }

        if(account.drop_verified==false) {
          let verify = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>V</span></a>"
          row['actions'] = yodlee_action + verify + "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
        }
        else{
          row['actions'] = yodlee_action + "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
        }
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasAccounts = true;
      base.loadingService.triggerLoadingEvent(false);
    }, 0);
    setTimeout(function() {
      if(base.hasAccounts){
        base.showDownloadIcon = "visible";
      }
    },600);

  }

  setImportType(type){
    this.importType = type;
  }

  isValid(form){
    let data = this._financialAccountForm.getData(form);
    if(data.importType == 'AUTO'){
      if(!data.id || !data.user_name || !data.password){
        return true;
      }
    }
    return false;
  }

  hideFlyout(){
    this.titleService.setPageTitle("Financial Accounts");
    this.row = {};
    this.showFlyout = !this.showFlyout;
    this.showPaymentInfo = false;
    this.accountForm.reset();
  }

  launchYodleeWidget() {

    jQuery('#output_frame').attr('src',"");

    jQuery('#yodleewgt').foundation('open');

    this.yodleeService.getAccessToken(Session.getCurrentCompany()).subscribe(resp=> {
      this.rsession = resp.userSessionToken;
      this.token = resp.userAccessToken;
      this.callBackUrl = "http://dev-oneapp.qount.io"+"/yodleeToken";
      setTimeout(function(){
        jQuery("#yodleeForm").submit();
      },100);
    }, error=>{});


    this.switchBoard.onYodleeTokenRecived.subscribe(recived => {
      var status = JSON.parse(Session.get("yodleeStatus"));
      this.loadingService.triggerLoadingEvent(true);
      jQuery('#yodleewgt').foundation('close');
      this.yodleeService.submitStatus(Session.getCurrentCompany(), this.currentAccountId, status[0]).subscribe(resp=> {
        this.toastService.pop(TOAST_TYPE.success, "Account Linked Successfully");
        this.getFinancialAccounts(this.currentCompany);
        this.loadingService.triggerLoadingEvent(false);
      });

    });
  }

  unlinkYodleeAccount() {
    this.loadingService.triggerLoadingEvent(true);
    this.yodleeService.unlink(Session.getCurrentCompany(), this.selectedAccount.id, this.selectedAccount.yodlee_provider_id).subscribe(resp=> {
      this.selectedAccount.yodlee_provider_id = null;
      this.loadingService.triggerLoadingEvent(false);
      this.toastService.pop(TOAST_TYPE.success, "Account Unlinked Successfully");
    });
  }

  changeShowPaymentInfo(){
    let data = this._financialAccountForm.getData(this.accountForm);
    if(data.showPaymentInfo){
      this.showPaymentInfo = true;
    } else{
      this.showPaymentInfo = false;
    }
  }

  onTypeSelect(type){
    this.chartOfAccounts=[];
    if(type=='credit'){
      this.chartOfAccounts=this.creditCoa;
    }else {
      this.chartOfAccounts=this.bankCoa;
    }
  }

  getFinActTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      // tempData[i].starting_balance = parseFloat(tempData[i].starting_balance.value).toLocaleString(this.localeFortmat, { style: 'currency', currency: this.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      tempJsonArray["Name"] = tempData[i].name;
      tempJsonArray["Chart of Account"] = tempData[i].chart_of_account;
      tempJsonArray["Start Balance Date"] = tempData[i].starting_balance_date;
      tempJsonArray["Starting Balance"] = tempData[i].starting_balance.value;
      tempJsonArray["Current Balance"] = tempData[i].current_balance.value;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType){
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.finActTableColumns;
    this.pdfTableData.tableRows.rows = this.getFinActTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.currentCompany, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "FinanceAccounts.xls";
        link.click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF() {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.currentCompany, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "FinanceAccounts.pdf";
        link[0].click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into PDF");
      });

  }

}
