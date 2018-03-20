/**
 * Created by venkatkollikonda on 11/06/17.
 */
/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {LoadingService} from "qCommon/app/services/LoadingService";

declare var _:any;
declare var jQuery:any;
declare var moment:any;
declare let BroadcastChannel: any;

@Component({
    selector: 'current-company',
    templateUrl: '../views/currentCompany.html',
})

export class CurrentCompanyComponent{
    allCompanies:Array<any>;
    currentCompany:any = {};
    displayCurrency:string='USD';
    currentCompanyName:string = '';
    currentCompanyId:string;

    constructor(private _router:Router, private _route: ActivatedRoute, private toastService: ToastService, private switchBoard: SwitchBoard,
                private loadingService: LoadingService) {
        let base = this;
        this.loadingService.triggerLoadingEvent(true);
        this.currentCompanyId = Session.getCurrentCompany();
        this.currentCompanyName = Session.getCurrentCompanyName();
        this.switchBoard.onCompanyUpdate.subscribe(company =>{
            this.currentCompanyName = Session.getCurrentCompanyName();
            this.currentCompanyId = Session.getCurrentCompany();
        });
        this.switchBoard.onSwitchCompany.subscribe(company =>{
            this.currentCompanyName = Session.getCurrentCompanyName();
        });
        this.loadingService.triggerLoadingEvent(false);

        let ch2 = new BroadcastChannel('refresh-company');
        ch2.addEventListener('message', function (e) {
            base.currentCompanyName = Session.getCurrentCompanyName();
        });
    }

    switchCompany = function(){
        let link = ['/switchCompany'];
        this._router.navigate(link);
    }

}
