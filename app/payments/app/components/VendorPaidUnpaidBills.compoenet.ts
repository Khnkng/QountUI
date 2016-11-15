import {Router} from "@angular/router";
import {Focus} from "qCommon/app/directives/focus.directive";
import {Ripple} from "qCommon/app/directives/rippler.directive";
import {CustomTags} from "qCommon/app/directives/customTags";
import {FoundationInit} from "qCommon/app/directives/foundation.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {CustomDatepicker} from "../directives/customDatepicker";
import {ReportsSearchCriteriaComponent} from "./ReportSearchCriteria.component";
import {ReportService} from "../services/Reports.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {FormBuilder, Validators} from "@angular/forms";
import {Session} from "qCommon/app/services/Session";
import {Component,ViewChild} from "@angular/core";
import {PATH} from "qCommon/app/constants/Qount.constants";
import {EmailService} from "../services/Email.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
declare var _:any;
declare var moment:any;
declare var jQuery:any;
@Component({
  selector: 'reports',
  templateUrl: '/app/views/VendorPaidUnpaidBills.html'
})

export class VendorPaidUnpaidBills {
  companies:any=[];
  report:any={};
  periods:any=['This Month','This Quarter','This Year','Last Month','Last Quarter','Custom'];
  displayCurrency:string='USD';
  printmode:boolean;
  columns:any=[];
  results:Array<any>=[];
  displayDate:string=null;
  companyName:string=null;
  apAgingReportLogoUrl:string;
  isDisplay:boolean=false;
  isSuccess:boolean=false;
  emailForm:any;
  isFailure:boolean=false;
  totals:Array<any>=[];
  companyCurrency:string='USD';
  vendorBillDetails:any;
  allCompanies:any;
  hasDifferentCurrencyBills:boolean=false;
  displayEndDate:string;

  customObj:any;
  reportName:string;
  datePrepared: string;
  timePrepared: string;
  showInRed:boolean = false;
  showEmail:boolean=false;
  reportSubscription:any;
  emailAddress:any=[];
  user:any=[];
  hideReportForm:boolean=false;
  @ViewChild('reportMail') reportMail;
  constructor(private _router: Router,private companyService: CompaniesService,private emailService:EmailService,private _toastService: ToastService,private emailBuilder: FormBuilder, private reportService: ReportService, private switchBoard: SwitchBoard) {
    this.emailForm = emailBuilder.group({
      Toaddress: ["", Validators.required],
      EmailBody:[""],
      cc:[""],
      Emailsubject:[""]
    });
    this.switchBoard.onFetchCompanies.subscribe(companies => this.setAllCompanies(companies));
    this.user=Session.get('user');
    this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(data => this.generateReport(data));
  }
  backToSearch(){
    this.hideReportForm = false;
  }

  ngOnDestroy(){
    this.reportSubscription.unsubscribe();
  }

  exportToExcel(){
    let finalObj = this.convertTabletoJSON('.ap-aging-report-heading', '#ap-aging-report-table');

    /*this.excelService.excel(finalObj).subscribe(excelResp  => {
     console.log("excelResp",excelResp);
     if(excelResp.status = 200){
     var blob=new Blob([excelResp._body], {type:"application/vnd.ms-excel"});
     var link=document.createElement('a');
     link.href=window.URL.createObjectURL(blob);
     link.click();
     }


     }, error =>  this.handleError(error));*/
    var xhr = new XMLHttpRequest();
    xhr.open('POST', PATH.JAVA_SERVICE_URL+PATH.EXCEL_SERVICE, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      if (this.status == 200) {
        var blob=new Blob([this.response], {type:"application/vnd.ms-excel"});
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link['download']="ApReport_"+new Date()+".xls";
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
  convertTabletoJSON(headerSelector:string, selector:string){
    var self= this, totalNumOfColumns = 0;
    let $header = jQuery(headerSelector);
    let $this = jQuery(selector);
    var finalObj = {};
    let rowCount = 0;
    let combinedHeaderText="", headerStyle;
    if($header.length!=0){

      $header.each(function( thr ) {

        let $cell = jQuery(this),
          styleObj = self.styleToObject($cell);
        combinedHeaderText += $cell.text() +"\n";
        headerStyle = styleObj;

      });
      let rowObj = {}, tdObj = {};
      rowObj['row0'] = {};
      tdObj['cell0'] = {'text':combinedHeaderText, 'style': headerStyle, 'cellsToMerge':null};
      finalObj['row0'] = tdObj;
      rowCount++;
    }
    if($this.length!=0){
      /*element exists in DOM */
      $this.find('thead > tr').each(function( tri ) {
        let rowObj = {};
        rowObj['row'+rowCount] = {};
        let tdObj = {};
        jQuery(this).find('th').each(function( tdi ) {
          totalNumOfColumns++;
          let $cell = jQuery(this),
            colspan = $cell.attr('colspan'),
            styleObj = self.styleToObject($cell);
          tdObj['cell'+tdi] = {'text':jQuery(this).text().trim(), 'style': styleObj, 'cellsToMerge':tdi+"-"+colspan?colspan:null};
          //rowObj['row'+rowCount]['cell'+tdi] = {'text':jQuery(this).text()};
        });
        finalObj['row'+rowCount] = tdObj;
        rowCount++;
      });
      $this.find('tbody > tr').each(function( tri ) {
        let rowObj = {};
        rowObj['row'+rowCount] = {};
        let tdObj = {};
        /* new row for each table header row*/

        jQuery(this).find('td').each(function( tdi ) {
          let $cell = jQuery(this),
            colspan = $cell.attr('colspan'),
            styleObj = self.styleToObject($cell);
          tdObj['cell'+tdi] = {'text':jQuery(this).text().trim(), 'style': styleObj, 'cellsToMerge':tdi+"-"+colspan?colspan:null};
          //rowObj['row'+rowCount].push(tdObj);
          //rowObj['row'+rowCount]['cell'+tdi] = {'text':jQuery(this).text()};
        });
        finalObj['row'+rowCount] = tdObj;
        rowCount++;
      });
    }
    if($header.length!=0){
      /* if header present and rows present calculate colspan from rows*/
      finalObj['row0']['cell0'].cellsToMerge = "0-"+totalNumOfColumns;
    }
    return finalObj;


  }
  doEmail(event){
    let req = {};
    //req['Toaddress'] = jQuery('#Toaddress').tagit("assignedTags");
    //req['EmailBody']=this.emailForm.value.EmailBody;
    //req['cc']=jQuery('#cc').val(this.user.id).tagit("assignedTags");
    //req['Emailsubject']=this.emailForm.value.Emailsubject;
    console.log("cccc",jQuery('#cc').val(this.user.id).tagit("assignedTags"));
    var emailJson={};
    emailJson["Toaddress"]=jQuery('#Toaddress').tagit("assignedTags");
    emailJson["cc"]=jQuery('#cc').val(this.user.id).tagit("assignedTags");
    emailJson["Emailsubject"]=this.emailForm.value.Emailsubject;
    emailJson["EmailBody"]=this.emailForm.value.EmailBody;
    //emailJson["Cc"]=jQuery('#cc').val(this.user.id).tagit("assignedTags");
    req["emailJson"] = JSON.stringify(emailJson);
    req['sendEmail']=true;
    req['fileName']="Ap Aging Summary.pdf";
    var company = jQuery("#company option:selected").text();
    jQuery("#logoImg").attr("src",this.apAgingReportLogoUrl);
    this.apAgingReportLogoUrl = "https://dev-services.qount.io/DocumentServices/"+this.user.id+"/preview/file?location=dev-qount-dochub/"+this.user.id+"/MyCompanies/"+company+"/Logo&fileName=logo.png&token="+Session.get('token');
    //wrapping footer with centter for pdf support
    var reportElem = jQuery("#displayReport");
    reportElem.wrapInner("<center></center>");
    var pdfHtmlStr = "<html><head><style>.columns,table{min-width:initial}@page{size:A4 landscape}thead{background:#f8f8f8 }td,th{line-height:30px;text-align:left}.report-heading{text-align:center;font-size:20px;color:#282895 ;font-weight:700}.display-report{border:1px solid #e3e5e5 ;text-align:center;padding-top:10px}.report-table tr td{border-top:1px solid #0a4b3e ;border-bottom:1px solid #0a4b3e }table{width:100%;margin-bottom:16px;border-radius:3px;border-collapse:collapse;border-spacing:0;display:table;border-color:grey}tr.last td{border-top:1px solid #0a4b3e ;border-bottom:1px solid #0a4b3e }</style></head><body>";
    pdfHtmlStr += reportElem.html().toString().replace(/\"/g,"'").replace(/\"/g,"'").replace(/(<img\b[^<>]*[^<>\/])>/ig, "$1 />");
    pdfHtmlStr += "</body></html>";
    req['htmlContent'] = pdfHtmlStr;
    this.emailService.email(req).subscribe(emailResp  => {
    }, error =>  this.handleError(error));
    this._toastService.pop(TOAST_TYPE.success, "Email sent successfully");
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
  exportToPDF(){
    var company = jQuery("#company option:selected").text();
    this.apAgingReportLogoUrl = "https://dev-services.qount.io/DocumentServices/"+this.user.id+"/preview/file?location=dev-qount-dochub/"+this.user.id+"/MyCompanies/"+company+"/Logo&fileName=logo.png&token="+Session.get('token');
    //wrapping footer with centter for pdf support
    var reportElem = jQuery("#displayReport");
    reportElem.wrapInner("<center></center>");
    jQuery("#logoImg").attr("src",this.apAgingReportLogoUrl);
    var pdfHtmlStr = "<html><head><style>.columns,table{min-width:initial}@page{size:A4 landscape}thead{background:#f8f8f8 }td,th{line-height:30px;text-align:left}.report-heading{text-align:center;font-size:20px;color:#282895 ;font-weight:700}.display-report{border:1px solid #e3e5e5 ;text-align:center;padding-top:10px}.report-table tr td{border-top:1px solid #0a4b3e ;border-bottom:1px solid #0a4b3e }table{width:100%;margin-bottom:16px;border-radius:3px;border-collapse:collapse;border-spacing:0;display:table;border-color:grey}tr.last td{border-top:1px solid #0a4b3e ;border-bottom:1px solid #0a4b3e }</style></head><body>";
    pdfHtmlStr += reportElem.html().toString().replace(/\"/g,"'").replace(/(<img\b[^<>]*[^<>\/])>/ig, "$1 />");
    //.replace("<img src='./images/logo.png' ng-reflect-hidden='true' hidden=''>","<img src='./images/logo.png' ng-reflect-hidden='true' hidden='' />").replace("width='20'>","width='20'/>");
    pdfHtmlStr +="</body></html>";
    var myCompany = jQuery("#CompanyName").text();
    var myReport = jQuery("#reportName").text();
    this.emailAddress=[this.user.id];
    console.log("emailAddress",JSON.stringify(this.user));
    console.log("token",Session.get('token'));
    var bodyJson = {
      htmlContent:pdfHtmlStr,
      fileName:"test.pdf"
    };
    var xhr = new XMLHttpRequest();
    xhr.open('POST', PATH.PDF_CREATE_SERVICE, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      if (this.status == 200) {
        var blob=new Blob([this.response], {type:"application/pdf"});
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link.download="ApReport_"+new Date()+".pdf";
        link.click();
      }
    };
    xhr.send(JSON.stringify(bodyJson));
    jQuery('#example-dropdown').foundation('close');
  }
  openemail(){
    this.showEmail=true;
    this.emailAddress=[this.user.id];
    jQuery(this.reportMail.nativeElement).foundation('open');
  }
  setAllCompanies(companies){
    this.allCompanies = companies;
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
  onChange(deviceValue) {
    document.getElementById("sucess").style.height = "400px"
    document.getElementById("sucess").style.width = "800px";
    if(deviceValue=='Potrait') {
      console.log(deviceValue);
      document.getElementById("sucess").style.height = "650px"
      document.getElementById("sucess").style.width = "900px";
    }
    else{
      document.getElementById("sucess").style.height = "700px"
      document.getElementById("sucess").style.width = "850px";
    }
  }
  printDiv() {
   window.print();
  }

  goToReport(){
    let link = ['Reports'];
    this._router.navigate(link);
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

  isNegativeValue(value,column){
    if(column=='AmountInBillCurrency'||column=='AmountInCompanyCurrency'||column=='BalanceInBillCurrency'||column=='BalanceInCompanyCurrency'){
      if(value&&value.indexOf('-')!=-1 && this.showInRed){
        return true;
      }
    }
  }

  groupBy:Array<string>=[];
  headerColumns:Array<string>=[];

  generateReport(data){
    let report = data.report;
    this.populateCustomizationValues(data.customizationObj);
    report.daysPerAgingPeriod=1;
    report.numberOfPeriods=1;
    this.displayDate=moment(report.asOfDate,'MM/DD/YYYY').format("MMMM DD, YYYY");
    this.displayEndDate=moment(report.endDate,'MM/DD/YYYY').format("MMMM DD, YYYY");
    this.companyName=report.company;
    report.companyCurrency=_.find(this.allCompanies,{'id': report.company}).defaultCurrency;
    this.companyCurrency=report.companyCurrency;
    if(report.daysPerAgingPeriod&&report.numberOfPeriods&&report.asOfDate)
      this.reportService.generateReport(report).subscribe(report  => {
        this.hideReportForm = true;
        this.resetData();
        this.vendorBillDetails=report.data;
        this.columns=report.columns;
        this.headerColumns=_.cloneDeep(report.columns);
        this.groupBy=Object.keys(report.data);
        if(this.headerColumns&&this.headerColumns.indexOf('AmountInBillCurrency')!=-1){
          this.headerColumns.splice(this.headerColumns.indexOf('AmountInBillCurrency'), 1, "Amount <br> (Bill Currency)");
        }
        if(this.headerColumns&&this.headerColumns.indexOf('BalanceInBillCurrency')!=-1){
          this.headerColumns.splice(this.headerColumns.indexOf('BalanceInBillCurrency'), 1, "Balance <br> (Bill Currency)");
        }
        if(this.headerColumns&&this.headerColumns.indexOf('AmountInCompanyCurrency')!=-1){
          this.headerColumns.splice(this.headerColumns.indexOf('AmountInCompanyCurrency'), 1, "Amount <br> (Company Currency)");
        }
        if(this.headerColumns&&this.headerColumns.indexOf('BalanceInCompanyCurrency')!=-1){
          this.headerColumns.splice(this.headerColumns.indexOf('BalanceInCompanyCurrency'), 1, "Balance <br> (Company Currency)");
        }

        this.hasDifferentCurrencyBills=report.hasDifferentCurrencyBills;
        this.isDisplay=true;
        this.isFailure=false;
        this.isSuccess=true;
      }, error =>  {
        this.hideReportForm = true;
        this.isDisplay=true;
        this.isFailure=true;
        this.isSuccess=false;
      });
  }
  resetData(){
    this.totals=[];
    this.results=[];
  }
  setAsOfDate(val){
    this.report.asOfDate=val;
  }
  setEndDate(val){
    this.report.endDate=val;
  }
}
