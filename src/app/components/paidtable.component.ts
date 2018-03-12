/**
 * Created by NAZIA on 04-05-2017.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {HighChart} from "qCommon/app/directives/HighChart.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {Router,ActivatedRoute} from "@angular/router";
import {FTable} from "qCommon/app/directives/footable.directive";
import {StateService} from "qCommon/app/services/StateService";
import {State} from "qCommon/app/models/State";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {CURRENCY_LOCALE_MAPPER} from "qCommon/app/constants/Currency.constants";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare let jQuery:any;
declare let _:any;
declare let Highcharts:any;
declare let moment:any;

@Component({
    selector: 'paid',
    templateUrl: '../views/paidtable.html'
})

export class paidtablecomponent {
    report:any={};
    tableData:any = {};
    tableOptions:any = {};
    companyCurrency:string;
    hasItemCodes: boolean = false;
    reportChartOptionsStacked:any;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    reportChartOptions:any;
    companyId:string;
    showFlyout:boolean = true;
    taxesList:any;
    tablecol:Array<string>=['vendorName','id','paidDate','billDate','dueDate','amount', 'currentState'];
    ttt:any;
    todaysDate:any;
    reportasas:boolean= false;
    paymentcount:any;
    payable:boolean=false;
    routeSub:any;
    currentpayment:any;
    paiddata:any;
    paymenttabledata:any;
    credits:any;
    billstate:any;
    billstatus:boolean=false;
    @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('createtaxes') createtaxes;
    routeSubscribe:any;
    dateFormat:string;
    serviceDateformat:string;
    pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
    paidTableColumns: Array<any> = ["Vendor Name", "Paid Date", "Bill Date", "Due Date", "amount"];
    localeFortmat:string='en-US';

    constructor(private _router: Router,private _route: ActivatedRoute,private companyService: CompaniesService,
                private loadingService:LoadingService,private stateService: StateService,
                private titleService:pageTitleService,_switchBoard:SwitchBoard,
                private dateFormater: DateFormater, private _toastService: ToastService, private numeralService: NumeralService,
                private reportService: ReportService) {
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.localeFortmat = CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()] ? CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()] : 'en-US';
        this.routeSub = this._route.params.subscribe(params => {
            this.currentpayment = params['PaymentstableID'];

        });
        this.loadingService.triggerLoadingEvent(true);

        if(this.currentpayment == '30days') {
            this.companyService.getpaidcounttable(this.companyId)
                .subscribe(paiddata => {
                    this.paiddata = paiddata;
                    this.buildTableDataPaid(this.paiddata.bills);
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                });
        }else{
            this.companyService.getpaidTransits(this.companyId)
                .subscribe(paiddata  => {
                    this.paiddata=paiddata;
                    this.buildTableDataPaid(this.paiddata);
                }, error =>{
                    this.loadingService.triggerLoadingEvent(false);
                });
        }
        this.titleService.setPageTitle("paid");
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(title => this.hideFlyout());
    }
    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.stateService.addState(new State("BILLS_DRILL_DOWN", this._router.url, null, null));
            let link = ['payments/bill',Session.getCurrentCompany(),$event.id, $event.currentState];
            this._router.navigate(link);
        }
    }
    hideFlyout(){
        let link = ['payments/dashboard','dashboard'];
        this._router.navigate(link);
    }

    buildTableDataPaid(paiddata){
        let base = this;
        this.hasItemCodes = false;
        this.paiddata = paiddata;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"id","title":"Bill ID" ,"visible": false},
            {"name":"currentState","title":"Current State" ,"visible": false},
            {"name": "vendorName", "title": "Vendor Name"},
            {"name": "paidDate", "title": "Paid Date"},
            {"name":"billDate","title":"Bill Date"},
            {"name": "dueDate", "title": "Due Date"},
            {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
                amount = parseFloat(amount);
                return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
            },"sortValue": function(value){
              return base.numeralService.value(value);
            },"classes": "currency-align currency-padding"},
            {"name": "actions", "title": ""}
        ];
        paiddata.forEach(function(expense) {
            let row:any = {};
            _.each(base.tablecol, function(key) {
                if(key == 'amount'){
                    let amount = parseFloat(expense[key]);
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value : amount.toFixed(2)
                    }
                }else if(key == 'paidDate'){
                  row[key] = base.convertDateIntoLocaleFormat(expense[key]);
                }else if(key == 'billDate'){
                  row[key] = base.convertDateIntoLocaleFormat(expense[key]);
                }else if(key == 'dueDate'){
                  row[key] = base.convertDateIntoLocaleFormat(expense[key]);
                }
                else {
                    row[key] = expense[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function(){
            base.hasItemCodes = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    }

    ngOnDestroy(){
        this.routeSubscribe.unsubscribe();
    }

    convertDateIntoLocaleFormat(input) {
      return input ? this.dateFormater.formatDate(input, this.serviceDateformat, this.dateFormat) : input;
    }

    buildPdfTabledata(fileType){
      this.pdfTableData['documentHeader'] = "Header";
      this.pdfTableData['documentFooter'] = "Footer";
      this.pdfTableData['fileType'] = fileType;
      this.pdfTableData['name'] = "Name";

      this.pdfTableData.tableHeader.values = this.paidTableColumns;
      this.pdfTableData.tableRows.rows = this.getPaidTableData();
    }

    getPaidTableData() {
      let tempData = _.cloneDeep(this.tableData.rows);
      let newTableData: Array<any> = [];
      let tempJsonArray: any;

      for (var i in  tempData) {
        tempJsonArray = {};
        tempData[i].amount = parseFloat(tempData[i].amount.value).toLocaleString(this.localeFortmat, { style: 'currency', currency: this.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });

        tempJsonArray["Vendor Name"] = tempData[i].vendorName;
        tempJsonArray["Paid Date"] = tempData[i].paidDate;
        tempJsonArray["Bill Date"] = tempData[i].billDate;
        tempJsonArray["Due Date"] = tempData[i].dueDate;
        tempJsonArray["Amount"] = tempData[i].amount;

        newTableData.push(tempJsonArray);
      }
      return newTableData;
    }

    exportToExcel() {
      this.buildPdfTabledata("excel");
      this.reportService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
        .subscribe(data =>{
          let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
          let link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link['download'] = "PayDetails.xls";
          link.click();
        }, error =>{
          this._toastService.pop(TOAST_TYPE.error, "Failed to Export table into Excel");
        });
      // jQuery('#example-dropdown').foundation('close');

    }

    exportToPDF() {
      this.buildPdfTabledata("pdf");

      this.reportService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
        .subscribe(data =>{
          var blob = new Blob([data._body], {type:"application/pdf"});
          var link = jQuery('<a></a>');
          link[0].href = URL.createObjectURL(blob);
          link[0].download = "PayDetails.pdf";
          link[0].click();
        }, error =>{
          this._toastService.pop(TOAST_TYPE.error, "Failed to Export table into PDF");
        });

    }

}


