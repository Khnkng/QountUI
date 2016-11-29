/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";

declare var _:any;
declare var jQuery:any;
declare var moment:any;

@Component({
    selector: 'switch-company',
    templateUrl: '/app/views/switchCompany.html',
})

export class SwitchCompanyComponent{
    allCompanies:Array<any>;
    currentCompany:any = {};
    tableData:any = {};
    tableOptions:any = {};
    hasCompanyList:boolean;
    displayCurrency:string='USD';
    currentCompanyName:string = '';
    currentCompanyId:string;
    subscription:any;

    constructor(private _router:Router, private _route: ActivatedRoute, private toastService: ToastService, private companiesService: CompaniesService,
        private switchBoard: SwitchBoard) {
        this.currentCompanyId = Session.getCurrentCompany();
        this.currentCompanyName = Session.getCurrentCompanyName();
        this.subscription = this.switchBoard.onCompanyUpdate.subscribe(company =>{
           this.currentCompanyName = Session.getCurrentCompanyName();
        });
        this.companiesService.companies().subscribe(companies => {
            this.allCompanies = companies;
            if(this.currentCompanyId){
                this.currentCompany = _.find(this.allCompanies, {id: this.currentCompanyId});
            } else if(this.allCompanies.length> 0){
                this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
            }
            this.buildTableData(this.allCompanies);
        }, error => this.handleError(error));
    }

    ngAfterViewInit() {

    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
    }

    handleError(error){

    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'switch-company') {
            this.changeCompany($event);
        }else if(action == 'delete'){

        }else if(action == 'verify'){

        }
    }

    buildTableData(companies) {
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name": "id", "title": "ID","visible": false, "filterable": false},
            {"name": "name", "title": "Name"},
            {"name": "admin", "title": "Admin"},
            {"name": "actions", "title": "", "type": "html", "filterable": false}
        ];
        this.tableData.rows = [];
        let base = this;
        companies.forEach(function(company) {
            let row:any = {};
            let payabels=0;
            let pastDate=0;
            if(company.payables){
                payabels=company.payables;
            }if(company.payables){
                pastDate=company.pastDue;
            }
            row.id=company.id;
            row.name = company.name;
            row.payables =payabels.toLocaleString(base.displayCurrency, { style: 'currency', currency: base.displayCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
            row.pastDue =payabels.toLocaleString(base.displayCurrency, { style: 'currency', currency: base.displayCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
            row.admin = company.invitedBy;

            if(row.id != base.currentCompanyId){
                row['actions'] = "<a class='action switch-company-label' data-action='switch-company'><span class='label'>Switch</span></a>";
            }

            base.tableData.rows.push(row);
        });
        this.hasCompanyList = true;
    }

    refreshTable(){
        let base = this;
        this.hasCompanyList = false;
        setTimeout(function(){
            base.hasCompanyList = true;
        }, 0);
        this.buildTableData(this.allCompanies);
    }

    changeCompany(company){
        Session.setCurrentCompany(company.id);
        Session.setCurrentCompanyName(company.name);
        this.currentCompanyName = company.name;
        this.currentCompanyId = company.id;
        this.currentCompany = company;

        jQuery("#SwitchCompany-modal").foundation('close');
        let link = ['/dashboard'];
        this._router.navigate(link);
    }

}
