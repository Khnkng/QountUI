
import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
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
import {pageTitleService} from "qCommon/app/services/PageTitle";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'employees',
    templateUrl: '../views/employees.html'
})

export class EmployeesComponent {
    tableData:any = {};
    tableOptions:any = {};
    status:any;
    employeeId:any;
    employees:Array<any>;
    editMode:boolean = false;
    @ViewChild('createVendor') createVendor;

    row:any;
    employeesForm: FormGroup;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    hasEmployeesList:boolean = false;
    message:string;
    companyId:string;
    companies:Array<CompanyModel> = [];
    companyName:string;
    showFlyout:boolean = false;
    confirmSubscription:any;
  routeSubscribe:any;
    constructor(private _fb: FormBuilder, private employeeService: EmployeeService,
                private _employeesForm:EmployeesForm, private _router: Router, private _toastService: ToastService,
                private switchBoard: SwitchBoard, private loadingService:LoadingService,private titleService:pageTitleService) {
        this.titleService.setPageTitle("Employees");
        this.employeesForm = this._fb.group(_employeesForm.getForm());
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteEmployee(toast));
        this.companyId = Session.getCurrentCompany();

        if(this.companyId){
            this.loadingService.triggerLoadingEvent(true);
            this.employeeService.employees(this.companyId).subscribe(employees => {
                this.buildTableData(employees);
            }, error => this.handleError(error));
        }else {
            this._toastService.pop(TOAST_TYPE.error, "Please add company first");
        }
      this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
        if(this.showFlyout){
          this.hideFlyout();
        }else {
          this.toolsRedirect();
        }
      });
    }

  toolsRedirect(){
    let link = ['tools'];
    this._router.navigate(link);
  }


  ngOnDestroy(){
    this.routeSubscribe.unsubscribe();
    this.confirmSubscription.unsubscribe();
  }

    buildTableData(employees) {
        this.employees = employees;
        this.hasEmployeesList = false;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.rows = [];
        this.tableData.columns = [
            {"name": "id", "title": "ID","visible":false},
            {"name": "first_name", "title": "FirstName"},
            {"name": "last_name", "title": "LastName"},
            {"name": "ssn", "title": "SSN"},
            {"name": "email_id", "title": "Email"},
            {"name": "phone_number", "title": "Phone"},
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
        this.loadingService.triggerLoadingEvent(false);
    }

    showCreateEmployee() {
        this.titleService.setPageTitle("CREATE EMPLOYEE");
        let self = this;
        this.editMode = false;
        this.employeesForm = this._fb.group(this._employeesForm.getForm());
        this.newForm1();
        this.showFlyout = true;
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.showEditEmployee($event);
        } else if(action == 'delete'){
            this.removeEmployee($event);
        }
    }


    deleteEmployee(toast){
        this.loadingService.triggerLoadingEvent(true);
        this.employeeService.removeEmployee(this.employeeId, this.companyId)
            .subscribe(success  => {
                this.loadingService.triggerLoadingEvent(false);
                this._toastService.pop(TOAST_TYPE.success, "Customer deleted successfully");
                this.employeeService.employees(this.companyId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
            }, error =>  this.handleError(error));
    }

    removeEmployee(row:any) {
        let employee:EmployeesModel = row;
        this.employeeId=employee.id;
        this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }

    active1:boolean=true;
    newForm1(){
        this.active1 = false;
        setTimeout(()=> this.active1=true, 0);
    }

    showEditEmployee(row:any) {
        this.titleService.setPageTitle("UPDATE EMPLOYEE");
        this.editMode = true;
        this.showFlyout = true;
        this.row = row;
        this.employeeService.employee(row.id, this.companyId)
            .subscribe(employee => {
                this.row = employee;
                let email_id:any = this.employeesForm.controls['email_id'];
                email_id.patchValue(employee.email_id);
                let phone_number:any = this.employeesForm.controls['phone_number'];
                phone_number.patchValue(employee.phone_number);

                var base=this;

                this._employeesForm.updateForm(this.employeesForm, row);
            }, error => this.handleError(error));
    }

    submit($event) {
        $event && $event.preventDefault();
        var data = this._employeesForm.getData(this.employeesForm);
        this.companyId = Session.getCurrentCompany();

        this.loadingService.triggerLoadingEvent(true);
        if(this.editMode) {
            data.id=this.row.id;
            this.employeeService.updateEmployee(<EmployeesModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                }, error =>  this.showMessage(false, error));
            this.showFlyout = false;
        } else {
            this.employeeService.addEmployee(<EmployeesModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);

                }, error =>  this.showMessage(false, error));
            this.showFlyout = false;
        }

    }

    showMessage(status, obj) {
        this.loadingService.triggerLoadingEvent(false);
        if(status) {
            this.status = {};
            this.status['success'] = true;
            this.hasEmployeesList=false;
            if(this.editMode) {
                this.employeeService.employees(this.companyId)
                    .subscribe(employees  => this.buildTableData(employees), error =>  this.handleError(error));
                this.newForm1();
                this._toastService.pop(TOAST_TYPE.success, "Employee updated successfully.");
            } else {
                this.newForm1();
                this.employeeService.employees(this.companyId)
                    .subscribe(employees  => this.buildTableData(employees), error =>  this.handleError(error));
                this._toastService.pop(TOAST_TYPE.success, "Employee created successfully.");
            }
            this.newCustomer();
        } else {
            this.status = {};
            this.status['error'] = true;
            this._toastService.pop(TOAST_TYPE.error, "Failed to update the Employee");
            this.message = obj;
        }
    }


    setDateOfBirth(date: string){
        let empDateControl:any = this.employeesForm.controls['dob'];
        empDateControl.patchValue(date);
    }
    // Reset the form with a new hero AND restore 'pristine' class state
    // by toggling 'active' flag which causes the form
    // to be removed/re-added in a tick via NgIf
    // TODO: Workaround until NgForm has a reset method (#6822)
    active = true;

    newCustomer() {
        this.active = false;
        setTimeout(()=> this.active=true, 0);
    }


    handleError(error) {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
    }
    hideFlyout(){
        this.titleService.setPageTitle("Employees");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    }
}
