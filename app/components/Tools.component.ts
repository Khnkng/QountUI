/**
 * Created by seshu on 27-02-2016.
 */

import {Component, Input, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {PAGES} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {BadgeService} from "qCommon/app/services/Badge.service";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'tools',
  templateUrl: '/app/views/tools.html'
})

export class ToolsComponent {
  companyCount: number = 0;
  vendorCount: number = 0;
  taxesCount:number = 0;
  rulesCount = 0;
  modulesCount = 0;
  customerCount: number = 0;
  employeeCount: number = 0;
  itemCount: number = 0;
  coaCount: number = 0;
  expenseCodeCount: number = 0;
  billCount: number = 0;
  dimensionCount: number = 0;
  usersCount:number=0;
  accountsCount:number = 0;
  ruleCount:number = 0;
  employeesCount:number = 0;

  constructor(private switchBoard:SwitchBoard, private _router:Router, private badgeService: BadgeService) {
    let currentCompany = Session.getCurrentCompany();
    if(currentCompany){
      this.refreshCompany({id: currentCompany});
    }
  }

  refreshCompany(company){
    this.badgeService.getToolsBadgeCount(company.id).subscribe(badges => {
      this.coaCount = badges.chartOfAccounts;
      this.companyCount = badges.companies;
      this.customerCount = badges.customers;
      this.expenseCodeCount = badges.expenseCodes;
      this.itemCount = badges.itemCodes;
      this.vendorCount = badges.vendors;
      this.taxesCount=badges.taxesCount;
      this.rulesCount=badges.rulesCount;
      this.modulesCount=badges.modulesCount;
      this.usersCount= badges.companyUsers;
      this.dimensionCount = badges.dimensions;
    }, error => this.handleError(error));
  }

  handleError(error){

  }

  showPage(page, $event) {
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
      case 'dimensions': {
        let link = ['dimensions'];
        this._router.navigate(link);
      }
        break;
      case 'accounts': {
        let link = ['financialAccounts'];
        this._router.navigate(link);
      }
        break;
      case 'reports': {
        let link = ['reports/dashboard'];
        this._router.navigate(link);
      }
        break;
      case 'workflow': {
        let link = ['payments/workflow'];
        this._router.navigate(link);
      }
      break;
      case 'invoice_settings': {
        let link = ['invoices/invoiceSettings'];
        this._router.navigate(link);
      }
      break;
      case 'items': {
        let link = ['itemCodes'];
        this._router.navigate(link);
      }
      break;
      case 'expensecode': {
        let link = ['expensecode'];
        this._router.navigate(link);
      }
      break;
      case 'customers': {
        let link = ['customers'];
        this._router.navigate(link);
      }
      break;
      case 'users': {
        let link = ['users'];
        this._router.navigate(link);
      }
        break;
      case 'taxes': {
        let link = ['taxes'];
        this._router.navigate(link);
      }
      break;
      case 'modules': {
        let link = ['modules'];
        this._router.navigate(link);
      }
      break;
      case 'rules': {
        let link = ['rules'];
        this._router.navigate(link);
      }
      break;
      case 'employees': {
        let link = ['employees'];
        this._router.navigate(link);
      }
    }
  }
}
