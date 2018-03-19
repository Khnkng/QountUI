/**
 * Created by seshu on 26-02-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {ToastService} from "qCommon/app/services/Toast.service";
import {ExpenseService} from "qCommon/app/services/Expense.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {StateService} from "qCommon/app/services/StateService";
import {State} from "qCommon/app/models/State";
import {ReportService} from "reportsUI/app/services/Reports.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";

declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
    selector: 'categorize',
    templateUrl: '../views/categorization.html',
})

export class CategorizationComponent{
    companyId:string;
    accounts:Array<any> = [];
    entries:Array<any> = [];
    companyCurrency:string;
    tableData:any = {};
    hasEntries:boolean = false;
    tableOptions:any = {search:false, pageSize:12};
    localeFortmat:string='en-US';
    routeSubscribe:any;
    pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
    categorizeTableColumns: Array<any> = ['Type', 'Title', 'Amount', 'Bank Account'];

    constructor(private toastService: ToastService, private _router: Router, private _route: ActivatedRoute,
                private loadingService: LoadingService, private expenseService: ExpenseService, private accountsService: FinancialAccountsService,
                private numeralService: NumeralService, _switchBoard: SwitchBoard, private titleService: pageTitleService,
                private stateService: StateService, private reportsService: ReportService) {
        this.titleService.setPageTitle("Categorization");
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(accounts =>{
                this.accounts = accounts.accounts;
                this.fetchUncategorizedEntries();
            }, error=>{
                this.loadingService.triggerLoadingEvent(false);
            });
        this.routeSubscribe  = _switchBoard.onClickPrev.subscribe(title => this.showPreviousPage());
    }

    showPreviousPage(){
        let prevState = this.stateService.getPrevState();
        if(prevState){
            this._router.navigate([prevState.url]);
        }
    }

    ngOnInit(){

    }

    ngOnDestroy(){
        this.routeSubscribe.unsubscribe();
    }

    fetchUncategorizedEntries(){
        let base = this;
        this.expenseService.uncategorizedEntries(this.companyId)
            .subscribe(entries =>{
                this.loadingService.triggerLoadingEvent(false);
                _.each(entries.Deposits, function(entry){
                    entry.type='Deposit';
                    base.entries.push(entry);
                });
                _.each(entries.Expenses, function(entry){
                    entry.type='Expense';
                    base.entries.push(entry);
                });
                this.buildTableData();
            }, error =>{
                this.loadingService.triggerLoadingEvent(false);
            });
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

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.redirectToEntryPage($event);
            this.addCategorizationState();
        }
    }

    buildTableData(){
        let base = this;
        this.tableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "title", "title": "Title"},
            {"name": "amount", "title": "Amount", "sortValue": function(value){
                return base.numeralService.value(value);
            }},
            {"name": "bank_account_id", "title": "Bank Account"},
            {"name": "id", "title": "Entry ID", "visible": false},
            {"name": "actions", "title": "", "type": "html", "sortable": false}];
        this.tableData.rows = [];
        _.each(this.entries, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
                if(key == 'bank_account_id'){
                    row[key] = base.getBankAccountName(entry[key]);
                } else if(key == 'amount'){
                    let amount = parseFloat(entry[key]);
                    row[key] = amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else{
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
        if(this.tableData.rows.length > 0){
            this.hasEntries = true;
        }
    }

    addCategorizationState(){
        this.stateService.addState(new State('CATEGORIZATION', this._router.url, null,null));
    }

    exportToExcel() {
      this.buildPdfTabledata("excel");
      this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
        .subscribe(data => {
          let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
          let link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link['download'] = "Categorizations.xls";
          link.click();
        }, error => {
          this.toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into Excel");
        });
    }

    buildPdfTabledata(fileType) {
      this.pdfTableData['documentHeader'] = "Header";
      this.pdfTableData['documentFooter'] = "Footer";
      this.pdfTableData['fileType'] = fileType;
      this.pdfTableData['name'] = "Name";

      this.pdfTableData.tableHeader.values = this.categorizeTableColumns;
      this.pdfTableData.tableRows.rows = this.getCategorizeTableData(this.tableData.rows);
    }

    getCategorizeTableData(inputData) {
      let tempData = _.cloneDeep(inputData);
      let newTableData: Array<any> = [];
      let tempJsonArray: any;

      for( var i in  tempData) {
        tempJsonArray = {};
        tempJsonArray["Type"] = tempData[i].type;
        tempJsonArray["Title"] = tempData[i].title;
        tempJsonArray["Amount"] = tempData[i].amount;
        tempJsonArray["Bank Account"] = tempData[i].bank_account_id;

        newTableData.push(tempJsonArray);
      }

      return newTableData;
    }

    exportToPDF() {
      this.buildPdfTabledata("pdf");

      this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
        .subscribe(data => {
          var blob = new Blob([data._body], {type:"application/pdf"});
          var link = jQuery('<a></a>');
          link[0].href = URL.createObjectURL(blob);
          link[0].download = "Categorizations.pdf";
          link[0].click();
        }, error => {
          this.toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into PDF");
        });

    }

}
