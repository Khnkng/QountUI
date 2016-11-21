/**
 * Created by mateen on 17-11-2016.
 */


import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CodesService} from "qCommon/app/services/CodesService.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
//import {ItemCodeForm} from "../forms/ItemCode.form";
import {ExpensesForm} from "../forms/Expenses.form";
import {ExpensesSerice} from "../services/Expenses.service";

declare var jQuery:any;
declare var _:any;


@Component({
  selector: 'tools',
  templateUrl: '/app/views/expensecode.html'
})

export class ExpensesCodesComponent {
  expensesForm: FormGroup;
  //itemCodes = [];
  expenses = [];
  paymentChartOfAccounts:any = [];
  invoiceChartOfAccounts:any = [];
  chartOfAccountsArr:any=[];
  newFormActive:boolean = true;
  @ViewChild('addItemcode') addItemcode;
  //@ViewChild('selectedCOAComboBoxDir') selectedCOAComboBox: ComboBox;
  //@ViewChild('invoiceCOAComboBoxDir') invoiceCOAComboBox: ComboBox;
  hasItemCodes: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  companySwitchSubscription: any;
  currentCompany:any;
  allCompanies:Array<any>;
  row:any;
  //tableColumns:Array<string> = ['name', 'id', 'payment_coa_mapping', 'invoice_coa_mapping', 'desc'];
  tableColumns:Array<string> = ['name', 'id', 'companyID', 'coa_mapping_id', 'desc'];
  combo:boolean = true;
  allCOAList:Array = [];

  constructor(private _fb: FormBuilder, private _expensesForm: ExpensesForm, private switchBoard: SwitchBoard, private codeService: CodesService, private toastService: ToastService,
              private coaService: ChartOfAccountsService, private expensesSerice:ExpensesSerice){
    this.expensesForm = this._fb.group(_expensesForm.getForm());
    this.companySwitchSubscription = this.switchBoard.onCompanyChange.subscribe(currentCompany => this.refreshExpenses(currentCompany));
    let companyId = Session.getCurrentCompany();
    this.allCompanies = Session.getCompanies();

    if(companyId){
      this.currentCompany = _.find(this.allCompanies, {id: companyId});
    } else if(this.allCompanies.length> 0){
      this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
    }

    this.coaService.filterdChartOfAccounts(this.currentCompany.id,"?categories=Expenses")
        .subscribe(chartOfAccounts => this.filterChartOfAccounts(chartOfAccounts), error=> this.handleError(error));
  }

  handleError(error){
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  refreshExpenses(currentCompany){
    let companies = Session.getCompanies();
    this.currentCompany = _.find(companies, {id: currentCompany.id});
    this.coaService.chartOfAccounts(this.currentCompany.id)
        .subscribe(chartOfAccounts => this.filterChartOfAccounts(chartOfAccounts), error=> this.handleError(error));
  }

  filterChartOfAccounts(chartOfAccounts){
    this.allCOAList = chartOfAccounts;
    //this.paymentChartOfAccounts = _.filter(chartOfAccounts, function(coa){
    //  return coa.type != '';
    //});
    //this.invoiceChartOfAccounts = _.filter(chartOfAccounts, function(coa){
    //  return coa.type != '';
    this.chartOfAccountsArr = _.filter(chartOfAccounts, function(coa){
      return coa.type != '';
    });
    this.expensesSerice.getAllExpenses(this.currentCompany.id)
        .subscribe(expenseCodes => this.buildTableData(expenseCodes), error=> this.handleError(error));
  }

  showAddItemCode() {
    this.editMode = false;
    this.expensesForm = this._fb.group(this._expensesForm.getForm());
    this.newForm();
    jQuery(this.addItemcode.nativeElement).foundation('open');
  }

  showEditExpense(row: any){
    let base = this;
    this.editMode = true;
    this.newForm();
    this.row = row;
    let selectedCOAIndex = _.findIndex(this.chartOfAccountsArr, function(coa){
      return coa.id == row.coa_mapping_id;
    });
    setTimeout(function(){
      base.selectedCOAComboBox.setValue(base.chartOfAccountsArr[selectedCOAIndex], 'name');
    },0);
    this._expensesForm.updateForm(this.expensesForm, row);
    jQuery(this.addItemcode.nativeElement).foundation('open');
  }

  removeExpense(row: any){
    let itemCodeId = row.id;
    this.expensesSerice.removeExpense(this.currentCompany.id,itemCodeId)
        .subscribe(coa => {
          this.toastService.pop(TOAST_TYPE.success, "Deleted Expense successfully");
          this.expenses.splice(_.findIndex(this.expenses, {id: itemCodeId}, 1));
        }, error => this.handleError(error));
  }

  newForm(){
    this.newFormActive = false;
    setTimeout(()=> this.newFormActive=true, 0);
  }

  updateExpenseCOA(selectedCOAName){
    let selectedCOA = _.find(this.chartOfAccountsArr, function(coa){
      return coa.name == selectedCOAName;
    });
    let selectedCOAControl:any = this.expensesForm.controls['coa_mapping_id'];
    if(selectedCOA){
      selectedCOAControl.patchValue(selectedCOA.id);
    }
  }

  ngOnInit(){

  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditExpense($event);
    } else if(action == 'delete'){
      this.removeExpense($event);
    }
  }

  submit($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._expensesForm.getData(this.expensesForm);
    if(this.editMode){
      data.id = this.row.id;
      data.companyID = this.currentCompany.id;
      this.expensesSerice.updateExpense(data,this.currentCompany.id)
          .subscribe(itemCode => {
            base.row = {};
            base.toastService.pop(TOAST_TYPE.success, "Expense updated successfully");
            let index = _.findIndex(base.expenses, {id: data.id});
            base.expenses[index] = itemCode;
            base.buildTableData(base.expenses);
          }, error => this.handleError(error));
    } else{
      //data.companyID = this.currentCompany.id;
      this.expensesSerice.addExpense(data,this.currentCompany.id)
          .subscribe(newItemcode => this.handleExpense(newItemcode), error => this.handleError(error));
    }
    this.buildTableData(this.expenses);
    jQuery(this.addItemcode.nativeElement).foundation('close');
  }

  handleExpense(expense){
    this.toastService.pop(TOAST_TYPE.success, "Expense created successfully");
    this.expenses.push(expense);
    this.buildTableData(this.expenses);
  }

  buildTableData(expenses) {
    this.hasItemCodes = false;
    this.expenses = expenses;
    this.tableData.rows = [];
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "desc", "title": "Description"},
      //{"name": "paymentCOAName", "title": "Payment COA"},
      //{"name": "payment_coa_mapping", "title": "payment COA id", "visible": false},
      //{"name": "invoiceCOAName", "title": "Invoice COA"},
      //{"name": "invoice_coa_mapping", "title": "invoice COA id", "visible": false},
      {"name": "selectedCOAName", "title": "COA"},
      {"name": "coa_mapping_id", "title": "COA id", "visible": false},
      {"name": "companyID", "title": "Company ID", "visible": false},
      {"name": "id", "title": "Id", "visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    expenses.forEach(function(expense) {
      let row:any = {};
      _.each(base.tableColumns, function(key) {
        if(key == 'coa_mapping_id'){
          row['selectedCOAName'] = base.getCOAName(expense[key]);
          row[key] = expense[key];
        }  else{
          row[key] = expense[key];
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasItemCodes = true;
    }, 0)
  }

  getCOAName(coaId){
    let coa = _.find(this.allCOAList, function(coa){
      return coa.id == coaId;
    });
    if(coa){
      return coa.name;
    }
    return "";
  }
}
