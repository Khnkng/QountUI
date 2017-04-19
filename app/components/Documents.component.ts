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


declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'employees',
    templateUrl: '/app/views/documents.html'
})

export class DocumentsComponent {

    tabBackground:string = "#d45945";
    selectedTabColor:string = "#d45945";
    tabDisplay:Array<any> = [{'display':'none'},{'display':'none'},{'display':'none'},{'display':'none'}];
    bgColors:Array<string>=[
        '#d45945',
        '#d47e47',
        '#2980b9',
        '#3dc36f'
    ];


    tableOptions:any = {search:true, pageSize:7};

    tabHeight:string;
    badges:any = [];
    selectedTab:any='deposits';
    isLoading:boolean=true;
    localBadges:any={};
    boxInfo;
    routeSub:any;
    hideBoxes :boolean = true;
    selectedColor:any='red-tab';
    hasReceipts:boolean = false;
    hasBills:boolean = false;
    hasRefunds:boolean = false;
    allCompanies:Array<any>;
    currentCompany:any;
    receiptsTableData:any = {};
    billsTableData:any = {};
    refundsTableData:any = {};
    constructor(private _router:Router,private _route: ActivatedRoute,
                private toastService: ToastService,private switchBoard:SwitchBoard, private loadingService:LoadingService, private companiesService: CompaniesService, private documentsService:DocumentService) {
        let companyId = Session.getCurrentCompany();

        this.companiesService.companies().subscribe(companies => {
            this.allCompanies = companies;
            if(companyId){
                this.currentCompany = _.find(this.allCompanies, {id: companyId});
            } else if(this.allCompanies.length> 0){
                this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
            }
            this.routeSub = this._route.params.subscribe(params => {
                if(params['tabId']=='receipts'){
                    this.selectTab(0,"");
                }
                else if(params['tabId']=='bills'){
                    this.selectTab(1,"");
                }
                else if(params['tabId']=='refunds'){
                    this.selectTab(2,"");
                }
                else{
                    console.log("error");
                }
            });
        }, error => this.handleError(error));

    }


    fetchReceipts(){
        this.documentsService.getDocumentBySource("unusedreceipt").subscribe(docs => {
            this.loadingService.triggerLoadingEvent(false);
            this.buildReceiptsTableData(docs);
        }, error => {});
    }

    fetchBills(){
        this.documentsService.getDocumentBySource("unusedbill").subscribe(docs => {
            this.loadingService.triggerLoadingEvent(false);
            this.buildBillsTableData(docs);
        }, error => {});
    }

    fetchRefunds(){
        this.documentsService.getDocumentBySource("unusedrefund").subscribe(docs => {
            this.loadingService.triggerLoadingEvent(false);
            this.buildRefundsTableData(docs);
        }, error => {});
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
        this.loadingService.triggerLoadingEvent(true);
        if(this.selectedTab == 0){
            this.isLoading = true;
            this.fetchReceipts();
            this.fetchBills();
            this.fetchRefunds();
        } else if(this.selectedTab == 1){
            this.isLoading = true;
            this.fetchReceipts();
            this.fetchBills();
            this.fetchRefunds();
        } else if(this.selectedTab == 2){
            this.isLoading = true;
            this.fetchReceipts();
            this.fetchBills();
            this.fetchRefunds();
        }
    }


    buildReceiptsTableData(docs){
        let base = this;
        this.isLoading = false;
        this.receiptsTableData.search = true;
        this.receiptsTableData.columns = [
            {"name": "id", "title": "", 'visible': false, 'filterable': false},
            {"name": "name", "title": "Name"},
            {"name": "description", "title": "Description"},
            {"name": "image", "title": "Image", "type": "html", "sortable": false, "filterable": false},
            {"name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false}
        ];

        this.receiptsTableData.rows = [];
        docs.forEach(function(doc){
            let row:any = {};
            row['id'] = doc.id;
            row['name'] = doc.name;
            row['description'] = doc.description;
            row['image'] = "<img src='"+doc.temporaryURL+"' style='width:50px;height:50px;'/>";
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.receiptsTableData.rows.push(row);
        });

        setTimeout(() => {
            if(base.receiptsTableData.rows.length > 0){
                base.hasReceipts = true;
            }
        });

    }

    buildBillsTableData(docs){
        let base = this;
        this.isLoading = false;
        this.billsTableData.search = true;
        this.billsTableData.columns = [
            {"name": "id", "title": "", 'visible': false, 'filterable': false},
            {"name": "name", "title": "Name"},
            {"name": "description", "title": "Description"},
            {"name": "image", "title": "Image", "type": "html", "sortable": false, "filterable": false},
            {"name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false}
        ];

        this.billsTableData.rows = [];
        docs.forEach(function(doc){
            let row:any = {};
            row['id'] = doc.id;
            row['name'] = doc.name;
            row['description'] = doc.description;
            row['image'] = "<img src='"+doc.temporaryURL+"' style='width:50px;height:50px;'/>";
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.billsTableData.rows.push(row);
        });

        setTimeout(() => {
            if(base.billsTableData.rows.length > 0){
                base.hasBills = true;
            }
        });

    }

    buildRefundsTableData(docs){
        let base = this;
        this.isLoading = false;
        this.refundsTableData.search = true;
        this.refundsTableData.columns = [
            {"name": "id", "title": "", 'visible': false, 'filterable': false},
            {"name": "name", "title": "Name"},
            {"name": "description", "title": "Description"},
            {"name": "image", "title": "Image", "type": "html", "sortable": false, "filterable": false},
            {"name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false}
        ];

        this.refundsTableData.rows = [];
        docs.forEach(function(doc){
            let row:any = {};
            row['id'] = doc.id;
            row['name'] = doc.name;
            row['description'] = doc.description;
            row['image'] = "<img src='"+doc.temporaryURL+"' style='width:50px;height:50px;'/>";
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.refundsTableData.rows.push(row);
        });

        setTimeout(() => {
            if(base.refundsTableData.rows.length > 0){
                base.hasRefunds = true;
            }
        });

    }

    ngOnInit() {
    }


    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        let sourceTypes = ['receipt', 'bill', 'refund'];
        if(action == 'edit'){
            let link = ['document', sourceTypes[this.selectedTab], "unused"+sourceTypes[this.selectedTab], $event.id];
            this._router.navigate(link);
        }
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
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 1:
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
            case 2:
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75)/42)-3;
                break;
        }
    }
    ngAfterViewInit() {
        let base = this;
        jQuery(document).ready(function() {
            base.updateTabHeight();
        });
    }

    reRoutePage(tabId) {
        if(tabId==0){
            let link = ['documents', 'receipts'];
            this._router.navigate(link);
            return;
        }
        else if(tabId==1){
            let link = ['documents', 'bills'];
            this._router.navigate(link);
            return;
        }
        else{
            let link = ['documents', 'refunds'];
            this._router.navigate(link);
            return;
        }

    }

    handleError(error){
        this.toastService.pop(TOAST_TYPE.error, "Could not perform action.")
    }

    ngOnDestroy(){
        this.routeSub.unsubscribe();
    }
}
