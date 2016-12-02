/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {JournalEntriesService} from "qCommon/app/services/JournalEntries.service";

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

    constructor(private _router:Router, private _route: ActivatedRoute, private toastService: ToastService, private companiesService: CompaniesService) {
        let companyId = Session.getCurrentCompany();
        this.companiesService.companies().subscribe(companies => {
            this.allCompanies = companies;
            if(companyId){
                this.currentCompany = _.find(this.allCompanies, {id: companyId});
            } else if(this.allCompanies.length> 0){
                this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
            }
            this.buildTableData(this.allCompanies);
        }, error => this.handleError(error));
    }

    ngAfterViewInit() {

    }

    ngOnDestroy(){

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
            row.admin = "";

            row['actions'] = "<a class='action switch-company-label' data-action='switch-company'><span class='label'>Switch</span></a>";

            base.tableData.rows.push(row);
        });
        this.hasCompanyList = true;
    }

    changeCompany(company){
        Session.setCurrentCompany(company.id);
        this.currentCompany = company;

        jQuery("#SwitchCompany-modal").foundation('close');
        let link = ['/dashboard'];
        this._router.navigate(link);
    }

}
