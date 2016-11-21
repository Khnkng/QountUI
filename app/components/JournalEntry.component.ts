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
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {Router} from "@angular/router";

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
    journalLinesArray: FormArray = new FormArray([]);
    addLineItemMode:boolean = false;
    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    newTags:Array<string>=[];
    allCompanies:Array = [];
    currentCompany:any;
    chartOfAccounts:Array = [];
    lines:Array<any> = [];
    

    constructor(private _jeForm: JournalEntryForm, private _fb: FormBuilder, private coaService: ChartOfAccountsService, private _lineListForm: JournalLineForm,
            private journalService: JournalEntriesService, private toastService: ToastService, private _router:Router) {
        let companyId = Session.getCurrentCompany();
        this.allCompanies = Session.getCompanies();

        if(companyId){
            this.currentCompany = _.find(this.allCompanies, {id: companyId});
        } else if(this.allCompanies.length> 0){
            this.currentCompany = _.find(this.allCompanies, {id: this.allCompanies[0].id});
        }

        this.coaService.chartOfAccounts(this.currentCompany.id)
            .subscribe(chartOfAccounts => {
                this.chartOfAccounts = chartOfAccounts;
            }, error=> this.handleError(error));
        this.toggleAutoReverse();
        this.toggleRecurring();
    }

    newForm() {
        let base = this;
        this.active = false;
        setTimeout(function(){
            base.active=true;
        }, 0);
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

    updateChartOfAccount($event){
        let chartOfAccount = _.find(this.chartOfAccounts, {"name": $event});
        if(chartOfAccount){
            let newCOAControl:any = this.jeForm.controls['newCoa'];
            newCOAControl.patchValue(chartOfAccount.id);
        }
    }

    addNewLine(){
        let data = this._jeForm.getData(this.jeForm);
        let tags = jQuery('#lineTags').tagit("assignedTags");
        let line = {
            "type": data.newType,
            "coa": data.newCoa,
            "amount": data.newAmount,
            "memo": data.newMemo
        };
        this.lines.push(line);
        let lineListForm = this._fb.group(this._lineListForm.getForm(line));
        this.journalLinesArray.push(lineListForm);
        this.addLineItemMode = !this.addLineItemMode;

        let typeControl:any = this.jeForm.controls['newType'];
        typeControl.patchValue('');
        let coaControl:any = this.jeForm.controls['newCoa'];
        coaControl.patchValue('');
        let amountControl:any = this.jeForm.controls['newAmount'];
        amountControl.patchValue(0);
        let memoControl:any = this.jeForm.controls['newMemo'];
        memoControl.patchValue('');
        this.coaComboBox.setValue({}, '');
    }

    deleteLine(lineIndex){

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
        delete data.newAmount;
        delete data.newCoa;
        delete data.newMemo;
        delete data.newTags;

        return data;
    }

    submit($event){
        $event && $event.preventDefault();
        let data = this._jeForm.getData(this.jeForm);
        this.journalService.addJournalEntry(this.cleanData(data), this.currentCompany.id)
            .subscribe(journalEntry => {
                this.toastService.pop(TOAST_TYPE.success, "Journal Entry created successfully");
                let link = ['books', 2];
                this._router.navigate(link);
            }, error=> this.handleError(error));
    }

    handleError(error){
        console.log(error);
    }

    ngOnInit() {
        let _form = this._jeForm.getForm();
        _form['journalLines'] = this.journalLinesArray;
        this.jeForm = this._fb.group(_form);
        this.newForm();
    }
}
