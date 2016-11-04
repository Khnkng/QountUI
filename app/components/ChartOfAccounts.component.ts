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
  isSubAccount:boolean = false;
  hasCOAList: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  companySwitchSubscription: any;
  currentCompany:any;
  allCompanies:Array<any>;

  constructor(private _fb: FormBuilder, private _coaForm: COAForm, private switchBoard: SwitchBoard){
    this.coaForm = this._fb.group(_coaForm.getForm());
    this.companySwitchSubscription = this.switchBoard.onCompanyChange.subscribe(currentCompany => this.refreshCompany(currentCompany));
    let companyId = Session.getCurrentCompany();
    this.allCompanies = Session.getCompanies();
    if(companyId){
      this.currentCompany = _.find(this.allCompanies, {id: companyId});
    } else if(this.allCompanies.length> 0){
      this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].companyId});
    }
    this.buildTableData();
  }

  refreshCompany(currentCompany){
    let companies = Session.getCompanies();
    this.currentCompany = _.find(companies, {id: currentCompany.companyId});
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
    this.isSubAccount = false;
    this.newForm();
    jQuery(this.addCOA.nativeElement).foundation('open');
  }

  showEditCOA(row: any){
    this.editMode = true;
    jQuery(this.addCOA.nativeElement).foundation('open');
    row.categoryType = row.type;
    row.subType = row.subTypeCode;
    this._coaForm.updateForm(this.coaForm, row);
  }

  removeCOA(row: any){

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

  saveCOA($event){
    $event && $event.preventDefault();
    var data = this._coaForm.getData(this.coaForm);
    if(this.editMode){
      this.chartOfAccounts[data.coaID] = data;
    } else{
      data.coaID = this.chartOfAccounts.length;
      this.chartOfAccounts.push(data);
    }
    this.buildTableData();
    jQuery(this.addCOA.nativeElement).foundation('close');
  }

  buildTableData() {
    //this.chartOfAccounts = coaList;
    this.hasCOAList = false;
    this.tableData.rows = [];
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "categoryType", "title": "Type"},
      {"name": "type", "title": "Type", "visible": false},
      {"name": "subType", "title": "Sub type"},
      {"name": "subTypeCode", "title": "Sub Type Code", "visible": false},
      {"name": "description", "title": "Description"},
      {"name": "coaID", "title": "COA ID","visible": false},
      {"name": "parentAccount", "title": "Parent Account", "visible": false},
      {"name": "isSubAccount", "title": "Sub account","visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    this.chartOfAccounts.forEach(function(coa) {
      let row:any = {};
      for(let key in base.chartOfAccounts[0]) {
        if(key == 'categoryType'){
          row[key] = base.getCategoryName(coa[key]);
          row['type'] = coa[key];
        } else if(key == 'subType'){
          row[key] = base.getSubTypeName(coa.categoryType, coa[key]);
          row['subTypeCode'] = coa[key];
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
