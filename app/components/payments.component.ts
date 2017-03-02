import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {PaymentsService} from "qCommon/app/services/Payments.service"
import {Router} from "@angular/router";

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'payments',
    templateUrl: '/app/views/payments.html',
})

export class PaymentsComponent{
    payments = [];
    hasPayments: boolean = false;
    tableData:any = {};
    tableOptions:any = {};
    currentCompany:any;
    row:any;
    tableColumns:Array<string> = [ 'groupID', 'amount', 'date', 'vendorName'];
    confirmSubscription:any;
    companyCurrency:string;
    dimensionFlyoutCSS:any;
    bills:Array<any>=[];

    constructor(private switchBoard: SwitchBoard, private toastService: ToastService, private loadingService:LoadingService
                ,private paymentsService:PaymentsService,private _router:Router){
        let companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.paymentsService.payments(companyId)
            .subscribe(payments => {
                this.buildTableData(payments);
                this.loadingService.triggerLoadingEvent(false);
            }, error => this.handleError(error));
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
            this.getPaymentDetails($event.groupID)
        }
    }

    getPaymentDetails(id){
        //this.loadingService.triggerLoadingEvent(true);
        this.paymentsService.paymentDetails(id,Session.getCurrentCompany())
            .subscribe(paymentsDetails => {
                //this.loadingService.triggerLoadingEvent(false);
                this.bills=paymentsDetails;
                this.dimensionFlyoutCSS = "expanded";
            }, error => this.handleError(error));
    }

    buildTableData(payments) {
        this.hasPayments = false;
        this.payments = payments;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name": "groupID", "title": "Id"},
            {"name": "amount", "title": "Amount"},
            {"name": "date", "title": "Date"},
            {"name": "vendorName", "title": "Vendor"},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        payments.forEach(function(pyment) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                row[key] = pyment[key];
                if(key == 'amount'){
                    let amount = parseFloat(pyment[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasPayments = true;
        }, 0);
    }

    hideFlyout(){
        this.dimensionFlyoutCSS = "collapsed";
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

}
