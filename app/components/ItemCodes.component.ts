/**
 * Created by Chandu on 28-09-2016.
 */

import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CodesService} from "qCommon/app/services/CodesService.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ItemCodeForm} from "../forms/ItemCode.form";
import {LoadingService} from "qCommon/app/services/LoadingService";

declare let jQuery:any;
declare let _:any;

@Component({
  selector: 'itemcodes',
  templateUrl: '/app/views/itemCodes.html',
})

export class ItemCodesComponent{
  itemcodeForm: FormGroup;
  itemCodes = [];
  paymentChartOfAccounts:any = [];
  invoiceChartOfAccounts:any = [];
  newFormActive:boolean = true;
  @ViewChild('addItemcode') addItemcode;
  @ViewChild('paymentCOAComboBoxDir') paymentCOAComboBox: ComboBox;
  @ViewChild('invoiceCOAComboBoxDir') invoiceCOAComboBox: ComboBox;
  hasItemCodes: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  currentCompany:any;
  allCompanies:Array<any>;
  row:any;
  tableColumns:Array<string> = ['name', 'id', 'payment_coa_mapping', 'invoice_coa_mapping', 'desc'];
  combo:boolean = true;
  allCOAList:Array<any> = [];

  constructor(private _fb: FormBuilder, private _itemCodeForm: ItemCodeForm, private switchBoard: SwitchBoard,
              private codeService: CodesService, private toastService: ToastService, private loadingService:LoadingService,
        private coaService: ChartOfAccountsService, private companiesService: CompaniesService){
    this.itemcodeForm = this._fb.group(_itemCodeForm.getForm());
    let companyId = Session.getCurrentCompany();
    this.loadingService.triggerLoadingEvent(true);
    this.companiesService.companies().subscribe(companies => {
      this.allCompanies = companies;
      if(companyId){
        this.currentCompany = _.find(this.allCompanies, {id: companyId});
      } else if(this.allCompanies.length> 0){
        this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
      }
      this.coaService.chartOfAccounts(this.currentCompany.id)
          .subscribe(chartOfAccounts => {
            this.filterChartOfAccounts(chartOfAccounts);
            this.loadingService.triggerLoadingEvent(false);
          }, error=> this.handleError(error));
    }, error => this.handleError(error));
  }

  handleError(error){
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  filterChartOfAccounts(chartOfAccounts){
    this.allCOAList = chartOfAccounts;
    this.paymentChartOfAccounts = _.filter(chartOfAccounts, function(coa){
      return coa.category == 'Expenses';
    });
    this.invoiceChartOfAccounts = _.filter(chartOfAccounts, function(coa){
      return coa.category == 'Income';
    });
    this.codeService.itemCodes(this.currentCompany.id)
        .subscribe(itemCodes => this.buildTableData(itemCodes), error=> this.handleError(error));
  }

  isValid(itemcodeForm){
    let data = this._itemCodeForm.getData(itemcodeForm);
    if(data.payment_coa_mapping || data.invoice_coa_mapping){
      return itemcodeForm.valid;
    }
    return false;
  }

  showAddItemCode() {
    this.editMode = false;
    this.itemcodeForm = this._fb.group(this._itemCodeForm.getForm());
    this.newForm();
    jQuery(this.addItemcode.nativeElement).foundation('open');
  }

  showEditItemCode(row: any){
    let base = this;
    this.editMode = true;
    this.newForm();
    this.row = row;
    let paymentCOAIndex = _.findIndex(this.paymentChartOfAccounts, function(coa){
      return coa.id == row.payment_coa_mapping;
    });
    let invoiceCOAIndex = _.findIndex(this.paymentChartOfAccounts, function(coa){
      return coa.id == row.invoice_coa_mapping;
    });
    setTimeout(function(){
      base.paymentCOAComboBox.setValue(base.paymentChartOfAccounts[paymentCOAIndex], 'name');
      base.invoiceCOAComboBox.setValue(base.invoiceChartOfAccounts[invoiceCOAIndex], 'name');
    },0);
    this._itemCodeForm.updateForm(this.itemcodeForm, row);
    jQuery(this.addItemcode.nativeElement).foundation('open');
  }

  removeItemCode(row: any){
    let itemCodeId = row.id;
    this.loadingService.triggerLoadingEvent(true);
    this.codeService.removeItemCode(itemCodeId)
        .subscribe(coa => {
          this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.success, "Deleted Item code successfully");
          this.itemCodes.splice(_.findIndex(this.itemCodes, {id: itemCodeId}, 1));
        }, error => this.handleError(error));
  }

  newForm(){
    this.newFormActive = false;
    setTimeout(()=> this.newFormActive=true, 0);
  }

  updatePaymentCOA(paymentCOA){
    let paymentCOAControl:any = this.itemcodeForm.controls['payment_coa_mapping'];
    if(paymentCOA){
      paymentCOAControl.patchValue(paymentCOA.id);
    }
  }

  updateInvoiceCOA(invoiceCOA){
    let invoiceCOAControl:any = this.itemcodeForm.controls['invoice_coa_mapping'];
    if(invoiceCOA){
      invoiceCOAControl.patchValue(invoiceCOA.id);
    }
  }

  ngOnInit(){

  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditItemCode($event);
    } else if(action == 'delete'){
      this.removeItemCode($event);
    }
  }

  submit($event){
    this.loadingService.triggerLoadingEvent(true);
    let base = this;
    $event && $event.preventDefault();
    let data = this._itemCodeForm.getData(this.itemcodeForm);
    if(this.editMode){
      data.id = this.row.id;
      data.companyID = this.currentCompany.id;
      this.codeService.updateItemCode(data)
          .subscribe(itemCode => {
            base.loadingService.triggerLoadingEvent(false);
            base.row = {};
            base.toastService.pop(TOAST_TYPE.success, "ItemCode updated successfully");
            let index = _.findIndex(base.itemCodes, {id: data.id});
            base.itemCodes[index] = itemCode;
            base.buildTableData(base.itemCodes);
          }, error => this.handleError(error));
    } else{
      data.companyID = this.currentCompany.id;
      this.codeService.addItemCode(data)
          .subscribe(newItemcode => {
            this.loadingService.triggerLoadingEvent(false);
            this.handleItemCode(newItemcode);
          }, error => this.handleError(error));
    }
    this.buildTableData(this.itemCodes);
    jQuery(this.addItemcode.nativeElement).foundation('close');
  }

  handleItemCode(newItemCode){
    this.toastService.pop(TOAST_TYPE.success, "ItemCode created successfully");
    this.itemCodes.push(newItemCode);
    this.buildTableData(this.itemCodes);
  }

  buildTableData(itemCodes) {
    this.hasItemCodes = false;
    this.itemCodes = itemCodes;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "desc", "title": "Description"},
      {"name": "paymentCOAName", "title": "Payment COA"},
      {"name": "payment_coa_mapping", "title": "payment COA id", "visible": false},
      {"name": "invoiceCOAName", "title": "Invoice COA"},
      {"name": "invoice_coa_mapping", "title": "invoice COA id", "visible": false},
      {"name": "companyID", "title": "Company ID", "visible": false},
      {"name": "id", "title": "Id", "visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    itemCodes.forEach(function(itemCode) {
      let row:any = {};
      _.each(base.tableColumns, function(key) {
        if(key == 'payment_coa_mapping'){
          row['paymentCOAName'] = base.getCOAName(itemCode[key]);
          row[key] = itemCode[key];
        } else if(key == 'invoice_coa_mapping'){
          row['invoiceCOAName'] = base.getCOAName(itemCode[key]);
          row[key] = itemCode[key];
        } else{
          row[key] = itemCode[key];
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasItemCodes = true;
    }, 0)
  }

  getCOAName(coaId){
    let coa = _.find(this.allCOAList, function(coa){
      return coa.id == coaId;
    });
    if(coa){
      return coa.name;
    }
    return "";
  }
}
