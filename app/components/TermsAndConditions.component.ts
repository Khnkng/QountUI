import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {CompanyUsers} from "qCommon/app/services/CompanyUsers.service";

@Component({
    'selector': 'terms-conditions',
    'templateUrl': '/app/views/TermsAndConditions.html'
})

export class TermsAndConditionsComponent{
    constructor(private _router:Router, private switchBoard: SwitchBoard, private companyUsersService:CompanyUsers){
        console.log("Terms and conditions component initialized...");
    }

    accept(){
        this.switchBoard.onLogin.next(Session.get('user'));
        this.companyUsersService.acceptTerms(Session.getUser().default_company.id)
            .subscribe(resp => {
                this._router.navigate(['']);
            }, error => {

            });
    }

    decline(){
        Session.destroy();
        this.switchBoard.onLogOut.next({'loggedOut': true})
    }
}