/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";

declare var _:any;
declare var jQuery:any;
declare var moment:any;

@Component({
    selector: 'books',
    templateUrl: '/app/views/books.html',
})

export class BooksComponent{
    tabBackground:string = "#d45945";
    selectedTabColor:string = "#d45945";
    tabDisplay:Array<any> = [{'display':'none'},{'display':'none'},{'display':'none'},{'display':'none'}];
    bgColors:Array<string>=[
        '#d45945',
        '#d47e47',
        '#2980b9',
        '#3dc36f'
    ];

    depositsTableData:any = {};
    depositsTableOptions:any = {search:false, pageSize:10};
    expensesTableData:any = {};
    expensesTableOptions:any = {search:false, pageSize:10};
    jeTableData:any = {};
    jeTableOptions:any = {search:false, pageSize:10};

    tabHeight:string;
    badges:any = [];
    selectedTab:any=0;
    isLoading:boolean=true;
    localBadges:any={};
    boxInfo;
    routeSub:any;
    hideBoxes :boolean = true;
    selectedColor:any='red-tab';
    hasJournalEntries:boolean = false;
    hasExpenses:boolean = false;
    hasDeposits:boolean = false;

    constructor(private _router:Router,private _route: ActivatedRoute) {
        this.routeSub = this._route.params.subscribe(params => {
            this.selectedTab=params['tabId'];
            this.selectTab(this.selectedTab,"");
            this.isLoading = false;
            this.hasJournalEntries = false;
        });
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
        this.localBadges=JSON.parse(sessionStorage.getItem("localBadges"));
        this.tabDisplay[tabNo] = {'display':'block'};
        this.tabBackground = this.bgColors[tabNo];
    }

    reRoutePage(tabId) {
        let link = ['books', tabId];
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
                base.depositsTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 1:
                base.expensesTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 2:
                base.jeTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
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

    addNewJE(){
        let link = ['newJournalEntry'];
        this._router.navigate(link);
    }
}
