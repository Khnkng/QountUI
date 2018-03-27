import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {Router} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {UsersModel} from "qCommon/app/models/Users.model";
import {ShareholdersForm} from "../forms/Shareholders.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {ReportService} from "reportsUI/app/services/Reports.service";
import {Shareholders} from "qCommon/app/services/Shareholders.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";

declare let jQuery: any;
declare let _: any;

@Component({
  selector: 'shareholders',
  templateUrl: '../views/shareholders.html'
})

export class ShareholdersComponent {
  tableData: any = {};
  tableOptions: any = {};
  status: any;
  shareholders: Array<any>;
  editMode: boolean = false;
  @ViewChild('createUser') createUser;
  @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
  row: any;
  shareholdersForm: FormGroup;
  @ViewChild('fooTableDir') fooTableDir: FTable;
  hasShareholdersList: boolean = false;
  message: string;
  companyId: string;
  roles: Array<any>;
  showFlyout: boolean = false;
  confirmSubscription: any;
  userId: any;
  routeSubscribe: any;
  shareholderTableColumns: Array<any> = ['First Name', 'Last Name', 'Email', 'SSN', 'Percentage', 'Phone Number'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
  showDownloadIcon: string = "hidden";
  chartOfAccounts: any;

  constructor(private _fb: FormBuilder, private _shareholdersForm: ShareholdersForm, private _router: Router,
              private _toastService: ToastService, private loadingService: LoadingService, private switchBoard: SwitchBoard,
              private titleService: pageTitleService, private reportsService: ReportService, private shareholdersService: Shareholders,
              private coaService: ChartOfAccountsService) {
    this.titleService.setPageTitle("Shareholders");
    this.shareholdersForm = this._fb.group(_shareholdersForm.getForm());
    this.companyId = Session.getCurrentCompany();
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteShareholder(toast));
    let defaultCompany: any = Session.getUser().default_company || {};
    this.loadingService.triggerLoadingEvent(true);
    this.shareholdersService.shareholders().subscribe(shareholders => {
      this.shareholders = shareholders;
      this.buildTableData();
    }, error => {});

    this.coaService.chartOfAccounts(this.companyId)
      .subscribe(chartOfAccounts => {
        chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
        this.chartOfAccounts = chartOfAccounts ? chartOfAccounts : [];
        _.sortBy(this.chartOfAccounts, ['number', 'name']);
      }, error => this.handleError(error));
    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      if (this.showFlyout) {
        this.hideFlyout();
      }else {
        this.toolsRedirect();
      }
    });
  }

  ngOnDestroy() {
    this.routeSubscribe.unsubscribe();
    this.confirmSubscription.unsubscribe();
  }

  toolsRedirect() {
    let link = ['tools'];
    this._router.navigate(link);
  }

  buildTableData() {
    this.hasShareholdersList = false;
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.rows = [];
    this.tableData.columns = [
      {"name": "id", "title": "ID", "filterable": false, "visible": false},
      {"name": "firstName", "title": "First Name"},
      {"name": "lastName", "title": "Last Name"},
      {"name": "email", "title": "Email"},
      {"name": "phoneNumber", "title": "Phone Number"},
      {"name": "coaId", "title": "COA", "filterable": false, "visible": false},
      {"name": "ssn", "title": "SSN"},
      {"name": "percentage", "title": "Percentage"},
      {"name": "actions", "title": "", "type": "html", "filterable": false}
    ];
    let base = this;
    this.shareholders.forEach(function(customers) {
      let row: any = {};
      for(let key in base.shareholders[0]) {
        row[key] = (key == 'percentage') ? base.getPercentageString(customers[key]) : customers[key];
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      }
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasShareholdersList = true;
    }, 0);
    setTimeout(function() {
      if (base.hasShareholdersList) {
        base.showDownloadIcon = "visible";
      }
    },600);
    this.loadingService.triggerLoadingEvent(false);
  }

  getPercentageString(inputString) {
    if (inputString) {
      return (inputString.indexOf('%') !== -1) ? inputString : (inputString + '%');
    }
  }

  showCreateShareholder() {
    this.titleService.setPageTitle("CREATE SHAREHOLDER");
    this.editMode = false;
    this.shareholdersForm = this._fb.group(this._shareholdersForm.getForm());
    // this.newForm1();
    this.showFlyout = true;
  }

  handleAction($event) {
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if (action == 'edit') {
      this.showEditShareholder($event);
    } else if (action == 'delete') {
      this.removeUser($event);
    }
  }

  deleteShareholder(toast) {
    this.loadingService.triggerLoadingEvent(true);
    this.shareholdersService.removeShareholder(this.userId)
      .subscribe(success  => {
        this._toastService.pop(TOAST_TYPE.success, "Shareholder Deleted Successfully");
        this.shareholdersService.shareholders()
          .subscribe(shareholders  => {
            this.shareholders = shareholders;
            this.buildTableData();
          }, error =>  this.handleError(error));
      }, error =>  this.handleError(error));
  }
  removeUser(row: any) {
    // let user:UsersModel = row;
    let id = row.id;
    this.userId = id;
    this._toastService.pop(TOAST_TYPE.confirm, "Are You Sure You Want To Delete?");
  }

  showEditShareholder(row: any) {
    this.titleService.setPageTitle("UPDATE SHAREHOLDER");
    this.editMode = true;
    this.showFlyout = true;
    this.row = row;
    if (row.percentage) {
      row.percentage = (row.percentage.indexOf('%') !== -1) ? row.percentage.replace('%', '') : row.percentage;
    }
    // this.newForm1();
    this._shareholdersForm.updateForm(this.shareholdersForm, row);
    let coa = _.find(this.chartOfAccounts, function(_coa) {
      return _coa.id == row.coaId;
    });
    var base = this;
    setTimeout(function () {
      base.coaComboBox.setValue(coa, 'name');
    },100);
  }

  submit($event) {
    this.loadingService.triggerLoadingEvent(true);
    $event && $event.preventDefault();
    let data = this._shareholdersForm.getData(this.shareholdersForm);
    // this.companyId = Session.getCurrentCompany();
    if (this.editMode) {
      data.id = this.row.id;
      this.shareholdersService.updateShareholder(data)
        .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
    } else {
      this.shareholdersService.addShareholder(data)
        .subscribe(success  => {
          this.showMessage(true, success);
        }, error =>  this.showMessage(false, error));
    }
    this.showFlyout = false;
  }

  showMessage(status, obj) {
    if (status) {
      this.status = {};
      this.status['success'] = true;
      this.hasShareholdersList = false;
      if (this.editMode) {
        this.shareholdersService.shareholders()
          .subscribe(shareholders  => {
            this.titleService.setPageTitle("Shareholders");
            this.shareholders = shareholders;
            this.buildTableData();
          }, error =>  this.handleError(error));
        // this.newForm1();
        this._toastService.pop(TOAST_TYPE.success, "Shareholder Updated Successfully.");
      } else {
        // this.newForm1();
        this.shareholdersService.shareholders()
          .subscribe(shareholders  => {
            this.titleService.setPageTitle("Shareholders");
            this.shareholders = shareholders;
            this.buildTableData();
          }, error =>  this.handleError(error));
        this._toastService.pop(TOAST_TYPE.success, "Shareholder Created Successfully.");
      }
    } else {
      this.loadingService.triggerLoadingEvent(false);
      this.status = {};
      this.status['error'] = true;
      this._toastService.pop(TOAST_TYPE.error, "Failed To Update The Shareholder");
      this.message = obj;
    }
  }

  handleError(error) {
    this.loadingService.triggerLoadingEvent(false);
    this._toastService.pop(TOAST_TYPE.confirm, "Failed To Perform Operation");
  }

  hideFlyout() {
    this.titleService.setPageTitle("Shareholders");
    this.row = {};
    this.showFlyout = !this.showFlyout;
  }

  getUsersTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["First Name"] = tempData[i].firstName;
      tempJsonArray["Last Name"] = tempData[i].lastName;
      tempJsonArray["Email"] = tempData[i].email;
      tempJsonArray["SSN"] = tempData[i].ssn;
      tempJsonArray["Percentage"] = tempData[i].percentage;
      tempJsonArray["Phone Number"] = tempData[i].phoneNumber;

      newTableData.push(tempJsonArray);
    }
    return newTableData;
  }

  buildPdfTabledata(fileType) {
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.shareholderTableColumns;
    this.pdfTableData.tableRows.rows = this.getUsersTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data => {
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "Shareholders.xls";
        link.click();
      }, error => {
        this._toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into Excel");
      });
  }

  exportToPDF() {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "Shareholders.pdf";
        link[0].click();
      }, error => {
        this._toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into PDF");
      });

  }

  showCOA(coa: any) {
    let data = this._shareholdersForm.getData(this.shareholdersForm);
    if (coa && coa.id) {
      data.coaId = coa.id;
    }else if (!coa || coa=='--None--') {
      data.coaId = '--None--';
    }
    this._shareholdersForm.updateForm(this.shareholdersForm, data);
  }


}
