
import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {ExpenseForm, ExpenseItemForm} from "../forms/Expenses.form";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ExpenseService} from "qCommon/app/services/Expense.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {CustomersService} from "qCommon/app/services/Customers.service";
import {EmployeeService} from "qCommon/app/services/Employees.service";
import {PaymentsService} from "qCommon/app/services/Payments.service";


declare let jQuery:any;
declare let _:any;
declare var moment:any;

@Component({
    selector: 'expense',
    templateUrl: '/app/views/expense.html',
})

export class ExpenseComponent{
    expenseForm: FormGroup;
    newItemForm: FormGroup;
    editItemForm: FormGroup;
    routeSub:any;
    expenseID:string;
    newExpense: boolean = false;
    currentCompanyId: string;
    accounts:Array<any>=[];
    vendors:Array<any> = [];
    chartOfAccounts:Array<any> = [];
    isExpensePaid:boolean = false;
    addNewItemFlag:boolean = false;
    editingItems:any={};
    dimensionFlyoutCSS:any;
    itemActive:boolean = false;
    dimensions:Array<any> = [];
    selectedDimensions:Array<any> = [];
    editItemIndex:number;
    companyCurrency:string;
    defaultDate:string;
    stayFlyout:boolean = false;
    entities:Array<any>=[];
    mappingFlyoutCSS:any;
    tableColumns:Array<string> = [ 'groupID','title', 'amount', 'date','journalID','vendorName'];
    mappings = [];
    hasMappings: boolean = false;
    tableData:any = {};
    tableOptions:any = {};
    row:any;
    selectedMappingID:string;
    expenseType:string;

    @ViewChild("accountComboBoxDir") accountComboBox: ComboBox;
   // @ViewChild("newCOAComboBoxDir") newCOAComboBox: ComboBox;
   // @ViewChild("newEntityComboBoxDir") newEntityComboBox: ComboBox;
    @ViewChild("editCOAComboBoxDir") editCOAComboBox: ComboBox;
    @ViewChild("editEntityComboBoxDir") editEntityComboBox: ComboBox;

    constructor(private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _expenseForm: ExpenseForm,
            private _expenseItemForm: ExpenseItemForm, private accountsService: FinancialAccountsService, private coaService: ChartOfAccountsService,
            private vendorService: CompaniesService, private expenseService: ExpenseService, private toastService: ToastService,
            private loadingService: LoadingService, private dimensionService: DimensionService,private customerService:CustomersService,
            private employeeService:EmployeeService,private paymentsService:PaymentsService){
        this.currentCompanyId = Session.getCurrentCompany();
        this.routeSub = this._route.params.subscribe(params => {
            this.expenseID=params['expenseID'];
            if(!this.expenseID){
                this.newExpense = true;
                this.defaultDate=moment(new Date()).format("MM/DD/YYYY");
            }
        });
        this.accountsService.financialAccounts(this.currentCompanyId)
            .subscribe(accounts=> {
                this.accounts = accounts.accounts;
                this.loadExpense();
            }, error => {

            });
        this.companyCurrency = Session.getCurrentCompanyCurrency();
    }

    showMappingPage(){
        if(this.selectedMappingID){
            let link = ['/payments', this.selectedMappingID];
            this._router.navigate(link);
        }else {
            this.mappingFlyoutCSS="expanded";
            this.loadingService.triggerLoadingEvent(true);
            this.paymentsService.mappings(this.currentCompanyId,this.expenseType,"false")
                .subscribe(mappings => {
                    let mappings=mappings?mappings:[];
                    this.buildTableData(mappings);
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                });
        }
    }
    hideMappingPage(){
        this.mappingFlyoutCSS="collapsed";
    }

    showExpensesPage(){
        if(this.stayFlyout){
           let base=this;
            this.initialize();
            this.dimensionFlyoutCSS = "";
            this.mappingFlyoutCSS="";
            this.selectedMappingID=null;
            setTimeout(function(){
                base.accountComboBox.setValue(null, 'name');
            });
            this.setDueDate(this.defaultDate);
            this.setDefaultExpenseType();
            //location.reload();
        }else {
            let link:any;
            if(Session.getLastVisitedUrl().indexOf('/payments')==0){
                link = ["/books/expenses"];
            }else {
                link = [Session.getLastVisitedUrl()];
            }
            this._router.navigate(link);
        }
    }

    showFlyout($event, index) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        let base = this;
        this.itemActive = true;
        this.dimensionFlyoutCSS = "expanded";
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        let data = this._expenseItemForm.getData(itemsControl.controls[index]);
        let coa = _.find(this.chartOfAccounts, {'id': data.chart_of_account_id});
        let entity = _.find(this.entities, {'id': data.entity_id});
        this.selectedDimensions = data.dimensions;
        setTimeout(function(){
            base.editCOAComboBox.setValue(coa, 'displayName');
            base.editEntityComboBox.setValue(entity, 'name');
        });
        this.resetAllLinesFromEditing(itemsControl);
        this.editItemForm = this._fb.group(this._expenseItemForm.getForm(data));
        this.editItemIndex = index;
    }

    hideFlyout(){
        this.dimensionFlyoutCSS = "collapsed";
        this.itemActive = false;
        this.editItemIndex = null;
        this.selectedDimensions = [];
    }

    setCOAForEditingItem(chartOfAccount){
        let data = this._expenseItemForm.getData(this.editItemForm);
        if(chartOfAccount && chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        this._expenseItemForm.updateForm(this.editItemForm, data);
    }

    setEntityForEditingItem(entity){
        let data = this._expenseItemForm.getData(this.editItemForm);
        if(entity && entity.id){
            data.entity_id = entity.id;
        }
        this._expenseItemForm.updateForm(this.editItemForm, data);
    }

    /*This function will stop event bubbling to avoid default selection of first value in first dimension*/
    doNothing($event){
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    }

    setBankAccount(account){
        let data = this._expenseForm.getData(this.expenseForm);
        if(account && account.id){
            data.bank_account_id = account.id;
        }else if(!account||account=='--None--'){
            data.bank_account_id='--None--';
        }
        this._expenseForm.updateForm(this.expenseForm, data);
    }

    togglePaidStatus(){
        let base = this;
        setTimeout(function(){
            base.isExpensePaid = Boolean(base.expenseForm.controls['is_paid'].value);
        }, 0);
    }

    setPaidDate(date){
        let data = this._expenseForm.getData(this.expenseForm);
        data.paid_date = date;
        this._expenseForm.updateForm(this.expenseForm, data);
    }

    setDueDate(date){
        let data = this._expenseForm.getData(this.expenseForm);
        data.due_date = date;
        this._expenseForm.updateForm(this.expenseForm, data);
    }

    processExpense(expense){
        let base = this;
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        this.selectedMappingID=expense.mapping_id;
        this.loadEntities(expense.expense_type);
        _.each(expense.expense_items, function(expenseItem){
            expenseItem.amount = parseFloat(expenseItem.amount);
            itemsControl.controls.push(base._fb.group(base._expenseItemForm.getForm(expenseItem)));
        });
        let account = _.find(this.accounts, {'id': expense.bank_account_id});
        setTimeout(function(){
           base.accountComboBox.setValue(account, 'name');
        });
        this._expenseForm.updateForm(this.expenseForm, expense);
        this.loadingService.triggerLoadingEvent(false);
    }

    editItem(index, itemForm){
        let linesControl:any = this.expenseForm.controls['expense_items'];
        let base = this;
         let itemData = this._expenseItemForm.getData(itemForm);
         //this.editingItems[index] = itemData;
         setTimeout(function(){
         jQuery('#coa-'+index).siblings().children('input').val(base.getCOAName(itemData.chart_of_account_id));
         jQuery('#entity-'+index).siblings().children('input').val(base.getEntityName(itemData.entity_id));
         });
        if(index == this.getLastActiveLineIndex(linesControl)){
            this.addDefaultLine(1);
        }
        this.resetAllLinesFromEditing(linesControl);
        itemForm.editable = !itemForm.editable;
    }

    deleteItem($event,index){
        $event && $event.stopImmediatePropagation();
        let itemsList:any = this.expenseForm.controls['expense_items'];
        let itemControl = itemsList.controls[index];
        itemControl.controls['destroy'].patchValue(true);
    }

    /*showNewItem(){
        this.addNewItemFlag = true;
        this.newItemForm = this._fb.group(this._expenseItemForm.getForm());
        let base=this;
        let account = _.find(this.chartOfAccounts, {'number': '699999'});
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
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        itemsControl.controls.push(tempItemForm);
    }*/

    /*setCOAForNewItem(chartOfAccount){
        let data = this._expenseItemForm.getData(this.newItemForm);
        if(chartOfAccount&&chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        this._expenseItemForm.updateForm(this.newItemForm, data);
    }*/

    setCOA(chartOfAccount, index){
        let data = this._expenseItemForm.getData(this.expenseForm.controls[index]);
        if(chartOfAccount&&chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        let tempForm = this._fb.group(this.expenseForm.controls[index]);
        this._expenseItemForm.updateForm(tempForm, data);
    }

    setVendor(entity, index){
        let data = this._expenseItemForm.getData(this.expenseForm.controls[index]);
        data.entity_id = entity.id;
        let tempForm = this._fb.group(this.expenseForm.controls[index]);
        this._expenseItemForm.updateForm(tempForm, data);
    }

    /*setEntityForNewItem(entity){
        let data = this._expenseItemForm.getData(this.newItemForm);
        data.entity_id = entity.id;
        this._expenseItemForm.updateForm(this.newItemForm, data);
    }*/

    getCOAName(chartOfAccountId){
        let coa = _.find(this.chartOfAccounts, {'id': chartOfAccountId});
        return coa? coa.displayName: '';
    }

    getEntityName(vendorId){
        let entity = _.find(this.entities, {'id': vendorId});
        return entity? entity.name: '';
    }

    updateItem(index, itemForm){
        let data = _.cloneDeep(this._expenseItemForm.getData(itemForm));
        let expenseItems:any = this.expenseForm.controls['expense_items'];
        let itemControl:any = expenseItems.controls[index];
        itemControl.controls['title'].patchValue(data.title);
        itemControl.controls['amount'].patchValue(data.amount);
        itemControl.controls['chart_of_account_id'].patchValue(data.chart_of_account_id);
        itemControl.controls['entity_id'].patchValue(data.entity_id);
        itemControl.controls['notes'].patchValue(data.notes);
        itemForm.editable = !itemForm.editable;
    }

    toggleLine(index, itemForm){
        itemForm.editable = !itemForm.editable;
        let tempForm = this._fb.group(this._expenseItemForm.getForm(this.editingItems[index]));
        this.updateItem(index, tempForm);
    }

    setCOAForItem(chartOfAccount, itemForm){
        let data = this._expenseItemForm.getData(itemForm);
        if(chartOfAccount && chartOfAccount.id){
            data.chart_of_account_id = chartOfAccount.id;
        }else if(!chartOfAccount || chartOfAccount=='--None--'){
            data.chart_of_account_id='--None--';
        }
        this._expenseItemForm.updateForm(itemForm, data);
    }

    setEntityForItem(entity, itemForm){
        let data = this._expenseItemForm.getData(itemForm);
        if(entity && entity.id){
            data.entity_id = entity.id;
        }else if(!entity || entity=='--None--'){
            data.entity_id='--None--';
        }
        this._expenseItemForm.updateForm(itemForm, data);
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
        let itemData = this._expenseItemForm.getData(this.editItemForm);
        this.updateLineInView(itemData);
        this.selectedDimensions = [];
        this.hideFlyout();
    }

    /*This will just update line details in VIEW*/
    updateLineInView(item){
        let itemsControl:any = this.expenseForm.controls['expense_items'];
        let itemControl = itemsControl.controls[this.editItemIndex];
        itemControl.controls['title'].patchValue(item.title);
        itemControl.controls['amount'].patchValue(item.amount);
        itemControl.controls['chart_of_account_id'].patchValue(item.chart_of_account_id);
        itemControl.controls['entity_id'].patchValue(item.entity_id);
        itemControl.controls['notes'].patchValue(item.notes);
        itemControl.controls['dimensions'].patchValue(item.dimensions);
    }

    getExpenseItemData(expenseForm){
        let base = this;
        let data = [];
        _.each(expenseForm.controls, function(expenseItemControl){
            let itemData = base._expenseItemForm.getData(expenseItemControl);
            if(itemData.chart_of_account_id=='--None--'||itemData.chart_of_account_id==''){
                itemData.chart_of_account_id=null;
            }
            if(itemData.entity_id=='--None--'||itemData.entity_id==''){
                itemData.entity_id=null;
            }
            if(!base.newExpense){
                data.push(itemData);
            } else if(!itemData.destroy){
                data.push(itemData);
            }
        });
        return data;
    }

    submit($event){
        $event && $event.preventDefault();
        let data = this._expenseForm.getData(this.expenseForm);
        if(data.amount <= 0){
            this.toastService.pop(TOAST_TYPE.error, "expense amount must be greater than zero.");
            return;
        }
        data.expense_items = this.getExpenseItemData(this.expenseForm.controls['expense_items']);
        let itemTotal = _.sumBy(data.expense_items, function(expense){
            return expense.destroy? 0 : expense.amount;
        });
        if(itemTotal != data.amount){
            this.toastService.pop(TOAST_TYPE.error, "Expense amount and Item total did not match.");
            return;
        }
        data.expense_items = this.getExpenseLineData(this.expenseForm);

        this.loadingService.triggerLoadingEvent(true);
        if(this.newExpense){
            this.expenseService.addExpense(data, this.currentCompanyId)
                .subscribe(response=>{
                    this.toastService.pop(TOAST_TYPE.success, "Expense Added successfully");
                    this.loadingService.triggerLoadingEvent(false);
                    this.showExpensesPage();
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                    console.log("expense creation failed", error);
                });
        } else{
            this.expenseService.updateExpense(data, this.currentCompanyId)
                .subscribe(response =>{
                    this.loadingService.triggerLoadingEvent(false);
                    this.toastService.pop(TOAST_TYPE.success, "Expense Updated successfully");
                    this.showExpensesPage();
                }, error => {
                    this.loadingService.triggerLoadingEvent(false);
                    console.log("updating expense failed", error);
                });
        }
    }


    ngOnInit(){
        this.initialize();
    }

    initialize(){
        let _form = this._expenseForm.getForm();
        _form['expense_items'] = new FormArray([]); //this.expenseItemsArray;
        this.expenseForm = this._fb.group(_form);

        let _itemForm = this._expenseItemForm.getForm();
        this.newItemForm = this._fb.group(_itemForm);

        if(this.newExpense){
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
                _.forEach(chartOfAccounts, function(coa) {
                    coa['displayName']=coa.number+' - '+coa.name;
                });
                this.chartOfAccounts = chartOfAccounts;

            }, error => {

            });
        if(this.stayFlyout){
            this.loadingService.triggerLoadingEvent(false);
            this.stayFlyout = false;
        }
    }

    selectExpenseType(type){
        this.loadEntities(type);
        let expenseItems:any = this.expenseForm.controls['expense_items'];
        _.each(expenseItems.controls, function (expenseItem) {
            expenseItem.controls['entity_id'].patchValue('');
        });
    }

    loadEntities(type){
        this.entities=[];
        this.expenseType=type;
        if(type=='bill'){
            this.vendorService.vendors(this.currentCompanyId)
                .subscribe(vendors=> {
                    this.entities  = vendors;
                }, error => {
                });
        }else if (type=='payroll'){
            this.employeeService.employees(this.currentCompanyId)
                .subscribe(employees=> {
                    _.forEach(employees, function(employee) {
                        employee['name']=employee.first_name+""+employee.last_name;
                    });
                    this.entities  = employees;
                }, error => {
                });
        }else if (type=='salesRefund'){
            this.customerService.customers(this.currentCompanyId)
                .subscribe(customers=> {
                    _.forEach(customers, function(customer) {
                        customer['id']=customer.customer_id;
                        customer['name']=customer.customer_name;
                    });
                    this.entities  = customers;
                }, error => {
                });
        }else if (type=='other'){
        }
    }

   /*view changes*/

    addDefaultLine(count){
        let linesControl: any = this.expenseForm.controls['expense_items'];
        for(let i=0; i<count; i++){
            let lineForm = this._fb.group(this._expenseItemForm.getForm());
            linesControl.controls.push(lineForm);
        }
    }

    getLineCount(){
        let linesControl:any = this.expenseForm.controls['expense_items'];
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

    getExpenseLineData(expenseForm) {
        let base = this;
        let data = [];
        let linesControl = expenseForm.controls['expense_items'];
        let defaultLine = this._expenseItemForm.getData(this._fb.group(this._expenseItemForm.getForm()));
        _.each(linesControl.controls, function (jeLineControl) {
            let lineData = base._expenseItemForm.getData(jeLineControl);
            if(!_.isEqual(lineData, defaultLine)){
                if(!base.newExpense){
                    data.push(lineData);
                } else if(!lineData.destroy){
                    data.push(lineData);
                }
            }
        });
        return data;
    }
    loadExpense(){
        if(!this.newExpense){
            this.expenseService.expense(this.expenseID, this.currentCompanyId)
                .subscribe(expense => {
                    this.processExpense(expense.expenses);
                }, error =>{
                    this.toastService.pop(TOAST_TYPE.error, "Failed to load expense details");
                    this.loadingService.triggerLoadingEvent(false);
                })
        } else{
            this.setDueDate(this.defaultDate);
            this.setDefaultExpenseType();
            this.loadingService.triggerLoadingEvent(false);
        }
    }

    setDefaultExpenseType(){
        let data = this._expenseForm.getData(this.expenseForm);
        data.expense_type = 'bill';
        this._expenseForm.updateForm(this.expenseForm, data);
        this.loadEntities('bill');
    }

    buildTableData(mappings) {
        this.hasMappings = false;
        this.mappings = mappings;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.singleSelectable = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name": "groupID", "title": "Id","visible":false,"filterable": false},
            {"name": "title", "title": "Payment Title"},
            {"name": "amount", "title": "Amount"},
            {"name": "date", "title": "Date"},
            {"name": "journalID", "title": "journalId","visible":false,"filterable": false},
            {"name": "vendorName", "title": "Vendor"}
        ];
        let base = this;
        mappings.forEach(function(pyment) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                row[key] = pyment[key];
                if(key == 'amount'){
                    let amount = parseFloat(pyment[key]);
                    row[key] = amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasMappings = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    }
    handleSelect(event:any) {
        if(event&&event[0])
        this.selectedMappingID=event[0]['groupID'];
    }

    saveMappingID(){
        let data = this._expenseForm.getData(this.expenseForm);
        data.mapping_id = this.selectedMappingID;
        this._expenseForm.updateForm(this.expenseForm, data);
        this.mappingFlyoutCSS="collapsed";
    }

}