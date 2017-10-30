/**
 * Created by seshu on 26-02-2016.
 */

import {Component, ViewChild,ElementRef} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {JournalEntryForm, JournalLineForm} from "../forms/JournalEntry.form";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {JournalEntriesService} from "qCommon/app/services/JournalEntries.service";
import {EmployeeService} from "qCommon/app/services/Employees.service";
import {CustomersService} from "qCommon/app/services/Customers.service";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {Router, ActivatedRoute} from "@angular/router";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {StateService} from "qCommon/app/services/StateService";
import {State} from "qCommon/app/models/State";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {NumeralService} from "qCommon/app/services/Numeral.service";

declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
    selector: 'journal-entry',
    templateUrl: '../views/journalEntry.html',
})

export class JournalEntryComponent{
    jeForm: FormGroup;
    lineForm: FormGroup;
    newJournalLineForm: FormGroup;
    active:boolean = true;
    lineActive:boolean = true;
    disableReversalDate:boolean = true;
    disableRecurring:boolean = true;
    disableReverseJournal: boolean = true;
    @ViewChild('editDimension') editDimension;
    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    @ViewChild('newCoaComboBoxDir') newCoaComboBox: ComboBox;
    @ViewChild('reverseJournalDir') reverseJournalComboBox: ComboBox;
    @ViewChild('newEntityComboBoxDir') newEntityComoboBoc: ComboBox;
    newTags:Array<string>=[];
    allCompanies:Array<any> = [];
    companyId:string;
    chartOfAccounts:Array<any> = [];
    vendors:Array<any> = [];
    employees:Array<any> = [];
    customers:Array<any> = [];
    allEntities:Array<any> = [];

    filteredChartOfAccounts:Array<any> = [];
    lines:Array<any> = [];
    routeSub:any;
    newJournalEntry:boolean = true;
    journalID:string;
    journalEntry:any;
    existingJournals:Array<any> = [];
    isReverse:boolean = false;
    dimensions:Array<any> = [];
    dimensionFlyoutCSS:any;
    selectedDimensions:Array<any> = [];
    newCOAActive:boolean = true;
    companyCurrency:string;
    addNewLineFlag:boolean = false;
    isSystemCreatedJE:boolean=false;
    showAdvance:boolean=false;
    reversed:boolean = false;
    haveSourceId:boolean = false;
    defaultDate:string;
    stayFlyout:boolean = false;
    editingLineIndex:number;
    creditTotal:number = 0;
    debitTotal:number = 0;
    focusedIdx = -1;
    @ViewChild('list') el:ElementRef;
    jeDetails:any;
    dateFormat:string;
    serviceDateformat:string;
    badgeText:string="B";
    showBadge:boolean=false;
    routeSubscribe:any;

    constructor(private _jeForm: JournalEntryForm, private _fb: FormBuilder, private coaService: ChartOfAccountsService, private _lineListForm: JournalLineForm,
                private journalService: JournalEntriesService, private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
                private companiesService: CompaniesService, private dimensionService: DimensionService, private loadingService: LoadingService,
                private employeeService: EmployeeService, private customerService: CustomersService,private dateFormater:DateFormater,
                private stateService: StateService,private titleService:pageTitleService,_switchBoard:SwitchBoard,private numeralService:NumeralService) {
        this.titleService.setPageTitle("CREATE JOURNAL ENTRY");
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.companyId = Session.getCurrentCompany();
        this.defaultDate=moment(new Date()).format(this.dateFormat);
        this.routeSub = this._route.params.subscribe(params => {
            this.journalID=params['journalID'];
            let tempReverse=params['reverse'];
            if(this.journalID){
                if(tempReverse){
                    this.isReverse = true;
                    this.newJournalEntry = true;
                    this.titleService.setPageTitle("CREATE JOURNAL ENTRY");
                } else{
                    this.newJournalEntry = false;
                    this.titleService.setPageTitle("UPDATE JOURNAL ENTRY");
                }
            }
        });
        this.companiesService.vendors(this.companyId).subscribe(vendors => {
            _.forEach(vendors, function(vendor) {
                vendor['entityType']="vendor";
            });
            this.vendors = vendors;
        }, error => this.handleError(error));
        this.employeeService.employees(this.companyId).subscribe(employees => {
            _.forEach(employees, function(employee) {
                employee['entityType']="employee";
            });
            this.employees = employees;
        }, error => this.handleError(error));
        this.customerService.customers(this.companyId).subscribe(customers => {
            _.forEach(customers, function(customer) {
                customer['id']=customer.customer_id;
                customer['name']=customer.customer_name;
                customer['entityType']="customer";
            });
            this.customers = customers;
        }, error => this.handleError(error));

        this.routeSubscribe  = _switchBoard.onClickPrev.subscribe(title => {
            if(this.dimensionFlyoutCSS == "expanded"){
                this.hideFlyout();
            }else if(this.showAdvance){
                this.showRecurringOpts();
            }else{
                this.goToPreviousPage();
            }
        });

    }

    toggleReverseJournal(type, reversedFrom){
        let base = this;
        if(type == 'Reversal'){
            this.disableReverseJournal = false;
            let journalEntry = _.find(this.existingJournals, {'id': reversedFrom});
            setTimeout(function () {
                base.reverseJournalComboBox.setValue(journalEntry, 'number');
            });
            if(this.journalEntry && this.journalEntry.id){
                let index = _.findIndex(this.existingJournals, {'id': this.journalEntry.id});
                this.existingJournals.splice(index, 1);
            }
        } else{
            this.disableReverseJournal = true;
        }
    }

    updateLineTotal(){
        let base = this;
        let journallineData:any = this.jeForm.controls['journalLines'];
        this.creditTotal = this.debitTotal = 0;
        _.each(journallineData.controls, function(lineForm){
            let line = base._lineListForm.getData(lineForm);
            if(!line.destroy){
                base.creditTotal += line.creditAmount? base.roundOffValue(parseFloat(line.creditAmount)): 0;
                base.debitTotal += line.debitAmount? base.roundOffValue(parseFloat(line.debitAmount)): 0;
            }
        });
    }

    newForm() {
        let base = this;
        this.active = false;
        setTimeout(function(){
            base.active=true;
        }, 0);
    }

    newLineForm() {
        let base = this;
        this.lineActive = false;
        setTimeout(function(){
            base.lineActive=true;
        }, 0);
    }

    refreshCOA(){
        let base = this;
        this.newCOAActive = false;
        setTimeout(function(){
            base.newCOAActive=true;
        }, 0);
    }

    showNewLine(){
        this.addNewLineFlag = true;
        this.newJournalLineForm = this._fb.group(this._lineListForm.getForm());
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

    /*This function will stop event bubbling to avoid default selection of first value in first dimension*/
    doNothing($event){
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    }

    hideFlyout(){
        this.editingLineIndex = undefined;
        this.dimensionFlyoutCSS = "collapsed";
    }

    resetLineForm(){
        let typeControl:any = this.lineForm.controls['type'];
        typeControl.patchValue('');
        let entryTypeControl:any = this.lineForm.controls['entryType'];
        entryTypeControl.patchValue('');
        let creditAmountControl:any = this.lineForm.controls['creditAmount'];
        creditAmountControl.patchValue(0);
        let debitAmountControl:any = this.lineForm.controls['debitAmount'];
        debitAmountControl.patchValue(0);
        let coaControl:any = this.lineForm.controls['coa'];
        coaControl.patchValue('');
        let amountControl:any = this.lineForm.controls['amount'];
        amountControl.patchValue('');
        let memoControl:any = this.lineForm.controls['notes'];
        memoControl.patchValue('');
        let dimensionsControl:any = this.lineForm.controls['dimensions'];
        dimensionsControl.patchValue([]);
        if(this.newCoaComboBox){
            this.newCoaComboBox.clearValue();
        }
    }

    showFlyout($event, index){
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        this.dimensionFlyoutCSS = "expanded";
        this.lineActive = true;
        this.resetLineForm();
        this.selectedDimensions = [];
        this.editingLineIndex = index;
        let itemsControl:any = this.jeForm.controls['journalLines'];
        let lineListItem = itemsControl.controls[index];
        let tempLineForm = _.cloneDeep(lineListItem);
        let lineData = this._lineListForm.getData(tempLineForm);
        this.selectedDimensions = lineData.dimensions || [];
        this.updateLineFormForEdit(lineData);
        this.resetAllLinesFromEditing(itemsControl);
    }

    updateLineFormForEdit(lineData){
        let base = this;
        this.newLineForm();
        this._lineListForm.updateForm(this.lineForm, lineData);
        this.filteredChartOfAccounts = _.filter(this.chartOfAccounts, {'category': lineData.type});
        let coa = _.find(this.chartOfAccounts, {'id': lineData.coa});
        let data = this._jeForm.getData(this.jeForm);
        let entity = {};
        if(data.jeType == 'Bill'){
            entity = _.find(this.vendors, {'id': lineData.entity});
        } else if(data.jeType == 'Payroll'){
            entity = _.find(this.employees, {'id': lineData.entity});
        } else if(data.jeType == 'Invoice'){
            entity = _.find(this.customers, {'customer_id': lineData.entity});
        } else if(data.jeType == 'Other'){
            entity = _.find(this.allEntities, {'id': lineData.entity});
        }
        this.selectedDimensions = lineData.dimensions;
        setTimeout(function(){
            base.newCoaComboBox.setValue(coa, 'name');
            if(data.jeType == 'Invoice'){
                base.newEntityComoboBoc.setValue(entity, 'customer_name');
            } else{
                base.newEntityComoboBoc.setValue(entity, 'name');
            }
        },0);
    }

    /*When user clicks on save button in the flyout*/
    saveLine(){
        let base = this;
        let dimensions = this.lineForm.controls['dimensions'];
        dimensions.patchValue(this.selectedDimensions);
        let lineData = this._lineListForm.getData(this.lineForm);
        if(lineData.coa=='--None--'||lineData.coa==''){
            this.toastService.pop(TOAST_TYPE.error, "Please select Chart of Account");
            return;
        }
        base.updateLineInView(lineData);
        this.selectedDimensions = [];
        this.hideFlyout();
    }

    /*This will just add new line details in VIEW*/
    saveLineInView(line){
        let base = this;
        let linesControl:any = this.jeForm.controls['journalLines'];
        let lineListForm = _.cloneDeep(this._fb.group(this._lineListForm.getForm(line)));
        linesControl.controls.push(lineListForm);
        let journalData = [];
        _.each(linesControl.controls, function(lineForm){
            journalData.push(base._lineListForm.getData(lineForm));
        });
        this.jeForm.controls['journalLines'].patchValue(journalData);
    }

    /*This will just update line details in VIEW*/
    updateLineInView(line){
        let linesControl:any = this.jeForm.controls['journalLines'];
        let currentLineControl:any = linesControl.controls[this.editingLineIndex];
        if(currentLineControl.editable){
            currentLineControl.editable = !currentLineControl.editable;
        }
        currentLineControl.controls['notes'].patchValue(line.notes);
        currentLineControl.controls['title'].patchValue(line.title);
        currentLineControl.controls['coa'].patchValue(line.coa);
        currentLineControl.controls['entity'].patchValue(line.entity);
        currentLineControl.controls['entityType'].patchValue(line.entityType);
        currentLineControl.controls['creditAmount'].patchValue(line.creditAmount);
        currentLineControl.controls['debitAmount'].patchValue(line.debitAmount);
        currentLineControl.controls['dimensions'].patchValue(line.dimensions);
    }

    resetAllLinesFromEditing(linesControl){
        _.each(linesControl.controls, function(lineControl){
            lineControl.editable = false;
        });
    }

    getLineCount(){
        let linesControl:any = this.jeForm.controls['journalLines'];
        let activeLines = [];
        _.each(linesControl.controls, function(lineControl){
            if(!lineControl.controls['destroy'].value){
                activeLines.push(lineControl);
            }
        });
        return activeLines.length;
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

    //When user double clicks on the line, it toggles and show the fields
    editLine(lineListItem, index){
        let linesControl:any = this.jeForm.controls['journalLines'];
        let data = this._jeForm.getData(lineListItem);
        //It works. Not sure whether it has better ways to do.
        jQuery('#coa-'+index).siblings().children('input').val(this.getCOAName(data.coa));
        let controls = {
            entity:{
                value: data.entity
            }
        };
        jQuery('#vendor-'+index).siblings().children('input').val(this.getEntityName(controls));
        jQuery('#employee-'+index).siblings().children('input').val(this.getEntityName(controls));
        jQuery('#invoice-'+index).siblings().children('input').val(this.getEntityName(controls));
        jQuery('#entity-'+index).siblings().children('input').val(this.getEntityName(controls));
        if(index == this.getLastActiveLineIndex(linesControl)){
            this.addDefaultLine(1);
        }
        this.resetAllLinesFromEditing(linesControl);
        lineListItem.editable = !lineListItem.editable;
    }

    enableLines(){
        let expItems: any = this.jeForm.controls.journalLines;
        let lines = expItems.controls;
        if(lines && lines.length > 0){
            this.editLine(lines[0], 0);
        } else{
            this.addDefaultLine(1);
            this.editLine(lines[0], 0);
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
        let journalLines:any = this.jeForm.controls.journalLines;
        if(key === 'Arrow Down'){
            let nextIndex = this.getNextElement(current_ele,index,'Arrow Down');
            base.editLine(journalLines.controls[nextIndex], nextIndex);
            setTimeout(function(){
                let elem = jQuery(base.el.nativeElement).find("tr")[nextIndex];
                jQuery(elem).find("td input").each(function(id,field) {
                    if(id == 0) {
                        jQuery(field).focus();
                    }
                });
            });
        } else{
            let nextIndex = this.getNextElement(current_ele,index,'Arrow Up');
            base.editLine(journalLines.controls[nextIndex], nextIndex);
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

    setJournalDate(date: string){
        let jeDateControl:any = this.jeForm.controls['date'];
        jeDateControl.patchValue(date);
    }

    setReversalDate(date: string){
        let jeReversalDateControl:any = this.jeForm.controls['reversalDate'];
        jeReversalDateControl.patchValue(date);
    }

    setNextJEDate(date: string){
        let nextJEDateControl:any = this.jeForm.controls['nextJEDate'];
        nextJEDateControl.patchValue(date);
    }

    setEndDate(date: string){
        let endDateControl:any = this.jeForm.controls['endDate'];
        endDateControl.patchValue(date);
    }

    toggleAutoReverse(){
        let base = this;
        setTimeout(function(){
            base.disableReversalDate = !Boolean(base.jeForm.controls['autoReverse'].value);
        }, 0);
    }

    toggleRecurring(){
        let base = this;
        setTimeout(function(){
            base.disableRecurring = !Boolean(base.jeForm.controls['recurring'].value);
        }, 0);
    }

    setReverseJournal(reverseJournal){
        let journal:any;
        _.each(this.existingJournals, function(existingJournal){
            if(existingJournal.number == reverseJournal){
                journal = existingJournal;
            }
        });
        if(!_.isEmpty(journal)) {
            let reverseJournalControl:any = this.jeForm.controls['reversedFrom'];
            reverseJournalControl.patchValue(journal.id);
        }
    }

    updateChartOfAccount(chartOfAccount){
        let lineData = this._lineListForm.getData(this.lineForm);
        if(chartOfAccount&&chartOfAccount.id){
            lineData.coa = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            lineData.coa='--None--';
        }
        this._lineListForm.updateForm(this.lineForm, lineData);
    }

    updateEntity(entity){
        let lineData = this._lineListForm.getData(this.lineForm);
        if(entity && entity.id){
            lineData.entity = entity.id;
            lineData.entityType=entity.entityType;
        } else if(entity && entity.customer_id){
            lineData.entity = entity.customer_id;
            lineData.entityType=entity.entityType;
        } else if(!entity || entity=='--None--'){
            lineData.entity='--None--';
        }
        this._lineListForm.updateForm(this.lineForm, lineData);
    }

    toggleLineEdit(lineListItem){
        lineListItem.editable = !lineListItem.editable;
    }

    deleteLine($event, lineIndex){
        let base = this;
        $event && $event.stopImmediatePropagation();
        let lineList:any = this.jeForm.controls['journalLines'];
        lineList.controls[lineIndex].controls['destroy'].patchValue(true);
        setTimeout(function(){
            base.updateLineTotal();
            base.handleKeyEvent($event,lineIndex,'Arrow Down');
        });
    }

    getCOAName(coaId){
        let coa = _.find(this.chartOfAccounts, {id: coaId});
        if(coa){
            return coa.name;
        }
        return "";
    }

    getEntityName(controls){
        let data = this._jeForm.getData(this.jeForm);
        if(data.jeType == 'Bill'){
            let vendor = _.find(this.vendors, {'id': controls.entity.value});
            return vendor? vendor.name: '';
        } else if(data.jeType == 'Payroll'){
            let employee = _.find(this.employees, {'id': controls.entity.value});
            return employee? employee.name: '';
        } else if(data.jeType == 'Invoice'){
            let customer = _.find(this.customers, {'customer_id': controls.entity.value});
            return customer? customer.customer_name: '';
        }else if(data.jeType == 'Other'){
            let entity = _.find(this.allEntities, {'id': controls.entity.value});
            return entity? entity.name: '';
        }
        return '';
    }

    cleanData(data){
        delete data.newType;
        delete data.newEntryType;
        delete data.newDimensions;
        delete data.newAmount;
        delete data.newCoa;
        delete data.newTitle;
        delete data.newMemo;

        return data;
    }

    updateJournalLinesData(data){
        let base=this;
        _.each(data.journalLines, function(line){
            if(line.coa=='--None--'||line.coa==''){
                line.coa=null;
            }
            if(line.entity=='--None--'||line.entity==''){
                line.entity=null;
            }
            if(line.creditAmount){
                line.creditAmount=base.roundOffValue(line.creditAmount);
            }
            if(line.debitAmount){
                line.debitAmount=base.roundOffValue(line.debitAmount);
            }
        });
    }

    getJournalLineData(jeForm) {
        let base = this;
        let data = [];
        let linesControl = jeForm.controls['journalLines'];
        let defaultLine = this._lineListForm.getData(this._fb.group(this._lineListForm.getForm()));
        _.each(linesControl.controls, function (jeLineControl) {
            let lineData = base._lineListForm.getData(jeLineControl);
            if(!_.isEqual(lineData, defaultLine)){
                if(!base.newJournalEntry){
                    data.push(lineData);
                } else if(!lineData.destroy){
                    data.push(lineData);
                }
            }
        });
        return data;
    }

    validateLines(lines){
        let base = this;
        let result = false;
        _.each(lines, function(line){
            if(!line.destroy){
                if(line.creditAmount && line.debitAmount){
                    base.toastService.pop(TOAST_TYPE.error, "One of the lines have both Credit and Debit amount");
                    result = true;
                    return false;
                }
                if(!line.coa){
                    base.toastService.pop(TOAST_TYPE.error, "Chat of Account is not selected for line");
                    result = true;
                    return false;
                }
                if(line.debitAmount == 0 && line.creditAmount == 0){
                    base.toastService.pop(TOAST_TYPE.error, "Line should have either Credit or Debit amount");
                    result = true;
                    return false;
                }
            }
        });
        if(!result){
            this.updateLineTotal();
            if(this.creditTotal.toFixed(2) != this.debitTotal.toFixed(2)){
                this.toastService.pop(TOAST_TYPE.error, "Credit and debit totals doesn't match");
                result = true;
            }
        }
        return result;
    }

    updateLineEntryTypes(lines){
        _.each(lines, function(line){
            if(line.creditAmount){
                line.entryType = 'Credit';
                line.amount = line.creditAmount;
            }else if(line.debitAmount){
                line.entryType = 'Debit';
                line.amount = line.debitAmount;
            }
            line.entity = line.entity? line.entity: null;
            delete line.debitAmount;
            delete line.creditAmount;
        });
    }

    submit($event){
        $event && $event.preventDefault();
        let data = this._jeForm.getData(this.jeForm);
        data.date = this.dateFormater.formatDate(data.date,this.dateFormat,this.serviceDateformat);
        data.reversalDate = data.reversalDate?this.dateFormater.formatDate(data.reversalDate,this.dateFormat,this.serviceDateformat):"";
        data.nextJEDate = data.nextJEDate?this.dateFormater.formatDate(data.nextJEDate,this.dateFormat,this.serviceDateformat):"";
        data.endDate = data.endDate?this.dateFormater.formatDate(data.endDate,this.dateFormat,this.serviceDateformat):"";
        data.journalLines = this.getJournalLineData(this.jeForm);
        this.updateJournalLinesData(data);
        if(this.validateLines(data.journalLines)){
            return;
        }
        this.updateLineEntryTypes(data.journalLines);
        if(data.reversalDate){
            data.autoReverse = true;
        } else{
            data.autoReverse = false;
        }
        this.loadingService.triggerLoadingEvent(true);
        if(this.newJournalEntry){
            this.journalService.addJournalEntry(this.cleanData(data), this.companyId)
                .subscribe(journalEntry => {
                    this.stopLoaderAndShowMessage(false, "Journal Entry created successfully");
                    this.showDashboard();
                }, error=> this.handleError(error));
        } else{
            data.id = this.journalEntry.id;
            this.journalService.updateJournalEntry(this.cleanData(data), this.companyId)
                .subscribe(journalEntry => {
                    this.stopLoaderAndShowMessage(false, "Journal Entry updated successfully");
                    this.showDashboard();
                }, error=> this.handleError(error));
        }
    }

    handleError(error){
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
    }

    filterChartOfAccounts(category){
        let base = this;
        this.filteredChartOfAccounts = [];
        _.each(this.chartOfAccounts, function (coa) {
            if(coa.category && category && (coa.category.toLowerCase() == category.toLowerCase())){
                base.filteredChartOfAccounts.push(coa);
            }
        });
    }

    isJournalEntry(entityType){
        let data = this._jeForm.getData(this.jeForm);
        return data.jeType == entityType;
    }

    getFilteredCOA(category){
        let base = this;
        let filteredCOA = [];
        _.each(this.chartOfAccounts, function (coa) {
            if(coa.category && category && (coa.category.toLowerCase() == category.toLowerCase())){
                filteredCOA.push(coa);
            }
        });
        return filteredCOA;
    }

    updateLineCOA(chartOfAccount, index){
        let linesControl:any = this.jeForm.controls['journalLines'];
        let currentLineForm:any = linesControl.controls[index];
        let currentLineData = this._lineListForm.getData(currentLineForm);
        if(chartOfAccount&&chartOfAccount.id){
            currentLineData.coa = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            currentLineData.coa='--None--';
        }
        this._lineListForm.updateForm(currentLineForm, currentLineData);
    }

    updateLineEntity(entity, index){
        let linesControl:any = this.jeForm.controls['journalLines'];
        let currentLineForm:any = linesControl.controls[index];
        let currentLineData = this._lineListForm.getData(currentLineForm);
        if(entity && entity.id){
            currentLineData.entity = entity.id;
            currentLineData.entityType=entity.entityType;
        } else if(entity && entity.customer_id){
            currentLineData.entity = entity.customer_id;
            currentLineData.entityType=entity.entityType;
        } else if(!entity || entity=='--None--'){
            currentLineData.entity='--None--';
        }
        this._lineListForm.updateForm(currentLineForm, currentLineData);
    }

    updateNewLineCOA(chartOfAccount){
        let lineData = this._lineListForm.getData(this.newJournalLineForm);
        if(chartOfAccount&&chartOfAccount.id){
            lineData.coa = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            lineData.coa='--None--';
        }
        this._lineListForm.updateForm(this.newJournalLineForm, lineData);
    }

    processJournalEntry(journalEntry){
        this.jeDetails=journalEntry;
        let jeType = journalEntry.jeType? journalEntry.jeType: 'Other';
        this.onJETypeSelect(jeType);
        this.setBadge();
        journalEntry.journalLines = _.orderBy(journalEntry.journalLines, ['entryType'], ['desc']);
        if(journalEntry.journalLines && journalEntry.journalLines.length == 0){
            this.addDefaultLine(2);
        }
        journalEntry.date = this.dateFormater.formatDate(journalEntry.date,this.serviceDateformat,this.dateFormat);
        if(journalEntry.journalLines && journalEntry.journalLines.length == 0){
            this.addDefaultLine(2);
        }
        let base = this;
        this.journalEntry = journalEntry;
        if(this.isReverse){
            this.journalEntry.number += 'R';
            this.journalEntry.type = 'Reversal';
            this.journalEntry.reversedFrom = this.journalEntry.id;
            _.each(this.journalEntry.journalLines, function(line){
                if(line.entryType == 'Debit'){
                    line.entryType = 'Credit';
                } else if(line.entryType == 'Credit'){
                    line.entryType = 'Debit';
                }
            });
        }
        if(journalEntry['createdBY']==='system'){
            this.isSystemCreatedJE=true;
        }
        this.disableReversalDate = !Boolean(journalEntry.autoReverse);
        this.disableRecurring = !Boolean(journalEntry.recurring);
        let linesControl:any = this.jeForm.controls['journalLines'];
        _.each(this.journalEntry.journalLines, function(line){
            if(line.entryType == 'Credit'){
                line.creditAmount = line.amount;
            } else if(line.entryType == 'Debit'){
                line.debitAmount = line.amount;
            }
            line.destroy = false;
            let lineListForm = base._fb.group(base._lineListForm.getForm(line));
            linesControl.push(lineListForm);
        });
        this.stopLoaderAndShowMessage(false);
        this._jeForm.updateForm(this.jeForm, this.journalEntry);
        this.updateLineTotal();
        this.reversed = journalEntry.reversed;
        if(journalEntry.reversedFrom){
            this.haveSourceId = true;
        }else{
            this.haveSourceId = false;
        }
    }

    stopLoaderAndShowMessage(error, message?){
        this.loadingService.triggerLoadingEvent(false);
        if(message){
            let type = error? TOAST_TYPE.error : TOAST_TYPE.success;
            this.toastService.pop(type, message);
        }
    }

    getDimensions(dimensions){
        let result = "";
        _.each(dimensions, function(dimension, index){
            if(index == 0){
                result = dimension.name;
            }else {
                result += ','+dimension.name;
            }
        });
        return result;
    }

    ngOnDestroy(){
        jQuery('.pika-single').remove();
        jQuery('.ui-helper-hidden-accessible').remove();
        jQuery('.ui-menu').remove();
        this.routeSubscribe.unsubscribe();
    }

    addDefaultLine(count){
        let linesControl: any = this.jeForm.controls['journalLines'];
        for(let i=0; i<count; i++){
            let lineForm = this._fb.group(this._lineListForm.getForm());
            linesControl.controls.push(lineForm);
        }
    }

    ngOnInit(){
        this.initializeJournal();
    }

    initializeJournal(){
        let base = this;
        let _form = this._jeForm.getForm();
        _form['journalLines'] = new FormArray([]); //this.journalLinesArray;
        this.jeForm = this._fb.group(_form);

        let _lineForm = this._lineListForm.getForm();
        this.lineForm = this._fb.group(_lineForm);

        if(this.newJournalEntry){
            this.addDefaultLine(2);
        }

        this.newForm();
        this.loadingService.triggerLoadingEvent(true);
        this.companiesService.companies().subscribe(companies =>{
            this.allCompanies = companies;
            this.dimensionService.dimensions(this.companyId)
                .subscribe(dimensions => {
                    this.dimensions = dimensions;
                }, error => this.handleError(error));

            this.coaService.chartOfAccounts(this.companyId)
                .subscribe(chartOfAccounts => {
                    chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
                    this.chartOfAccounts = chartOfAccounts;
                    _.sortBy(this.chartOfAccounts, ['number', 'name']);
                    this.toggleAutoReverse();
                    this.toggleRecurring();
                    if(!this.newJournalEntry || this.isReverse){
                        this.journalService.journalEntry(this.journalID, this.companyId)
                            .subscribe(journalEntry => this.processJournalEntry(journalEntry),
                                error => this.handleError(error));
                    } else{
                        this.setJournalDate(this.defaultDate);
                        this.stopLoaderAndShowMessage(false);
                    }
                }, error=> this.handleError(error));
        }, error => this.handleError(error));
    }

    showDashboard(){
        if(this.stayFlyout){
            this.initializeJournal();
            this.stayFlyout = false;
            this.dimensionFlyoutCSS = "";
        }else {
            let link = ['books', 'journalEntries'];
            this._router.navigate(link);
        }
    }

    goToPreviousPage(){
        let prevState = this.stateService.getPrevState();
        if(prevState){
            if(prevState.key == 'JOURNAL_ENTRY'){
              this.stateService.pop();
              this.goToPreviousPage();
            } else{
              this._router.navigate([prevState.url]);
            }
        } else{
            let link = ['books', 'journalEntries'];
            this._router.navigate(link);
        }
    }

    showRecurringOpts(){
        this.showAdvance = !this.showAdvance;
    }

    jeDrilldown(){
        let sourceID=this.jeDetails['sourceID'];
        let sourceType=this.jeDetails['sourceType'];
        let source=this.jeDetails['source'];
        this.stateService.addState(new State('JOURNAL_ENTRY', this._router.url, null, null));
        if(sourceID&&sourceType=='bill'&&source=='accountsPayable'){
            let link = ['payments/bill',Session.getCurrentCompany(),sourceID,'enter'];
            this._router.navigate(link);
        }else if(sourceID&&sourceType=='credit'){
            let link = ['payments/credit',Session.getCurrentCompany(),sourceID];
            this._router.navigate(link);
        }else if(sourceID&&sourceType=='deposit'&&source=='inflow'){
            let link = ['/deposit', sourceID];
            this._router.navigate(link);
        }else if(sourceID&&sourceType=='expense'&&source=='outflow'){
            let link = ['/expense',sourceID];
            this._router.navigate(link);
        }else if(sourceID&&sourceType=='payment'&&source=='accountsPayable'){
            let link = ['/payments', sourceID];
            this._router.navigate(link);

        }else if(sourceID&&source=='accountsReceivable'){
            if(sourceType == 'invoice') {
                let link = ['invoices/edit', sourceID];
                this._router.navigate(link);
            }else if(sourceType == 'payment'){
                let link = ['payments/edit', sourceID];
                this._router.navigate(link);
            }
        }
    }

    setBadge(){
        let sourceID=this.jeDetails['sourceID'];
        let sourceType=this.jeDetails['sourceType'];
        let source=this.jeDetails['source'];
        if(sourceID && source === 'accountsPayable'){
            if(sourceType === 'payment'){
                this.badgeText="P";
                this.showBadge=true;
            }else{
                this.badgeText="B";
                this.showBadge=true;
            }
        }else if(sourceID && source === 'accountsReceivable'){
            if(sourceType === 'payment'){
                this.badgeText="P";
                this.showBadge=true;
            }else if(sourceType === 'invoice'){
                this.badgeText="I";
                this.showBadge=true;
            }
        }else if(sourceID && source === 'outflow'){
            this.badgeText="E";
            this.showBadge=true;
        }else if(sourceID && source === 'inflow'){
            this.badgeText="D";
            this.showBadge=true;
        }else if(sourceID && sourceType === 'credit'){
            this.badgeText="C";
            this.showBadge=true;
        }
    }

    onJETypeSelect(jeType){
        if(jeType=="Other"){
            let allArray=[];
            this.allEntities=allArray.concat(this.vendors).concat(this.customers).concat(this.employees);
        }
    }

    roundOffValue(num){
        return Math.round(num * 100) / 100
    }

    formatAmount(value){
        return this.numeralService.format('$0,0.00', value)
    }

}
