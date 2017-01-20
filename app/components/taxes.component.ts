/**
 * Created by Nazia on 15-07-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {PROVINCES} from "qCommon/app/constants/Provinces.constants";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {TaxesForm} from "../forms/Taxes.form"
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
    selector: 'taxes',
    templateUrl: '/app/views/taxes.html'
})

export class TaxesComponent {
    tableData:any = {};
    tableOptions:any = {};
    status:any;
    vendors:Array<any>;
    hasItemCodes: boolean = false;
    editMode:boolean = false;
    @ViewChild('createtaxes') createtaxes;
    @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox: ComboBox;
    row:any;
    TaxesForm: FormGroup;
    countries:Array<any> = PROVINCES.COUNTRIES;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    message:string;
    companyId:string;
    companies:Array<CompanyModel> = [];
    currentCompany:any = {};
    chartOfAccounts:any;
    tableColumns:Array<string> = ['id','name', 'tin', 'visibleOnInvoices', 'taxAuthorityName', 'taxRate','taxLiabilityCoa','recoverableTax','compoundTax'];
    taxesList:any;
    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    @ViewChild('addressDir') addressDir: Address;
    countryCode:string;
    showAddress:boolean;
    showFlyout:boolean = false;

    constructor(private _fb: FormBuilder, private companyService: CompaniesService, private _taxesForm:TaxesForm,
                private _router: Router, private loadingService:LoadingService,
                private _toastService: ToastService, private switchBoard: SwitchBoard,private coaService: ChartOfAccountsService) {
        this.TaxesForm = this._fb.group(_taxesForm.getTax());
        this.companyId = Session.getCurrentCompany();
        this.loadingService.triggerLoadingEvent(true);
        // this.companyService.companies().subscribe(companies => {
        //     this.companies = companies;
        //     if(this.companyId){
        //         this.currentCompany = _.find(this.companies, {id: this.companyId});
        //     } else if(this.companies.length> 0){
        //         this.currentCompany = _.find(this.companies, {id: this.companies[0].id});
        //     }
        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(chartOfAccounts => {
                this.loadingService.triggerLoadingEvent(false);
                // this.buildTableData(chartOfAccounts);
                this.chartOfAccounts=chartOfAccounts;
            }, error=> this.handleError(error));
        this.companyService.getTaxofCompany(this.companyId)
            .subscribe(taxesList  => {
                this.buildTableData(taxesList);
                this.loadingService.triggerLoadingEvent(false);
                this.taxesList=taxesList;
                console.log("taxesListtaxesList",taxesList);
                // this.showMessage(true, success);
                this.showFlyout = false;
            }, error =>  this.handleError(error));
    }
    buildTableData(taxesList) {
        this.hasItemCodes = false;
        this.taxesList = taxesList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"id","title":"id","visible": false},
            {"name": "name", "title": "Tax Name"},
            {"name": "tin", "title": "Tax Number"},
            {"name": "visibleOnInvoices", "title": "Display Invoices"},
            {"name": "taxAuthorityName", "title": "Tax Authority Name"},
            {"name": "taxRate", "title": "Tax Rate"},
            {"name": "taxLiabilityCoa", "title": "Tax Liability COA"},
            {"name": "recoverableTax", "title": "Recoverable Tax"},
            {"name": "compoundTax", "title": "Compound Tax"},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        taxesList.forEach(function(expense) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                if(key == 'coa_mapping_id'){
                    row['selectedCOAName'] = base.getCOAName(expense[key]);
                    row[key] = expense[key];
                }  else{
                    row[key] = expense[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function(){

            base.hasItemCodes = true;
        }, 0)
    }
    getCompanyName(companyId){
        let company = _.find(this.companies, {id: companyId});
        if(company){
            return company.name;
        }
    }

    showCreateTax() {
        let defaultCountry  = {name:'United States', code:'US'};
        let self = this;
        this.editMode = false;
        this.TaxesForm.reset();
        // setTimeout(function () {
        //     self.vendorCountryComboBox.setValue(defaultCountry, 'name');
        // },100);
        // this.showVendorProvince(defaultCountry);
        // this.editAddress = {};
        this.showFlyout = true;
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            console.log("dmsnfbjhf");
            this.showEditTax($event);
        } else if(action == 'delete'){
            this.removeTax($event);
        }
    }


    showCOA(coa:any) {
        let coaControl:any = this.TaxesForm.controls['taxLiabilityCoa'];
        coaControl.patchValue(coa.id);
    }

    removeTax(row:any) {
        let vendor:VendorModel = row;
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.removeTax(row.id, this.companyId)
            .subscribe(success  => {
                this._toastService.pop(TOAST_TYPE.success, "Tax deleted successfully");
                this.companyService.getTaxofCompany(this.companyId)
                    .subscribe(taxesList  => {
                        this.buildTableData(taxesList);
                        this.loadingService.triggerLoadingEvent(false);
                    }, error =>  this.handleError(error));
            }, error =>  this.handleError(error));
        _.remove(this.vendors, function (_vendor) {
            return vendor.id == _vendor.id;
        });
    }

    active1:boolean=true;
    newForm1(){
        this.active1 = false;
        setTimeout(()=> this.active1=true, 0);
    }

    showEditTax(row:any) {
        this.showFlyout = true;
        this.editMode = true;
        this.TaxesForm = this._fb.group(this._taxesForm.getTax());
        this.getTaxDetails(row.id);
    }

    submit($event) {
        this.loadingService.triggerLoadingEvent(true);
        $event && $event.preventDefault();
        let data = this._taxesForm.getData(this.TaxesForm);
        console.log("sadsf",data);
        this.companyId = Session.getCurrentCompany();

        if(this.editMode){
            data.id = this.row.id;
            console.log("<VendorModel>data",<VendorModel>data);
            console.log("this.row.id",this.row.id);
            this.companyService.updateTax(<VendorModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  this.showMessage(false, error));
        } else{
            //data.companyID = this.currentCompany.id;
            this.companyService.addTax(<VendorModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  this.showMessage(false, error));
        }
    }


    isValid(TaxesForm){
        return TaxesForm.valid;
    }
    showCOA(coa:any) {
        let coaControl:any = this.TaxesForm.controls['taxLiabilityCoa'];
        coaControl.patchValue(coa.id);
    }
    getCoa(){
        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(chartOfAccounts => {
                this.loadingService.triggerLoadingEvent(false);
                // this.buildTableData(chartOfAccounts);
            }, error=> this.handleError(error));
    }
    hideFlyout(){
        this.row = {};
        this.showFlyout = !this.showFlyout;
    }


    showMessage(status, obj) {
        if(status) {
            this.status = {};
            this.status['success'] = true;
            this.hasVendorsList=false;
            if(this.editMode) {
                this.companyService.getTaxofCompany(this.companyId)
                    .subscribe(taxesList  => {
                        this.buildTableData(taxesList);
                        this.loadingService.triggerLoadingEvent(false);
                        this.taxesList=taxesList;
                    }, error =>  this.handleError(error));
                this.TaxesForm.reset();
                this._toastService.pop(TOAST_TYPE.success, "Tax updated successfully.");
            } else {
                this.companyService.getTaxofCompany(this.companyId)
                    .subscribe(taxesList  => {
                        this.buildTableData(taxesList);
                        this.loadingService.triggerLoadingEvent(false);
                        this.taxesList=taxesList;
                    }, error =>  this.handleError(error));

                this.TaxesForm.reset();
                this._toastService.pop(TOAST_TYPE.success, "Tax created successfully.");
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

    handleError(error) {

    }


    getTaxDetails(vendorID){
        let base=this;
        this.companyService.tax(this.companyId,vendorID).subscribe(tax => {
            this.row = tax;
            let selectedCOAControl:any = this.TaxesForm.controls['name'];
            selectedCOAControl.patchValue(tax.name);
            let tin:any=this.TaxesForm.controls['tin'];
            tin.patchValue(tax.tin);
            let taxAuthorityName:any=this.TaxesForm.controls['taxAuthorityName'];
            taxAuthorityName.patchValue(tax.taxAuthorityName);
            let taxAuthorityId:any = this.TaxesForm.controls['taxAuthorityId'];
            taxAuthorityId.patchValue(tax.taxAuthorityId);
            let coa = _.find(this.chartOfAccounts, function(_coa) {
                return _coa.id == tax.taxLiabilityCoa;
            });
            if(!_.isEmpty(coa)){
                setTimeout(function(){
                    base.coaComboBox.setValue(coa, 'name');
                });
            }
            let description:any = this.TaxesForm.controls['description'];
            description.patchValue(tax.description);
            let taxRate:any = this.TaxesForm.controls['taxRate'];
            taxRate.patchValue(tax.taxRate);
            let compoundTax:any = this.TaxesForm.controls['compoundTax'];
            compoundTax.patchValue(tax.compoundTax);
            let recoverableTax:any = this.TaxesForm.controls['recoverableTax'];
            recoverableTax.patchValue(tax.recoverableTax);
            let visibleOnInvoices:any = this.TaxesForm.controls['visibleOnInvoices'];
            visibleOnInvoices.patchValue(tax.visibleOnInvoices);

            this._taxesForm.updateForm(this.TaxesForm, tax);

        }, error => this.handleError(error));
    }
}
