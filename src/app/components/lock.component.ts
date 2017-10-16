/**
 * Created by Nazia on 13-03-2017.
 */


import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {PROVINCES} from "qCommon/app/constants/Provinces.constants";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {LockForm} from "../forms/lock.form"
import {Router} from "@angular/router";
import {VendorModel} from "../models/Vendor.model";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {CompanyModel} from "../models/Company.model";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {Address} from "qCommon/app/directives/address.directive";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare var jQuery:any;
declare var _:any;
declare var moment:any;

@Component({
  selector: 'lock',
  templateUrl: '../views/lock.html'
})

export class lockComponent {
  tableData:any = {};
  tableOptions:any = {};
  status:any;
  vendors:Array<any>;
  hasItemCodes: boolean = false;
  // tableColumns:Array<string> = ['id','lock_created_at', 'lock_created_by'];
  editMode:boolean = false;
  @ViewChild('createtaxes') createtaxes;
  @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox: ComboBox;
  row:any;
  LockForm: FormGroup;
  countries:Array<any> = PROVINCES.COUNTRIES;
  @ViewChild('fooTableDir') fooTableDir:FTable;
  message:string;
  companyId:string;
  companies:Array<CompanyModel> = [];
  currentCompany:any = {};
  chartOfAccounts:any;
  lockList:any;
  @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
  @ViewChild("newVendorComboBoxDir") newVendorComboBox: ComboBox;
  @ViewChild('addressDir') addressDir: Address;
  countryCode:string;
  showAddress:boolean;
  showFlyout:boolean = false;
  lockId:any;
  confirmSubscription:any;
  lockdate:any;
  todaysDate:any;
  tagListValue:any;
  locksrow:any;
  lockslist:any;
  currentlock:any;
  haslockdate:boolean=false;
  hasnolockdate:boolean=true;
  currentlockdate:any;
  dateFormat:string;
  serviceDateformat:string;
  routeSubscribe:any;
  lockTableColumns: Array<any> = ['Lock', 'Created Date', 'Created By'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };

  constructor(private _fb: FormBuilder, private companyService: CompaniesService, private _lockform:LockForm,
              private _router: Router, private loadingService:LoadingService, private vendorService: CompaniesService,
              private _toastService: ToastService,private titleService:pageTitleService, private switchBoard: SwitchBoard,
              private coaService: ChartOfAccountsService,private dateFormater:DateFormater, private reportsService: ReportService) {
    this.titleService.setPageTitle("Lock");
    this.LockForm = this._fb.group(_lockform.getLock());
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
    this.companyId = Session.getCurrentCompany();this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteLock(toast));
    this.loadingService.triggerLoadingEvent(true);
    this.companyService.getLockofCompany(this.companyId)
      .subscribe(lockList  => {
        this.buildTableData(lockList);

        this.lockList=lockList;
        for(var i=0;i<lockList.length;i++)
        {

          if(lockList[i].active_lock_date){
            this.lockdate=lockList[i].active_lock_date;
            lockList.active_lock_date = this.dateFormater.formatDate(lockList.active_lock_date,this.serviceDateformat,this.dateFormat);
          }
        };
        this.showFlyout = false;
      }, error =>  this.handleError(error));

    this.companyService.getcurrentLock(this.companyId)
      .subscribe(currentlock  => {
        currentlock.min_lock_date = this.dateFormater.formatDate(currentlock.min_lock_date,this.serviceDateformat,this.dateFormat);
        this.currentlock=currentlock.min_lock_date;
        console.log("this.currentlock",this.currentlock);
      });

    this.todaysDate=moment(new Date()).format(this.dateFormat);
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

  buildTableData(lockList){
    this.hasItemCodes = false;
    this.lockList = lockList;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name":"id","title":"id","visible": false},
      {"name": "lock_date", "title": "Lock"},
      {"name": "created_at", "title": "Created Date"},
      {"name": "created_by", "title": "Created By"},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    _.each(lockList, function(lockList) {
      if(lockList.lock_date) {
        let row: any = {};
        row['id'] = lockList.id;
        lockList.active_lock_date = base.dateFormater.formatDate(lockList.active_lock_date,base.serviceDateformat,base.dateFormat);
        lockList.created_at = base.dateFormater.formatDate(lockList.created_at,base.serviceDateformat,base.dateFormat);
        lockList.lock_date = base.dateFormater.formatDate(lockList.lock_date,base.serviceDateformat,base.dateFormat);
        row['lock_date'] = lockList.lock_date;
        row['created_at'] = lockList.created_at;
        row['created_by'] = lockList.created_by;
        if(lockList.active_lock_date==lockList.lock_date) {
          row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
        }
        base.tableData.rows.push(row);
      }
    });
    base.hasItemCodes = false;
    setTimeout(function(){
      base.hasItemCodes = true;
    });
    this.loadingService.triggerLoadingEvent(false);
  }
  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.loadingService.triggerLoadingEvent(true);
      this.companyService.lock(this.companyId,$event.id).subscribe(tax => {
        this.row = tax;
        this.locksrow=tax.shared_with;
        this.haslockdate=true;
        this.hasnolockdate=false;
        this.showEditLock(this.row);
      }, error => this.handleError(error));
    } else if(action == 'delete'){
      this.removeLock($event);
    }
  }
  showEditLock(row) {
    this.titleService.setPageTitle("UPDATE LOCK");
    this.haslockdate=true;
    this.hasnolockdate=false;
    this.showFlyout = true;
    this.editMode = true;
    this.LockForm = this._fb.group(this._lockform.getLock());
    this.getLockDetails(row);
    this.loadingService.triggerLoadingEvent(false);
  }
  removeLock(row:any){
    let vendor:VendorModel = row;
    this.lockId=row.id;
    this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
  }

  deleteLock(toast){

    // console.log("this.companyId",this.companyId);
    // this.loadingService.triggerLoadingEvent(true);
    // this.companyService.removeLock(this.lockId, this.companyId)
    //     .subscribe(success  => {
    //         this._toastService.pop(TOAST_TYPE.success, "Lock deleted successfully");
    //         this.companyService.getLockofCompany(this.companyId)
    //             .subscribe(lockList  => {
    //                 this.buildTableData(lockList);
    //                 this.loadingService.triggerLoadingEvent(false);
    //                 return;
    //             }, error =>  this.handleError(error));
    //     }, error =>  this.handleError(error));
  }
  ngOnDestroy(){
    this.routeSubscribe.unsubscribe();
    this.confirmSubscription.unsubscribe();
  }
  getLockDetails(row){
    let base=this;
    row.lock_date = this.dateFormater.formatDate(row.lock_date,this.serviceDateformat,this.dateFormat);
    this.lockdate=row.lock_date;
    let lock_created_at:any=this.LockForm.controls['lock_date'];
    lock_created_at.patchValue(row.lock_date);
    let key:any=this.LockForm.controls['key'];
    key.patchValue(row.key);
    // this.locksrow=tax.shared_with;
    this._lockform.updateForm(this.LockForm, row);
  }
  showCreateLock(){
    this.titleService.setPageTitle("CREATE LOCK");
    let self = this;
    this.locksrow=[];
    this.haslockdate=false;
    this.hasnolockdate=true;
    this.editMode = false;
    this.LockForm.reset();
    this.companyService.getLockofCompany(this.companyId)
      .subscribe(lockList  => {
        this.loadingService.triggerLoadingEvent(false);
        this.lockList=lockList;
        for(var i=0;i<lockList.length;i++)
        {
          if(lockList[i].active_lock_date){
            this.lockdate=lockList[i].active_lock_date;
            this.lockdate = this.dateFormater.formatDate(this.lockdate,this.serviceDateformat,this.dateFormat);
          }
        };
      }, error =>  this.handleError(error));
    this.todaysDate= moment(new Date()).format(this.dateFormat);
    this.showFlyout = true;

  }
  hideFlyout(){
    this.titleService.setPageTitle("Lock");
    this.row = {};
    this.showFlyout = !this.showFlyout;
  }
  isValid(LockForm){
    if((LockForm.value.lock_date) && (LockForm.value.key)){
      return true;
    }
    return false;
  }

  submit($event) {
    let base = this;
    $event && $event.preventDefault();
    let data = this._lockform.getData(this.LockForm);
    console.log(data);
    this.companyId = Session.getCurrentCompany();
    var Emailaddress=jQuery('#shared_with').tagit("assignedTags");
    data.shared_with=Emailaddress;
    data.lock_date = this.dateFormater.formatDate(data.lock_date,this.dateFormat,this.serviceDateformat);
    data.created_at = this.dateFormater.formatDate(data.created_at,this.dateFormat,this.serviceDateformat);
    this.loadingService.triggerLoadingEvent(true);
    if(this.editMode){
      data.id = this.row.id;
      this.companyService.updateLock(<VendorModel>data, this.companyId)
        .subscribe(success  => {
          this.loadingService.triggerLoadingEvent(false);
          this.showMessage(true, success);
          this.showFlyout = false;
        }, error => this.showMessage(false, error));
    }
    else
    {
      delete data.created_at;
      delete data.created_by;
      var Emailaddress=jQuery('#shared_with').tagit("assignedTags");
      data.shared_with=Emailaddress;
      this.companyService.addLock(<VendorModel>data, this.companyId, this.companyId)
        .subscribe(success => {
          this.loadingService.triggerLoadingEvent(false);
          this.showMessage(true, success);
          this.companyService.getLockofCompany(this.companyId)
            .subscribe(lockList  => {
              this.lockList=lockList;
              for(var i=0;i<lockList.length;i++)
              {
                if(lockList[i].active_lock_date){
                  this.lockdate=lockList[i].active_lock_date;
                  this.lockdate = this.dateFormater.formatDate(this.lockdate,this.serviceDateformat,this.dateFormat);
                }
              };
              console.log("this.lockdatecreated",this.lockdate);
            }, error =>  this.handleError(error));
          this.showFlyout = false;
        }, error => this.showMessage(false, error));
    }
  }
  setDate(date: string,lockdate){
    let jeDateControl:any = this.LockForm.controls['lock_date'];
    jeDateControl.patchValue(date);
  }

  handleError(error) {
    this.loadingService.triggerLoadingEvent(false);
    this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
  }
  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.hasItemCodes=false;
      if(this.editMode) {
        this.companyService.getLockofCompany(this.companyId)
          .subscribe(lockList  => {
            for(var i=0;i<lockList.length;i++)
            {
              if(lockList[i].active_lock_date){
                this.lockdate=lockList[i].active_lock_date;
                this.lockdate = this.dateFormater.formatDate(this.lockdate,this.serviceDateformat,this.dateFormat);
              }
            };
            this.buildTableData(lockList);
            this.loadingService.triggerLoadingEvent(false);
            this.lockList=lockList;
          }, error =>  this.handleError(error));
        this.LockForm.reset();
        this._toastService.pop(TOAST_TYPE.success, "Lock updated successfully.");
      } else {
        this.companyService.getLockofCompany(this.companyId)
          .subscribe(lockList  => {
            this.buildTableData(lockList);
            this.loadingService.triggerLoadingEvent(false);
            this.lockList=lockList;
          }, error =>  this.handleError(error));

        this.LockForm.reset();
        this._toastService.pop(TOAST_TYPE.success, "Lock created successfully.");
      }
    } else {
      this.status = {};
      this.status['error'] = true;
      try {
        let resp = JSON.parse(obj);
        if(resp.message){
          this._toastService.pop(TOAST_TYPE.error, resp.message);
        } else{
          this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
        }
      }catch(err){
        this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
      }
    }
  }

  getLockTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["Lock"] = tempData[i].lock_date;
      tempJsonArray["Created Date"] = tempData[i].created_at;
      tempJsonArray["Created By"] = tempData[i].created_by;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType){
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.lockTableColumns;
    this.pdfTableData.tableRows.rows = this.getLockTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "Lock.xls";
        link.click();
      }, error =>{
        this._toastService.pop(TOAST_TYPE.error, "Failed to Export table into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF(tabId) {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "Lock.pdf";
        link[0].click();
      }, error =>{
        this._toastService.pop(TOAST_TYPE.error, "Failed to Export table into PDF");
      });

  }


}
