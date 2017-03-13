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
    tableColumns:Array<string> = ['id','name', 'tin', 'visibleOnInvoices', 'taxAuthorityName', 'taxRate','coa_name','recoverableTax','compoundTax'];
    taxesList:any;
    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    @ViewChild("newVendorComboBoxDir") newVendorComboBox: ComboBox;
    @ViewChild('addressDir') addressDir: Address;
    countryCode:string;
    showAddress:boolean;
    showFlyout:boolean = false;
    taxId:any;
    confirmSubscription:any;

    constructor(private _fb: FormBuilder, private companyService: CompaniesService, private _lockform:LockForm,
                private _router: Router, private loadingService:LoadingService, private vendorService: CompaniesService,
                private _toastService: ToastService, private switchBoard: SwitchBoard,private coaService: ChartOfAccountsService) {
        console.log("dhfgadwf");
        this.LockForm = this._fb.group(_lockform.getLock());
        this.companyId = Session.getCurrentCompany();

    }

    showCreateLock(){

        let self = this;
        this.editMode = false;
        // this.TaxesForm.reset();
        this.showFlyout = true;
    }
    hideFlyout(){
        this.row = {};
        this.showFlyout = !this.showFlyout;
    }
    isValid(LockForm){
        if(LockForm.value.lock_created_at=="" ){
            return false;
        }
        return true;
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
                    //this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  console.log("error")
                );

        } else{
            var currentdate = new Date();
            var datetime=currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":" + currentdate.getSeconds();
            console.log("<VendorModel>data",<VendorModel>data);
            data.lock_created_at=data.lock_created_at+' '+datetime
            this.companyService.addLock(<VendorModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    //this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  console.log("mnmnm"));
        }
    }
    setDate(date: string){
        let jeDateControl:any = this.LockForm.controls['lock_created_at'];
        jeDateControl.patchValue(date);
    }
}
