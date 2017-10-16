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
import {ExpenseCodesForm} from "../forms/ExpenseCodes.form";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ExpensesService} from "qCommon/app/services/ExpenseCodes.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {Router} from "@angular/router";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare var jQuery:any;
declare var _:any;


@Component({
  selector: 'expense-codes',
  templateUrl: '../views/expensecode.html'
})

export class ExpensesCodesComponent {
  expensesForm: FormGroup;
  expenses = [];
  paymentChartOfAccounts:any = [];
  invoiceChartOfAccounts:any = [];
  chartOfAccountsArr:any=[];
  newFormActive:boolean = true;
  @ViewChild('addItemcode') addItemcode;
  @ViewChild('selectedCOAComboBoxDir') selectedCOAComboBox: ComboBox;
  hasItemCodes: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  currentCompany:any;
  allCompanies:Array<any>;
  row:any;
  tableColumns:Array<string> = ['name', 'id', 'companyID', 'coa_mapping_id', 'desc'];
  combo:boolean = true;
  allCOAList:Array<any> = [];
  showFlyout:boolean = false;
  itemCodeId:any;
  confirmSubscription:any;
  routeSubscribe:any;
  expensesTableColumns: Array<any> = ['Name', 'Description', 'COA'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };

  constructor(private _fb: FormBuilder, private _expensesForm: ExpenseCodesForm, private switchBoard: SwitchBoard,
              private codeService: CodesService, private toastService: ToastService, private _router:Router,
              private coaService: ChartOfAccountsService, private expensesSerice:ExpensesService,
              private companiesService: CompaniesService, private loadingService:LoadingService,private titleService:pageTitleService,
              private reportsService: ReportService){
    this.titleService.setPageTitle("Expense Codes");
    this.expensesForm = this._fb.group(_expensesForm.getForm());
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteExpense(toast));
    let companyId = Session.getCurrentCompany();
    this.loadingService.triggerLoadingEvent(true);
    this.companiesService.companies().subscribe(companies => {
      this.allCompanies = companies;
      if(companyId){
        this.currentCompany = _.find(this.allCompanies, {id: companyId});
      } else if(this.allCompanies.length> 0){
        this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
      }
      this.coaService.filterdChartOfAccounts(this.currentCompany.id,"?categories=Expenses")
          .subscribe(chartOfAccounts => {
            chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
            this.filterChartOfAccounts(chartOfAccounts);
          }, error=> this.handleError(error));
    }, error => this.handleError(error));
    this.routeSubscribe =  switchBoard.onClickPrev.subscribe(title => {
      if(!this.showFlyout){
        this.routeToToolsPage();
      }else{
        this.hideFlyout();
      }
    });
  }

  ngOnDestroy(){
    this.confirmSubscription.unsubscribe();
    this.routeSubscribe.unsubscribe();
  }
  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  filterChartOfAccounts(chartOfAccounts){
    this.allCOAList = chartOfAccounts;
    this.chartOfAccountsArr = _.filter(chartOfAccounts, function(coa){
      return coa.type != '';
    });
    _.sortBy(this.chartOfAccountsArr, ['number', 'name']);
    this.expensesSerice.getAllExpenses(this.currentCompany.id)
        .subscribe(expenseCodes => this.buildTableData(expenseCodes), error=> this.handleError(error));
  }

  showAddItemCode() {
    this.titleService.setPageTitle("CREATE EXPENSE CODE");
    this.editMode = false;
    this.expensesForm = this._fb.group(this._expensesForm.getForm());
    this.newForm();
    this.showFlyout = true;
  }

  showEditExpense(row: any){
    this.titleService.setPageTitle("UPDATE EXPENSE CODE");
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
    this.showFlyout = true;
  }
  deleteExpense(toast){

    this.loadingService.triggerLoadingEvent(true);
    this.expensesSerice.removeExpense(this.currentCompany.id,this.itemCodeId)
        .subscribe(coa => {
          //   this.loadingService.triggerLoadingEvent(false);
          this.expensesSerice.getAllExpenses(this.currentCompany.id)
              .subscribe(expenseCodes => this.buildTableData(expenseCodes), error=> this.handleError(error));
          this.toastService.pop(TOAST_TYPE.success, "Expense code deleted successfully");
        }, error => this.handleError(error));
  }
  removeExpense(row: any){
    this.itemCodeId = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
  }

  newForm(){
    this.newFormActive = false;
    setTimeout(()=> this.newFormActive=true, 0);
  }

  updateExpenseCOA(selectedCOA){
    let data = this._expensesForm.getData(this.expensesForm);
    if(selectedCOA && selectedCOA.id){
      data.coa_mapping_id = selectedCOA.id;
    }else if(!selectedCOA||selectedCOA=='--None--'){
      data.coa_mapping_id='--None--';
    }
    this._expensesForm.updateForm(this.expensesForm, data);
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

    if(data.coa_mapping_id=='--None--'||data.coa_mapping_id==''){
      this.toastService.pop(TOAST_TYPE.error, "Please select Expense COA");
      return;
    }

    this.loadingService.triggerLoadingEvent(true);
    if(this.editMode){
      data.id = this.row.id;
      data.companyID = this.currentCompany.id;
      this.expensesSerice.updateExpense(data,this.currentCompany.id)
          .subscribe(itemCode => {
            base.loadingService.triggerLoadingEvent(false);
            base.row = {};
            base.toastService.pop(TOAST_TYPE.success, "Expense updated successfully");
            let index = _.findIndex(base.expenses, {id: data.id});
            base.expenses[index] = itemCode;
            base.buildTableData(base.expenses);
            this.showFlyout = false;
          }, error => this.handleError(error));
    } else{
      //data.companyID = this.currentCompany.id;
      this.expensesSerice.addExpense(data,this.currentCompany.id)
          .subscribe(newItemcode => {
            // this.loadingService.triggerLoadingEvent(false);
            this.handleExpense(newItemcode);
            this.showFlyout = false;
          }, error => this.handleError(error));
    }
    //this.buildTableData(this.expenses);
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
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "desc", "title": "Description"},
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
    this.loadingService.triggerLoadingEvent(false);
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

  routeToToolsPage(){
    let link = [Session.getLastVisitedUrl()];
    this._router.navigate(link);
  }

  hideFlyout(){
    this.titleService.setPageTitle("Expense Codes");
    this.row = {};
    this.showFlyout = false;
  }

  getExpensesTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["Name"] = tempData[i].name;
      tempJsonArray["Description"] = tempData[i].desc;
      tempJsonArray["COA"] = tempData[i].selectedCOAName;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType){
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.expensesTableColumns;
    this.pdfTableData.tableRows.rows = this.getExpensesTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.currentCompany, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "ExpenseCodes.xls";
        link.click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed to Export table into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF(tabId) {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.currentCompany, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "ExpenseCodes.pdf";
        link[0].click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed to Export table into PDF");
      });

  }

}
