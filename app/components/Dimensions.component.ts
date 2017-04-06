/**
 * Created by Chandu on 28-09-2016.
 */

import {Component} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {DimensionForm} from "../forms/Dimension.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";

declare let jQuery:any;
declare let _:any;

@Component({
  selector: 'dimensions',
  templateUrl: '/app/views/dimensions.html',
})

export class DimensionsComponent{
  dimensionForm: FormGroup;
  dimensions = [];
  newFormActive:boolean = true;
  hasDimensions: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  currentCompany:any;
  showFlyout:boolean = false;
  allCompanies:Array<any>;
  row:any;
  confirmSubscription:any;
  values:Array<any> = [];
  dimensionName:any;
  tableColumns:Array<string> = ['name', 'id', 'values', 'desc'];

  constructor(private _fb: FormBuilder, private _dimensionForm: DimensionForm, private dimensionService: DimensionService,
               private loadingService:LoadingService,private switchBoard: SwitchBoard,
        private toastService: ToastService, private companiesService: CompaniesService){
    this.dimensionForm = this._fb.group(_dimensionForm.getForm());
    let companyId = Session.getCurrentCompany();
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteDimensions(toast));
    this.loadingService.triggerLoadingEvent(true);

    this.companiesService.companies().subscribe(companies => {
      this.allCompanies = companies;
      if(companyId){
        this.currentCompany = _.find(this.allCompanies, {id: companyId});
      } else if(this.allCompanies.length> 0){
        this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
      }
      this.dimensionService.dimensions(this.currentCompany.id)
          .subscribe(dimensions => {
            this.buildTableData(dimensions);
          }, error => this.handleError(error));
    }, error => this.handleError(error));
  }
  ngOnDestroy(){
    this.confirmSubscription.unsubscribe();
  }
  handleError(error){
    this.row = {};
    this.loadingService.triggerLoadingEvent(false);
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  showAddDimension() {
    this.editMode = false;
    this.dimensionForm = this._fb.group(this._dimensionForm.getForm());
    this.showFlyout = true;
    this.newForm();
    this.values = [];
    this.showFlyout = true;
  }

  showEditDimension(row: any){
    let base = this;
    this.showFlyout = true;
    this.editMode = true;
    let tempValues = row.values.split(',');
    this.newForm();
    this.row = row;
    this.values = [];
    _.each(tempValues, function(value){
      base.values.push({
        value: value,
        newValue: value,
        action: "",
        editing: false
      });
    });
    this._dimensionForm.updateForm(this.dimensionForm, row);
  }

  editValue(valueObj){
    valueObj.editing = !valueObj.editing;
  }

  updateValue(valueObj){
    valueObj.editing = !valueObj.editing;
    valueObj.action = 'update';
  }

  deleteValue(valueObj){
    valueObj.action = 'delete';
  }

  deleteFromEditing(valueObj){
    valueObj.editing = !valueObj.editing;
    valueObj.newValue = valueObj.value;
  }

  onValueChange(valueObj, $event){
    valueObj.newValue = $event.target.value;
  }
  deleteDimensions(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.dimensionService.removeDimension(this.dimensionName, this.currentCompany.id)
        .subscribe(coa => {
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.success, "Dimension deleted successfully");
          this.dimensions.splice(_.findIndex(this.dimensions, {name: this.dimensionName}), 1);
          this.buildTableData(this.dimensions);
        }, error => this.handleError(error));
  }
  removeDimension(row: any){
     this.dimensionName = row.name;
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
      this.showEditDimension($event);
    } else if(action == 'delete'){
      this.removeDimension($event);
    }
  }
  hideFlyout(){
    this.row = {};
    this.showFlyout = !this.showFlyout;
  }


  submit($event){
    let base = this;
    $event && $event.preventDefault();
    this.loadingService.triggerLoadingEvent(true);
    let data = this._dimensionForm.getData(this.dimensionForm);
    let values = jQuery('#dimensionValues').tagit("assignedTags");
    if(this.editMode){
      _.each(values, function(value){
        base.values.push({
          value: value,
          action: 'new',
          newValue: value
        });
      });
      data.values = this.values;
    } else{
      if(values.length == 0){
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(TOAST_TYPE.error, "Dimension should have atleast one value");
        return false;
      } else{
        data.values = values;
      }
    }
    if(this.editMode){
      data.id = this.row.id;
      this.dimensionService.updateDimension(this.cleanData(data), this.currentCompany.id)
          .subscribe(dimension => {
            base.row = {};
            this.showFlyout = false;
            base.loadingService.triggerLoadingEvent(false);
            base.toastService.pop(TOAST_TYPE.success, "Dimension updated successfully");
            let index = _.findIndex(base.dimensions, {name: dimension.name});
            base.dimensions[index] = dimension;
            base.buildTableData(base.dimensions);
          }, error => this.handleError(error));
    } else{
      this.dimensionService.addDimensions(data, this.currentCompany.id)
          .subscribe(newDimension => {
            this.loadingService.triggerLoadingEvent(false);
            this.showFlyout = false;
            this.handleDimension(newDimension);
          }, error => this.handleError(error));
    }
    this.buildTableData(this.dimensions);
  }

  cleanData(data){
    _.each(data.values, function(value){
      delete value.editing;
    });
    return data;
  }

  handleDimension(newDimension){
    this.toastService.pop(TOAST_TYPE.success, "Dimension created successfully");
    this.dimensions.push(newDimension);
    this.buildTableData(this.dimensions);
  }

  buildTableData(dimensions) {
    this.hasDimensions = false;
    this.dimensions = dimensions;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "values", "title": "Values"},
      {"name": "desc", "title": "Description"},
      {"name": "id", "title": "Id", "visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    dimensions.forEach(function(dimension) {
      let row:any = {};
      _.each(base.tableColumns, function(key) {
        row[key] = dimension[key];
        if(key == 'id'){
          row[key] = dimension['name'];
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasDimensions = true;
    }, 0)
    this.loadingService.triggerLoadingEvent(false);
  }
}
