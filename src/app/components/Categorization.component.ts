/**
 * Created by seshu on 26-02-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {ToastService} from "qCommon/app/services/Toast.service";
import {ExpenseService} from "qCommon/app/services/Expense.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {FinancialAccountsService} from "qCommon/app/services/FinancialAccounts.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";

declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
    selector: 'categorize',
    templateUrl: '../views/categorization.html',
})

export class CategorizationComponent{
    companyId:string;
    accounts:Array<any> = [];
    entries:Array<any> = [];
    companyCurrency:string;
    tableData:any = {};
    hasEntries:boolean = false;
    tableOptions:any = {search:false, pageSize:12};
    localeFortmat:string='en-US';

    constructor(private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
                private loadingService: LoadingService, private expenseService: ExpenseService, private accountsService: FinancialAccountsService,private numeralService:NumeralService) {
        this.companyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.accountsService.financialAccounts(this.companyId)
            .subscribe(accounts =>{
                this.accounts = accounts.accounts;
                this.fetchUncategorizedEntries();
            }, error=>{
                this.loadingService.triggerLoadingEvent(false);
            });
    }

    showPreviousPage(){
        let link = ['books', 'deposits'];
        this._router.navigate(link);
    }

    ngOnInit(){

    }

    fetchUncategorizedEntries(){
        let base = this;
        this.expenseService.uncategorizedEntries(this.companyId)
            .subscribe(entries =>{
                this.loadingService.triggerLoadingEvent(false);
                _.each(entries.Deposits, function(entry){
                    entry.type='Deposit';
                    base.entries.push(entry);
                });
                _.each(entries.Expenses, function(entry){
                    entry.type='Expense';
                    base.entries.push(entry);
                });
                this.buildTableData();
            }, error =>{
                this.loadingService.triggerLoadingEvent(false);
            });
    }

    getBankAccountName(accountId){
        let account = _.find(this.accounts, {'id': accountId});
        return account? account.name: "";
    }

    redirectToEntryPage($event){
        if($event.type == 'Expense'){
            let link = ['/expense', $event.id];
            this._router.navigate(link);
        }
        if($event.type == 'Deposit'){
            let link = ['/deposit', $event.id];
            this._router.navigate(link);
        }
    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.redirectToEntryPage($event);
        }
    }

    buildTableData(){
        let base = this;
        this.tableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "title", "title": "Title"},
            {"name": "amount", "title": "Amount", "sortValue": function(value){
                return base.numeralService.value(value);
            }},
            {"name": "bank_account_id", "title": "Bank Account"},
            {"name": "id", "title": "Entry ID", "visible": false},
            {"name": "actions", "title": "", "type": "html", "sortable": false}];
        this.tableData.rows = [];
        _.each(this.entries, function(entry){
            let row:any = {};
            _.each(Object.keys(entry), function(key){
                if(key == 'bank_account_id'){
                    row[key] = base.getBankAccountName(entry[key]);
                } else if(key == 'amount'){
                    let amount = parseFloat(entry[key]);
                    row[key] = amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else{
                    row[key] = entry[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
        if(this.tableData.rows.length > 0){
            this.hasEntries = true;
        }
    }

}
