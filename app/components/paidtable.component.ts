/**
 * Created by NAZIA on 04-05-2017.
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
    selector: 'paid',
    templateUrl: '/app/views/paidtable.html'
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
    hasItemCodes: boolean = false;
    companyId:string;
    showFlyout:boolean = true;
    taxesList:any;
    tableData:any = {};
    tablecol:Array<string>=['vendorName','id','currentState','billDate','dueDate','amount'];
    tableOptions:any = {};
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
    constructor(private _router: Router,private _route: ActivatedRoute,private companyService: CompaniesService,
                private loadingService:LoadingService,private reportService: ReportService) {
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
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

    }
    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            let link = ['payments/bill',Session.getCurrentCompany(),$event.id,$event.currentState];
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

    buildTableDataPaid(paiddata){
        this.hasItemCodes = false;
        this.paiddata = paiddata;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"id","title":"Bill ID" ,"visible": false},
            {"name": "vendorName", "title": "Vendor Name"},
            {"name": "currentState", "title": "Current State"},
            {"name":"billDate","title":"Bill Date"},
            {"name": "dueDate", "title": "Due Date"},
            {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
                amount = parseFloat(amount);
                return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            },"classes": "currency-align currency-padding"},
            {"name": "actions", "title": ""}
        ];

        let base = this;
        paiddata.forEach(function(expense) {
            let row:any = {};
            _.each(base.tablecol, function(key) {
                if(key == 'amount'){
                    let amount = parseFloat(expense[key]);
                    //row[key] = amount.toFixed(2); // just to support regular number with .00
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value : amount.toFixed(2)
                    }
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
        }, 0)
        this.loadingService.triggerLoadingEvent(false);

    }
}


