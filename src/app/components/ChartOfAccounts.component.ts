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
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {Router} from "@angular/router";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare let jQuery:any;
declare let _:any;

@Component({
  selector: 'chart-of-accounts',
  templateUrl: '../views/chartOfAccounts.html',
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
  coaColumns:Array<string> = ['name', 'id', 'parentID', 'subAccount', 'type', 'subType', 'desc', 'number', 'balance', 'credit', 'debit'];
  combo:boolean = true;
  sortingOrder:Array<string> = ["accountsReceivable", "bank", "otherCurrentAssets", "fixedAssets", "otherAssets", "accountsPayable", "creditCard", "otherCurrentLiabilities", "longTermLiabilities", "equity", "income", "otherIncome", "costOfGoodsSold", "expenses", "otherExpense", "costOfServices", "loansTo"];
  hasParentOrChild: boolean = false;
  hasChildren: boolean = false;
  showFlyout:boolean = false;
  coaId:any;
  confirmSubscription:any;
  companyCurrency:string;
  localeFortmat:string='en-US';
  routeSubscribe:any;
  coaTableColumns: Array<any> = ['Number', 'Name', 'Type', 'Sub Type', 'Parent', 'Debit', 'Credit'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };

  constructor(private _fb: FormBuilder, private _coaForm: COAForm, private switchBoard: SwitchBoard,private _router: Router,
              private coaService: ChartOfAccountsService, private loadingService:LoadingService,
              private toastService: ToastService, private companiesService: CompaniesService,private numeralService:NumeralService,
              private titleService:pageTitleService, private reportsService: ReportService){
    this.titleService.setPageTitle("CHART OF ACCOUNTS");
    this.coaForm = this._fb.group(_coaForm.getForm());
    let companyId = Session.getCurrentCompany();
    this.companyCurrency = Session.getCurrentCompanyCurrency();
    this.loadingService.triggerLoadingEvent(true);
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteCOA(toast));
    this.categoryTypes = _.sortBy(this.categoryTypes, ['name']);
    this.companiesService.companies().subscribe(companies => {
      this.allCompanies = companies;

      if(companyId){
        this.currentCompany = _.find(this.allCompanies, {id: companyId});
      } else if(this.allCompanies.length> 0){
        this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
      }
      this.fetchChartOfAccountData();
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

  fetchChartOfAccountData(){
    this.coaService.chartOfAccounts(this.currentCompany.id)
        .subscribe(chartOfAccounts => {
          this.buildTableData(chartOfAccounts);
          // console.log("COA Data === ", chartOfAccounts);
        }, error=> this.handleError(error));
  }

  ngOnDestroy(){
    this.routeSubscribe.unsubscribe();
    this.confirmSubscription.unsubscribe();
  }
  handleError(error){
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
    let data = this._coaForm.getData(this.coaForm);
    if(this.editMode && data.parentID){
      this.toastService.pop(TOAST_TYPE.error, "Type cannot be changed for a child");
      $event && $event.preventDefault();
      return false;
    }
    let categoryType = $event.target.value;
    this.displaySubtypes = _.sortBy(this.allSubTypes[categoryType], ['name']);
    this.description = "";
    this.coaForm.controls['subType'].patchValue('');
    this.setParents(categoryType, data.id);
  }

  setParents(categoryType, coaId?){
    if(categoryType){
      this.parentAccounts = _.filter(this.chartOfAccounts, {type: categoryType});
      if(coaId){
        this.removeChildren(coaId);
      }
      _.sortBy(this.parentAccounts, ['number', 'name']);
      this.refreshComboBox();
    }
  }

  removeChildren(coaId){
    let base = this;
    let children = this.getChildren(this.chartOfAccounts, coaId);
    _.remove(base.parentAccounts, {id: coaId});
    if(children.length > 0){
      _.each(children, function(child){
        _.remove(base.parentAccounts, {id: child.id});
        base.removeChildren(child.id);
      });
    }
  }

  selectSubtype($event){
    this.description = this.descriptions[$event.target.value];
  }

  showAddCOA() {
    this.titleService.setPageTitle("CREATE CHART OF ACCOUNT");
    this.editMode = false;
    this.coaForm = this._fb.group(this._coaForm.getForm());
    let inActiveControl: any = this.coaForm.controls.inActive;
    inActiveControl.setValue(true);
    this.displaySubtypes = [];
    this.description = "";
    this.subAccount = false;
    this.hasParentOrChild = false;
    this.hasChildren = false;
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
    let base = this;
    this.titleService.setPageTitle("UPDATE CHART OF ACCOUNT");
    this.loadingService.triggerLoadingEvent(true);
    this.coaService.getChartOfAccount(row.id, this.currentCompany.id).subscribe( coa => {
      this.loadingService.triggerLoadingEvent(false);
      coa.inActive = !coa.inActive;
      this.editMode = true;
      this.showFlyout = true;
      this.coaForm = this._fb.group(this._coaForm.getForm());
      this.subAccount = Boolean(coa.subAccount);
      this.displaySubtypes = this.allSubTypes[coa.type];
      this.description = this.descriptions[coa.subType];
      this.setParents(coa.type, coa.id);
      let parentIndex = _.findIndex(this.parentAccounts, {id: coa.parentID});
      if(parentIndex != -1){
        setTimeout(function () {
          base.parentAccountComboBox.setValue(base.parentAccounts[parentIndex], 'name');
        },100);
      }
      this.updateCOAStatus(coa);
      this._coaForm.updateForm(this.coaForm, coa);
    }, error => {

    });
  }

  updateCOAStatus(coa){
    this.hasParentOrChild = this.hasRelation(coa);
    this.hasChildren = false;
    let children = _.filter(this.chartOfAccounts, {'parentID': coa.id});
    if(children.length > 0){
      this.hasChildren = true;
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
    coaData.level = parentCoa.level+1;
    this._coaForm.updateForm(this.coaForm, coaData);
  }

  saveCOA($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._coaForm.getData(this.coaForm);
    data.inActive = !data.inActive;
    if(!data.subAccount){
      data.parentID = null;
      data.level = 0;
    }
    this.loadingService.triggerLoadingEvent(true);
    if(this.editMode){
      this.coaService.updateCOA(data.id, data, this.currentCompany.id)
          .subscribe(coa => {
            base.hideFlyout();
            this.loadingService.triggerLoadingEvent(false);
            base.toastService.pop(TOAST_TYPE.success, "Chart of Account updated successfully");
            this.fetchChartOfAccountData();
          }, error => this.handleCOAError(error));
    } else{
      this.coaService.addChartOfAccount(data, this.currentCompany.id)
          .subscribe(newCOA => {
            base.hideFlyout();
            this.loadingService.triggerLoadingEvent(false);
            this.toastService.pop(TOAST_TYPE.success, "Chart of account created successfully");
            this.fetchChartOfAccountData();
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
    let base = this;
    this.titleService.setPageTitle("Chart Of Accounts");
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
      {"name": "debit", "title": "Debit", "type":"number", "formatter": (debit)=>{
          debit = parseFloat(debit);
          // base.numeralService.format("$0,0.00", debit)
          return debit.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }, "sortValue": function(value){
          return base.numeralService.value(value);
        },"classes": "currency-align currency-padding"
      },
      {"name": "credit", "title": "Credit", "type":"number", "formatter": (credit)=>{
          credit = parseFloat(credit);
          return credit.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        }else if(key == 'debit' || key == 'credit'){
          let amount = parseFloat(coa[key]);
          row[key] = {
            'options': {
              "classes": "text-right"
            },
            value : amount.toFixed(2)
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

  hideFlyout(){
    this.titleService.setPageTitle("CHART OF ACCOUNTS");
    this.showFlyout = !this.showFlyout;
  }

  getCoaTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempData[i].debit = parseFloat(tempData[i].debit.value).toLocaleString(this.localeFortmat, { style: 'currency', currency: this.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      tempData[i].credit = parseFloat(tempData[i].credit.value).toLocaleString(this.localeFortmat, { style: 'currency', currency: this.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });

      tempJsonArray["Number"] = (tempData[i].number.value) ? tempData[i].number.value : tempData[i].number;

      tempJsonArray["Name"] = (tempData[i].name.value) ? tempData[i].name.value : tempData[i].name;
      tempJsonArray["Type"] = tempData[i].categoryType;
      tempJsonArray["Sub Type"] = tempData[i].subTypeCode;
      tempJsonArray["Parent"] = tempData[i].parentName;
      tempJsonArray["Debit"] = tempData[i].debit;
      tempJsonArray["Credit"] = tempData[i].credit;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType) {
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.coaTableColumns;
    this.pdfTableData.tableRows.rows = this.getCoaTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.currentCompany, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "ChartOfAccounts.xls";
        link.click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed to Export table into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF() {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.currentCompany, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "ChartOfAccounts.pdf";
        link[0].click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed to Export table into PDF");
      });

  }

}
