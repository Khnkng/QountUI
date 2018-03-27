/**
 * Created by venkatkollikonda on 07/08/17.
 */
import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {METRICS_CATEGORY_TYPES, METRICS_SUBTYPES,SUBTYPE_DESCRIPTIONS} from "qCommon/app/constants/Qount.constants";
import {MetricsForm} from "../forms/Metrics.form";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {MetricsService} from "../services/Metrics.service";
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
  selector: 'metrics',
  templateUrl: '../views/metrics.html',
})

export class MetricsComponent{
  companyId:string;
  metricsForm: FormGroup;
  valueMetricsForm: FormGroup;
  metrics:any = [];
  newFormActive:boolean = true;
  categoryTypes = METRICS_CATEGORY_TYPES;
  allSubTypes = METRICS_SUBTYPES;
  descriptions = SUBTYPE_DESCRIPTIONS;
  displaySubtypes: any = [];
  description:string = '';
  parentAccounts = [];
  @ViewChild('addCOA') addCOA;
  @ViewChild('parentAccountComboBoxDir') parentAccountComboBox: ComboBox;
  subAccount:boolean = false;
  hasMetricsList: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  currentCompany:any;
  allCompanies:Array<any>;
  mappings:Array<any>;
  row:any;
  metricsColumns:Array<string> = ['name', 'id', 'parentID', 'subAccount', 'type', 'subType', 'desc'];
  combo:boolean = true;
  sortingOrder:Array<string> = ["customers", "newCustomers", "cac", "subscribers", "siteVisits", "employees", "sales"];
  hasParentOrChild: boolean = false;
  hasChildren: boolean = false;
  showFlyout:boolean = false;
  showValuedMetricFlyout:boolean = false;
  metricId:any;
  confirmSubscription:any;
  companyCurrency:string;
  localeFortmat:string='en-US';
  routeSubscribe:any;
  metricsTableColumns: Array<any> = ['Name', 'Type', 'Sub Type', 'Parent'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
  showDownloadIcon:string = "hidden";

  constructor(private _fb: FormBuilder, private _metricsForm: MetricsForm, private switchBoard: SwitchBoard,private _router: Router,
              private coaService: ChartOfAccountsService,private metricService: MetricsService, private loadingService:LoadingService,
              private toastService: ToastService, private companiesService: CompaniesService,private numeralService:NumeralService,
              private titleService:pageTitleService, private reportsService: ReportService){
    this.titleService.setPageTitle("Metrics");
    this.metricsForm = this._fb.group(_metricsForm.getForm());
    this.companyId = Session.getCurrentCompany();
    this.companyCurrency = Session.getCurrentCompanyCurrency();
    this.loadingService.triggerLoadingEvent(true);
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteMetric(toast));
    this.categoryTypes = _.sortBy(this.categoryTypes, ['name']);
    this.fetchMetricsData();
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

  fetchMetricsData(){
    this.metricService.getMetricsList(this.companyId)
      .subscribe(metricsList => {
        this.buildTableData(metricsList);
      }, error=> this.handleError(error));
  }

  ngOnDestroy(){
    this.routeSubscribe.unsubscribe();
    this.confirmSubscription.unsubscribe();
  }
  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
    this.toastService.pop(TOAST_TYPE.error, "Could Not Perform Operation");
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
    let data = this._metricsForm.getData(this.metricsForm);
    if(this.editMode && data.parentID){
      this.toastService.pop(TOAST_TYPE.error, "Type Cannot Be Changed For A Child");
      $event && $event.preventDefault();
      return false;
    }
    let categoryType = $event.target.value;
    this.displaySubtypes = _.sortBy(this.allSubTypes[categoryType], ['name']);
    this.description = "";
    this.metricsForm.controls['subType'].patchValue('');
    this.setParents(categoryType, data.id);
  }

  setParents(categoryType, metricId?){
    if(categoryType){
      this.parentAccounts = _.filter(this.metrics, {type: categoryType});
      if(metricId){
        this.removeChildren(metricId);
      }
      _.sortBy(this.parentAccounts, ['name']);
      this.refreshComboBox();
    }
  }

  removeChildren(metricId){
    let base = this;
    let children = this.getChildren(this.metrics, metricId);
    _.remove(base.parentAccounts, {id: metricId});
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

  showAddMetric() {
    this.titleService.setPageTitle("CREATE METRIC");
    this.editMode = false;
    this.metricsForm = this._fb.group(this._metricsForm.getForm());
    this.displaySubtypes = [];
    this.description = "";
    this.subAccount = false;
    this.hasParentOrChild = false;
    this.hasChildren = false;
    this.showFlyout = true;
  }

  showValuedMetric() {
    let link = ['createMetrics'];
    this._router.navigate(link);
  }

  changeStatus(){
    let metricsData = this._metricsForm.getData(this.metricsForm);
    if(metricsData.subAccount){
      this.subAccount = true;
    } else{
      this.subAccount = false;
    }
  }

  showEditMetric(row: any){
    let base = this;
    this.titleService.setPageTitle("Update Metrics");
    this.loadingService.triggerLoadingEvent(true);
    this.metricService.getMetric(row.id, this.companyId).subscribe( metric => {
      this.loadingService.triggerLoadingEvent(false);
      this.editMode = true;
      this.showFlyout = true;
      this.metricsForm = this._fb.group(this._metricsForm.getForm());
      this.subAccount = Boolean(metric.subAccount);
      this.displaySubtypes = this.allSubTypes[metric.type];
      this.description = this.descriptions[metric.subType];
      this.setParents(metric.type, metric.id);
      let parentIndex = _.findIndex(this.parentAccounts, {id: metric.parentID});
      if(parentIndex != -1){
        setTimeout(function () {
          base.parentAccountComboBox.setValue(base.parentAccounts[parentIndex], 'name');
        },100);
      }
      this.updateMetricStatus(metric);
      this._metricsForm.updateForm(this.metricsForm, metric);
    }, error => {

    });
  }

  updateMetricStatus(metric){
    this.hasParentOrChild = this.hasRelation(metric);
    this.hasChildren = false;
    let children = _.filter(this.metrics, {'parentID': metric.id});
    if(children.length > 0){
      this.hasChildren = true;
    }
  }

  hasRelation(metric){
    let hasParentOrChild = false;
    if(metric.parentID != "" && metric.subAccount){
      hasParentOrChild = true; //Child of another metric
    } else{
      let children = _.filter(this.metrics, {'parentID': metric.id});
      if(children.length > 0){
        hasParentOrChild = true;
      }
    }
    return hasParentOrChild;
  }

  deleteMetric(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.metricService.removeMetric(this.metricId, this.companyId)
      .subscribe(metric => {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(TOAST_TYPE.success, "Metrics Deleted Successfully");
        this.fetchMetricsData();
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
        if(error.message){
          this.toastService.pop(TOAST_TYPE.error, error.message);
        } else{
          this.toastService.pop(TOAST_TYPE.error, "Failed To Delete Metrics");
        }
      });
  }
  removeMetric(row: any){
    this.metricId = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are You Sure You Want To Delete?");
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
      this.showEditMetric($event);
    } else if(action == 'delete'){
      this.removeMetric($event);
    }
  }

  updateParent(parentMetric){
    let metricData = this._metricsForm.getData(this.metricsForm);
    metricData.parentID = parentMetric.id;
    metricData.level = parentMetric.level+1;
    this._metricsForm.updateForm(this.metricsForm, metricData);
  }

  saveMetric($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._metricsForm.getData(this.metricsForm);
    if(!data.subAccount){
      data.parentID = null;
      data.level = 0;
    }
    this.loadingService.triggerLoadingEvent(true);
    if(this.editMode){
      this.metricService.updateMetric(data.id, data, this.companyId)
        .subscribe(metric => {
          base.hideFlyout();
          this.loadingService.triggerLoadingEvent(false);
          base.toastService.pop(TOAST_TYPE.success, "Metric Updated Successfully");
          this.fetchMetricsData();
        }, error => this.handleMetricsError(error));
    } else{
      this.metricService.addMetrics(data, this.companyId)
        .subscribe(newMetric => {
          base.hideFlyout();
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.success, "New Metric Created Successfully");
          this.fetchMetricsData();
        }, error => this.handleMetricsError(error));
    }
    this.buildTableData(this.metrics);
  }

  handleMetricsError(error){
    this.loadingService.triggerLoadingEvent(false);
    if(error && error.message){
      this.toastService.pop(TOAST_TYPE.error, error.message);
    } else{
      this.toastService.pop(TOAST_TYPE.error, "Could Not Perform Operation");
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

  buildTableData(metricsList) {
    this.titleService.setPageTitle("Metrics");
    this.sortMetrics(metricsList);
    this.hasMetricsList = false;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "categoryType", "title": "Type"},
      {"name": "subTypeCode", "title": "Sub Type"},
      {"name": "parentName", "title": "Parent"},
      {"name": "type", "title": "Type", "visible": false},
      {"name": "subType", "title": "Sub type", "visible": false},
      {"name": "desc", "title": "Description", "visible": false},
      {"name": "id", "title": "Metric ID","visible": false},
      {"name": "parentID", "title": "Parent", "visible": false},
      {"name": "subAccount", "title": "Sub account","visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    this.metrics.forEach(function(metric) {
      let row:any = {};
      metric.subAccount = metric.subAccount? metric.subAccount : false;
      _.each(base.metricsColumns, function(key) {
        if(key == 'type'){
          row[key] = metric[key];
          row['categoryType'] = base.getCategoryName(metric[key]);
        } else if(key == 'subType'){
          row[key] = metric[key];
          row['subTypeCode'] = base.getSubTypeName(metric.type, metric[key]);
        } else if(key == 'parentID'){
          row[key] = metric[key];
          row['parentName'] = metric[key]? _.find(base.metrics, {id: metric[key]}).name : "";
        } else if(key == 'name'){
          row[key] = metric[key];
          if(metric['parentID']){
            row[key] = {options:{
              classes: "coa-child-"+metric.level,
              sortValue: base.getName(metric['parentID'])
            }, value: metric[key]}
          } else{
            row[key] = metric[key];
          }
        }else{
          row[key] = metric[key];
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
        if(!base.hasRelation(metric)){
          row['actions'] += "<a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
        }
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasMetricsList = true;
    }, 0);
    setTimeout(function() {
      if(base.hasMetricsList){
        base.showDownloadIcon = "visible";
      }
    },600);
    this.loadingService.triggerLoadingEvent(false);
  }

  getName(metricId){
    let metric = _.find(this.metrics, {id: metricId});
    return metric.name;
  }

  getChildren(metricsList, parentID){
    let data = [];
    _.each(metricsList, function(child){
      if(child.parentID == parentID){
        data.push(child);
      }
    });
    return data;
  }

  addChildren(metricsList, metric){
    let base = this;
    let children = this.getChildren(metricsList, metric.id);
    if(children.length == 0 && metric.subAccount){
      return;
    } else{
      _.each(children, function(child){
        child.level = metric.level+1;
        base.metrics.push(child);
        base.addChildren(metricsList, child);
      });
    }
  }

  sortMetrics(metricsList){
    let base = this;
    this.metrics = [];
    metricsList = _.sortBy(metricsList, function(metric){
      return base.sortingOrder.indexOf(metric.type);
    });
    let parents = _.filter(metricsList, function(metric){
      return !metric.parentID || metric.subAccount == false;
    });
    _.each(parents, function(parent){
      parent.level = 0;
      base.metrics.push(parent);
      base.addChildren(metricsList, parent);
    });
  }

  hideFlyout(){
    this.titleService.setPageTitle("Metrics");
    this.showFlyout = !this.showFlyout;
  }

  getMetricsTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["Name"] = (tempData[i].name.value) ? tempData[i].name.value : tempData[i].name;
      tempJsonArray["Type"] = tempData[i].categoryType;
      tempJsonArray["Sub Type"] = tempData[i].subTypeCode;
      tempJsonArray["Parent"] = tempData[i].parentName;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType) {
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.metricsTableColumns;
    this.pdfTableData.tableRows.rows = this.getMetricsTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "Vendors.xls";
        link.click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF() {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "Vendors.pdf";
        link[0].click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into PDF");
      });

  }

}
