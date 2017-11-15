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
import {pageTitleService} from "qCommon/app/services/PageTitle";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'employees',
    templateUrl: '../views/documents.html'
})

export class DocumentsComponent {

    routeSubscribe: any;
    companyCurrency: string;
    companyId: string;
    documenTypeInfo: Array<any> = [{"name": "Formation Documents", "folder_display_name": "F", "color": "#44B6E8", "linkAddr": "formation"},
      {"name": "Tax Documents", "folder_display_name": "Tx", "color": "#18457B", "linkAddr": "tax"},
      {"name": "W2 Documents", "folder_display_name": "W2", "color": "#CD0814", "linkAddr": "w2"},
      {"name": "I9 Documents", "folder_display_name": "I9", "color": "#808CC5", "linkAddr": "i9"},
      {"name": "1099 Documents", "folder_display_name": "1099", "color": "#FDB844", "linkAddr": "1099"},
      {"name": "Receipts Documents", "folder_display_name": "R", "color": "#1CB3AB", "linkAddr": "receipts"},
      {"name": "Bills Documents", "folder_display_name": "B", "color": "#384986", "linkAddr": "bills"},
      {"name": "Refunds Documents", "folder_display_name": "Rf", "color": "#ef655d", "linkAddr": "refunds"}
    ];

    constructor(private _router: Router, private _route: ActivatedRoute,
                private toastService: ToastService, private switchBoard: SwitchBoard, private loadingService: LoadingService,
                private companiesService: CompaniesService, private documentsService: DocumentService, private titleService: pageTitleService) {
        this.titleService.setPageTitle("Documents Types");
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
      this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
        let link = ['tools'];
        this._router.navigate(link);
      });
    }

    goToReports(name) {
      let link = [name];
      this._router.navigate(link);
    }
}
