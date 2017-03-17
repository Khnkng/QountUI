/**
 * Created by seshu on 26-02-2016.
 */

import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {Router, NavigationEnd} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {CustomersService} from "qCommon/app/services/Customers.service";

declare var jQuery:any;
declare var _:any;

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

    constructor(private _router: Router, private coaService: ChartOfAccountsService, private companyService: CompaniesService,
                private customersService: CustomersService) {
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
        console.log("data: ", data);
        //this.resetCriteria();
    }
}
