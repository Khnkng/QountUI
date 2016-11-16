/**
 * Created by seshu on 27-02-2016.
 */

import {Component, Input, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {PAGES} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'tools',
  templateUrl: '/app/views/tools.html'
})

export class ToolsComponent {
  companyCount: number = 0;
  vendorCount: number = 0;
  customerCount: number = 0;
  employeeCount: number = 0;
  itemCount: number = 0;
  coaCount: number = 0;
  expenseCodeCount: number = 0;
  billCount: number = 0;
  companySwitchSubscription:any;

  constructor(private switchBoard:SwitchBoard, private _router:Router, private companiesService: CompaniesService, private coaService: ChartOfAccountsService) {
    console.info('QountApp Tools Component Mounted Successfully7');
    let companies = Session.getCompanies() || [];
    this.companyCount = companies.length;

    this.companySwitchSubscription = this.switchBoard.onCompanyChange.subscribe(currentCompany => this.refreshCompany(currentCompany));

    let currentCompany = Session.getCurrentCompany();
    if(currentCompany){
      this.refreshCompany({id: currentCompany});
    }
  }

  refreshCompany(company){
    this.companiesService.vendors(company.id)
        .subscribe(vendors => {
          this.vendorCount = vendors.length;
        }, error => this.handleError(error));
    this.coaService.chartOfAccounts(company.id)
        .subscribe(chartOfAccounts => {
          this.coaCount = chartOfAccounts.length;
        }, error => this.handleError(error));
  }

  handleError(error){

  }

  showPage(page:PAGES, $event) {
    $event && $event.stopImmediatePropagation();
    switch (page) {
      case 'companies': {
        let link = ['companies'];
        this._router.navigate(link);
      }
      break;
      case 'vendors': {
        let link = ['vendors'];
        this._router.navigate(link);
      }
      break;
      case 'chartofaccounts': {
        let link = ['chartOfAccounts'];
        this._router.navigate(link);
      }
      break;
      case 'reports': {
        let link = ['reports'];
        this._router.navigate(link);
      }
        break;
      case 'workflow': {
        let link = ['payments/workflow'];
        this._router.navigate(link);
      }
        break;
    }
  }
}
