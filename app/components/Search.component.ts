/**
 * Created by seshu on 26-02-2016.
 */

import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {Router, NavigationEnd} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {CustomersService} from "qCommon/app/services/Customers.service";
import {LoadingService} from "qCommon/app/services/LoadingService";

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'search-widget',
    templateUrl: '/app/views/search.html'
})

export class SearchComponent implements  OnInit{
    source:Array<string> = [];
    companyCurrency:string;
    amountCondition:string;
    textCondition:string;
    text:string;
    dateCondition:string;
    amount:number = 0;
    lowerLimit:number = 0;
    upperLimit:number = 0;
    date:string;
    beginDate:string;
    endDate:string;
    companyId:string;
    chartOfAccount:string;
    vendor: string;
    customer: string;
    chartOfAccounts:Array<any> = [];
    vendors:Array<any> = [];
    customers:Array<any> = [];
    hasSearchResults:boolean = false;
    showSearchCriteria:boolean = true;

    tableData:any = {};
    tableOptions:any = {};

    constructor(private _router: Router, private coaService: ChartOfAccountsService, private companyService: CompaniesService,
                private customersService: CustomersService, private loadingService: LoadingService) {
        this.companyCurrency=Session.getCurrentCompanyCurrency();
        this.companyId=Session.getCurrentCompany();

        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(chartOfAccounts => {
                this.chartOfAccounts = chartOfAccounts;
            }, error => {

            });
        this.companyService.vendors(this.companyId)
            .subscribe(vendors => {
                this.vendors = vendors;
            }, error => {

            });
        this.customersService.customers(this.companyId)
            .subscribe(customers => {
                this.customers = customers;
            }, error => {

            });
    }

    ngOnInit() {
        let base = this;
        this._router.events.filter(event => event instanceof NavigationEnd).subscribe(routeChange => {
            base.source = [];
        });

        jQuery(document).ready(function(){
            jQuery(document).foundation();
        });

        let criteria = sessionStorage.getItem("searchcriteria");
        if(criteria){
            this.getSearchResults(JSON.parse(criteria));
        }
    }

    showPreviousPage(){
        let link = [Session.getLastVisitedUrl()];
        this._router.navigate(link);
    }

    isCompSelected(component){
        let url = Session.getLastVisitedUrl();
        if(this.source.indexOf(component) != -1){
            return 'selected-button';
        } else if(url.indexOf(component.toLowerCase()) != -1){
            this.source.push(component);
            return 'selected-button';
        }
        return 'hollow';
    }

    selectComponent(component){
        if(this.source.indexOf(component) == -1){
            this.source.push(component);
        } else{
            this.source.splice(this.source.indexOf(component), 1);
        }
    }

    setDate(date, key){
        this[key] = date;
    }

    resetCriteria(){
        this.source = [];
        this.beginDate = '';
        this.endDate = '';
        this.amount = 0;
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.text = '';
        this.amountCondition = '';
    }

    setChartOfAccount(chartOfAccount){
        this.chartOfAccount = chartOfAccount.id;
    }

    setVendor(vendor){
        this.vendor = vendor.id;
    }

    setCustomer(customer){
        this.customer = customer.id;
    }

    doSearch(){
        let data = {
            source: this.source,
            criteria: {
                amount: {
                    "condition": this.amountCondition,
                    "value": this.amountCondition == 'between'? [this.upperLimit, this.lowerLimit]: this.amount
                },
                date: {
                    "condition": this.dateCondition,
                    "value": this.dateCondition == 'between'? [this.beginDate, this.endDate]: this.date
                },
                text: {
                    "condition": this.textCondition,
                    "value": this.text
                },
                chartOfAccount: this.chartOfAccount,
                vendor: this.vendor,
                customer: this.customer
            }
        };
        sessionStorage.setItem("searchcriteria", JSON.stringify(data));
        this.getSearchResults(data);
    }

    getSearchResults(data){
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.doSearch(data, this.companyId)
            .subscribe(results => {
                this.showSearchCriteria = false;
                this.buildResultsTableData(results);
            }, error => {
                this.showSearchCriteria = false;
                this.loadingService.triggerLoadingEvent(false);
                console.log(error);
            })
    }

    handleAction($event){
        let link = [];
        if($event.action == 'edit'){
            if($event.type == 'Bill'){
                link = ['payments/bill', this.companyId, $event.id, 'entry'];
            } else if($event.type == 'Deposit'){
                link = ['deposit', $event.id];
            } else if($event.type == 'Expense'){
                link = ['expense', $event.id];
            } else if($event.type == 'Journal'){
                link = ['journalEntry', $event.id];
            } else if($event.type == 'Credit'){
                link = ['payments/credit', this.companyId, $event.id];
            } else if($event.type == 'Payments'){
                link = ['payments', $event.id];
            }
        }
        this._router.navigate(link);
    }

    buildResultsTableData(searchResults){
        let base = this;
        this.hasSearchResults = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 10;
        this.tableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "title", "title": "Title"},
            {"name": "amount", "title": "Amount"},
            {"name": "date", "title": "Date"},
            {"name": "id", "title": "Id", "visible": false},
            {"name": "actions", "title": "", "type": "html"}
        ];
        _.each(searchResults, function(result){
            let row:any = {};
            _.each(Object.keys(result), function(key){
                if(key == 'bill_amount' || key == 'amount'){
                    row['amount'] = result[key]? parseFloat(result[key]).toFixed(2): '';
                } else if(key == 'type'){
                    row['type'] = result[key]? (result[key].charAt(0).toUpperCase() + result[key].slice(1)) : '';
                } else if(key == 'bill_date' || key.toLowerCase() == 'date'){
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
        this.loadingService.triggerLoadingEvent(false);
        setTimeout(function(){
           base.hasSearchResults = true;
        });
    }
}
