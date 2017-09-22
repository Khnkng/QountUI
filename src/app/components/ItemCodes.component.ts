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
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {Router} from "@angular/router";

declare let jQuery:any;
declare let _:any;

@Component({
  selector: 'itemcodes',
  templateUrl: '../views/itemCodes.html',
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
  itemCodeId:any;
  row:any;
  tableColumns:Array<string> = ['name', 'id', 'payment_coa_mapping', 'invoice_coa_mapping', 'desc'];
  combo:boolean = true;
  allCOAList:Array<any> = [];
  showFlyout:boolean = false;
  confirmSubscription:any;
  companyCurrency:string;
  routeSubscribe:any;

  constructor(private _fb: FormBuilder, private _itemCodeForm: ItemCodeForm, private switchBoard: SwitchBoard,private _router: Router,
              private codeService: CodesService, private toastService: ToastService, private loadingService:LoadingService,
        private coaService: ChartOfAccountsService, private companiesService: CompaniesService,private titleService:pageTitleService){
    this.titleService.setPageTitle("Item Codes");
    this.itemcodeForm = this._fb.group(_itemCodeForm.getForm());
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteItemCode(toast));
    let companyId = Session.getCurrentCompany();
    this.companyCurrency = Session.getCurrentCompanyCurrency();
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
            chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
            this.filterChartOfAccounts(chartOfAccounts);
          }, error=> this.handleError(error));
    }, error => this.handleError(error));
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

  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
    this.row = {};
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  filterChartOfAccounts(chartOfAccounts){
    this.allCOAList = chartOfAccounts;
    this.paymentChartOfAccounts = _.filter(chartOfAccounts, function(coa){
      return coa.category == 'Expenses';
    });
    this.invoiceChartOfAccounts = _.filter(chartOfAccounts, function(coa){
      return coa.category == 'Income'||coa.category=='Revenue';
    });
    _.sortBy(this.paymentChartOfAccounts, ['number', 'name']);
    _.sortBy(this.invoiceChartOfAccounts, ['number', 'name']);
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
    this.titleService.setPageTitle("CREATE ITEM CODE");
    this.editMode = false;
    this.itemcodeForm = this._fb.group(this._itemCodeForm.getForm());
    this.newForm();
    this.showFlyout = true;
  }

  showEditItemCode(row: any){
    this.titleService.setPageTitle("UPDATE ITEM CODE");
    this.loadingService.triggerLoadingEvent(true);
    this.codeService.getItemCode(row.id)
        .subscribe(item => {
         this.row=item;
          let paymentCOAIndex = _.findIndex(this.paymentChartOfAccounts, function(coa){
            return coa.id == row.payment_coa_mapping;
          });
          let invoiceCOAIndex = _.findIndex(this.invoiceChartOfAccounts, function(coa){
            return coa.id == row.invoice_coa_mapping;
          });
          setTimeout(function(){
            base.paymentCOAComboBox.setValue(base.paymentChartOfAccounts[paymentCOAIndex], 'name');
            base.invoiceCOAComboBox.setValue(base.invoiceChartOfAccounts[invoiceCOAIndex], 'name');
          },0);

          let isService:any = this.itemcodeForm.controls['is_service'];
          isService.patchValue(item.is_service);

          let deferredRevenue:any = this.itemcodeForm.controls['deferredRevenue'];
          deferredRevenue.patchValue(item.deferredRevenue);

          this._itemCodeForm.updateForm(this.itemcodeForm, item);
          this.loadingService.triggerLoadingEvent(false);
        }, error => this.handleError(error));
    let base = this;
    this.editMode = true;
    this.newForm();
    this.showFlyout = true;
  }
  deleteItemCode(toast){
    this.loadingService.triggerLoadingEvent(true);
    this.codeService.removeItemCode(this.itemCodeId)
        .subscribe(coa => {
         // this.loadingService.triggerLoadingEvent(false);
          this.toastService.pop(TOAST_TYPE.success, "Item code deleted successfully");
          //this.itemCodes.splice(_.findIndex(this.itemCodes, {id: this.itemCodeId}, 1));
          this.codeService.itemCodes(this.currentCompany.id)
              .subscribe(itemCodes => this.buildTableData(itemCodes), error=> this.handleError(error));
        }, error => this.handleError(error));
  }
  removeItemCode(row: any){
     this.itemCodeId = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
  }

  newForm(){
    this.newFormActive = false;
    setTimeout(()=> this.newFormActive=true, 0);
  }

  updatePaymentCOA(paymentCOA){
    let data = this._itemCodeForm.getData(this.itemcodeForm);
    if(paymentCOA&&paymentCOA.id){
      data.payment_coa_mapping = paymentCOA.id;
    }else if(!paymentCOA||paymentCOA=='--None--'){
      data.payment_coa_mapping = '--None--';
    }
    this._itemCodeForm.updateForm(this.itemcodeForm, data);
  }

  updateInvoiceCOA(invoiceCOA){
    let data = this._itemCodeForm.getData(this.itemcodeForm);
    if(invoiceCOA&&invoiceCOA.id){
      data.invoice_coa_mapping = invoiceCOA.id;
    }else if(!invoiceCOA||invoiceCOA=='--None--'){
      data.invoice_coa_mapping='--None--';
    }
    this._itemCodeForm.updateForm(this.itemcodeForm, data);
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
    let base = this;
    $event && $event.preventDefault();
    let data = this._itemCodeForm.getData(this.itemcodeForm);

    if(data.payment_coa_mapping=='--None--'||data.payment_coa_mapping==''){
      data.payment_coa_mapping=null;
    }
    if(data.invoice_coa_mapping=='--None--'||data.invoice_coa_mapping==''){
      data.invoice_coa_mapping=null;
    }

    if(!data.payment_coa_mapping && !data.invoice_coa_mapping){
      this.toastService.pop(TOAST_TYPE.error, "Please select payment COA or invoice COA");
      return;
    }
    this.loadingService.triggerLoadingEvent(true);
    if(this.editMode){
      data.id = this.row.id;
      data.companyID = this.currentCompany.id;
      this.codeService.updateItemCode(data)
          .subscribe(itemCode => {
            //base.loadingService.triggerLoadingEvent(false);
            base.row = {};
            base.toastService.pop(TOAST_TYPE.success, "ItemCode updated successfully");
            let index = _.findIndex(base.itemCodes, {id: data.id});
            base.itemCodes[index] = itemCode;
            base.buildTableData(base.itemCodes);
            this.showFlyout = false;
          }, error => this.handleError(error));
    } else{
      data.companyID = this.currentCompany.id;
      this.codeService.addItemCode(data)
          .subscribe(newItemcode => {
            //this.loadingService.triggerLoadingEvent(false);
            this.handleItemCode(newItemcode);
            this.showFlyout = false;
          }, error => this.handleError(error));
    }
    //this.buildTableData(this.itemCodes);

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
      {"name": "name", "title": "Name", "visible": false},
      {"name": "name", "title": "Name"},
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
    this.loadingService.triggerLoadingEvent(false);
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
  hideFlyout(){
    this.titleService.setPageTitle("Item Codes");
    this.row = {};
    this.showFlyout = !this.showFlyout;
  }
}
