/**
 * Created by seshu on 27-02-2016.
 */

import {Component} from "@angular/core";
import {Component, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {RuleForm, RuleActionForm} from "../forms/Rule.form";
import {FormGroup, FormBuilder, FormArray} from "@angular/forms";
import {RulesService} from "qCommon/app/services/Rules.service";
import {Session} from "qCommon/app/services/Session";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {VendorModel} from "../models/Vendor.model";
import {CustomersService} from "qCommon/app/services/Customers.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";


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
    ruleToDelete:any;
    confirmSubscription: any;
    RulesList:any;
    vendors:any;
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
    customernames:Array<any> = [];
    tableData:any = {};
    todaysDate:any;
    selectedDimensions:Array<any> = [];
    row:any;
    tableBankname:any;
    tablevendorname:any;
    tableOptions:any = {};
    chartOfAccounts:Array<any>= [];
    dimensions:Array<any> = [];
    companyId:string;
    vendors:Array<any>;
    conparisionArray:Array<any>;
    vendorsArray:Array<any>;
    customersArray:Array<any>;
    conparisionAmountArray:Array<any>;
    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox: ComboBox;
    @ViewChild('selectedCOAComboBoxDir') selectedCOAComboBox: ComboBox;
    @ViewChild("accountComboBoxDir") accountComboBox: ComboBox;
    constructor(private _router:Router, private customersService: CustomersService, private switchBoard:SwitchBoard,private companyService: CompaniesService,private _toastService: ToastService, private _fb: FormBuilder,private ruleservice:RulesService,private _ruleForm: RuleForm, private coaService: ChartOfAccountsService,
        private dimensionService: DimensionService,private financialAccountsService: FinancialAccountsService, private _actionForm: RuleActionForm,private loadingService:LoadingService,) {
        this.companyId = Session.getCurrentCompany();
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.RuleDelete(toast));
        this.conparisionArray=['BEGINS_WITH','CONTAINS','EQUALS_TO'];
        this.conparisionAmountArray=['EQUALS_TO','LESS_THAN','GREATER_THAN','GREATER_THAN_OR_EQUALS_TO','LESS_THAN_OR_EQUALS_TO'];
        this.vendorsArray=['EQUALS_TO'];
        this.customersArray=['EQUALS_TO'];
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        this.todaysDate= mm+"/"+dd+"/"+yyyy;
        this.financialAccountsService.financialAccounts(this.companyId)
            .subscribe(response => {
                this.loadingService.triggerLoadingEvent(false);
                this.banks=response.accounts;
                console.log("this.banks",this.banks);
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(RulesList  => {
                        this.loadingService.triggerLoadingEvent(false);
                        this.RulesList=RulesList;
                        this.buildTableData(RulesList);
                        this.showFlyout = false;
                    }, error =>  this.handleError(error));
            }, error => this.handleError(error));
        this.companyService.vendors(this.companyId)
            .subscribe(vendors  => {
                this.vendors = vendors;
            } , error =>  this.handleError(error));
        this.customersService.customers(this.companyId)
            .subscribe(customernames  => {
                this.customernames=customernames;
            }, error =>  this.handleError(error));
        // this.financialAccountsService.financialInstitutions()
        //     .subscribe(banks => {
        //         this.banks = banks;
        //         this.ruleservice.getRulesofCompany(this.companyId)
        //             .subscribe(RulesList  => {
        //                 this.loadingService.triggerLoadingEvent(false);
        //                 this.RulesList=RulesList;
        //                 this.buildTableData(RulesList);
        //                 this.showFlyout = false;
        //             }, error =>  this.handleError(error));
        //         console.log("banks",banks);
        //     }, error => this.handleError(error));
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
                for(var key in this.expenxeArray[1]){
                    this.depositAarraylist.push(key);
                }
            }, error =>  this.handleError(error));
    }
    ngOnDestroy(){
        this.confirmSubscription.unsubscribe();
    }
    handleError(error) {
        this._toastService.pop(TOAST_TYPE.error, "Failed to perform operation");
    }

    expesevalue(){
        let expRate:any = this.ruleForm.controls['sourceType'];
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
    RuleDelete(toast){
        this.ruleservice.removeRule(this.ruleToDelete, this.companyId)
            .subscribe(success  => {
                this._toastService.pop(TOAST_TYPE.success, "Rule deleted successfully");
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(RulesList  => {
                        this.buildTableData(RulesList);
                        this.loadingService.triggerLoadingEvent(false);
                        return;
                    }, error =>  this.handleError(error));
            }, error =>  this.handleError(error));
    }

    showAddRule(){
        this.editMode = false;
        this.showFlyout = true;
        this.selectedDimensions==[];
        this.actions = new FormArray([]);
        let _form = this._ruleForm.getForm();
        this.ruleForm = this._fb.group(_form);
        this.selectedDimensions==[];
        this.ruleForm.reset();
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
    doNothing($event){
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    }
    hideFlyout(){
        this.selectedDimensions=[];
        this.row = {};
        this.selectedDimensions=[];
        this.showFlyout = !this.showFlyout;
    }

    addNewAction(){
        let tempLineForm = this._fb.group(this._actionForm.getForm());
        let actionsControl:any = this.ruleForm.controls['actions'];
        actionsControl.push(tempLineForm);
    }
    showCOA(coa:any) {
        let data= this._ruleForm.getData(this.ruleForm);
        data.chartOfAccount = coa.id;
        if(data.chartOfAccount!='' && data.chartOfAccount!='--None--'){
            data.chartOfAccount = coa.id;
        }else if(data.chartOfAccount=='--None--' || data.chartOfAccount==''){
            data.chartOfAccount = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    }

    showVendor(vendor:any) {
        let data= this._ruleForm.getData(this.ruleForm);
        if(data.vendorValue!=''&& data.vendorValue!='--None--'){
            data.vendorValue = vendor.id;
        }else if(data.vendorValue=='--None--' || data.vendorValue==''){
            data.vendorValue = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    }
    showSource(bank:any) {
        let data= this._ruleForm.getData(this.ruleForm);
        data.source = bank.id;
        if(data.source!=''&& data.source!='--None--'){
            data.source = bank.id;
        }else if(data.source=='--None--' || data.source==''){
            data.source = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    }
    showCustomer(customer:any) {
        let data= this._ruleForm.getData(this.ruleForm);
        data.customerValue = customer.customer_id;
        if(data.customerValue!=''&& data.customerValue!='--None--'){
            data.customerValue = customer.customer_id;
        }else if(data.customerValue=='--None--' || data.customerValue==''){
            data.customerValue = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    }
    buildTableData(RulesList){
        this.hasRuleList = false;
        this.RulesList = RulesList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"id","title":"id","visible": false},
            {"name": "ruleText", "title": "Rule"},
            {"name": "conditions", "title": "conditions","visible": false},
            {"name": "action", "title": "action","visible": false},
            {"name": "actionValue", "title": "actionValue","visible": false},
            {"name": "actions", "title": ""},
            {"name": "id", "title": "","visible": false}

        ];
        let base = this;
        _.each(RulesList, function(RulesList) {
             let row:any = {};
            row['id']=RulesList.id;
            row['ruleText']=RulesList.ruleText;
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
        this.ruleToDelete = row.id;
        this._toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }
    deleteAction(index){
        let indexValue=this.actions.controls.splice(index,1);
        let actionsControl:any = this.ruleForm.controls['actions'];
        let actionsControlform=actionsControl.value.splice(index, 1);
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
        if(((ruleForm.value.sourceType!=null)&&((ruleForm.value.comparisionType!=null &&  ruleForm.value.comparisionValue!=null)  ||
            (ruleForm.value.comparisionType1!=null && ruleForm.value.comparisionValue1!=null) )  || (ruleForm.value.customerValue!=null)|| (ruleForm.value.vendorValue!=null)|| (ruleForm.value.source!=null))){
            return false;
        }
            return true;

    }

    getRowDetails(RuleID){
        let base=this;
        this.ruleservice.rule(this.companyId,RuleID).subscribe(rule => {
            this.row = rule;
            console.log("rule",rule);
            this.selectedDimensions=rule.actions;
            let selectedCOAControl:any = this.ruleForm.controls['sourceType'];
            selectedCOAControl.patchValue(rule.sourceType);

            let coa = _.find(this.chartOfAccounts, function(_coa) {
                return _coa.id == rule.chartOfAccount;
            });
            if(!_.isEmpty(coa)&&(rule.chartOfAccount!='--None--')||(rule.chartOfAccount!='') ) {
                setTimeout(function () {
                    base.coaComboBox.setValue(coa, 'name');
                });
            }
                else{
                base.coaComboBox.setValue(coa, '--None--');
                }


            let chartOfAccount:any = this.ruleForm.controls['chartOfAccount'];
            chartOfAccount.patchValue(rule.chartOfAccount);
            let effectiveDate:any= this.ruleForm.controls['effectiveDate'];
            effectiveDate.patchValue(rule.effectiveDate);
            let endDate:any= this.ruleForm.controls['endDate'];
            endDate.patchValue(rule.endDate);
            for(var i=0;i<rule.conditions.length;i++){
                if(rule.conditions[i].attributeName=='Title'){
                    let comparisionType: any = this.ruleForm.controls['comparisionType'];
                    comparisionType.patchValue(rule.conditions[i].comparisionType);

                    let comparisionValue: any = this.ruleForm.controls['comparisionValue'];
                    comparisionValue.patchValue(rule.conditions[i].comparisionValue);

                }
                else if(rule.conditions[i].attributeName=='Vendor'){
                    let base=this;
                    let coa = _.find(base.vendors, function(_coa) {
                        return _coa.id == rule.conditions[i].comparisionValue;
                    });
                    if(!_.isEmpty(coa) && (rule.conditions[i].comparisionValue!='--None--')||(rule.conditions[i].comparisionValue!='') ){
                        setTimeout(function(){
                            base.vendorCountryComboBox.setValue(coa, 'name');
                        });
                    }
                    else{
                        base.vendorCountryComboBox.setValue(coa, '--None--');
                    }

                }
                else if(rule.conditions[i].attributeName=='Customer'){
                    let customer = _.find(base.customernames, function(_customer) {
                        return _customer.customer_id == rule.conditions[i].comparisionValue;
                    });
                    if(!_.isEmpty(customer)&&(rule.conditions[i].comparisionValue!='--None--')||(rule.conditions[i].comparisionValue!='') ) {
                        setTimeout(function () {
                            base.selectedCOAComboBox.setValue(customer, 'customer_name');
                        });
                    }
                    else{
                            base.selectedCOAComboBox.setValue(customer, '--None--');
                        }
                    }

                else if(rule.conditions[i].attributeName=='Amount'){
                    let comparisionType1: any = this.ruleForm.controls['comparisionType1'];
                    comparisionType1.patchValue(rule.conditions[i].comparisionType);

                    let comparisionValue1: any = this.ruleForm.controls['comparisionValue1'];
                    comparisionValue1.patchValue(rule.conditions[i].comparisionValue);
                }
                else if(rule.conditions[i].attributeName=='Source'){
                    let source = _.find(base.banks, function(_bank) {
                        return _bank.id == rule.conditions[i].comparisionValue;
                    });
                    if(!_.isEmpty(source)&&(rule.conditions[i].comparisionValue!='--None--')||(rule.conditions[i].comparisionValue!='') ) {
                        setTimeout(function () {
                            base.accountComboBox.setValue(source, 'name');
                        });
                    }
                    else{
                        base.accountComboBox.setValue(source, '--None--');
                    }
                }
                else{
console.log("end");
                }
            }

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
    setEndDate(date: string){
        let jeDateControl:any = this.ruleForm.controls['endDate'];
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


    submit($event, dateFlag){
        $event && $event.preventDefault();
        let data = this._ruleForm.getData(this.ruleForm);
        this.companyId = Session.getCurrentCompany();
        if(data.effectiveDate=="" || data.effectiveDate==null){
            data.effectiveDate=this.todaysDate;
        }else{
            console.log("data.effectiveDate",data.effectiveDate);
        }
        if(data.endDate=="" || data.endDate==null){
            data.endDate=this.todaysDate;
        }else{
            console.log("data.endDate",data.endDate);
        }

        if(this.editMode){
            if(data.attributeName|| data.comparisionType || data.comparisionValue || data.logicalOperator || data.attributeName1 || data.comparisionType1 || data.comparisionValue1
            || data.vendorValue || data.customerValue ||  data.source){
                delete data.attributeName;
                delete data.comparisionType;
                delete data.comparisionValue;
                delete data.logicalOperator;
                delete data.attributeName1;
                delete data.comparisionType1;
                delete data.vendorValue;
                delete data.customerValue;
                delete data.comparisionValue1;
                delete data.source;
            }
            data.conditions=[];
            var condition1={};
            var condition2={};
            var condition3={};
            var condition4={};
            var condition5={};
            data.actions=this.selectedDimensions;
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

            let vendorType:any = this.ruleForm.controls['vendorType'];
            vendorType.patchValue(vendorType.value);
            let vendor:any = this.ruleForm.controls['vendorValue'];
            vendor.patchValue(vendor.value);
            condition3['attributeName']="Vendor";
            condition3['comparisionType']="EQUALS_TO";
            condition3['comparisionValue']=vendor.value;
            var conditionrow3=data.conditions.push(condition3);

            let customerType:any = this.ruleForm.controls['customerType'];
            customerType.patchValue(customerType.value);
            let customer:any = this.ruleForm.controls['customerValue'];
            customer.patchValue(customer.value);
            condition4['attributeName']="Customer";
            condition4['comparisionType']="EQUALS_TO";
            condition4['comparisionValue']=customer.value;
            var conditionrow4=data.conditions.push(condition4);
            let source:any = this.ruleForm.controls['source'];
            source.patchValue(source.value);
            condition5['attributeName']="Source";
            condition5['comparisionType']="EQUALS_TO";
            condition5['comparisionValue']=source.value;
            var conditionrow5=data.conditions.push(condition5);
            data.id = this.row.id;
            this.ruleservice.updateRule(data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  this.showMessage(false, error));
        } else{
            if(data.attributeName==null || data.comparisionType==null || data.comparisionValue==null || data.logicalOperator==null || data.attributeName1 || data.comparisionType1==null || data.comparisionValue1==null
                || data.vendorValue==null || data.customerValue==null ||  data.source==null){
                delete data.attributeName;
                delete data.comparisionType;
                delete data.comparisionValue;
                delete data.logicalOperator;
                delete data.attributeName1;
                delete data.comparisionType1;
                delete data.vendorValue;
                delete data.customerValue;
                delete data.comparisionValue1;
                delete data.source;

            }
            data.conditions=[];
            var condition1={};
            var condition2={};
            var condition3={};
            var condition4={};
            var condition5={};
            data.actions=this.selectedDimensions;
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

            let vendorType:any = this.ruleForm.controls['vendorType'];
            vendorType.patchValue(vendorType.value);
            let vendor:any = this.ruleForm.controls['vendorValue'];
            vendor.patchValue(vendor.value);
            condition3['attributeName']="Vendor";
            condition3['comparisionType']="EQUALS_TO";
            condition3['comparisionValue']=vendor.value;
            var conditionrow3=data.conditions.push(condition3);

            let customerType:any = this.ruleForm.controls['customerType'];
            customerType.patchValue(customerType.value);
            let customer:any = this.ruleForm.controls['customerValue'];
            customer.patchValue(customer.value);
            condition4['attributeName']="Customer";
            condition4['comparisionType']="EQUALS_TO";
            condition4['comparisionValue']=customer.value;
            var conditionrow4=data.conditions.push(condition4);
            let source:any = this.ruleForm.controls['source'];
            source.patchValue(source.value);
            condition5['attributeName']="Source";
            condition5['comparisionType']="EQUALS_TO";
            condition5['comparisionValue']=source.value;
            var conditionrow5=data.conditions.push(condition5);
            this.ruleservice.addRule(<VendorModel>data, this.companyId)
                .subscribe(success  => {
                    this.loadingService.triggerLoadingEvent(false);
                    this.showMessage(true, success);
                    this.showFlyout = false;
                }, error =>  this.showMessage(false, error));
        }
    }

    isDimensionSelected(dimensionName){
        let selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        return selectedDimensionNames.indexOf(dimensionName) != -1;
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
            });
    }
}
