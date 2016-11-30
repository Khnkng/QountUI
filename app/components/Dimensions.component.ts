/**
 * Created by Chandu on 28-09-2016.
 */

import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {DimensionForm} from "../forms/Dimension.form";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'dimensions',
  templateUrl: '/app/views/dimensions.html',
})

export class DimensionsComponent{
  dimensionForm: FormGroup;
  dimensions = [];
  newFormActive:boolean = true;
  @ViewChild('addDimension') addDimension;
  hasDimensions: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  currentCompany:any;
  allCompanies:Array<any>;
  row:any;
  tempValues:Array<string> = [];
  tableColumns:Array<string> = ['name', 'id', 'values'];

  constructor(private _fb: FormBuilder, private _dimensionForm: DimensionForm, private switchBoard: SwitchBoard, private dimensionService: DimensionService,
        private toastService: ToastService, private companiesService: CompaniesService){
    this.dimensionForm = this._fb.group(_dimensionForm.getForm());
    let companyId = Session.getCurrentCompany();
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

  handleError(error){
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  showAddDimension() {
    this.editMode = false;
    this.dimensionForm = this._fb.group(this._dimensionForm.getForm());
    this.newForm();
    jQuery(this.addDimension.nativeElement).foundation('open');
  }

  showEditDimension(row: any){
    let base = this;
    this.editMode = true;
    this.tempValues = row.values.split(',');
    this.newForm();
    this.row = row;
    this._dimensionForm.updateForm(this.dimensionForm, row);
    jQuery(this.addDimension.nativeElement).foundation('open');
  }

  removeDimension(row: any){
    let dimensionId = row.id;
    this.dimensionService.removeDimension(dimensionId, this.currentCompany.id)
        .subscribe(coa => {
            this.toastService.pop(TOAST_TYPE.success, "Deleted Dimension successfully");
            this.dimensions.splice(_.findIndex(this.dimensions, {id: dimensionId}), 1);
            this.buildTableData(this.dimensions);
        }, error => this.handleError(error));
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

  submit($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._dimensionForm.getData(this.dimensionForm);
    delete data.tempValue;
    let values = jQuery('#dimensionValues').tagit("assignedTags");
    data.values = values;
    if(this.editMode){
      data.id = this.row.id;
      this.dimensionService.updateDimension(data, this.currentCompany.id)
          .subscribe(dimension => {
            base.row = {};
            base.toastService.pop(TOAST_TYPE.success, "Dimension updated successfully");
            let index = _.findIndex(base.dimensions, {id: data.id});
            base.dimensions[index] = dimension;
            base.buildTableData(base.dimensions);
          }, error => this.handleError(error));
    } else{
      this.dimensionService.addDimensions(data, this.currentCompany.id)
          .subscribe(newDimension => this.handleDimension(newDimension), error => this.handleError(error));
    }
    this.buildTableData(this.dimensions);
    jQuery(this.addDimension.nativeElement).foundation('close');
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
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasDimensions = true;
    }, 0)
  }
}
