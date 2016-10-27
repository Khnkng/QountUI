/**
 * Created by seshu on 15-07-2016.
 */

import {Component} from "@angular/core";
import {CurrencyPipe} from "@angular/common";
import {TOAST_TYPE} from "../constants/Qount.constants";
import {ToastService} from "../services/Toast.service";
import {CompaniesService} from "../services/Companies.service";
import {Router} from "@angular/router";
import {CompanyModel} from "../../models/Company.model";



declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'companies',
  templateUrl: '/app/views/companies.html'
})

export class CompaniesComponent {
  type:string = "component";
  companies:Array<any>;
  hasCompanyList:boolean;
  tableData:any = {};
  tableOptions:any = {};
  displayCurrency:string='USD';
  verifiedComapnies: any = [];

  constructor(private companyService: CompaniesService, private _router:Router,private cp:CurrencyPipe,private _toastService: ToastService) {
    this.companyService.companies()
      .subscribe(companies  => this.buildTableData(companies), error =>  this.handleError(error));
  }

  buildTableData(companies) {
    this.companies = companies;
    this.tableData.columns = [
      {"name": "id", "title": "ID","visible": false},
      {"name": "name", "title": "Name"},
      {"name": "payables", "title": "Payables"},
      {"name": "pastDue", "title": "Past Due"},
      {"name": "admin", "title": "Admin"},
      {"name": "status", "title": ""},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    this.tableData.rows = [];
    let base = this;
    this.companies.forEach(function(company) {
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
      row['status'] = "<a class='button tiny' style='margin: 0 0 0 0;' data-action='verify'>Verify</a>";
      if(company.roles.indexOf('owner') != -1){
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      } else{
        row['actions'] = "";
      }
      base.tableData.rows.push(row);
    });
    this.hasCompanyList = true;
  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showCompany($event);
    } else if(action == 'delete'){
      this.removeCompany($event);
    } else if(action == 'verify'){
      this.verifiedComapnies.push($event.name);
    }
  }

  isCompanyVerified(company){
    return true;
  }

  showCompany(_company:CompanyModel) {
    let company = _.find(this.companies, function(comp:CompanyModel) {
      return comp.name == _company.name;
    });
    let link = ['/company', {"id": company.id}];
    this._router.navigate(link);
  }

  removeCompany(row:any) {
    let company:CompanyModel = row;
    this.companyService.removeCompany(company.id)
      .subscribe(success  => {
        _.remove(this.companies, function (_company) {
          return company.id == _company.id;
        });
        this._toastService.pop(TOAST_TYPE.success, "Company deleted successfully");
      }, error => {
        if(error)
        this._toastService.pop(TOAST_TYPE.error, JSON.parse(error).message);
        else
          this._toastService.pop(TOAST_TYPE.error, "Fail to delete company");
      });
  }

  handleError(error) {

  }
}
