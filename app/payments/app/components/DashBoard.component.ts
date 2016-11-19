/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router,ActivatedRoute} from "@angular/router";
import {Ripple} from "qCommon/app/directives/rippler.directive";
import {FoundationInit} from "qCommon/app/directives/foundation.directive";
import {Focus} from "qCommon/app/directives/focus.directive";
import {BillsService} from "../services/Bills.service";
import {FTable} from "qCommon/app/directives/footable.directive";
import {BillModel} from "../models/Bill.model";
import {__platform_browser_private__,DomSanitizer} from "@angular/platform-browser";
import {DocHubService} from "../services/DocHub.service";
import {DocHubModel} from "../models/DocHub.model";
import {Session} from "qCommon/app/services/Session";
import {Response} from "@angular/http";
import {BoxService} from "../services/Box.service";
import {BoxModel} from "../models/Box.model";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {CustomDatepicker1} from "../directives/customDatepicker1";
import {OAuthService} from "../services/OAuthService";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {PAYMENTMETHOD} from "../constants/payments.constants";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {CodesService} from "qCommon/app/services/CodesService.service";

declare var _:any;
declare var jQuery:any;
declare var moment:any;

@Component({
  selector: 'dashboard',
  templateUrl: '/app/views/dashBoard.html'
})

export class DashBoardComponent {
  tabBackground:string = "#d45945";
  selectedTabColor:string = "#d45945";
  tabDisplay:Array<any> = [{'display':'none'},{'display':'none'},{'display':'none'},{'display':'none'}];
  bgColors:Array<string>=[
    '#d45945',
    '#d47e47',
    '#2980b9',
    '#3dc36f'
  ];
  hasBillsList:boolean=false;
  billsTableData:any = {};
  billsTableOptions:any = {search:false, pageSize:10};
  bills:Array<BillModel> = [];
  billImageLink:any;
  billPdfLink:any;
  hoveredBill:BillModel;
  isPdf:boolean;
  tabHeight:string;
  currentBill:BillModel;
  downloadLink:string;
  badges:any = [];
  selectedTab:any=0;
  isLoading:boolean=true;
  displayCurrency:string='USD';
  futureDate:string;
  accountPin:string;
  showPreview:boolean = false;
  localBadges:any={};
  routeSub:any;

  boxInfo:BoxModel = new BoxModel();
  hideBoxes :boolean = true;

  companySwitchSubscription: any;
  expenseCodeCount:number=0;

  constructor(private billsService: BillsService, private boxService: BoxService, private docHubService:DocHubService, private dss: DomSanitizer,
              private _router:Router,private _route: ActivatedRoute, private _oAuthService:OAuthService, private _toastService:ToastService, private companyService:CompaniesService,
              private switchBoard: SwitchBoard,private codeService: CodesService) {
    this.routeSub = this._route.params.subscribe(params => {
      this.selectedTab=params['tabId'];
      let companyId = Session.getCurrentCompany();
      if(companyId){
        this.codeService.itemCodes(companyId)
            .subscribe(itemCodes => {
              this.expenseCodeCount=itemCodes?itemCodes.length:0;
            }, error=> this.handleError(error));
      }

      this.loadTabData();
    });

    this.companySwitchSubscription = this.switchBoard.onCompanyChange.subscribe(currentCompany => this.refreshCompany(currentCompany));

    this.boxService.boxInfo()
      .subscribe(boxInfo  => this.animateBoxInfo(boxInfo), error =>  this.handleError(error));

    /*this.companyService.allVendors()
      .subscribe(data =>{
        console.log(data);
      });*/
  }

  refreshCompany(currentCompany){
    this.codeService.itemCodes(currentCompany.id)
        .subscribe(itemCodes => {
          this.expenseCodeCount=itemCodes?itemCodes.length:0;
        }, error=> this.handleError(error));
  }


  animateBoxInfo(boxInfo:BoxModel) {
    this.animateValue('payables', boxInfo.payables);
    this.animateValue('pastDue', boxInfo.pastDue);
    this.animateValue('dueToday', boxInfo.dueToday);
    this.animateValue('dueThisWeek', boxInfo.dueThisWeek);
  }

  animateValue(param, value) {
    let base = this;
    jQuery({val: value/2}).stop(true).animate({val: value}, {
      duration : 2000,
      easing: "easeOutExpo",
      step: function () {
        var _val = this.val;
        base.boxInfo[param] = Number(_val.toFixed(2));
      }
    }).promise().done(function () {
      // hard set the value after animation is done to be
      // sure the value is correct
      base.boxInfo[param] = value;
    });
  }

  loadTabData(){
    this.selectTab(this.selectedTab,"");
  }

  ngOnInit() {
  }

  reRoutePage(tabId) {
    let link = ['payments/dashboard',tabId];
    this._router.navigate(link);
  }

  payTabColumns:any = [
    {"name": "billID", "title": "Bill Number"},
    {"name": "name", "title": "Bill Name","visible": false},
    {"name": "companyID", "title": "Company",'breakpoints': 'xs sm'},
    {"name": "vendorName", "title": "Vendor"},
    {"name": "vendorID", "title": "Vendor ID","visible": false},
    {"name": "billAmount", "title": "Bill Amount"},
    {"name": "vendorPaymentMethod", "title": "Payment Method",'breakpoints': 'xs sm'},
    {"name": "payByDate", "title": "Pay by Date",'breakpoints': 'xs sm'},
    {"name": "dueDate", "title": "Due Date"},
    {"name": "state", "title": "", "type": "html", "filterable": false},
    {"name": "payActions", "title": "", "type": "html", "filterable": false,'breakpoints': 'xs sm'},
    {"name": "actions", "title": "", "type": "html", "filterable": false}
  ]

  approveTabColumns:any = [
    {"name": "billID", "title": "Bill Number"},
    {"name": "name", "title": "Bill Name","visible": false},
    {"name": "companyID", "title": "Company"},
    {"name": "vendorName", "title": "Vendor"},
    {"name": "vendorID", "title": "Vendor ID","visible": false},
    {"name": "vendorPaymentMethod", "title": "Payment Method","visible": false},
    {"name": "billAmount", "title": "Bill Amount"},
    {"name": "payByDate", "title": "Pay by Date"},
    {"name": "dueDate", "title": "Due Date",'breakpoints': 'xs sm'},
    {"name": "state", "title": "", "type": "html", "filterable": false,'breakpoints': 'xs sm'},
    {"name": "actions", "title": "", "type": "html", "filterable": false}
  ]

  payedTabColumns:any = [
    {"name": "billID", "title": "Bill Number"},
    {"name": "name", "title": "Bill Name","visible": false},
    {"name": "companyID", "title": "Company",'breakpoints': 'xs sm'},
    {"name": "vendorName", "title": "Vendor"},
    {"name": "vendorID", "title": "Vendor ID","visible": false},
    {"name": "vendorPaymentMethod", "title": "Payment Method","visible": false},
    {"name": "billAmount", "title": "Bill Amount"},
    {"name": "paidDate", "title": "Paid Date"},
    {"name": "actions", "title": "", "type": "html", "filterable": false}
  ]

  buildBillsTableData(bills:Array<BillModel>, fromTab) {
    this.bills = bills;
    this.billsTableData.columns = [
      {"name": "billID", "title": "Bill Number"},
      {"name": "name", "title": "Bill Name","visible": false},
      {"name": "companyID", "title": "Company"},
      {"name": "dueDate", "title": "Due Date","visible": false},
      {"name": "lastUpdated", "title": "Last Updated",'breakpoints': 'xs sm'},
      {"name": "lastUpdatedBy", "title": "Last Updated By", "classes":"last-updated-by"},
      {"name": "state", "title": "", "type": "html", "filterable": false,'breakpoints': 'xs sm'},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    if((this.selectedTab==2)||(this.selectedTab==1)){
      this.billsTableData.columns[2]={"name": "dueDate", "title": "Due Date","visible": true};
    }

    if(this.selectedTab==1) {
      this.billsTableData.columns = this.approveTabColumns;
    }

    if(this.selectedTab==2) {
      this.billsTableData.columns = this.payTabColumns;
    }

    if(this.selectedTab==3) {
      this.billsTableData.columns = this.payedTabColumns;
    }

    this.billsTableData.rows = [];
    let base = this;
    this.bills.forEach(function(bill) {
      let row:any = {};
      let billAmount=bill['amount']?bill['amount']:0;
      let currency=bill['currency']?bill['currency']:'USD';
      row['billID'] = bill['billID'];
      row['name'] = bill['name'];
      row['companyID'] = bill['companyName'];
      row['vendorName'] = bill['vendorName'];
      row['vendorID'] = bill['vendorID'];
      row['vendorPaymentMethod'] = base.getPaymentMethod(bill['vendorPaymentMethod']);
      row['billAmount'] =billAmount.toLocaleString(currency, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      row['lastUpdated'] = bill['lastUpdated'];
      row['lastUpdatedBy'] = bill['lastUpdatedBy'];
      row['dueDate']=bill['dueDate'];
      row['paidDate']=bill['paidDate'];

      if(bill.currentState == 'approve' || bill.currentState == 'payee'){
        row['payByDate'] = bill['payByDate'];
      }

      if(bill['subState']) {
        row['state'] = "";
        if(bill['subState'] == 'draft') {
         row['state'] = "<i class='icon ion-clipboard' style='color:#e6604a;font-size: 1.2rem'></i>";
        }

        if(bill['subState'] == 'rejected') {
          row['state'] = "<i class='icon ion-thumbsdown' style='color:#e6604a;font-size: 1.2rem'></i>";
        }

        if(bill['subState'] && bill['subState'].toLowerCase() == 'scheduled') {
          if(bill['payments']&&bill['payments'].length>0&&bill['payments'][bill['payments'].length-1].scheduledOn){
            row['state']="<span class='label success' style='background:#0FB45A'>"+moment(bill['payments'][bill['payments'].length-1].scheduledOn, 'MM-DD-YYYY').format('DD MMM').toUpperCase()+"</span>"
          }
        }
      } else {
        row['state'] = "";
      }
      row['actions'] = "<a class='action' data-action='view' style='font-size:1.3rem;margin:0px;'><i class='icon ion-ios-eye'></i></a><a class='action' data-action='entry' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";

      if(base.selectedTab==2) {
        if(bill['subState'] && bill['subState'].toLowerCase() != 'scheduled') {
          row['payActions'] = "<a style='font-size:0.6rem;color:#ffffff;margin:0px 5px 0px 0px;' class='button small action' data-action='pay'>Pay</a><a data-toggle='pay-later-dropdown' style='font-size:0.6rem;color:#ffffff;margin:0px 15px 0px 0px;' class='button small action' data-action='payLater'>Pay Later</a>";
        }
      }

      base.billsTableData.rows.push(row);
    });
    if(this.bills.length>0){
      this.hasBillsList = true;
    }
    this.isLoading=false;
  }



  private handleError(error:any) {

  }

  addFreshBill(){
    let link = ['payments/newBill'];
    this._router.navigate(link);
  }
  updateTabHeight(){
    let base = this;
      let topOfDiv = jQuery('.tab-content').offset().top;
      topOfDiv = topOfDiv<150? 170:topOfDiv;
      let bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
      base.tabHeight = (bottomOfVisibleWindow - topOfDiv -25)+"px";
      jQuery('.tab-content').css('height', base.tabHeight);
      base.billsTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
  }
  ngAfterViewInit() {
    let base = this;
    jQuery(document).ready(function() {
      base.updateTabHeight();
    });
  }
  selectedColor:any='red-tab';
  selectTab(tabNo, color) {

    this.isLoading=true;
    this.selectedTab=tabNo;
    this.selectedColor=color;
    this.hasBillsList = false;
    let filters:Array<string> = ['entry', 'approve', 'payee', 'paid'];
    let base = this;
    this.tabDisplay.forEach(function(tab, index){
      base.tabDisplay[index] = {'display':'none'}
    });
    this.localBadges=JSON.parse(sessionStorage.getItem("localBadges"));
    this.tabDisplay[tabNo] = {'display':'block'};
    this.tabBackground = this.bgColors[tabNo];
    jQuery('.loading-initial-cont').hide();
    this.billsService.bills(filters[tabNo])
      .subscribe(billsData  => {
        this.buildBillsTableData(billsData.bills, filters[tabNo]);
        this.badges = billsData.badges;
        sessionStorage.setItem("localBadges",JSON.stringify(billsData.badges));
        this.localBadges=JSON.parse(sessionStorage.getItem("localBadges"));
      }, error =>  this.handleError(error));

  }

  showBill(bill:BillModel) {
    let selectedBill = _.find(this.bills, function(_bill:BillModel){
      return _bill.name == bill.name;
    });
    let link = ['payments/bill',selectedBill.companyID,selectedBill.id,this.selectedTab];
    this._router.navigate(link);
  }

  deleteBill(bill:BillModel) {
    var base=this;
    let selectedBill = _.find(this.bills, function(_bill:BillModel){
      return _bill.name == bill.name;
    });
    _.remove(this.bills, function(_bill:BillModel){
      return _bill.name == selectedBill.name;
    });

    this.billsService.deleteBill(selectedBill).subscribe(success  => {
      if(base.bills.length==0){
        base.selectTab(this.selectedTab,this.selectedColor);
      }
    }, error =>  this.handleError(error));

  }

  showBillPreview(bill:BillModel) {
    let base = this;
    this.hoveredBill = _.find(this.bills, function(_bill:BillModel){
      return _bill.name == bill.name;
    });
    this.showPreview = true;
    let docHubModel = new DocHubModel();
    docHubModel.bucketName = this.hoveredBill.bucketName;
    docHubModel.keyName = this.hoveredBill.documentKeyName;
    docHubModel.token = Session.getToken();
    docHubModel.accessLinkFlag = true;
    /* this.docHubService.getLink(docHubModel).subscribe(docResp  => {
     let link = docResp.message;
     if(link.indexOf(".pdf") == -1) {
     this.isPdf = false;
     setTimeout(function(){
     base.billImageLink = base.dss.bypassSecurityTrustUrl(link);
     }, 500);
     } else {
     this.isPdf = true;
     link = 'http://docs.google.com/gview?embedded=true&url='+link;
     setTimeout(function(){
     base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl(link);
     }, 500);
     }
     }, error =>  this.handleError(error));*/

    this.downloadLink = this.docHubService.getStreamLink(docHubModel);
    let link = this.docHubService.getStreamLink(docHubModel);

    if(this.hoveredBill.name.indexOf(".pdf") == -1) {
      this.isPdf = false;
      this.docHubService.getLink(docHubModel).subscribe(docResp  => {
        link = docResp.message;
      }, error =>  this.handleError(error));
      setTimeout(function(){
        base.billImageLink = base.dss.bypassSecurityTrustUrl(link);
      }, 500);
    } else {
      this.isPdf = true;
      link = 'http://docs.google.com/gview?embedded=true&url='+encodeURIComponent(link);
      setTimeout(function(){
        base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl(link);
      }, 500);
    }
  }

  download() {
    let docHubModel = new DocHubModel();
    let base = this;
    docHubModel.bucketName = this.hoveredBill.bucketName;
    docHubModel.keyName = this.hoveredBill.documentKeyName;
    docHubModel.token = Session.getToken();
    docHubModel.download = true;


    this.docHubService.getStream(docHubModel).subscribe(docResp  => this.docHubService.downloadFile(<Response>docResp, this.hoveredBill.name), error =>  this.handleError(error));
  }

  handleAction(event:any) {
    let action = event.action;
    delete event.action;
    if(action == 'entry') {
      this.showBill(event);
    } else if(action == 'delete'){
      this.deleteBill(event);
    } else if(action == 'payLater') {
      this.hoveredBill = _.find(this.bills, function(_bill:BillModel){
        return _bill.name == event.name;
      });
      jQuery('#pay-later-dropdown').foundation('open');
    } else if(action == 'pay') {
      this.hoveredBill = _.find(this.bills, function(_bill:BillModel){
        return _bill.name == event.name;
      });
      let link = ['payments/BillPay', {"companyId": this.hoveredBill.companyID,"id":this.hoveredBill.id}];
      this._router.navigate(link);
      //this.getFundingSource();
    } else if(action == 'view') {
      this.showBillPreview(event);
    }
  }

  payBill(){
    let transferObj:any = {
      "billID": this.hoveredBill.id,
      "billName": this.hoveredBill.name,
      "amount": this.hoveredBill.amount,
      "currency": "USD",
      "notes": "",
      "remarks": "",
      "destinationID": this.hoveredBill.vendorID,
      "destinationType": "vendor"
      //"fundingSource": fundingSource['_links']['self']['href']
    };

    this._oAuthService.fundTransfer(transferObj, this.hoveredBill.companyID).subscribe(status  => {
      this._toastService.pop(TOAST_TYPE.success, "Funds transfer initiated successfully");
      this.showPaymentsTab();
    }, error =>  {
      console.log("error", error);
    });
  }

  showPaymentsTab() {
    let link = ['payments/dashboard',3];
    this._router.navigate(link);
  }

  getFundingSource(paymentType?) {
    let fundingSource;
    this._oAuthService.fundingSources(this.hoveredBill.companyID).subscribe(fundingSourcesObj  => {
      if(fundingSourcesObj['_embedded']) {
        let fundingSources=fundingSourcesObj['_embedded']['funding-sources'];

        _.remove(fundingSources, function(source) {
          return source['type'] == 'balance';
        })
        fundingSource = fundingSources[0];
        if(paymentType && paymentType == 'makeFuturePayment') {
          this.makeFuturePayment(fundingSource);
        } else {
          this.payBill();
          //this.payBill(fundingSource);
        }
        return fundingSource;
      }
    }, error =>  {

    });
    return null;
  }


  makeFuturePayment(fundingSource?) {
    let transferObj:any = {
      "billID": this.hoveredBill.id,
      "billName": this.hoveredBill.name,
      "amount": this.hoveredBill.amount,
      "currency": "USD",
      "notes": "",
      "remarks": "",
      "destinationID": this.hoveredBill.vendorID,
      "destinationType": "vendor",
      "scheduledDate": this.futureDate,
      "pin": this.accountPin,
      "billNumber":this.hoveredBill.billID
    };
    this._oAuthService.futureFundTransfer(transferObj, this.hoveredBill.companyID).subscribe(status  => {
      this._toastService.pop(TOAST_TYPE.success, "Funds transfer initiated successfully");
      this.futureDate=null;
      this.showPaymentsTab();
    }, error =>  {
      console.log("error", error);
    });
  }

  setFutureDate(date) {
    this.futureDate = date;
  }

  hideBillPreview() {
    this.hoveredBill = null;
    this.showPreview = false;
  }

  getPaymentMethod(label){
    if(label)
      return PAYMENTMETHOD[label];
  }

  ngOnDestroy(){
    this.routeSub.unsubscribe();
  }

  goToTools(val){
    if(val=='workflow'){
      let link = ['payments/workflow'];
      this._router.navigate(link);
    }else if(val=='expenseCode'){
      let link = ['/itemCodes'];
      this._router.navigate(link);
    }
  }

  ngOnDestroy(){
    this.companySwitchSubscription.unsubscribe();
  }

}
