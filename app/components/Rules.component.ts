/**
 * Created by seshu on 27-02-2016.
 */

import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {RuleForm, RuleActionForm} from "../forms/Rule.form";
import {FormGroup, FormBuilder, FormArray} from "@angular/forms";
import {Session} from "qCommon/app/services/Session";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'rules',
    templateUrl: '/app/views/rules.html'
})

export class RulesComponent {
    showFlyout:boolean = false;
    ruleForm:FormGroup;
    editMode:boolean = false;
    hasRuleList:boolean = false;
    actions: FormArray = new FormArray([]);
    rules:Array<any> = [];
    tableData:any = {};
    tableOptions:any = {};
    chartOfAccounts:Array<any>= [];
    dimensions:Array<any> = [];

    constructor(private _router:Router, private _fb: FormBuilder, private _ruleForm: RuleForm, private coaService: ChartOfAccountsService,
        private dimensionService: DimensionService, private _actionForm: RuleActionForm) {
        this.buildTableData([]);
    }

    showAddRule(){
        this.editMode = false;
        this.showFlyout = true;
        this.actions = new FormArray([]);
        let _form = this._ruleForm.getForm();
        _form['actions'] = this.actions;
        this.ruleForm = this._fb.group(_form);
    }

    hideFlyout(){
        this.showFlyout = false;
    }

    addNewAction(){
        let tempLineForm = this._fb.group(this._actionForm.getForm());
        let actionsControl:any = this.ruleForm.controls['actions'];
        actionsControl.push(tempLineForm);
    }

    deleteAction(index){
        //this.actions.splice(index, 1);
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            //edit rule
        } else if(action == 'delete'){
            //delete rule
        }
    }

    buildTableData(rules){
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name": "rule", "title": "Rule"},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        _.each(rules, function(rule) {
            let row:any = {};
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
           base.hasRuleList = true;
        });
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
        if(dateFlag == 'NO_DATE'){
            delete data.effectiveDate;
        }
        if(this.editMode){

        } else{
            console.log(data);
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
