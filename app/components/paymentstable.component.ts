/**
 * Created by NAZIA on 20-04-2017.
 */


import {Component, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {HighChart} from "reportsUI/app/directives/HighChart.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ReportService} from "reportsUI/app/services/Reports.service";
import {Router,ActivatedRoute} from "@angular/router";
import {FTable} from "qCommon/app/directives/footable.directive";
declare var jQuery:any;
declare var _:any;
declare var Highcharts:any;
@Component({
    selector: 'bills',
    templateUrl: '/app/views/paymentstable.html'
})
export class paymenttableComponent {
    report:any={};
    tableData:any = {};
    tableOptions:any = {};
    companyCurrency:string;
    hasItemCodes: boolean = false;
    reportChartOptionsStacked:any;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    reportChartOptions:any;
    hasItemCodes: boolean = false;
    companyId:string;
    showFlyout:boolean = true;
    taxesList:any;
    tableData:any = {};
    tableColumns:Array<string> = ['bill_id','bill_date','vendor_name', 'due_date', 'amount'];
    tableOptions:any = {};
    ttt:any;
    todaysDate:any;
    reportasas:boolean= false;
    paymentcount:any;
    payable:boolean=false
    routeSub:any;
    currentpayment:any;
    paymenttabledata:any;
    credits:any;
    @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('createtaxes') createtaxes;
    constructor(private _router: Router,private _route: ActivatedRoute,private companyService: CompaniesService,
                private loadingService:LoadingService,private reportService: ReportService) {
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.routeSub = this._route.params.subscribe(params => {
            this.currentpayment = params['PaymentstableID'];
        });
        this.loadingService.triggerLoadingEvent(true);

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

    }
    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            let link = ['payments/bill',Session.getCurrentCompany(),$event.bill_id,$event.current_state];
            this._router.navigate(link);
            //this.getPaymentDetails($event.groupID)
        }else {
            //this.navigateToJE($event.journalID);
        }
    }
    hideFlyout(){
        let link = ['paymentdashboard'];
        this._router.navigate(link);
    }

    buildTableData() {
        this.hasItemCodes = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"bill_id","title":"Bill ID" ,"visible": false},
            {"name":"bill_date","title":"Bill Date"},
            {"name": "vendor_name", "title": "Vendor Name"},
            {"name": "due_date", "title": "Due Date"},
            {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
                amount = parseFloat(amount);
                return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }},
            {"name": "daysToPay", "title": "Days to Pay"},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        this.paymenttabledata.forEach(function(expense) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                if(key == 'amount'){
                    let amount = parseFloat(expense[key]);
                    row[key] = amount.toFixed(2); // just to support regular number with .00
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
            row['amount'] ='-' + billAmount;
            row['actions'] = "<a class='action' data-action='creditPayment'><span class='icon badge je-badge'>JE</span></a><a class='action' data-action='Enter' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function(){
            base.hasItemCodes = true;
        }, 0)
        this.loadingService.triggerLoadingEvent(false);
    }

}

