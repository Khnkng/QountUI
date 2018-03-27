/**
 * Created by NAZIA on 20-04-2017.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {HighChart} from "qCommon/app/directives/HighChart.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ReportService} from "reportsUI/app/services/Reports.service";
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

declare let jQuery:any;
declare let _:any;
declare let Highcharts:any;
declare let moment:any;

@Component({
    selector: 'bills',
    templateUrl: '../views/paymentstable.html'
})

export class paymenttableComponent {
    report:any={};
    tableData:any = {};
    tableOptions:any = {};
    companyCurrency:string;
    hasItemCodes: boolean = false;
    reportChartOptionsStacked:any;
    reportChartOptions:any;
    companyId:string;
    showFlyout:boolean = true;
    taxesList:any;
    tableColumns:Array<string> = ['bill_id','vendor_name','current_state','bill_date', 'due_date', 'amount'];
    todaysDate:any;
    reportasas:boolean= false;
    paymentcount:any;
    payable:boolean=false
    routeSub:any;
    currentpayment:any;
    paiddata:any;
    paymenttabledata:any;
    credits:any;
    billstate:any;
    billstatus:boolean=false;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('createtaxes') createtaxes;
    routeSubscribe:any;
    dateFormat:string;
    serviceDateformat:string;
    pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
    paymentsTableColumns: Array<any> = ["Vendor Name", "Bill Date", "Due Date", "Current State", "Amount", "Days to Pay"];
    localeFortmat:string='en-US';

    constructor(private _router: Router,private _route: ActivatedRoute,private companyService: CompaniesService,
            private loadingService:LoadingService, private reportService: ReportService, private stateService: StateService,
                private titleService:pageTitleService,_switchBoard:SwitchBoard, private dateFormater: DateFormater,
                private _toastService: ToastService,private numeralService:NumeralService) {
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.localeFortmat=CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()] ? CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()] : 'en-US';
        this.routeSub = this._route.params.subscribe(params => {
            this.currentpayment = params['PaymentstableID'];
            if(this.currentpayment=='totalpayable'){
                this.billstate='Payables';
                this.billstatus=true;
            } else if(this.currentpayment=='pastdue'){
                this.billstate='Past Due';
                    this.billstatus=true;
            } else if(this.currentpayment=='approve'){
                this.billstate='Approve';
                    this.billstatus=true;
            } else if(this.currentpayment=='pay'){
                this.billstate='Pay';
                    this.billstatus=true;
            } else if(this.currentpayment=='30days'){
                this.billstate='Paid Bills';
                this.companyService.getpaidcounttable(this.companyId)
                    .subscribe(paiddata  => {
                        this.paiddata=paiddata;
                    }, error =>{
                        this.loadingService.triggerLoadingEvent(false);
                    });
                this.billstatus=true;
            } else{
                console.log("error");
            }
            this.titleService.setPageTitle(this.billstate);
        });
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.getpaidcounttable(this.companyId)
            .subscribe(paiddata  => {
                this.paiddata=paiddata;
                console.log("this.paiddata",this.paiddata);
            }, error =>{
                this.loadingService.triggerLoadingEvent(false);
            });

        this.companyService.getpaymenttable(this.companyId,this.currentpayment)
            .subscribe(paymentTabledata  => {
                this.paymenttabledata=paymentTabledata;
                this.companyService.credits(this.companyId)
                    .subscribe(credits => {
                        this.credits = credits;
                        this.buildTableData();
                    }, error => {
                        this.loadingService.triggerLoadingEvent(false);
                    });
            }, error =>{
                this.loadingService.triggerLoadingEvent(false);
            });
       this.routeSubscribe =  _switchBoard.onClickPrev.subscribe(title => this.hideFlyout());
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.stateService.addState(new State("PAYMENTS_TABLE", this._router.url, null, null));
            let link = ['payments/bill',Session.getCurrentCompany(),$event.bill_id, $event.current_state];
            this._router.navigate(link);
        }
    }

    hideFlyout(){
        let link = ['payments/dashboard','dashboard'];
        let prevState = this.stateService.getPrevState();
        if(prevState){
          link = [prevState.url];
        }
        this._router.navigate(link);
    }

    buildTableData() {
        let base = this;
        this.hasItemCodes = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"bill_id","title":"Bill ID" ,"visible": false},
            {"name": "vendor_name", "title": "Vendor Name"},
            {"name":"bill_date","title":"Bill Date"},
            {"name": "due_date", "title": "Due Date"},
            {"name":"current_state","title":"Current State"},
            {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
                amount = parseFloat(amount);
                return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            },"sortValue": function(value){
              return base.numeralService.value(value);
            },"classes": "currency-align currency-padding"},
            {"name": "daysToPay", "title": "Days to Pay"},
            {"name": "actions", "title": ""}
        ];
        this.paymenttabledata.forEach(function(expense) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                if(key == 'amount'){
                    let amount = parseFloat(expense[key]);
                    row[key] = {
                        'options': {
                            "classes": "currency-align"
                        },
                        value : amount.toFixed(2)
                    }
                }else if(key == 'bill_date'){
                  row[key] = base.convertDateIntoLocaleFormat(expense[key]);
                }else if(key == 'due_date'){
                  row[key] = base.convertDateIntoLocaleFormat(expense[key]);
                }
                else {
                    row[key] = expense[key];
                }
                let currentDate=moment(new Date()).format("YYYY-MM-DD");
                let daysToPay =moment(expense['due_date'],"MM/DD/YYYY").diff(currentDate,'days');
                if(daysToPay<=0){
                    daysToPay='<span color="red" style="color: red">'+daysToPay+'</span>'
                }
                row['daysToPay']=daysToPay;
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        this.credits.forEach(function(credit) {
            let row:any = {};
            let billAmount=credit['totalAmount']?credit['totalAmount']:0;
            let currency=credit['currency']?credit['currency']:'USD';
            row['bill_id'] = credit['customID'];
            row['bill_date'] = credit['creditDate'];
            row['vendor_name'] = credit['vendorName'];
            row['current_state'] = credit['current_state'];
            row['amount'] ={
                'options': {
                    "classes": "currency-align"
                },
                value : '-' + billAmount
            }
            row['actions'] = "<a class='action' data-action='creditPayment'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='Enter' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function(){
            base.hasItemCodes = true;
        }, 0)
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

      this.pdfTableData.tableHeader.values = this.paymentsTableColumns;
      this.pdfTableData.tableRows.rows = this.getPaymentsTableData();
    }

    getPaymentsTableData() {
      let tempData = _.cloneDeep(this.tableData.rows);
      let newTableData: Array<any> = [];
      let tempJsonArray: any;

      for( var i in  tempData) {
        tempJsonArray = {};
        let currentDate = moment(new Date(), "MM/DD/YYYY");
        let dueDate = this.convertDateIntoLocaleFormat(tempData[i].due_date);
        let daysToPay = moment(dueDate, this.dateFormat).diff(currentDate, 'days');

        tempData[i].amount = parseFloat(tempData[i].amount.value).toLocaleString(this.localeFortmat, { style: 'currency', currency: this.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
        tempJsonArray["Vendor Name"] = tempData[i].vendor_name;
        tempJsonArray["Bill Date"] = tempData[i].bill_date;
        tempJsonArray["Due Date"] = tempData[i].due_date;
        tempJsonArray["Current State"] = tempData[i].current_state;
        tempJsonArray["Amount"] = tempData[i].amount;
        tempJsonArray["Days to Pay"] = daysToPay;

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
          link['download'] = "PaymentsDetails.xls";
          link.click();
        }, error =>{
          this._toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into Excel");
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
          link[0].download = "PaymentsDetails.pdf";
          link[0].click();
        }, error =>{
          this._toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into PDF");
        });

    }

}

