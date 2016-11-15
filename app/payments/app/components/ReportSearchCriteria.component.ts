import {Router} from "@angular/router";
import {Focus} from "qCommon/app/directives/focus.directive";
import {Ripple} from "qCommon/app/directives/rippler.directive";
import {OnInit, Component, Input} from "@angular/core";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {CustomDatepicker} from "../directives/customDatepicker";
import {PERIODS} from "qCommon/app/constants/Date.constants";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {FoundationInit} from "qCommon/app/directives/foundation.directive";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ReportService} from "../services/Reports.service";

declare var _:any;
declare var moment:any;

@Component({
  selector: 'report-search-criteria',
  templateUrl: '/app/views/reportSearchCriteria.html'
})

export class ReportsSearchCriteriaComponent implements OnInit {
  reportType: string;
  report:any= {};
  appName = "billpay";
  customizationObj:any= {
    "customizations": {}
  };
  companies:any= [];
  fields:any= [];
  periods:any;
  allCompanies:any = [];
  customizePanelCSS:any;
  expandedPanelCSS: any ={
    width: '0px'
  };
  isExpanded: boolean = false;
  vendors = [];
  rightArrowClass = "ion-arrow-right-b";
  downArrowClass = "ion-arrow-down-b";
  customPanel = {
    "General": true,
    "Aging": false,
    "Filters": false,
    "HeaderFooter": false
  };

  @Input()
  hideReportForm: boolean;

  @Input()
  reportName:string = "New Report";
  @Input()
  reportDesc:string = "Sample Description";

  @Input()
  set setReportType (reportType: string) {
    this.reportType = reportType;
    this.report.type = this.reportType;
    this.fields = this.reportFields[this.reportType];
    if(this.reportType == 'aging' || this.reportType == 'agingDetail'){
      this.periods = PERIODS.toDatePeriods;
    } else if(this.reportType == 'paymentHistory' || this.reportType == 'vendorSummary' || this.reportType == 'vendorExpenses'
          ||this.reportType == 'vendorBalance'||this.reportType == 'gainloss' ||this.reportType == 'paymentRegister'){
      this.periods = PERIODS.billPaymentHistoryPeriods;
    }
  }

  reportFields = {
    aging: ["reportPeriod", "company", "daysPerAgingPeriod", "numberOfPeriods"],
    agingDetail: ["reportPeriod", "company", "daysPerAgingPeriod", "numberOfPeriods"],
    paymentHistory: ["reportPeriod", "company", "startDate", "endDate"],
    vendorSummary: ["reportPeriod", "company", "startDate", "endDate"],
    vendorBalance: ["reportPeriod", "company", "startDate", "endDate"],
    vendorExpenses: ["reportPeriod", "company", "startDate", "endDate"],
    gainloss: ["reportPeriod", "company", "startDate", "endDate"],
    paymentRegister:["reportPeriod", "company", "startDate", "endDate"]
  };

  constructor(private companyService: CompaniesService, private switchBoard: SwitchBoard,
              private reportService: ReportService, private _router: Router,
      private toastService: ToastService) {
    this.companyService.companies()
      .subscribe(companies  => {
        this.allCompanies = companies?_.filter(companies, function(o) { return o.invitedBy == o.userID }):[];
        this.companies=companies?_.map(companies,'name'): [];
        this.switchBoard.onFetchCompanies.next(companies);
        if(this.companies.length>0){
          this.report.company=this.allCompanies[0].id;
          this.report.companyCurrency=this.allCompanies[0].defaultCurrency;
          this.changeCompany(this.allCompanies[0].id);
        }
      }, error =>  {

      });

    this.customizationObj.filters = [{
      "filterName": "vendorName",
      "operator": "=",
      "values": []
    }];
  }

  setDate(val, targetObj){
    if(this.reportType == 'paymentHistory' || this.reportType == 'vendorSummary' || this.reportType == 'vendorExpenses'
      ||this.reportType == 'vendorBalance'|| this.reportType=='gainloss' || this.reportType=='paymentRegister'){
      this.setDates(val, targetObj);
    } else{
      this.calculateAsofDate(val, targetObj);
    }
  }

  changeCompany(company){
    this.companyService.vendors(company).subscribe(vendors => {
      this.vendors = vendors;
    }, error => {
    });
    this.reportService.getCustomizationObj(this.appName, company, this.reportType).subscribe(customObj => {
      customObj.customizations = customObj.customizations || {};
      this.customizationObj = customObj;
      if(!customObj.filters.length){
        this.customizationObj.filters = [{
          "filterName": "vendorName",
          "operator": "=",
          "values": []
        }];
      }
      this.report.companyCurrency=_.find(this.allCompanies, function(o) { return o.id == company; }).defaultCurrency;
      this.report.period = this.customizationObj.customizations.period;
      this.report.asOfDate = this.customizationObj.customizations.asOfDate;
      this.report.endDate = this.customizationObj.customizations.endDate;
      this.report.startDate = this.customizationObj.customizations.startDate;
      this.report.daysPerAgingPeriod = this.customizationObj.customizations.daysPerAgingPeriod;
      this.report.numberOfPeriods = this.customizationObj.customizations.numberOfPeriods;
      this.report.breakdown = this.customizationObj.customizations.breakdown;
    }, error => {
    });
  }

  calculateAsofDate(val, targetObj){
    if(val && (val=='Today' || val.indexOf('-to-date')!=-1))
      targetObj.asOfDate=moment(new Date()).format("MM/DD/YYYY");
    else if(val){
      switch(val){
        case 'This Month':
          targetObj.asOfDate=moment().endOf('month').format("MM/DD/YYYY");
          break;
        case 'This Quarter':
          targetObj.asOfDate=moment().endOf('quarter').format('MM/DD/YYYY');
          break;
        case 'This Year':
          targetObj.asOfDate=moment().endOf('year').format("MM/DD/YYYY");
          break;
        case 'This Week':
          targetObj.asOfDate=moment().endOf('isoWeek').format("MM/DD/YYYY");
          break;
        case 'Yesterday':
          targetObj.asOfDate=moment().subtract(1, 'days').format("MM/DD/YYYY");
          break;
        case 'Last Week':
          targetObj.asOfDate=moment().subtract(7, 'days').endOf('isoWeek').format("MM/DD/YYYY");
          break;
        case 'Last Month':
          targetObj.asOfDate=moment().subtract(1, 'months').endOf('month').format("MM/DD/YYYY");
          break;
        case 'Last Quarter':
          targetObj.asOfDate=moment().subtract(1, 'quarter').endOf('quarter').format("MM/DD/YYYY");
          break;
      }
    }
  }

  setDates(val, targetObj){
    if(val){
      switch(val){
        case "This Month":
          targetObj.asOfDate=moment().startOf('month').format("MM/DD/YYYY");
          targetObj.endDate=moment().endOf('month').format("MM/DD/YYYY");
          break;
        case "This Quarter":
          targetObj.asOfDate=moment().startOf('quarter').format("MM/DD/YYYY");
          targetObj.endDate=moment().endOf('quarter').format("MM/DD/YYYY");
          break;
        case "This Year":
          targetObj.asOfDate=moment().startOf('year').format("MM/DD/YYYY");
          targetObj.endDate=moment().endOf('year').format("MM/DD/YYYY");
          break;
        case "Last Month":
          targetObj.asOfDate=moment().subtract(1, 'months').startOf('month').format("MM/DD/YYYY");
          targetObj.endDate=moment().subtract(1, 'months').endOf('month').format("MM/DD/YYYY");
          break;
        case "Last Quarter":
          targetObj.asOfDate=moment().subtract(1, 'quarter').startOf('quarter').format("MM/DD/YYYY");
          targetObj.endDate=moment().subtract(1, 'quarter').endOf('quarter').format("MM/DD/YYYY");
          break;
      }
    }
  }

  setStartDate(val, targetObj){
    targetObj.startDate = val;
  }

  setAsOfDate(val, targetObj){
    targetObj.asOfDate=val;
  }

  setCustomEndDate(val, targetObj){
    targetObj.endDate=val;
  }

  generateReport(){
    let data={
      "report": this.report,
      "customizationObj": _.cloneDeep(this.customizationObj)
    };
    this.switchBoard.onSubmitReport.next(data);
  }


  hideCustomizeFieldPanel(){
    this.isExpanded = false;
    this.customizePanelCSS = "collapsed";
  }

  showCustomizeFieldPanel(){
    this.isExpanded = true;
    this.customizePanelCSS = "expanded";
  }

  setNegativeNumberFormat(value){
    this.customizationObj.customizations.negativeNumberFormat = value;
  }

  updateCheckedVendors(vendor, $event){
    if($event.target.checked){
      this.customizationObj.filters[0].values.push(vendor);
    } else{
      this.customizationObj.filters[0].values.splice(this.customizationObj.filters[0].values.indexOf(vendor), 1);
    }
  }

  setHeaderAlignment(value){
    this.customizationObj.customizations.headerAlignment = value;
  }

  setFooterAlignment(value){
    this.customizationObj.customizations.footerAlignment = value;
  }

  saveFilterValues(filter){
    let base = this;
    filter.app = this.appName;
    filter.reportType = this.reportType;
    let selectedCompany = _.find(this.allCompanies, function(company){
      return company.id == base.report.company
    });
    filter.company = selectedCompany.id;
    this.reportService.saveCustomizationObj(filter).subscribe(response  => {
      this.toastService.pop(TOAST_TYPE.success, "Customization saved successfully");
      this.customizationObj = filter;
      this.hideCustomizeFieldPanel();
    }, error =>  {

    });
  }

  getIconClass(category){
    if(this.customPanel[category]){
      return this.downArrowClass;
    } else{
      return this.rightArrowClass;
    }
  }

  toggleCategory(category){
    this.customPanel[category] = !this.customPanel[category];
  }

  ngOnInit(){

  }

  backToReportsPage(){
    this._router.navigate(['Reports']);
  }

}
