
import {Component,ViewChild,ElementRef} from "@angular/core";
import {FormGroup, FormBuilder,FormArray} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {BudgetService} from "qCommon/app/services/Budget.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {BudgetForm,BudgetItemForm} from "../forms/Budget.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {MONTHS_NAMES} from "qCommon/app/constants/Date.constants";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {Router} from "@angular/router";
import {YEARS, BUDGET_YEARS} from "qCommon/app/constants/Date.constants";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {CURRENCY_LOCALE_MAPPER} from "qCommon/app/constants/Currency.constants";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare let jQuery:any;
declare let _:any;
declare let moment:any;

@Component({
  selector: 'budgetdetails',
  templateUrl: '../views/budget.html',
})

export class BudgetComponent{
  budgetForm: FormGroup;
  editItemForm: FormGroup;
  budgetList = [];
  newFormActive:boolean = true;
  hasBudget: boolean = false;
  tableData:any = {};
  tableOptions:any = {};
  editMode:boolean = false;
  currentCompany:any;
  budgetId:any;
  tableColumns:Array<string> = ['name', 'id', 'total','grossProfit','netProfit'];
  combo:boolean = true;
  allCOAList:Array<any> = [];
  showFlyout:boolean = false;
  confirmSubscription:any;
  companyCurrency:string;
  localeFortmat:string='en-US';
  @ViewChild('list') el:ElementRef;
  chartOfAccounts:Array<any>=[];
  revenueCOA:Array<any>=[];
  cogsCOA:Array<any>=[];
  expenseCOA:Array<any>=[];
  selectedGroup:string;
  itemActive:boolean = false;
  dimensionFlyoutCSS:any;
  editItemIndex:number;
  orderedMonths:Array<string>=[];
  incomeTotal:number=0;
  cogsTotal:number=0;
  expenseTotal:number=0;
  routeSubscribe:any;
  years:Array<any>=YEARS;
  budgetYears:Array<any>=BUDGET_YEARS;
  isSingleFisicalYear:boolean=false;
  dimensions:Array<any> = [];
  selectedDimensions:Array<any> = [];
  showDimensions:boolean;
  showFirstStep:boolean = true;
  showSecondStep:boolean = false;
  formattedGrossProfit:string;
  formattedNetProfit:string;
  budgetTableColumns: Array<any> = ['Name', 'Gross profit', 'Net Profit'];
  pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };

  constructor(private _fb: FormBuilder, private _budgetForm: BudgetForm, private switchBoard: SwitchBoard,private _router: Router,
              private budgetService: BudgetService, private toastService: ToastService, private loadingService:LoadingService,
              private coaService: ChartOfAccountsService,private numeralService:NumeralService,private _budgetItemForm: BudgetItemForm,
              private titleService:pageTitleService,private dimensionService: DimensionService, private reportsService: ReportService){
    // this.budgetForm = this._fb.group(_budgetForm.getForm());
    this.titleService.setPageTitle("Budget");
    this.localeFortmat=CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]?CURRENCY_LOCALE_MAPPER[Session.getCurrentCompanyCurrency()]:'en-US';
    this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteBudgetCode(toast));
    this.companyCurrency = Session.getCurrentCompanyCurrency();
    this.currentCompany=Session.getCurrentCompany();
    this.calculateMonthsOrder();
    if(Session.getFiscalStartDate()){
      let momentdate=moment(Session.getFiscalStartDate(), 'MM/DD/YYYY');
      if(momentdate.month()==0&&momentdate.date()==1){
        this.isSingleFisicalYear=true;
      }
    }

    this.dimensionService.dimensions(Session.getCurrentCompany())
      .subscribe(dimensions =>{
        this.dimensions = dimensions;
        this.showDimensions=true;
      }, error => {

      });

    this.loadingService.triggerLoadingEvent(true);
    this.loadBudgets();
    this.coaService.chartOfAccounts(this.currentCompany)
      .subscribe(chartOfAccounts=> {
        chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
        this.chartOfAccounts = chartOfAccounts;
        this.revenueCOA = _.filter(chartOfAccounts, {'category': 'Revenue'});
        _.sortBy(this.revenueCOA, ['name']);
        this.expenseCOA =_.filter(chartOfAccounts, function(coa) {
          return coa.category=='Expenses'&&coa.type!='costOfGoodsSold';
        });
        this.expenseCOA=_.sortBy(this.expenseCOA, ['name']);
        _.filter(chartOfAccounts, {'category': 'Expenses'});
        this.cogsCOA = _.filter(chartOfAccounts, {'type': 'costOfGoodsSold'});
        this.cogsCOA=_.sortBy(this.cogsCOA, ['name']);
      }, error => {

      });
    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      if(this.itemActive){
        this.hideFlyout();
      }else if(this.showFlyout){
        if(this.showFirstStep){
          this.closeFlyout();
        }else if(this.showSecondStep){
          this.hideSecondStep();
        }
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
    this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
  }

  filterChartOfAccounts(chartOfAccounts){
    this.allCOAList = chartOfAccounts;
  }

  loadBudgets(){
    this.resetSteps();
    this.budgetService.budget(this.currentCompany)
      .subscribe(budget => {
        this.budgetList=budget;
        this.buildTableData(this.budgetList);
      }, error => this.handleError(error));
  }

  resetSteps(){
    this.showFirstStep = true;
    this.showSecondStep = false;
  }

  showAddBudget() {
    this.titleService.setPageTitle("CREATE BUDGET");
    this.editMode = false;
    this.newForm();
    let budget:any={};
    let base=this;
    let revenueItemsControl:any = this.budgetForm.controls['income'];
    _.each(this.revenueCOA, function(item){
      item.coaID = item.id;
      revenueItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(item)));
    });
    let cogsItemsControl:any = this.budgetForm.controls['costOfGoodsSold'];
    _.each(this.cogsCOA, function(item){
      item.coaID = item.id;
      cogsItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(item)));
    });
    let expenseItemsControl:any = this.budgetForm.controls['expenses'];
    _.each(this.expenseCOA, function(item){
      item.coaID = item.id;
      expenseItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(item)));
    });
    this._budgetForm.updateForm(this.budgetForm, budget);
    this.showFlyout = true;
  }

  showEditBudget(row: any){
    this.titleService.setPageTitle("UPDATE BUDGET");
    this.loadingService.triggerLoadingEvent(true);
    this.budgetService.getBudget(row.id,this.currentCompany)
      .subscribe(budget => {
        this.processBudget(budget);
      }, error => this.handleError(error));
  }

  processBudget(budget){
    this.editMode = true;
    this.newForm();
    let base=this;
    this.budgetId=budget.id;
    let revenueItemsControl:any = this.budgetForm.controls['income'];
    _.each(budget.budget.income, function(revenueItem){
      base.incomeTotal=base.incomeTotal+revenueItem.total;
      revenueItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(revenueItem)));
    });
    let cogsItemsControl:any = this.budgetForm.controls['costOfGoodsSold'];
    _.each(budget.budget.costOfGoodsSold, function(cogsItem){
      base.cogsTotal=base.cogsTotal+cogsItem.total;
      cogsItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(cogsItem)));
    });
    let expenseItemsControl:any = this.budgetForm.controls['expenses'];
    _.each(budget.budget.expenses, function(expenseItem){
      base.expenseTotal=base.expenseTotal+expenseItem.total;
      expenseItemsControl.controls.push(base._fb.group(base._budgetItemForm.getForm(expenseItem)));
    });
    this.selectedDimensions=budget.dimensions;
    this._budgetForm.updateForm(this.budgetForm, budget);
    this.updateProfits();
    this.showFlyout = true;
    this.loadingService.triggerLoadingEvent(false);
  }

  deleteBudgetCode(toast){
    this.loadingService.triggerLoadingEvent(true);
    let base=this;
    this.budgetService.removeBudget(this.budgetId,this.currentCompany)
      .subscribe(budget => {
        this.toastService.pop(TOAST_TYPE.success, "Budget deleted successfully");
        _.remove(this.budgetList, function(budget) {
          return budget.id == base.budgetId;
        });
        this.buildTableData(this.budgetList);
      }, error => this.handleError(error));
  }
  removeBudget(row: any){
    this.budgetId = row.id;
    this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
  }

  newForm(){
    this.newFormActive = false;
    setTimeout(()=> this.newFormActive=true, 0);
  }

  ngOnInit(){
    let _form = this._budgetForm.getForm();
    _form['income'] = new FormArray([]);
    _form['costOfGoodsSold'] = new FormArray([]);
    _form['expenses'] = new FormArray([]);
    //this.expenseItemsArray;
    this.budgetForm = this._fb.group(_form);
  }

  handleAction($event){
    let action = $event.action;
    delete $event.action;
    delete $event.actions;
    if(action == 'edit') {
      this.showEditBudget($event);
    } else if(action == 'delete'){
      this.removeBudget($event);
    }
  }

  submit($event){
    let base = this;
    $event && $event.preventDefault();
    let data = this._budgetForm.getData(this.budgetForm);
    let budget={
      income:this.getBudgetItemData(this.budgetForm.controls['income']),
      costOfGoodsSold:this.getBudgetItemData(this.budgetForm.controls['costOfGoodsSold']),
      expenses:this.getBudgetItemData(this.budgetForm.controls['expenses'])
    };
    data['budget']=budget;
    this.loadingService.triggerLoadingEvent(true);
    /*if(data.frequency=='yearly'){
     data.startDate=Session.getFiscalStartDate();
     }*/
    data.netProfit=this.incomeTotal-(this.cogsTotal+this.expenseTotal);
    data.grossProfit=this.incomeTotal-this.cogsTotal;
    delete data.income;
    delete data.costOfGoodsSold;
    delete data.expenses;
    if(this.editMode){
      this.budgetService.updateBudget(data,this.currentCompany)
        .subscribe(budget => {
          base.toastService.pop(TOAST_TYPE.success, "Budget updated successfully");
          this.loadBudgets();
          this.showFlyout = false;
          this.resetForm();
        }, error => this.handleError(error));
    } else{
      this.budgetService.addBudget(data,this.currentCompany)
        .subscribe(newBudget => {
          this.toastService.pop(TOAST_TYPE.success, "Budget created successfully");
          this.showFlyout = false;
          this.loadBudgets();
          this.resetForm();
        }, error => this.handleError(error));
    }
  }

  buildTableData(budgetList) {
    this.hasBudget = false;
    this.budgetList = budgetList;
    this.tableData.rows = [];
    this.tableOptions.search = true;
    this.tableOptions.pageSize = 9;
    this.tableData.columns = [
      {"name": "name", "title": "Name"},
      {"name": "grossProfit", "title": "Gross Profit", "sortValue": function(value){
        return base.numeralService.value(value);
      }},
      {"name": "netProfit", "title": "Net Profit", "sortValue": function(value){
        return base.numeralService.value(value);
      }},
      {"name": "id", "title": "Id", "visible": false},
      {"name": "actions", "title": ""}
    ];
    let base = this;
    budgetList.forEach(function(budget) {
      let row:any = {};
      _.each(base.tableColumns, function(key) {
        row[key] = budget[key];
        if(key=='grossProfit'){
          if(budget[key]){
            let total=parseFloat(budget[key]);
            row['grossProfit'] =total.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }else {
            let total=0.00;
            row['grossProfit'] =total.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
        }else if(key=='netProfit'){
          if(budget[key]){
            let total=parseFloat(budget[key]);
            row['netProfit'] =total.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }else {
            let total=0.00;
            row['netProfit'] =total.toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
        }
        row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
      });
      base.tableData.rows.push(row);
    });
    setTimeout(function(){
      base.hasBudget = true;
    }, 0);
    this.loadingService.triggerLoadingEvent(false);
  }

  closeFlyout(){
    this.showFlyout = !this.showFlyout;
    this.resetForm();
    this.showFirstStep = true;
    this.showSecondStep = false;
    this.selectedDimensions=[];
  }

  resetForm(){
    let _form = this._budgetForm.getForm();
    _form['income'] = new FormArray([]);
    _form['costOfGoodsSold'] = new FormArray([]);
    _form['expenses'] = new FormArray([]);
    this.budgetForm = this._fb.group(_form);
    this.cogsTotal=0;
    this.incomeTotal=0;
    this.expenseTotal=0;
    this.updateProfits();
  }


  setStartDate(date){
    let data = this._budgetForm.getData(this.budgetForm);
    data.startDate = date;
    this._budgetForm.updateForm(this.budgetForm, data);
  }


  /*---------------------------------------------budget changes-------------------------------*/


  addDefaultLine(count){
    let linesControl: any = this.budgetForm.controls['income'];
    let cogsLinesControl: any = this.budgetForm.controls['costOfGoodsSold'];
    let expenseLinesControl: any = this.budgetForm.controls['expenses'];
    for(let i=0; i<count; i++){
      let lineForm = this._fb.group(this._budgetItemForm.getForm());
      linesControl.controls.push(lineForm);
    }
    for(let i=0; i<count; i++){
      let lineForm = this._fb.group(this._budgetItemForm.getForm());
      cogsLinesControl.controls.push(lineForm);
    }
    for(let i=0; i<count; i++){
      let lineForm = this._fb.group(this._budgetItemForm.getForm());
      expenseLinesControl.controls.push(lineForm);
    }
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


  editItem(index, itemForm,type){
    this.resetAllLinesFromEditing(this.budgetForm.controls['income']);
    this.resetAllLinesFromEditing(this.budgetForm.controls['costOfGoodsSold']);
    this.resetAllLinesFromEditing(this.budgetForm.controls['expenses']);
    itemForm.editable = !itemForm.editable;
  }

  getCOAName(chartOfAccountId){
    let coa = _.find(this.chartOfAccounts, {'id': chartOfAccountId});
    return coa? coa.name: '';
  }

  getBudgetItemData(expenseForm){
    let base = this;
    let data = [];
    _.each(expenseForm.controls, function(expenseItemControl){
      let itemData = base._budgetItemForm.getData(expenseItemControl);
      for(let i=0;i<base.lineItemNames.length;i++){
        let val=base.lineItemNames[i];
        itemData[val]=base.roundOffValue(itemData[val]);
      }
      data.push(itemData);
    });
    return data;
  }

  editBudgetCoaLine($event, index,type) {
    $event && $event.preventDefault();
    $event && $event.stopImmediatePropagation();
    let base = this,data,itemsControl:any;
    this.selectedGroup=type;
    this.itemActive = true;
    this.dimensionFlyoutCSS = "expanded";
    if(type=='income'){
      itemsControl = this.budgetForm.controls['income'];
      data =this._budgetItemForm.getData(itemsControl.controls[index]);
    }else if(type=='costOfGoodsSold'){
      itemsControl = this.budgetForm.controls['costOfGoodsSold'];
      data =this._budgetItemForm.getData(itemsControl.controls[index]);
    }else if(type=='expenses'){
      itemsControl = this.budgetForm.controls['expenses'];
      data =this._budgetItemForm.getData(itemsControl.controls[index]);
    }
    this.resetAllLinesFromEditing(itemsControl);
    this.editItemForm = this._fb.group(this._budgetItemForm.getForm(data));
    this.editItemIndex = index;
  }

  hideFlyout(){
    this.titleService.setPageTitle("Budget");
    this.dimensionFlyoutCSS = "collapsed";
    this.itemActive = false;
    this.editItemIndex = null;
  }

  /*When user clicks on save button in the flyout*/
  saveItem(){
    let itemData = this._budgetItemForm.getData(this.editItemForm);
    this.updateLineInView(itemData);
    this.hideFlyout();
  }

  /*This will just update line details in VIEW*/
  lineItemNames:Array<string>=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec','total'];
  updateLineInView(item){
    let itemsControl:any;
    if(this.selectedGroup=='income'){
      itemsControl = this.budgetForm.controls['income'];
    }else if(this.selectedGroup=='costOfGoodsSold'){
      itemsControl = this.budgetForm.controls['costOfGoodsSold'];
    }else if(this.selectedGroup=='expenses'){
      itemsControl = this.budgetForm.controls['expenses'];
    }
    let itemControl = itemsControl.controls[this.editItemIndex];
    for(let i=0;i<this.lineItemNames.length;i++){
      let val=this.lineItemNames[i];
      itemControl.controls[val].patchValue(item[val]);
      if(val=='total'){
        this.updateTotals(item[val],this.selectedGroup)
      }
    }
  }

  updateTotalAmount(_val,form,type){
    let total=0;
    for(let i=0;i<this.lineItemNames.length-1;i++){
      let val=this.lineItemNames[i];
      total=total+this.checkNumber(form.controls[val].value)
    }
    form.controls['total'].patchValue(total);
    this.updateTotals(total,type);
  }

  updateBudgetLineAmount(_val,form,type){
    let total=this.checkNumber(form.controls['total'].value);
    if(total){
      let avgVal=Math.round((total/12) * 100) / 100;
      for(let i=0;i<this.lineItemNames.length-1;i++){
        let val=this.lineItemNames[i];
        form.controls[val].patchValue(avgVal);
      }
      this.updateTotals(total,type);
    }
  }

  updateTotals(_total,type){
    let total=0;
    if(type){
      let formControls=this.budgetForm.controls[type]['controls'];
      for(let i=0;i<formControls.length;i++){
        total=total+Number(formControls[i].controls.total.value);
      }
    }

    if(type=='income'){
      this.incomeTotal=total;
    }else if(type=='costOfGoodsSold'){
      this.cogsTotal=total;
    }else {
      this.expenseTotal=total;
    }

    this.updateProfits();
  }

  duplicateAll(form){
    let janValue=this.checkNumber(form.controls['jan'].value);
    if(janValue){
      for(let i=0;i<this.lineItemNames.length-1;i++){
        let val=this.lineItemNames[i];
        form.controls[val].patchValue(janValue);
      }
      this.updateTotalAmount(null,form,this.selectedGroup);
    }else {
      this.toastService.pop(TOAST_TYPE.error, "Please fill Jan month for duplication");
    }
  }


  checkNumber(val) {
    if((val || val == 0) && !isNaN(val)) {
      let _val = parseFloat(val);
      return this.roundOffValue(_val);
    }
    return null;
  }

  calculateMonthsOrder(){
    let allMonths = MONTHS_NAMES;
    if(Session.getFiscalStartDate()){
      let today = new Date(Session.getFiscalStartDate());
      let monthIndex = today.getMonth();
      let i;
      for (i=0; i<12; i++) {
        this.orderedMonths.push(allMonths[monthIndex]);
        monthIndex++;
        if (monthIndex > 11) {
          monthIndex = 0;
        }
      }
    }else {
      this.orderedMonths=MONTHS_NAMES;
    }
    this.orderedMonths.push('total');
  }

  roundOffValue(num){
    return Math.round(num * 100) / 100
  }

  isDimensionSelected(dimensionName){
    let selectedDimensionNames = _.map(this.selectedDimensions, 'name');
    return selectedDimensionNames.indexOf(dimensionName) != -1;
  }

  doNothing($event){
    $event && $event.preventDefault();
    $event && $event.stopPropagation();
    $event && $event.stopImmediatePropagation();
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

  hideSecondStep(){
    this.showFirstStep = true;
    this.showSecondStep = false;
  }

  nextStep($event) {
    $event && $event.preventDefault();
    let dimensions = this.budgetForm.controls['dimensions'];
    dimensions.patchValue(this.selectedDimensions);
    if(this.validateDimensions()){
      this.showFirstStep = false;
      this.showSecondStep = true;
    }else {
      this.toastService.pop(TOAST_TYPE.error, "Duplicate budget exists with these dimensions");
    }
  }

  validateDimensions(){
    let year = this.budgetForm.controls['year'].value;
    let yearFilterList=[];
    let base=this;
    if(this.editMode){
      yearFilterList=_.filter(this.budgetList, function(budget) {
        return budget.year==year&&budget.id!=base.budgetId;
      });
    }else {
      yearFilterList=_.filter(this.budgetList, function(budget) { return budget.year==year;});
    }
    if(yearFilterList.length>0){
      if(this.selectedDimensions.length>0){
        let allOldDimensionValues=[];
        let selectedDimensionsValues=[];
        let duplicates=[];
        _.forEach(yearFilterList, function(budget) {
          if (budget.dimensions.length > 0) {
            _.forEach(budget.dimensions, function(budgetValue) {
              if (budgetValue.values.length > 0) {
                allOldDimensionValues=allOldDimensionValues.concat(budgetValue.values);
              }
            });
          }
        });

        _.forEach(this.selectedDimensions, function(dimension) {
          if (dimension.values.length > 0) {
            selectedDimensionsValues=selectedDimensionsValues.concat(dimension.values);
          }
        });
        duplicates=_.intersection(selectedDimensionsValues,allOldDimensionValues);
        if(duplicates.length>0){
          return false;
        }else {
          return true;
        }
      }
      else{
        let status=true;
        _.forEach(yearFilterList, function(budget) {
          if(budget.dimensions.length==0){
            status=false;
          }
        });
        return status;
      }
    }else{
      return true;
    }
  }

  formatAmount(value){
    return this.numeralService.format('$0,0.00', value);
  }

  updateProfits(){
    this.formattedGrossProfit=this.formatAmount(this.incomeTotal-this.cogsTotal);
    this.formattedNetProfit=this.formatAmount(this.incomeTotal-Number(this.cogsTotal+this.expenseTotal));
  }

  getBudgetTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["Name"] = tempData[i].name;
      tempJsonArray["Gross profit"] = tempData[i].grossProfit;
      tempJsonArray["Net Profit"] = tempData[i].netProfit;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType){
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.budgetTableColumns;
    this.pdfTableData.tableRows.rows = this.getBudgetTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.currentCompany, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "Budget.xls";
        link.click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed to Export table into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF(tabId) {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.currentCompany, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "Budget.pdf";
        link[0].click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed to Export table into PDF");
      });

  }

}
