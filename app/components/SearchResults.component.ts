/**
 * Created by seshu on 26-02-2016.
 */

import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'search-results',
    templateUrl: '/app/views/searchResults.html'
})

export class SearchResultsComponent implements OnInit{
    results:Array<any> = [];
    hasResults: boolean = false;
    companyId:string;

    tableData:any = {};
    tableOptions:any = {};

    constructor(private _router: Router, private companyService: CompaniesService, private toastService: ToastService,
                private loadingService: LoadingService) {
        this.companyId = Session.getCurrentCompany();
        let searchCriteria = sessionStorage.getItem("searchcriteria");
        this.loadingService.triggerLoadingEvent(true);
        if(searchCriteria){
            searchCriteria = JSON.parse(searchCriteria);
            this.companyService.doSearch(searchCriteria, this.companyId)
                .subscribe(searchResults => {
                    this.results = []; //searchResults;
                }, error =>{
                    this.loadingService.triggerLoadingEvent(false);
                    this.toastService.pop(TOAST_TYPE.error, 'Could not perform search.');
                });
        }
    }

    ngOnInit() {

    }

    ngOnDestroy(){

    }

    redirectPage(data){
        let link = [];
        if(data.type == 'bill'){
            link = ['payments/bill', this.companyId, data.id, 'enter'];
        } else if(data.type == 'expense'){
            link = ['/expense', data.id];
        } else if(data.type == 'deposit'){
            link = ['/deposit', data.id];
        } else if(data.type == 'journal'){
            link = ['journalEntry', data.id, 'enter'];
        } else if(data.type == 'payment'){
            link = ['/payments', data.id];
        }
        this._router.navigate(link);
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.redirectPage($event);
        }
    }

    buildResultsTableData(){
        let base = this;
        this.loadingService.triggerLoadingEvent(false);
        this.hasResults = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 15;
        this.tableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "name", "title": "Name/Number"},
            {"name": "amount", "title": "Amount"},
            {"name": "id", "title": "Id", "visible": false},
            {"name": "actions", "title": "Actions", "type": "html"}
        ];
        this.results.forEach(function(result) {
            let row:any = {};
            _.each(Object.keys(result), function (key) {
                row[key] = result[key];
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasResults = true;
        }, 0)
    }

    goToPreviousPage(){
        let link = [Session.getLastVisitedUrl()];
        this._router.navigate(link);
    }
}
