
import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder,FormArray} from "@angular/forms";
import {FTable} from "qCommon/app/directives/footable.directive";
import {Router} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {DiscountsForm,DiscountRangeForm} from "../forms/Discounts.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {DAYS_OF_MONTH} from "qCommon/app/constants/Date.constants";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {InvoicesService} from "invoicesUI/app//services/Invoices.service";
import {DiscountService} from "qCommon/app/services/Discounts.service";
declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'discounts',
  templateUrl: '../views/discounts.html'
})

export class DiscountsComponent {
  tableData:any = {};
  tableOptions:any = {};
  status:any;
  discountId:any;
  discounts:Array<any>;
  editMode:boolean = false;
  row:any;
  discountForm: FormGroup;
  hasDiscountsList:boolean = false;
  message:string;
  companyId:string;
  showFlyout:boolean = false;
  confirmSubscription:any;
  routeSubscribe:any;
  ContactLineArray:FormArray = new FormArray([]);
  showDownloadIcon:string = "hidden";
  days:Array<string>=DAYS_OF_MONTH;

  constructor(private _fb: FormBuilder, private discountsService: DiscountService,
              private _discountsForm:DiscountsForm,private _discountRangeForm:DiscountRangeForm, private _router: Router, private _toastService: ToastService,
              private switchBoard: SwitchBoard, private loadingService:LoadingService,private titleService:pageTitleService) {
    this.titleService.setPageTitle("Discounts");

    let _form:any = this._discountsForm.getForm();
    _form['discountsRanges'] = this.ContactLineArray;
    this.discountForm = this._fb.group(_form);
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteDiscount(toast));
    this.companyId = Session.getCurrentCompany();
    this.discountsService.discounts(this.companyId).subscribe(discounts => {
      this.buildTableData(discounts);
    }, error => this.handleError(error));
    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      if(this.showFlyout){
        this.hideFlyout();
      }else {
        this.toolsRedirect();
      }
    });
  }

  toolsRedirect(){
    let link = ['tools'];
    this._router.navigate(link);
  }
  ngOnDestroy(){
    this.confirmSubscription.unsubscribe();
    this.routeSubscribe.unsubscribe();
  }

  buildTableData(discounts) {
    this.discounts = discounts;
    this.hasDiscountsList = false;
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.rows = [];
    this.tableData.columns = [
      {"name": "id", "title": "ID","visible": false},
      {"name": "name", "title": "Name"},
      {"name": "description", "title": "Description"},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    let base = this;
    this.discounts.forEach(function(discounts) {
      let row:any = {};
      for(let key in base.discounts[0]) {
        row[key] = discounts[key];
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      }
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasDiscountsList = true;
    });
    setTimeout(function() {
      if(base.hasDiscountsList){
        base.showDownloadIcon = "visible";
      }
    },650);
    this.loadingService.triggerLoadingEvent(false);
  }

  showCreateDiscount() {
    this.titleService.setPageTitle("CREATE DISCOUNT");
    let self = this;
    this.editMode = false;
    this.addContactList();
    this.newForm1();
    this.showFlyout = true;
  }



  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditDiscount($event);
    } else if(action == 'delete'){
      this.removeDiscount($event);
    }
  }

  deleteDiscount(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.discountsService.removeDiscount(this.discountId, this.companyId)
      .subscribe(success  => {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.success, "Discount deleted successfully");
        this.discountsService.discounts(this.companyId)
          .subscribe(discounts  => this.buildTableData(discounts), error =>  this.handleError(error));
      }, error =>  this.handleError(error));
  }
  removeDiscount(row:any) {
    let discount:any = row;
    this.discountId=discount.id;
    this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
  }

  active1:boolean=true;
  newForm1(){
    this.active1 = false;
    setTimeout(()=> this.active1=true, 0);
  }

  showEditDiscount(row:any) {
    this.titleService.setPageTitle("UPDATE DISCOUNT");
    this.editMode = true;
    this.showFlyout = true;
    this.row = row;
    this.loadingService.triggerLoadingEvent(true);
    this.discountsService.getDiscount(row.id, this.companyId)
      .subscribe(discount => {
        this.row = discount;
        this.loadingService.triggerLoadingEvent(false);
        let base=this;
        let contactLineControl:any = this.discountForm.controls['discountsRanges'];
        discount.discountsRanges.forEach(function(contactLine:any){
          contactLineControl.controls.push(base._fb.group(base._discountRangeForm.getForm(contactLine)));
        });
        this._discountsForm.updateForm(this.discountForm, this.row);
      }, error => this.handleError(error));
  }

  submit($event) {
    $event && $event.preventDefault();
    var data = this._discountsForm.getData(this.discountForm);
    this.loadingService.triggerLoadingEvent(true);
    var data = this._discountsForm.getData(this.discountForm);
    data.discountsRanges=this.getContactData(this.discountForm.controls['discountsRanges']);
    if(this.editMode) {
      this.discountsService.updateDiscount(data, this.companyId)
        .subscribe(success  => {
          this.showMessage(true, success);
        }, error =>  this.showMessage(false, error));
      this.showFlyout = false;
    } else {
      this.discountsService.addDiscount(data, this.companyId)
        .subscribe(success  => {
          this.showMessage(true, success);
        }, error =>  this.showMessage(false, error));
      this.showFlyout = false;
    }
  }

  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.hasDiscountsList=false;
      if(this.editMode) {
        this.resetForm();
        this.discountsService.discounts(this.companyId)
          .subscribe(discounts  => this.buildTableData(discounts), error =>  this.handleError(error));
        this.newForm1();
        this._toastService.pop(TOAST_TYPE.success, "Discount updated successfully.");
      } else {
        this.newForm1();
        this.resetForm();
        this.discountsService.discounts(this.companyId)
          .subscribe(discounts  => this.buildTableData(discounts), error =>  this.handleError(error));
        this._toastService.pop(TOAST_TYPE.success, "Discount created successfully.");
      }
    } else {
      this.loadingService.triggerLoadingEvent(false);
      this.resetForm();
      this.status = {};
      this.status['error'] = true;
      this._toastService.pop(TOAST_TYPE.error, "Failed to update the discount");
      this.message = obj;
    }
  }


  handleError(error) {
    this.loadingService.triggerLoadingEvent(false);
    this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
  }
  hideFlyout(){
    this.titleService.setPageTitle("Discounts");
    this.row = {};
    this.showFlyout = !this.showFlyout;
    this.resetForm();
  }

  addContactList(line?:any) {
    let discount:any={};
    let _form:any = this._discountRangeForm.getForm(line);
    let contactListForm = this._fb.group(_form);
    //this.ContactLineArray.push(contactListForm);
    if(!line){
      let contactControl:any = this.discountForm.controls['discountsRanges'];
      contactControl.controls.push(contactListForm);
      this._discountsForm.updateForm(this.discountForm, discount);

    }
  }

  resetForm(){
    let _form = this._discountsForm.getForm();
    _form['discountsRanges'] = new FormArray([]);
    this.discountForm = this._fb.group(_form);
  }

  getContactData(discountForm){
    let base = this;
    let data = [];
    _.each(discountForm.controls, function(contactControl){
      let itemData = base._discountRangeForm.getData(contactControl);
        data.push(itemData);
    });
    return data;
  }

  deleteRange(index){
    let discount:any={};
    let contactControl:any = this.discountForm.controls['discountsRanges'];
    contactControl.controls.splice(index,1);
    this._discountsForm.updateForm(this.discountForm, discount);
  }

  }
