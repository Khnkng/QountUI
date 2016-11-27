/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {JournalEntriesService} from "qCommon/app/services/JournalEntries.service";

declare var _:any;
declare var jQuery:any;
declare var moment:any;

@Component({
    selector: 'switch-company',
    templateUrl: '/app/views/switchCompany.html',
})

export class SwitchCompanyComponent{

    allCompanies:Array<any>;
    currentCompany:any;

    constructor(private _router:Router, private _route: ActivatedRoute, private toastService: ToastService) {
        let companyId = Session.getCurrentCompany();
        this.allCompanies = Session.getCompanies();
        if(companyId){
            this.currentCompany = _.find(this.allCompanies, {id: companyId});
        } else if(this.allCompanies.length> 0){
            this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
        }
    }

    ngOnInit() {

    }

    ngAfterViewInit() {

    }

    ngOnDestroy(){

    }

    changeCompany(company){
        Session.setCurrentCompany(company.id);
        this.currentCompany = company;
        let currentCompany = _.find(this.allCompanies, {id: company.id});
        //this.switchBoard.onCompanyChange.next({'id': companyId});
    }

}
