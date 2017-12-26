/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {UserProfileService} from "qCommon/app/services/UserProfile.service";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {NumeralService} from "qCommon/app/services/Numeral.service";

declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
    selector: 'switch-company',
    templateUrl: '../views/switchCompany.html',
})

export class SwitchCompanyComponent{
    allCompanies:Array<any>;
    currentCompany:any = {};
    tableData:any = {};
    tableOptions:any = {};
    displayCurrency:string='USD';
    currentCompanyName:string = '';
    currentCompanyId:string;
    subscription:any;
    compSubscription:any;
    hasCompanyList:boolean;
    routeSubscribe:any;

    constructor(private _router:Router, private _route: ActivatedRoute, private toastService: ToastService, private switchBoard: SwitchBoard,
                private companiesService: CompaniesService, private loadingService: LoadingService, private userProfileService: UserProfileService,
                private titleService:pageTitleService, private numeralService: NumeralService) {
        this.loadingService.triggerLoadingEvent(true);
        this.currentCompanyId = Session.getCurrentCompany();
        this.currentCompanyName = Session.getCurrentCompanyName();
        this.compSubscription = this.switchBoard.onCompanyAddOrDelete.subscribe(msg => this.fetchCompanies());
        this.fetchCompanies();
        this.titleService.setPageTitle("Switch Company");
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(title =>
            {
                let link = ['/dashboard'];
                this._router.navigate(link);
            }
        );
    }

    fetchCompanies(){
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
        this.routeSubscribe.unsubscribe();
    }

    handleError(error){
        this.loadingService.triggerLoadingEvent(false);
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
            {"name":"einNumber","title":"EIN"},
            {"name": "companyType", "title": "Type"},
            {"name": "owner", "title": "Owner"},
            {"name": "accountManager", "title": "Account Manager"},
            {"name": "defaultCurrency", "title": "Currency","visible": false},
            {"name": "fiscalStartDate", "title": "Fiscal Date","visible": false},
            {"name": "lockDate", "title": "Lock Date","visible": false},
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
            row.owner = company.owner;
            row.einNumber=company.einNumber;
            row.companyType=company.companyType;
            row.accountManager=company.accountManager;
            row.defaultCurrency=company.defaultCurrency;
            row.lockDate=company.lock_date;
            row.fiscalStartDate = company.fiscalStartDate;
            if(row.id != base.currentCompanyId){
                row['actions'] = "<a class='action switch-company-label' data-action='switch-company'><span class='label'>Hop</span></a>";
            }
            base.tableData.rows.push(row);
        });
        this.hasCompanyList = false;
        setTimeout(function(){
            base.hasCompanyList = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    }

    refreshTable(){
        let base = this;
        this.buildTableData(this.allCompanies);
        this.hasCompanyList = false;
        setTimeout(function(){
            base.hasCompanyList = true;
        }, 0);
    }

    setDefaultCompany(companyId){
        let data ={
            "firstName": Session.getUser().firstName,
            "lastName": Session.getUser().lastName,
            "phoneNumber": Session.getUser().phone_number,
            "defaultCompany": companyId
        };
        this.userProfileService.updateUserProfile(data)
            .subscribe(test => console.log(test));
    }

    changeCompany(company){
        Session.setCurrentCompany(company.id);
        Session.setCurrentCompanyName(company.name);
        Session.setFiscalStartDate(company.fiscalStartDate);
        Session.setCurrentCompanyCurrency(company.defaultCurrency);
        Session.setCompanyReportCurrency(company.reportCurrency);
        Session.setLockDate(company.lockDate);
        this.switchBoard.onSwitchCompany.next({});
        this.currentCompanyName = company.name;
        this.currentCompanyId = company.id;
        this.currentCompany = company;
        this.refreshTable();
        this.setDefaultCompany(company.id);
        let link = ['/dashboard'];
        this._router.navigate(link);
    }
}
