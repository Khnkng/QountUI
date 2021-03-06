/**
 * Created by seshu on 27-02-2016.
 */

import {Component} from "@angular/core";
import {ViewChild} from "@angular/core";
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
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare let jQuery:any;
declare let _:any;
declare let moment:any;

@Component({
    selector: 'rules',
    templateUrl: '../views/rules.html'
})

export class RulesComponent {
    status:any;
    showFlyout:boolean = false;
    ruleForm:FormGroup;
    editMode:boolean = false;
    ruleToDelete:any;
    confirmSubscription: any;
    RulesList:any;
    AttributeList:any;
    hasRuleList:boolean = false;
    hasAmount:boolean=false;
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
    dimensionFlyoutCSS:any;
    companyId:string;
    vendors:Array<any>;
    conparisionArray:Array<any>;
    vendorsArray:Array<any>;
    customersArray:Array<any>;
    conparisionAmountArray:Array<any>;
    dateFormat:string;
    serviceDateformat:string;
    routeSubscribe:any;
    rulesTableColumns: Array<any> = ['Source Type', 'Rule Name', 'COA', 'Effective Date'];
    pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };
    showDownloadIcon:string = "hidden";

    @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;
    @ViewChild('vendorCountryComboBoxDir') vendorCountryComboBox: ComboBox;
    @ViewChild('selectedCOAComboBoxDir') selectedCOAComboBox: ComboBox;
    @ViewChild("accountComboBoxDir") accountComboBox: ComboBox;
    constructor(private _router:Router, private customersService: CustomersService, private switchBoard:SwitchBoard,private companyService: CompaniesService,private _toastService: ToastService, private _fb: FormBuilder,private ruleservice:RulesService,private _ruleForm: RuleForm, private coaService: ChartOfAccountsService,
        private dimensionService: DimensionService,private titleService:pageTitleService,private financialAccountsService: FinancialAccountsService,
                private _actionForm: RuleActionForm,private loadingService:LoadingService,private dateFormater: DateFormater,
                private reportsService: ReportService) {
        this.titleService.setPageTitle("Rules");
        this.loadingService.triggerLoadingEvent(true);
        this.companyId = Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.RuleDelete(toast));
        this.conparisionArray=['--None--','BEGINS_WITH','CONTAINS','EQUALS_TO'];
        this.conparisionAmountArray=['--None--','EQUALS_TO','LESS_THAN','BETWEEN','GREATER_THAN','GREATER_THAN_OR_EQUALS_TO','LESS_THAN_OR_EQUALS_TO'];
        this.vendorsArray=['EQUALS_TO'];
        this.customersArray=['EQUALS_TO'];
        this.todaysDate= moment(new Date()).format(this.dateFormat);
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
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
            if(this.showFlyout){
                this.hideFlyout();
            }else {
                this.toolsRedirect();
            }
        });
    }

    toolsRedirect(){
        let link = ['tools'];
        this._router.navigate(link);
    }

    ngOnDestroy(){
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    }
    handleError(error) {
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.error, "Failed To Perform Operation");
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
            this.conparisionArray=['--None--','BEGINS_WITH','CONTAINS','EQUALS_TO'];
        }
        else{
            this.conparisionArray=['--None--','BEGINS_WITH','CONTAINS','EQUALS_TO','GREATER_THAN_OR_EQUALS_TO','LESS_THAN','GREATER_THAN','LESS_THAN_OR_EQUALS_TO'];
        }
    }
    RuleDelete(toast){
        this.loadingService.triggerLoadingEvent(true);
        this.ruleservice.removeRule(this.ruleToDelete, this.companyId)
            .subscribe(success  => {
                this._toastService.pop(TOAST_TYPE.success, "Rule Deleted Successfully");
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(RulesList  => {
                        this.buildTableData(RulesList);
                        this.loadingService.triggerLoadingEvent(false);
                        return;
                    }, error =>  this.handleError(error));
            }, error =>  this.handleError(error));
    }

    showAddRule(){
        this.titleService.setPageTitle("CREATE RULE");
        this.editMode = false;
        this.isDimensionSelected(null);
        this.selectedDimensions=[];
        this.showFlyout = true;
        this.isDimensionSelected(null);
        this.selectedDimensions==[];
        this.actions = new FormArray([]);
        this.ruleForm.reset();
        let _form = this._ruleForm.getForm();
        this.ruleForm = this._fb.group(_form);
        this.selectedDimensions==[];
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

                this._toastService.pop(TOAST_TYPE.success, "Rule Updated Successfully.");
            } else {
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(RulesList  => {
                        this.loadingService.triggerLoadingEvent(false);
                        this.RulesList=RulesList;
                        this.buildTableData(RulesList);
                        this.showFlyout = false;
                    }, error =>  this.handleError(error));
                // this.TaxesForm.reset();
                this._toastService.pop(TOAST_TYPE.success, "Rule Created Successfully.");
            }
        } else {
            this.status = {};
            this.status['error'] = true;
            try {
                let resp = JSON.parse(obj);
                if(resp.message){
                    this._toastService.pop(TOAST_TYPE.error, resp.message);
                } else{
                    this._toastService.pop(TOAST_TYPE.error, "Failed To Perform Operation");
                }
            }catch(err){
                this._toastService.pop(TOAST_TYPE.error, "Failed To Perform Operation");
            }
        }
    }
    doNothing($event){
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    }
    hideFlyout(){
        this.titleService.setPageTitle("Rules");
        this.isDimensionSelected(null);
        this.hasAmount=false;
        this.selectedDimensions=[];
        // this.selectDimension=('','');
        this.dimensionFlyoutCSS = "collapsed";
        this.row = {};
        this.selectedDimensions=[];
        this.isDimensionSelected(null);
        this.showFlyout = !this.showFlyout;
    }

    addNewAction(){
        let tempLineForm = this._fb.group(this._actionForm.getForm());
        let actionsControl:any = this.ruleForm.controls['actions'];
        actionsControl.push(tempLineForm);
    }
    showAmount(amount:any){
        let data= this._ruleForm.getData(this.ruleForm);
        if(data.comparisionType1=='BETWEEN'){
            this.hasAmount=true;
        }

        else{
            this.hasAmount=false;
        }
        if(data.comparisionType1=='--None--'){
            data.comparisionType1="";
            let comparisionValue1:any = this.ruleForm.controls['comparisionValue1'];
            comparisionValue1.patchValue("");
        }
        else{
            data.comparisionValue1=data.comparisionValue1;
            let comparisionValue1:any = this.ruleForm.controls['comparisionValue1'];
            comparisionValue1.patchValue(data.comparisionValue1);
        }
    }
    showTitle(amount:any){
        let data= this._ruleForm.getData(this.ruleForm);
        if(data.comparisionType=='--None--'){
            data.comparisionValue="";
            let comparisionValue:any = this.ruleForm.controls['comparisionValue'];
            comparisionValue.patchValue("");
        }
        else{
            data.comparisionValue=data.comparisionValue;
            let comparisionValue:any = this.ruleForm.controls['comparisionValue'];
            comparisionValue.patchValue(data.comparisionValue);
        }

    }

    showCOA(coa:any) {
        let data= this._ruleForm.getData(this.ruleForm);
        data.chartOfAccount = coa.id;
        if(coa.id!='' && coa!='--None--'){
            data.chartOfAccount = coa.id;
        }else if(coa=='--None--' || coa.id==''){
            data.chartOfAccount = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    }

    showVendor(vendor:any) {
        let data= this._ruleForm.getData(this.ruleForm);
        if(vendor.id!=''&& vendor!='--None--'){
            data.vendorValue = vendor.id;
        }else if(vendor=='--None--' || vendor.id==''){
            data.vendorValue = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    }
    showSource(bank:any) {
        let data= this._ruleForm.getData(this.ruleForm);
        data.source = bank.id;
        if(bank.id!=''&& bank!='--None--'){
            data.source = bank.id;
        }else if(bank=='--None--' || bank.id==''){
            data.source = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    }
    showCustomer(customer:any) {
        let data= this._ruleForm.getData(this.ruleForm);
        data.customerValue = customer.customer_id;
        if(customer.customer_id!=''&& customer!='--None--'){
            data.customerValue = customer.customer_id;
        }else if(customer=='--None--' || customer.customer_id==''){
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
            {"name": "sourceType", "title": "Source Type"},
            {"name": "ruleName", "title": "Rule Name"},
            {"name": "chartOfAccount", "title": "COA"},
            {"name": "effectiveDate", "title": "Effective Date"},
            {"name": "conditions", "title": "conditions","visible": false},
            {"name": "action", "title": "action","visible": false},
            {"name": "actionValue", "title": "actionValue","visible": false},
            {"name": "actions", "title": ""},
            {"name": "id", "title": "","visible": false}

        ];
        let base = this;
        _.each(RulesList, function(RulesList) {
             let row:any = {};
            let coa = _.find(base.chartOfAccounts, function(_coa) {
                return _coa.id == RulesList.chartOfAccount;
            });
            row['id']=RulesList.id;
            row['sourceType']=RulesList.sourceType;
            row['ruleName']=RulesList.ruleName;
            if(coa) {
                row['chartOfAccount'] = coa.name;
            }
            row['effectiveDate']=base.dateFormater.formatDate(RulesList.effectiveDate,base.serviceDateformat,base.dateFormat);
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.tableData.rows.push(row);
        });
        base.hasRuleList = false;
        setTimeout(function(){
           base.hasRuleList = true;
        });
        setTimeout(function() {
          if(base.hasRuleList){
            base.showDownloadIcon = "visible";
          }
        },600);

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
        this._toastService.pop(TOAST_TYPE.confirm, "Are You Sure You Want To Delete?");
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
      this.loadingService.triggerLoadingEvent(true);
        this.titleService.setPageTitle("UPDATE RULE");
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
            setTimeout(function(){
              base.loadingService.triggerLoadingEvent(false);
            },500)
        },err=>{
          this.loadingService.triggerLoadingEvent(false);
        });
        // this.getRowDetails(row.id);

    }
    isValid(ruleForm){
        if((ruleForm.value.ruleName) && (ruleForm.value.chartOfAccount)){
            return false;
        }
            return true;
    }

    getRowDetails(RuleID){
        let base=this;
        this.ruleservice.rule(this.companyId,RuleID).subscribe(rule => {
            this.row = rule;
            rule.effectiveDate = base.dateFormater.formatDate(rule.effectiveDate,base.serviceDateformat,base.dateFormat);
            if(rule.endDate) {
                rule.endDate = base.dateFormater.formatDate(rule.endDate, base.serviceDateformat, base.dateFormat);
            }
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
            let ruleName:any= this.ruleForm.controls['ruleName'];
            ruleName.patchValue(rule.ruleName);
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
                    if(rule.conditions[i].comparisionValue2) {
                        this.hasAmount=true;
                        let comparisionValue2: any = this.ruleForm.controls['comparisionValue2'];
                        comparisionValue2.patchValue(rule.conditions[i].comparisionValue2);
                    }
                    else{
                        this.hasAmount=false;
                    }
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

cleanData(data){
    delete data.attributeName;
    delete data.comparisionType;
    delete data.comparisionValue;
    delete data.logicalOperator;
    delete data.attributeName1;
    delete data.comparisionType1;
    delete data.vendorValue;
    delete data.customerValue;
    delete data.comparisionValue1;
    delete data.comparisionValue2;
    delete data.source;
    delete data.vendorValue;
    delete data.vendorType;
    delete data.customerValue;
    delete data.customerType;
    delete data.comparisionType;
    delete data.comparisionValue;
    delete data.logicalOperator;
    delete data.attributeName1;
    delete data.comparisionValue2;
    delete data.attributeName;
    return data;

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
        data.effectiveDate = this.dateFormater.formatDate(data.effectiveDate,this.dateFormat,this.serviceDateformat);
        if(data.endDate) {
            data.endDate = this.dateFormater.formatDate(data.endDate, this.dateFormat, this.serviceDateformat);
        }
        if(this.editMode){
            data.conditions=[];
            var condition1={};
            var condition2={};
            var condition3={};
            var condition4={};
            var condition5={};
            var condition6={};
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
            let comparisionValue2:any = this.ruleForm.controls['comparisionValue2'];
            comparisionValue2.patchValue(comparisionValue2.value);
            condition2['attributeName']="Amount";
            condition2['comparisionType']=selectedAmountControl1.value;
            condition2['comparisionValue']=selectedValueControl1.value;
            condition2['comparisionValue2']=comparisionValue2.value;
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
            console.log("data",data);
            this.cleanData(data);
          this.loadingService.triggerLoadingEvent(true);
            this.ruleservice.updateRule(data, this.companyId)
                .subscribe(success  => {
                    this.showMessage(true, success);
                    this.selectedDimensions==[];
                    this.showFlyout = false;
                    this.titleService.setPageTitle("Rules");
                    this.loadingService.triggerLoadingEvent(false);
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
            var condition6={};
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
            let comparisionValue2:any = this.ruleForm.controls['comparisionValue2'];
            comparisionValue2.patchValue(comparisionValue2.value);
            condition2['attributeName']="Amount";
            condition2['comparisionType']=selectedAmountControl1.value;
            condition2['comparisionValue']=selectedValueControl1.value;
            condition2['comparisionValue2']=comparisionValue2.value;
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

            this.cleanData(data);
            this.loadingService.triggerLoadingEvent(true);
            this.ruleservice.addRule(<VendorModel>data, this.companyId)
                .subscribe(success  => {
                    this.showMessage(true, success);
                    this.selectedDimensions==[];
                    this.showFlyout = false;
                    this.titleService.setPageTitle("Rules");
                    this.loadingService.triggerLoadingEvent(false);
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

  getRulesTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["Source Type"] = tempData[i].sourceType;
      tempJsonArray["Rule Name"] = tempData[i].ruleName;
      tempJsonArray["COA"] = tempData[i].chartOfAccount;
      tempJsonArray["Effective Date"] = tempData[i].effectiveDate;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType) {
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.rulesTableColumns;
    this.pdfTableData.tableRows.rows = this.getRulesTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "Rules.xls";
        link.click();
      }, error =>{
        this._toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF() {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.companyId, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "Rules.pdf";
        link[0].click();
      }, error =>{
        this._toastService.pop(TOAST_TYPE.error, "Failed To Export Table Into PDF");
      });

  }

}
