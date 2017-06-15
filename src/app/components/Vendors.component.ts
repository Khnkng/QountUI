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
import {CompanyUsers} from "qCommon/app/services/CompanyUsers.service";
import {UsersModel} from "../models/Users.model";
import {pageTitleService} from "qCommon/app/services/PageTitle";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'vendors',
  templateUrl: '../views/vendors.html'
})

export class VendorComponent {
  tableData:any = {};
  tableOptions:any = {};
  status:any;
  vendorId:any;
  vendors:Array<any>;
  confirmSubscription:any;
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
  showMailFlyout:boolean = false;
  vendorTypes:any = {
    company : "Business",
    individual: "Individual"
  };
  mailID:string;
  showFirstStep:boolean = true;
  showSecondStep:boolean = false;

  constructor(private _fb: FormBuilder, private companyService: CompaniesService, private _vendorForm:VendorForm,
              private _router: Router, private loadingService:LoadingService,
              private _toastService: ToastService, private switchBoard: SwitchBoard,private coaService: ChartOfAccountsService,
              private usersService: CompanyUsers,private titleService:pageTitleService) {
    this.titleService.setPageTitle("Vendors");
    this.vendorForm = this._fb.group(_vendorForm.getForm());
    this.companyId = Session.getCurrentCompany(); ;
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteVendor(toast));
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
      }, error => this.handleError(error));
    }, error => this.handleError(error));
    this.coaService.chartOfAccounts(this.companyId)
        .subscribe(chartOfAccounts => {
          this.chartOfAccounts=chartOfAccounts?_.filter(chartOfAccounts, {'type': 'accountsPayable'}):[];
          _.sortBy(this.chartOfAccounts, ['number', 'name']);
        }, error=> this.handleError(error));
  }
  ngOnDestroy(){
    this.confirmSubscription.unsubscribe();
    jQuery('.ui-autocomplete').remove();
    jQuery('#invite-vendor').remove();
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
      {"name": "accountNumber", "title": "Reference Number","visible": false},
      {"name": "accountNumbers", "title": "Reference Numbers","visible": false},
      {"name": "routingNumber", "title": "RoutingNumber","visible": false},
      {"name": "coa", "title": "COA","visible": false},
      {"name": "name_on_bank_account", "title": "name on bank account","visible": false},
      {"name": "bank_account_type", "title": "bank account type","visible": false},
      {"name": "bank_account_holder_type", "title": "accountholder type","visible": false},
      {"name": "bank_account_number", "title": "bank account number","visible": false},
      {"name": "bank_account_routing_number", "title": "account routing number","visible": false},
      {"name": "contact_first_name", "title": "First Name","visible": false},
      {"name": "contact_last_name", "title": "Last Name","visible": false},
      {"name": "creditCardNumber", "title": "Credit Card Number","visible": false},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    let base = this;
    this.vendors.forEach(function(vendor) {
      let row:any = {};
      for(let key in base.vendors[0]) {
        row[key] = vendor[key];
        if(key == 'type'){
          if(vendor[key] == base.vendorTypes.individual){
            row['einssn'] = vendor['ssn'];
          } else if(vendor[key] == base.vendorTypes.company){
            row['einssn'] = vendor['ein'];
          }
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      }
      if(vendor.addresses.length > 0){
        row['phoneNumber'] = vendor.addresses[0].phone_number;
      }
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasVendorsList = true;
    }, 0)
    this.loadingService.triggerLoadingEvent(false);
  }

  showCreateVendor() {
      this.titleService.setPageTitle("CREATE VENDOR");
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
      this.vendorDelete($event);
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
    let data = this._vendorForm.getData(this.vendorForm);
    if(coa && coa.id){
      data.coa = coa.id;
    }else if(!coa||coa=='--None--'){
      data.coa='--None--';
    }
    this._vendorForm.updateForm(this.vendorForm, data);
  }
deleteVendor(toast){
  this.loadingService.triggerLoadingEvent(true);
  this.companyService.removeVendor(this.vendorId, this.companyId)
      .subscribe(success  => {
        this.companyService.vendors(this.companyId)
            .subscribe(vendors  => {
              this.buildTableData(vendors);
              this._toastService.pop(TOAST_TYPE.success, "Vendor deleted successfully");
            }, error =>  this.handleError1(error));
      }, error =>  this.handleError(error));

}
  handleError1(error){
    this.loadingService.triggerLoadingEvent(false);
  }
  vendorDelete(row:any) {
    let vendor:VendorModel = row;
    this.vendorId=row.id;
    this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
  }



  active1:boolean=true;
  newForm1(){
    this.active1 = false;
    setTimeout(()=> this.active1=true, 0);
  }

  showEditVendor(row:any) {
      this.titleService.setPageTitle("UPDATE VENDOR");
    this.showFlyout = true;
    this.editMode = true;
    this.vendorForm = this._fb.group(this._vendorForm.getForm());
    this.getVendorDetails(row.id);
  }

  nextStep($event) {
    $event && $event.preventDefault();
    let data = this._vendorForm.getData(this.vendorForm);
    let addressData = this.addressDir.getData();
    addressData.country=data.country;
    data.addresses=[addressData];

    if(data.coa=='--None--'||data.coa==''){
      this._toastService.pop(TOAST_TYPE.error, "Please select COA");
      return;
    }if(addressData.state=='--None--'||addressData.state==''){
      this._toastService.pop(TOAST_TYPE.error, "Please select state");
      return;
    }
    this.showFirstStep = false;
    this.showSecondStep = true;
  }

  submit($event) {
    $event && $event.preventDefault();
    this.companyId = Session.getCurrentCompany();
    let data = this._vendorForm.getData(this.vendorForm);
    let addressData = this.addressDir.getData();
    addressData.country=data.country;
    data.addresses=[addressData];
    this.loadingService.triggerLoadingEvent(true);
    if(this.editMode) {
      data.id = this.row.id;
      this.companyService.updateVendor(<VendorModel>data, this.companyId)
          .subscribe(success  => {
            this.showMessage(true, success);
           this.hideFlyout();
          }, error =>  this.showMessage(false, error));
    } else {
      this.companyService.addVendor(<VendorModel>data, this.companyId)
          .subscribe(success  => {
            this.showMessage(true, success);
            this.hideFlyout();
          }, error =>  this.showMessage(false, error));
    }
  }

  isValid(vendorForm){
    return vendorForm.valid;
  }

  hideFlyout(){
    this.titleService.setPageTitle("Vendors");
    this.row = {};
    this.showFlyout = !this.showFlyout;
    this.showFirstStep = true;
    this.showSecondStep = false;
  }

  hideSecondStep(){
    this.showFirstStep = true;
    this.showSecondStep = false;
  }

  hideMailFlyout(){
    this.showMailFlyout = !this.showMailFlyout;
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
      this.loadingService.triggerLoadingEvent(false);
      this.showFirstStep = true;
      this.showSecondStep = false;
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
    this.loadingService.triggerLoadingEvent(false);
    this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
  }

  setVendorType(vendorType, vendor?){
    let validator = [Validators.required, Validators.pattern];
    let tempForm = _.cloneDeep(this._vendorForm.getForm());
    let ein = this.row? this.row.ein : '';
    let ssn = this.row? this.row.ssn : '';
    vendorType=vendorType?vendorType:'Business';
    if(vendorType == this.vendorTypes.company){
      tempForm.ein = [ein || '', validator];
      tempForm.ssn = [ssn || ''];
    } else {
      tempForm.ein = [ein || ''];
      tempForm.ssn = [ssn || '', validator];
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
    if(data.type == this.vendorTypes.company){
      return true;
    }
    return false;
  }

  editAddress:any;

  getAccountNumbers(){
    let data = this._vendorForm.getData(this.vendorForm);
    return data.accountNumbers || [];
  }

  getVendorDetails(vendorID){
    let base=this;
    this.loadingService.triggerLoadingEvent(true);
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
      let accountNumbersControl:any = this.vendorForm.controls['accountNumbers'];
      accountNumbersControl.patchValue(vendor.accountNumbers);
      this._vendorForm.updateForm(this.vendorForm, vendor);
      setTimeout(function(){
        base.loadingService.triggerLoadingEvent(false);
      },500);
    }, error => this.handleError(error));
  }

  inviteVendor(){
    this.titleService.setPageTitle("INVITE VENDOR");
    this.showMailFlyout = true;
    this.mailID = '';
    //jQuery('#invite-vendor').foundation('open');
  }


  closeVendor(){
    jQuery('#invite-vendor').foundation('close');
  }

  checkValidation(){
    if(this.mailID)
        return true;
    return false;
  }

  saveInvitedVendor(){
    this.loadingService.triggerLoadingEvent(true);
    let userObj={
      id:this.mailID,
      roleID:'Vendor',
      email:this.mailID
    };
    this.usersService.addUser(<UsersModel>userObj, this.companyId)
        .subscribe(success  => {
          this.loadingService.triggerLoadingEvent(false);
          this._toastService.pop(TOAST_TYPE.success, "vendor invited successfully.");
          this.mailID=null;
          this.showMailFlyout = false;
        }, error =>  {
          this.loadingService.triggerLoadingEvent(false);
          this._toastService.pop(TOAST_TYPE.error, "failed to invite vendor.");
          this.showMailFlyout = false;
        });
  }

  gotoFirstStep(){
    this.showFirstStep = true;
    this.showSecondStep = false;
  }
}
