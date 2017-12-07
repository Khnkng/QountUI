/**
 * Created by Mateen on 30-11-2017.
 */

import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LateFeesService} from "qCommon/app/services/LateFeesService.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {LateFeeForm} from "../forms/LateFee.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {Router} from "@angular/router";
import {CURRENCY_LOCALE_MAPPER} from "qCommon/app/constants/Currency.constants";

declare let jQuery:any;
declare let _:any;

@Component({
  selector: 'latefees',
  templateUrl: '../views/lateFees.html',
})

export class LateFeesComponent{
  lateFeeForm: FormGroup;
  lateFees = [];
  newFormActive:boolean = true;
  haslateFees: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  companyId:string;
  lateFeeId:any;
  row:any;
  tableColumns:Array<string> = ['name', 'id', 'type', 'value'];
  showFlyout:boolean = false;
  confirmSubscription:any;
  routeSubscribe:any;
  localeFortmat:string='en-US';

  constructor(private _fb: FormBuilder, private _lateFeeForm: LateFeeForm, private switchBoard: SwitchBoard,private _router: Router,
              private lateFeesService: LateFeesService, private toastService: ToastService, private loadingService:LoadingService,
              private titleService:pageTitleService){
    this.lateFeeForm = this._fb.group(this._lateFeeForm.getForm());
    this.titleService.setPageTitle("Late Fees");
    this.localeFortmat=CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]?CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]:'en-US';
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteLateFee(toast));
    this.companyId = Session.getCurrentCompany();
    this.loadingService.triggerLoadingEvent(true);
    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      if(this.showFlyout){
        this.hideFlyout();
      }else {
        this.toolsRedirect();
      }
    });
    this.lateFeesService.lateFees(this.companyId)
      .subscribe(lateFees => this.buildTableData(lateFees), error=> this.handleError(error));
  }

  toolsRedirect(){
    let link = ['tools'];
    this._router.navigate(link);
  }
  ngOnDestroy(){
    this.routeSubscribe.unsubscribe();
    this.confirmSubscription.unsubscribe();
  }

  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  isValid(lateFeeForm){
    let data = this._lateFeeForm.getData(lateFeeForm);
    if(data.name || data.type || data.value){
      return lateFeeForm.valid;
    }
    return false;
  }

  showAddLateFee() {
    this.titleService.setPageTitle("CREATE LATE FEE");
    this.editMode = false;
    this.newForm();
    this.showFlyout = true;
  }

  showEditLateFee(row: any){
    this.titleService.setPageTitle("UPDATE LATE FEE");
    this.loadingService.triggerLoadingEvent(true);
    this.lateFeesService.getLateFee(this.companyId, row.id)
      .subscribe(lateFee => {
        this.row=lateFee;
        this._lateFeeForm.updateForm(this.lateFeeForm, lateFee);
        this.loadingService.triggerLoadingEvent(false);
      }, error => this.handleError(error));
    let base = this;
    this.editMode = true;
    this.newForm();
    this.showFlyout = true;
  }

  deleteLateFee(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.lateFeesService.removeLateFee(this.companyId, this.lateFeeId)
      .subscribe(coa => {
        // this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(TOAST_TYPE.success, "Late Fee deleted successfully");
        //this.itemCodes.splice(_.findIndex(this.itemCodes, {id: this.itemCodeId}, 1));
        this.lateFeesService.lateFees(this.companyId)
          .subscribe(lateFees => this.buildTableData(lateFees), error=> this.handleError(error));
      }, error => this.handleError(error));
  }
  removeLateFee(row: any){
    this.lateFeeId = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
  }

  newForm(){
    this.newFormActive = false;
    setTimeout(()=> this.newFormActive=true, 0);
  }

  ngOnInit(){

  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditLateFee($event);
    } else if(action == 'delete'){
      this.removeLateFee($event);
    }
  }

  submit($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._lateFeeForm.getData(this.lateFeeForm);

    this.loadingService.triggerLoadingEvent(true);
    if(this.editMode){
      data.id = this.row.id;
      this.lateFeesService.updateLateFee(this.companyId, this.row.id,data)
        .subscribe(lateFee => {
          //base.loadingService.triggerLoadingEvent(false);
          base.row = {};
          base.toastService.pop(TOAST_TYPE.success, "Late Fee updated successfully");
          let index = _.findIndex(base.lateFees, {id: data.id});
          base.lateFees[index] = lateFee;
          base.buildTableData(base.lateFees);
          this.showFlyout = false;
        }, error => this.handleError(error));
    } else{
      this.lateFeesService.addlateFee(this.companyId, data)
        .subscribe(newLateFee => {
          //this.loadingService.triggerLoadingEvent(false);
          this.handleLateFee(newLateFee);
          this.showFlyout = false;
        }, error => this.handleError(error));
    }
    //this.buildTableData(this.itemCodes);
  }

  handleLateFee(newLateFee){
    this.toastService.pop(TOAST_TYPE.success, "LateFee created successfully");
    this.lateFees.push(newLateFee);
    this.buildTableData(this.lateFees);
  }

  buildTableData(lateFees) {
    this.haslateFees = false;
    this.lateFees = lateFees;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "type", "title": "Type"},
      {"name": "value", "title": "Value"},
      {"name": "id", "title": "Id", "visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    lateFees.forEach(function(lateFee) {
      let row:any = {};
      _.each(base.tableColumns, function(key) {
        if(key=='type'){
          row[key] = base.getEventTypeName(lateFee[key]);
        }else if(key=='value'){
          if(lateFee['type']=='flat_fee'){
            let amount=lateFee['value']?Number(lateFee['value']):0;
            row[key]=amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }else {
            row[key] = lateFee[key]+'%';
          }
        }else {
          row[key] = lateFee[key];
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.haslateFees = true;
    }, 0);

    this.loadingService.triggerLoadingEvent(false);
  }


  hideFlyout(){
    this.titleService.setPageTitle("Late Fees");
    this.row = {};
    this.showFlyout = !this.showFlyout;
  }

  getEventTypeName(type){
    let eventTypes={flat_fee:'Flat Fee',percentage:'Percentage'};
    return eventTypes[type];
  }

}
