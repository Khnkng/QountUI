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

declare var _:any;
declare var jQuery:any;
declare var moment:any;

@Component({
    selector: 'books',
    templateUrl: '/app/views/journalEntry.html',
})

export class JournalEntryComponent{
    jeForm: FormGroup;
    active:boolean = true;
    disableReversalDate:boolean = true;
    disableRecurring:boolean = true;
    disableReverseJournal: boolean = true;
    journalLinesArray: FormArray = new FormArray([]);
    tempJournalLinesArray: FormArray = new FormArray([]);
    addLineItemMode:boolean = false;
    @ViewChild('editDimension') editDimension;
    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    @ViewChild('reverseJournalDir') reverseJournalComboBox: ComboBox;
    newTags:Array<string>=[];
    allCompanies:Array = [];
    currentCompany:any;
    chartOfAccounts:Array = [];
    filteredChartOfAccounts:Array = [];
    lines:Array<any> = [];
    routeSub:any;
    newJournalEntry:boolean = true;
    journalID:string;
    journalEntry:any;
    existingJournals:Array = [];
    isReverse:boolean = false;
    dimensions:Array<any> = [];
    editDimension:boolean = false;
    dimensionFlyoutCSS:any;
    selectedDimensions:Array = [];

    constructor(private _jeForm: JournalEntryForm, private _fb: FormBuilder, private coaService: ChartOfAccountsService, private _lineListForm: JournalLineForm,
            private journalService: JournalEntriesService, private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
            private companiesService: CompaniesService, private dimensionService: DimensionService) {
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

    getDimensionValues(dimensions){
        if(dimensions){
            return dimensions[0].split(',');
        } else{
            return [];
        }
    }

    isDimensionSelected(id){
        return this.selectedDimensions.indexOf(id) != -1;
    }

    selectDimension(id){
        if(this.selectedDimensions.indexOf(id) == -1){
            this.selectedDimensions.push(id);
        } else{
            this.selectedDimensions.splice(this.selectedDimensions.indexOf(id), 1);
        }
    }

    hideDimensionFlyout(){
        this.dimensionFlyoutCSS = "collapsed";
    }

    showDimensionFlyout(){
        this.dimensionFlyoutCSS = "expanded";
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
        let journal;
        _.each(this.existingJournals, function(existingJournal){
            if(existingJournal.number == reverseJournal){
                journal = existingJournal;
            }
        });
        if(!_.isEmpty(journal)) {
            var reverseJournalControl = this.jeForm.controls['reversedFrom'];
            reverseJournalControl.patchValue(journal.id);
        }
    }

    updateChartOfAccount($event){
        let chartOfAccount = _.find(this.chartOfAccounts, {"name": $event});
        if(!_.isEmpty(chartOfAccount)){
            let newCOAControl:any = this.jeForm.controls['newCoa'];
            newCOAControl.patchValue(chartOfAccount.id);
        }
    }

    addNewLine(){
        let data = this._jeForm.getData(this.jeForm);
        let tags = jQuery('#lineTags').tagit("assignedTags");
        let line = {
            "type": data.newType,
            "entryType": data.newEntryType,
            "coa": data.newCoa,
            "amount": data.newAmount,
            "memo": data.newMemo,
            "dimensions": jQuery('#dimension').val()
        };
        this.lines.push(line);
        let lineListForm = this._fb.group(this._lineListForm.getForm(line));
        this.journalLinesArray.push(lineListForm);
        this.tempJournalLinesArray.push(lineListForm);
        this.addLineItemMode = !this.addLineItemMode;

        let typeControl:any = this.jeForm.controls['newType'];
        typeControl.patchValue('');
        let typeControl:any = this.jeForm.controls['newEntryType'];
        typeControl.patchValue('');
        let coaControl:any = this.jeForm.controls['newCoa'];
        coaControl.patchValue('');
        let amountControl:any = this.jeForm.controls['newAmount'];
        amountControl.patchValue('');
        let memoControl:any = this.jeForm.controls['newMemo'];
        memoControl.patchValue('');
        this.coaComboBox.clearValue();
    }

    editLine(lineListItem, index){
        let data = this._jeForm.getData(lineListItem);
        //It works. Not sure whether it has better ways to do.
        jQuery('#coa-'+index).siblings().children('input').val(this.getCOAName(data.coa));
        lineListItem.editable = true;
    }

    updateLine(lineListItem, index){
        this.journalLinesArray.controls[index] = this.tempJournalLinesArray.controls[index];
        lineListItem.editable = false;
    }

    toggleLineEdit(lineListItem){
        lineListItem.editable = !lineListItem.editable;
    }

    deleteLine(lineIndex){
        this.journalLinesArray.controls.splice(lineIndex, 1);
        this.tempJournalLinesArray.controls.splice(lineIndex, 1);
    }

    getCOAName(coaId){
        let coa = _.find(this.chartOfAccounts, {id: coaId});
        if(coa){
            return coa.name;
        }
        return "";
    }

    clearNewRowData(){
        this.addLineItemMode = !this.addLineItemMode;
    }

    cleanData(data){
        delete data.newType;
        delete data.newEntryType;
        delete data.newAmount;
        delete data.newCoa;
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

    submit($event){
        let base = this;
        $event && $event.preventDefault();
        let data = this._jeForm.getData(this.jeForm);
        if(!this.validateLineAmount(data.journalLines)){
            this.toastService.pop(TOAST_TYPE.error, "Credit and debit totals doesn't match");
            return false;
        }
        if(this.newJournalEntry){
            this.journalService.addJournalEntry(this.cleanData(data), this.currentCompany.id)
                .subscribe(journalEntry => {
                    this.toastService.pop(TOAST_TYPE.success, "Journal Entry created successfully");
                    let link = ['books', 2];
                    this._router.navigate(link);
                }, error=> this.handleError(error));
        } else{
            data.id = this.journalEntry.id;
            data.journalLines = [];
            _.each(this.journalLinesArray.controls, function(lineListForm){
                data.journalLines.push(base._lineListForm.getData(lineListForm));
            });
            this.journalService.updateJournalEntry(this.cleanData(data), this.currentCompany.id)
                .subscribe(journalEntry => {
                    this.toastService.pop(TOAST_TYPE.success, "Journal Entry updated successfully");
                    let link = ['books', 2];
                    this._router.navigate(link);
                    console.log(journalEntry);
                }, error=> this.handleError(error));
        }
    }

    handleError(error){
        this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
    }

    filterChartOfAccounts(category){
        let base = this;
        this.filteredChartOfAccounts = [];
        _.each(this.chartOfAccounts, function (coa) {
            if(coa.category && (coa.category.toLowerCase() == category.toLowerCase())){
                base.filteredChartOfAccounts.push(coa);
            }
        });
    }

    getFilteredCOA(category){
        let base = this;
        let filteredCOA = [];
        _.each(this.chartOfAccounts, function (coa) {
            if(coa.category && (coa.category.toLowerCase() == category.toLowerCase())){
                filteredCOA.push(coa);
            }
        });
        return filteredCOA;
    }

    updateLineCOA($event, index){
        let chartOfAccount = _.find(this.chartOfAccounts, {"name": $event});
        if(!_.isEmpty(chartOfAccount)){
            this.tempJournalLinesArray.controls[index].controls['coa'].patchValue(chartOfAccount.id);
        }
    }

    processJournalEntry(journalEntry){
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
        this.disableReversalDate = !Boolean(journalEntry.autoReverse);
        this.disableRecurring = !Boolean(journalEntry.recurring);
        this.lines = this.journalEntry.journalLines;
        this.journalEntry.journalLines.forEach(function(line, index){
            let lineListForm = base._fb.group(base._lineListForm.getForm(line));
            base.journalLinesArray.push(lineListForm);
        });
        this.tempJournalLinesArray = _.cloneDeep(this.journalLinesArray);
        this._jeForm.updateForm(this.jeForm, this.journalEntry);
    }

    getDimensionNames(dimensionsIds){
        let base = this;
        let ids = dimensionsIds.split(',');
        let result = [];
        _.each(ids, function(id){
            let dimension = _.find(base.dimensions, {id: id});
            if(!_.isEmpty(dimension)){
                result.push(dimension.name);
            }
        });
        return result;
    }

    ngOnInit() {
        let base = this;
        let companyId = Session.getCurrentCompany();
        let _form = this._jeForm.getForm();
        _form['journalLines'] = this.journalLinesArray;
        this.jeForm = this._fb.group(_form);
        this.newForm();
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
                }, error=> this.handleError(error));
            this.toggleAutoReverse();
            this.toggleRecurring();

            if(!this.newJournalEntry || this.isReverse){
                this.journalService.journalEntry(this.journalID, this.currentCompany.id)
                    .subscribe(journalEntry => this.processJournalEntry(journalEntry), error => this.handleError(error));
            }
        }, error => this.handleError(error));
    }
}
