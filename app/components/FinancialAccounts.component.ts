/**
 * Created by Chandu on 28-09-2016.
 */

import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {FinancialAccountForm} from "../forms/FinancialAccount.form";
import {LoadingService} from "qCommon/app/services/LoadingService";

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
  hasAccounts: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  currentCompany:any;
  row:any;
  tempValues:Array<string> = [];
  tableColumns:Array<string> = ['name', 'id', 'starting_balance', 'current_balance', 'no_effect_on_pl', 'is_credit_account', 'starting_balance_date'];

  constructor(private _fb: FormBuilder, private _financialAccountForm: FinancialAccountForm, private switchBoard: SwitchBoard, private loadingService:LoadingService,
              private financialAccountsService: FinancialAccountsService, private toastService: ToastService){
    this.accountForm = this._fb.group(_financialAccountForm.getForm());
    this.currentCompany = Session.getCurrentCompany();
    if(this.currentCompany){
      this.loadingService.triggerLoadingEvent(true);
      this.financialAccountsService.financialAccounts(this.currentCompany)
          .subscribe(response => {
            this.loadingService.triggerLoadingEvent(false);
            this.buildTableData(response.accounts);
          }, error => this.handleError(error));
    } else{
      this.toastService.pop(TOAST_TYPE.warning, "No default company set. Please Hop to a company.");
    }
  }

  handleError(error){
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  setBalanceDate(date){
    let dateControl:any = this.accountForm.controls['starting_balance_date'];
    dateControl.patchValue(date);
  }

  showAddAccount() {
    this.editMode = false;
    this.accountForm = this._fb.group(this._financialAccountForm.getForm());
    this.newForm();
    jQuery(this.addAccount.nativeElement).foundation('open');
  }

  showEditAccount(row: any){
    let base = this;
    this.editMode = true;
    this.newForm();
    this.row = row;
    this._financialAccountForm.updateForm(this.accountForm, row);
    jQuery(this.addAccount.nativeElement).foundation('open');
  }

  removeAccount(row: any){
    let accountId = row.id;
    this.loadingService.triggerLoadingEvent(true);
    this.financialAccountsService.removeAccount(accountId, this.currentCompany)
        .subscribe(response => {
          console.log(response);
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

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditAccount($event);
    } else if(action == 'delete'){
      this.removeAccount($event);
    }
  }

  submit($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._financialAccountForm.getData(this.accountForm);
    if(this.editMode){
      data.id = this.row.id;

    } else{
      this.financialAccountsService.addAccount(data, this.currentCompany)
          .subscribe(response => {
            this.accounts.push(response.account);
            this.buildTableData(this.accounts);
          }, error => {
            this.toastService.pop(TOAST_TYPE.error, "Failed to create Account");
          });
    }
    this.buildTableData(this.accounts);
    jQuery(this.addAccount.nativeElement).foundation('close');
  }

  handleAccount(newAccount){
    this.toastService.pop(TOAST_TYPE.success, "Financial Account created successfully");
    this.accounts.push(newAccount);
    this.buildTableData(this.accounts);
  }

  buildTableData(accounts) {
    this.hasAccounts = false;
    this.accounts = accounts;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "starting_balance", "title": "Starting Balance"},
      {"name": "starting_balance_date", "title": "Start Balance Date"},
      {"name": "current_balance", "title": "Current Balance"},
      {"name": "id", "title": "Id", "visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
      _.each(accounts, function(account) {
      let row:any = {};
      _.each(base.tableColumns, function(key) {
        row[key] = account[key];
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasAccounts = true;
    }, 0)
  }
}
