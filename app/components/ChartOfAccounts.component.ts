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
  coaColumns:Array<string> = ['name', 'id', 'parentID', 'subAccount', 'type', 'subType', 'desc', 'number'];
  combo:boolean = true;
  sortingOrder:Array<string> = ["accountsReceivable", "bank", "otherCurrentAssets", "fixedAssets", "otherAssets", "accountsPayable", "creditCard", "otherCurrentLiabilities", "longTermLiabilities", "equity", "income", "otherIncome", "costOfGoodsSold", "expenses", "otherExpense", "costOfServices"];
  hasParentOrChild: boolean = false;

  constructor(private _fb: FormBuilder, private _coaForm: COAForm, private switchBoard: SwitchBoard, private coaService: ChartOfAccountsService, private toastService: ToastService){
    this.coaForm = this._fb.group(_coaForm.getForm());
    this.companySwitchSubscription = this.switchBoard.onCompanyChange.subscribe(currentCompany => this.refreshCompany(currentCompany));
    let companyId = Session.getCurrentCompany();
    this.allCompanies = Session.getCompanies();

    /*this.coaService.mappings().subscribe(mappings => {
      this.mappings = mappings;
    }, error => this.handleError(error));*/
    if(companyId){
      this.currentCompany = _.find(this.allCompanies, {id: companyId});
    } else if(this.allCompanies.length> 0){
      this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
    }
    this.coaService.chartOfAccounts(this.currentCompany.id)
        .subscribe(chartOfAccounts => this.buildTableData(chartOfAccounts), error=> this.handleError(error));
  }

  handleError(error){
    this.row = {};
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
    if(this.editMode && this.row.parentID){
      this.toastService.pop(TOAST_TYPE.error, "Type cannot be changed for a child");
      $event && $event.preventDefault();
      return false;
    }
    let categoryType = $event.target.value;
    this.displaySubtypes = this.allSubTypes[categoryType];
    this.description = "";
    this.setParents(categoryType);
  }

  setParents(categoryType, coaId?){
    if(categoryType){
      this.parentAccounts = _.filter(this.chartOfAccounts, {type: categoryType});
      if(coaId){
        _.remove(this.parentAccounts, {id: coaId});
      }
      this.refreshComboBox();
    }
  }

  selectSubtype($event){
    this.description = this.descriptions[$event.target.value];
  }

  showAddCOA() {
    this.editMode = false;
    this.coaForm = this._fb.group(this._coaForm.getForm());
    this.displaySubtypes = [];
    this.description = "";
    this.subAccount = false;
    this.hasParentOrChild = false;
    this.newForm();
    jQuery(this.addCOA.nativeElement).foundation('open');
  }

  changeStatus(){
    this.subAccount = !this.subAccount;
    let parentControl:any = this.coaForm.controls['parentID'];
  }

  showEditCOA(row: any){
    let base = this;
    this.editMode = true;
    this.newForm();
    this.row = row;
    this.setParents(row.type, row.id);
    row.type = row.categoryType;
    row.subType = row.subTypeCode;
    row.subAccount = row.subAccount == "true";
    this.subAccount = row.subAccount;
    this.displaySubtypes = this.allSubTypes[row.type];
    this.description = this.descriptions[row.subTypeCode];
    let parentIndex = _.findIndex(this.chartOfAccounts, {id: row.parentID});
    if(parentIndex != -1){
      setTimeout(function () {
        base.parentAccountComboBox.setValue(base.chartOfAccounts[parentIndex], 'name');
      },100);
    }
    this.updateCOAStatus();
    this._coaForm.updateForm(this.coaForm, row);
    jQuery(this.addCOA.nativeElement).foundation('open');
  }

  updateCOAStatus(){
    let base = this;
    this.hasParentOrChild = false;
    if(this.row.parentID != "" && this.row.subAccount){
      this.hasParentOrChild = true; //Child of another COA
    } else{
      let children = _.filter(this.chartOfAccounts, function(coa){
        return coa.parentID == base.row.id;
      });
      if(children.length > 0){
        this.hasParentOrChild = true;
      }
    }
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

  refreshComboBox(){
    let base = this;
    this.combo = false;
    setTimeout(()=> base.combo=true, 0);
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
    let parentCoa = _.find(this.chartOfAccounts, function(coa){
      return coa.name == parent;
    });
    let parentControl:any = this.coaForm.controls['parentID'];
    if(parentCoa){
      parentControl.patchValue(parentCoa.id);
    }
  }

  saveCOA($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._coaForm.getData(this.coaForm);
    if(this.editMode){
      data.id = this.row.id;
      this.coaService.updateCOA(data.id, data, this.currentCompany.id)
          .subscribe(coa => {
            base.row = {};
            base.toastService.pop(TOAST_TYPE.success, "Chart of Account updated successfully");
            let index = _.findIndex(base.chartOfAccounts, {id: data.id});
            base.chartOfAccounts[index] = coa;
            base.buildTableData(base.chartOfAccounts);
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
    if(mapping){
      return mapping.name;
    }
    return "";
  }

  buildTableData(coaList) {
    this.sortChartOfAccounts(coaList);
    this.hasCOAList = false;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "numberHTML", "title": "Number"},
      {"name": "nameHTML", "title": "Name"},
      {"name": "type", "title": "Type"},
      {"name": "subType", "title": "Sub type"},
      {"name": "parentName", "title": "Parent"},
      {"name": "number", "title": "Number", "visible": false, "filterable": false},
      {"name": "name", "title": "Name", "visible": false, "filterable": false},
      {"name": "desc", "title": "Description", "visible": false},
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
      _.each(base.coaColumns, function(key) {
        if(key == 'type'){
          row[key] = base.getCategoryName(coa[key]);
          row['categoryType'] = coa[key];
        } else if(key == 'subType'){
          row[key] = base.getSubTypeName(coa.type, coa[key]);
          row['subTypeCode'] = coa[key];
        } else if(key == 'parentID'){
          row[key] = coa[key];
          row['parentName'] = coa[key]? _.find(base.chartOfAccounts, {id: coa[key]}).name : "";
        } else if(key == 'name'){
          row[key] = coa[key];
          if(coa['parentID']){
            row['nameHTML'] = '<span style="margin-left: 10px;">'+coa[key]+'</span>';
          } else{
            row['nameHTML'] = coa[key];
          }
        } else if(key == 'number'){
          row[key] = coa[key];
          if(coa['parentID']){
            row['numberHTML'] = '<span style="margin-left: 10px;">'+coa[key]+'</span>';
          } else{
            row['numberHTML'] = coa[key];
          }
        } else{
          row[key] = coa[key];
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasCOAList = true;
    }, 0)
  }

  sortChartOfAccounts(coaList){
    let base = this;
    this.chartOfAccounts = [];
    coaList = _.sortBy(coaList, function(coa){
      return base.sortingOrder.indexOf(coa.type);
    });
    let parents = _.filter(coaList, function(coa){
      return coa.parentID == '' && coa.subAccount == false;
    });
    _.each(parents, function(parent){
      base.chartOfAccounts.push(parent);
      _.each(coaList, function(child){
        if(child.parentID == parent.id){
          base.chartOfAccounts.push(child);
        }
      });
    });
  }
}
