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
import {environment} from "../../environments/environment";

declare let _: any;
declare let jQuery: any;
declare let moment: any;

@Component({
  selector: 'switch-company',
  templateUrl: '../views/switchCompany.html',
})

export class SwitchCompanyComponent {
  allCompanies: Array<any>;
  currentCompany: any = {};
  tableData: any = {};
  tableOptions: any = {};
  displayCurrency: string = 'USD';
  currentCompanyName: string = '';
  currentCompanyId: string;
  subscription: any;
  compSubscription: any;
  hasCompanyList: boolean;
  routeSubscribe: any;
  currentEnvironment: any;
  tabDisplay: Array<any> = [{'display': 'none'}, {'display': 'none'}];
  taxesBaseUIUrl = 'https://dev-taxes.qount.io';

  constructor(private _router: Router, private _route: ActivatedRoute, private toastService: ToastService, private switchBoard: SwitchBoard,
              private companiesService: CompaniesService, private loadingService: LoadingService, private userProfileService: UserProfileService,
              private titleService: pageTitleService, private numeralService: NumeralService) {
    this.loadingService.triggerLoadingEvent(true);
    this.currentCompanyId = Session.getCurrentCompany();
    this.currentCompanyName = Session.getCurrentCompanyName();
    this.compSubscription = this.switchBoard.onCompanyAddOrDelete.subscribe(msg => {
      // this.fetchCompanies();
      this.showCompanies(0, 'Business');
    });
    // this.fetchCompanies();
    this.showCompanies(0, 'Business');
    this.titleService.setPageTitle("Switch Company");
    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
        let link = ['/dashboard'];
        this._router.navigate(link);
      });
  }

/*
  fetchCompanies() {
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
*/

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.routeSubscribe.unsubscribe();
  }

  handleError(error) {
    this.loadingService.triggerLoadingEvent(false);
  }

  handleAction($event, companyType) {
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if (action == 'switch-company') {
      this.changeCompany($event, companyType);
    }else if (action == 'delete') {

    }else if (action == 'verify') {

    }
  }

  buildTableData(companies) {
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "id", "title": "ID", "visible": false, "filterable": false},
      {"name": "name", "title": "Name"},
      {"name": "einNumber", "title": "EIN"},
      {"name": "companyType", "title": "Type"},
      {"name": "owner", "title": "Owner"},
      {"name": "accountManager", "title": "Account Manager"},
      {"name": "defaultCurrency", "title": "Currency", "visible": false},
      {"name": "reportCurrency", "title": "Currency", "visible": false},
      {"name": "fiscalStartDate", "title": "Fiscal Date", "visible": false},
      {"name": "lockDate", "title": "Lock Date", "visible": false},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    this.tableData.rows = [];
    let base = this;
    companies.forEach(function(company) {
      let row: any = {};
      let payabels = 0;
      let pastDate = 0;
      if (company.payables) {
        payabels = company.payables;
      }if (company.payables) {
        pastDate = company.pastDue;
      }
      row.id = company.id;
      row.name = company.name;
      row.payables = payabels.toLocaleString(base.displayCurrency, { style: 'currency', currency: base.displayCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      row.pastDue = payabels.toLocaleString(base.displayCurrency, { style: 'currency', currency: base.displayCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      row.owner = company.owner;
      row.einNumber = company.einNumber;
      row.companyType = company.companyType;
      row.accountManager = company.accountManager;
      row.defaultCurrency = company.defaultCurrency;
      row.reportCurrency = company.reportCurrency;
      row.lockDate = company.lock_date;
      row.fiscalStartDate = company.fiscalStartDate;
      if (row.id != base.currentCompanyId) {
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

  refreshTable() {
    let base = this;
    this.buildTableData(this.allCompanies);
    this.hasCompanyList = false;
    setTimeout(function(){
      base.hasCompanyList = true;
    }, 0);
  }

  setDefaultCompany(companyId) {
    let data = {
      "firstName": Session.getUser().firstName,
      "lastName": Session.getUser().lastName,
      "phoneNumber": Session.getUser().phone_number,
      "defaultCompany": companyId
    };
    this.userProfileService.updateUserProfile(data)
      .subscribe(test => console.log(test));
  }

  changeCompany(company, companyType) {
    Session.setCurrentCompany(company.id);
    Session.setCurrentCompanyName(company.name);
    Session.setFiscalStartDate(company.fiscalStartDate);
    this.updateCookie(company, companyType);
    this.numeralService.switchLocale(company.defaultCurrency);
    Session.setCompanyReportCurrency(company.reportCurrency || "");
    Session.setCurrentCompanyCurrency(company.defaultCurrency);
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

  updateCookie(company, companyType) {
    this.currentEnvironment = environment;
    let cookieKey = this.currentEnvironment.production ? "prod" : "dev";
    let data = this.getCookieData(cookieKey);
    if (data) {
      let obj = JSON.parse(data);
      if (obj) {
        obj.user['default_company']['lock_date'] = company.lockDate;
        obj.user.default_company.fiscalStartDate ? obj.user.default_company.fiscalStartDate = company.fiscalStartDate : "";
        obj.user.defaultCompany = company.id;
        obj.user.default_company.name = company.name;
        obj.user.default_company.bucket = companyType;
        obj.user.default_company.defaultCurrency = company.defaultCurrency;
        obj.user.default_company.reportCurrency = company.reportCurrency;
        if (cookieKey == "dev") {
          if (obj.user.default_company.bucket == 'Business') {
            document.cookie = "dev=" + JSON.stringify(obj) + ";path=/;domain=qount.io";
          } else {
            document.cookie = "dev_taxes_app=" + JSON.stringify(obj) + ";path=/;domain=qount.io";
            window.location.replace(this.taxesBaseUIUrl);
          }
        } else if (cookieKey == "prod") {
          if (obj.user.default_company.bucket == 'Business') {
            document.cookie = "prod=" + JSON.stringify(obj) + ";path=/;domain=qount.io";
          } else {
            document.cookie = "prod_taxes_app=" + JSON.stringify(obj) + ";path=/;domain=qount.io";
            window.location.replace("https://taxes.qount.io");
          }
        }
/*
        else if (cookieKey == "dev_taxes_app") {
          if (obj.user.default_company.bucket == 'Business') {
            document.cookie = "dev=" + JSON.stringify(obj) + ";path=/;domain=qount.io";
          } else {
            document.cookie = "dev_taxes_app=" + JSON.stringify(obj) + ";path=/;domain=qount.io";
            window.location.replace(this.taxesBaseUIUrl);
          }
        }
*/

      }
    }
  }

  getCookieData(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  showCompanies(tabNum, companyType) {
    let base = this;
    this.tabDisplay.forEach(function(tab, index){
      base.tabDisplay[index] = {'display': 'none'};
    });

    this.loadingService.triggerLoadingEvent(true);
    this.companiesService.companiesByType(companyType).subscribe(companies => {
      this.tabDisplay[tabNum] = {'display': 'block'};
      this.allCompanies = companies;
      if (this.currentCompanyId) {
        this.currentCompany = _.find(this.allCompanies, {id: this.currentCompanyId});
      } else if (this.allCompanies.length > 0) {
        this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
      }
      this.buildTableData(this.allCompanies);
      this.loadingService.triggerLoadingEvent(false);
    }, error => this.handleError(error));
  }

}
