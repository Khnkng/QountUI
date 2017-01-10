/**
 * Created by seshu on 15-07-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {PROVINCES} from "qCommon/app/constants/Provinces.constants";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {VendorForm} from "qCommon/app/forms/Vendor.form";
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
  selector: 'vendors',
  templateUrl: '/app/views/vendors.html'
})

export class VendorComponent {
  tableData:any = {};
  tableOptions:any = {};
  status:any;
  vendors:Array<any>;
  editMode:boolean = false;
  @ViewChild('createVendor') createVendor;
  @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox: ComboBox;
  row:any;
  vendorForm: FormGroup;
  countries:Array<any> = PROVINCES.COUNTRIES;
  @ViewChild('fooTableDir') fooTableDir:FTable;
  hasVendorsList:boolean = false;
  message:string;
  companyId:string;
  companies:Array<CompanyModel> = [];
  currentCompany:any = {};
  chartOfAccounts:any;
  @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
  @ViewChild('addressDir') addressDir: Address;
  countryCode:string;
  showAddress:boolean;
  showFlyout:boolean = false;

  constructor(private _fb: FormBuilder, private companyService: CompaniesService, private _vendorForm:VendorForm,
              private _router: Router, private loadingService:LoadingService,
              private _toastService: ToastService, private switchBoard: SwitchBoard,private coaService: ChartOfAccountsService) {
    this.vendorForm = this._fb.group(_vendorForm.getForm());
    this.companyId = Session.getCurrentCompany();
    this.loadingService.triggerLoadingEvent(true);
    this.companyService.companies().subscribe(companies => {
      this.companies = companies;
      if(this.companyId){
        this.currentCompany = _.find(this.companies, {id: this.companyId});
      } else if(this.companies.length> 0){
        this.currentCompany = _.find(this.companies, {id: this.companies[0].id});
      }
      this.companyService.vendors(this.companyId).subscribe(vendors => {
        this.buildTableData(vendors);
        this.loadingService.triggerLoadingEvent(false);
      }, error => this.handleError(error));
    }, error => this.handleError(error));
    this.coaService.chartOfAccounts(this.companyId)
        .subscribe(chartOfAccounts => {
          this.chartOfAccounts=chartOfAccounts?_.filter(chartOfAccounts, {'type': 'accountsPayable'}):[];
        }, error=> this.handleError(error));
  }

  getCompanyName(companyId){
    let company = _.find(this.companies, {id: companyId});
    if(company){
      return company.name;
    }
  }

  buildTableData(vendors) {
    this.vendors = vendors;
    this.hasVendorsList = false;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "type", "title": "Type"},
      {"name": "einssn", "title": "EIN/SSN"},
      {"name": "email", "title": "Email"},
      {"name": "address", "title": "Address","visible": false},
      {"name": "phoneNumber", "title": "Phone Number"},
      {"name": "country", "title": "Country","visible": false},
      {"name": "state", "title": "State","visible": false},
      {"name": "city", "title": "City","visible": false},
      {"name": "zipcode", "title": "Zip code","visible": false},
      {"name": "id", "title": "ID","visible": false},
      {"name": "type", "title": "Vendor Type","visible": false},
      {"name": "ein", "title": "EIN","visible": false},
      {"name": "ssn", "title": "SSN","visible": false},
      {"name": "has1099", "title": "1099","visible": false},
      {"name": "paymentMethod", "title": "Payment Method","visible": false},
      {"name": "accountNumber", "title": "Account Number","visible": false},
      {"name": "accountNumbers", "title": "Account Numbers","visible": false},
      {"name": "routingNumber", "title": "RoutingNumber","visible": false},
      {"name": "coa", "title": "COA","visible": false},
      {"name": "creditCardNumber", "title": "Credit Card Number","visible": false},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    let base = this;
    this.vendors.forEach(function(vendor) {
      let row:any = {};
      for(let key in base.vendors[0]) {
        row[key] = vendor[key];
        if(key == 'type'){
          if(vendor[key] == 'Individual'){
            row['einssn'] = vendor['ssn'];
          } else if(vendor[key] == 'Company'){
            row['einssn'] = vendor['ein'];
          }
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      }
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasVendorsList = true;
    }, 0)
  }

  showCreateVendor() {
    let defaultCountry  = {name:'United States', code:'US'};
    let self = this;
    this.editMode = false;
    this.vendorForm = this._fb.group(this._vendorForm.getForm());
    this.newForm1();
    setTimeout(function () {
      self.vendorCountryComboBox.setValue(defaultCountry, 'name');
    },100);
    this.showVendorProvince(defaultCountry);
    this.editAddress = {};
    this.showFlyout = true;
  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditVendor($event);
    } else if(action == 'delete'){
      this.removeVendor($event);
    }
  }

  showVendorProvince(country:any) {
    let countryControl:any = this.vendorForm.controls['country'];
    countryControl.patchValue(country.name);
    this.countryCode = country.code;
    var base=this;
    if(this.editAddress&&this.editAddress.country==country.name){
      setTimeout(function () {
        base.addressDir.setData(base.editAddress);
      },500);
    }
  }

  showCOA(coa:any) {
    let coaControl:any = this.vendorForm.controls['coa'];
    coaControl.patchValue(coa.id);
  }

  removeVendor(row:any) {
    let vendor:VendorModel = row;
    this.loadingService.triggerLoadingEvent(true);
    this.companyService.removeVendor(vendor.id, this.companyId)
        .subscribe(success  => {
          this._toastService.pop(TOAST_TYPE.success, "Vendor deleted successfully");
          this.companyService.vendors(this.companyId)
              .subscribe(vendors  => {
                this.buildTableData(vendors);
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

  showEditVendor(row:any) {
    this.showFlyout = true;
    this.editMode = true;
    this.vendorForm = this._fb.group(this._vendorForm.getForm());
    this.getVendorDetails(row.id);
  }

  submit($event) {
    this.loadingService.triggerLoadingEvent(true);
    $event && $event.preventDefault();
    let data = this._vendorForm.getData(this.vendorForm);
    this.companyId = Session.getCurrentCompany();
    let addressData = this.addressDir.getData();
    addressData.country=data.country;
    data.addresses=[addressData];
    if(this.editMode) {
      data.id = this.row.id;
      this.companyService.updateVendor(<VendorModel>data, this.companyId)
          .subscribe(success  => {
            this.loadingService.triggerLoadingEvent(false);
            this.showMessage(true, success);
            this.showFlyout = false;
          }, error =>  this.showMessage(false, error));
    } else {
      this.companyService.addVendor(<VendorModel>data, this.companyId)
          .subscribe(success  => {
            this.loadingService.triggerLoadingEvent(false);
            this.showMessage(true, success);
            this.showFlyout = false;
          }, error =>  this.showMessage(false, error));
    }
  }

  isValid(vendorForm){
    return vendorForm.valid;
  }

  hideFlyout(){
    this.row = {};
    this.showFlyout = !this.showFlyout;
  }

  addressValid() {
    if(this.addressDir) {
      return this.addressDir.isValid();

    } return false;
  }

  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.hasVendorsList=false;
      if(this.editMode) {
        this.companyService.vendors(this.companyId)
            .subscribe(vendors  => this.buildTableData(vendors), error =>  this.handleError(error));
        this.newForm1();
        this._toastService.pop(TOAST_TYPE.success, "Vendor updated successfully.");
      } else {
        this.newForm1();
        this.companyService.vendors(this.companyId)
            .subscribe(vendors  => this.buildTableData(vendors), error =>  this.handleError(error));
        this._toastService.pop(TOAST_TYPE.success, "Vendor created successfully.");
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

  setVendorType(vendorType, vendor?){
    let validator = [Validators.required, Validators.pattern];
    let tempForm = _.cloneDeep(this._vendorForm.getForm());
    if(vendorType == 'Company'){
      tempForm.ein = [this.row.ein || '', validator];
      tempForm.ssn = [this.row.ssn || ''];
    } else {
      tempForm.ein = [this.row.ein || ''];
      tempForm.ssn = [this.row.ssn || '', validator];
    }
    if(!vendor){
      tempForm.type = [vendorType, [Validators.required]];
      let tempData = this._vendorForm.getData(this.vendorForm);
      this.vendorForm = this._fb.group(tempForm);
      this._vendorForm.updateForm(this.vendorForm, tempData);
    } else{
      this.vendorForm = this._fb.group(tempForm);
    }
  }

  isVendorCompany(form){
    let data = this._vendorForm.getData(form);
    if(data.type == 'Company'){
      return true;
    }
    return false;
  }

  editAddress:any;

  getVendorDetails(vendorID){
    let base=this;
    this.companyService.vendor(this.companyId,vendorID).subscribe(vendor => {
      if(vendor.addresses[0]){
        this.row = vendor;
        let countryName = vendor.addresses[0].country;
        this.editAddress=vendor.addresses[0];
        let country = _.find(PROVINCES.COUNTRIES, function(_country) {
          return _country.name == countryName;
        });
        setTimeout(function () {
          base.vendorCountryComboBox.setValue(country, 'name');
        },100);
      }
      let coa = _.find(this.chartOfAccounts, function(_coa) {
        return _coa.id == vendor.coa
      });
      if(!_.isEmpty(coa)){
        setTimeout(function(){
          base.coaComboBox.setValue(coa, 'name');
        });
      }
      vendor.has1099 = vendor.has1099 == 'true' || vendor.has1099 == true;
      this.setVendorType(vendor.type, vendor);
      this._vendorForm.updateForm(this.vendorForm, vendor);
    }, error => this.handleError(error));
  }
}
