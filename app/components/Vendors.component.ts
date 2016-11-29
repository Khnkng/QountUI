/**
 * Created by seshu on 15-07-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {PROVINCES} from "qCommon/app/constants/Provinces.constants";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {VendorForm} from "qCommon/app/forms/Vendor.form";
import {Router} from "@angular/router";
import {VendorModel} from "../models/Vendor.model";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {CompanyModel} from "../models/Company.model";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'vendors',
  templateUrl: '/app/views/vendors.html'
})

export class VendorComponent {
  tableData:any = {};
  tableOptions:any = {};
  status:any;
  vendors:Array<any>;
  editMode:boolean = false;
  @ViewChild('createVendor') createVendor;
  @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox: ComboBox;
  row:any;
  vendorForm: FormGroup;
  countries:Array<any> = PROVINCES.COUNTRIES;
  @ViewChild('fooTableDir') fooTableDir:FTable;
  hasVendorsList:boolean = false;
  message:string;
  companyId:string;
  companies:Array<CompanyModel> = [];
  currentCompany:any = {};

  constructor(private _fb: FormBuilder, private companyService: CompaniesService, private _vendorForm:VendorForm, private _router: Router,
              private _toastService: ToastService, private switchBoard: SwitchBoard) {
    this.vendorForm = this._fb.group(_vendorForm.getForm());
    this.companyId = Session.getCurrentCompany();

    this.companyService.companies().subscribe(companies => {
      this.companies = companies;
      if(this.companyId){
        this.currentCompany = _.find(this.companies, {id: this.companyId});
      } else if(this.companies.length> 0){
        this.currentCompany = _.find(this.companies, {id: this.companies[0].id});
      }
      this.companyService.vendors(this.companyId).subscribe(vendors => this.buildTableData(vendors), error => this.handleError(error));
    }, error => this.handleError(error));
  }

  refreshCompany(curCompany){
    let companies = Session.getCompanies();
    let currentCompany = _.find(companies, {id: curCompany.id});
    this.companyId = currentCompany.id;
    this.companyService.vendors(this.companyId).subscribe(vendors => this.buildTableData(vendors), error => this.handleError(error));
  }

  getCompanyName(companyId){
    let companies = Session.getCompanies();
    let company = _.find(companies, {id: companyId});
    if(company){
      return company.name;
    }
  }

  buildTableData(vendors) {
    this.vendors = vendors;
    this.hasVendorsList = false;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      /*{"name": "companyID", "title": "Company"},*/
      {"name": "ein", "title": "Ein"},
      {"name": "email", "title": "Email"},
      {"name": "address", "title": "Address","visible": false},
      {"name": "phoneNumber", "title": "Phone Number"},
      {"name": "country", "title": "Country","visible": false},
      {"name": "state", "title": "State","visible": false},
      {"name": "city", "title": "City","visible": false},
      {"name": "zipcode", "title": "Zip code","visible": false},
      {"name": "id", "title": "ID","visible": false},
      {"name": "has1099", "title": "1099","visible": false},
      {"name": "paymentMethod", "title": "Payment Method","visible": false},
      {"name": "accountNumber", "title": "Account Number","visible": false},
      {"name": "routingNumber", "title": "RoutingNumber","visible": false},
      {"name": "creditCardNumber", "title": "Credit Card Number","visible": false},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    let base = this;
    this.vendors.forEach(function(vendor) {
      let row:any = {};
      for(let key in base.vendors[0]) {
        row[key] = vendor[key];
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      }
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasVendorsList = true;
    }, 0)
  }

  showCreateVendor() {
    this.editMode = false;
    this.vendorForm = this._fb.group(this._vendorForm.getForm());
    this.newForm1();
    jQuery(this.createVendor.nativeElement).foundation('open');
  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditVendor($event);
    } else if(action == 'delete'){
      this.removeVendor($event);
    }
  }

  showVendorProvince(country:any) {
    let countryControl:any = this.vendorForm.controls['country'];
    countryControl.patchValue(country.name);
  }

  removeVendor(row:any) {
    let vendor:VendorModel = row;
    this.companyService.removeVendor(vendor.id, this.companyId)
        .subscribe(success  => {
          this._toastService.pop(TOAST_TYPE.success, "Vendor deleted successfully");
          this.companyService.vendors(this.companyId)
              .subscribe(vendors  => this.buildTableData(vendors), error =>  this.handleError(error));
        }, error =>  this.handleError(error));
    _.remove(this.vendors, function (_vendor) {
      return vendor.id == _vendor.id;
    });
  }

  active1:boolean=true;
  newForm1(){
    this.active1 = false;
    setTimeout(()=> this.active1=true, 0);
  }

  showEditVendor(row:any) {
    this.editMode = true;
    jQuery(this.createVendor.nativeElement).foundation('open');
    this.row = row;
    this.newForm1();
    row.has1099=row.has1099 == 'true';
    this._vendorForm.updateForm(this.vendorForm, row);
    let countryName = row.country;
    let country = _.find(PROVINCES.COUNTRIES, function(_country) {
      return _country.name == countryName;
    });
    let stateName = row.state;
    var base=this;
    setTimeout(function () {
      base.vendorCountryComboBox.setValue(country, 'name');
    },100);
  }

  submit($event) {
    $event && $event.preventDefault();
    var data = this._vendorForm.getData(this.vendorForm);
    this.companyId = Session.getCurrentCompany();
    if(this.editMode) {
      data.id = this.row.id;
      this.companyService.updateVendor(<VendorModel>data, this.companyId)
          .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
      jQuery(this.createVendor.nativeElement).foundation('close');
    } else {
      this.companyService.addVendor(<VendorModel>data, this.companyId)
          .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
    }
  }

  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.hasVendorsList=false;
      if(this.editMode) {
        this.companyService.vendors(this.companyId)
            .subscribe(vendors  => this.buildTableData(vendors), error =>  this.handleError(error));
        this.newForm1();
        this._toastService.pop(TOAST_TYPE.success, "Vendor updated successfully.");
      } else {
        this.newForm1();
        this.companyService.vendors(this.companyId)
            .subscribe(vendors  => this.buildTableData(vendors), error =>  this.handleError(error));
        this._toastService.pop(TOAST_TYPE.success, "Vendor created successfully.");
      }
    } else {
      this.status = {};
      this.status['error'] = true;
      this._toastService.pop(TOAST_TYPE.error, "Failed to update the company");
      this.message = obj;
    }
  }

  handleError(error) {

  }
}
