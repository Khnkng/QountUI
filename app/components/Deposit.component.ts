
import {Component, ViewChild} from "@angular/core";
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

declare let jQuery:any;
declare let _:any;
declare var moment:any;

@Component({
    selector: 'deposit',
    templateUrl: '/app/views/Deposits.html',
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

    @ViewChild("accountComboBoxDir") accountComboBox: ComboBox;
  //  @ViewChild("newCOAComboBoxDir") newCOAComboBox: ComboBox;
  //  @ViewChild("newEntityComboBoxDir") newEntityComboBox: ComboBox;
    @ViewChild("editCOAComboBoxDir") editCOAComboBox: ComboBox;
    @ViewChild("editEntityComboBoxDir") editEntityComboBox: ComboBox;
  //  @ViewChild("newInvoiceComboBoxDir") newInvoiceComboBox: ComboBox;
    @ViewChild("editInvoiceComboBoxDir") editInvoiceComboBox: ComboBox;

    constructor(private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _depositForm: DepositsForm,
                private _depositLineForm: DepositsLineForm, private accountsService: FinancialAccountsService, private coaService: ChartOfAccountsService,
                private depositService: DepositService, private toastService: ToastService,
                private loadingService: LoadingService, private dimensionService: DimensionService,private customersService: CustomersService
        ,private invoiceService:InvoicesService,private vendorService: CompaniesService){
        this.currentCompanyId = Session.getCurrentCompany();
        this.routeSub = this._route.params.subscribe(params => {
            this.depositID=params['depositID'];
            if(!this.depositID){
                this.newDeposit = true;
                this.defaultDate=moment(new Date()).format("MM/DD/YYYY");
            }
        });
        this.accountsService.financialAccounts(this.currentCompanyId)
            .subscribe(accounts=> {
                this.accounts = accounts.accounts;
                this.loaddeposit();
            }, error => {

            });
        this.companyCurrency = Session.getCurrentCompanyCurrency();
    }

    showDepositsPage(){
        if(this.stayFlyout){
            let base=this;
            this.initialize();
            this.stayFlyout = false;
            this.dimensionFlyoutCSS = "";
            setTimeout(function(){
                base.accountComboBox.setValue(null, 'name');
            });
            this.setDueDate(this.defaultDate);
            //location.reload();
        }else {
            let link = [Session.getLastVisitedUrl()];
            this._router.navigate(link);
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
        let account = _.find(this.accounts, {'id': data.bank_account_id});
        setTimeout(function(){
            base.editCOAComboBox.setValue(coa, 'name');
            base.accountComboBox.setValue(account, 'name');
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
        let itemsControl:any = this.depositForm.controls['payments'];
        this.loadEntities(deposits.deposit_type);
        _.each(deposits.payments, function(depositItem){
            depositItem.amount = parseFloat(depositItem.amount);
            itemsControl.controls.push(base._fb.group(base._depositLineForm.getForm(depositItem)));
        });
        let account = _.find(this.accounts, {'id': deposits.bank_account_id});
        setTimeout(function(){
            base.accountComboBox.setValue(account, 'name');
        });
        this._depositForm.updateForm(this.depositForm, deposits);
    }

    editItem(index, itemForm){
        let linesControl:any = this.depositForm.controls['payments'];
        let base = this;
        itemForm.editable = !itemForm.editable;
        let itemData = this._depositLineForm.getData(itemForm);
        //this.editingItems[index] = itemData;
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

    deleteItem($event,index){
        $event && $event.stopImmediatePropagation();
        let itemsList:any = this.depositForm.controls['payments'];
        let itemControl = itemsList.controls[index];
        itemControl.controls['destroy'].patchValue(true);
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
        return coa? coa.name: '';
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
            this._depositLineForm.updateForm(itemForm, data);
        } else{
            let data = this._depositLineForm.getData(itemForm);
            data.entity_id= null;
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

    submit($event){
        $event && $event.preventDefault();
        let data = this._depositForm.getData(this.depositForm);
        if(data.amount <= 0){
            this.toastService.pop(TOAST_TYPE.error, "Deposit amount must be greater than zero.");
            return;
        }
        data.payments = this.getDepositItemData(this.depositForm.controls['payments']);
        let itemTotal = _.sumBy(data.payments, function(payment){
            return payment.destroy? 0 : payment.amount;
        });
        if(itemTotal != data.amount){
            this.toastService.pop(TOAST_TYPE.error, "Deposit amount and Item total did not match.");
            return;
        }

        data.payments = this.getExpenseLineData(this.depositForm);
        this.loadingService.triggerLoadingEvent(true);
        if(this.newDeposit){
            this.depositService.addDeposit(data, this.currentCompanyId)
                .subscribe(response=>{
                    this.toastService.pop(TOAST_TYPE.success, "Deposit Added successfully");
                    this.loadingService.triggerLoadingEvent(false);
                    this.showDepositsPage();
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                    console.log("deposit creation failed", error);
                });
        } else{
            this.depositService.updateDeposit(data, this.currentCompanyId)
                .subscribe(response =>{
                    this.toastService.pop(TOAST_TYPE.success, "Deposit Edited successfully");
                    this.loadingService.triggerLoadingEvent(false);
                    this.showDepositsPage();
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                    console.log("updating deposit failed", error);
                });
        }
    }

    ngOnInit(){
        this.initialize();
    }

    initialize(){
        let _form = this._depositForm.getForm();
        _form['payments'] = new FormArray([]); //this.depositItemsArray;
        this.depositForm = this._fb.group(_form);

        let _itemForm = this._depositLineForm.getForm();
        this.newItemForm = this._fb.group(_itemForm);

        if(this.newDeposit){
            this.addDefaultLine(2);
        }

        this.currentCompanyId = Session.getCurrentCompany();
        this.loadingService.triggerLoadingEvent(true);
        this.dimensionService.dimensions(this.currentCompanyId)
            .subscribe(dimensions =>{
                this.dimensions = dimensions;
            }, error => {

            });
        this.coaService.chartOfAccounts(this.currentCompanyId)
            .subscribe(chartOfAccounts=> {
                this.chartOfAccounts = chartOfAccounts;
            }, error => {

            });
        this.invoiceService.invoices()
            .subscribe(invoices=> {
                this.invoices = invoices;
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

    loadEntities(type){
        this.entities=[];
        this.loadingService.triggerLoadingEvent(true);
        if(type=='expenseRefund'){
            this.vendorService.vendors(this.currentCompanyId)
                .subscribe(vendors=> {
                    this.loadingService.triggerLoadingEvent(false);
                    this.entities  = vendors;
                }, error => {
                });
        }else if (type=='invoice'){
            this.customersService.customers(this.currentCompanyId)
                .subscribe(customers=> {
                    this.loadingService.triggerLoadingEvent(false);
                    _.forEach(customers, function(customer) {
                        customer['id']=customer.customer_id;
                        customer['name']=customer.customer_name;
                    });
                    this.entities  = customers;
                }, error => {
                });
        }else if (type=='other'){
            this.loadingService.triggerLoadingEvent(false);
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

    getExpenseLineData(depositForm) {
        let base = this;
        let data = [];
        let linesControl = depositForm.controls['payments'];
        let defaultLine = this._depositLineForm.getData(this._fb.group(this._depositLineForm.getForm()));
        _.each(linesControl.controls, function (jeLineControl) {
            let lineData = base._depositLineForm.getData(jeLineControl);
            if(!_.isEqual(lineData, defaultLine)){
                if(!base.newDeposit){
                    data.push(lineData);
                } else if(!lineData.destroy){
                    data.push(lineData);
                }
            }
        });
        return data;
    }
    loaddeposit(){
        if(!this.newDeposit){
            this.depositService.deposit(this.depositID, this.currentCompanyId)
                .subscribe(deposit => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.processDeposits(deposit.deposit);
                }, error =>{
                    this.toastService.pop(TOAST_TYPE.error, "Failed to load deposit details");
                })
        } else{
            this.setDueDate(this.defaultDate);
            this.loadingService.triggerLoadingEvent(false);
        }
    }
}