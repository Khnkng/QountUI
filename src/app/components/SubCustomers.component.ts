
import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder, FormArray} from "@angular/forms";
import {Address} from "qCommon/app/directives/address.directive";
import {PROVINCES} from "qCommon/app/constants/Provinces.constants";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {Router, ActivatedRoute} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {CompanyModel} from "../models/Company.model";
import {CustomersService} from "qCommon/app/services/Customers.service";
import {CustomersModel} from "../models/Customers.model";
import {CustomersForm, ContactLineForm} from "../forms/Customers.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {YEARS, MONTHS} from "qCommon/app/constants/Date.constants";
import {CreditCardType} from "qCommon/app/models/CreditCardType";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {ReportService} from "reportsUI/app/services/Reports.service";
import {StateService} from "qCommon/app/services/StateService";

declare var jQuery: any;
declare var _: any;

@Component({
    selector: 'subCustomers',
    templateUrl: '../views/subCustomers.html'
})

export class SubCustomersComponent {
    tableData: any = {};
    tableOptions: any = {};
    status: any;
    customerId: any;
    customers: Array<any>;
    editMode: boolean = false;
    @ViewChild('createVendor') createVendor;
    @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox: ComboBox;
    @ViewChild('addressDir') addressDir: Address;
    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    row: any;
    subCustomerForm: FormGroup;
    countries: Array<any> = PROVINCES.COUNTRIES;
    @ViewChild('fooTableDir') fooTableDir: FTable;
    hasSubCustomersList: boolean = false;
    message: string;
    companyId: string;
    companies: Array<CompanyModel> = [];
    companyName: string;
    countryCode: string;
    showAddress: boolean;
    showFlyout: boolean = false;
    chartOfAccounts: any;
    confirmSubscription: any;
    publicKey: string;
    payment_spring_token: string;
    last4: string;
    isCardDeleted: boolean;
    routeSubscribe: any;
    ContactLineArray: FormArray = new FormArray([]);
    customersTableColumns: Array<any> = ['Name', 'EIN', 'Email', 'Phone Number'];
    pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
    showDownloadIcon: string = "hidden";
    routeSub: any;
    parentCustomerId: string;

  constructor(private _fb: FormBuilder, private customersService: CustomersService, private _customersForm: CustomersForm,
              private _contactLineForm: ContactLineForm, private _router: Router, private _toastService: ToastService,
                private switchBoard: SwitchBoard, private loadingService: LoadingService, private coaService: ChartOfAccountsService,
              private titleService: pageTitleService, private reportsService: ReportService, private _route: ActivatedRoute,
              private stateService: StateService) {
        this.titleService.setPageTitle("Sub Customers");

        let _form: any = this._customersForm.getForm();
        _form['customer_contact_details'] = this.ContactLineArray;
        this.subCustomerForm = this._fb.group(_form);
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteVendor(toast));
        this.companyId = Session.getCurrentCompany();
        this.routeSub = this._route.params.subscribe(params => {
          this.parentCustomerId = params['customerId'];
        });

        this.coaService.chartOfAccounts(this.companyId)
            .subscribe(chartOfAccounts => {
                chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
                this.chartOfAccounts = chartOfAccounts ? chartOfAccounts : [];
                _.sortBy(this.chartOfAccounts, ['number', 'name']);
            }, error => this.handleError(error));
        if (this.companyId) {
            this.loadingService.triggerLoadingEvent(true);
            this.customersService.subCustomers(this.companyId, this.parentCustomerId).subscribe(customers => {
                this.buildTableData(customers);
            }, error => this.handleError(error));
        }else {
            this.loadingService.triggerLoadingEvent(false);
            this._toastService.pop(TOAST_TYPE.error, "Please add company first");
        }
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
            if (this.showFlyout) {
                this.hideFlyout();
            }else {
              this.showPreviousPage();
            }
        });
    }

    showPreviousPage() {
      const prevState = this.stateService.getPrevState();
      if (prevState) {
        this.stateService.pop();
        this._router.navigate([prevState.url]);
      } else {
        this.toolsRedirect();
      }
    }

    toolsRedirect() {
        let link = ['tools'];
        this._router.navigate(link);
    }

    ngOnDestroy() {
        this.confirmSubscription.unsubscribe();
        this.routeSubscribe.unsubscribe();
    }

    buildTableData(customers) {
        this.customers = customers;
        this.hasSubCustomersList = false;
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.rows = [];
        this.tableData.columns = [
            {"name": "customer_id", "title": "ID", "visible": false},
            {"name": "customer_name", "title": "Name"},
            {"name": "customer_ein", "title": "Ein"},
            {"name": "email_ids", "title": "Email"},
            {"name": "phone_number", "title": "Phone Number"},
            {"name": "customer_address", "title": "Address", "visible": false},
            {"name": "customer_country", "title": "Country", "visible": false},
            {"name": "customer_state", "title": "State", "visible": false},
            {"name": "customer_city", "title": "City", "visible": false},
            {"name": "customer_zipcode", "title": "Zip code", "visible": false},
            {"name": "actions", "title": "", "type": "html", "filterable": false}
        ];
        let base = this;
        this.customers.forEach(function(customers) {
            let row: any = {};
            for(let key in base.customers[0]) {
                row[key] = customers[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            }
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasSubCustomersList = true;
        });
        setTimeout(function() {
          if (base.hasSubCustomersList){
            base.showDownloadIcon = "visible";
          }
        }, 650);
        this.loadingService.triggerLoadingEvent(false);
    }

    showCreateVendor() {
        this.titleService.setPageTitle("CREATE SUB CUSTOMER");
        let self = this;
        let defaultCountry = {name: 'United States', code: 'US'};
        this.editMode = false;
        this.addContactList();
        this.newForm1();
        this.showVendorProvince(defaultCountry);
        this.showFlyout = true;
    }

    handleAction($event) {
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditVendor($event);
        } else if (action == 'delete') {
            this.removeVendor($event);
        }
    }

    showVendorProvince(country: any) {
        let countryControl: any = this.subCustomerForm.controls['customer_country'];
        countryControl.patchValue(country.name);
        this.countryCode = country.code;
        this.showAddress = false;
        setTimeout(() => this.showAddress = true, 0);
    }

    deleteVendor(toast) {
        this.loadingService.triggerLoadingEvent(true);
        this.customersService.removeSubCustomer(this.customerId, this.companyId, this.parentCustomerId)
            .subscribe(success  => {
                this.loadingService.triggerLoadingEvent(false);
                this._toastService.pop(TOAST_TYPE.success, "Customer deleted successfully");
                this.customersService.subCustomers(this.companyId, this.parentCustomerId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
            }, error =>  this.handleError(error));
    }

    removeVendor(row: any) {
        let customer: CustomersModel = row;
        this.customerId = customer.customer_id;
        this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }

    active1: boolean = true;
    newForm1() {
        this.active1 = false;
        setTimeout(() => this.active1 = true, 0);
    }

    showCOA(coa: any) {
        let data = this._customersForm.getData(this.subCustomerForm);
        if (coa && coa.id) {
            data.coa = coa.id;
        }else if (!coa || coa == '--None--') {
            data.coa = '--None--';
        }
        this._customersForm.updateForm(this.subCustomerForm, data);
    }

    showEditVendor(row: any) {
        this.titleService.setPageTitle("UPDATE SUB CUSTOMER");
        this.editMode = true;
        this.showFlyout = true;
        this.row = row;
        this.loadingService.triggerLoadingEvent(true);
        this.customersService.subCustomer(row.customer_id, this.companyId, this.parentCustomerId)
            .subscribe(customer => {
                this.row = customer;
                this.loadingService.triggerLoadingEvent(false);
                let coa = _.find(this.chartOfAccounts, function(_coa) {
                    return _coa.id == customer.coa;
                });
                if (!_.isEmpty(coa)) {
                    setTimeout(function(){
                        base.coaComboBox.setValue(coa, 'name');
                    });
                }

                let countryName = row.customer_country;
                let country = _.find(PROVINCES.COUNTRIES, function(_country) {
                    return _country.name == countryName;
                });
                let stateName = row.state;
                let base = this;

                base.loadingService.triggerLoadingEvent(false);

                setTimeout(function () {
                    base.vendorCountryComboBox.setValue(country, 'name');
                }, 100);
                let contactLineControl: any = this.subCustomerForm.controls['customer_contact_details'];
                customer.customer_contact_details.forEach(function(contactLine: any){
                    contactLineControl.controls.push(base._fb.group(base._contactLineForm.getForm(contactLine)));
                });
                this._customersForm.updateForm(this.subCustomerForm, this.row);
            }, error => this.handleError(error));
    }

    submit($event) {
        $event && $event.preventDefault();
        var data = this._customersForm.getData(this.subCustomerForm);
        this.companyId = Session.getCurrentCompany();
        if (data.coa == '--None--' || data.coa == '') {
            this._toastService.pop(TOAST_TYPE.error, "Please select payment COA");
            return;
        }
        this.saveDetails();
    }

    saveDetails() {
        this.loadingService.triggerLoadingEvent(true);
        var data = this._customersForm.getData(this.subCustomerForm);
        data.customer_contact_details = this.getContactData(this.subCustomerForm.controls['customer_contact_details']);

        if (this.editMode) {
            data.customer_id = this.row.customer_id;
            this.customersService.updateSubCustomer(data, this.companyId, this.parentCustomerId)
                .subscribe(success  => {
                    this.showMessage(true, success);
                }, error =>  this.showMessage(false, error));
            this.showFlyout = false;
        } else {
            this.customersService.addSubCustomer(data, this.companyId, this.parentCustomerId)
                .subscribe(success  => {
                    this.showMessage(true, success);
                }, error =>  this.showMessage(false, error));
            this.showFlyout = false;
        }
    }

    showMessage(status, obj) {
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.hasSubCustomersList = false;
            if (this.editMode) {
                this.resetForm();
                this.customersService.subCustomers(this.companyId, this.parentCustomerId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
                this.newForm1();
                this._toastService.pop(TOAST_TYPE.success, "Customer updated successfully.");
            } else {
                this.newForm1();
                this.resetForm();
                this.customersService.subCustomers(this.companyId, this.parentCustomerId)
                    .subscribe(customers  => this.buildTableData(customers), error =>  this.handleError(error));
                this._toastService.pop(TOAST_TYPE.success, "Customer created successfully.");
            }
            this.newCustomer();
        } else {
            this.loadingService.triggerLoadingEvent(false);
            this.resetForm();
            this.status = {};
            this.status['error'] = true;
            this._toastService.pop(TOAST_TYPE.error, "Failed to update the customer");
            this.message = obj;
        }
    }

    addressValid() {
        if (this.addressDir) {
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
        setTimeout(() => this.active = true, 0);
    }

    handleError(error) {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
    }
    hideFlyout() {
        this.titleService.setPageTitle("SUB CUSTOMERS");
        this.row = {};
        this.showFlyout = !this.showFlyout;
        this.resetForm();
    }

    getEmailIds() {
        let data = this._customersForm.getData(this.subCustomerForm);
        return data.email_ids || [];
    }

    addContactList(line?:any) {
        let customer: any = {};
        let _form: any = this._contactLineForm.getForm(line);
        let contactListForm = this._fb.group(_form);
        if (!line) {
            let contactControl: any = this.subCustomerForm.controls['customer_contact_details'];
            contactControl.controls.push(contactListForm);
            this._customersForm.updateForm(this.subCustomerForm, customer);
        }
    }

    resetForm() {
        let _form = this._customersForm.getForm();
        _form['customer_contact_details'] = new FormArray([]);
        this.subCustomerForm = this._fb.group(_form);
    }

    getContactData(customerForm) {
        let base = this;
        let data = [];
        _.each(customerForm.controls, function(contactControl){
            let itemData = base._contactLineForm.getData(contactControl);
            if (itemData.email)
                data.push(itemData);
        });
        return data;
    }

  getCustomersTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["Name"] = tempData[i].customer_name;
      tempJsonArray["EIN"] = tempData[i].customer_ein;
      tempJsonArray["Email"] = tempData[i].email_ids.join();
      tempJsonArray["Phone Number"] = tempData[i].phone_number;

      newTableData.push(tempJsonArray);
    }
    return newTableData;
  }

  buildPdfTabledata(fileType) {
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.customersTableColumns;
    this.pdfTableData.tableRows.rows = this.getCustomersTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "Customers.xls";
        link.click();
      }, error => {
        this._toastService.pop(TOAST_TYPE.error, "Failed to Export table into Excel");
      });
  }

  exportToPDF() {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "Customers.pdf";
        link[0].click();
      }, error => {
        this._toastService.pop(TOAST_TYPE.error, "Failed to Export table into PDF");
      });
  }

}
