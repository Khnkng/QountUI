/**
 * Created by seshagirivellanki on 14/04/17.
 */

import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {DocumentService} from "../services/Documents.service";


declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'employees',
    templateUrl: '../views/documents.html'
})

export class DocumentsComponent {

    badges:any = [];
    localBadges:any={};
    routeSub:any;
    currentCompany:any;
    companyCurrency:string;
    companyId:string;

    constructor(private _router:Router,private _route: ActivatedRoute,
                private toastService: ToastService,private switchBoard:SwitchBoard, private loadingService:LoadingService, private companiesService: CompaniesService, private documentsService:DocumentService) {
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
    }
    goToReports(name) {
      let link = [name];
      this._router.navigate(link);
    }
}
