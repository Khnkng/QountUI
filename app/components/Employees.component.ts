
import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
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
import {EmployeeService} from "qCommon/app/services/Employees.service";
import {EmployeesModel} from "../models/Employees.model";
import {EmployeesForm} from "../forms/Employees.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'employees',
    templateUrl: '/app/views/employees.html'
})

export class EmployeesComponent {
    tableData:any = {};
    tableOptions:any = {};
    status:any;
    customerId:any;
    employees:Array<any>;
    editMode:boolean = false;
    @ViewChild('createVendor') createVendor;

    row:any;
    customerForm: FormGroup;
    countries:Array<any> = PROVINCES.COUNTRIES;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    hasEmployeesList:boolean = false;
    message:string;
    companyId:string;
    companies:Array<CompanyModel> = [];
    companyName:string;
    countryCode:string;
    showAddress:boolean;
    showFlyout:boolean = false;
    chartOfAccounts:any;
    confirmSubscription:any;

    constructor(private _fb: FormBuilder, private employeeService: EmployeeService,
                private _employeesForm:EmployeesForm, private _router: Router, private _toastService: ToastService,
                private switchBoard: SwitchBoard, private loadingService:LoadingService,private coaService: ChartOfAccountsService) {
        this.customerForm = this._fb.group(_employeesForm.getForm());
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteVendor(toast));
        this.companyId = Session.getCurrentCompany();
        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(chartOfAccounts => {
                this.chartOfAccounts=chartOfAccounts?_.filter(chartOfAccounts, {'type': 'accountsReceivable'}):[];
                _.sortBy(this.chartOfAccounts, ['number', 'name']);
            }, error=> this.handleError(error));
        if(this.companyId){
            this.loadingService.triggerLoadingEvent(true);
            this.employeeService.customers(this.companyId).subscribe(employees => {

                this.buildTableData(employees);
                this.loadingService.triggerLoadingEvent(false);
            }, error => this.handleError(error));
        }else {
            this._toastService.pop(TOAST_TYPE.error, "Please add company first");
        }
    }

    ngOnDestroy(){
        this.confirmSubscription.unsubscribe();
    }

    buildTableData(employees) {
        this.employees = employees;
        this.hasEmployeesList = false;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.rows = [];
        this.tableData.columns = [
            {"name": "first_name", "title": "FirstName"},
            {"name": "last_name", "title": "LastName"},
            {"name": "ssn", "title": "SSN"},
            {"name": "email_id", "title": "Email"},
            {"name": "phone", "title": "Phone"},
            {"name": "actions", "title": "", "type": "html", "filterable": false}
        ];
        let base = this;
        this.employees.forEach(function(employees) {
            let row:any = {};
            for(let key in base.employees[0]) {
                row[key] = employees[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasEmployeesList = true;
        }, 0)
    }

    showCreateEmployee() {
        let self = this;
        let defaultCountry  = {name:'United States', code:'US'};
        this.editMode = false;
        this.customerForm = this._fb.group(this._employeesForm.getForm());
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
    deleteVendor(toast){
        this.loadingService.triggerLoadingEvent(true);
        this.employeeService.removeCustomer(this.customerId, this.companyId)
            .subscribe(success  => {
                this.loadingService.triggerLoadingEvent(false);
                this._toastService.pop(TOAST_TYPE.success, "Customer deleted successfully");
                this.employeeService.customers(this.companyId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
            }, error =>  this.handleError(error));
    }
    removeVendor(row:any) {
        let customer:EmployeesModel = row;
        this.customerId=customer.customer_id;
        this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }

    active1:boolean=true;
    newForm1(){
        this.active1 = false;
        setTimeout(()=> this.active1=true, 0);
    }
    showCOA(coa:any) {
        let data= this._employeesForm.getData(this.customerForm);
        if(coa && coa.id){
            data.coa = coa.id;
        }else if(!coa||coa=='--None--'){
            data.coa='--None--';
        }
        this._employeesForm.updateForm(this.customerForm, data);
    }
    showEditVendor(row:any) {
        this.editMode = true;
        this.showFlyout = true;
        this.row = row;
        this.employeeService.customer(row.customer_id, this.companyId)
            .subscribe(customer => {
                this.row = customer;
                let email_id:any = this.customerForm.controls['email_id'];
                email_id.patchValue(customer.email_id);
                let customer_address:any = this.customerForm.controls['customer_address'];
                customer_address.patchValue(customer.customer_address);
                let customer_city:any = this.customerForm.controls['customer_city'];
                customer_city.patchValue(customer.customer_city);
                let customer_state:any = this.customerForm.controls['customer_state'];
                customer_state.patchValue(customer.customer_state);
                let customer_zipcode:any = this.customerForm.controls['customer_zipcode'];
                customer_zipcode.patchValue(customer.customer_zipcode);
                let phone_number:any = this.customerForm.controls['phone_number'];
                phone_number.patchValue(customer.phone_number);
                let coa = _.find(this.chartOfAccounts, function(_coa) {
                    return _coa.id == customer.coa;
                });
                if(!_.isEmpty(coa)){
                    setTimeout(function(){
                        base.coaComboBox.setValue(coa, 'name');
                    });
                }

                let countryName = row.customer_country;
                let country = _.find(PROVINCES.COUNTRIES, function(_country) {
                    return _country.name == countryName;
                });
                let stateName = row.state;
                var base=this;

                setTimeout(function () {
                    base.vendorCountryComboBox.setValue(country, 'name');
                },100);
                this._employeesForm.updateForm(this.customerForm, row);
            }, error => this.handleError(error));
    }

    submit($event) {
        $event && $event.preventDefault();
        var data = this._employeesForm.getData(this.customerForm);
        this.companyId = Session.getCurrentCompany();
        if(data.coa=='--None--'||data.coa==''){
            this._toastService.pop(TOAST_TYPE.error, "Please select payment COA");
            return;
        }
        this.loadingService.triggerLoadingEvent(true);
        if(this.editMode) {
            data.customer_id=this.row.customer_id;
            this.employeeService.updateCustomer(<EmployeesModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                }, error =>  this.showMessage(false, error));
            this.showFlyout = false;
        } else {
            this.employeeService.addCustomer(<EmployeesModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);

                }, error =>  this.showMessage(false, error));
            this.showFlyout = false;
        }

    }

    showMessage(status, obj) {
        if(status) {
            this.status = {};
            this.status['success'] = true;
            this.hasEmployeesList=false;
            if(this.editMode) {
                this.employeeService.customers(this.companyId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
                this.newForm1();
                this._toastService.pop(TOAST_TYPE.success, "Customer updated successfully.");
            } else {
                this.newForm1();
                this.employeeService.customers(this.companyId)
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
        this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
    }
    hideFlyout(){
        this.row = {};
        this.showFlyout = !this.showFlyout;
    }
}
