/**
 * Created by Nazia on 20-12-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoginService} from "qCommon/app/services/Login.service";
import {Router,ActivatedRoute} from "@angular/router";

declare var jQuery:any;
declare var _:any;


@Component({
    selector: 'reset-password',
    templateUrl: '../views/resetpassword.html'
})

export class ResetPasswordComponent {
    password:string;
    notValid:boolean=false;
    confirmPassword:string;
    routeSub:any;
    token:string;
    constructor(private _router: Router, private _toastService: ToastService,private _route:ActivatedRoute,
                private loginService: LoginService) {
        this.routeSub = this._route.params.subscribe(params => {
            this.token = params['token'];
        });
    }

    ngOnDestroy(){
    }

    handleError(err){

    }
    submit($event){
        $event && $event.preventDefault();
        if(this.checkPasswordsMatch()){
            let data={
                "action":"reset",
                "password":this.password,
                "token":this.token
            };
            this.loginService.resetPassword(data).subscribe(res => {
                if(res){
                    this._toastService.pop(TOAST_TYPE.error, "Password reset was successful");
                    this._router.navigate(['login']);
                }
            }, error => {
                this._toastService.pop(TOAST_TYPE.error, "Failed to reset password");
            });
        }
    }

    checkPasswordsMatch() {
        if(this.password === this.confirmPassword) {
            this.notValid=false;
            return true;
        }else {
            this.notValid=true;
            return false;
        }
    }
}
