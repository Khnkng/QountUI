/**
 * Created by seshu on 26-02-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {JournalEntryForm, JournalLineForm} from "../forms/JournalEntry.form";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {JournalEntriesService} from "qCommon/app/services/JournalEntries.service";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {Router, ActivatedRoute} from "@angular/router";
import {LoadingService} from "qCommon/app/services/LoadingService";

declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
    selector: 'books',
    templateUrl: '/app/views/journalEntry.html',
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
    newTags:Array<string>=[];
    allCompanies:Array<any> = [];
    currentCompany:any;
    chartOfAccounts:Array<any> = [];
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
    editingLine:any;
    newCOAActive:boolean = true;
    companyCurrency:string;
    addNewLineFlag:boolean = false;
    isSystemCreatedJE:boolean=false;
    showAdvance:boolean=false;
    reversed:boolean = false;
    haveSourceId:boolean = false;
    defaultDate:string;
    stayFlyout:boolean = false;

    constructor(private _jeForm: JournalEntryForm, private _fb: FormBuilder, private coaService: ChartOfAccountsService, private _lineListForm: JournalLineForm,
            private journalService: JournalEntriesService, private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
            private companiesService: CompaniesService, private dimensionService: DimensionService, private loadingService: LoadingService) {
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.defaultDate=moment(new Date()).format("MM/DD/YYYY");
        this.routeSub = this._route.params.subscribe(params => {
            this.journalID=params['journalID'];
            let tempReverse=params['reverse'];
            if(this.journalID){
                if(tempReverse){
                    this.isReverse = true;
                    this.newJournalEntry = true;
                } else{
                    this.newJournalEntry = false;
                }
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
        this.dimensionFlyoutCSS = "collapsed";
    }

    resetLineForm(){
        let typeControl:any = this.lineForm.controls['type'];
        typeControl.patchValue('');
        let entryTypeControl:any = this.lineForm.controls['entryType'];
        entryTypeControl.patchValue('');
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

    showFlyout(lineStatus, index){
        this.dimensionFlyoutCSS = "expanded";
        this.lineActive = true;
        this.resetLineForm();
        this.selectedDimensions = [];

        if(lineStatus == 'NEW'){
            this.editingLine = {
                status: 'NEW'
            };
        } else{
            let itemsControl:any = this.jeForm.controls['journalLines'];
            let lineListItem = itemsControl.controls[index];
            this.editingLine = {
                status: 'UPDATE',
                index: index
            };
            let tempLineForm = _.cloneDeep(lineListItem);
            this.getLineData(tempLineForm);
        }
    }

    getLineData(lineForm){
        let base = this;
        if(this.newJournalEntry){
            let lineData = this._lineListForm.getData(lineForm);
            this.updateLineFormForEdit(lineData);
        } else{
            let lineId = lineForm.controls['id'].value;
            this.journalService.getJournalLine(this.currentCompany.id, this.journalEntry.id, lineId)
                .subscribe(journalLine => {
                    this.updateLineFormForEdit(journalLine);
                }, error => {
                    this.toastService.pop(TOAST_TYPE.error, "Couldn't fetch Line details");
                });
        }
    }

    updateLineFormForEdit(lineData){
        let base = this;
        this._lineListForm.updateForm(this.lineForm, lineData);
        this.filteredChartOfAccounts = _.filter(this.chartOfAccounts, {'category': lineData.type});
        let coa = _.find(this.chartOfAccounts, {'id': lineData.coa});
        this.selectedDimensions = lineData.dimensions;
        this.newLineForm();
        setTimeout(function(){
            base.newCoaComboBox.setValue(coa, 'name');
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
        if(this.editingLine.status == 'NEW'){
            this.resetLineForm();
            if(this.newJournalEntry){
                this.saveLineInView(lineData);
            } else{
                this.saveLineData(lineData);
            }
        } else{
            if(base.newJournalEntry){
                base.updateLineInView(lineData);
            } else{
                base.updateLineData(lineData);
            }
        }
        this.selectedDimensions = [];
        this.hideFlyout();
    }

    /*This will post new line data to backend*/
    saveLineData(lineData){
        this.loadingService.triggerLoadingEvent(true);
        this.journalService.addJournalLine(this.currentCompany.id, this.journalEntry.id, lineData)
            .subscribe(line => {
                this.saveLineInView(line);
                this.editingLine = {};
                this.stopLoaderAndShowMessage(false, "New line added successfully");
            }, error => this.stopLoaderAndShowMessage(true, "Failed to save Journal Line"));
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

    /*This will post updated line data to backend*/
    updateLineData(lineData){
        this.loadingService.triggerLoadingEvent(true);
        this.journalService.updateLineData(this.journalEntry.id, this.currentCompany.id, lineData)
            .subscribe(line => {
                this.updateLineInView(line);
                this.editingLine = {};
                this.stopLoaderAndShowMessage(false, "Line updated successfully");
            }, error => {
                this.stopLoaderAndShowMessage(true, "Failed to update the line");
            });
    }

    /*This will just update line details in VIEW*/
    updateLineInView(line){
        let linesControl:any = this.jeForm.controls['journalLines'];
        let currentLineControl:any = linesControl.controls[this.editingLine.index];
        if(currentLineControl.editable){
            currentLineControl.editable = !currentLineControl.editable;
        }
        currentLineControl.controls['notes'].patchValue(line.notes);
        currentLineControl.controls['type'].patchValue(line.type);
        currentLineControl.controls['coa'].patchValue(line.coa);
        currentLineControl.controls['entryType'].patchValue(line.entryType);
        currentLineControl.controls['amount'].patchValue(line.amount);
        currentLineControl.controls['dimensions'].patchValue(line.dimensions);
    }

    //When user double clicks on the line, it toggles and show the fields
    editLine(lineListItem, index){
        let data = this._jeForm.getData(lineListItem);
        //It works. Not sure whether it has better ways to do.
        jQuery('#coa-'+index).siblings().children('input').val(this.getCOAName(data.coa));
        if(!this.isSystemCreatedJE)
        lineListItem.editable = true;
    }

    //To be invoked when user clicks on tick mark once done with iINLINE editing
    updateLine(lineListItem, index){
        this.editingLine = {
            index: index
        };
        let data = this._lineListForm.getData(lineListItem);
        if(data.coa=='--None--'||data.coa==''){
            this.toastService.pop(TOAST_TYPE.error, "Please select Chart of Account");
            return;
        }
        if(this.newJournalEntry){
            this.updateLineInView(data);
        } else{
            this.updateLineData(data);
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

    toggleLineEdit(lineListItem){
        lineListItem.editable = !lineListItem.editable;
    }

    deleteLine(lineIndex){
        let lineList:any = this.jeForm.controls['journalLines'];
        if(this.newJournalEntry){
            lineList.controls.splice(lineIndex, 1);
        } else{
            let lineId = lineList.controls[lineIndex].controls['id'].value;
            this.loadingService.triggerLoadingEvent(true);
            this.journalService.deleteJournalLine(this.currentCompany.id, this.journalEntry.id, lineId)
                .subscribe(response => {
                    lineList.controls.splice(lineIndex, 1);
                    this.stopLoaderAndShowMessage(false, "Deleted Journal Line successfully");
                }, error =>{
                    this.stopLoaderAndShowMessage(true, "Failed to delete Journal Line");
                })
        }
    }

    getCOAName(coaId){
        let coa = _.find(this.chartOfAccounts, {id: coaId});
        if(coa){
            return coa.name;
        }
        return "";
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

    validateLineAmount(lines){
        let creditTotal = 0;
        let debitTotal = 0;
        _.each(lines, function(line){
            if(line.entryType == 'Credit'){
                creditTotal += parseInt(line.amount);
            }
            if(line.entryType == 'Debit'){
                debitTotal += parseInt(line.amount);
            }
        });
        if(creditTotal == debitTotal){
            return true;
        }
        return false;
    }

    updateJournalLinesData(data){
        _.each(data.journalLines, function(line){
            if(line.coa=='--None--'||line.coa==''){
                line.coa=null;
            }
        });
    }

    getJournalLineData(jeForm){
        let base = this;
        let data = [];
        let linesControl = jeForm.controls['journalLines'];
        _.each(linesControl.controls, function(jeLineControl){
            let lineData = base._lineListForm.getData(jeLineControl);
            data.push(lineData);
        });
        return data;
    }

    submit($event){
        $event && $event.preventDefault();
        let data = this._jeForm.getData(this.jeForm);
        data.journalLines = this.getJournalLineData(this.jeForm);
        this.updateJournalLinesData(data);
        if(!this.validateLineAmount(data.journalLines)){
            this.toastService.pop(TOAST_TYPE.error, "Credit and debit totals doesn't match");
            return false;
        }
        if(data.reversalDate){
            data.autoReverse = true;
        } else{
            data.autoReverse = false;
        }
        this.loadingService.triggerLoadingEvent(true);
        if(this.newJournalEntry){
            this.journalService.addJournalEntry(this.cleanData(data), this.currentCompany.id)
                .subscribe(journalEntry => {
                    this.stopLoaderAndShowMessage(false, "Journal Entry created successfully");
                    this.showDashboard();
                }, error=> this.handleError(error));
        } else{
            data.id = this.journalEntry.id;
            this.journalService.updateJournalEntry(this.cleanData(data), this.currentCompany.id)
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

    updateNewLineCOA(chartOfAccount){
        let lineData = this._lineListForm.getData(this.newJournalLineForm);
        if(chartOfAccount&&chartOfAccount.id){
            lineData.coa = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            lineData.coa='--None--';
        }
        this._lineListForm.updateForm(this.newJournalLineForm, lineData);
    }

    saveNewItem(){
        this.addNewLineFlag = !this.addNewLineFlag;
        let lineData = this._lineListForm.getData(this.newJournalLineForm);
        if(this.newJournalEntry){
            this.saveLineInView(lineData);
        } else{
            this.saveLineData(lineData);
        }
    }

    hideNewItem(){
        this.addNewLineFlag = false;
    }

    processJournalEntry(journalEntry){
        journalEntry.journalLines = _.orderBy(journalEntry.journalLines, ['entryType'], ['desc']);
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
            let lineListForm = base._fb.group(base._lineListForm.getForm(line));
            linesControl.push(lineListForm);
        });
        this.stopLoaderAndShowMessage(false);
        this._jeForm.updateForm(this.jeForm, this.journalEntry);
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
    }

    ngOnInit() {
        let base = this;
        let companyId = Session.getCurrentCompany();
        let _form = this._jeForm.getForm();
        _form['journalLines'] = new FormArray([]); //this.journalLinesArray;
        this.jeForm = this._fb.group(_form);

        let _lineForm = this._lineListForm.getForm();
        this.lineForm = this._fb.group(_lineForm);

        this.newForm();
        this.loadingService.triggerLoadingEvent(true);
        this.companiesService.companies().subscribe(companies =>{
            this.allCompanies = companies;
            if(companyId){
                this.currentCompany = _.find(this.allCompanies, {id: companyId});
            } else if(this.allCompanies.length> 0){
                this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
            }
            this.dimensionService.dimensions(this.currentCompany.id)
                .subscribe(dimensions => {
                    this.dimensions = dimensions;
                }, error => this.handleError(error));

            this.coaService.chartOfAccounts(this.currentCompany.id)
                .subscribe(chartOfAccounts => {
                    this.chartOfAccounts = chartOfAccounts;
                    _.sortBy(this.chartOfAccounts, ['number', 'name']);
                    this.toggleAutoReverse();
                    this.toggleRecurring();
                    if(!this.newJournalEntry || this.isReverse){
                        this.journalService.journalEntry(this.journalID, this.currentCompany.id)
                            .subscribe(journalEntry => this.processJournalEntry(journalEntry), error => this.handleError(error));
                    } else{
                        this.setJournalDate(this.defaultDate);
                        this.stopLoaderAndShowMessage(false);
                    }
                }, error=> this.handleError(error));
        }, error => this.handleError(error));
    }

    showDashboard(){
        if(this.stayFlyout){
            this.ngOnInit();
            this.stayFlyout = false;
            this.dimensionFlyoutCSS = "";
            //location.reload();
        }else {
            let link = ['books', 'journalEntries'];
            this._router.navigate(link);
        }
    }

    goToPreviousPage(){
        let link = [Session.getLastVisitedUrl()];
        this._router.navigate(link);
    }

    showRecurringOpts(){
        this.showAdvance = !this.showAdvance;
    }
}
