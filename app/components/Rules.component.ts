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
    hasRuleList:boolean = false;
    actions: FormArray = new FormArray([]);
    rules:Array<any> = [];
    tableData:any = {};
    row:any;
    tableOptions:any = {};
    chartOfAccounts:Array<any>= [];
    dimensions:Array<any> = [];
    companyId:string;
    vendors:Array<any>;

    constructor(private _router:Router,private _toastService: ToastService, private _fb: FormBuilder,private ruleservice:RulesService,private _ruleForm: RuleForm, private coaService: ChartOfAccountsService,
        private dimensionService: DimensionService, private _actionForm: RuleActionForm,private loadingService:LoadingService,) {
        this.companyId = Session.getCurrentCompany();
        this.ruleservice.getRulesofCompany(this.companyId)
            .subscribe(RulesList  => {
                this.loadingService.triggerLoadingEvent(false);
                this.RulesList=RulesList;
                this.buildTableData(RulesList);
                this.showFlyout = false;
            }, error =>  this.handleError(error));
    }
    handleError(error) {

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
            {"name": "action", "title": "action","visible": false},
            {"name": "actionValue", "title": "actionValue","visible": false},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        _.each(RulesList, function(RulesList) {
            let row:any = {};
            row['rule']="when a "+RulesList.sourceType+" is created and the "+RulesList.attributeName+" " +RulesList.comparisionType +" "+RulesList.comparisionValue;
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

    updateActionValueInUI(field, index, value){
        let base = this;
        if(field == 'chartOfAccount'){
            setTimeout(function(){
                jQuery('#coa-'+index).siblings().children('input').val(base.getCOAName(value));
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
            rule.actions.forEach(function(action, index){
                base.updateActionValueInUI(action.action, index, action.actionValue);
                let actionForm = base._fb.group(base._actionForm.getForm(action));
                base.actions.push(actionForm);
            });
            let _form = this._ruleForm.getForm();
            _form['actions'] = this.actions;
            this.ruleForm = this._fb.group(_form);
        });
        this.getRowDetails(row.id);

    }
    getRowDetails(RuleID){
        let base=this;
        this.ruleservice.rule(this.companyId,RuleID).subscribe(rule => {
            this.row = rule;
            let selectedCOAControl:any = this.ruleForm.controls['sourceType'];
            selectedCOAControl.patchValue(rule.sourceType);
            let attributeName:any = this.ruleForm.controls['attributeName'];
            attributeName.patchValue(rule.attributeName);
            let selectedAmountControl:any = this.ruleForm.controls['comparisionType'];
            selectedAmountControl.patchValue(rule.comparisionType);
            let selectedValueControl:any = this.ruleForm.controls['comparisionValue'];
            selectedValueControl.patchValue(rule.comparisionValue);

            this._ruleForm.updateForm(this.ruleForm, rule);

        }, error => this.handleError(error));
    }
    getSourceName(){
        let data = this._ruleForm.getData(this.ruleForm);
        return data.sourceType;
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
            currentActionData.actionValue = actionValueObj.id;
        } else{
            currentActionData.actionValue = actionValueObj.name;
        }
        this._actionForm.updateForm(currentActionForm, currentActionData);
    }

    submit($event, dateFlag){
        $event && $event.preventDefault();
        let data = this._ruleForm.getData(this.ruleForm);
        this.companyId = Session.getCurrentCompany();
        if(dateFlag == 'NO_DATE'){
            delete data.effectiveDate;
        }
        if(this.editMode){
            data.id = this.row.id;
            this.ruleservice.updateRule(data, this.companyId)
                .subscribe(success  => {
                    console.log("vendorodeldata",<VendorModel>data);
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  this.showMessage(false, error));
        } else{
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
            });
        this.dimensionService.dimensions(companyId)
            .subscribe(dimensions => {
                this.dimensions = dimensions;
            });
    }
}
