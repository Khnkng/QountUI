/**
 * Created by NAZIA on 04-05-2017.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {HighChart} from "reportsUI/app/directives/HighChart.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {Router,ActivatedRoute} from "@angular/router";
import {FTable} from "qCommon/app/directives/footable.directive";
import {StateService} from "qCommon/app/services/StateService";
import {State} from "qCommon/app/models/State";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";

declare let jQuery:any;
declare let _:any;
declare let Highcharts:any;

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
    routeSubscribe:any;

  @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('createtaxes') createtaxes;
    constructor(private _router: Router,private _route: ActivatedRoute,private companyService: CompaniesService,
                private loadingService:LoadingService,private stateService: StateService,private titleService:pageTitleService,_switchBoard:SwitchBoard) {
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
        }, 0);
        this.loadingService.triggerLoadingEvent(false);

    }
  ngOnDestroy(){
    this.routeSubscribe.unsubscribe();
  }
}


