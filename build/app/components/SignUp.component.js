/**
 * Created by seshu on 03-03-2016.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var SignUp_service_1 = require("../services/SignUp.service");
var SignUp_form_1 = require("../forms/SignUp.form");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var SignUpComponent = (function () {
    function SignUpComponent(fb, signUpService, _signUpForm, _route, _toastService, _router) {
        this.signUpService = signUpService;
        this._signUpForm = _signUpForm;
        this._route = _route;
        this._toastService = _toastService;
        this._router = _router;
        this.type = "component";
        this.status = null;
        this.groupExits = false;
        this.emailExits = false;
        this.redirectedFromGroup = false;
        this.asCompany = false;
        // Reset the form with a new hero AND restore 'pristine' class state
        // by toggling 'active' flag which causes the form
        // to be removed/re-added in a tick via NgIf
        // TODO: Workaround until NgForm has a reset method (#6822)
        this.active = true;
        var signUpForm = _signUpForm.getForm();
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
    SignUpComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._signUpForm.getData(this.signUpForm);
        data.id = data.email;
        delete data.passwordConfirmation;
        data.activationLink = Qount_constants_1.PATH.ACTIVATION_LINK;
        this.signUpService.signUp(data)
            .subscribe(function (success) { return _this.showMessage(true, success); }, function (error) { return _this.showMessage(false, error); });
    };
    SignUpComponent.prototype.redirectToLogin = function ($event) {
        $event && $event.preventDefault();
        this._router.navigate(['/login']);
    };
    SignUpComponent.prototype.showMessage = function (status, obj) {
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.message = obj;
            this.newSignUp();
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, obj);
            this._router.navigate(['login']);
        }
        else {
            //this.status = {};
            //this.status['error'] = true;
            // this.message = obj;
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, obj);
        }
    };
    SignUpComponent.prototype.newSignUp = function () {
        var _this = this;
        this.active = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    SignUpComponent.prototype.checkValidity = function () {
        if (!this.signUpForm.valid) {
            return false;
        }
        return this.checkPasswordsMatch();
    };
    SignUpComponent.prototype.checkPasswordsMatch = function () {
        if (this.signUpForm.controls['password'].value === this.signUpForm.controls['passwordConfirmation'].value) {
            return true;
        }
        return false;
    };
    SignUpComponent.prototype.ngOnInit = function () {
    };
    return SignUpComponent;
}());
SignUpComponent = __decorate([
    core_1.Component({
        selector: 'qount-signup',
        templateUrl: '/app/views/signup.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, SignUp_service_1.SignUpService, SignUp_form_1.SignUpForm, router_1.ActivatedRoute,
        Toast_service_1.ToastService, router_1.Router])
], SignUpComponent);
exports.SignUpComponent = SignUpComponent;
