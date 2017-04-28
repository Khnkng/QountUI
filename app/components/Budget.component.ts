
import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {BudgetService} from "qCommon/app/services/Budget.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {BudgetForm} from "../forms/Budget.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {NumeralService} from "qCommon/app/services/Numeral.service";

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'budget',
    templateUrl: '/app/views/budget.html',
})

export class BudgetComponent{
    budgetForm: FormGroup;
    budgetList = [];
    newFormActive:boolean = true;
    hasBudget: boolean = false;
    tableData:any = {};
    tableOptions:any = {};
    editMode:boolean = false;
    currentCompany:any;
    budgetId:any;
    tableColumns:Array<string> = ['name', 'id', 'category', 'amount', 'frequency'];
    combo:boolean = true;
    allCOAList:Array<any> = [];
    showFlyout:boolean = false;
    confirmSubscription:any;
    companyCurrency:string;
    localeFortmat:string='en-US';

    constructor(private _fb: FormBuilder, private _budgetForm: BudgetForm, private switchBoard: SwitchBoard,
                private budgetService: BudgetService, private toastService: ToastService, private loadingService:LoadingService,
                private coaService: ChartOfAccountsService,private numeralService:NumeralService){
        this.budgetForm = this._fb.group(_budgetForm.getForm());
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteBudgetCode(toast));
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.currentCompany=Session.getCurrentCompany();
        this.loadingService.triggerLoadingEvent(true);
        this.budgetService.budget(this.currentCompany)
            .subscribe(budget => {
                this.budgetList=budget;
                this.buildTableData(this.budgetList);
            }, error => this.handleError(error));

    }
    ngOnDestroy(){
        this.confirmSubscription.unsubscribe();
    }

    handleError(error){
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
    }

    filterChartOfAccounts(chartOfAccounts){
        this.allCOAList = chartOfAccounts;
    }

    showAddBudget() {
        this.editMode = false;
        this.budgetForm = this._fb.group(this._budgetForm.getForm());
        this.newForm();
        this.showFlyout = true;
    }

    showEditBudget(row: any){
        this.loadingService.triggerLoadingEvent(true);
        this.budgetService.getBudget(row.id,this.currentCompany)
            .subscribe(budget => {
                this.processBudget(budget);
            }, error => this.handleError(error));
    }

    processBudget(budget){
        this.editMode = true;
        this.newForm();
        this.showFlyout = true;
        this._budgetForm.updateForm(this.budgetForm, budget);
        this.loadingService.triggerLoadingEvent(false);
    }

    deleteBudgetCode(toast){
        this.loadingService.triggerLoadingEvent(true);
        let base=this;
        this.budgetService.removeBudget(this.budgetId,this.currentCompany)
            .subscribe(budget => {
                this.toastService.pop(TOAST_TYPE.success, "Budget deleted successfully");
                _.remove(this.budgetList, function(budget) {
                    return budget.id == base.budgetId;
                });
                this.buildTableData(this.budgetList);
            }, error => this.handleError(error));
    }
    removeBudget(row: any){
        this.budgetId = row.id;
        this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }

    newForm(){
        this.newFormActive = false;
        setTimeout(()=> this.newFormActive=true, 0);
    }

    ngOnInit(){

    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.showEditBudget($event);
        } else if(action == 'delete'){
            this.removeBudget($event);
        }
    }

    submit($event){
        let base = this;
        $event && $event.preventDefault();
        let data = this._budgetForm.getData(this.budgetForm);
        this.loadingService.triggerLoadingEvent(true);
        if(data.frequency=='yearly'){
            data.startDate=Session.getFiscalStartDate();
        }
        if(this.editMode){
            this.budgetService.updateBudget(data,this.currentCompany)
                .subscribe(budget => {
                    base.toastService.pop(TOAST_TYPE.success, "Budget updated successfully");
                    let index = _.findIndex(base.budgetList, {id: data.id});
                    base.budgetList[index] = budget;
                    base.buildTableData(base.budgetList);
                    this.showFlyout = false;
                }, error => this.handleError(error));
        } else{
            this.budgetService.addBudget(data,this.currentCompany)
                .subscribe(newBudget => {
                    this.handleNewBudget(newBudget);
                    this.showFlyout = false;
                }, error => this.handleError(error));
        }
    }

    handleNewBudget(newBudget){
        this.toastService.pop(TOAST_TYPE.success, "Budget created successfully");
        this.budgetList.push(newBudget);
        this.buildTableData(this.budgetList);
    }

    buildTableData(budgetList) {
        this.hasBudget = false;
        this.budgetList = budgetList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name": "name", "title": "Name"},
            {"name": "category", "title": "Category"},
            {"name": "amount", "title": "Amount", "sortValue": function(value){
                return base.numeralService.value(value);
            }},
            {"name": "frequency", "title": "Frequency"},
            {"name": "id", "title": "Id", "visible": false},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        budgetList.forEach(function(budget) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                row[key] = budget[key];
                if(key=='amount'){
                    row['amount'] =budget[key].toLocaleString(base.localeFortmat, { style: 'currency', currency: Session.getCurrentCompanyCurrency(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasBudget = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    }

    hideFlyout(){
        this.showFlyout = !this.showFlyout;
    }

    setStartDate(date){
        let data = this._budgetForm.getData(this.budgetForm);
        data.startDate = date;
        this._budgetForm.updateForm(this.budgetForm, data);
    }
}
