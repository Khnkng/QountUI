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
    selector: 'documents',
    templateUrl: '../views/documents.html'
})

export class DocumentsComponent {

    routeSubscribe: any;
    companyCurrency: string;
    companyId: string;
    documenTypeInfo: Array<any> = [{"name": "Formation", "folder_display_name": "F", "color": "#45B7E9", "linkAddr": "formation"},
      {"name": "Taxes", "folder_display_name": "Tx", "color": "#038256", "linkAddr": "taxes"},
      {"name": "Bills", "folder_display_name": "B", "color": "#535B80", "linkAddr": "bills"},
      {"name": "W2", "folder_display_name": "W2", "color": "#F1645A", "linkAddr": "w2"},
      {"name": "W4", "folder_display_name": "W4", "color": "#04B2AB", "linkAddr": "w4"},
      {"name": "W9", "folder_display_name": "W9", "color": "#45B7E9", "linkAddr": "w9"},
      {"name": "I9", "folder_display_name": "I9", "color": "#AA4540", "linkAddr": "i9"},
      {"name": "1099", "folder_display_name": "1099", "color": "#165168", "linkAddr": "1099"},
      {"name": "Receipts", "folder_display_name": "R", "color": "#2C87A9", "linkAddr": "receipts"},
      {"name": "Refunds", "folder_display_name": "Rf", "color": "#04B2AB", "linkAddr": "refunds"},
      {"name": "Timesheets", "folder_display_name": "Ts", "color": "#4655A5", "linkAddr": "timesheets"},
      {"name": "Deposit", "folder_display_name": "Dp", "color": "#AA4540", "linkAddr": "deposit"},
      {"name": "Others", "folder_display_name": "Oth", "color": "#038256", "linkAddr": "others"}
    ];

    constructor(private _router: Router, private _route: ActivatedRoute,
                private toastService: ToastService, private switchBoard: SwitchBoard, private loadingService: LoadingService,
                private companiesService: CompaniesService, private documentsService: DocumentService, private titleService: pageTitleService) {
        this.titleService.setPageTitle("Documents");
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
