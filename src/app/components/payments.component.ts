import {Component} from "@angular/core";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {PaymentsService} from "qCommon/app/services/Payments.service";
import {Router,ActivatedRoute} from "@angular/router";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {StateService} from "qCommon/app/services/StateService";
import {State} from "qCommon/app/models/State";

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'payments',
    templateUrl: '../views/payments.html',
})

export class PaymentsComponent{
    payments = [];
    hasPayments: boolean = false;
    tableData:any = {};
    tableOptions:any = {};
    currentCompany:any;
    row:any;
    tableColumns:Array<string> = [ 'groupID','title', 'amount', 'date','journalID','vendorName','bankName'];
    confirmSubscription:any;
    companyCurrency:string;
    dimensionFlyoutCSS:any;
    bills:Array<any>=[];
    routeSub:any;
    fromPayments:boolean=false;
    localeFortmat:string='en-US';

    constructor(private switchBoard: SwitchBoard, private toastService: ToastService, private loadingService:LoadingService,
                private paymentsService:PaymentsService,private _router:Router, private _route: ActivatedRoute,
                private numeralService:NumeralService, private stateService: StateService){
        let companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.routeSub = this._route.params.subscribe(params => {
            if(params['paymentID']){
                this.getPaymentDetails(params['paymentID'])
            }else {
                this.paymentsService.mappings(companyId,"bill","true",null)
                    .subscribe(payments => {
                        this.buildTableData(payments || []);
                    }, error => this.handleError(error));
            }
        });
    }

    ngOnDestroy(){
    }

    handleError(error){
        this.loadingService.triggerLoadingEvent(false);
        this.row = {};
        this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
    }


   ngOnInit(){

    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.fromPayments=true;
            let link = ['/payments', $event.groupID];
            this._router.navigate(link);
        }else {
            this.navigateToJE($event.journalID);
        }
    }

    navigateToJE(jeID){
        let link = ['journalEntry', jeID];
        this.stateService.addState(new State("PAYMENTS_PAGE", this._router.url, null, null));
        this._router.navigate(link);
    }

    getPaymentDetails(id){
        //this.loadingService.triggerLoadingEvent(true);
        this.paymentsService.paymentDetails(id,Session.getCurrentCompany())
            .subscribe(paymentsDetails => {
                //this.loadingService.triggerLoadingEvent(false);
                this.bills=paymentsDetails;
                this.dimensionFlyoutCSS = "expanded";
                this.loadingService.triggerLoadingEvent(false);
            }, error => this.handleError(error));
    }

    buildTableData(payments) {
        this.hasPayments = false;
        this.payments = payments;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name": "groupID", "title": "Id","visible":false,"filterable": false},
            {"name": "title", "title": "Payment Title"},
            {"name": "amount", "title": "Amount", "sortValue": function(value){
                return base.numeralService.value(value);
            }},
            {"name": "date", "title": "Date","type":"date"},
            {"name": "journalID", "title": "journalId","visible":false,"filterable": false},
            {"name": "vendorName", "title": "Vendor"},
            {name:"bankName","title":"Bank"},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        payments.forEach(function(pyment) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                row[key] = pyment[key];
                if(key == 'amount'){
                    let amount = parseFloat(pyment[key]);
                    row[key] = amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                let action ="<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
                if(pyment.journalID){
                    action = "<a class='action' data-action='Navigation'><span class='icon badge je-badge'>JE</span></a>"+ action;
                }
                row["actions"] = action;
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasPayments = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    }

    hideFlyout(){
        if(this.fromPayments){
            this.dimensionFlyoutCSS = "collapsed";
        }else {
            this.goToPreviousPage();
        }


    }

    moveToBills(bill){
        if(bill.type=='bill'){
            let link = ['payments/bill',Session.getCurrentCompany(),bill.sourceID,'enter'];
            this._router.navigate(link);
        }else if(bill.type=='credit'){
            let link = ['payments/credit',Session.getCurrentCompany(),bill.sourceID];
            this._router.navigate(link);
        }
    }

    goToPreviousPage(){
        let link:any;
        if(Session.getLastVisitedUrl().indexOf('/payments/bill')==0){
            link = ["/payments"];
        }else {
            link = [Session.getLastVisitedUrl()];
        }
        this._router.navigate(link);
    }

    goToDashboard(){
        this._router.navigate(["/payments/dashboard/enter"]);
    }
}
