/**
 * Created by seshu on 18-07-2016.
 */
import {Router, ActivatedRoute} from "@angular/router";
import {Focus} from "qCommon/app/directives/focus.directive";
import {Ripple} from "qCommon/app/directives/rippler.directive";
import {Component} from "@angular/core";
import {FoundationInit} from "qCommon/app/directives/foundation.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {BillsService} from "../services/Bills.service";
import {BillModel} from "../models/Bill.model";
import {OAuthService} from "../services/OAuthService";
import {VendorModel} from "qCommon/app/models/Vendor.model";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CustomDatepicker1} from "../directives/customDatepicker1";

declare var _:any;
declare var moment:any;

@Component({
  selector: 'billPay',
  templateUrl: '/app/views/billpay.html',
})

export class BillPayComponent  {
  companyId:string;
  billId:string;
  bankInfo:Array<any>=[];
  creditCardInfo:Array<any>=[];
  billAmount:any;
  dueDate:any;
  bill:BillModel;
  fundingSources:Array<any> = [];
  vendor:VendorModel = null;
  fundingSource:any = {};
  payAmount:any;
  unpaidAmount:number=0;
  futureDate:string;
  accountPin:string;
  manualCheque:boolean;
  paymentMode:string;
  billCurrency:string;
  amountPaid:number=0;
  companyCurrency:string='USD';
  convertedBillAmount:number=0;
  routeSub:any;
  constructor(private companyService: CompaniesService,private _route: ActivatedRoute,private billsService:BillsService,private _router: Router, private _oAuthService:OAuthService, private _toastService:ToastService) {
    this.routeSub = this._route.params.subscribe(params => {
      this.companyId =params['companyId'];
      this.billId =params['id'];
      this.loadCompany()
    });
  }

  loadCompany(){
    this.companyService.company(this.companyId)
      .subscribe(company  => {
        this.creditCardInfo=company.paymentInfo;
        this.companyCurrency=company.defaultCurrency;
        this.loadBill();
      }, error =>  {

      });
  }

  getVendor() {
    this.companyService.vendor(this.companyId, this.bill.vendorID.toLowerCase())
      .subscribe(vendor  => {
        this.vendor=vendor;
        if(this.vendor.paymentMethod) {
         this.paymentMode = this.vendor.paymentMethod;
        } else {
          this.paymentMode = 'ach';
        }
      }, error =>  {

      });
  }

  loadBill(){
    this.billsService.bill(this.companyId, this.billId)
      .subscribe(bill  => {
        this.bill=bill;
        this.billAmount=bill.amount;
        this.amountPaid=bill.amountPaid?bill.amountPaid:0;
        this.payAmount = (this.billAmount - this.amountPaid)?(this.billAmount - this.amountPaid).toFixed(2):0;
        this.unpaidAmount=this.billAmount - this.amountPaid;
        this.dueDate=bill.dueDate;
        this.billCurrency=bill.currency;
        if(this.billCurrency!=this.companyCurrency){
          this.billsService.getConvertedCurrencyValue(this.billCurrency,this.companyCurrency,moment(new Date()).format("YYYY-MM-DD"))
            .subscribe(res  => {
              this.unpaidAmount=this.unpaidAmount*res.result;
              this.convertedBillAmount=this.billAmount*res.result;
              this.payAmount = Number((this.convertedBillAmount - this.amountPaid).toFixed(2));
              this.unpaidAmount=this.payAmount;
            }, error =>  {

            });
        }
        this.getVendor();
      }, error =>  {

      });
  }

  payBill(){
    /*this.bill.lines=JSON.parse(this.bill.lines);
     this.bill.action = 'submit';
     this.billsService.updateBill(<BillModel>this.cleanBillData(this.bill))
     .subscribe(success  => {
     let link = ['Dashboard'];
     this._router.navigate(link);
     }, error =>  {
     let link = ['BillEntry', {"companyId": this.companyId,"id":this.billId}];
     this._router.navigate(link);
     });*/

    let actualAmount=(this.companyCurrency!=this.billCurrency)?this.convertedBillAmount:this.billAmount;
    if(Number(this.payAmount)+this.amountPaid>actualAmount){
      this._toastService.pop(TOAST_TYPE.error, "Payment amount exceeds bill amount");
      return;
    }

    let transferObj:any = {
      "billID": this.bill.id,
      "billName": this.bill.name,
      "amount": this.payAmount,
      "billNumber":this.bill.billID,
      "currency": "USD",
      "notes": "",
      "remarks": "",
      "destinationID": this.vendor.id,
      "destinationType": "vendor",
      "paymentMethod":this.paymentMode
      //"fundingSource": this.fundingSource['_links']['self']['href']
    };
    this._oAuthService.fundTransfer(transferObj, this.companyId).subscribe(status  => {
      this.paymentMode=null;
      this._toastService.pop(TOAST_TYPE.success, "Funds transfer initiated successfully");
      //this.updateBill();
      this.showDashboard();
    }, error =>  {
      console.log("error", error);
    });
  }

  showDashboard(payLater?) {
    let tabId = 3;
    if(payLater) {
      tabId = 2;
    }
    let link = ['/dashboard', tabId];
    this._router.navigate(link);
  }

  /*updateBill() {

      this.bill.lines=JSON.parse(this.bill.lines);
      this.bill.action = 'submit';
      this.billsService.updateBill(<BillModel>this.cleanBillData(this.bill))
        .subscribe(success  => {
          let link = ['Dashboard'];
          this._router.navigate(link);
        }, error =>  {
          let link = ['BillEntry', {"companyId": this.companyId,"id":this.billId}];
          this._router.navigate(link);
        });

  }*/

  cleanBillData(data){
    delete data.history
    delete data.lastUpdated
    delete data.dueDateLong
    delete data.lastUpdatedBy
    delete data.subState
    delete data.bucketName
    delete data.documentKeyName
    delete data.currentUsers;
    delete data.link;
    delete data['userID'];
    delete data.ownerID;
    delete data.createdTime;
    delete data.billNumber;
    delete data.currentState;
    return data;
  }

  setFutureDate(date) {
    this.futureDate = date;
  }

  makeFuturePayment() {
    let transferObj:any = {
      "billID": this.bill.id,
      "billName": this.bill.name,
      "amount": this.payAmount,
      "currency": "USD",
      "notes": "",
      "remarks": "",
      "destinationID": this.vendor.id,
      "destinationType": "vendor",
      "fundingSource": this.fundingSource['id'],
      "scheduledDate": this.futureDate,
      "pin": this.accountPin,
      "billNumber":this.bill.billID,
      "paymentMethod":this.paymentMode
    };

    this._oAuthService.futureFundTransfer(transferObj, this.companyId).subscribe(status  => {
      console.log("status", status);
      this._toastService.pop(TOAST_TYPE.success, "Funds transfer initiated successfully");
      //this.updateBill();
      this.showDashboard(true);
    }, error =>  {
      console.log("error", error);
    });
  }

paymentSelected:boolean=false;
  valueChanged(source){
    if(this.billAmount)
    this.paymentSelected=true;
    this.fundingSource = source;
    console.log("CHANGED RADIO",source);
  }

  ngOnDestroy(){
    this.routeSub.unsubscribe();
  }

}
