/**
 * Created by venkatkollikonda on 09/08/17.
 */

import {Component, ViewChild,ElementRef} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {metricPeriodForm, MetricsLineForm} from "../forms/Metrics.form";
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
import {MetricsService} from "../services/Metrics.service";

declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
    selector: 'create-metric',
    templateUrl: '../views/CreateMetrics.html',
})

export class CreateMetricComponent{
    metricForm: FormGroup;
    lineForm: FormGroup;
    newMetricLineForm: FormGroup;
    active:boolean = true;
    lineActive:boolean = true;
    disableReverseJournal: boolean = true;
    @ViewChild('editDimension') editDimension;
    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    @ViewChild('newCoaComboBoxDir') newCoaComboBox: ComboBox;
    @ViewChild('reverseJournalDir') reverseJournalComboBox: ComboBox;
    @ViewChild('newEntityComboBoxDir') newEntityComoboBoc: ComboBox;
    newTags:Array<string>=[];
    companyId:string;
    metrics:Array<any> = [];
    allEntities:Array<any> = [];

    filteredChartOfAccounts:Array<any> = [];
    lines:Array<any> = [];
    routeSub:any;
    newValueMetric:boolean = true;
    valueMetricID:string;
    valueMetric:any;
    existingJournals:Array<any> = [];
    dimensions:Array<any> = [];
    selectedDimensions:Array<any> = [];
    newCOAActive:boolean = true;
    companyCurrency:string;
    addNewLineFlag:boolean = false;
    defaultDate:string;
    stayFlyout:boolean = false;
    editingLineIndex:number;
    focusedIdx = -1;
    @ViewChild('list') el:ElementRef;
    metricDetails:any;
    dateFormat:string;
    serviceDateformat:string;
    badgeText:string="B";
    showBadge:boolean=false;
    routeSubscribe:any;
    years:Array<any> = [];

    constructor(private _metricForm: metricPeriodForm, private _fb: FormBuilder, private coaService: ChartOfAccountsService, private _metricLineForm: MetricsLineForm,
                private journalService: JournalEntriesService,private metricService: MetricsService, private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
                private loadingService: LoadingService, private dateFormater:DateFormater,
                private stateService: StateService,private titleService:pageTitleService,_switchBoard:SwitchBoard) {
        this.titleService.setPageTitle("INPUT METRIC");
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.companyId = Session.getCurrentCompany();
        this.defaultDate=moment(new Date()).format(this.dateFormat);
        this.generateYears();

        this.routeSubscribe  = _switchBoard.onClickPrev.subscribe(title => {
            this.goToPreviousPage();
        });

    }

    toggleReverseJournal(type, reversedFrom){
        let base = this;
        if(type == 'Reversal'){
            this.disableReverseJournal = false;
            let valueMetric = _.find(this.existingJournals, {'id': reversedFrom});
            setTimeout(function () {
                base.reverseJournalComboBox.setValue(valueMetric, 'number');
            });
            if(this.valueMetric && this.valueMetric.id){
                let index = _.findIndex(this.existingJournals, {'id': this.valueMetric.id});
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
        this.newMetricLineForm = this._fb.group(this._metricLineForm.getForm());
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

    updateLineFormForEdit(lineData){
        let base = this;
        this.newLineForm();
        this._metricLineForm.updateForm(this.lineForm, lineData);
        this.filteredChartOfAccounts = _.filter(this.metrics, {'category': lineData.type});
        let coa = _.find(this.metrics, {'id': lineData.coa});
        let data = this._metricForm.getData(this.metricForm);
        let entity = {};
        if(data.jeType == 'Other'){
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



    /*This will just add new line details in VIEW*/
    saveLineInView(line){
        let base = this;
        let linesControl:any = this.metricForm.get('metricLines');
        let lineListForm = _.cloneDeep(this._fb.group(this._metricLineForm.getForm(line)));
        linesControl.controls.push(lineListForm);
        let journalData = [];
        _.each(linesControl.controls, function(lineForm){
            journalData.push(base._metricLineForm.getData(lineForm));
        });
        linesControl.patchValue(journalData);
    }

    /*This will just update line details in VIEW*/
    updateLineInView(line){
        let linesControl:any = this.metricForm.get('metricLines');
        let currentLineControl:any = linesControl.controls[this.editingLineIndex];
        if(currentLineControl.editable){
            currentLineControl.editable = !currentLineControl.editable;
        }
        currentLineControl.controls['desc'].patchValue(line.desc);
        currentLineControl.controls['value'].patchValue(line.value);
        currentLineControl.controls['dimensions'].patchValue(line.dimensions);
    }

    resetAllLinesFromEditing(linesControl){
        _.each(linesControl.controls, function(lineControl){
            lineControl.editable = false;
        });
    }

    getLineCount(){
        let linesControl:any = this.metricForm.get('metricLines');
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

    //When user  clicks on the line, it toggles and show the fields
    editLine(lineListItem, index){
        let linesControl:any = this.metricForm.get('metricLines');
        let data = this._metricForm.getData(lineListItem);
        //It works. Not sure whether it has better ways to do.
        jQuery('#coa-'+index).siblings().children('input').val(this.getMetricName(data.metricID));

        if(index == this.getLastActiveLineIndex(linesControl)){
            this.addDefaultLine(1);
        }
        this.resetAllLinesFromEditing(linesControl);
        lineListItem.editable = !lineListItem.editable;
    }

    handleKeyEvent(event: Event,index,key){
        let current_ele = jQuery(this.el.nativeElement).find("tr")[index].closest('tr');
        let focusedIndex;
        jQuery(current_ele).find("td input").each(function(id,field) {
            if(jQuery(field).is(':focus')) {
                focusedIndex = id;
            }
        });
        let base = this;
        let metricLines: any = this.metricForm.get('metricLines');
        if(key === 'Arrow Down'){
            let nextIndex = this.getNextElement(current_ele,index,'Arrow Down');
            base.editLine(metricLines.controls[nextIndex], nextIndex);
            setTimeout(function(){
                let elem = jQuery(base.el.nativeElement).find("tr")[nextIndex];
                jQuery(elem).find("td input").each(function(id,field) {
                    if(id == focusedIndex) {
                        jQuery(field).focus();
                    }
                });
            });
        } else{
            let nextIndex = this.getNextElement(current_ele,index,'Arrow Up');
            base.editLine(metricLines.controls[nextIndex], nextIndex);
            setTimeout(function(){
                let elem = jQuery(base.el.nativeElement).find("tr")[nextIndex];
                jQuery(elem).find("td input").each(function(id,field) {
                    if(id == focusedIndex) {
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



    setReversalDate(date: string){
        let jeReversalDateControl:any = this.metricForm.get('reversalDate');
        jeReversalDateControl.patchValue(date);
    }

    setNextJEDate(date: string){
        let nextJEDateControl:any = this.metricForm.get('nextJEDate');
        nextJEDateControl.patchValue(date);
    }

    setEndDate(date: string){
        let endDateControl:any = this.metricForm.get('endDate');
        endDateControl.patchValue(date);
    }

    setReverseJournal(reverseJournal){
        let journal:any;
        _.each(this.existingJournals, function(existingJournal){
            if(existingJournal.number == reverseJournal){
                journal = existingJournal;
            }
        });
        if(!_.isEmpty(journal)) {
            let reverseJournalControl:any = this.metricForm.get('reversedFrom');
            reverseJournalControl.patchValue(journal.id);
        }
    }

    updateChartOfAccount(chartOfAccount){
        let lineData = this._metricLineForm.getData(this.lineForm);
        if(chartOfAccount&&chartOfAccount.id){
            lineData.coa = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            lineData.coa='--None--';
        }
        this._metricLineForm.updateForm(this.lineForm, lineData);
    }

    updateEntity(entity){
        let lineData = this._metricLineForm.getData(this.lineForm);
        if(entity && entity.id){
            lineData.entity = entity.id;
            lineData.entityType=entity.entityType;
        } else if(entity && entity.customer_id){
            lineData.entity = entity.customer_id;
            lineData.entityType=entity.entityType;
        } else if(!entity || entity=='--None--'){
            lineData.entity='--None--';
        }
        this._metricLineForm.updateForm(this.lineForm, lineData);
    }

    toggleLineEdit(lineListItem){
        lineListItem.editable = !lineListItem.editable;
    }

    deleteLine($event, lineIndex){
        let base = this;
        $event && $event.stopImmediatePropagation();
        let lineList:any = this.metricForm.get('metricLines');
        lineList.controls[lineIndex].controls['destroy'].patchValue(true);
        setTimeout(function(){
            base.handleKeyEvent($event,lineIndex,'Arrow Down');
        });
    }

    getMetricName(metricId){
        let metric = _.find(this.metrics, {id: metricId});
        if(metric){
            return metric.name;
        }
        return "";
    }

    getEntityName(controls){
        let data = this._metricForm.getData(this.metricForm);
        if(data.jeType == 'Other'){
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
        delete data.metricLines.destroy;
        for(var i in data.metricLines){
            delete data.metricLines[i].destroy;
            delete data.metricLines[i].id;
        }

        return data;
    }

    updateMetricLinesData(data){
        let base=this;
        _.each(data.metricLines, function(line){
            if(line.metricID=='--None--'||line.metricID==''){
                line.metricID=null;
            }
        });
    }

    getJournalLineData(metricForm) {
        let base = this;
        let data = [];
        let linesControl = metricForm.controls['metricLines'];
        let defaultLine = this._metricLineForm.getData(this._fb.group(this._metricLineForm.getForm()));
        _.each(linesControl.controls, function (metricLineControl) {
            let lineData = base._metricLineForm.getData(metricLineControl);
            if(!_.isEqual(lineData, defaultLine)){
                if(!base.newValueMetric){
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
                if(!line.value){
                    base.toastService.pop(TOAST_TYPE.error, "Value Is Not Entered For Line");
                    result = true;
                    return false;
                }
                if(!line.metricID){
                    base.toastService.pop(TOAST_TYPE.error, "Metric Is Not Selected For Line");
                    result = true;
                    return false;
                }
            }
        });
        return result;
    }


    submit($event){
        $event && $event.preventDefault();
        let data = this._metricForm.getData(this.metricForm);
        data.metricLines = this.getJournalLineData(this.metricForm);
        this.updateMetricLinesData(data);
        if(this.validateLines(data.metricLines)){
            return;
        }

        this.loadingService.triggerLoadingEvent(true);
        if(this.newValueMetric) {
            this.metricService.createMetricLines(this.cleanData(data), this.companyId)
                .subscribe(journalEntry => {
                    this.stopLoaderAndShowMessage(false, "Value Metric created successfully");
                    this.showDashboard();
                }, error => this.handleError(error));
        }else {
            this.metricService.updateMetricLines(this.cleanData(data), this.companyId)
                .subscribe(journalEntry => {
                    this.stopLoaderAndShowMessage(false, "Value Metric updated successfully");
                    this.showDashboard();
                }, error => this.handleError(error));
        }
    }

    handleError(error){
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(TOAST_TYPE.error, "Could Not Perform Operation");
    }

    filterChartOfAccounts(category){
        let base = this;
        this.filteredChartOfAccounts = [];
        _.each(this.metrics, function (coa) {
            if(coa.category && category && (coa.category.toLowerCase() == category.toLowerCase())){
                base.filteredChartOfAccounts.push(coa);
            }
        });
    }

    isJournalEntry(entityType){
        let data = this._metricForm.getData(this.metricForm);
        return data.jeType == entityType;
    }

    getFilteredCOA(category){
        let base = this;
        let filteredCOA = [];
        _.each(this.metrics, function (coa) {
            if(coa.category && category && (coa.category.toLowerCase() == category.toLowerCase())){
                filteredCOA.push(coa);
            }
        });
        return filteredCOA;
    }

    updateLineMetric(metric, index){
        let linesControl:any = this.metricForm.get('metricLines');
        let currentLineForm:any = linesControl.controls[index];
        let currentLineData = this._metricLineForm.getData(currentLineForm);
        if(metric&&metric.id){
            currentLineData.metricID = metric.id;
        }else if(!metric||metric=='--None--'){
            currentLineData.metricID='--None--';
        }
        this._metricLineForm.updateForm(currentLineForm, currentLineData);
    }

    updateNewLineCOA(chartOfAccount){
        let lineData = this._metricLineForm.getData(this.newMetricLineForm);
        if(chartOfAccount&&chartOfAccount.id){
            lineData.coa = chartOfAccount.id;
        }else if(!chartOfAccount||chartOfAccount=='--None--'){
            lineData.coa='--None--';
        }
        this._metricLineForm.updateForm(this.newMetricLineForm, lineData);
    }

    processValueMetric(valueMetric){
        this.metricDetails=valueMetric;
        valueMetric.metricLines = _.orderBy(valueMetric.metricLines, ['description']);
        let base = this;
        this.valueMetric = valueMetric;
        let linesControl:any = this.metricForm.get('metricLines');
        _.each(this.valueMetric.metricLines, function(line){
            let lineListForm = base._fb.group(base._metricLineForm.getForm(line));
            linesControl.push(lineListForm);
        });
        this.stopLoaderAndShowMessage(false);
        this._metricForm.updateForm(this.metricForm, this.valueMetric);
    }

    stopLoaderAndShowMessage(error, message?){
        this.loadingService.triggerLoadingEvent(false);
        if(message){
            let type = error? TOAST_TYPE.error : TOAST_TYPE.success;
            this.toastService.pop(type, message);
        }
    }

    ngOnDestroy(){
        jQuery('.pika-single').remove();
        jQuery('.ui-helper-hidden-accessible').remove();
        jQuery('.ui-menu').remove();
        this.routeSubscribe.unsubscribe();
    }

    addDefaultLine(count){
        let linesControl: any = this.metricForm.get('metricLines');
        for(let i=0; i<count; i++){
            let lineForm = this._fb.group(this._metricLineForm.getForm());
            linesControl.controls.push(lineForm);
        }
    }

    ngOnInit(){
        this.initializeValueMetric();
    }

    initializeValueMetric(){
        let base = this;
        let _form = this._metricForm.getForm();
        _form['metricLines'] = new FormArray([]); //this.metricLinesArray;
        this.metricForm = this._fb.group(_form);

        let _lineForm = this._metricLineForm.getForm();
        this.lineForm = this._fb.group(_lineForm);

        this.newForm();
        let yearControl:any= this.metricForm.get('year');
        yearControl.setValue(moment(new Date(),this.dateFormat).year());
        this.loadingService.triggerLoadingEvent(true);
        this.metricService.getMetricsList(this.companyId)
            .subscribe(metrics => {
                this.metrics = metrics;
                _.sortBy(this.metrics, ['name']);
                base.loadingService.triggerLoadingEvent(false);
            }, error=> this.handleError(error));
    }


    getValueMetric($event){
        let base = this;
        let data = this._metricForm.getData(this.metricForm);
        console.log(data);
        if(data.month !== '' && data.year !== '') {
            this.loadingService.triggerLoadingEvent(true);
            this.metricService.getLinesList(data, this.companyId)
                .subscribe(valueMetric => {
                    let metricFormControls:any = this.metricForm.controls;
                    if (valueMetric.metricLines.length > 0) {
                        this.newValueMetric = false;
                        metricFormControls.metricLines['controls'] = [];
                        this.processValueMetric(valueMetric);
                    } else {
                        this.newValueMetric = true;
                        metricFormControls.metricLines['controls'] = [];
                        this.addDefaultLine(2);
                    }
                    base.loadingService.triggerLoadingEvent(false);
                }, error => this.handleError(error));
        }
    }


    showDashboard(){
        if(this.stayFlyout){
            this.initializeValueMetric();
            this.stayFlyout = false;
        }else {
            let link = ['metrics'];
            this._router.navigate(link);
        }
    }

    goToPreviousPage(){
        let prevState = this.stateService.pop();
        if(prevState){
            this._router.navigate([prevState.url]);
        } else{
            let link = ['metrics'];
            this._router.navigate(link);
        }
    }

    generateYears(){
        let base = this;
        let min = moment(new Date(),this.dateFormat).year();
        let max = min + 9;
        for (let i = min; i<=max; i++){
            let option = {value:'',name:''};
            option.value = i;
            option.name = i;
            base.years.push(option);
        }
    }

}
