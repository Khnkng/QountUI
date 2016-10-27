/**
 * Created by seshu on 19-07-2016.
 */

import {CompaniesService} from "../services/Companies.service";
import {FormGroup, FormBuilder} from "@angular/forms";
import {Component, ViewChild} from "@angular/core";
import {FTable} from "../directives/footable.directive";
import {ComboBox} from "../directives/comboBox.directive";
import {PROVINCES} from "../constants/Provinces.constants";
import {TOAST_TYPE} from "../constants/Qount.constants";
import {ToastService} from "../services/Toast.service";
import {YEARS, MONTHS} from "../constants/Date.constants";
import {CURRENCY} from "../constants/Currency.constants";
import {ActivatedRoute} from "@angular/router";
import {VendorForm} from "../../forms/Vendor.form";
import {CompanyForm} from "../forms/Company.Form";
import {VendorModel} from "../../models/Vendor.model";
import {CompanyModel} from "../../models/Company.model";
import {CreditCardType} from "../models/CreditCardType";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'company',
  templateUrl: '/app/views/company.html'
})

export class CompanyComponent {
  type:string = "component";
  companies:Array<any>;
  vendors:Array<any>;
  companyId:string;
  company:any = {};
  @ViewChild('createVendor') createVendor;
  @ViewChild('countryComboBoxDir') countryComboBox:ComboBox;
  @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox:ComboBox;
  @ViewChild('stateComboBoxDir') stateComboBox:ComboBox;
  @ViewChild('vendorStateComboBoxDir') vendorStateComboBox:ComboBox;
  vendorForm: FormGroup;
  companyForm: FormGroup;
  status:any;
  message:string;
  hasVendorsList:boolean;
  tableData:any = {};
  tableOptions:any = {search:false};
  editMode:boolean = false;
  @ViewChild('fooTableDir') fooTableDir:FTable;
  row:any;
  companyUsers:Array<string> = [];
  countries:Array<any> = PROVINCES.COUNTRIES;
  states:Array<any> = [];
  days:Array<any>=MONTHS;
  years:Array<any>=YEARS;
  name:string;
  bankName:string;
  accountNumber:string;
  routingNumber:string;
  accountHolderName:string;
  paymentType:string;
  month:string;
  year:string;
  cvv:string;
  nickName:string;
  routeSub:any;
  dwollaFullAcountUrl:string = "https://uat.dwolla.com/oauth/v2/authenticate?client_id=h18ozPUBDMv5vCkEDpxaxmKRmS4GeOGeOe8E5yS4eSMalHlBbe&response_type=code&redirect_uri=http://bigpay-ui.e0fee844.svc.dockerapp.io/oAuth&scope=AccountInfoFull|Transactions|Send|Funding|Scheduled&verified_account=true";
  currencies=CURRENCY;
  constructor(private _fb: FormBuilder, private _route:ActivatedRoute, private companyService: CompaniesService, private _vendorForm:VendorForm, private _companyForm: CompanyForm,private _toastService: ToastService) {
    this.routeSub = this._route.params.subscribe(params => {
      this.companyId = params['id'];
    });
    this.companyForm = this._fb.group(_companyForm.getForm());
    this.vendorForm = this._fb.group(_vendorForm.getForm());
    if(this.companyId) {
      this.companyService.company(this.companyId)
        .subscribe(company  => {
          this.company = company
          this._companyForm.updateForm(this.companyForm, this.company);

          let invitedUserEmailsControl:any = this.companyForm.controls['invitedUserEmails'];
          invitedUserEmailsControl.patchValue(this.company.invitedUserEmails);
          let countryName = this.company.country;
          let country = _.find(PROVINCES.COUNTRIES, function(_country) {
            return _country.name == countryName;
          });
          /*let stateName = this.company.state;
          let state = _.find(PROVINCES.COUNTRY_PROVINCES, function(_state) {
            return _state.name == stateName && _state.country == country.code;
          });
           this.stateComboBox.setValue(state, 'name');*/
          this.countryComboBox.setValue(country, 'name');
          this.bankInfo=_.filter(company.paymentInfo, ['paymentType', 'bank']);
          this.creditCardInfo=_.filter(company.paymentInfo, ['paymentType', 'creditCard']);
          let itemCodesControl:any = this.companyForm.controls['itemCodes'];
          itemCodesControl.patchValue(company.itemCodes?company.itemCodes:[]);
          let expenseCodesControl:any = this.companyForm.controls['expenseCodes'];
          expenseCodesControl.patchValue(company.expenseCodes?company.expenseCodes:[]);
        }, error =>  this.handleError(error));
      this.companyService.vendors(this.companyId)
        .subscribe(vendors  => this.buildTableData(vendors), error =>  this.handleError(error));
    }
  }
  submit($event) {
    $event && $event.preventDefault();
    var data = this._vendorForm.getData(this.vendorForm);
    if(this.editMode) {
      data.id = this.row.id;
      this.companyService.updateVendor(<VendorModel>data, this.companyId)
        .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
      jQuery(this.createVendor.nativeElement).foundation('close');
    } else {
      this.companyService.addVendor(<VendorModel>data, this.companyId)
        .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
    }
  }

  companySubmit($event) {
    $event && $event.preventDefault();
    var data = this._companyForm.getData(this.companyForm);
    data.id = this.company.id;
    data.paymentInfo=this.bankInfo.concat(this.creditCardInfo);
    data.group='payments';
    this.companyService.updateCompany(<CompanyModel>this.cleanData(data))
      .subscribe(success  => this.showCompanyMessage(true, success), error =>  this.showCompanyMessage(false, error));
  }





  showProvince(country:any) {
    this.states =  _.filter(PROVINCES.COUNTRY_PROVINCES, function(province:any) {
      return province.country == country.code;
    });
    let countryControl:any = this.companyForm.controls['country'];
    countryControl.patchValue(country.name);
    /*let stateControl:any = this.companyForm.controls['state'];
    stateControl.updateValue('');
    this.stateComboBox.clearValue();*/
  }

  selectState(state:any) {
    let stateControl:any = this.companyForm.controls['state'];
    stateControl.patchValue(state.name);
  }

  showVendorProvince(country:any) {
    this.states =  _.filter(PROVINCES.COUNTRY_PROVINCES, function(province:any) {
      return province.country == country.code;
    });
    let countryControl:any = this.vendorForm.controls['country'];
    countryControl.patchValue(country.name);
    /*let stateControl:any = this.vendorForm.controls['state'];
    stateControl.updateValue('');
    this.vendorStateComboBox.clearValue();*/
  }

  selectVendorState(state:any) {
    let stateControl:any = this.vendorForm.controls['state'];
    stateControl.patchValue(state.name);
  }

  showCompanyMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.message = "Company updated successfully.";
      this.newForm1();
      this._toastService.pop(TOAST_TYPE.success, "Company updated successfully");
    } else {
      this.status = {};
      this.status['error'] = true;
      this.message = obj;
      this._toastService.pop(TOAST_TYPE.error, "Failed to update the company");
    }
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
      this._toastService.pop(TOAST_TYPE.error, "Failed to update the company");
      this.message = obj;
    }
  }

  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;

  newForm() {
    this.active = false;
    setTimeout(()=> this.active=true, 0);
  }
  active1:boolean=true;
  newForm1(){
    this.active1 = false;
    setTimeout(()=> this.active1=true, 0);
  }

  showCreateVendor() {
    this.editMode = false;
    this.vendorForm = this._fb.group(this._vendorForm.getForm());
    this.newForm1();
    jQuery(this.createVendor.nativeElement).foundation('open');
  }

  showEditVendor(row:any) {
    this.editMode = true;
    jQuery(this.createVendor.nativeElement).foundation('open');
    this.row = row;
    this.newForm1();
    //let rowValues = row.val();
    //delete rowValues['editing'];
    row.has1099=row.has1099 == 'true';
    this._vendorForm.updateForm(this.vendorForm, row);
    let countryName = row.country;
    let country = _.find(PROVINCES.COUNTRIES, function(_country) {
      return _country.name == countryName;
    });
    let stateName = row.state;
    /*let state = _.find(PROVINCES.COUNTRY_PROVINCES, function(_state) {
      return _state.name == stateName && _state.country == country.code;
    });
    this.vendorStateComboBox.setValue(state, 'name');*/
    var base=this;
    setTimeout(function () {
      base.vendorCountryComboBox.setValue(country, 'name');
    },100);
  }


  buildTableData(vendors) {
    this.vendors = vendors;
    this.tableData.rows = [];
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "ein", "title": "Ein"},
      {"name": "email", "title": "Email"},
      {"name": "address", "title": "Address","visible": false},
      {"name": "phoneNumber", "title": "Phone Number"},
      {"name": "country", "title": "Country","visible": false},
      {"name": "state", "title": "State","visible": false},
      {"name": "city", "title": "City","visible": false},
      {"name": "zipcode", "title": "Zip code","visible": false},
      {"name": "id", "title": "ID","visible": false},
      {"name": "has1099", "title": "1099","visible": false},
      {"name": "paymentMethod", "title": "Payment Method","visible": false},
      {"name": "accountNumber", "title": "Account Number","visible": false},
      {"name": "routingNumber", "title": "RoutingNumber","visible": false},
      {"name": "creditCardNumber", "title": "Credit Card Number","visible": false},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    let base = this;
    this.vendors.forEach(function(company) {
      let row:any = {};
      for(let key in base.vendors[0]) {
        row[key] = company[key];
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      }
      base.tableData.rows.push(row);
    });
    this.hasVendorsList = true;
  }

  setPaymentType($event){
    this.paymentType = $event.target.value;
  }

  handleAction(event:any) {
    let action = event.action;
    delete event.action;
    if(action == 'edit') {
        this.showEditVendor(event);
    } else if(action == 'delete'){
        this.removeVendor(event);
    }
  }

  removeVendor(row:any) {
    let vendor:VendorModel = row;
    this.companyService.removeVendor(vendor.id, this.companyId)
      .subscribe(success  => {
        this._toastService.pop(TOAST_TYPE.success, "Vendor deleted successfully");
        this.companyService.vendors(this.companyId)
          .subscribe(vendors  => this.buildTableData(vendors), error =>  this.handleError(error));
      }, error =>  this.handleError(error));
    _.remove(this.vendors, function (_vendor) {
      return vendor.id == _vendor.id;
    });
  }

  handleError(error) {

  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  creditCardInfo:Array<any>=[];
  bankInfo:Array<any>=[];
  creditCardHolderName:string;
  isValidCreditCard:boolean=true;
  addBankInfo(isEdit,paymentType){
    let info:any = {};
    if(paymentType=="bank"){
      info.name = this.accountHolderName;
      info.bankName = this.bankName;
      info.accountNumber = this.accountNumber;
      info.routingNumber = this.routingNumber;
      info.paymentType=this.paymentType;
      if(!isEdit&&this.accountHolderName&&this.bankName&&this.accountNumber&&this.routingNumber)this.bankInfo.push(info);
      else if(isEdit&&this.accountHolderName&&this.bankName&&this.accountNumber&&this.routingNumber)
        this.bankInfo.splice(this.index,1,info);
    }else if (paymentType=="creditCard"){
      info.name = this.creditCardHolderName;
      info.type = this.type;
      info.number = this.accountNumber;
      info.cvv = this.cvv;
      info.paymentType=this.paymentType;
      info.nickName=this.nickName;
      info.expiryDate=this.month+"/"+this.year;
      if(!isEdit&&this.creditCardHolderName&&this.accountNumber&&this.cvv&&this.month&&this.year){
        let res=new CreditCardType().validateCreditCard(this.accountNumber,this.cvv);
        if(res.valid){
          info.type = res.type;
          this.creditCardInfo.push(info);
          this.isValidCreditCard=true;
          this.clearBankInfo();
        }else {
          this.isValidCreditCard=false;
        }
      }
      else if(isEdit&&this.creditCardHolderName&&this.accountNumber&&this.cvv&&this.month&&this.year){
        let res=new CreditCardType().validateCreditCard(this.accountNumber,this.cvv);
        if(res.valid){
          info.type = res.type;
          this.creditCardInfo.splice(this.index,1,info);
          this.isValidCreditCard=true;
          this.clearBankInfo();
        }else {
          this.isValidCreditCard=false;
        }
      }
    }

  }


  removeBankInfo(index,paymentType) {
    if(paymentType=="bank"){
      this.bankInfo.splice(index, 1);
    }else{
      this.creditCardInfo.splice(index, 1);
    }

  }
  index:any;
  number:any;
  editBankInfo(bankInfo:any,index) {
    this.index=index;
    if(bankInfo.paymentType=='bank'){
      this.accountHolderName = bankInfo.name;
      this.bankName = bankInfo.bankName;
      this.accountNumber = bankInfo.accountNumber;
      this.routingNumber = bankInfo.routingNumber;
    }else{
      this.creditCardHolderName = bankInfo.name;
      this.type = bankInfo.type;
      this.accountNumber = bankInfo.number;
      this.cvv = bankInfo.cvv;
      this.paymentType=bankInfo.paymentType;
      this.nickName=bankInfo.nickName;
      this.month=bankInfo.expiryDate.split("/")[0];
      this.year=bankInfo.expiryDate.split("/")[1];
    }

  }

  clearBankInfo(){
    this.accountHolderName=null;
    this.bankName = null;
    this.accountNumber = null;
    this.routingNumber = null;
    this.nickName=null;
    this.month=null;
    this.year=null;
    this.type=null;
    this.cvv=null;
    this.creditCardHolderName=null;
  }

  cleanData(data){
    delete data.accountNumber
    delete data.routingNumber
    delete data.creditCardNumber
    delete data.user
    delete data.bankName
    delete data.cardHolderName
    delete data.accountHolderName
    delete data.type
    delete data.paymentType
    delete data.month
    delete data.year
    delete data.cvv
    delete data.expityDate
    delete data.nickName
    delete data.creditCardHolderName
    return data;
  }

  openDwollaWidget() {
    location.assign(this.dwollaFullAcountUrl)
  }

}
