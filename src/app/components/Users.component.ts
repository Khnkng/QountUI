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
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare let jQuery:any;
declare let _:any;

@Component({
  selector: 'users',
  templateUrl: '../views/users.html'
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
  showFlyout:boolean = false;
  confirmSubscription:any;
  userId:any;
  routeSubscribe:any;
  usersTableColumns: Array<any> = ['First Name', 'Last Name', 'Email', 'Role'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
  showDownloadIcon:string = "hidden";

  constructor(private _fb: FormBuilder, private usersService: CompanyUsers, private _usersForm:UsersForm,
              private _router: Router, private _toastService: ToastService, private loadingService:LoadingService,
              private switchBoard: SwitchBoard, private titleService:pageTitleService, private reportsService: ReportService) {
    this.titleService.setPageTitle("Users");
    this.userForm = this._fb.group(_usersForm.getForm());
    this.companyId = Session.getCurrentCompany();
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteUser(toast));
    let defaultCompany:any = Session.getUser().default_company || {};
    if(!_.isEmpty(defaultCompany)){
      let roles = defaultCompany.roles;
      if(roles.indexOf('Owner') != -1 || roles.indexOf('Account Manager') != -1 || roles.indexOf('Admin') != -1 || roles.indexOf('Yoda') != -1){
        this.canAddUsers = true;
      }
    }
    this.usersService.roles().subscribe(roles => {
      _.remove(roles, {'id':'Admin'});
      _.remove(roles, {'id':'Yoda'});
      this.roles=roles;
    }, error => this.handleError(error));
    if(this.companyId){
      this.loadingService.triggerLoadingEvent(true);
      this.usersService.users(this.companyId).subscribe(users => {
        let usersList=_.filter(users, function(user) { return user.roleID!='Yoda'; });
        this.buildTableData(usersList);
      }, error => this.handleError(error));
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
    }, 0);
    setTimeout(function() {
      if(base.hasUsersList){
        base.showDownloadIcon = "visible";
      }
    },600);
    this.loadingService.triggerLoadingEvent(false);
  }

  showCreateUser() {
    this.titleService.setPageTitle("CREATE USER");
    this.editMode = false;
    this.userForm = this._fb.group(this._usersForm.getForm());
    this.newForm1();
    this.showFlyout = true;
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
  deleteUser(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.usersService.removeUser(this.userId, this.companyId)
      .subscribe(success  => {
        this._toastService.pop(TOAST_TYPE.success, "User deleted successfully");
        this.usersService.users(this.companyId)
          .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
      }, error =>  this.handleError(error));
  }
  removeUser(row:any) {
    let user:UsersModel = row;
    this.userId=user.id;

    this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
  }

  active1:boolean=true;
  newForm1(){
    this.active1 = false;
    setTimeout(()=> this.active1=true, 0);
  }

  showEditVendor(row:any) {
    this.titleService.setPageTitle("UPDATE USER");
    this.editMode = true;
    //    jQuery(this.createUser.nativeElement).foundation('open');
    this.showFlyout=true;
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
      data.id=this.row.id;
      this.usersService.updateUser(<UsersModel>data, this.companyId)
        .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
      //   jQuery(this.createUser.nativeElement).foundation('close');
    } else {
      this.usersService.addUser(<UsersModel>data, this.companyId)
        .subscribe(success  => {
          this.showMessage(true, success);
        }, error =>  this.showMessage(false, error));
    }
    this.showFlyout = false;
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
      this.loadingService.triggerLoadingEvent(false);
      this.status = {};
      this.status['error'] = true;
      this._toastService.pop(TOAST_TYPE.error, "Failed to update the user");
      this.message = obj;
    }
  }

  handleError(error) {
    this.loadingService.triggerLoadingEvent(false);
    error = JSON.parse(error);
    let message = error && error.message? error.message: "User Deletion Failed";
    this._toastService.pop(TOAST_TYPE.error, message);
  }

  hideFlyout(){
    this.titleService.setPageTitle("Users");
    this.row = {};
    this.showFlyout = !this.showFlyout;
  }

  getUsersTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for(let i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["First Name"] = tempData[i].firstName;
      tempJsonArray["Last Name"] = tempData[i].lastName;
      tempJsonArray["Email"] = tempData[i].email;
      tempJsonArray["Role"] = tempData[i].roleID;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType) {
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.usersTableColumns;
    this.pdfTableData.tableRows.rows = this.getUsersTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "Users.xls";
        link.click();
      }, error =>{
        this._toastService.pop(TOAST_TYPE.error, "Failed to Export table into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF() {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "Users.pdf";
        link[0].click();
      }, error =>{
        this._toastService.pop(TOAST_TYPE.error, "Failed to Export table into PDF");
      });

  }

}
