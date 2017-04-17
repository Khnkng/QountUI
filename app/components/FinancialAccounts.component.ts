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

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'financial-accounts',
  templateUrl: '/app/views/financialAccounts.html',
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


  constructor(private _router:Router,private _fb: FormBuilder, private _financialAccountForm: FinancialAccountForm, private coaService: ChartOfAccountsService, private loadingService:LoadingService,
              private financialAccountsService: FinancialAccountsService, private toastService: ToastService, private yodleeService: YodleeService, private switchBoard:SwitchBoard){
    this.accountForm = this._fb.group(_financialAccountForm.getForm());
    this.currentCompany = Session.getCurrentCompany();
    this.companyCurrency=Session.getCurrentCompanyCurrency();
    if(this.currentCompany){
      this.loadingService.triggerLoadingEvent(true);
      this.coaService.chartOfAccounts(this.currentCompany)
          .subscribe(chartOfAccounts => {
            this.chartOfAccounts = _.filter(chartOfAccounts, {'type': 'bank'});
            this.getFinancialAccounts(this.currentCompany);
          }, error =>{
            this.loadingService.triggerLoadingEvent(false);
            this.toastService.pop(TOAST_TYPE.error, "Failed to load chart of accounts");
          });
      /*this.financialAccountsService.financialInstitutions()
          .subscribe(banks => {
            this.banks = banks;
          }, error => this.handleError(error));*/
    } else{
      this.toastService.pop(TOAST_TYPE.warning, "No default company set. Please Hop to a company.");
    }
  }

  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  setBalanceDate(date){
    let dateControl:any = this.accountForm.controls['starting_balance_date'];
    dateControl.patchValue(date);
  }

  showAddAccount() {
    this.editMode = false;
    this.newForm();
    this.accountForm = this._fb.group(this._financialAccountForm.getForm());
    this.showFlyout = true;
  }

  showEditAccount(row: any){
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
          this.showFlyout = true;
          this.loadingService.triggerLoadingEvent(false);
          this._financialAccountForm.updateForm(this.accountForm, account);
          let coa = _.find(this.chartOfAccounts, {'id': account.chart_of_account_id});
          let transitCOA=_.find(this.chartOfAccounts, {'id': account.transit_chart_of_account_id});//
          setTimeout(function(){
            base.coaComboBox.setValue(coa, 'name');
            base.transitCOAComboBox.setValue(transitCOA, 'name');
          },0);
        }, error => {
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.error, "Failed to load financial account details");
        });
  }

  removeAccount(row: any){
    let accountId = row.id;
    this.loadingService.triggerLoadingEvent(true);
    this.financialAccountsService.removeAccount(accountId, this.currentCompany)
        .subscribe(response => {
          this.getFinancialAccounts(this.currentCompany);
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.success, "Deleted Account successfully");
        }, error =>{
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.error, "Failed to delete account.");
        })
  }

  newForm(){
    this.newFormActive = false;
    setTimeout(()=> this.newFormActive=true, 0);
  }

  ngOnInit(){

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
    console.log("$event",$event);
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
    this.loadingService.triggerLoadingEvent(true);
    if(data.chart_of_account_id=='--None--'||data.chart_of_account_id==''){
      this.toastService.pop(TOAST_TYPE.warning, "Please select Chart of Account");
      this.loadingService.triggerLoadingEvent(false);
      return;
    }if(data.transit_chart_of_account_id=='--None--'||data.transit_chart_of_account_id==''){
      this.toastService.pop(TOAST_TYPE.warning, "Please select Transit COA");
      this.loadingService.triggerLoadingEvent(false);
      return;
    }
    delete data.importType;
    if(this.editMode){
      this.financialAccountsService.updateAccount(data, this.currentCompany)
          .subscribe(response => {

            this.currentAccountId = response.id;
            this.toastService.pop(TOAST_TYPE.success, "Updated Financial account successfully");
            this.getFinancialAccounts(this.currentCompany);
            this.accountSubmitted = true;
            this.showFlyout = false;
            if(this.showYodleeWidget) {
              this.launchYodleeWidget();
            }
          }, error =>{
            this.loadingService.triggerLoadingEvent(false);
            this.toastService.pop(TOAST_TYPE.error, "Failed to update financial account");
            this.showFlyout = false;
          });
    } else{
      this.financialAccountsService.addAccount(data, this.currentCompany)
          .subscribe(response => {
            this.currentAccountId = response.id;
            this.toastService.pop(TOAST_TYPE.success, "Financial account created successfully");
            this.getFinancialAccounts(this.currentCompany);
            this.accountSubmitted = true;
            this.showFlyout = false;
            if(this.showYodleeWidget) {
              this.launchYodleeWidget();
            }
          }, error => {
            this.loadingService.triggerLoadingEvent(false);
            this.toastService.pop(TOAST_TYPE.error, "Failed to create Account");
            this.showFlyout = false;
          });
    }

    //this.buildTableData(this.accounts);
    //this.showFlyout = false;
  }

  handleAccount(newAccount){
    this.toastService.pop(TOAST_TYPE.success, "Financial Account created successfully");
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
      {"name": "starting_balance", "title": "Starting Balance"},
      {"name": "starting_balance_date", "title": "Start Balance Date"},
      {"name": "current_balance", "title": "Current Balance"},
      {"name": "id", "title": "Id", "visible": false},
      {"name": "yodlee_provider_id", "title": "Yodle_Provider", "visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
      _.each(accounts, function(account) {
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
          row['starting_balance'] =starting_balance.toLocaleString(Session.getCurrentCompanyCurrency(), { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if(key=='current_balance'){
          let current_balance=account['current_balance']?Number(account['current_balance']):0;
          row['current_balance'] =current_balance.toLocaleString(Session.getCurrentCompanyCurrency(), { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    }, 0)
    this.loadingService.triggerLoadingEvent(false);
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
    this.row = {};
    this.showFlyout = !this.showFlyout;
    this.showPaymentInfo = false;
  }

  launchYodleeWidget() {
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
      this.yodleeService.submitStatus(Session.getCurrentCompany(), this.currentAccountId, status[0]).subscribe(resp=> {
        jQuery('#yodleewgt').foundation('close');
      });

    });
  }
}
