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
import {UrlService} from "qCommon/app/services/UrlService";

declare let _: any;
declare let jQuery: any;
declare let moment: any;
declare let BroadcastChannel: any;
declare let moduleId: any;

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
  tabsRequired = false;
  taxCompanies: any;
  businessCompanies: any;

  constructor(private _router: Router, private _route: ActivatedRoute, private toastService: ToastService, private switchBoard: SwitchBoard,
              private companiesService: CompaniesService, private loadingService: LoadingService, private userProfileService: UserProfileService,
              private titleService: pageTitleService, private numeralService: NumeralService) {
    this.loadingService.triggerLoadingEvent(true);
    this.currentCompanyId = Session.getCurrentCompany();
    this.currentCompanyName = Session.getCurrentCompanyName();
    this.compSubscription = this.switchBoard.onCompanyAddOrDelete.subscribe(msg => {
      this.fetchCompanies();
    });
    this.fetchCompanies();
    this.titleService.setPageTitle("Switch Company");
    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      let link = ['/dashboard'];
      this._router.navigate(link);
    });
  }

  fetchCompanies() {
    this.companiesService.companies().subscribe(companies => {
      this.taxCompanies = _.filter(companies, {bucket: "1040"});
      this.businessCompanies = _.filter(companies, {bucket: "Business"});
      if (this.taxCompanies.length > 0) {
        this.tabsRequired = true;
        this.showCompanies(0);
      } else {
        this.allCompanies = companies;
        this.setCurrentCompany();
        this.buildTableData(this.allCompanies);
      }
    }, error => this.handleError(error));
  }

  setCurrentCompany() {
    if (this.currentCompanyId) {
      this.currentCompany = _.find(this.allCompanies, {id: this.currentCompanyId});
    } else if (this.allCompanies.length > 0) {
      this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
    }
  }

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
      this.changeCompany($event);
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
      {"name": "bucket", "title": "Bucket", "visible": false, "filterable": false},
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
      row.bucket = company.bucket;
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
      .subscribe(response => {
        Session.put("user", response.user);
        this.updateCookie(response.user.default_company);
      });
  }

  changeCompany(company) {
    Session.setCurrentCompany(company.id);
    Session.setCurrentCompanyName(company.name);
    Session.setFiscalStartDate(company.fiscalStartDate);
    this.setDefaultCompany(company.id);
    this.numeralService.switchLocale(company.defaultCurrency);
    Session.setCompanyReportCurrency(company.reportCurrency || "");
    Session.setCurrentCompanyCurrency(company.defaultCurrency);
    Session.setLockDate(company.lockDate);
    this.switchBoard.onSwitchCompany.next({});
    let ch1 = new BroadcastChannel('refresh-company');
    ch1.postMessage(moduleId);
    this.currentCompanyName = company.name;
    this.currentCompanyId = company.id;
    this.currentCompany = company;
  }

  updateCookie(company) {
    console.log("Company data = ", company);
    this.currentEnvironment = environment;
    const cookieKey = this.currentEnvironment.production ? "prod" : "dev";
    let data = this.getCookieData(cookieKey);
    if (data) {
      let obj = JSON.parse(data);
      if (obj) {
        obj.user.defaultCompany = company.id;
        obj.user.default_company = company;
        obj.user['default_company']['lock_date'] = company.lock_date ? company.lock_date : '';
        obj.user.default_company.fiscalStartDate ? obj.user.default_company.fiscalStartDate = company.fiscalStartDate : "";
        obj.referer = 'oneApp';
        // this.refreshTable();
        this.transferCookieAndRedirect(obj);
      }
    }
  }

  transferCookieAndRedirect(obj) {
    const cookieKey = this.currentEnvironment.production ? "prod" : "dev";
    if (obj.user.default_company.bucket === 'Business') {
      document.cookie = cookieKey + "=" + JSON.stringify(obj) + ";path=/;domain=qount.io";
      this.navigatePage();
    } else {
      document.cookie = cookieKey + "_taxes_app=" + JSON.stringify(obj) + ";path=/;domain=qount.io";
      Session.destroy();
      window.location.replace(UrlService.getBaseUrl('TAXES'));
    }
  }

  navigatePage() {
    let link = 'dashboard';
    if (Session.get('user').tempPassword) {
      link = 'activate';
    } else {
      let defaultCompany: any = Session.getUser().default_company;
      if (!_.isEmpty(defaultCompany) && (defaultCompany.roles.indexOf('Owner') != -1 || defaultCompany.roles.indexOf('Yoda') != -1)) {
        if (!defaultCompany.tcAccepted) {
          link = 'termsAndConditions';
        }
      }
    }
    this._router.navigate([link]);
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

  showCompanies(tabNum) {
    let base = this;
    this.tabDisplay.forEach(function(tab, index){
      base.tabDisplay[index] = {'display': 'none'};
    });
    this.tabDisplay[tabNum] = {'display': 'block'};
    if (tabNum === 0) {
      this.allCompanies = this.businessCompanies;
    } else if (tabNum === 1) {
      this.allCompanies = this.taxCompanies;
    }
    this.setCurrentCompany();
    this.buildTableData(this.allCompanies);
  }

}
