import {Component, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {CompanyUsers} from "qCommon/app/services/CompanyUsers.service";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'activate',
    templateUrl: '/app/views/changePassword.html'
})

export class ChangePasswordComponent {
    password:string;
    notValid:boolean=false;
    confirmPassword:string;
    constructor(private _router: Router, private _toastService: ToastService,
                private loadingService:LoadingService,private CompanyUsersService:CompanyUsers) {
    }

    ngOnDestroy(){
    }

     handleError(err){

    }
    submit($event){
        $event && $event.preventDefault();
        if(this.checkPasswordsMatch()){
            var data={
                "action":"change",
                "password":this.password
            };
            this.CompanyUsersService.updatePassword(data).subscribe(res => {
                if(res){
                    let defaultCompany:any = Session.getUser().default_company;
                    if(!_.isEmpty(defaultCompany) && defaultCompany.roles.indexOf('Owner') != -1){
                        if(defaultCompany.tcAccepted){
                            this._router.navigate(['']);
                        } else{
                            this._router.navigate(['termsAndConditions']);
                        }
                    } else{
                        this._router.navigate(['']);
                    }
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
