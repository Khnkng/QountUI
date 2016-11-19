/**
 * Created by seshu on 25-07-2016.
 */

import {BillsService} from "../services/Bills.service";
import {FoundationInit} from "qCommon/app/directives/foundation.directive";
import {FormGroup, FormBuilder, FormArray} from "@angular/forms";
import {FTable} from "qCommon/app/directives/footable.directive";
import {Focus} from "qCommon/app/directives/focus.directive";
import {Ripple} from "qCommon/app/directives/rippler.directive";
import {ActivatedRoute,Router} from "@angular/router";
import {BillForm} from "../forms/Bill.form";
import {Component, ViewChild, OnInit, ElementRef} from "@angular/core";
import {BillModel} from "../models/Bill.model";
import {__platform_browser_private__,DomSanitizer} from "@angular/platform-browser";
import {CustomDatepicker} from "../directives/customDatepicker";
import {LineModel} from "../models/Line.model";
import {CheckListModel} from "../models/CheckList.model";
import {CheckListForm, LineListForm} from "../forms/CheckListForm";
import {Session} from "qCommon/app/services/Session";
import {DocHubService} from "../services/DocHub.service";
import {DocHubModel} from "../models/DocHub.model";
import {Response} from "@angular/http";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {RecipientInputComponent} from "./RecipientInput.component";
import {UsersService} from "../services/Users.service";
import {RecipientInput} from "../models/RecipientInput.model";
import {CommentModel} from "../models/Comment.model";
import {CommentsService} from "../services/Comments.service";
import {CURRENCY} from "qCommon/app/constants/Currency.constants";
import {WorkflowService} from "../services/Workflow.service";
import {CustomTags} from "qCommon/app/directives/customTags";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {UUID} from "angular2-uuid/index";
import {CodesService} from "qCommon/app/services/CodesService.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";


declare var jQuery:any;
declare var Foundation:any;
declare var _:any;
declare var moment:any;

@Component({
  selector: 'bill',
  templateUrl: '/app/views/bill.html',

})

export class BillComponent implements  OnInit {

  type:string = "component";
  billForm:FormGroup;
  billID:string;
  companyID:string;
  bill:BillModel;
  billImageLink:any;
  billPdfLink:any;
  isPdf:boolean;
  tabHeight:string;
  formHeight:string;
  lines:Array<LineModel> = [];
  status:any;
  message:string;
 // @ViewChild('tags') tags;
  @ViewChild('edit1099') edit1099;
  checkListDone:boolean;
  checkList:Array<CheckListModel> = [];
  havingChecklist:boolean=false;
  havingLinelist:boolean=false;
  chkLstArray:FormArray = new FormArray([]);
  billLines:Array<LineModel> = [];
  billLinesArray:FormArray = new FormArray([]);
  downloadLink:string;
  currentState:string;
  addLineItemMode:boolean = false;
  notes:any=null;
  tabId:any;
  itemCodes:Array<string> = [];
  expenseCodes:Array<string> = [];
  currencies=CURRENCY;
  vendors:Array<string>=[];
  displayCurrency:string='USD';
  editingName:boolean=false;
  newName:string;
  maxRank:number;
  billRank:number;
  showComments:boolean;
  showOverlay:boolean;
  billTags:Array<string>=[];
  loaded:boolean=false;
  vendorsList:Array<any>=[];
  show1099:boolean=false;
  billCurrency:string='USD';
  companyCurrency:string='USD';
  showConvertedCurrency:boolean=false;
  convertedAmount:number=1;
  companyCurrencyAmount:number=0;
  onBillApplied:boolean=false;
  newBill:boolean = false;
  companies:any = [];
  selectedCompany:any;
  billFileExist: boolean = false;
  allowEditAmount:boolean=false;
  accountNumbers:Array<any> = [];
  routeSub:any;


  constructor(private elementRef: ElementRef, private _fb: FormBuilder, private billsService:BillsService, private docHubService:DocHubService, private _billForm:BillForm, private _checkListForm:CheckListForm,private _lineListForm:LineListForm,
              private _route:ActivatedRoute, private dss: DomSanitizer,private _router: Router,private _toastService: ToastService,private _commentsService:CommentsService,private companyService: CompaniesService,
              private workflowService:WorkflowService,private codeService: CodesService,private switchBoard:SwitchBoard) {
    this.routeSub = this._route.params.subscribe(params => {
      this.billID = params['id'];
      this.companyID = params['companyId'];
      this.tabId = params['tabId'];
      if(params['showComments']){
        this.showComments = params['showComments'] == 'true';
        if (this.showComments) {
          this.showOverlay = true;
        }
      }
      this.loadData();
    });

    this.switchBoard.onSideBarExpand.subscribe(flag => {
      this.toggleLine()
    });

  }
  toggleLine(){
      if(this.addLineItemMode){
      this.addLineItemMode=false;
    }
  }

  loadData(){
    if (this.billID) {
      this.tabHeight = (jQuery(window).height() - 250) + "px";
      this._commentsService.getComments(this.billID, this.companyID).subscribe(comments => this.handleComments(comments), error => this.showError(error));
      this.codeService.itemCodes(this.companyID)
          .subscribe(itemCodes => {
            this.itemCodes = itemCodes ? _.map(itemCodes,'name') : [];
          }, error=> this.handleError(error));

      this.companyService.company(this.companyID).subscribe(companies => {
        /*this.itemCodes = companies.itemCodes ? companies.itemCodes : [];*/
        this.expenseCodes = companies.expenseCodes ? companies.expenseCodes : [];
        this.companyCurrency = companies.defaultCurrency;
      }, error => this.showError(error));
      this.companyService.vendors(this.companyID)
        .subscribe(vendors => {
          vendors ? this.vendors = _.map(vendors, 'name') : [];
          vendors ? this.vendorsList = vendors : [];
        }, error => this.handleError(error));
      this.workflowService.workflow(this.companyID)
        .subscribe(workflow => {
          let approveFlowSteps = workflow.approve ? workflow.approve : [];
          this.maxRank = Math.max(..._.map(approveFlowSteps, 'rank'));
        }, error => this.handleError(error));
      this.formHeight = (jQuery(window).height() - 250) + "px";
    } else {
      this.newBill = true;
    }
  }


  ngOnInit():any {
    let _form:any = this._billForm.getForm();
    //this.chkLstArray = this._fb.array([]);
    _form['checkList'] = this.chkLstArray;
    _form['lines'] = this.billLinesArray;
    this.billForm = this._fb.group(_form);
    if(!this.newBill){
      this.companyService.vendors(this.companyID)
        .subscribe(vendors => {
          vendors ? this.vendors = _.map(vendors, 'name') : [];
          vendors ? this.vendorsList = vendors : [];
          this.getBillData();
        }, error => this.handleError(error));
    } else{
      this.bill = this._billForm.getData(this.billForm);
      this.billID = UUID.UUID();
      this.bill.id = this.billID;
      this.companyService.companies()
        .subscribe(companies => {
          this.companies = companies;
        }, error => this.handleError(error));
    }
  }

  getBillData(){
    this.billsService.bill(this.companyID, this.billID)
      .subscribe(bill  => this.processBill(bill), error =>  this.handleError(error));
  }

  isBillLoading(){
    return !this.newBill && !this.bill;
  }

  selectCompany(companyId){
    if(companyId){
      this.selectedCompany = _.find(this.companies, function (company) {
        return company.id == companyId;
      });
      this.workflowService.workflow(companyId)
        .subscribe(workflow => {
          if(_.isEmpty(workflow)){
            this._toastService.pop(TOAST_TYPE.error, "No workflow found for "+ this.selectedCompany.name);
          } else{
            this.companyID = companyId;
            this.expenseCodes = this.selectedCompany.expenseCodes;
            this.itemCodes = this.selectedCompany.itemCodes;
          }
        });
      this.companyService.vendors(companyId)
        .subscribe(vendors => {
          vendors ? this.vendors = _.map(vendors, 'name') : [];
          vendors ? this.vendorsList = vendors : [];
        }, error => this.handleError(error));
    }
  }

  roundOffAmount($event){
    let value = $event.target.value;
    if(value.indexOf('.') != -1){
      if(!(value.split('.').length == 2 && value.split('.')[1].length < 2)){
        if(($event.keyCode >= 48 && $event.keyCode <= 57) || ($event.keyCode >= 65 && $event.keyCode <= 90)){
          $event && $event.preventDefault();
        }
      }
    }
  }

  updateName($event){
    $event && $event.preventDefault();
    $event && $event.stopImmediatePropagation();
    this.bill.name = this.newName;
    this._billForm.updateForm(this.billForm, this.bill);
    this.editingName = false;
  }

  editName($event){
    $event && $event.preventDefault();
    $event && $event.stopImmediatePropagation();
    this.editingName = true;
  }

  ngOnDestroy(){
    this.notes = null;
    this.billTags = [];
  }

  stopPropagation($event){
    $event && $event.stopImmediatePropagation();
  }

  processBill(bill:any) {
    let base = this;
    if(bill.lines) {
      bill.lines = JSON.parse(bill.lines);
    } else {
      bill.lines = [];
    }
    this.bill = bill;
    this.billRank=bill.rank;
    if(!this.bill.recurring){
      this.bill.recurring = "onlyonce";
    }
    if(!this.bill.amount){
      this.bill.amount = 0;
    }
    if(!this.bill._1099Amount){
      this.bill._1099Amount = 0;
    }
    this._billForm.updateForm(this.billForm, this.bill);
    this.newName = bill.name;
    if(this.bill.checkList) {
      this.bill.checkList.forEach(function(item){
        let checkListForm = base._fb.group(base._checkListForm.getForm(item));
        base.chkLstArray.push(checkListForm);
      });
      if(this.bill.checkList&&this.bill.checkList.length>0){
        this.havingChecklist=true;
      }
    }
    this.lines = this.bill.lines;
    this.notes=this.bill.notes;
    this.displayCurrency=this.bill.currency?this.bill.currency:'USD';
    if(this.bill.lines) {
      this.bill.lines.forEach(function(line){
        let lineListForm = base._fb.group(base._lineListForm.getForm(line));
        base.billLinesArray.push(lineListForm);
      });
      if(this.bill.lines&&this.bill.lines.length>0){
        this.havingLinelist=true;
      }
    }
    if(this.bill.currentState=='paid'){
      if(this.bill.currency!=this.companyCurrency){
        this.companyCurrencyAmount=this.bill.amountPaid;
        this.showConvertedCurrency=true;
      }
    }else {
      if(this.bill.currency)
        this.onCurrencySelect(this.bill.currency);
    }


    this.currentState=this.bill.currentState;

    this.billTags=bill.tags;
    this.loaded=true;
    if(this.bill.bucketName && this.bill.documentKeyName){
      let docHubModel = new DocHubModel();
      docHubModel.bucketName = this.bill.bucketName;
      docHubModel.keyName = this.bill.documentKeyName;
      docHubModel.token = Session.getToken();
      docHubModel.accessLinkFlag = true;
      this.downloadLink = this.docHubService.getStreamLink(docHubModel);
      let link = this.docHubService.getStreamLink(docHubModel);
      if(this.bill.name.indexOf(".pdf") == -1) {
        this.isPdf = false;
        this.docHubService.getLink(docHubModel).subscribe(docResp  => {
          link = docResp.message;
        }, error =>  this.handleError(error));
        setTimeout(function(){
          base.billFileExist = true;
          base.billImageLink = base.dss.bypassSecurityTrustUrl(link);
        }, 10);
      } else {
        this.isPdf = true;
        base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl("/app/views/loadingBill.html");
        link = 'https://docs.google.com/gview?embedded=true&url='+encodeURIComponent(this.downloadLink);
        setTimeout(function(){
          base.billFileExist = true;
          base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl(link);
        }, 0);
      }
    }/* else{
      this.billFileExist = false;
    }*/

    if(this.bill.vendorName)
      this.onVendorSelect(this.bill.vendorName);

    /* TODO: need to reinitialize tooltips to updated title*/
    /*this.reinitialize(['tooltip']);*/
  }

  reinitialize(plugins:any){
    var base = this;
    setTimeout(function(){
      //jQuery('.tooltip').foundation('destroy');
      Foundation.reflow(base.elementRef.nativeElement,plugins);
    },0);
  }

  download() {
    let docHubModel = new DocHubModel();
    let base = this;
    docHubModel.bucketName = this.bill.bucketName;
    docHubModel.keyName = this.bill.documentKeyName;
    docHubModel.token = Session.getToken();
    docHubModel['download'] = true;
    //docHubModel.accessLinkFlag = true;

    this.docHubService.getStream(docHubModel).subscribe(docResp  => this.docHubService.downloadFile(<Response>docResp, this.bill.name), error =>  this.handleError(error));
  }

  getStatusClass(status){
    let labelClass;
    switch(status) {
      case 'Draft':
        labelClass =  'secondary';
        break;
      case 'Rejected':
        labelClass =  'alert';
        break;
      case 'Paid':
        labelClass =  'success';
        break;
      case 'Scheduled':
        labelClass =  'success';
        break;
      default:
        labelClass =  'warning';
    }
    return labelClass;

  }

  calcAmount(event, index?) {
    let quantity, unitPrice, amount, amountValue;
    if(index || index == 0) {
      let lineList:any = this.billForm.controls['lines'];
      quantity = this.checkNumber(lineList.controls[index].controls['quantity'].value);
      unitPrice = this.checkNumber(lineList.controls[index].controls['unitPrice'].value);
      amountValue = lineList.controls[index].controls['amount'].value;
      amount = lineList.controls[index].controls['amount'];
    } else {
      quantity = this.checkNumber(this.billForm.controls['quantity'].value);
      unitPrice = this.checkNumber(this.billForm.controls['unitPrice'].value);
      amountValue = this.billForm.controls['lineAmount'].value;
      amount = this.billForm.controls['lineAmount'];
    }

    if((quantity || quantity == 0) && (unitPrice || unitPrice == 0)) {
      amountValue =  quantity * unitPrice;
      amount.patchValue(+(this.checkNumber(amountValue)).toFixed(2));
      this.allowEditAmount=true;
    }
    else if(amountValue) {
      if((""+amountValue).indexOf('.') != amountValue.length - 1){
        amount.patchValue(+(this.checkNumber(amountValue)).toFixed(2));
      }
    }
  }

  checkNumber(val) {
    if((val || val == 0) && !isNaN(val)) {
      let _val = parseFloat(val);
      return _val;
    }
    return null;
  }

  addLineAmount($event) {
    $event && $event.preventDefault() && $event.stopPropagation();
    let amount = this.billForm.controls['lineAmount'].value;
    if(!isNaN(amount)) {
      let line:LineModel = new LineModel();
      line.number = this.lines.length + 1;
      line.amount = amount;
      this.lines.push(line);
      let lineControl:any = this.billForm.controls['lineAmount'];
      lineControl.patchValue(null);
    }
    return false;
  }

  addLine($event) {
    let base = this;
    $event.preventDefault();
    $event.stopPropagation();
    this.allowEditAmount=false;
    let values:any = this.checkLine();
    if(values) {

        let line:LineModel = new LineModel();
        line.number = this.lines.length + 1;
        line.amount = values.amount;
        line.description = values.description;
        line.itemCode=values.itemCode;
        line.quantity=values.quantity;
        line.unitPrice=values.unitPrice;
        line.expenseCode=values.expenseCode;
        if(this.show1099){
          line.has1099=true;
          line.tags=[];
        }
        this.lines.push(line);
        let lineAmountControl:any = this.billForm.controls['lineAmount'];
        lineAmountControl.patchValue(null);
        let lineUnitControl:any = this.billForm.controls['unitPrice'];
        lineUnitControl.patchValue(null);
        let lineQuantityControl:any = this.billForm.controls['quantity'];
        lineQuantityControl.patchValue(null);
        let lineItemCodeControl:any = this.billForm.controls['itemCode'];
        lineItemCodeControl.patchValue(null);
        let lineAccountCodeControl:any = this.billForm.controls['expenseCode'];
        lineAccountCodeControl.patchValue(null);
        let lineDescriptionControl:any = this.billForm.controls['lineDescription'];
        lineDescriptionControl.patchValue(null);
        let lineListForm = base._fb.group(base._lineListForm.getForm(line));
        base.billLinesArray.push(lineListForm);
      this.updateLineToatal(null,null);
      this.addLineItemMode = false;
    }

    return false;
  }

  checkLine(index?) {
    let amount,quantity,unitPrice, description, itemCode, expenseCode;
    if(index || index == 0) {
      let lineList:any = this.billForm.controls['lines'];
      amount = this.checkNumber(lineList.controls[index].controls['amount'].value);
      quantity = this.checkNumber(lineList.controls[index].controls['quantity'].value);
      unitPrice = this.checkNumber(lineList.controls[index].controls['unitPrice'].value);
      description = lineList.controls[index].controls['description'].value;
      itemCode=lineList.controls[index].controls['itemCode'].value;
      expenseCode=lineList.controls[index].controls['expenseCode'].value;
    } else {
      amount = this.checkNumber(this.billForm.controls['lineAmount'].value);
      quantity = this.checkNumber(this.billForm.controls['quantity'].value);
      unitPrice = this.checkNumber(this.billForm.controls['unitPrice'].value);
      description = this.billForm.controls['lineDescription'].value;
      itemCode=this.billForm.controls['itemCode'].value;
      expenseCode=this.billForm.controls['expenseCode'].value;
    }

    if((!quantity && quantity != 0) || (!unitPrice && unitPrice != 0)) {
      quantity = null;
      unitPrice = null;
    }

    if(amount && description ) {
      return {
        amount: amount,
        quantity: quantity,
        unitPrice: unitPrice,
        description: description,
        itemCode: itemCode,
        expenseCode: expenseCode
      }
    }
    return null;
  }

  updateLineToatal(id,index){
    let values = this.checkLine(index);
    let lineList:any = this.billForm.controls['lines'];

    if(values) {
      lineList.controls[index].editable = false;
    }
      var base=this;
      let total:number = 0;
      let _1099total:number=0;
      lineList.controls.forEach(function(control){
        if(control.controls.amount.value) {
          total = total + parseFloat(''+control.controls.amount.value);
          if(base.show1099&&control.controls.has1099.value)
            _1099total=_1099total + parseFloat(''+control.controls.amount.value);
          if(base.show1099){
            if(id==control.controls.number.value){
              setTimeout(function () {
                var val=jQuery('#lineTags-'+index).tagit("assignedTags");
                if(val)
                  control.controls.tags.patchValue(val);
              },1000);
            }
          }
        }
      });
      let totalAmountControl:any = this.billForm.controls['amount'];
      if(this.show1099){
        let total1099AmountControl:any = this.billForm.controls['_1099Amount'];
        total1099AmountControl.patchValue(_1099total);
      }
      totalAmountControl.patchValue(total);
      this.companyCurrencyAmount=total*this.convertedAmount;
      return total;
  }

  removeLine($event, index) {
    $event.preventDefault();
    $event.stopPropagation();
    let lineList:any = this.billForm.controls['lines'];
    this.lines.splice(index, 1);
    lineList.controls.splice(index, 1);
    this.updateLineToatal(null,null);
    return false;
  }

  setDueDate(date:string) {
    let dueDateControl:any = this.billForm.controls['dueDate'];
    dueDateControl.patchValue(date);
  }

  setBillDate(date:string) {
    let billDateControl:any = this.billForm.controls['billDate'];
    billDateControl.patchValue(date);
    if(this.billForm.controls['term'].value) {
     this.selectTerm(this.billForm.controls['term'].value);
    }
  }

  setEndDate(date:string) {
    let endDateControl:any = this.billForm.controls['endDate'];
    endDateControl.patchValue(date);
  }

  submit($event, action?:string) {
    $event && $event.preventDefault();
    let data:BillModel = this._billForm.getData(this.billForm);
    data.tags = jQuery('#mainTags').tagit("assignedTags");
    if(data.hasPaidApplied){
      this.onBillApplied=data.hasPaidApplied;
    }
    data.notes=this.notes;
    delete data.currentUsers;
    delete data.link;
    delete data['userID'];
    delete data['lineAmount'];
    delete data['lineDescription'];

    if(action) {
      data.action = action;
    }

    if(action == 'newBill'){
      data.currentState = 'entry';
      data.companyID = this.companyID;
      data.companyName = this.selectedCompany.name;
      this.billsService.createBill(data, this.companyID)
        .subscribe(success  => this.showMessage(true, success, action), error =>  this.showMessage(false, error, action));
    } else{
      this.billsService.updateBill(<BillModel>data)
        .subscribe(success  => this.showMessage(true, success, action), error =>  this.showMessage(false, error, action));
    }
  }

  reject() {

  }

  showMessage(status, obj, action) {
   var base=this;
    let nextTab = base.tabId;
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.message = "Bill saved successfully.";

      if(action && action == 'reject') {
        this.message = "Bill got rejected successfully."
      }
      if(action && action != 'reject') {
        nextTab = Number(nextTab) + 1;
        if(this.tabId == 0) {
          this.message = "Bill Sent For Approval.";
        } else if(this.tabId == 1) {
          this.message = "Bill Approved.";
          if(this.billRank!=this.maxRank){
            nextTab=base.tabId;
          }
        } else if(this.tabId == 2) {
          this.message = "Bill Payment Initiated";
        }
      }
      if(action == 'newBill'){
        nextTab = 0;
      }

      if(this.onBillApplied){
        nextTab=3;
        this.message = "Bill Payed Successfully";
      }

      this.newForm();
      this._toastService.pop(TOAST_TYPE.success, this.message);

      let link = ['payments/dashboard',nextTab];
       base._router.navigate(link);

    } else {
      this.status = {};
      this.status['error'] = true;
      this.message = obj;
      this._toastService.pop(TOAST_TYPE.error, "Failed to update");
    }
  }

  hasCheckedAll() {
    let checkListCntl:any = this.billForm.controls['checkList'];
    let status = true;
    checkListCntl.controls.forEach(function(control){
      if(!control.controls['acknowledged'].value) {
        status = false;
      }
    });

    let amount = this.checkNumber(this.billForm.controls['amount'].value);

    if(!amount || amount <= 0.00) {
      status = false;
    }

    return status;
  }

  edit1099Bill(){
    jQuery(this.edit1099.nativeElement).foundation('open');
  }

  isCurrentUser() {
    if(this.bill && this.bill.currentState != 'paid' && (this.bill.ownerID == Session.getUser().id || this.bill.currentUsers.indexOf(Session.getUser().id) != -1)) {
      return true;
    }
    return false;
  }

  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;

  newForm() {
    this.active = false;
    setTimeout(()=> this.active=true, 0);
  }

  ngAfterViewInit() {
   // jQuery(this.tags.nativeElement).tagit();
  }

  handleError(error) {
  }

  submitPay($event){
    $event && $event.preventDefault();
    let link = ['payments/bill-pay',this.companyID,this.billID];
    this._router.navigate(link);
  }

  onEnter(recipientInput:RecipientInput) {
    var commentModel = <CommentModel>{};
    commentModel.sourceID = this.billID;
    commentModel.mentions_id = _.map(recipientInput.recipients, 'id');
    commentModel.mentions_name = _.map(recipientInput.recipients, 'name');
    commentModel.comment = recipientInput.comment;
    commentModel.user=Session.getUser().firstName;
    this._commentsService.saveComments(this.billID, this.companyID, commentModel).subscribe(comment => this.handleComment(comment), error => this.showError(error));
  }
  handleComment(comment){
      this.billComments.splice(0, 0, comment);
      this.commentsLength = this.billComments.length;
  }

  billComments = [];
  commentsLength = 0;
  handleComments(comments){
    this.billComments=comments;
    this.commentsLength=comments.length;
  }

  selectTerm(term) {
    let days = term == 'custom' ? 0 : term.substring(3, term.length);
    let new_date = moment(this.billForm.controls['billDate'].value, 'MM/DD/YYYY').add(days, 'days');

    let dueDateControl:any = this.billForm.controls['dueDate'];
    dueDateControl.patchValue(moment(new_date).format('MM/DD/YYYY'));
  }

  showError(error){

  }

  openTags(){
   // jQuery(this.tags.nativeElement).foundation('open');
  }

  onVendorSelect(val){
    var vendor=_.find(this.vendorsList, function(o) { return o.name == val; });
    this.accountNumbers = [];
    if(vendor){
      this.show1099=vendor.has1099;
      let vendorID:any = this.billForm.controls['vendorID'];
      vendorID.patchValue(vendor.id);
      if(vendor.accountNumbers){
        this.accountNumbers = vendor.accountNumbers;
      } else if(vendor.accountNumber){
        this.accountNumbers = [vendor.accountNumber];
      }
      let vendorPaymentMethod:any = this.billForm.controls['vendorPaymentMethod'];
      vendorPaymentMethod.patchValue(vendor.paymentMethod);
    }
    console.log("this.show1099",this.show1099);
  }

  onCurrencySelect(val){
    this.billCurrency=val;
    this.displayCurrency=val;
    if(this.billCurrency!=this.companyCurrency){
      this.showConvertedCurrency=true;
      this.getCurrencyValue(this.billCurrency, this.companyCurrency, this.billForm.controls['billDate'].value)
    }else{
      this.showConvertedCurrency=false;
    }
  }

  getCurrencyValue(billCurrency,companyCurrency,billDate){
    if(billDate)
      billDate=moment(this.billForm.controls['billDate'].value, 'MM/DD/YYYY').format('YYYY-MM-DD');
    if(billCurrency&&companyCurrency&&billDate)
    this.billsService.getConvertedCurrencyValue(billCurrency,companyCurrency,billDate)
      .subscribe(res  => {
        this.convertedAmount=res.result;
        this.companyCurrencyAmount=(this.billForm.controls['amount'].value)*this.convertedAmount;

      }, error =>  this.handleError(error));
  }
}
