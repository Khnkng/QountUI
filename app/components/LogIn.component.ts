/**
 * Created by seshu on 03-03-2016.
 */


import {Component, OnInit} from "@angular/core";
import {ToastService} from "../share/services/Toast.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Router, ActivatedRoute} from "@angular/router";
import {SwitchBoard} from "../share/services/SwitchBoard";
import {LoginService} from "../services/Login.service";
import {LoginForm} from "../forms/Login.form";
import {ForgotPassword} from "../forms/ForgotPassword.form";
import {LoginModel} from "../models/Login.model";
import {Session} from "../share/services/Session";
import {PATH, TOAST_TYPE} from "../share/constants/Qount.constants";


declare var jQuery:any;

@Component({
  selector: 'qount-login',
  templateUrl: '/app/views/login.html'
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

  constructor(fb: FormBuilder, private _router: Router,  private switchBoard: SwitchBoard, private loginService: LoginService, private _loginForm: LoginForm,
              private _forgotPasswordForm: ForgotPassword, private _route:ActivatedRoute, private _toastService:ToastService) {


    this.routeSub = this._route.params.subscribe(params => {
      this.resetPasswordToken = params['resetPasswordToken'];
    });

    this.loginForm = fb.group(_loginForm.getForm());
    this.forgotPasswordForm = fb.group(_forgotPasswordForm.getForm());
  }

  submit($event) {
    $event && $event.preventDefault();
    var data = this._loginForm.getData(this.loginForm);
    data["username"] = data.id;
    this.loginService.login(<LoginModel>data)
        .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
  }

  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      //reading user object
      Session.create(obj.user, obj.token);
      this.message = "logged in successfully.";
      this.newLogin();
      this.gotoDefaultPage();
    } else {
      this.status = {};
      this.status['error'] = true;
      this.message = obj;
    }
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
    this.switchBoard.onLogin.next(Session.get('user'));
    let link = [''];
    this._router.navigate(link);
  }

  changePassword($event){
    $event && $event.preventDefault();
    var data = this._forgotPasswordForm.getData(this.forgotPasswordForm);
    data["activationLink"]=PATH.ACTIVATION_LINK;
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
    var resetPassword = jQuery("#resetPassword").val();
    var resetPasswordConfirmation = jQuery("#resetPasswordConfirmation").val();
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
      var data={};
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
