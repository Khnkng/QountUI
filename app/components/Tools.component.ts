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
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {CodesService} from "qCommon/app/services/CodesService.service";
import {ExpensesSerice} from "../services/Expenses.service";
import {UsersService} from "../services/Users.service";
import {CustomersService} from "../services/Customers.service";

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
  dimensionCount: number = 0;
  usersCount:number=0;

  constructor(private switchBoard:SwitchBoard, private _router:Router, private companiesService: CompaniesService, private coaService: ChartOfAccountsService,
              private codeService: CodesService, private expenseService: ExpensesSerice, private dimensionService: DimensionService,private usersService:UsersService,private customersService:CustomersService) {
    console.info('QountApp Tools Component Mounted Successfully7');
    let currentCompany = Session.getCurrentCompany();
    if(currentCompany){
      this.refreshCompany({id: currentCompany});
    }
  }

  refreshCompany(company){
    this.companiesService.companies().subscribe(companies => {
          this.companyCount = companies.length;
        }, error => this.handleError(error));
    this.companiesService.vendors(company.id).subscribe(vendors => {
          this.vendorCount = vendors.length;
        }, error => this.handleError(error));
    this.coaService.chartOfAccounts(company.id).subscribe(chartOfAccounts => {
          this.coaCount = chartOfAccounts.length;
        }, error => this.handleError(error));
    this.codeService.itemCodes(company.id).subscribe(itemCodes => {
          this.itemCount = itemCodes.length;
        }, error=> this.handleError(error));
    this.expenseService.getAllExpenses(company.id).subscribe(expenses => {
        this.expenseCodeCount = expenses.length;
      }, error=> this.handleError(error));
    this.expenseService.getAllExpenses(company.id)
        .subscribe(expenseCodes =>{
          this.expenseCodeCount = expenseCodes.length;
        }, error=> this.handleError(error));
    this.dimensionService.dimensions(company.id)
        .subscribe(dimensions => {
          this.dimensionCount = dimensions.length;
        }, error => this.handleError(error));
    this.usersService.users(company.id).subscribe(users => {
      this.usersCount=users.length;
    }, error => this.handleError(error));
    this.customersService.customers(company.id).subscribe(customers => {
      this.customerCount=customers.length;
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
      case 'dimensions': {
        let link = ['dimensions'];
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
    }
  }
}
