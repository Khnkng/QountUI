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
    selector: 'paymentstable',
    templateUrl: '/app/views/paymentstable.html'
})
export class paymenttableComponent {
    report:any={};
    tableData:any = {};
    tableOptions:any = {};
    hasItemCodes: boolean = false;
    reportChartOptionsStacked:any;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    reportChartOptions:any;
    hasItemCodes: boolean = false;
    companyId:string;
    showFlyout:boolean = true;
    taxesList:any;
    tableData:any = {};
    tableColumns:Array<string> = ['bill_id','bill_date','vendor_name', 'current_state', 'due_date', 'amount'];
    tableOptions:any = {};
    ttt:any;
    todaysDate:any;
    reportasas:boolean= false;
    paymentcount:any;
    payable:boolean=false
    routeSub:any;
    currentpayment:any;
    paymenttabledata:any;
    @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('createtaxes') createtaxes;
    constructor(private _router: Router,private _route: ActivatedRoute,private companyService: CompaniesService,
                private loadingService:LoadingService,private reportService: ReportService) {
        this.companyId = Session.getCurrentCompany();
        this.routeSub = this._route.params.subscribe(params => {
            this.currentpayment = params['PaymentstableID'];
        });
        this.companyService.getpaymenttable(this.companyId,this.currentpayment)
            .subscribe(paymenttabledata  => {
                this.paymenttabledata=paymenttabledata;
                this.buildTableData(this.paymenttabledata);
            }, error =>  console.log("error"));
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
    buildTableData(paymenttabledata) {
        this.hasItemCodes = false;
        this.paymenttabledata = paymenttabledata;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"bill_id","title":"Bill ID" ,"visible": false},
            {"name":"bill_date","title":"Bill Date"},
            {"name": "vendor_name", "title": "Vendor Name"},
            {"name": "current_state", "title": "Current State"},
            {"name": "due_date", "title": "Due Date"},
            {"name": "amount", "title": "Amount"},
            {"name": "actions", "title": ""}
        ];

        let base = this;
        paymenttabledata.forEach(function(expense) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                row[key] = expense[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function(){

            base.hasItemCodes = true;
        }, 0)
       // this.loadingService.triggerLoadingEvent(false);
    }

}

