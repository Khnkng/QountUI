/**
 * Created by Nazia on 20-12-2016.
 */
import {Component, ViewChild} from "@angular/core";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {CompanyUsers} from "qCommon/app/services/CompanyUsers.service";
import {Router,ActivatedRoute} from "@angular/router";

declare var jQuery:any;
declare var _:any;


@Component({
    selector: 'activate',
    templateUrl: '/app/views/changePassword.html'
})

export class ResetPasswordComponent {
    password:string;
    notValid:boolean=false;
    confirmPassword:string;
    routeSub:any;
    token:string;
    constructor(private _router: Router, private _toastService: ToastService,private _route:ActivatedRoute,
                private loadingService:LoadingService,private CompanyUsersService:CompanyUsers) {
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
            var data={
                "action":"reset",
                "password":this.password,
                "token":this.token
            };
            this.CompanyUsersService.updatePassword(data).subscribe(res => {
                if(res){
                    this._router.navigate(['login']);
                }
            }, error => {
                this._toastService.pop(TOAST_TYPE.error, "Failed to update password");
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
