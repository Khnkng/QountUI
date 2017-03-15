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

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'lock',
    templateUrl: '/app/views/lock.html'
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


    constructor(private _fb: FormBuilder, private companyService: CompaniesService, private _lockform:LockForm,
                private _router: Router, private loadingService:LoadingService, private vendorService: CompaniesService,
                private _toastService: ToastService, private switchBoard: SwitchBoard,private coaService: ChartOfAccountsService) {
        console.log("dhfgadwf");
        this.LockForm = this._fb.group(_lockform.getLock());
        this.companyId = Session.getCurrentCompany();this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteLock(toast));
        this.companyService.getLockofCompany(this.companyId)
            .subscribe(lockList  => {
                this.buildTableData(lockList);
                this.loadingService.triggerLoadingEvent(false);
                this.lockList=lockList;
                for(var i=0;i<lockList.length;i++)
                {
                    if(lockList[i].active_lock_date){
                        this.lockdate=lockList[i].active_lock_date;
                    }
                };
                console.log("this.dfdfdfdfd",this.lockdate);
                this.showFlyout = false;
            }, error =>  this.handleError(error));

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
                row['lock_date'] = lockList.lock_date;
                row['created_at'] = lockList.created_at;
                row['created_by'] = lockList.created_by;
                row['actions'] = "<a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
                base.tableData.rows.push(row);
            }
        });
        base.hasItemCodes = false;
        setTimeout(function(){
            base.hasItemCodes = true;
        });
    }
    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.showEditLock($event);
        } else if(action == 'delete'){
            this.removeLock($event);
        }
    }
    showEditLock(row:any) {
        this.showFlyout = true;
        this.editMode = true;
        this.LockForm = this._fb.group(this._lockform.getLock());
        this.getLockDetails(row.id);
    }
    removeLock(row:any){
        let vendor:VendorModel = row;
        this.lockId=row.id;
        this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }

    deleteLock(toast){
        console.log("this.companyId",this.companyId);
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.removeLock(this.lockId, this.companyId)
            .subscribe(success  => {
                this._toastService.pop(TOAST_TYPE.success, "Lock deleted successfully");
                this.companyService.getLockofCompany(this.companyId)
                    .subscribe(lockList  => {
                        this.buildTableData(lockList);
                        this.loadingService.triggerLoadingEvent(false);
                        return;
                    }, error =>  this.handleError(error));
            }, error =>  this.handleError(error));
    }
    ngOnDestroy(){
        this.confirmSubscription.unsubscribe();
    }
    getLockDetails(vendorID){
        let base=this;
        this.companyService.lock(this.companyId,vendorID).subscribe(tax => {
            this.row = tax;
           this.lockdate=tax.lock_created_at;
            let lock_created_at:any=this.LockForm.controls['lock_created_at'];
            lock_created_at.patchValue(tax.lock_created_at);
            this.lockdate=tax.lock_created_at;
            this._lockform.updateForm(this.LockForm, tax);

        }, error => this.handleError(error));
        this.lockdate="";
    }
    showCreateLock(){
        let self = this;
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
                    }
                };
                console.log("this.lockdate",this.lockdate);
            }, error =>  this.handleError(error));
        this.showFlyout = true;
    }
    hideFlyout(){
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
        this.companyId = Session.getCurrentCompany();
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
    this.companyService.addLock(<VendorModel>data, this.companyId)
        .subscribe(success => {
            this.loadingService.triggerLoadingEvent(false);
            this.showMessage(true, success);
            this.companyService.getLockofCompany(this.companyId)
                .subscribe(lockList  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.lockList=lockList;
                    for(var i=0;i<lockList.length;i++)
                    {
                        if(lockList[i].active_lock_date){
                            this.lockdate=lockList[i].active_lock_date;
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

}
