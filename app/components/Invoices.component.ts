/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {LoadingService} from "qCommon/app/services/LoadingService";

declare var _:any;
declare var jQuery:any;
declare var moment:any;

@Component({
    selector: 'invoices',
    templateUrl: '/app/views/invoices.html',
})

export class InvoicesComponent{
    tabBackground:string = "#d45945";
    selectedTabColor:string = "#d45945";
    tabDisplay:Array<any> = [{'display':'none'},{'display':'none'},{'display':'none'},{'display':'none'}];
    bgColors:Array<string>=[
        '#d45945',
        '#d47e47',
        '#2980b9',
        '#3dc36f'
    ];

    proposalsTableData:any = {};
    proposalsTableOptions:any = {search:false, pageSize:10};
    expensesTableData:any = {};
    expensesTableOptions:any = {search:false, pageSize:10};
    invoiceTableData:any = {};
    invoiceTableOptions:any = {search:false, pageSize:10};

    tabHeight:string;
    badges:any = [];
    selectedTab:any=0;
    isLoading:boolean=true;
    localBadges:any={};
    boxInfo;
    routeSub:any;
    hideBoxes :boolean = true;
    selectedColor:any='red-tab';
    hasInvoices:boolean = false;
    hasExpenses:boolean = false;
    hasProposals:boolean = false;
    allCompanies:Array<any>;
    currentCompany:any;

    constructor(private _router:Router,private _route: ActivatedRoute,
                private toastService: ToastService, private loadingService:LoadingService,
                private companiesService: CompaniesService) {
        let companyId = Session.getCurrentCompany();
        this.companiesService.companies().subscribe(companies => {
            this.allCompanies = companies;
            if(companyId){
                this.currentCompany = _.find(this.allCompanies, {id: companyId});
            } else if(this.allCompanies.length> 0){
                this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
            }
            this.routeSub = this._route.params.subscribe(params => {
                this.selectedTab=params['tabId'];
                this.selectTab(this.selectedTab,"");
                this.hasInvoices = false;
            });
            this.localBadges=JSON.parse(sessionStorage.getItem("localInvoicesBadges"));
            if(!this.localBadges){
                this.localBadges = {'proposals':0,'invoices':0};
                sessionStorage.setItem('localInvoicesBadges', JSON.stringify(this.localBadges));
            } else{
                this.localBadges = JSON.parse(sessionStorage.getItem("localInvoicesBadges"));
            }
        }, error => this.handleError(error));
    }

    animateBoxInfo(boxInfo) {
        this.animateValue('payables', boxInfo.payables);
        this.animateValue('pastDue', boxInfo.pastDue);
        this.animateValue('dueToday', boxInfo.dueToday);
        this.animateValue('dueThisWeek', boxInfo.dueThisWeek);
    }

    animateValue(param, value) {
        let base = this;
        jQuery({val: value/2}).stop(true).animate({val: value}, {
            duration : 2000,
            easing: "easeOutExpo",
            step: function () {
                var _val = this.val;
                base.boxInfo[param] = Number(_val.toFixed(2));
            }
        }).promise().done(function () {
            base.boxInfo[param] = value;
        });
    }

    selectTab(tabNo, color) {
        this.selectedTab=tabNo;
        this.selectedColor=color;
        let base = this;
        this.tabDisplay.forEach(function(tab, index){
            base.tabDisplay[index] = {'display':'none'}
        });
        this.tabDisplay[tabNo] = {'display':'block'};
        this.tabBackground = this.bgColors[tabNo];
        if(this.selectedTab == 0){
            this.isLoading = false;
        } else if(this.selectedTab == 1){
            this.isLoading = false;
        } else if(this.selectedTab == 2){
            this.isLoading = false;
        }
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.showInvoice($event);
        } else if(action == 'delete'){
            this.removeInvoice($event);
        }
    }

    handleProposalAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            //Show proposal
        } else if(action == 'delete'){
            //delete proposal
        }
    }

    removeInvoice(invoice){
        let base = this;
    }

    showInvoice(invoice){
        let link = ['invoice', invoice.id];
        this._router.navigate(link);
    }

    handleError(error){
        this.toastService.pop(TOAST_TYPE.error, "Could not perform action.")
    }

    handleBadges(length, selectedTab){
        if(selectedTab == 2){
            this.badges.invoices = length;
            this.localBadges['invoices'] = length;
            sessionStorage.setItem('localInvoicesBadges', JSON.stringify(this.localBadges));
        }
    }

    reRoutePage(tabId) {
        let link = ['invoices', tabId];
        this._router.navigate(link);
    }

    ngOnInit() {
        
    }

    updateTabHeight(){
        let base = this;
        let topOfDiv = jQuery('.tab-content').offset().top;
        topOfDiv = topOfDiv<150? 170:topOfDiv;
        let bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
        base.tabHeight = (bottomOfVisibleWindow - topOfDiv -25)+"px";
        jQuery('.tab-content').css('height', base.tabHeight);
        switch(this.selectedTab){
            case 0:
                base.proposalsTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 1:
                base.expensesTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 2:
                base.invoiceTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
        }
    }
    ngAfterViewInit() {
        let base = this;
        jQuery(document).ready(function() {
            base.updateTabHeight();
        });
    }

    ngOnDestroy(){
        this.routeSub.unsubscribe();
    }

    addNewInvoice(){
        let link = ['Invoice'];
        this._router.navigate(link);
    }

    addNewProposal(){
        let link = ['Proposal'];
        this._router.navigate(link);
    }
}
