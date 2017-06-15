/**
 * Created by seshu on 26-02-2016.
 */

import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {Router, NavigationEnd} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {CustomersService} from "qCommon/app/services/Customers.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ToastService} from "qCommon/app/services/Toast.service";

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'search-widget',
    templateUrl: '../views/search.html'
})

export class SearchComponent{
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
    showtable:boolean=false;
    tableData:any = {};
    tableOptions:any = {};

    constructor(private _router: Router, private coaService: ChartOfAccountsService, private companyService: CompaniesService,
                private customersService: CustomersService, private loadingService: LoadingService, private toastService: ToastService) {
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
        this.amountCondition = 'greaterthan';
        this.textCondition  ='beginsWith';
        this.dateCondition = 'equals';
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
        if(chartOfAccount && chartOfAccount.id){
            this.chartOfAccount = chartOfAccount.id;
        } else if(chartOfAccount == '--None--'){
            this.chartOfAccount = null;
        }
    }

    setVendor(vendor){
        if(vendor && vendor.id){
            this.vendor = vendor.id;
        } else if(vendor == '--None--'){
            this.vendor = null;
        }
    }

    setCustomer(customer){
        if(customer && customer.customer_id){
            this.customer = customer.customer_id;
        } else if(customer == '--None--'){
            this.customer = null;
        }
    }

    validate(){
        if(this.amountCondition != 'between' && isNaN(this.amount)){
            this.toastService.pop(TOAST_TYPE.error, "Please enter numbers in the amount");
            return false;
        }
        if(this.amountCondition == 'between' && (isNaN(this.lowerLimit) || isNaN(this.upperLimit))){
            this.toastService.pop(TOAST_TYPE.error, "Please enter numbers in the amount fields");
            return false;
        }
        return true;
    }

    getSortedAmount(){
        return _.sortBy([this.lowerLimit, this.upperLimit]);
    }

    doSearch(){
        console.log(this.amountCondition);
        if(!this.validate()){
            return;
        }
        let data:any = {
            source: this.source,
            criteria: {}
        };
        if(this.vendor){
            data.criteria.vendor = this.vendor;
        }
        if(this.chartOfAccount){
            data.criteria.chartOfAccount = this.chartOfAccount;
        }
        if(this.customer){
            data.criteria.customer = this.customer;
        }
        if(this.amountCondition && (this.amount || (this.upperLimit && this.lowerLimit))){
            data.criteria['amount'] = {
                "condition": this.amountCondition,
                "value": this.amountCondition == 'between'? this.getSortedAmount(): this.amount
            }
        }
        if(this.dateCondition && (this.date || (this.beginDate && this.endDate))){
            data.criteria['date'] = {
                "condition": this.dateCondition,
                "value": this.dateCondition == 'between'? [this.beginDate, this.endDate]: this.date
            }
        }
        if(this.textCondition && this.text){
            data.criteria['text'] = {
                "condition": this.textCondition,
                "value": this.text
            }
        }
        sessionStorage.setItem("searchcriteria", JSON.stringify(data));
        this.getSearchResults(data);
    }

    getSearchResults(data){
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.doSearch(data, this.companyId)
            .subscribe(results => {
                this.showtable = true;
                this.buildResultsTableData(results);
            }, error => {
                this.showtable = true;

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
            {"name": "id", "title": "Id", "visible": false, "filterable": false},
            {"name": "actions", "title": "", "type": "html", "filterable": false}
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
