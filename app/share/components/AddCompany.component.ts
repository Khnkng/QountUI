/**
 * Created by seshu on 18-07-2016.
 */
import {FormGroup, FormBuilder} from "@angular/forms";
import {Component, ViewChild} from "@angular/core";
import {CompaniesService} from "../services/Companies.service";
import {PROVINCES} from "../constants/Provinces.constants";
import {ComboBox} from "../directives/comboBox.directive";
import {MONTHS, YEARS} from "../constants/Date.constants";
import {TOAST_TYPE} from "../constants/Qount.constants";
import {ToastService} from "../services/Toast.service";
import {Session} from "../services/Session";
import {CURRENCY} from "../constants/Currency.constants";
import {Router, ActivatedRoute} from "@angular/router";
import {CompanyForm} from "../forms/Company.Form";
import {CompanyModel} from "../../models/Company.model";
import {CreditCardType} from "../models/CreditCardType";

declare var _:any;
declare var jQuery:any;

@Component({
  selector: 'addCompany',
  templateUrl: '/app/views/addCompany.html'
})

export class AddCompanyComponent {
  companyForm: FormGroup;
  //users:Array<string> = [];
  status:any;
  message:string;
  countries:Array<any> = PROVINCES.COUNTRIES;
  states:Array<any> = [];
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
  paymentInfo:Array<any>=[];
  @ViewChild('countryComboBoxDir') countryComboBox:ComboBox;
  @ViewChild('stateComboBoxDir') stateComboBox:ComboBox;
  days:Array<any>=MONTHS;
  years:Array<any>=YEARS;
  //itemCodes:Array<string> = [];
  //expenseCodes:Array<string> = [];
  hasCompanyInfo:boolean = false;
  dwollaFullAcountUrl:string = "https://uat.dwolla.com/oauth/v2/authenticate?client_id=h18ozPUBDMv5vCkEDpxaxmKRmS4GeOGeOe8E5yS4eSMalHlBbe&response_type=code&redirect_uri=http://bigpay-ui.e0fee844.svc.dockerapp.io/oAuth&scope=AccountInfoFull|Transactions|Send|Funding|Scheduled&verified_account=true";
  currencies=CURRENCY;
  companyDataSaved:boolean = false;
  list:any = [];
  existingCompanies:any = [];
  selectedCompany:any;
  defaultExpenseCodes= ['Shipping & Frieght', 'Taxes'];
  dialog:any;
  savedCompany:any;
  type:any;

  constructor(private _fb: FormBuilder, private _router: Router, private _companyForm: CompanyForm, private _route:ActivatedRoute, private companyService: CompaniesService,private _toastService: ToastService) {
    this.companyForm = this._fb.group(_companyForm.getForm());

    this.companyService.companies()
      .subscribe(companies => {
        this.existingCompanies = companies;
      }, error => this.handleError(error));

    let expenseCodesControl:any = this.companyForm.controls['expenseCodes'];
    expenseCodesControl.patchValue(this.defaultExpenseCodes);

    if(Session.get("pendingCompany")) {
      this.hasCompanyInfo = true;
      Session.deleteKey("pendingCompany");
    }
  }

  importCodes(){
    console.log("sdfsdf");
  }

  handleError(error){

  }

  submit($event) {
    $event && $event.preventDefault();
    var data = this._companyForm.getData(this.companyForm);
    debugger;
    data.paymentInfo=this.bankInfo.concat(this.creditCardInfo);
    data.group='payments';
    Session.put("pendingCompany", data);
    this.companyService.add(<CompanyModel>this.cleanData(data))
      .subscribe(companyObj  => this.handleResponse(companyObj), error =>  this.showMessage(false, error));
  }

  handleResponse(companyObj){
    this.savedCompany = companyObj;
    this.showMessage(true, companyObj);
  }

  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.message = "Company created successfully.";
      this.newForm();
      //this._toastService.pop(TOAST_TYPE.success, "Company updated successfully");
      this.hasCompanyInfo = true;
      this.companyDataSaved = true;
    } else {
      this.status = {};
      this.status['error'] = true;
      this.message = obj;
      this._toastService.pop(TOAST_TYPE.error, "Failed to update the company");
    }
  }

  /*removeUser(index) {
    this.users.splice(index, 1);
  }*/

  /*removeItem(index,ev,type) {
    if(type=='itemCode'){
      this.itemCodes.splice(index, 1);
    }else {
      this.expenseCodes.splice(index, 1);
    }
  }*/

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

  /*addUser($event) {
    $event && $event.preventDefault() && $event.stopPropagation();
    let user = this.companyForm.controls['user'].value;
    if(this.validateEmail(user)) {
      _.remove(this.users, function (usr) {
        return usr == user;
      });
      this.users.push(user);
      let userControl:any = this.companyForm.controls['user'];
      userControl.updateValue("");
    }
    return false;
  }
*/
  /*addItem($event,type) {
    $event && $event.preventDefault() && $event.stopPropagation();
    let val = this.companyForm.controls[type].value;
    if(val) {
      if(type=='itemCode'){
        _.remove(this.itemCodes, function (usr) {
          return usr == val;
        });
        this.itemCodes.push(val);
      }else{
        _.remove(this.expenseCodes, function (usr) {
          return usr == val;
        });
        this.expenseCodes.push(val);
      }
      let userControl:any = this.companyForm.controls[type];
      userControl.updateValue("");
    }
    return false;
  }*/

  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;

  newForm() {
    this.active = false;
    setTimeout(()=> this.active=true, 0);
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

  ngAfterViewInit(){
    let base = this;
    this.dialog = jQuery("#importExpenseModal").dialog({
      autoOpen: false,
      width: '50%',
      modal: true,
      closeText: ""
    });
    jQuery(".ui-dialog-titlebar").hide();
  }

  closeModal($event){
    $event && $event.preventDefault();
    this.dialog.dialog('close');
  }

  toggleCompany(companyId){
    this.selectedCompany = _.find(this.existingCompanies, {'id': companyId});
  }

  showImportModal(){
    this.dialog.dialog('open');
  }

  importExpenseCodes(){
    if(this.selectedCompany){
      let expenseCodesControl:any = this.companyForm.controls['expenseCodes'];
      expenseCodesControl.patchValue(this.selectedCompany.expenseCodes);
    }
    this.dialog.dialog('close');
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

  setPaymentType($event){
    this.paymentType = $event.target.value;
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
    delete data.accountNumber;
    delete data.routingNumber;
    delete data.creditCardNumber;
    delete data.user;
    delete data.bankName;
    delete data.cardHolderName;
    delete data.accountHolderName;
    delete data.type;
    delete data.paymentType;
    delete data.month;
    delete data.year;
    delete data.cvv;
    delete data.expityDate;
    delete data.nickName;
    delete data.creditCardHolderName;
    return data;
  }

  openDwollaWidget() {
    location.assign(this.dwollaFullAcountUrl)
  }

  savePaymentInfo($event) {
    $event && $event.preventDefault();
    console.log(this.savedCompany.id); // Use this company id while invoking service to save payment information
    this._toastService.pop(TOAST_TYPE.success, "Company saved successfully");
    Session.deleteKey("pendingCompany");
    let link = ['Dashboard', {tabId: 0}];
    this._router.navigate(link);
  }


}

