/**
 * Created by seshu on 03-03-2016.
 */


import {Component, OnInit} from "@angular/core";
import {ToastService} from "qCommon/app/services/Toast.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Router, ActivatedRoute} from "@angular/router";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {LoginService} from "qCommon/app/services/Login.service";
import {LoginForm} from "../forms/Login.form";
import {ForgotPassword} from "../forms/ForgotPassword.form";
import {LoginModel} from "../models/Login.model";
import {Session} from "qCommon/app/services/Session";
import {UrlService} from "qCommon/app/services/UrlService";
import {PATH, TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {NumeralService} from "qCommon/app/services/Numeral.service";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'qount-login',
  templateUrl: '../views/login.html'
})

export class LogInComponent implements OnInit {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  success:any;
  error:any;
  status = null;
  message:string;
  showLoginPage: boolean = true;
  forgotPwdStatus: boolean = false;
  fpStatus: any;
  fpMessage: string;
  resetPasswordToken:string;
  resetPasswordHidden:boolean=true;
  routeSub:any;

  constructor(fb: FormBuilder, private _router: Router,  private switchBoard: SwitchBoard, private loginService: LoginService, private _loginForm: LoginForm, private loadingService:LoadingService,
              private _forgotPasswordForm: ForgotPassword, private _route:ActivatedRoute, private _toastService:ToastService, private companyService: CompaniesService,
            private numeralService: NumeralService) {
    this.routeSub = this._route.params.subscribe(params => {
      this.resetPasswordToken = params['resetPasswordToken'];
    });

    this.loginForm = fb.group(_loginForm.getForm());
    this.forgotPasswordForm = fb.group(_forgotPasswordForm.getForm());
  }

  submit($event) {
    this.loadingService.triggerLoadingEvent(true);
    $event && $event.preventDefault();
    let data = this._loginForm.getData(this.loginForm);
    data["username"] = data.id;
    this.loginService.login(<LoginModel>data)
        .subscribe(success  => {this.showMessage(true, success); }, error =>  this.showMessage(false, error));
  }

  showMessage(status, obj) {
    if(status) {
      Session.create(obj.user, obj.token);
      Session.setLockDate(obj.user['default_company']['lock_date']);
      Session.setTTL(obj['ttl']*1000);
      Session.setRefreshToken(obj['refreshToken']);
      this.refreshToken();
      if(obj.user.default_company&&obj.user.default_company.roles&&!obj.user.default_company.roles.includes('Vendor')){
        this.fetchCompanies(obj.user);
      }else {
        this.showLoginError()
      }
    } else {
      this.showLoginError(obj);
      this.loadingService.triggerLoadingEvent(false);
    }
  }

  refreshToken(){
    let base=this;
    let interval= setInterval(function(){
      let data={
       token:Session.getToken(),
       refreshToken:Session.getRefreshToken(),
       ttl:Number(Session.getTTL())/1000
     };
    base.loginService.refreshToken(data).subscribe(data  => {base.updateToken(data) }, error => {});
    }, 55*60*1000);
    Session.setTimer(interval);
  }



  updateToken(data){
    Session.removeToken();
    Session.setToken(data.token);
    Session.setRefreshToken(data.refreshToken);
    Session.setTTL(data.ttl);
  }

  showLoginError(obj?){
    this.status = {};
    this.status['error'] = true;
    this.message = obj?obj:'Username or password incorrect';
    this.loadingService.triggerLoadingEvent(false);
  }

  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
  }

  setComapnies(companies){
    let user:any = Session.getUser();
    if(companies.length > 0){
      let defaultCompany:any = user.default_company;
      if(!_.isEmpty(defaultCompany)){
        Session.setCurrentCompany(defaultCompany.id);
        Session.setCurrentCompanyName(defaultCompany.name);
        Session.setCurrentCompanyCurrency(defaultCompany.defaultCurrency);
        Session.setCompanyReportCurrency(defaultCompany.reportCurrency || "");
        if(defaultCompany.defaultCurrency){
          this.numeralService.switchLocale(defaultCompany.defaultCurrency);
        } else{
          this.numeralService.switchLocale("USD");
        }
        Session.setFiscalStartDate(defaultCompany.fiscalStartDate?defaultCompany.fiscalStartDate:"");
      }
    } else{
      if(user.isAdmin){
        this._toastService.pop(TOAST_TYPE.warning, "No companies added yet. Please add a company to start.");
        this._router.navigate(['addCompany']);
      } else{
        this._toastService.pop(TOAST_TYPE.warning, "No companies found. Please contact admin to create companies.");
      }
    }
    this.gotoDefaultPage();
  }

  fetchCompanies(user){
    let base=this;
    setTimeout(function(){
      base.companyService.companies().subscribe(companies => base.setComapnies(companies), error => base.handleError(error));
    },200);
  }

  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;

  newLogin() {
    this.active = false;
    setTimeout(()=> this.active=true, 0);
  }

  gotoDefaultPage() {
    let link ='dashboard';
    if(Session.get('user').tempPassword){
      link= 'activate';
    } else{
      let defaultCompany:any = Session.getUser().default_company;
      if(!_.isEmpty(defaultCompany) && (defaultCompany.roles.indexOf('Owner') != -1||defaultCompany.roles.indexOf('Yoda') != -1)){
        if(!defaultCompany.tcAccepted){
          link = 'termsAndConditions';
        }
      }
    }
    if(link == 'dashboard'){
      this.switchBoard.onLogin.next(Session.get('user'));
    }
    this._router.navigate([link]);
    this.loadingService.triggerLoadingEvent(false);
  }

  changePassword($event){
    $event && $event.preventDefault();
    let data = this._forgotPasswordForm.getData(this.forgotPasswordForm);
    data["activationLink"]= UrlService.getBaseUrl("ACTIVATION_LINK");
    data["username"] = data.id;
    this.loginService.forgotPassword(data).subscribe(success => this.handleForgotPassword(true, success),
        error => this.handleForgotPassword(false, error));
  }

  handleForgotPassword(status, obj){
    if(status) {
      this.forgotPwdStatus = true;
      this.fpStatus = {};
      this.fpStatus['success'] = true;
      this.fpMessage = "Password reset successful";
      this._toastService.pop(TOAST_TYPE.success, obj._body);
      this.showLoginPage = true;
      let link = ['Login'];
      this._router.navigate(link);
    } else {
      this.forgotPwdStatus = true;
      this.fpStatus = {};
      this.fpStatus['error'] = true;
      this.fpMessage = obj;
      this._toastService.pop(TOAST_TYPE.error, obj);
    }
  }

  checkForgotPasswordValidity(){
    if(!this.forgotPasswordForm.valid){
      return false;
    }
    return true;
  }

  checkValidity() {
    if(!this.loginForm.valid) {
      return false;
    }
    return true;
  }

  ngOnInit() {

  }

  resetPassword(){
    let resetPassword = jQuery("#resetPassword").val();
    let resetPasswordConfirmation = jQuery("#resetPasswordConfirmation").val();
    if(!resetPassword&&!resetPasswordConfirmation){
      this.forgotPwdStatus = true;
      this.fpStatus = {};
      this.fpStatus['error'] = true;
      this.fpMessage = 'please enter passwords';
    }else if(resetPassword!=resetPasswordConfirmation){
      this.forgotPwdStatus = true;
      this.fpStatus = {};
      this.fpStatus['error'] = true;
      this.fpMessage = 'passwords donot match';
    }else{
      let data={};
      data['password']=resetPassword;
      data['token']=this.resetPasswordToken;
      this.loginService.resetPassword(data).subscribe(success => this.handleForgotPassword(true, success),
        error => this.handleForgotPassword(false, error));
    }
  }

  ngOnDestroy(){
    this.routeSub.unsubscribe();
  }

}
