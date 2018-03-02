/**
 * Created by seshagirivellanki on 19/04/17.
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
    templateUrl: '../views/document.html'
})

export class DocumentComponent {
    routeSub:any;
    documentId:string;
    type:any;
    doc:any = {};
    companyCurrency:string;
    categories:Array<any> = [];
    allCategories:any = {
        "Expense": [{value: "auto", "name": "Auto"},
            {value: "entertainment", "name": "Entertainment"},
            {value: "shippingAndFreight", "name": "Shipping and Freight"},
            {value: "travel", "name": "Travel"},
            {value: "travelMeals", "name": "Travel Meals"},
            {value: "supplies", "name": "Supplies"},
            {value: "utilities", "name": "Utilities"},
            {value: "officeG&AExpenses", "name": "Office G&A Expenses"}
        ],
        "Bill": [],
        "Refund": [],
        "Other": []
    };
    companyId: string;
    dateFormat: string;

    constructor(private _router:Router,private _route: ActivatedRoute,
                private toastService: ToastService,private switchBoard:SwitchBoard,
                private loadingService:LoadingService, private companiesService: CompaniesService,
                private documentsService:DocumentService) {
        this.companyId = Session.getCurrentCompany();
        this.routeSub = this._route.params.subscribe(params => {
            this.companyCurrency = Session.getCurrentCompanyCurrency();
            this.documentId = params['documentId'];
            this.type = params['type'];
            this.loadingService.triggerLoadingEvent(true);
            this.documentsService.getDocumentById(this.documentId, "unused"+this.type, this.type)
                .subscribe(doc => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.doc = doc;
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                });
        });

    }

    routeToToolsPage(){
        let link = [Session.getLastVisitedUrl()];
        this._router.navigate(link);
    }

    updateCategories(mapTo){
        this.categories = mapTo? this.allCategories[mapTo]: [];
    }

    updateDocument(){
        this.loadingService.triggerLoadingEvent(true);
        this.documentsService.updateDocument(this.companyId, this.doc)
            .subscribe(response => {
                this.loadingService.triggerLoadingEvent(false);
                this._router.navigate([Session.getLastVisitedUrl()]);
            }, error =>{
                this.loadingService.triggerLoadingEvent(false);
                console.log(error);
            });
    }

    setDate(date){
        this.doc.date=date;
    }
}
