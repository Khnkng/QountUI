/**
 * Created by seshu on 27-02-2016.
 */

import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {RuleForm, RuleActionForm} from "../forms/Rule.form";
import {FormGroup, FormBuilder, FormArray} from "@angular/forms";
import {RulesService} from "qCommon/app/services/Rules.service";
import {Session} from "qCommon/app/services/Session";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {VendorModel} from "../models/Vendor.model";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";


declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'rules',
    templateUrl: '/app/views/rules.html'
})

export class RulesComponent {
    status:any;
    showFlyout:boolean = false;
    ruleForm:FormGroup;
    editMode:boolean = false;
    RulesList:any;
    AttributeList:any;
    hasRuleList:boolean = false;
    actions: FormArray = new FormArray([]);
    depositlist:Array<any> = [];
    expenxeArray:Array<any>=[];
    expenxeArraylist:Array<any>=[];
    expenxeArrayvalue:any;
    depositAarray:Array<any>=[];
    depositAarraylist:Array<any>=[];
    banks:Array<any> = [];
    rules:Array<any> = [];
    tableData:any = {};
    row:any;
    tableOptions:any = {};
    chartOfAccounts:Array<any>= [];
    dimensions:Array<any> = [];
    companyId:string;
    vendors:Array<any>;
    conparisionArray:Array<any>;
    constructor(private _router:Router,private _toastService: ToastService, private _fb: FormBuilder,private ruleservice:RulesService,private _ruleForm: RuleForm, private coaService: ChartOfAccountsService,
        private dimensionService: DimensionService,private financialAccountsService: FinancialAccountsService, private _actionForm: RuleActionForm,private loadingService:LoadingService,) {
        this.companyId = Session.getCurrentCompany();
        this.conparisionArray=['begins with','contains','equals to','greater than','less than'];
        this.ruleservice.getRulesofCompany(this.companyId)
            .subscribe(RulesList  => {
                this.loadingService.triggerLoadingEvent(false);
                this.RulesList=RulesList;
                this.buildTableData(RulesList);
                this.showFlyout = false;
            }, error =>  this.handleError(error));
        this.financialAccountsService.financialInstitutions()
            .subscribe(banks => {
                this.banks = banks;
            }, error => this.handleError(error));
        this.ruleservice.getattributes(this.companyId)
            .subscribe(AttributeList  => {
                this.loadingService.triggerLoadingEvent(false);
                 this.AttributeList=AttributeList;
                for(let key in AttributeList){
                    this.depositlist.push(key);
                    let exparray=AttributeList[key];
                    this.expenxeArray.push(exparray);

                }

                for(var key in this.expenxeArray[0]){
                   this.expenxeArraylist.push(key);
                    this.expenxeArrayvalue=this.expenxeArraylist;
                }
                console.log(this.expenxeArraylist);
                for(var key in this.expenxeArray[1]){
                    this.depositAarraylist.push(key);
                }
                console.log(this.depositAarraylist);
            }, error =>  this.handleError(error));
    }
    handleError(error) {

    }
    expesevalue(){
        let expRate:any = this.ruleForm.controls['sourceType'];
        console.log("expRate",expRate.value);
        if(expRate.value=='Expense'){
            let expense:any = this.ruleForm.controls['attributeName'];
            this.expenxeArrayvalue=this.expenxeArraylist;
        }
        else{
            let expense:any = this.ruleForm.controls['attributeName'];
            this.expenxeArrayvalue= this.depositAarraylist;
        }

    }
    selectChange(){
        let attributeRate:any = this.ruleForm.controls['attributeName'];
        if(attributeRate.value=='Title' ||attributeRate.value=='Notes' ){
            this.conparisionArray=['BEGINS_WITH','CONTAINS','EQUALS_TO'];
        }
        else{
            this.conparisionArray=['BEGINS_WITH','CONTAINS','EQUALS_TO','GREATER_THAN_OR_EQUALS_TO','LESS_THAN','GREATER_THAN','LESS_THAN_OR_EQUALS_TO'];
        }

    }
    showAddRule(){
        this.editMode = false;
        this.showFlyout = true;
        this.actions = new FormArray([]);
        let _form = this._ruleForm.getForm();
        _form['actions'] = this.actions;
        this.ruleForm = this._fb.group(_form);
    }
    showMessage(status, obj) {
        if(status) {
            this.status = {};
            this.status['success'] = true;
            if(this.editMode) {
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(RulesList  => {
                        this.loadingService.triggerLoadingEvent(false);
                        this.RulesList=RulesList;
                        this.buildTableData(RulesList);
                        this.showFlyout = false;
                    }, error =>  this.handleError(error));

                this._toastService.pop(TOAST_TYPE.success, "Rule updated successfully.");
            } else {
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(RulesList  => {
                        this.loadingService.triggerLoadingEvent(false);
                        this.RulesList=RulesList;
                        this.buildTableData(RulesList);
                        this.showFlyout = false;
                    }, error =>  this.handleError(error));
                // this.TaxesForm.reset();
                this._toastService.pop(TOAST_TYPE.success, "Rule created successfully.");
            }
        } else {
            this.status = {};
            this.status['error'] = true;
            try {
                let resp = JSON.parse(obj);
                if(resp.message){
                    this._toastService.pop(TOAST_TYPE.error, resp.message);
                } else{
                    this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
                }
            }catch(err){
                this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
            }
        }
    }

    hideFlyout(){
        this.row = {};
        this.showFlyout = !this.showFlyout;
    }

    addNewAction(){
        let tempLineForm = this._fb.group(this._actionForm.getForm());
        let actionsControl:any = this.ruleForm.controls['actions'];
        actionsControl.push(tempLineForm);
    }

    buildTableData(RulesList){
        this.hasRuleList = false;
        this.RulesList = RulesList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"id","title":"id","visible": false},
            {"name": "rule", "title": "Rule"},
            {"name": "conditions", "title": "conditions","visible": false},
            {"name": "action", "title": "action","visible": false},
            {"name": "actionValue", "title": "actionValue","visible": false},
            {"name": "actions", "title": ""},
            {"name": "id", "title": "","visible": false}

        ];
        let base = this;
        _.each(RulesList, function(RulesList) {
            let row:any = {};
            if(RulesList.conditions[0]) {
                row['rule'] = "when a " + RulesList.sourceType + " is created and the " + RulesList.source + " " + RulesList.conditions[0].attributeName + " " + RulesList.conditions[0].comparisionType + " " + RulesList.conditions[0].comparisionValue + " " + "AND" + " " + RulesList.conditions[1].attributeName + " " + RulesList.conditions[1].comparisionType + " " + RulesList.conditions[1].comparisionValue;
            }else{
                row['rule'] = "when a " + RulesList.sourceType + " is created and the " + RulesList.source + " " ;
            }
            row['id']=RulesList.id;
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.tableData.rows.push(row);
        });
        base.hasRuleList = false;
        setTimeout(function(){
           base.hasRuleList = true;
        });
    }
    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.showEditRule($event);
        } else if(action == 'delete'){
            this.removeRule($event);
        }
    }
    removeRule(row:any){
        let vendor:VendorModel = row;
        this.loadingService.triggerLoadingEvent(true);
        this.ruleservice.removeRule(row.id, this.companyId)
            .subscribe(success  => {
                this._toastService.pop(TOAST_TYPE.success, "Rule deleted successfully");
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(RulesList  => {
                        this.buildTableData(RulesList);
                        this.loadingService.triggerLoadingEvent(false);
                    }, error =>  this.handleError(error));
            }, error =>  this.handleError(error));
        _.remove(this.vendors, function (_vendor) {
            return vendor.id == _vendor.id;
        });
    }
    deleteAction(index){
        let indexValue=this.actions.controls.splice(index,1);
        let actionsControl:any = this.ruleForm.controls['actions'];
        let actionsControlform=actionsControl.controls.splice(index, 1);

    }

    updateActionValueInUI(field, index, value,id){
        let base = this;
        if(field == 'chartOfAccount'){
            setTimeout(function(){
                jQuery('#coa-'+index).siblings().children('input').val(value);
            }, 10);
        } else if(field == 'dimension'){
            setTimeout(function(){
                jQuery('#dimension-'+index).siblings().children('input').val(value);
            }, 10);
        }
    }

    getCOAName(chartOfAccountId){
        let coa = _.find(this.chartOfAccounts, {'id': chartOfAccountId});
        return coa? coa.name : '';
    }

    showEditRule(row:any) {
        let base=this;
        this.showFlyout = true;
        this.editMode = true;
        this.actions = new FormArray([]);
        this.ruleservice.rule(this.companyId,row.id).subscribe(rule => {
            this.getRowDetails(row.id);
            rule.actions.forEach(function(action, index){
                base.updateActionValueInUI(action.action, index, action.actionValue,action.id);
                let actionForm = base._fb.group(base._actionForm.getForm(action));
                base.actions.push(actionForm);
            });
            let _form = this._ruleForm.getForm();
            _form['actions'] = this.actions;
            this.ruleForm = this._fb.group(_form);
        });
        // this.getRowDetails(row.id);

    }
    isValid(ruleForm){
        if(ruleForm.value.comparisionType!="" && ruleForm.value.comparisionType1!="" && ruleForm.value.comparisionValue!="" && ruleForm.value.comparisionValue!="" && ruleForm.value.comparisionValue1!=""){
            return false;
        }
else{
            return true;
        }
    }
    getRowDetails(RuleID){
        let base=this;
        this.ruleservice.rule(this.companyId,RuleID).subscribe(rule => {
            this.row = rule;
            let selectedCOAControl:any = this.ruleForm.controls['sourceType'];
            selectedCOAControl.patchValue(rule.sourceType);
            let selectedSource:any = this.ruleForm.controls['source'];
            selectedSource.patchValue(rule.source);
            let attributeName:any = this.ruleForm.controls['attributeName'];
            let ruleattribute=rule.conditions[0].attributeName;
            attributeName.patchValue(ruleattribute);
            let selectedAmountControl:any = this.ruleForm.controls['comparisionType'];
            let rulecoparisionrype=rule.conditions[0].comparisionType;
            selectedAmountControl.patchValue(rulecoparisionrype);
            let selectedValueControl:any = this.ruleForm.controls['comparisionValue'];
            let rulecoparisionvalue=rule.conditions[0].comparisionValue;
            selectedValueControl.patchValue(rulecoparisionvalue);
            let logicalOperator:any = this.ruleForm.controls['logicalOperator'];
            logicalOperator.patchValue("AND");
            let attributeName1:any = this.ruleForm.controls['attributeName1'];
            attributeName1.patchValue(rule.conditions[1].attributeName);
            let comparisionType1:any = this.ruleForm.controls['comparisionType1'];
            comparisionType1.patchValue(rule.conditions[1].comparisionType);
            let comparisionValue1:any = this.ruleForm.controls['comparisionValue1'];
            comparisionValue1.patchValue(rule.conditions[1].comparisionValue);
            let effectiveDate:any= this.ruleForm.controls['effectiveDate'];
            effectiveDate.patchValue(rule.effectiveDate);
            this._ruleForm.updateForm(this.ruleForm, rule);

        }, error => this.handleError(error));
    }
    getSourceName(){
        let data = this._ruleForm.getData(this.ruleForm);
        return data.sourceType;
    }
    setDate(date: string){
        let jeDateControl:any = this.ruleForm.controls['effectiveDate'];
        jeDateControl.patchValue(date);
    }
    isActionCOA(actionForm){
        if(actionForm){
            let data = this._actionForm.getData(actionForm);
            if(data.action == 'chartOfAccount'){
                return true;
            }
        }
        return false;
    }

    isActionDimension(actionForm){
        if(actionForm){
            let data = this._actionForm.getData(actionForm);
            if(data.action == 'dimension'){
                return true;
            }
        }
        return false;
    }

    updateActionValue(actionValueObj, index, action){
        let actionsControl:any = this.ruleForm.controls['actions'];
        let currentActionForm:any = actionsControl.controls[index];
        let currentActionData = this._actionForm.getData(currentActionForm);
        if(action == 'chartOfAccount'){
            currentActionData.actionValue = actionValueObj.name;
        } else{
            currentActionData.actionValue = actionValueObj.name;
        }
        this._actionForm.updateForm(currentActionForm, currentActionData);
    }

    submit($event, dateFlag){
        $event && $event.preventDefault();
        let data = this._ruleForm.getData(this.ruleForm);
        this.companyId = Session.getCurrentCompany();

        if(this.editMode){
            if(data.attributeName || data.comparisionType || data.comparisionValue || data.logicalOperator || data.attributeName1 || data.comparisionType1 || data.comparisionValue1 ){
                delete data.attributeName;
                delete data.comparisionType;
                delete data.comparisionValue;
                delete data.logicalOperator;
                delete data.attributeName1;
                delete data.comparisionType1;
                delete data.comparisionValue1;
            }
            data.conditions=[];
            var condition1={};
            var condition2={};
            let chartOfAccount:any = this.ruleForm.controls['chartOfAccount'];
            chartOfAccount.patchValue(chartOfAccount.value);
            let selectedAmountControl:any = this.ruleForm.controls['comparisionType'];
            selectedAmountControl.patchValue(selectedAmountControl.value);
            let selectedValueControl:any = this.ruleForm.controls['comparisionValue'];
            selectedValueControl.patchValue(selectedValueControl.value);
            let logicalOperator:any = this.ruleForm.controls['logicalOperator'];
            logicalOperator.patchValue(logicalOperator.value);
            condition1['attributeName']="Title";
            condition1['comparisionType']=selectedAmountControl.value;
            condition1['comparisionValue']=selectedValueControl.value;
            condition1['logicalOperator']=logicalOperator.value;
            var conditionrow=data.conditions.push(condition1);
            let selectedAmountControl1:any = this.ruleForm.controls['comparisionType1'];
            selectedAmountControl1.patchValue(selectedAmountControl1.value);
            let selectedValueControl1:any = this.ruleForm.controls['comparisionValue1'];
            selectedValueControl1.patchValue(selectedValueControl1.value);
            condition2['attributeName']="Amount";
            condition2['comparisionType']=selectedAmountControl1.value;
            condition2['comparisionValue']=selectedValueControl1.value;
            var conditionrow2=data.conditions.push(condition2);
            data.id = this.row.id;
            this.ruleservice.updateRule(data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  this.showMessage(false, error));
        } else{
            if(data.attributeName || data.comparisionType || data.comparisionValue || data.logicalOperator || data.attributeName1 || data.comparisionType1 || data.comparisionValue1 ){
                delete data.attributeName;
                delete data.comparisionType;
                delete data.comparisionValue;
                delete data.logicalOperator;
                delete data.attributeName1;
                delete data.comparisionType1;
                delete data.comparisionValue1;
            }
            data.conditions=[];
            var condition1={};
            var condition2={};
            let chartOfAccount:any = this.ruleForm.controls['chartOfAccount'];
            chartOfAccount.patchValue(chartOfAccount.value);
            let attributeName:any = this.ruleForm.controls['attributeName'];
            attributeName.patchValue(attributeName.value);
            let selectedAmountControl:any = this.ruleForm.controls['comparisionType'];
            selectedAmountControl.patchValue(selectedAmountControl.value);
            let selectedValueControl:any = this.ruleForm.controls['comparisionValue'];
            selectedValueControl.patchValue(selectedValueControl.value);
            let logicalOperator:any = this.ruleForm.controls['logicalOperator'];
            logicalOperator.patchValue(logicalOperator.value);
            condition1['attributeName']="Title";
            condition1['comparisionType']=selectedAmountControl.value;
            condition1['comparisionValue']=selectedValueControl.value;
            condition1['logicalOperator']=logicalOperator.value;
            var conditionrow=data.conditions.push(condition1);
            let attributeName1:any = this.ruleForm.controls['attributeName1'];
            attributeName1.patchValue(attributeName1.value);
            let selectedAmountControl1:any = this.ruleForm.controls['comparisionType1'];
            selectedAmountControl1.patchValue(selectedAmountControl1.value);
            let selectedValueControl1:any = this.ruleForm.controls['comparisionValue1'];
            selectedValueControl1.patchValue(selectedValueControl1.value);
            condition2['attributeName']="Amount";
            condition2['comparisionType']=selectedAmountControl1.value;
            condition2['comparisionValue']=selectedValueControl1.value;
            var conditionrow2=data.conditions.push(condition2);
            this.ruleservice.addRule(<VendorModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  this.showMessage(false, error));
        }
    }

    ngOnInit(){
        let companyId = Session.getCurrentCompany();
        let _form = this._ruleForm.getForm();
        _form['actions'] = this.actions;
        this.ruleForm = this._fb.group(_form);

        this.coaService.chartOfAccounts(companyId)
            .subscribe(chartOfAccounts => {
                this.chartOfAccounts = chartOfAccounts;
                _.sortBy(this.chartOfAccounts, ['number', 'name']);
            });
        this.dimensionService.dimensions(companyId)
            .subscribe(dimensions => {
                this.dimensions = dimensions;
                console.log("dimensions",dimensions);
            });
    }
}
