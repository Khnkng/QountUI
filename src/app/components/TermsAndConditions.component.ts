import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {CompanyUsers} from "qCommon/app/services/CompanyUsers.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";

@Component({
    'selector': 'terms-conditions',
    'templateUrl': '../views/TermsAndConditions.html'
})

export class TermsAndConditionsComponent{
    constructor(private _router:Router, private switchBoard: SwitchBoard, private companyUsersService:CompanyUsers,
        private toastService: ToastService){
        console.log("Terms and conditions component initialized...");
    }

    accept(){
        this.companyUsersService.acceptTerms(Session.getUser().default_company.id)
            .subscribe(resp => {
                this.switchBoard.onLogin.next(Session.get('user'));
                this._router.navigate(['']);
            }, error => {
                Session.destroy();
                let message = error.message || "Failed to accept Terms And Conditions.";
                this.toastService.pop(TOAST_TYPE.error, message);
                this.switchBoard.onLogOut.next({'loggedOut': true})
            });
        return false;
    }

    decline(){
        Session.destroy();
        this.switchBoard.onLogOut.next({'loggedOut': true})
    }
}
