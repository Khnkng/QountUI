/**
 * Created by seshu on 26-02-2016.
 */

import {Component, Output, EventEmitter, OnInit, ViewChild} from "@angular/core";
import {Router, NavigationEnd} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {CustomersService} from "qCommon/app/services/Customers.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ToastService} from "qCommon/app/services/Toast.service";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {StateService} from "qCommon/app/services/StateService";
import {State} from "qCommon/app/models/State";
import {DimensionService} from "qCommon/app/services/DimensionService.service";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";

declare let jQuery:any;
declare let _:any;

@Component({
    selector: 'search-widget',
    templateUrl: '../views/search.html'
})

export class SearchComponent{
    source:Array<string> = [];
    companyCurrency:string;
    amountCondition:string;
    textCondition:string;
    text:string;
    dateCondition:string;
    amount:number = 0;
    lowerLimit:number = 0;
    upperLimit:number = 0;
    date:string;
    beginDate:string;
    endDate:string;
    companyId:string;
    chartOfAccount:string;
    vendor: string;
    customer: string;
    chartOfAccounts:Array<any> = [];
    vendors:Array<any> = [];
    customers:Array<any> = [];
    hasSearchResults:boolean = false;
    showSearchCriteria:boolean = true;
    showtable:boolean=false;
    tableData:any = {};
    tableOptions:any = {};
    routeSubscribe:any;
    currency:string='USD';
    locale:string="en-US";

    selectedDimension:string;
    dimensions:Array<any> = [];
    dimensionValues:Array<any> = [];
    selectedValues:Array<any> = [];
    selectedValue:string;
    @ViewChild("coaComboBoxDir") coaComboBox: ComboBox;
    @ViewChild("vendorComboBoxDir") vendorComboBox: ComboBox;
    @ViewChild("customerComboBoxDir") customerComboBox: ComboBox;
    showCriteria:boolean;
    bill:boolean;
    payment:boolean;
    deposit:boolean;
    expense:boolean;
    invoice:boolean;

    constructor(private _router: Router, private coaService: ChartOfAccountsService, private companyService: CompaniesService,
                private customersService: CustomersService, private loadingService: LoadingService, private toastService: ToastService,
                private titleService:pageTitleService,_switchBoard:SwitchBoard, private stateService: StateService, private dimensionService: DimensionService) {
        this.companyCurrency=Session.getCurrentCompanyCurrency();
        this.companyId=Session.getCurrentCompany();
        this.titleService.setPageTitle("Search");
        this.amountCondition = 'greaterthan';
        this.textCondition  ='beginsWith';
        this.dateCondition = 'equals';
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(title => {
          this.showPreviousPage();
        });
      let state = this.stateService.getPrevState();
      if(state && state.key == 'search_results'){
        let data=state.data;
        if(data){
          this.setSearchData(data);
        }
        this.stateService.pop();
      }else {
        this.showCriteria=true;
        this.loadData();
      }
      let base=this;
    }

    setSearchData(data){
      let base=this;
      this.chartOfAccounts=data.servicesData['coas'];
      this.vendors=data.servicesData['vendors'];
      this.customers=data.servicesData['customers'];
      this.dimensions=data.servicesData['dimensions'];
      this.source=data['source'];
      /*if(this.source.length>0){
        _.each(this.source, function(component){
          base.isCompSelected(component);
        });
      }*/
      if(data.criteria.vendor){
        this.vendor=data.criteria.vendor;
        this.setVendorName();
      }
      if(data.criteria.chartOfAccount){
         this.chartOfAccount=data.criteria.chartOfAccount;
          this.setCOAName();
      }
      if(data.criteria.customer){
        this.customer=data.criteria.customer;
        this.setCustomerName();
      }
      if(data.criteria['amount']){
        this.amountCondition=data.criteria['amount'].condition;
        if(this.amountCondition == 'between'){
          this.lowerLimit=data.criteria['amount'].value[0];
          this.upperLimit=data.criteria['amount'].value[1];
        }else{
          this.amount=data.criteria['amount'].value;
        }
      }
      if(data.criteria['date']){
        this.amountCondition=data.criteria['date'].condition;
        if(this.dateCondition == 'between'){
          this.beginDate=data.criteria['date'].value[0];
          this.endDate=data.criteria['date'].value[1];
        }else{
          this.date=data.criteria['date'].value;
        }
      }
      if(data.criteria['text']){
        this.textCondition=data.criteria['text'].condition;
        this.text=data.criteria['text'].value;
      }
      if(data.criteria['dimensions']&&data.criteria['dimensions'].length>0){
          this.getDimensionsFromSearchData(data.criteria['dimensions']);
      }
      this.showCriteria=true;
      this.setSource();
    }

    setCustomerName(){
      let base=this;
      let customer = _.find(this.customers, {'customer_id': this.customer});
      setTimeout(function(){
        base.customerComboBox.setValue(customer, 'customer_name');
      });
    }

    setSource(){
      let base=this;
      if(this.source.length>0){
       _.each(this.source, function(component){
       base[component]=true;
       });
       }
    }

    setVendorName(){
      let base=this;
      let vendor = _.find(this.vendors, {'id': this.vendor});
      setTimeout(function(){
        base.vendorComboBox.setValue(vendor, 'name');
      });
    }

    setCOAName(){
      let base=this;
      let coa = _.find(this.chartOfAccounts, {'id': this.chartOfAccount});
      setTimeout(function(){
        base.coaComboBox.setValue(coa, 'name');
      });
    }

    setDimension(dimension){
        this.selectedDimension = dimension;
        this.dimensionValues = this.getDimensionValues(dimension);
    }

    getDimensionValues(dimensionName){
        let dimension = _.find(this.dimensions, {'name': dimensionName});
        return dimension? _.cloneDeep(dimension.values): [];
    }

    loadData(){
      this.coaService.chartOfAccounts(this.companyId)
        .subscribe(chartOfAccounts => {
          this.chartOfAccounts = chartOfAccounts;
        }, error => {
        });
      this.companyService.vendors(this.companyId)
        .subscribe(vendors => {
          this.vendors = vendors;
        }, error => {
        });
      this.customersService.customers(this.companyId)
        .subscribe(customers => {
          this.customers = customers;
        }, error => {
        });
      this.dimensionService.dimensions(this.companyId)
        .subscribe(dimensions => {
          this.dimensions = dimensions;
        });
    }

    setDimensionValue(value){
        let base = this;
        let index = -1;
        _.each(this.selectedValues, function(obj){
            if(obj.dimension == base.selectedDimension && obj.value == value){
                index += 1;
            }
        });
        if(index == -1){
          if(value){
            this.selectedValues.push({
              "dimension": this.selectedDimension,
              "value": value
            });
          }
        }
    }

    removeSelectedValue(index){
        this.selectedValues.splice(index, 1);
    }

    ngOnInit() {
        let base = this;
        this._router.events.filter(event => event instanceof NavigationEnd).subscribe(routeChange => {
            base.source = [];
        });

        jQuery(document).ready(function(){
            jQuery(document).foundation();
        });

        /*let criteria = sessionStorage.getItem("searchcriteria");
        if(criteria){
            this.getSearchResults(JSON.parse(criteria));
            this.stateService.pop();
        }*/
    }

    ngOnDestroy(){
        this.routeSubscribe.unsubscribe();
    }

    showPreviousPage(){
        let prevState = this.stateService.pop();
        if(prevState){
            this._router.navigate([prevState.url]);
        }else{
            let link = [''];
            this._router.navigate(link);
        }
    }

    isCompSelected(component){
        let url = Session.getLastVisitedUrl();
        if(this.source.indexOf(component) != -1){
            return 'selected-button';
        } else if(url.indexOf(component.toLowerCase()) != -1){
            this.source.push(component);
            return 'selected-button';
        }
        return 'hollow';
    }

    selectComponent(component){
        if(this.source.indexOf(component) == -1){
            this.source.push(component);
        } else{
            this.source.splice(this.source.indexOf(component), 1);
        }
    }

    setDate(date, key){
        this[key] = date;
    }

    resetCriteria(){
        this.source = [];
        this.beginDate = '';
        this.endDate = '';
        this.amount = 0;
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.text = '';
        this.amountCondition = '';
    }

    setChartOfAccount(chartOfAccount){
        if(chartOfAccount && chartOfAccount.id){
            this.chartOfAccount = chartOfAccount.id;
        } else if(chartOfAccount == '--None--'){
            this.chartOfAccount = null;
        }
    }

    setVendor(vendor){
        if(vendor && vendor.id){
            this.vendor = vendor.id;
        } else if(vendor == '--None--'){
            this.vendor = null;
        }
    }

    setCustomer(customer){
        if(customer && customer.customer_id){
            this.customer = customer.customer_id;
        } else if(customer == '--None--'){
            this.customer = null;
        }
    }

    validate(){
        if(this.amountCondition != 'between' && isNaN(this.amount)){
            this.toastService.pop(TOAST_TYPE.error, "Please Enter Numbers In The Amount");
            return false;
        }
        if(this.amountCondition == 'between' && (isNaN(this.lowerLimit) || isNaN(this.upperLimit))){
            this.toastService.pop(TOAST_TYPE.error, "Please Enter Numbers In The Amount Fields");
            return false;
        }
        return true;
    }

    getSortedAmount(){
        return _.sortBy([this.lowerLimit, this.upperLimit]);
    }

    generateDimensionsObject(){
        let result = [];
        let dimensions = [];
        _.each(this.selectedValues, function(dimensionValue){
            if(dimensions.indexOf(dimensionValue.dimension) == -1){
                result.push({
                    "name": dimensionValue.dimension,
                    "values": []
                });
                dimensions.push(dimensionValue.dimension);
            }
        });
        _.each(this.selectedValues, function(dimensionValue){
            _.each(result, function(dim){
                if(dim.name == dimensionValue.dimension){
                    dim.values.push(dimensionValue.value);
                }
            })
        });
        return result;
    }

    getDimensionsFromSearchData(selectedDimensions){
      let base=this;
      this.selectedValues=[];
      _.each(selectedDimensions, function(selectedDimension){
        let dimensionValues=selectedDimension.values;
        let dimensionName=selectedDimension.name;
        _.each(dimensionValues, function(dimension){
          let selectedDimension={
            name:dimensionName,
            value:dimension,
            dimension:dimensionName
          };
          base.selectedValues.push(selectedDimension);
        })
      });
      this.setDimensionNameAndValues();
    }

    setDimensionNameAndValues(){
      let base=this;
      if(this.selectedValues.length>0){
        this.selectedDimension=this.selectedValues[0].name;
        this.dimensionValues=this.getDimensionValues(this.selectedDimension);
        setTimeout(function(){
          base.selectedValue=base.selectedValues[0].value;
        });
      }

    }

    doSearch(){
        if(!this.validate()){
            return;
        }
        let data:any = {
            source: this.source,
            criteria: {},
            servicesData:{}
        };
        if(this.vendor){
            data.criteria.vendor = this.vendor;
        }
        if(this.chartOfAccount){
            data.criteria.chartOfAccount = this.chartOfAccount;
        }
        if(this.customer){
            data.criteria.customer = this.customer;
        }
        if(this.amountCondition && (this.amount || (this.upperLimit && this.lowerLimit))){
            data.criteria['amount'] = {
                "condition": this.amountCondition,
                "value": this.amountCondition == 'between'? this.getSortedAmount(): this.amount
            }
        }
        if(this.dateCondition && (this.date || (this.beginDate && this.endDate))){
            data.criteria['date'] = {
                "condition": this.dateCondition,
                "value": this.dateCondition == 'between'? [this.beginDate, this.endDate]: this.date
            }
        }
        if(this.textCondition && this.text){
            data.criteria['text'] = {
                "condition": this.textCondition,
                "value": this.text
            }
        }
        if(this.selectedValues && this.selectedValues.length != 0){
            data.criteria['dimensions'] = this.generateDimensionsObject();
        }
        this.addServicesData(data);
        sessionStorage.setItem("searchcriteria", JSON.stringify(data));
        this.addSearchState(data);
        this.navigateToSearchResults();
       // this.getSearchResults(data);
    }

    addServicesData(data){
      data.servicesData['coas']=this.chartOfAccounts;
      data.servicesData['vendors']=this.vendors;
      data.servicesData['customers']=this.customers;
      data.servicesData['dimensions']=this.dimensions;
    }
    /*getSearchResults(data){
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.doSearch(data, this.companyId)
            .subscribe(results => {
                this.showtable = true;
                this.addSearchState(data);
                this.titleService.setPageTitle("Search Results");
               // this.buildResultsTableData(results);
                this.navigateToSearchResults();
            }, error => {
                this.showtable = true;

                this.loadingService.triggerLoadingEvent(false);
                console.log(error);
            })
    }*/

    addSearchState(data){
        this.stateService.addState(new State('search_results', this._router.url, data, null));
    }

    navigateToSearchResults(){
      this._router.navigate(['search-results']);
    }

    handleAction($event){
        let link = [];
        if($event.action == 'edit'){
            if($event.type == 'Bill'){
                link = ['payments/bill', this.companyId, $event.id, 'entry'];
            } else if($event.type == 'Deposit'){
                link = ['deposit', $event.id];
            } else if($event.type == 'Expense'){
                link = ['expense', $event.id];
            } else if($event.type == 'Journal'){
                link = ['journalEntry', $event.id];
            } else if($event.type == 'Credit'){
                link = ['payments/credit', this.companyId, $event.id];
            } else if($event.type == 'Payments'){
                link = ['payments', $event.id];
            } else if($event.type == 'Invoice'){
                link =['invoices/edit',$event.id];
            }
        }
        this._router.navigate(link);
    }

    buildResultsTableData(searchResults){
        let base = this;
        this.hasSearchResults = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 10;
        this.tableData.columns = [
            {"name": "type", "title": "Type"},
            {"name": "title", "title": "Title"},
            {"name": "amount", "title": "Amount"},
            {"name": "date", "title": "Date"},
            {"name":"entity", "title":"Entity"},
            {"name": "id", "title": "Id", "visible": false, "filterable": false},
            {"name": "actions", "title": "", "type": "html", "filterable": false}
        ];
        _.each(searchResults, function(result){
            let row:any = {};
            let currency=result.currency?result.currency:'USD';
            _.each(Object.keys(result), function(key){
                if(key == 'bill_amount' || key == 'amount'){
                    let amount=parseFloat(result[key]);
                    row['amount'] =amount.toLocaleString('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else if(key == 'type'){
                    row['type'] = result[key]? (result[key].charAt(0).toUpperCase() + result[key].slice(1)) : '';
                } else if(key == 'bill_date' ||key == 'invoice_date' ||key.toLowerCase() == 'date'){
                    row['date'] = result[key];
                } else if(key == 'title' || key.toLowerCase() == 'name' || key.toLowerCase() == 'number'){
                    row['title'] = result[key];
                } else{
                    row[key] = result[key];
                }
            });
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.tableData.rows.push(row);
        });
        this.loadingService.triggerLoadingEvent(false);
        setTimeout(function(){
            base.hasSearchResults = true;
        });
    }
}
