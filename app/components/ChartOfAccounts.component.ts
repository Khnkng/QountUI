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
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {NumeralService} from "qCommon/app/services/Numeral.service";

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
  currentCompany:any;
  allCompanies:Array<any>;
  mappings:Array<any>;
  row:any;
  coaColumns:Array<string> = ['name', 'id', 'parentID', 'subAccount', 'type', 'subType', 'desc', 'number', 'balance'];
  combo:boolean = true;
  sortingOrder:Array<string> = ["accountsReceivable", "bank", "otherCurrentAssets", "fixedAssets", "otherAssets", "accountsPayable", "creditCard", "otherCurrentLiabilities", "longTermLiabilities", "equity", "income", "otherIncome", "costOfGoodsSold", "expenses", "otherExpense", "costOfServices", "loansTo"];
  hasParentOrChild: boolean = false;
  showFlyout:boolean = false;
  coaId:any;
  confirmSubscription:any;
  companyCurrency:string;
  localeFortmat:string='en-US';

  constructor(private _fb: FormBuilder, private _coaForm: COAForm, private switchBoard: SwitchBoard,
              private coaService: ChartOfAccountsService, private loadingService:LoadingService,
              private toastService: ToastService, private companiesService: CompaniesService,private numeralService:NumeralService){
    this.coaForm = this._fb.group(_coaForm.getForm());
    let companyId = Session.getCurrentCompany();
    this.companyCurrency = Session.getCurrentCompanyCurrency();
    this.loadingService.triggerLoadingEvent(true);
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteCOA(toast));
    this.companiesService.companies().subscribe(companies => {
      this.allCompanies = companies;

      if(companyId){
        this.currentCompany = _.find(this.allCompanies, {id: companyId});
      } else if(this.allCompanies.length> 0){
        this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
      }
      this.fetchChartOfAccountData();
    }, error => this.handleError(error));
  }

  fetchChartOfAccountData(){
    this.coaService.chartOfAccounts(this.currentCompany.id)
        .subscribe(chartOfAccounts => {
          this.buildTableData(chartOfAccounts);
        }, error=> this.handleError(error));
  }

  ngOnDestroy(){
    this.confirmSubscription.unsubscribe();
  }
  handleError(error){
    this.row = {};
    this.loadingService.triggerLoadingEvent(false);
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  getCategoryName(value){
    let category = _.find(this.categoryTypes, function(categoryType){
      return categoryType.value == value;
    });



    if(category) {
      return category.name;
    }
  }

  getSubTypeName(categoryValue, value){
    let subType = _.find(this.allSubTypes[categoryValue], function(subType){
      return subType.value == value;
    });


    if(subType) {
      return subType.name;
    }
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
    this.coaForm.controls['subType'].patchValue('');
    this.setParents(categoryType);
  }

  setParents(categoryType, coaId?){
    if(categoryType){
      this.parentAccounts = _.filter(this.chartOfAccounts, {type: categoryType});
      if(coaId){
        _.remove(this.parentAccounts, {id: coaId});
      }
      _.sortBy(this.parentAccounts, ['number', 'name']);
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
    this.showFlyout = true;
  }

  changeStatus(){
    let coaData = this._coaForm.getData(this.coaForm);
    if(coaData.subAccount){
      this.subAccount = true;
    } else{
      this.subAccount = false;
    }
  }

  showEditCOA(row: any){
    row = _.find(this.chartOfAccounts, {'id': row.id});
    this.row = row;
    let base = this;
    this.editMode = true;
    this.showFlyout = true;
    this.coaForm = this._fb.group(this._coaForm.getForm());
    this.subAccount = this.row.subAccount = Boolean(row.subAccount);
    this.displaySubtypes = this.allSubTypes[row.type];
    this.description = this.descriptions[row.subType];
    this.setParents(row.type, row.id);
    let parentIndex = _.findIndex(this.parentAccounts, {id: row.parentID});
    if(parentIndex != -1){
      setTimeout(function () {
        base.parentAccountComboBox.setValue(base.parentAccounts[parentIndex], 'name');
      },100);
    }
    this.updateCOAStatus();
    this._coaForm.updateForm(this.coaForm, row);
  }

  updateCOAStatus(){
    let base = this;
    this.hasParentOrChild = false;
    if(this.row.parentID != "" && this.row.subAccount){
      this.hasParentOrChild = true; //Child of another COA
    } else{
      let children = _.filter(this.chartOfAccounts, {'parentID': this.row.id});
      if(children.length > 0){
        this.hasParentOrChild = true;
      }
    }
  }

  hasRelation(coa){
    let hasParentOrChild = false;
    if(coa.parentID != "" && coa.subAccount){
      hasParentOrChild = true; //Child of another COA
    } else{
      let children = _.filter(this.chartOfAccounts, {'parentID': coa.id});
      if(children.length > 0){
        hasParentOrChild = true;
      }
    }
    return hasParentOrChild;
  }

  deleteCOA(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.coaService.removeCOA(this.coaId, this.currentCompany.id)
        .subscribe(coa => {
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.success, "Chart of Account deleted successfully");
          this.fetchChartOfAccountData();
        }, error => {
          this.loadingService.triggerLoadingEvent(false);
          if(error.message){
            this.toastService.pop(TOAST_TYPE.error, error.message);
          } else{
            this.toastService.pop(TOAST_TYPE.error, "Failed to delete Chart of account");
          }
        });
  }
  removeCOA(row: any){
    this.coaId = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
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

  updateParent(parentCoa){
    let coaData = this._coaForm.getData(this.coaForm);
    coaData.parentID = parentCoa.id;
    this._coaForm.updateForm(this.coaForm, coaData);
  }

  saveCOA($event){
    this.loadingService.triggerLoadingEvent(true);
    let base = this;
    $event && $event.preventDefault();
    let data = this._coaForm.getData(this.coaForm);
    if(!data.subAccount){
      data.parentID = null;
    }
    if(this.editMode){
      data.id = this.row.id;
      this.coaService.updateCOA(data.id, data, this.currentCompany.id)
          .subscribe(coa => {
            base.showFlyout = false;
            //  base.loadingService.triggerLoadingEvent(false);
            base.row = {};
            base.toastService.pop(TOAST_TYPE.success, "Chart of Account updated successfully");
            this.fetchChartOfAccountData();
          }, error => this.handleCOAError(error));
    } else{
      this.coaService.addChartOfAccount(data, this.currentCompany.id)
          .subscribe(newCOA => {
            base.showFlyout = false;
            //this.loadingService.triggerLoadingEvent(false);
            this.handleCOA(newCOA);
          }, error => this.handleCOAError(error));
    }
    this.buildTableData(this.chartOfAccounts);
  }

  handleCOAError(error){
    this.loadingService.triggerLoadingEvent(false);
    if(error && error.message){
      this.toastService.pop(TOAST_TYPE.error, error.message);
    } else{
      this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
    }
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
      {"name": "number", "title": "Number"},
      {"name": "name", "title": "Name"},
      {"name": "categoryType", "title": "Type"},
      {"name": "subTypeCode", "title": "Sub Type"},
      {"name": "parentName", "title": "Parent"},
      {"name": "balance", "title": "Balance", "type":"number", "formatter": (balance)=>{
        balance = parseFloat(balance);
        return balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }, "sortValue": function(value){
        return base.numeralService.value(value);
      },"classes": "currency-align currency-padding"
      },
      {"name": "type", "title": "Type", "visible": false},
      {"name": "subType", "title": "Sub type", "visible": false},
      {"name": "desc", "title": "Description", "visible": false},
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
          row[key] = coa[key];
          row['categoryType'] = base.getCategoryName(coa[key]);
        } else if(key == 'subType'){
          row[key] = coa[key];
          row['subTypeCode'] = base.getSubTypeName(coa.type, coa[key]);
        } else if(key == 'parentID'){
          row[key] = coa[key];
          row['parentName'] = coa[key]? _.find(base.chartOfAccounts, {id: coa[key]}).name : "";
        } else if(key == 'name'){
          row[key] = coa[key];
          if(coa['parentID']){
            row[key] = {options:{
              classes: "coa-child-"+coa.level,
              sortValue: base.getName(coa['parentID'])
            }, value: coa[key]}
          } else{
            row[key] = coa[key];
          }
        } else if(key == 'number'){
          if(coa['parentID']){
            row[key] = {options:{
              classes: "coa-child-"+coa.level,
              sortValue: base.getNumber(coa['parentID'])
            }, value: coa[key]
            }
          } else{
            row[key] = coa[key];
          }
        }else if(key == 'balance'){
          row[key] = {
            'options': {
              "classes": "text-right"
            },
            value : coa[key]
          }
        }else{
          row[key] = coa[key];
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
        if(!base.hasRelation(coa)){
          row['actions'] += "<a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
        }
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasCOAList = true;
    }, 0)
    this.loadingService.triggerLoadingEvent(false);
  }

  getNumber(coaId){
    let coa = _.find(this.chartOfAccounts, {id: coaId});
    return coa.number;
  }

  getName(coaId){
    let coa = _.find(this.chartOfAccounts, {id: coaId});
    return coa.name;
  }

  getChildren(coaList, parentID){
    let data = [];
    _.each(coaList, function(child){
      if(child.parentID == parentID){
        data.push(child);
      }
    });
    return data;
  }

  addChildren(coaList, coa){
    let base = this;
    let children = this.getChildren(coaList, coa.id);
    if(children.length == 0 && coa.subAccount){
      return;
    } else{
      _.each(children, function(child){
        child.level = coa.level+1;
        base.chartOfAccounts.push(child);
        base.addChildren(coaList, child);
      });
    }
  }

  sortChartOfAccounts(coaList){
    let base = this;
    this.chartOfAccounts = [];
    coaList = _.sortBy(coaList, function(coa){
      return base.sortingOrder.indexOf(coa.type);
    });
    let parents = _.filter(coaList, function(coa){
      return !coa.parentID || coa.subAccount == false;
    });
    _.each(parents, function(parent){
      parent.level = 0;
      base.chartOfAccounts.push(parent);
      base.addChildren(coaList, parent);
    });
  }
}