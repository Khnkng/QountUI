/**
 * Created by Nagaraju Thota on 14/11/17.
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
import {pageTitleService} from "qCommon/app/services/PageTitle";

declare var jQuery: any;
declare var _: any;

@Component({
  selector: 'employees',
  templateUrl: '../views/documentsType.html'
})

export class DocumentsTypeComponent {
  routeSubscribe: any;
  companyCurrency: string;
  companyId: string;

  constructor(private _router: Router, private _route: ActivatedRoute, private toastService: ToastService, private switchBoard: SwitchBoard,
              private loadingService: LoadingService, private companiesService: CompaniesService, private documentsService: DocumentService,
              private titleService: pageTitleService) {
    this.titleService.setPageTitle("Documents");
    this.companyId = Session.getCurrentCompany();
    this.companyCurrency = Session.getCurrentCompanyCurrency();

    this.routeSubscribe = this._route.params.subscribe(params => {
      if (params['docType'] == 'formation') {
        console.log("Document Type =====", params['docType']);
      } else if (params['docType'] == 'tax') {
        console.log("Document Type =====", params['docType']);
      } else if (params['docType'] == 'w2') {
        console.log("Document Type =====", params['docType']);
      }
      else {
        console.log("error");
      }
    });

    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      let link = ['documents'];
      this._router.navigate(link);
    });

  }

}
