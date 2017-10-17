/**
 * Created by seshu on 03-03-2016.
 */

import {Component, OnInit} from "@angular/core";
import {SignUpService} from "../services/SignUp.service";
import {SignUpForm} from "../forms/SignUp.form";
import {ToastService} from "qCommon/app/services/Toast.service";
import {FormGroup, FormBuilder} from "@angular/forms";
import {Router, ActivatedRoute} from "@angular/router";
import {PATH, TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {SignUpModel} from "../models/SignUp.model";
import {UrlService} from "qCommon/app/services/UrlService";

@Component({
  selector: 'qount-signup',
  templateUrl: '../views/signup.html'
})

export class SignUpComponent implements OnInit{

  type = "component";

  signUpForm: FormGroup;
  success:any;
  error:any;
  status = null;
  message:string;
  groupExits:boolean=false;
  emailExits:boolean=false;
  redirectedFromGroup:boolean=false;
  asCompany:boolean=false;

  constructor(fb: FormBuilder, private signUpService: SignUpService, private _signUpForm: SignUpForm, private _route:ActivatedRoute,
              private _toastService:ToastService,private _router: Router) {
    let signUpForm = _signUpForm.getForm();
    /*var group_name = this._routeParams.get('group_name')?decodeURIComponent(this._routeParams.get('group_name')):"";
    let token = this._routeParams.get('token')?decodeURIComponent(this._routeParams.get('token')):"";
    if(token){
      this.redirectedFromGroup=true;
    }
    signUpForm['group'][0]= group_name;
    if(group_name){
      this.groupExits=true;
    }
    var email = this._routeParams.get('email');
    signUpForm['email'][0]= email;
    if(email){
      this.emailExits=true;
    }*/
    this.signUpForm = fb.group(signUpForm);
    //this.signUpForm.controls['firstName'].value=this._routeParams.get('first_name');
  }

  submit($event) {
    $event && $event.preventDefault();
    var data = this._signUpForm.getData(this.signUpForm);
    data.id = data.email;
    delete data.passwordConfirmation;
    data.activationLink= UrlService.getBaseUrl("ACTIVATION_LINK");
    this.signUpService.signUp(<SignUpModel>data)
      .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
  }

  redirectToLogin($event){
    $event && $event.preventDefault();
    this._router.navigate(['/login']);
  }

  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.message = obj;
      this.newSignUp();
      this._toastService.pop(TOAST_TYPE.success,obj);
      this._router.navigate(['login']);
    } else {
      //this.status = {};
      //this.status['error'] = true;
     // this.message = obj;
      this._toastService.pop(TOAST_TYPE.error, obj);
    }
  }


  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;

  newSignUp() {
    this.active = false;
    setTimeout(()=> this.active=true, 0);
  }

  checkValidity() {
    if(!this.signUpForm.valid) {
      return false;
    }
    return this.checkPasswordsMatch();
  }

  checkPasswordsMatch() {
    if(this.signUpForm.controls['password'].value === this.signUpForm.controls['passwordConfirmation'].value) {
      return true;
    }
    return false;
  }

  ngOnInit() {

  }
}
