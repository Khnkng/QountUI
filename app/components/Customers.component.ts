
import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {Address} from "qCommon/app/directives/address.directive";
import {PROVINCES} from "qCommon/app/constants/Provinces.constants";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {Router} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {CompanyModel} from "../models/Company.model";
import {CustomersService} from "../services/Customers.service";
import {CustomersModel} from "../models/Customers.model";
import {CustomersForm} from "../forms/Customers.form";
import {LoadingService} from "qCommon/app/services/LoadingService";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'vendors',
    templateUrl: '/app/views/customers.html'
})

export class CustomersComponent {
    tableData:any = {};
    tableOptions:any = {};
    status:any;
    customers:Array<any>;
    editMode:boolean = false;
    @ViewChild('createVendor') createVendor;
    @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox: ComboBox;
    @ViewChild('addressDir') addressDir: Address;
    row:any;
    customerForm: FormGroup;
    countries:Array<any> = PROVINCES.COUNTRIES;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    hasCustomersList:boolean = false;
    message:string;
    companyId:string;
    companies:Array<CompanyModel> = [];
    companyName:string;
    countryCode:string;
    showAddress:boolean;
    showFlyout:boolean = false;

    constructor(private _fb: FormBuilder, private customersService: CustomersService,
                private _customersForm:CustomersForm, private _router: Router, private _toastService: ToastService,
                private switchBoard: SwitchBoard, private loadingService:LoadingService) {
        this.customerForm = this._fb.group(_customersForm.getForm());
        this.companyId = Session.getCurrentCompany();
        if(this.companyId){
            this.loadingService.triggerLoadingEvent(true);
            this.customersService.customers(this.companyId).subscribe(customers => {
                this.buildTableData(customers);
                this.loadingService.triggerLoadingEvent(false);
            }, error => this.handleError(error));
        }else {
            this._toastService.pop(TOAST_TYPE.error, "Please add company first");
        }
    }

    ngOnDestroy(){
    }

    buildTableData(customers) {
        this.customers = customers;
        this.hasCustomersList = false;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.rows = [];
        this.tableData.columns = [
            {"name": "customer_id", "title": "ID"},
            {"name": "customer_name", "title": "Name"},
            {"name": "customer_ein", "title": "Ein"},
            {"name": "customer_address", "title": "Address","visible": false},
            {"name": "customer_country", "title": "Country","visible": false},
            {"name": "customer_state", "title": "State","visible": false},
            {"name": "customer_city", "title": "City","visible": false},
            {"name": "customer_zipcode", "title": "Zip code","visible": false},
            {"name": "actions", "title": "", "type": "html", "filterable": false}
        ];
        let base = this;
        this.customers.forEach(function(customers) {
            let row:any = {};
            for(let key in base.customers[0]) {
                row[key] = customers[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasCustomersList = true;
        }, 0)
    }

    showCreateVendor() {
        let self = this;
        let defaultCountry  = {name:'United States', code:'US'};
        this.editMode = false;
        this.customerForm = this._fb.group(this._customersForm.getForm());
        this.newForm1();
        setTimeout(function () {
            self.vendorCountryComboBox.setValue(defaultCountry, 'name');
        },100);
        this.showVendorProvince(defaultCountry);
        this.showFlyout = true;
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
        let countryControl:any = this.customerForm.controls['customer_country'];
        countryControl.patchValue(country.name);
        this.countryCode = country.code;
        this.showAddress = false;
        setTimeout(()=> this.showAddress=true, 0);
    }

    removeVendor(row:any) {
        let customer:CustomersModel = row;
        this.loadingService.triggerLoadingEvent(true);
        this.customersService.removeCustomer(customer.customer_id, this.companyId)
            .subscribe(success  => {
                this.loadingService.triggerLoadingEvent(false);
                this._toastService.pop(TOAST_TYPE.success, "Customer deleted successfully");
                this.customersService.customers(this.companyId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
            }, error =>  this.handleError(error));
        _.remove(this.customers, function (_customer) {
            return customer.customer_id == _customer.customer_id;
        });
    }

    active1:boolean=true;
    newForm1(){
        this.active1 = false;
        setTimeout(()=> this.active1=true, 0);
    }

    showEditVendor(row:any) {
        this.editMode = true;
        this.showFlyout = true;
        this.row = row;
        this.newForm1();
        this._customersForm.updateForm(this.customerForm, row);
        let countryName = row.customer_country;
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
        this.loadingService.triggerLoadingEvent(true);
        $event && $event.preventDefault();
        var data = this._customersForm.getData(this.customerForm);
        this.companyId = Session.getCurrentCompany();
        var data1 = this.addressDir.getData();
        for(var prop in data1) {
            data[prop] = data1[prop];
        }
        if(this.editMode) {
            data.customer_id=this.row.customer_id;
            this.customersService.updateCustomer(<CustomersModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                }, error =>  this.showMessage(false, error));
            this.showFlyout = false;
        } else {
            this.customersService.addCustomer(<CustomersModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);

                }, error =>  this.showMessage(false, error));
        }

    }

    showMessage(status, obj) {
        if(status) {
            this.status = {};
            this.status['success'] = true;
            this.hasCustomersList=false;
            if(this.editMode) {
                this.customersService.customers(this.companyId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
                this.newForm1();
                this._toastService.pop(TOAST_TYPE.success, "Customer updated successfully.");
            } else {
                this.newForm1();
                this.customersService.customers(this.companyId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
                this._toastService.pop(TOAST_TYPE.success, "Customer created successfully.");
            }
            this.newCustomer();
        } else {
            this.status = {};
            this.status['error'] = true;
            this._toastService.pop(TOAST_TYPE.error, "Failed to update the customer");
            this.message = obj;
        }
    }

    addressValid() {
    if(this.addressDir) {
        return this.addressDir.isValid();

    } return false;
    }


    // Reset the form with a new hero AND restore 'pristine' class state
    // by toggling 'active' flag which causes the form
    // to be removed/re-added in a tick via NgIf
    // TODO: Workaround until NgForm has a reset method (#6822)
    active = true;

    newCustomer() {
        this.active = false;
        this.showAddress = false;
        setTimeout(()=> this.active=true, 0);
    }


    handleError(error) {

    }
    hideFlyout(){
        this.row = {};
        this.showFlyout = !this.showFlyout;
    }
}
