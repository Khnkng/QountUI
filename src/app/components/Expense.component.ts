
import {Component, ViewChild,ElementRef} from "@angular/core";
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
  selector: 'expense',
  templateUrl: '../views/expense.html',
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
  tableColumns:Array<string> = [ 'groupID','title', 'amount', 'date','journalID','vendorName','mapping','id'];
  mappings = [];
  hasMappings: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  row:any;
  selectedMappingID:string;
  expenseType:string;
  bankAccountID:string;
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
  vendorList:Array<any>=[];
  customersList:Array<any>=[];
  employeesList:Array<any>=[];
  allList:Array<any>=[];
  shareHoldersList:Array<any>=[];

  @ViewChild("accountComboBoxDir") accountComboBox: ComboBox;
  @ViewChild("editCOAComboBoxDir") editCOAComboBox: ComboBox;
  @ViewChild("editEntityComboBoxDir") editEntityComboBox: ComboBox;
  @ViewChild('list') el:ElementRef;

  selectedRows:Array<any> = [];
  expenseData:any;
  isMappingsModified:boolean;
  isMappingPrevious:boolean;

  constructor(private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _expenseForm: ExpenseForm,
              private _expenseItemForm: ExpenseItemForm, private accountsService: FinancialAccountsService, private coaService: ChartOfAccountsService,
              private vendorService: CompaniesService, private expenseService: ExpenseService, private toastService: ToastService,
              private loadingService: LoadingService, private dimensionService: DimensionService,private customerService:CustomersService,
              private employeeService:EmployeeService,private paymentsService:PaymentsService,private dateFormater:DateFormater,
              private stateService: StateService,private titleService:pageTitleService,_switchBoard:SwitchBoard,private numeralService:NumeralService,private shareholdersService: Shareholders){
    this.currentCompanyId = Session.getCurrentCompany();
    this.loadEntitiesData();
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
    this.localeFormat=CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]?CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]:'en-US';
    this.routeSub = this._route.params.subscribe(params => {
      this.expenseID=params['expenseID'];
      if(!this.expenseID){
        this.newExpense = true;
        this.defaultDate=moment(new Date()).format(this.dateFormat);
      }
    });

    this.companyCurrency = Session.getCurrentCompanyCurrency();
    this.routeSubscribe = _switchBoard.onClickPrev.subscribe(title => {
      if(this.itemActive){
        this.hideFlyout();
      }else if(this.mappingFlyoutCSS == "expanded"){
        this.hideMappingPage();
      }else{
        this.showExpensesPage();
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
          this.loadExpense();
        }, error => {

        });
    }
  }

  showMappingPage(){
    if(!this.bankAccountID){
      this.toastService.pop(TOAST_TYPE.error, "Please select financial account.");
      return
    }
    this.mappingFlyoutCSS="expanded";
    this.loadingService.triggerLoadingEvent(true);
    let mappingId=this.newExpense?null:this.expenseID;
    this.paymentsService.mappings(this.currentCompanyId,this.expenseType,"false",this.bankAccountID,this.selectedEntityID,mappingId)
      .subscribe(mappings => {
        this.buildTableData(mappings || []);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
    });

    /*if(this.selectedMappingID){
      let link = ['/payments', this.selectedMappingID];
      this._router.navigate(link);
    }else {
      this.mappingFlyoutCSS="expanded";
      this.titleService.setPageTitle("Payments");
      this.loadingService.triggerLoadingEvent(true);
      this.paymentsService.mappings(this.currentCompanyId,this.expenseType,"false",this.bankAccountID,this.selectedEntityID)
        .subscribe(mappings => {
          this.buildTableData(mappings || []);
        }, error => {
          this.loadingService.triggerLoadingEvent(false);
        });
    }*/
  }

  gotoPreviousState(){
    let base=this;
    let prevState = this.stateService.getPrevState();
    this.stateService.pop();
    let data = prevState.data || [];
    if(data){
      this.accounts=data.bankAccounts;
      this.selectedRows=data.selectedRows;
      this.bankAccountID=data.expenseData.bank_account_id;
      data.expenseData.date=this.dateFormater.formatDate(data.expenseData.date,this.dateFormat,this.serviceDateformat);
      setTimeout(function(){
        base.processExpense(data.expenseData);
        base.showMappingPage();
      },200)
    }
  }

  hideMappingPage(){
    this.mappingFlyoutCSS="collapsed";
  }

  showExpensesPage(bankID?){
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
      this.setDefaultExpenseType();
      this.loadEntities('other');
    }else {
      let prevState = this.stateService.getPrevState();
      if(prevState){
        this.stateService.pop();
        this._router.navigate([prevState.url]);
      }else{
        let link = ['books', 'expenses'];
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
      data.entity_type = entity.entityType;
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
      this.bankAccountID=account.id;
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
    this.expenseData=expense;
    let itemsControl:any = this.expenseForm.controls['expense_items'];
    this.selectedMappingID=expense.mapping_id;
    expense.due_date = this.dateFormater.formatDate(expense.due_date,this.serviceDateformat,this.dateFormat);
    if(expense.expense_items.length>0&&expense.expense_items[0].entity_id){
                this.selectedEntityID=expense.expense_items[0].entity_id;
    }
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
    this.updateLineTotal();
    this.loadingService.triggerLoadingEvent(false);
  }

  getExpenseData(){
    let data = this._expenseForm.getData(this.expenseForm);
    data.payments=this.getExpenseLineData(this.expenseForm);
    data.amount=this.roundOffValue(data.amount);
    this.updateExpenseLinesData(data);
    return data;
  }

  editItem(index, itemForm){
    let base = this;
    let expenseData = this._expenseForm.getData(this.expenseForm);
    let linesControl:any = this.expenseForm.controls['expense_items'];
    let itemData = this._expenseItemForm.getData(itemForm);
    if(!itemData.amount){
      itemData.amount = expenseData.amount || 0;
      this.setValuesToControls(linesControl.controls[index], itemData);
    }
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

  enableLines(){
    let expItems: any = this.expenseForm.controls.expense_items;
    let lines = expItems.controls;
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
    let expenseLines:any = this.expenseForm.controls.expense_items;
    if(key === 'Arrow Down'){
      let nextIndex = this.getNextElement(current_ele,index,'Arrow Down');
      base.editItem(nextIndex, expenseLines.controls[nextIndex]);
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
      base.editItem(nextIndex, expenseLines.controls[nextIndex]);
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
    let base=this;
    $event && $event.stopImmediatePropagation();
    let itemsList:any = this.expenseForm.controls['expense_items'];
    let itemControl = itemsList.controls[index];
    itemControl.controls['destroy'].patchValue(true);
    setTimeout(function(){
      base.updateLineTotal();
      base.handleKeyEvent($event,index,'Arrow Down');
    });
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
    itemControl.controls['entity_type'].patchValue(data.entity_type);
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
      data.entity_type=entity.entityType;
      this.selectedEntityID=entity.id;
    }else if(!entity || entity=='--None--'){
      data.entity_id='--None--';
      this.selectedEntityID=null;
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
    this.setValuesToControls(itemControl, item);
  }

  setValuesToControls(itemControl, item){
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
    //data.expense_items = this.getExpenseItemData(this.expenseForm.controls['expense_items']);
    data.expense_items=this.getExpenseLineData(this.expenseForm);
    data.amount=this.roundOffValue(data.amount);
    this.updateExpenseLinesData(data);
    if(!this.validateData(data)){
      return;
    }
    data.due_date = this.dateFormater.formatDate(data.due_date,this.dateFormat,this.serviceDateformat);
    if(this.newExpense){
      this.loadingService.triggerLoadingEvent(true);
      this.expenseService.addExpense(data, this.currentCompanyId)
        .subscribe(response=>{
          this.toastService.pop(TOAST_TYPE.success, "Expense Added successfully");
          this.loadingService.triggerLoadingEvent(false);
          this.showExpensesPage(data.bank_account_id);
        }, error => {
          this.loadingService.triggerLoadingEvent(false);
          console.log("expense creation failed", error);
        });
    } else{
      if(!this.isMappingsModified){
        data.mapping_ids=this.expenseData.mapping_ids;
      }
      this.tempData=data;
      this.checkLockDate();
    }
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

  updateExpenseDetails(){
    this.expenseService.updateExpense(this.tempData, this.currentCompanyId)
      .subscribe(response =>{
        this.loadingService.triggerLoadingEvent(false);
        this.setUpdatedFlagInStates();
        this.toastService.pop(TOAST_TYPE.success, "Expense Updated successfully");
        this.showExpensesPage();
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
        console.log("updating expense failed", error);
      });
  }

  ngOnInit(){
    this.initialize();
  }

  ngOnDestroy(){
    jQuery('#expense-password-conformation').remove();
    this.routeSubscribe.unsubscribe();
  }

  initialize(){
    let _form = this._expenseForm.getForm();
    _form['expense_items'] = new FormArray([]); //this.expenseItemsArray;
    this.expenseForm = this._fb.group(_form);

    let _itemForm = this._expenseItemForm.getForm();
    this.newItemForm = this._fb.group(_itemForm);

    if(this.newExpense&&!this.isMappingPrevious){
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
        chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
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

  loadEntitiesData(){
    this.vendorService.vendors(Session.getCurrentCompany())
      .subscribe(vendors=> {
        _.forEach(vendors, function(vendor) {
          vendor['entityType']="vendor";
        });
        this.vendorList  = vendors;
      }, error => {
      });
    this.customerService.customers(Session.getCurrentCompany())
      .subscribe(customers=> {
        _.forEach(customers, function(customer) {
          customer['id']=customer.customer_id;
          customer['name']=customer.customer_name;
          customer['entityType']="customer";
        });
        this.customersList  = customers;
      }, error => {
      });
    this.employeeService.employees(Session.getCurrentCompany())
      .subscribe(employees=> {
        _.forEach(employees, function(employee) {
          employee['name']=employee.first_name+""+employee.last_name;
          employee['entityType']="employee";
        });
        this.employeesList  = employees;
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
    this.expenseType=type;
    if(type=='bill'){
    this.entities=this.vendorList;
    }else if (type=='payroll'){
      this.entities=this.employeesList;
    }else if (type=='salesRefund'){
      this.entities=this.customersList;
    }else if(type=='shareholder'){
      this.entities=this.shareHoldersList;
    }else if (type=='other'){
      this.entities=this.entities.concat(this.vendorList).concat(this.employeesList).concat(this.customersList).concat(this.shareHoldersList);
      _.sortBy(this.entities, "name");
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
  loadExpense(){
    let base=this;
    if(!this.newExpense){
      this.titleService.setPageTitle("UPDATE EXPENSE");
      this.expenseService.expense(this.expenseID, this.currentCompanyId)
        .subscribe(expense => {
          this.processExpense(expense.expenses);
        }, error =>{
          this.toastService.pop(TOAST_TYPE.error, "Failed to load expense details");
          this.loadingService.triggerLoadingEvent(false);
        })
    } else{
      this.titleService.setPageTitle("CREATE EXPENSE");
      this.setDueDate(this.defaultDate);
      setTimeout(function(){
        base.loadEntities('other');
      },1000);
      this.setDefaultExpenseType();
      this.loadingService.triggerLoadingEvent(false);
    }
  }

  setDefaultExpenseType(){
    let data = this._expenseForm.getData(this.expenseForm);
    data.expense_type = 'other';
    this._expenseForm.updateForm(this.expenseForm, data);
    //this.loadEntities('other');
  }

  buildTableData(mappings) {
    this.hasMappings = false;
    this.selectedRows=[];
    this.mappings = mappings;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.multiSelectable = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "groupID", "title": "Id","visible":false,"filterable": false},
      {"name": "title", "title": "Payment Title"},
      {"name": "amount", "title": "Amount"},
      {"name": "date", "title": "Date"},
      {"name": "journalID", "title": "journalId","visible":false,"filterable": false},
      {"name": "vendorName", "title": "Vendor"},
      {"name": "mapping", "title": "mapping","visible":false,"filterable": false},
      {"name": "actions", "title": "", "type": "html", "filterable": false},
      {"name": "id", "title": "id","visible":false,"filterable": false}
    ];
    let base = this;
    mappings.forEach(function(pyment) {
      let row:any = {};
      _.each(base.tableColumns, function(key) {
        row[key] = pyment[key];
        if(key == 'amount'){
          let amount = parseFloat(pyment[key]);
          row[key] = amount.toLocaleString(base.localeFormat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      });
      row['actions'] = "<a class='action' data-action='navigatePayment'><span class='icon badge je-badge'>P</span></a>"
      if(pyment.mapping){
        pyment['isPushVal']=true;
        base.selectedRows.push(pyment);
      }
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasMappings = true;
    }, 0);
    this.loadingService.triggerLoadingEvent(false);
  }
  handleSelect(event:any) {
    /*if(event&&event[0])
      this.selectedMappingID=event[0]['groupID'];*/
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
    this.selectedRows = _.uniqBy(this.selectedRows, 'groupID');
  }

  saveMappingID(){
    let mappingData=_.map(this.selectedRows, 'groupID');
    this.isMappingsModified=true;
    let mappings = this.expenseForm.controls['mapping_ids'];
    mappings.patchValue(mappingData);
//    let data = this._expenseForm.getData(this.expenseForm);
    this.mappingFlyoutCSS="collapsed";

    /*let data = this._expenseForm.getData(this.expenseForm);
    data.mapping_id = this.selectedMappingID;
    this._expenseForm.updateForm(this.expenseForm, data);
    this.mappingFlyoutCSS="collapsed";
    this.selectedEntityID=null;*/
  }

  validateData(data){
    let base = this;
    let result=true;
    if(data.bank_account_id=="--None--"||data.bank_account_id==""){
      this.toastService.pop(TOAST_TYPE.error, "Please select valid financial account");
      return false;
    }
    if(data.amount <= 0){
      this.toastService.pop(TOAST_TYPE.error, "Expense amount must be greater than zero.");
      return false;
    }
    let itemTotal = _.sumBy(data.expense_items, function(expense){
      return expense.destroy? 0 : expense.amount;
    });
    itemTotal = this.roundOffValue(itemTotal);
    if(itemTotal != data.amount){
      this.toastService.pop(TOAST_TYPE.error, "Expense amount and Item total did not match.");
      return false;
    }
    return result;
  }

  updateExpenseLinesData(data){
    let base=this;
    _.each(data.expense_items, function(line){
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


  checkLockDate(){
    if(Session.getLockDate()){
      if(moment(Session.getLockDate(),"MM/DD/YYYY").valueOf() > moment().valueOf()){
        jQuery('#expense-password-conformation').foundation('open');
      }else {
        this.updateExpenseDetails();
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
        this.updateExpenseDetails();
      }else {
        this.toastService.pop(TOAST_TYPE.error, "Invalid key");
      }
    },fail=>{

    })
  }
  closePasswordConfirmation(){
    this.resetPasswordConformation();
    jQuery('#expense-password-conformation').foundation('close');
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
    let expenseLineData:any = this.expenseForm.controls['expense_items'];
    this.lineTotal = 0;
    _.each(expenseLineData.controls, function(lineForm){
      let line = base._expenseItemForm.getData(lineForm);
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
    let itemsControl:any = this.expenseForm.controls['expense_items'];
    let data = this._expenseItemForm.getData(itemsControl.controls[index]);
   // const data = this.expenseForm.value;
    const link = ['collaboration', 'expenseLine', data.id];
    this._router.navigate(link);
  }

  handleRedirect(event){
    let action = event.action;
    let data;
    if(action=="navigatePayment"){
      if(this.newExpense){
        data=this.getExpenseData();
      }else {
        data=this.expenseData;
      }
      let persistData={
        expenseData:data,
        bankAccounts:this.accounts,
        selectedRows:this.selectedRows
      };
      this.stateService.addState(new State('showMappingPage', this._router.url, persistData, null));
      let link = ['/payments', event.groupID];
      this._router.navigate(link);
      this.titleService.setPageTitle("Payments");
    }
  }

}
