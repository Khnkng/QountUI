/**
 * Created by seshu on 26-02-2016.
 */

import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {FullScreenService} from "qCommon/app/services/fullscreen.service";
import {NotificationService} from "qCommon/app/services/Notification.service";
import {Session} from "qCommon/app/services/Session";


declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'search-widget',
    templateUrl: '/app/views/search.html'
})

export class SearchComponent implements  OnInit{
    showSearch:boolean = false;
    selectedComponents:Array<string> = [];
    amountCondition:string;
    companyCurrency:string;
    amount:number = 0;
    lowerLimit:number = 0;
    upperLimit:number = 0;
    title:string;
    beginDate:string;
    endDate:string;

    constructor(private _router: Router, private switchBoard: SwitchBoard, private _fullscreen: FullScreenService, private notificationServie: NotificationService) {
        this.companyCurrency=Session.getCurrentCompanyCurrency();
    }

    ngOnInit() {
        jQuery(document).ready(function(){
            jQuery(document).foundation();
        });
    }

    toggleSearch(){
        this.showSearch = !this.showSearch;
    }

    isCompSelected(component){
        return this.selectedComponents.indexOf(component) != -1;
    }

    selectComponent(component){
        if(this.selectedComponents.indexOf(component) == -1){
            this.selectedComponents.push(component);
        } else{
            this.selectedComponents.splice(this.selectedComponents.indexOf(component), 1);
        }
    }

    setBeginDate(data){

    }

    setEndDate(date){

    }

    closeSearchWidget(){
        this.showSearch = !this.showSearch;
        this.selectedComponents = [];
        this.beginDate = '';
        this.endDate = '';
        this.amount = 0;
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.title = '';
        this.amountCondition = '';
    }
}
