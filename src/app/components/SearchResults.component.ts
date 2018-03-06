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
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {StateService} from "qCommon/app/services/StateService";
import {State} from "qCommon/app/models/State";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'search-results',
    templateUrl: '../views/searchResults.html'
})

export class SearchResultsComponent implements OnInit{
    results:Array<any> = [];
    hasResults: boolean = false;
    companyId:string;

    tableData:any = {};
    tableOptions:any = {};
    routeSubscribe:any;


    constructor(private _router: Router, private companyService: CompaniesService, private toastService: ToastService,
                private loadingService: LoadingService,private titleService:pageTitleService,private stateService: StateService,private numeralService:NumeralService,_switchBoard:SwitchBoard) {
        this.companyId = Session.getCurrentCompany();
        let searchCriteria:any = sessionStorage.getItem("searchcriteria");
        if(searchCriteria){
            searchCriteria = JSON.parse(searchCriteria);
            let data={
              source: searchCriteria.source,
              criteria:searchCriteria.criteria
            };
            this.loadingService.triggerLoadingEvent(true);
            this.companyService.doSearch(data, this.companyId)
                .subscribe(searchResults => {
                    this.results = searchResults||[]; //searchResults;
                    //this.addSearchState(searchResults);
                    this.titleService.setPageTitle("Search Results");
                  this.buildResultsTableData();
                }, error =>{
                    this.loadingService.triggerLoadingEvent(false);
                    this.toastService.pop(TOAST_TYPE.error, 'Could not perform search.');
                });
        }
      this.routeSubscribe = _switchBoard.onClickPrev.subscribe(title => {
        this.showPreviousPage();
      });
    }

  showPreviousPage(){
    let prevState = this.stateService.getPrevState();
    if(prevState){
      if(prevState.key=="search_results_details"){
        this.results=prevState.data;
        this.stateService.pop();
        this.buildResultsTableData();
      }else {
        this._router.navigate([prevState.url]);
      }

    }else{
      let link = [''];
      this._router.navigate(link);
    }
  }

    ngOnInit() {

    }

    ngOnDestroy(){
      this.numeralService.switchLocale(Session.getCurrentCompanyCurrency());
      this.routeSubscribe.unsubscribe();
    }

    addSearchState(data){
      this.stateService.addState(new State('search_results_details', this._router.url, data, null));
    }

    redirectPage(data){
      let link = [];
      this.addSearchState(this.results);
      if(data.type == 'Bill'){
        link = ['payments/bill', this.companyId, data.id, 'entry'];
      } else if(data.type == 'Deposit'){
        link = ['deposit', data.id];
      } else if(data.type == 'Expense'){
        link = ['expense', data.id];
      } else if(data.type == 'Journal'){
        link = ['journalEntry', data.id];
      } else if(data.type == 'Credit'){
        link = ['payments/credit', this.companyId, data.id];
      } else if(data.type == 'Payments'){
        link = ['payments', data.id];
      } else if(data.type == 'Invoice'){
        link =['invoices/edit',data.id];
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
        this.tableOptions.pageSize = 10;
        this.tableData.columns = [
        {"name": "type", "title": "Type"},
        {"name": "title", "title": "Title"},
        {"name": "amount", "title": "Amount"},
        {"name": "date", "title": "Date"},
        {"name":"entity", "title":"Entity"},
        {"name": "id", "title": "Id", "visible": false, "filterable": false},
        {"name": "actions", "title": "", "type": "html", "filterable": false}
      ];
      _.each(this.results, function(result){
        let row:any = {};
        let currency=result.currency?result.currency:'USD';
        _.each(Object.keys(result), function(key){
          if(key == 'bill_amount' || key == 'amount'){
            base.numeralService.switchLocale(currency.toLowerCase());
            let amount=parseFloat(result[key]);
            row['amount'] =base.numeralService.format("$0,0.00", amount);
          } else if(key == 'type'){
            row['type'] = result[key]? (result[key].charAt(0).toUpperCase() + result[key].slice(1)) : '';
          } else if(key == 'bill_date' ||key == 'invoice_date' ||key.toLowerCase() == 'date'){
            row['date'] = result[key];
          } else if(key == 'title' || key.toLowerCase() == 'name' || key.toLowerCase() == 'number'){
            row['title'] = result[key];
          } else{
            row[key] = result[key];
          }
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
