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
    templateUrl: '/app/views/document.html'
})

export class DocumentComponent {

    routeSub:any;
    documentId:string;
    sourceId:string;
    sourceType:any;
    doc:any = {};

    constructor(private _router:Router,private _route: ActivatedRoute,
                private toastService: ToastService,private switchBoard:SwitchBoard,
                private loadingService:LoadingService, private companiesService: CompaniesService,
                private documentsService:DocumentService) {
        this.routeSub = this._route.params.subscribe(params => {
            this.documentId = params['documentId'];
            this.sourceId = params['sourceId'];
            this.sourceType = params['sourceType'];
            this.documentsService.getDocumentById(this.documentId, this.sourceId, this.sourceType).subscribe(doc => this.doc = doc, error => {

            });
        });

    }
}
