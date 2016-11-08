/**
 * Created by Chandu on 28-09-2016.
 */

import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {COA_CATEGORY_TYPES, COA_SUBTYPES, SUBTYPE_DESCRIPTIONS} from "qCommon/app/constants/Qount.constants";
import {COAForm} from "../forms/COA.form";
import {CompanyModel} from "../models/Company.model";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'chart-of-accounts',
  templateUrl: '/app/views/chartOfAccounts.html',
})

export class ChartOfAccountsComponent{
  coaForm: FormGroup;
  chartOfAccounts:any = [];
  newFormActive:boolean = true;
  categoryTypes = COA_CATEGORY_TYPES;
  allSubTypes = COA_SUBTYPES;
  descriptions = SUBTYPE_DESCRIPTIONS;
  displaySubtypes: any = [];
  description:string = '';
  parentAccounts = [];
  @ViewChild('addCOA') addCOA;
  @ViewChild('parentAccountComboBoxDir') parentAccountComboBox: ComboBox;
  subAccount:boolean = false;
  hasCOAList: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  companySwitchSubscription: any;
  currentCompany:any;
  allCompanies:Array<any>;
  mappings:Array<any>;
  row:any;

  constructor(private _fb: FormBuilder, private _coaForm: COAForm, private switchBoard: SwitchBoard, private coaService: ChartOfAccountsService, private toastService: ToastService){
    this.coaForm = this._fb.group(_coaForm.getForm());
    this.companySwitchSubscription = this.switchBoard.onCompanyChange.subscribe(currentCompany => this.refreshCompany(currentCompany));
    let companyId = Session.getCurrentCompany();
    this.allCompanies = Session.getCompanies();

    this.coaService.mappings().subscribe(mappings => {
      this.mappings = mappings;
    }, error => this.handleError(error));
    if(companyId){
      this.currentCompany = _.find(this.allCompanies, {id: companyId});
    } else if(this.allCompanies.length> 0){
      this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
    }
    this.coaService.chartOfAccounts(this.currentCompany.id)
        .subscribe(chartOfAccounts => this.buildTableData(chartOfAccounts), error=> this.handleError(error));
  }

  handleError(error){
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  refreshCompany(currentCompany){
    let companies = Session.getCompanies();
    this.currentCompany = _.find(companies, {id: currentCompany.id});
    this.coaService.chartOfAccounts(this.currentCompany.id)
        .subscribe(chartOfAccounts => this.buildTableData(chartOfAccounts), error=> this.handleError(error));
  }

  getCategoryName(value){
    let category = _.find(this.categoryTypes, function(categoryType){
      return categoryType.value == value;
    });
    return category.name;
  }

  getSubTypeName(categoryValue, value){
    let subType = _.find(this.allSubTypes[categoryValue], function(subType){
      return subType.value == value;
    });
    return subType.name;
  }

  populateSubtypes($event){
    let categoryType = $event.target.value;
    this.displaySubtypes = this.allSubTypes[categoryType];
    this.description = "";
  }

  selectSubtype($event){
    this.description = this.descriptions[$event.target.value];
  }

  showAddCOA() {
    this.editMode = false;
    this.coaForm = this._fb.group(this._coaForm.getForm());
    this.parentAccounts = _.cloneDeep(this.chartOfAccounts);
    this.displaySubtypes = [];
    this.description = "";
    this.subAccount = false;
    this.newForm();
    jQuery(this.addCOA.nativeElement).foundation('open');
  }

  changeStatus(){
    this.subAccount = !this.subAccount;
  }

  showEditCOA(row: any){
    let base = this;
    this.editMode = true;
    this.newForm();
    this.row = row;
    row.type = row.categoryType;
    row.subType = row.subTypeCode;
    this.subAccount = row.subAccount;
    row.subAccount = row.subAccount == "true";
    this.displaySubtypes = this.allSubTypes[row.type];
    let parentID = row.parentID;
    let parentIndex = _.findIndex(this.chartOfAccounts, {id: parentID});
    let currentCOAIndex = _.findIndex(this.chartOfAccounts, {id: row.id});
    this.parentAccounts = _.cloneDeep(this.chartOfAccounts);
    _.remove(this.parentAccounts, {id: row.id});
    if(parentIndex !== -1){
      setTimeout(function () {
        base.parentAccountComboBox.setValue(base.chartOfAccounts[parentIndex], 'name');
      },100);
    }
    this._coaForm.updateForm(this.coaForm, row);
    jQuery(this.addCOA.nativeElement).foundation('open');
  }

  removeCOA(row: any){
    let coaId = row.id;
    this.coaService.removeCOA(coaId, this.currentCompany.id)
        .subscribe(coa => {
          this.toastService.pop(TOAST_TYPE.success, "Deleted Chart of Account successfully");
          this.chartOfAccounts.splice(_.findIndex(this.chartOfAccounts, {id: coaId}, 1));
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
      this.showEditCOA($event);
    } else if(action == 'delete'){
      this.removeCOA($event);
    }
  }

  updateParent(parent){
    let parentControl:any = this.coaForm.controls['parentID'];
    parentControl.patchValue(parent.id);
  }

  saveCOA($event){
    $event && $event.preventDefault();
    var data = this._coaForm.getData(this.coaForm);
    if(this.editMode){
      data.id = this.row.id;
      this.coaService.updateCOA(data.id, data, this.currentCompany.id)
          .subscribe(coa => {
            console.log(coa);
          }, error => this.handleError(error));
    } else{
      this.coaService.addChartOfAccount(data, this.currentCompany.id)
          .subscribe(newCOA => this.handleCOA(newCOA), error => this.handleError(error));
    }
    this.buildTableData(this.chartOfAccounts);
    jQuery(this.addCOA.nativeElement).foundation('close');
  }

  handleCOA(newCOA){
    this.toastService.pop(TOAST_TYPE.success, "Chart of account created successfully");
    this.chartOfAccounts.push(newCOA);
    this.buildTableData(this.chartOfAccounts);
  }

  getMappingName(mappingValue){
    let allMappings = [];
    _.each(this.mappings, function(mapping){
      return allMappings.push(mapping);
    });
    let mapping = _.find(_.flatten(allMappings), {value: mappingValue});
    return mapping.name;
  }

  buildTableData(coaList) {
    this.chartOfAccounts = coaList;
    this.hasCOAList = false;
    this.tableData.rows = [];
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "type", "title": "Type"},
      {"name": "mappingName", "title": "Mapping"},
      {"name": "parentName", "title": "Parent"},
      {"name": "subType", "title": "Sub type", "visible": false},
      {"name": "desc", "title": "Description", "visible": false},
      {"name": "mapping", "title": "Mapping", "visible": false},
      {"name": "categoryType", "title": "Type", "visible": false},
      {"name": "subTypeCode", "title": "Sub Type Code", "visible": false},
      {"name": "id", "title": "COA ID","visible": false},
      {"name": "parentID", "title": "Parent", "visible": false},
      {"name": "subAccount", "title": "Sub account","visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    this.chartOfAccounts.forEach(function(coa) {
      let row:any = {};
      coa.subAccount = coa.subAccount? coa.subAccount : false;
      for(let key in base.chartOfAccounts[0]) {
        if(key == 'type'){
          row[key] = base.getCategoryName(coa[key]);
          row['categoryType'] = coa[key];
        } else if(key == 'subType'){
          row[key] = base.getSubTypeName(coa.type, coa[key]);
          row['subTypeCode'] = coa[key];
        } else if(key == 'mapping'){
          row[key] = coa[key];
          row['mappingName'] = base.getMappingName(coa[key]);
        } else if(key == 'parentID'){
          row[key] = coa[key];
          row['parentName'] = coa[key]? _.find(base.chartOfAccounts, {id: coa[key]}).name : "";
        }else{
          row[key] = coa[key];
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      }
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasCOAList = true;
    }, 0)
  }
}
