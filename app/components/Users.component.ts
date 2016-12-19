import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {Router} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {CompanyUsers} from "qCommon/app/services/CompanyUsers.service";
import {UsersModel} from "qCommon/app/models/Users.model";
import {UsersForm} from "../forms/Users.form";
import {LoadingService} from "qCommon/app/services/LoadingService";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'users',
    templateUrl: '/app/views/users.html'
})

export class UsersComponent {
    tableData:any = {};
    tableOptions:any = {};
    status:any;
    users:Array<any>;
    editMode:boolean = false;
    @ViewChild('createUser') createUser;
    @ViewChild('userRoleComboBoxDir') userRoleComboBox: ComboBox;
    row:any;
    userForm: FormGroup;
    @ViewChild('fooTableDir') fooTableDir:FTable;
    hasUsersList:boolean = false;
    message:string;
    companyId:string;
    roles:Array<any>;
    canAddUsers:boolean = false;

    constructor(private _fb: FormBuilder, private usersService: CompanyUsers, private _usersForm:UsersForm,
                private _router: Router, private _toastService: ToastService, private loadingService:LoadingService,
                private switchBoard: SwitchBoard) {
        this.userForm = this._fb.group(_usersForm.getForm());
        this.companyId = Session.getCurrentCompany();
        let defaultCompany = Session.getUser().default_company || {};
        if(!_.isEmpty(defaultCompany)){
            let roles = defaultCompany.roles;
            if(roles.indexOf('Owner') != -1 || roles.indexOf('Account Manager') != -1){
                this.canAddUsers = true;
            }
        }
        this.loadingService.triggerLoadingEvent(true);
        this.usersService.roles().subscribe(roles => {
            _.remove(roles, {'id':'Admin'});
            this.roles=roles;
        }, error => this.handleError(error));
        if(this.companyId){
            this.usersService.users(this.companyId).subscribe(users => {
                this.loadingService.triggerLoadingEvent(false);
                this.buildTableData(users)
            }, error => this.handleError(error));
        }
    }

    ngOnDestroy(){
    }

    buildTableData(users) {
        this.users = users;
        this.hasUsersList = false;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.rows = [];
        this.tableData.columns = [
            {"name": "id", "title": "ID","filterable": false,"visible": false},
            {"name": "firstName", "title": "First Name"},
            {"name": "lastName", "title": "Last Name"},
            {"name": "email", "title": "Email"},
            {"name": "roleID", "title": "Role"},
            {"name": "actions", "title": "", "type": "html", "filterable": false}
        ];
        let base = this;
        this.users.forEach(function(customers) {
            let row:any = {};
            for(let key in base.users[0]) {
                row[key] = customers[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasUsersList = true;
        }, 0)
    }

    showCreateUser() {
        this.editMode = false;
        this.userForm = this._fb.group(this._usersForm.getForm());
        this.newForm1();
        jQuery(this.createUser.nativeElement).foundation('open');
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.showEditVendor($event);
        } else if(action == 'delete'){
            this.removeUser($event);
        }
    }

    showVendorProvince(role:any) {
        let countryControl:any = this.userForm.controls['roleID'];
        countryControl.patchValue(role.id);
    }

    removeUser(row:any) {
        this.loadingService.triggerLoadingEvent(true);
        let user:UsersModel = row;
        this.usersService.removeUser(user.id, this.companyId)
            .subscribe(success  => {
                this.loadingService.triggerLoadingEvent(false);
                this._toastService.pop(TOAST_TYPE.success, "User deleted successfully");
                this.usersService.users(this.companyId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
            }, error =>  this.handleError(error));
        _.remove(this.users, function (_user) {
            return user.id == _user.id;
        });
    }

    active1:boolean=true;
    newForm1(){
        this.active1 = false;
        setTimeout(()=> this.active1=true, 0);
    }

    showEditVendor(row:any) {
        this.editMode = true;
        jQuery(this.createUser.nativeElement).foundation('open');
        this.row = row;
        this.newForm1();
        this._usersForm.updateForm(this.userForm, row);
        let roleName = row.roleID;
        let role = _.find(this.roles, function(_country) {
            return _country.name == roleName;
        });
        var base=this;
        setTimeout(function () {
            base.userRoleComboBox.setValue(role, 'name');
        },100);
    }

    submit($event) {
        this.loadingService.triggerLoadingEvent(true);
        $event && $event.preventDefault();
        var data = this._usersForm.getData(this.userForm);
        this.companyId = Session.getCurrentCompany();
        if(this.editMode) {
            this.loadingService.triggerLoadingEvent(false);
            data.id=this.row.id;
            this.usersService.updateUser(<UsersModel>data, this.companyId)
                .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
            jQuery(this.createUser.nativeElement).foundation('close');
        } else {
            this.usersService.addUser(<UsersModel>data, this.companyId)
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
            this.hasUsersList=false;
            if(this.editMode) {
                this.usersService.users(this.companyId)
                    .subscribe(users  => this.buildTableData(users), error =>  this.handleError(error));
                this.newForm1();
                this._toastService.pop(TOAST_TYPE.success, "User updated successfully.");
            } else {
                this.newForm1();
                this.usersService.users(this.companyId)
                    .subscribe(users  => this.buildTableData(users), error =>  this.handleError(error));
                this._toastService.pop(TOAST_TYPE.success, "user created successfully.");
            }
        } else {
            this.status = {};
            this.status['error'] = true;
            this._toastService.pop(TOAST_TYPE.error, "Failed to update the user");
            this.message = obj;
        }
    }

    handleError(error) {

    }
}
