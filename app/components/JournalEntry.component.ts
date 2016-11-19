/**
 * Created by seshu on 26-02-2016.
 */

import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {JournalEntryForm} from "../forms/JournalEntry.form";
import {FormBuilder, FormGroup} from "@angular/forms";

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

    constructor(private _jeForm: JournalEntryForm, private _fb: FormBuilder) {
        this.jeForm = this._fb.group(this._jeForm.getForm());
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

    submit($event){

    }

    ngOnInit() {
    }
}
