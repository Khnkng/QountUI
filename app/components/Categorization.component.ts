/**
 * Created by seshu on 26-02-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ExpenseService} from "qCommon/app/services/Expense.service";
import {LoadingService} from "qCommon/app/services/LoadingService";

declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
    selector: 'categorize',
    templateUrl: '/app/views/categorization.html',
})

export class CategorizationComponent{
    companyId:string;

    constructor(private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
                private loadingService: LoadingService, private expenseService: ExpenseService) {
        this.fetchUncategorizedEntries();
        this.companyId = Session.getCurrentCompany();
    }

    fetchUncategorizedEntries(){
        this.expenseService.uncategorizedEntries(this.companyId)
            .subscribe(entries =>{
                console.log(entries);
            }, error =>{

            });
    }

}
