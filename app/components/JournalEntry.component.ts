/**
 * Created by seshu on 26-02-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {JournalEntryForm} from "../forms/JournalEntry.form";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";

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

    constructor(private _jeForm: JournalEntryForm, private _fb: FormBuilder, private coaService: ChartOfAccountsService) {
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
        this.active = false;
        setTimeout(()=> this.active=true, 0);
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
        let newCOAControl:any = this.jeForm.controls['newCOA'];
        newCOAControl.patchValue("");
    }

    addNewLine(){
        let data = this._jeForm.getData(this.jeForm);
        let tags = jQuery('#lineTags').tagit("assignedTags");
        console.log(data, tags);
    }

    clearNewRowData(){
        this.addLineItemMode = !this.addLineItemMode;
    }

    submit($event){

    }

    ngOnInit() {
        let _form = this._jeForm.getForm();
        _form['lines'] = this.journalLinesArray;
        this.jeForm = this._fb.group(_form);
    }
}
