
import {Component, ViewChild,ElementRef} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {DepositsForm, DepositsLineForm} from "../forms/Deposits.form";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants"
import {CustomersService} from "qCommon/app/services/Customers.service";
import {DepositService} from "qCommon/app/services/Deposit.service";
import {InvoicesService} from "invoicesUI/app/services/Invoices.service";
import {PaymentsService} from "qCommon/app/services/Payments.service";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {StateService} from "qCommon/app/services/StateService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {CURRENCY_LOCALE_MAPPER} from "qCommon/app/constants/Currency.constants";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {State} from "qCommon/app/models/State";
import {Shareholders} from "qCommon/app/services/Shareholders.service";


declare let jQuery:any;
declare let _:any;
declare let moment:any;

@Component({
    selector: 'deposit',
    templateUrl: '../views/Deposits.html',
})

export class DepositComponent{
    depositForm: FormGroup;
    newItemForm: FormGroup;
    editItemForm: FormGroup;
    routeSub:any;
    depositID:string;
    newDeposit: boolean = false;
    currentCompanyId: string;
    accounts:Array<any>=[];
    customers:Array<any> = [];
    invoices:Array<any> = [];
    chartOfAccounts:Array<any> = [];
    // addNewItemFlag:boolean = false;
    editingItems:any={};
    dimensionFlyoutCSS:any;
    itemActive:boolean = false;
    dimensions:Array<any> = [];
    selectedDimensions:Array<any> = [];
    editItemIndex:number;
    companyCurrency: string;
    defaultDate:string;
    stayFlyout:boolean = false;
    entities:Array<any>=[];
    dateFormat:string;
    serviceDateformat:string;
    key:string;
    validateLockDate:boolean=false;
    tempData:any;
    lineTotal:number=0;
    routeSubscribe:any;
    formattedLineTotal:string;
    localeFormat:string='en-US';
    selectedEntityID:string;


    /*mapping changes*/
    mappingFlyoutCSS:any;
     tableColumns:Array<string> = [ 'id', 'invoiceNumber', 'invoiceDate', 'amountPaid', 'paymentDate','customerName','mapping'];
     mappings = [];
     hasMappings: boolean = false;
     tableData:any = {};
     tableOptions:any = {};
     row:any;
     selectedMappingID:string;
     expenseType:string;
     bankAccountID:string;
     isMappingPrevious:boolean;

    @ViewChild("accountComboBoxDir") accountComboBox: ComboBox;
    @ViewChild("editCOAComboBoxDir") editCOAComboBox: ComboBox;
    @ViewChild("editEntityComboBoxDir") editEntityComboBox: ComboBox;
    @ViewChild("editInvoiceComboBoxDir") editInvoiceComboBox: ComboBox;
    @ViewChild('list') el:ElementRef;

    @ViewChild('depositsMapping') mappingelement:ElementRef;
    selectedRows:Array<any> = [];
    depositData:any;
    isMappingsModified:boolean;
    vendorList:Array<any>=[];
    customersList:Array<any>=[];
    shareHoldersList:Array<any>=[];


    constructor(private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _depositForm: DepositsForm,
                private _depositLineForm: DepositsLineForm, private accountsService: FinancialAccountsService, private coaService: ChartOfAccountsService,
                private depositService: DepositService, private toastService: ToastService,
                private loadingService: LoadingService, private dimensionService: DimensionService,private customersService: CustomersService,
                private invoiceService:InvoicesService,private vendorService: CompaniesService,private paymentsService:PaymentsService,
                private dateFormater:DateFormater, private stateService: StateService,private titleService:pageTitleService,_switchBoard:SwitchBoard,private numeralService:NumeralService,
                private shareholdersService: Shareholders){
        this.currentCompanyId = Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.localeFormat=CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]?CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]:'en-US';
        this.loadEntityData();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.routeSub = this._route.params.subscribe(params => {
            this.depositID=params['depositID'];
            if(!this.depositID){
                this.newDeposit = true;
                this.defaultDate=moment(new Date()).format(this.dateFormat);
            }
        });
        this.loadAllServices();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(title => {
            if(this.itemActive){
                this.hideFlyout();
            }else if(this.mappingFlyoutCSS == "expanded"){
                this.hideMappingPage();
            }else {
                this.showDepositsPage()
            }
        });
      let state = this.stateService.getPrevState();
      if(state && state.key == 'showMappingPage'){
        this.isMappingPrevious=true;
        this.gotoPreviousState();
      }else {
        this.accountsService.financialAccounts(this.currentCompanyId)
          .subscribe(accounts=> {
            this.accounts = accounts.accounts;
            this.loaddeposit();
          }, error => {

          });
      }
    }
  gotoPreviousState(){
    let base=this;
    if(this.newDeposit){
      this.titleService.setPageTitle("Create Deposit");
    }else {
      this.titleService.setPageTitle("Update Deposit");
    }
    let prevState = this.stateService.getPrevState();
    this.stateService.pop();
      let data = prevState.data || [];
      if(data){
        this.accounts=data.bankAccounts;
        this.selectedRows=data.selectedRows;
        this.bankAccountID=data.depositdata.bank_account_id;
        data.depositdata.date=this.dateFormater.formatDate(data.depositdata.date,this.dateFormat,this.serviceDateformat);
        setTimeout(function(){
          base.processDeposits(data.depositdata);
          base.showMappingPage();
        },200)
    }
  }

    showDepositsPage(bankID?){
        if(this.stayFlyout){
            let base=this;
            this.initialize();
            this.dimensionFlyoutCSS = "";
            this.mappingFlyoutCSS="";
            this.selectedMappingID=null;
            let account = _.find(this.accounts, {'id': bankID});
            setTimeout(function(){
                base.accountComboBox.setValue(account, 'name');
            });
            this.setDueDate(this.defaultDate);
            this.selectedEntityID=null;
            this.setDefaultDepositType();
            this.loadEntities('other');
        }else {
            let prevState = this.stateService.getPrevState();
            if(prevState){
                this._router.navigate([prevState.url]);
            }else{
                let link = ['books', 'deposits'];
                this._router.navigate(link);
            }
        }
    }

    showFlyout($event, index) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        let base = this;
        this.itemActive = true;
        this.dimensionFlyoutCSS = "expanded";
        let itemsControl:any = this.depositForm.controls['payments'];
        let data = this._depositLineForm.getData(itemsControl.controls[index]);
        let coa = _.find(this.chartOfAccounts, {'id': data.chart_of_account_id});
        let entity = _.find(this.entities, {'id': data.entity_id});
        let invoice = _.find(this.invoices, {'id': data.invoice_id});
        this.selectedDimensions = data.dimensions;
        setTimeout(function(){
            base.editCOAComboBox.setValue(coa, 'displayName');
            base.editEntityComboBox.setValue(entity, 'name');
            base.editInvoiceComboBox.setValue(invoice, 'po_number');
        });
        this.resetAllLinesFromEditing(itemsControl);
        this.editItemForm = this._fb.group(this._depositLineForm.getForm(data));
        this.editItemIndex = index;
    }

    hideFlyout(){
        this.dimensionFlyoutCSS = "collapsed";
        this.itemActive = false;
        this.editItemIndex = null;
        this.selectedDimensions = [];
    }

    setCOAForEditingItem(chartOfAccount){
        let data = this._depositLineForm.getData(this.editItemForm);
        if(chartOfAccount && chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        this._depositLineForm.updateForm(this.editItemForm, data);
    }

    setEntityForEditingItem(entity){
        let data = this._depositLineForm.getData(this.editItemForm);
        if(entity && entity.id){
            data.entity_id = entity.id;
            data.entity_type = entity.entityType;
        }else if(!entity||entity=='--None--'){
            data.entity_id='--None--';
        }
        this._depositLineForm.updateForm(this.editItemForm, data);
    }

    setInvoiceForEditingItem(invoice){
        let data = this._depositLineForm.getData(this.editItemForm);
        if(invoice && invoice.id){
            data.invoice_id = invoice.id;
        }else if(!invoice||invoice=='--None--'){
            data.invoice_id='--None--';
        }
        this._depositLineForm.updateForm(this.editItemForm, data);
    }


    /*This function will stop event bubbling to avoid default selection of first value in first dimension*/
    doNothing($event){
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    }

    setBankAccount(account){
        let data = this._depositForm.getData(this.depositForm);
        if(account && account.id){
            this.bankAccountID=account.id;
            data.bank_account_id = account.id;
        }else if(!account||account=='--None--'){
            data.bank_account_id='--None--';
        }
        this._depositForm.updateForm(this.depositForm, data);
    }

    setDueDate(date){
        let data = this._depositForm.getData(this.depositForm);
        data.date = date;
        this._depositForm.updateForm(this.depositForm, data);
    }

    processDeposits(deposits){
        let base = this;
        this.depositData=deposits;
        let itemsControl:any = this.depositForm.controls['payments'];
        this.selectedMappingID=deposits.mapping_id;
        deposits.date = this.dateFormater.formatDate(deposits.date,this.serviceDateformat,this.dateFormat);
        this.loadEntities(deposits.deposit_type);
        _.each(deposits.payments, function(depositItem){
            depositItem.amount = parseFloat(depositItem.amount);
            itemsControl.controls.push(base._fb.group(base._depositLineForm.getForm(depositItem)));
        });
        let account = _.find(this.accounts, {'id': deposits.bank_account_id});
        setTimeout(function(){
            base.accountComboBox.setValue(account, 'name');
        });
        if(deposits.payments.length>0&&deposits.payments[0].entity_id){
          this.selectedEntityID=deposits.payments[0].entity_id;
        }
        this._depositForm.updateForm(this.depositForm, deposits);
        this.updateLineTotal();
        this.loadingService.triggerLoadingEvent(false);
    }

    editItem(index, itemForm){
      let base = this;
      let depositData = this._depositForm.getData(this.depositForm);
      let linesControl:any = this.depositForm.controls['payments'];
      itemForm.editable = !itemForm.editable;
      let itemData = this._depositLineForm.getData(itemForm);
      if(!itemData.amount){
        itemData.amount = depositData.amount;
        this.setValuesToControls(linesControl.controls[index], itemData);
      }
      setTimeout(function(){
        jQuery('#coa-'+index).siblings().children('input').val(base.getCOAName(itemData.chart_of_account_id));
        jQuery('#entity-'+index).siblings().children('input').val(base.getEntityName(itemData.entity_id));
        jQuery('#invoice-'+index).siblings().children('input').val(base.getInvoiceName(itemData.invoice_id));
      });
      if(index == this.getLastActiveLineIndex(linesControl)){
        this.addDefaultLine(1);
      }
      this.resetAllLinesFromEditing(linesControl);
      itemForm.editable = !itemForm.editable;
    }

    enableLines(){
        let payments: any = this.depositForm.controls.payments;
        let lines = payments.controls;
        if(lines && lines.length > 0){
            this.editItem(0, lines[0]);
        } else{
            this.addDefaultLine(1);
            this.editItem(0, lines[0]);
        }
    }

    handleKeyEvent(event: Event, index, key){
        let current_ele = jQuery(this.el.nativeElement).find("tr")[index].closest('tr');
        let focusedIndex;
        jQuery(current_ele).find("td input").each(function(id,field) {
            if(jQuery(field).is(':focus')) {
                focusedIndex = id;
            }
        });
        let base = this;
        let depositLines:any = this.depositForm.controls.payments;
        if(key === 'Arrow Down'){
            let nextIndex = this.getNextElement(current_ele,index,'Arrow Down');
            base.editItem(nextIndex, depositLines.controls[nextIndex]);
            setTimeout(function(){
                let elem = jQuery(base.el.nativeElement).find("tr")[nextIndex];
                jQuery(elem).find("td input").each(function(id,field) {
                    if(id == 0) {
                        jQuery(field).focus();
                    }
                });
            });
        }else{
            let nextIndex = this.getNextElement(current_ele,index,'Arrow Up');
            base.editItem(nextIndex, depositLines.controls[nextIndex]);
            setTimeout(function(){
                let elem = jQuery(base.el.nativeElement).find("tr")[nextIndex];
                jQuery(elem).find("td input").each(function(id,field) {
                    if(id == 0) {
                        jQuery(field).focus();
                    }
                });
            });

        }
    }

    getNextElement(current_ele,curr_index,event){
        let next_ele;
        if(event === 'Arrow Down'){
            next_ele= jQuery(current_ele).next('tr');
        }else{
            next_ele = jQuery(current_ele).prev('tr');
        }
        if(next_ele.length >0) {
            if (next_ele[0].hidden) {
                return this.getNextElement(next_ele,next_ele[0].sectionRowIndex, event);
            } else {
                return next_ele[0].sectionRowIndex;
            }
        }else{
            return curr_index;
        }
    }

    deleteItem($event,index){
        $event && $event.stopImmediatePropagation();
        let itemsList:any = this.depositForm.controls['payments'];
        let itemControl = itemsList.controls[index];
        itemControl.controls['destroy'].patchValue(true);
        let base=this;
        setTimeout(function(){
            base.updateLineTotal();
            base.handleKeyEvent($event,index,'Arrow Down');
        });
    }

    /*showNewItem(){
     this.addNewItemFlag = true;
     this.newItemForm = this._fb.group(this._depositLineForm.getForm());
     let base=this;
     let account = _.find(this.chartOfAccounts, {'number': '499999'});
     setTimeout(function(){
     if(account)
     base.newCOAComboBox.setValue(account,'name');
     });
     }*/

    /*hideNewItem(){
     this.addNewItemFlag = false;
     }*/

    /*saveNewItem(){
     this.addNewItemFlag = !this.addNewItemFlag;
     let tempItemForm = _.cloneDeep(this.newItemForm);
     let itemsControl:any = this.depositForm.controls['payments'];
     itemsControl.controls.push(tempItemForm);
     }*/

    /*setCOAForNewItem(chartOfAccount){
     let data = this._depositLineForm.getData(this.newItemForm);
     if(chartOfAccount && chartOfAccount.id){
     data.chart_of_account_id = chartOfAccount.id;
     }else if(!chartOfAccount||chartOfAccount=='--None--'){
     data.chart_of_account_id='--None--';
     }
     this._depositLineForm.updateForm(this.newItemForm, data);
     }

     setEntityForNewItem(entity){
     let data = this._depositLineForm.getData(this.newItemForm);
     if(entity && entity.id){
     data.entity_id = entity.id;
     }else if(!entity||entity=='--None--'){
     data.entity_id='--None--';
     }
     this._depositLineForm.updateForm(this.newItemForm, data);
     }

     setInvoiceForNewItem(invoice){
     let data = this._depositLineForm.getData(this.newItemForm);
     if(invoice && invoice.id){
     data.invoice_id = invoice.id;
     }else if(!invoice||invoice=='--None--'){
     data.invoice_id='--None--';
     }
     this._depositLineForm.updateForm(this.newItemForm, data);
     }*/

    setCOA(chartOfAccount, index){
        let data = this._depositLineForm.getData(this.depositForm.controls[index]);
        if(chartOfAccount && chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        let tempForm = this._fb.group(this.depositForm.controls[index]);
        this._depositLineForm.updateForm(tempForm, data);
    }

    getCOAName(chartOfAccountId){
        let coa = _.find(this.chartOfAccounts, {'id': chartOfAccountId});
        return coa? coa.displayName: '';
    }

    getEntityName(entityId){
        let entity = _.find(this.entities, {'id': entityId});
        return entity? entity.name: '';
    }

    getInvoiceName(invoiceId){
        let invoice = _.find(this.invoices, {'id': invoiceId});
        return invoice? invoice.po_number: '';
    }

    updateItem(index, itemForm){
        let data = _.cloneDeep(this._depositLineForm.getData(itemForm));
        let depositItems:any = this.depositForm.controls['payments'];
        let itemControl:any = depositItems.controls[index];
        itemControl.controls['title'].patchValue(data.title);
        itemControl.controls['amount'].patchValue(data.amount);
        itemControl.controls['chart_of_account_id'].patchValue(data.chart_of_account_id);
        itemControl.controls['entity_id'].patchValue(data.entity_id);
        itemControl.controls['invoice_id'].patchValue(data.invoice_id);
        itemControl.controls['entity_type'].patchValue(data.entity_type);
        itemControl.controls['notes'].patchValue(data.notes);
        itemForm.editable = !itemForm.editable;
    }

    toggleLine(index, itemForm){
        itemForm.editable = !itemForm.editable;
        let tempForm = this._fb.group(this._depositLineForm.getForm(this.editingItems[index]));
        this.updateItem(index, tempForm);
    }

    setCOAForItem(chartOfAccount, itemForm){
        let data = this._depositLineForm.getData(itemForm);
        if(chartOfAccount && chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount || chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        this._depositLineForm.updateForm(itemForm, data);
    }

    setEntityForItem(entity, itemForm){
        if(entity && entity.id){
            let data = this._depositLineForm.getData(itemForm);
            data.entity_id= entity.id;
            data.entity_type=entity.entityType;
            this._depositLineForm.updateForm(itemForm, data);
            this.selectedEntityID= entity.id;
        } else if(!entity || entity=='--None--'){
            let data = this._depositLineForm.getData(itemForm);
            data.entity_id= null;
            this.selectedEntityID=null;
            this._depositLineForm.updateForm(itemForm, data);
        }
    }

    setInvoiceForItem(invoice, itemForm){
        if(invoice && invoice.id){
            let data = this._depositLineForm.getData(itemForm);
            data.invoice_id= invoice.id;
            this._depositLineForm.updateForm(itemForm, data);
        } else{
            let data = this._depositLineForm.getData(itemForm);
            data.invoice_id= null;
            this._depositLineForm.updateForm(itemForm, data);
        }
    }

    selectValue($event, dimension, value){
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        _.each(this.selectedDimensions, function (selectedDimension) {
            if(selectedDimension.name == dimension.name){
                if(selectedDimension.values.indexOf(value) == -1){
                    selectedDimension.values.push(value);
                } else{
                    selectedDimension.values.splice(selectedDimension.values.indexOf(value), 1);
                }
            }
        });
    }

    isDimensionSelected(dimensionName){
        let selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        return selectedDimensionNames.indexOf(dimensionName) != -1;
    }

    isValueSelected(dimension, value){
        let currentDimension = _.find(this.selectedDimensions, {'name': dimension.name});
        if(!_.isEmpty(currentDimension)){
            if(currentDimension.values.indexOf(value) != -1){
                return true;
            }
            return false;
        }
        return false;
    }

    selectDimension($event, dimensionName){
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        let selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        if(selectedDimensionNames.indexOf(dimensionName) == -1){
            this.selectedDimensions.push({
                "name": dimensionName,
                "values": []
            });
        } else{
            this.selectedDimensions.splice(selectedDimensionNames.indexOf(dimensionName), 1);
        }
    }

    /*When user clicks on save button in the flyout*/
    saveItem(){
        let dimensions = this.editItemForm.controls['dimensions'];
        dimensions.patchValue(this.selectedDimensions);
        let itemData = this._depositLineForm.getData(this.editItemForm);
        this.updateLineInView(itemData);
        this.selectedDimensions = [];
        this.hideFlyout();
    }

    /*This will just update line details in VIEW*/
    updateLineInView(item){
      let itemsControl:any = this.depositForm.controls['payments'];
      let itemControl = itemsControl.controls[this.editItemIndex];
      this.setValuesToControls(itemControl, item);
    }

    setValuesToControls(itemControl, item){
      itemControl.controls['title'].patchValue(item.title);
      itemControl.controls['amount'].patchValue(item.amount);
      itemControl.controls['chart_of_account_id'].patchValue(item.chart_of_account_id);
      itemControl.controls['entity_id'].patchValue(item.entity_id);
      itemControl.controls['invoice_id'].patchValue(item.invoice_id);
      itemControl.controls['notes'].patchValue(item.notes);
      itemControl.controls['dimensions'].patchValue(item.dimensions);
    }

    getDepositItemData(depositForm){
        let base = this;
        let data = [];
        _.each(depositForm.controls, function(depositItemControl){
            let itemData = base._depositLineForm.getData(depositItemControl);
            if(itemData.chart_of_account_id=='--None--'||itemData.chart_of_account_id==''){
                itemData.chart_of_account_id=null;
            }
            if(itemData.entity_id=='--None--'||itemData.entity_id==''){
                itemData.entity_id=null;
            }
            if(itemData.invoice_id=='--None--'||itemData.invoice_id==''){
                itemData.invoice_id=null;
            }
            if(!base.newDeposit){
                data.push(itemData);
            } else if(!itemData.destroy){
                data.push(itemData);
            }
        });
        return data;
    }

  getDepositData(){
    let data = this._depositForm.getData(this.depositForm);
    data.payments=this.getDepositLineData(this.depositForm);
    data.amount=this.roundOffValue(data.amount);
    this.updateDepositLinesData(data);
    return data;
  }

    submit($event){
        $event && $event.preventDefault();
        let data = this._depositForm.getData(this.depositForm);
            data.payments=this.getDepositLineData(this.depositForm);
        data.amount=this.roundOffValue(data.amount);
        this.updateDepositLinesData(data);
        if(!this.validateData(data)){
            return;
        }
        data.date = this.dateFormater.formatDate(data.date,this.dateFormat,this.serviceDateformat);
        if(this.newDeposit){
            this.loadingService.triggerLoadingEvent(true);
            this.depositService.addDeposit(data, this.currentCompanyId)
                .subscribe(response=>{
                    this.toastService.pop(TOAST_TYPE.success, "Deposit Added successfully");
                    this.loadingService.triggerLoadingEvent(false);
                    this.showDepositsPage(data.bank_account_id);
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                    console.log("deposit creation failed", error);
                });
        } else{
            if(!this.isMappingsModified){
              data.mapping_ids=this.depositData.mapping_ids;
            }
            this.tempData=data;
            this.checkLockDate();
        }
    }

    ngOnInit(){
        this.initialize();
    }

    ngOnDestroy(){
        jQuery('#deposit-password-conformation').remove();
        this.routeSubscribe.unsubscribe();
    }

    updateDepositDetails(){
        this.loadingService.triggerLoadingEvent(true);
        this.depositService.updateDeposit(this.tempData, this.currentCompanyId)
            .subscribe(response =>{
                this.toastService.pop(TOAST_TYPE.success, "Deposit Edited successfully");
                this.setUpdatedFlagInStates();
                this.loadingService.triggerLoadingEvent(false);
                this.showDepositsPage();
            }, error => {
                this.loadingService.triggerLoadingEvent(false);
                console.log("updating deposit failed", error);
            });
    }

    setUpdatedFlagInStates(){
      if(this.stateService.states) {
        _.each(this.stateService.states, function(state){
          let data = state.data || {};
          data.refreshData = true;
          state.data = data;
        });
      }
    }


    initialize(){
        let _form = this._depositForm.getForm();
        _form['payments'] = new FormArray([]); //this.depositItemsArray;
        this.depositForm = this._fb.group(_form);

        let _itemForm = this._depositLineForm.getForm();
        this.newItemForm = this._fb.group(_itemForm);

        if(this.newDeposit&&!this.isMappingPrevious){
            this.addDefaultLine(2);
        }
        if(this.stayFlyout){
            this.loadingService.triggerLoadingEvent(false);
            this.stayFlyout = false;
        }
    }

    loadAllServices(){
      let state;
      this.currentCompanyId = Session.getCurrentCompany();
      this.loadingService.triggerLoadingEvent(true);
      this.dimensionService.dimensions(this.currentCompanyId)
        .subscribe(dimensions =>{
          this.dimensions = dimensions;
        }, error => {

        });
      this.coaService.chartOfAccounts(this.currentCompanyId)
        .subscribe(chartOfAccounts=> {
          chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
          _.forEach(chartOfAccounts, function(coa) {
            coa['displayName']=coa.number+' - '+coa.name;
          });
          this.chartOfAccounts = chartOfAccounts;
        }, error => {

        });
      this.invoiceService.invoices(state)
        .subscribe(invoices=> {
          this.invoices = invoices.invoices || [];
        }, error => {

        });
    }

    selectDepositType(type){
        this.loadEntities(type);
        let depositItems:any = this.depositForm.controls['payments'];
        _.each(depositItems.controls, function (expenseItem) {
            expenseItem.controls['entity_id'].patchValue('');
        });
    }

  loadEntityData(){
    this.vendorService.vendors(this.currentCompanyId)
      .subscribe(vendors=> {
        _.forEach(vendors, function(vendor) {
          vendor['entityType']="vendor";
        });
        this.vendorList  = vendors;
      }, error => {
      });

    this.customersService.customers(this.currentCompanyId)
      .subscribe(customers=> {
        _.forEach(customers, function(customer) {
          customer['id']=customer.customer_id;
          customer['name']=customer.customer_name;
          customer['entityType']="customer";
        });
        this.customersList  = customers;
      }, error => {
      });
    this.shareholdersService.shareholders()
      .subscribe(shareholders=> {
        _.forEach(shareholders, function(customer) {
          customer['name']=customer['firstName']+" "+customer['lastName'];
          customer['entityType']="shareholder";
        });
        this.shareHoldersList  = shareholders;
      }, error => {
      });
  }

    loadEntities(type){
        this.entities=[];
        if(type=='expenseRefund'){
          this.entities=this.vendorList;
        }else if (type=='invoice'){
          this.entities=this.customersList;
        }else if(type=='shareholder'){
          this.entities=this.shareHoldersList;
        }else if (type=='other'){
          this.entities=this.entities.concat(this.vendorList).concat(this.customersList).concat(this.shareHoldersList);
          _.sortBy(this.entities, "name");
        }
    }

    /*view changes*/

    addDefaultLine(count){
        let linesControl: any = this.depositForm.controls['payments'];
        for(let i=0; i<count; i++){
            let lineForm = this._fb.group(this._depositLineForm.getForm());
            linesControl.controls.push(lineForm);
        }
    }

    getLineCount(){
        let linesControl:any = this.depositForm.controls['payments'];
        let activeLines = [];
        _.each(linesControl.controls, function(lineControl){
            if(!lineControl.controls['destroy'].value){
                activeLines.push(lineControl);
            }
        });
        return activeLines.length;
    }

    resetAllLinesFromEditing(linesControl){
        _.each(linesControl.controls, function(lineControl){
            lineControl.editable = false;
        });
    }

    getLastActiveLineIndex(linesControl){
        let result = false;
        _.each(linesControl.controls, function(lineControl, index){
            if(!lineControl.controls['destroy'].value){
                result = index;
            }
        });
        return result;
    }

    getDepositLineData(depositForm) {
        let base = this;
        let data = [];
        let linesControl = depositForm.controls['payments'];
        let defaultLine = this._depositLineForm.getData(this._fb.group(this._depositLineForm.getForm()));
        _.each(linesControl.controls, function (jeLineControl) {
            let lineData = base._depositLineForm.getData(jeLineControl);
            if(!_.isEqual(lineData, defaultLine)){
                if(!base.newDeposit){
                    if(lineData.amount){
                        data.push(lineData);
                    }
                } else if(!lineData.destroy){
                    if(lineData.amount){
                        data.push(lineData);
                    }
                }
            }
        });
        return data;
    }
    loaddeposit(){
      let base=this;
        if(!this.newDeposit){
            this.titleService.setPageTitle("UPDATE DEPOSIT");
            this.depositService.deposit(this.depositID, this.currentCompanyId)
                .subscribe(deposit => {
                    this.processDeposits(deposit.deposit);
                }, error =>{
                    this.loadingService.triggerLoadingEvent(false);
                    this.toastService.pop(TOAST_TYPE.error, "Failed to load deposit details");
                })
        } else{
            this.titleService.setPageTitle("CREATE DEPOSIT");
            this.setDueDate(this.defaultDate);
            this.setDefaultDepositType();
            setTimeout(function(){
              base.loadEntities('other');
            },1000);
            this.loadingService.triggerLoadingEvent(false);
        }
    }

    setDefaultDepositType(){
        let data = this._depositForm.getData(this.depositForm);
        data.deposit_type = 'other';
        this._depositForm.updateForm(this.depositForm, data);
        //this.loadEntities('other');
    }

    validateData(data){
        let base = this;
        let result=true;
        if(data.bank_account_id=="--None--"||data.bank_account_id==""){
            this.toastService.pop(TOAST_TYPE.error, "Please select valid financial account");
            return false;
        }
        if(data.amount <= 0){
            this.toastService.pop(TOAST_TYPE.error, "Deposit amount must be greater than zero.");
            return false;
        }
        let itemTotal = _.sumBy(data.payments, function(payment){
            return payment.destroy? 0 : payment.amount;
        });
        itemTotal = this.roundOffValue(itemTotal);
        if(itemTotal != data.amount){
            this.toastService.pop(TOAST_TYPE.error, "Deposit amount and Item total did not match.");
            return false;
        }
        /*_.each(data.payments, function(line){
            if(!line.destroy){
                if(!line.chart_of_account_id){
                    base.toastService.pop(TOAST_TYPE.error, "Chat of Account is not selected for line");
                    result=false;
                    return false;
                }
            }
        });*/

        return result;
    }

    updateDepositLinesData(data){
        let base=this;
        _.each(data.payments, function(line){
            if(line.chart_of_account_id=='--None--'||line.chart_of_account_id==''){
                line.chart_of_account_id=null;
            }
            if(line.entity_id=='--None--'||line.entity_id==''){
                line.entity_id=null;
            }
            if(line.amount){
                line.amount=base.roundOffValue(line.amount);
            }
        });
    }


    /*mapping changes*/
    showMappingPage(){
      if(!this.bankAccountID){
        this.toastService.pop(TOAST_TYPE.error, "Please select financial account.");
        return
      }
      this.mappingFlyoutCSS="expanded";
      this.loadingService.triggerLoadingEvent(true);
      let mappingId=this.newDeposit?null:this.depositID;
      this.depositService.unMappedInvoices(this.currentCompanyId,"false",this.bankAccountID,this.selectedEntityID,mappingId)
        .subscribe(mappings => {
          this.buildTableData(mappings || []);
        }, error => {
          this.loadingService.triggerLoadingEvent(false);
        });
     }
     hideMappingPage(){
     this.mappingFlyoutCSS="collapsed";
     }

     buildTableData(mappings) {
     this.hasMappings = false;
     this.mappings = mappings;
     this.selectedRows=[];
     this.tableData.rows = [];
     this.tableOptions.search = true;
     this.tableOptions.multiSelectable = true;
     this.tableOptions.pageSize = 9;
     this.tableData.columns = [
     {"name": "id", "title": "Id","visible":false,"filterable": false},
     {"name":"invoiceNumber","title":"Invoice Number"},
     {"name":"invoiceDate","title":"Invoice Date"},
     {"name": "amountPaid", "title": "Amount"},
     {"name": "paymentDate", "title": "Payment Date"},
     {"name": "journalID", "title": "journalId","visible":false,"filterable": false},
     {"name": "customerName", "title": "Customer"},
     {"name": "mapping", "title": "mapping","visible":false,"filterable": false},
     {"name": "actions", "title": "", "type": "html", "filterable": false}
     ];
     let base = this;
     mappings.forEach(function(payment) {
     let row:any = {};
     _.each(base.tableColumns, function(key) {
     row[key] = payment[key];
     if(key == 'amountPaid'){
     let amount = parseFloat(payment[key]);
     row[key] = amount.toLocaleString(base.localeFormat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
     }
     });
       row['actions'] = "<a class='action' data-action='navigatePayment'><span class='icon badge je-badge'>P</span></a>"
       if(payment.mapping){
         payment['isPushVal']=true;
         base.selectedRows.push(payment);
       }
     base.tableData.rows.push(row);
     });
     setTimeout(function(){
     base.hasMappings = true;
     }, 0);
     this.loadingService.triggerLoadingEvent(false);
     }
     handleSelect(event:any) {
       let base = this;
       _.each(this.selectedRows, function(payment){
         _.each(event, function(selectedPayment){
           if(selectedPayment.id==payment.id&&payment.isPushVal){
             payment.tempIsSelected=selectedPayment.tempIsSelected;
           }
         });
       });
       _.each(event, function(payment){
         base.selectedRows.push(payment);
       });
       _.remove(this.selectedRows, {'tempIsSelected': false});
       this.selectedRows = _.uniqBy(this.selectedRows, 'id');
     }

     saveMappingID(){
       let mappingData=_.map(this.selectedRows, 'id');
       this.isMappingsModified=true;
       let mappings = this.depositForm.controls['mapping_ids'];
       mappings.patchValue(mappingData);
       let data = this._depositForm.getData(this.depositForm);
       this.mappingFlyoutCSS="collapsed";
     }

    checkLockDate(){
        if(Session.getLockDate()){
            if(moment(Session.getLockDate(),"MM/DD/YYYY").valueOf() > moment().valueOf()){
                jQuery('#deposit-password-conformation').foundation('open');
            }else {
                this.updateDepositDetails();
            }
        }else {
            this.toastService.pop(TOAST_TYPE.error, "Please set company lock date");
        }
    }

    validateLockKey(){
        let data={
            "key":this.key
        };
        this.vendorService.validateLockKey(Session.getCurrentCompany(),data).subscribe(res=>{
            this.validateLockDate=res.validation;
            if(res.validation){
                this.closePasswordConfirmation();
                this.loadingService.triggerLoadingEvent(true);
                this.updateDepositDetails();
            }else {
                this.toastService.pop(TOAST_TYPE.error, "Invalid key");
            }
        },fail=>{

        })
    }
    closePasswordConfirmation(){
        this.resetPasswordConformation();
        jQuery('#deposit-password-conformation').foundation('close');
    }

    checkValidation(){
        if(this.key)
            return true;
        else return false;
    }

    resetPasswordConformation(){
        this.key=null;
    }

    updateLineTotal(){
        let base = this;
        let deposliLineData:any = this.depositForm.controls['payments'];
        this.lineTotal = 0;
        _.each(deposliLineData.controls, function(lineForm){
            let line = base._depositLineForm.getData(lineForm);
            if(!line.destroy){
                base.lineTotal += line.amount? base.roundOffValue(parseFloat(line.amount)): 0;
            }
        });
        this.formattedLineTotal=this.formatAmount(this.lineTotal);
    }

    roundOffValue(num){
        return Math.round(num * 100) / 100
    }

    formatAmount(value){
        return this.numeralService.format('$0,0.00', value)
    }

  showPosts($event, index) {
    $event.preventDefault();
    let itemsControl:any = this.depositForm.controls['payments'];
    let data = this._depositLineForm.getData(itemsControl.controls[index]);
    const link = ['collaboration', 'depositLine', data.id];
    this._router.navigate(link);
  }

  handleRedirect(event){
    let action = event.action;
    let data;
    if(action=="navigatePayment"){
      if(this.newDeposit){
        data=this.getDepositData();
      }else {
        data=this.depositData;
      }
      let persistData={
        depositdata:data,
        bankAccounts:this.accounts,
        selectedRows:this.selectedRows
      }
      this.stateService.addState(new State('showMappingPage', this._router.url, persistData, null));
      let link = ['payments/edit', event.id];
      this._router.navigate(link);
      this.titleService.setPageTitle("Payments");
    }
  }

}
