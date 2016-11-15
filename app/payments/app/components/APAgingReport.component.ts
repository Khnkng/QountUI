import {Router} from "@angular/router";
import {Focus} from "qCommon/app/directives/focus.directive";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {Session} from "qCommon/app/services/Session";
import {EmailService} from "../services/Email.service";
import {ExcelService} from "../services/Excel.service";
import {CustomTags} from "qCommon/app/directives/customTags";
import {PATH} from "qCommon/app/constants/Qount.constants";
import {Component,ViewChild} from "@angular/core";
import {Ripple} from "qCommon/app/directives/rippler.directive";
import {FoundationInit} from "qCommon/app/directives/foundation.directive";
import {CustomDatepicker} from "../directives/customDatepicker";
import {ReportsSearchCriteriaComponent} from "./ReportSearchCriteria.component";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {ReportService} from "../services/Reports.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {NotificationService} from "qCommon/app/services/Notification.service";
//import {FormatCurrency} from "../commons/FormatCurrency";
import {FormGroup,Validators,FormBuilder} from "@angular/forms";
import {HighChart} from "../directives/HighChart.directive";
declare var _:any;
declare var moment:any;
declare var jQuery:any;
declare function unescape(s:string): string;
declare function escape(s:string): string;
declare var Highcharts:any;

@Component({
  selector: 'reports',
  templateUrl: '/app/views/apAgingReport.html'
})

export class APAgingReportComponent {graphTabView:boolean=false;
  type:string = "component";
  report:any={};
  displayCurrency:string='USD';
  printmode:boolean=false;
  printmodes:boolean=false;
  printableArea:boolean=false;
  modes:boolean=true;
  nasa:boolean;
  printer:boolean;
  columns:any=[];
  results:Array<any>=[];
  displayDate:string=null;
  companyName:string=null;
  isDisplay:boolean=false;
  isSuccess:boolean=false;
  isFailure:boolean=false;
  user:any=[];
  emailAddress:any=[];
  totals:Array<any>=[];
  emailForm:any;
  showInRed:boolean = false;
  customObj:any;
  reportName:string;
  datePrepared: string;
  timePrepared: string;
  showEmail:boolean=false;
  vendorKeys:any=[];
  reportSubscription:any;
  @ViewChild('reportMail') reportMail;
  @ViewChild('drillDown') drillDown;
  reportResponse:any;
  excelResponse:any;
  reportReq:any;
  billsList:any;
  apAgingReportLogoUrl:string;
  hideReportForm:boolean=false;
  reportChartOptions:any;

  constructor(private _notificationService:NotificationService,private emailService:EmailService,private excelService:ExcelService,private emailBuilder: FormBuilder,private _router: Router,private reportService: ReportService, private switchBoard: SwitchBoard,private _toastService: ToastService) {
    this.emailForm = emailBuilder.group({
      Toaddress: ["", Validators.required],
      EmailBody:[""],
      cc:[""],
      Emailsubject:[""]
    });
    this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(data => this.generateReport(data));
    this.user=Session.get('user');
    this.switchBoard.onPrintWindowClose.subscribe(printStatus => {
      this.hidePrint();
    });
  }

  ngOnDestroy(){
    this.reportSubscription.unsubscribe();
  }
  ngAfterViewInit(){
    let EmailBodyControl:any = this.emailForm.controls['EmailBody'];
    let EmailBodyText = 'Hello, \n\nAttached is A/P Aging Summary\n\nRegards,\n';
    EmailBodyText += (this.user.firstName+" "+this.user.lastName);
    EmailBodyControl.patchValue(EmailBodyText);
    let EmailsubjectControl:any = this.emailForm.controls['Emailsubject'];
    let EmailsubjectText = 'Your A/P Aging Summary';
    EmailsubjectControl.patchValue(EmailsubjectText);
  }
  hidePrint(){
    this.printmodes=false;
  }
  backToSearch(){
    this.hideReportForm = false;
    this.isSuccess = false;
  }
  openemail(){
    this.showEmail=true;
    this.emailAddress=[this.user.id];
    jQuery(this.reportMail.nativeElement).foundation('open');
  }
  doEmail(event){
    var emailJson={};
    emailJson["Toaddress"]=jQuery('#Toaddress').tagit("assignedTags");
    emailJson["cc"]=jQuery('#cc').tagit("assignedTags");
    emailJson["Emailsubject"]=this.emailForm.value.Emailsubject;
    emailJson["EmailBody"]=this.emailForm.value.EmailBody;
    var emailReq = this.reportReq;
    emailReq["applicationName"]="payments";
    emailReq["reportName"]="aging";
    emailReq["reportType"]="pdf";
    emailReq["Authorization"]="Bearer "+Session.get('token');
    emailReq["userId"]=this.user.id;
    emailReq["companyId"]=emailReq.company;
    emailReq["fileName"]="test.pdf";
    emailReq["sendEmail"]="true";
    emailReq["emailJson"] = emailJson;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', PATH.PDF_CREATE_SERVICE, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var that = this;
    xhr.onload = function(e) {
      if (this.status == 200) {
        that._toastService.pop(TOAST_TYPE.success, this.response);
      }
    };
    xhr.send(JSON.stringify(emailReq));
    jQuery("#Toaddress, #cc").tagit("removeAll");
    this.showEmail=false;
    let EmailBodyControl:any = this.emailForm.controls['EmailBody'];
    let EmailBodyText = 'Hello, \n\nAttached is A/P Aging Summary\n\nRegards,\n';
    EmailBodyText += (this.user.firstName+" "+this.user.lastName);
    EmailBodyControl.patchValue(EmailBodyText);
    let EmailsubjectControl:any = this.emailForm.controls['Emailsubject'];
    let EmailsubjectText = 'Your A/P Aging Summary';
    EmailsubjectControl.patchValue(EmailsubjectText);
  }
  private handleError(error:any) {

  }


  printDiv() {
    window.print();
  }

  goToReport(){
    let link = ['Reports'];
    this._router.navigate(link);
  }
  onChange(deviceValue) {
    document.getElementById("sucess").style.height = "400px"
    document.getElementById("sucess").style.width = "800px";
    if(deviceValue=='Potrait') {
      console.log(deviceValue);
      document.getElementById("sucess").style.height = "700px"
      document.getElementById("sucess").style.width = "700px";
    }
    else{
      document.getElementById("sucess").style.height = "400px"
      document.getElementById("sucess").style.width = "800px";
    }
  }

  populateCustomizationValues(customObj){
    this.customObj = customObj;
    this.companyName = customObj.customizations.includeCompanyName? customObj.customizations.customCompanyName: "";
    this.reportName = customObj.customizations.includeReportTitle? customObj.customizations.reportTitle: "";
    this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
    this.timePrepared = moment(new Date()).format("HH:mm:ss A");
    this.showInRed = customObj.customizations.showInRed;
  }

  /*formatAmount(value, currencyCode?, symbolDisplay?, digits?){
    let formattedValue = new FormatCurrency().transform(Math.abs(value), currencyCode, symbolDisplay, digits);
    if(value < 0){
      if(this.customObj.customizations.negativeNumberFormat){
        if(this.customObj.customizations.negativeNumberFormat == '(100)'){
          return '('+formattedValue+')';
        }
        if(this.customObj.customizations.negativeNumberFormat == '100-'){
          return formattedValue+'-';
        }
        if(this.customObj.customizations.negativeNumberFormat == '-100'){
          return '-'+formattedValue;
        }
      } else{
        formattedValue = new FormatCurrency().transform(value, currencyCode, symbolDisplay, digits);
      }
    }
    return formattedValue;
  }*/

  isNegativeValue(value){
    if(value && value.indexOf('-')!=-1 && this.showInRed){
      return true;
    }
  }

  getCurrentDate(){

  }

  generateReport(data){
    let report = data.report;
    this.populateCustomizationValues(data.customizationObj);
    this.displayDate=moment(report.asOfDate,'MM/DD/YYYY').format("MMMM DD, YYYY");
    this.reportReq=report;
    if(report.daysPerAgingPeriod && report.numberOfPeriods && report.asOfDate)
      this.reportService.generateReport(report).subscribe(report  => {
        this.hideReportForm = true;
        this.resetData();
        this.reportResponse=report;

        this.generateChart(report);
        var keys=Object.keys(report.data);
        for (let key of keys) {
          if(key!='TOTAL')
            this.results.push(report.data[key]);
        }
        this.vendorKeys = [];
        if(this.results.length > 0){
          this.vendorKeys=Object.keys(this.results[0]);
        }
        /*let obj={
         VendorID:'TOTAL'
         };
         for(var i=0;i<this.vendorKeys.length-1;i++)
         {
         obj[this.vendorKeys[i]]=_.map(this.results,this.vendorKeys[i]).reduce(this.add, 0);
         }
         this.totals.push(obj);*/
        if(report&&report.data)
          this.totals.push(report.data['TOTAL'])
        this.columns=report.columns;
        this.isDisplay=true;
        this.isFailure=false;
        this.isSuccess=true;
      }, error =>  {
        this.isDisplay=true;
        this.isFailure=true;
        this.isSuccess=false;
        this.hideReportForm = true;
      });

  }

  removeCurrency(values) {
    let _values = [];
    values.forEach(function(value) {
      _values.push(Number(value.substring(1, value. length)));
    });
    return _values;
  }

  generateChart(report:any) {

    let _report = _.cloneDeep(report);
    let columns = _report.columns || [];
    columns.splice(_report.columns.length - 1, 1);


    let keys=Object.keys(_report.data);
    let series:any = [];
    for (let key of keys) {
      if(key!='TOTAL') {
        let vendor = _report.data[key];
        let vendorId = vendor['VendorID'];
        delete vendor['TOTAL'];
        delete vendor['VendorID'];
        let values = Object.values(vendor);
        values = this.removeCurrency(values);
        let current = values.pop();
        values.splice(0, 0, current);
        series.push({
          name : vendorId,
          data : values
        });
      }
    }

    this.reportChartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'AP Aging Report'
      },
      xAxis: {
        categories: columns
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total Amount'
        },
        stackLabels: {
          enabled: true,
          format: '${total}',
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
          }
        }
      },
      legend: {
        align: 'right',
        x: -30,
        verticalAlign: 'top',
        y: 25,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: ${point.y}<br/>Total: ${point.stackTotal}'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
            format: '${y}',
            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
          }
        }
      },
      series: series
    }
  }

  add(a,b){
    return a+b;
  }
  resetData(){
    this.totals=[];
    this.results=[];
  }

  exportToPDF(){
    var pdfReq = this.reportReq;
    pdfReq["applicationName"]="payments";
    pdfReq["reportName"]="aging";
    pdfReq["reportType"]="pdf";
    pdfReq["sendEmail"]="false";
    pdfReq["Authorization"]="Bearer "+Session.get('token');
    pdfReq["userId"]=this.user.id;
    pdfReq["companyId"]=pdfReq.company;
    pdfReq["fileName"]="test.pdf";
    var xhr = new XMLHttpRequest();
    xhr.open('POST', PATH.PDF_CREATE_SERVICE, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      if (this.status == 200) {
        var blob=new Blob([this.response], {type:"application/pdf"});
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link.download="AgingReport_"+new Date()+".pdf";
        link.click();
      }
    };
    xhr.send(JSON.stringify(pdfReq));
    jQuery('#example-dropdown').foundation('close');
  }
  showReportDetails(col,res,isAllVendors){
    var fromDate,toDate,vendorsList=[];
    let req={};
    let filters=[];
    let dates=[];
    if(this.reportResponse){
      if(col=='TOTAL'){
        toDate=Number(this.reportResponse.metadata.dateRanges['Current'].split('-')[0]);
        fromDate=Number(this.reportResponse.metadata.dateRanges[this.reportResponse.columns[this.reportResponse.columns.length-2]].split('-')[1]);
      }else{
        fromDate=Number(this.reportResponse.metadata.dateRanges[col].split('-')[0]);
        toDate=Number(this.reportResponse.metadata.dateRanges[col].split('-')[1]);
      }
    }
    if(isAllVendors){
      vendorsList=Object.keys(this.reportResponse.data);
    }else {
      vendorsList.push(res.VendorID)
    }

    dates.push(fromDate);
    dates.push(toDate);
    let dateFilter={
      operator: "BETWEEN",
      values:dates,
      filterName: "dueDateLong"
    };
    let nameFilter={
      operator: "=",
      values: vendorsList,
      filterName: "vendorName"
    };
    let stateFilter={
      "operator": "!=",
      "values": [
        "paid"
      ],
      "filterName": "currentState"
    };
    filters.push(dateFilter);
    filters.push(nameFilter);
    filters.push(stateFilter);
    req={
      filters:filters
    };
    this.reportService.getBillDetails(req,this.reportReq.company).subscribe(report  =>{
      jQuery(this.drillDown.nativeElement).foundation('open');
      this.billsList=report;
    },err =>{

    });
  }
  exportToExcel(){
    var finalObj = this.reportReq;
    finalObj["applicationName"]="payments";
    finalObj["reportName"]="aging";
    finalObj["reportType"]="excel";
    finalObj["sendEmail"]="false";
    finalObj["Authorization"]="Bearer "+Session.get('token');
    finalObj["userId"]=this.user.id;
    finalObj["companyId"]=finalObj.company;
    finalObj["fileName"]="test.excel";
    var xhr = new XMLHttpRequest();
    xhr.open('POST', PATH.JAVA_SERVICE_URL+PATH.EXCEL_SERVICE, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      if (this.status == 200) {
        var blob=new Blob([this.response], {type:"application/vnd.ms-excel"});
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link['download']="AgingReport_"+new Date()+".xls";
        link.click();
      }
    };
    xhr.send(JSON.stringify(finalObj));


    jQuery('#example-dropdown').foundation('close');
  }
  styleToObject(cell:any){
    let styleObj = {};
    let requiredStyleAttr = ['background-color','text-decoration','font-weight','color','font-size'];
    if(cell.length>0){
      requiredStyleAttr.forEach(function(styleAttr){
        styleObj[styleAttr] = cell.css(styleAttr);
      });
    }
    return styleObj;
  }

  goTOBillDetailsPage(bill){
    jQuery(this.drillDown.nativeElement).foundation('close');
    var selectedTab;
    if(bill.currentState=='entry'){
      selectedTab=0;
    }else if (bill.currentState=='approve'){
      selectedTab=1;
    }else if(bill.currentState=='payee'){
      selectedTab=2;
    }else{
      selectedTab=3;
    }
    let link = ['BillEntry', {id: bill.id, companyId: bill.companyID,tabId:selectedTab}];
    this._router.navigate(link);
  }

  toggleView(event:any){
    /*
     * Todo: need to convert this into directive if UI is approved, need event handling
     * */
    this.graphTabView = !this.graphTabView;
    var target = event.target || event.srcElement || event.currentTarget;
    jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");

  }


}
