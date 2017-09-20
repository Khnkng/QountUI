"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Email_service_1 = require("../services/Email.service");
var Excel_service_1 = require("../services/Excel.service");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Reports_service_1 = require("../services/Reports.service");
var Session_1 = require("qCommon/app/services/Session");
var payments_constants_1 = require("../constants/payments.constants");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var BillPaymentHistory = (function () {
    function BillPaymentHistory(_router, reportService, excelService, _toastService, emailService, switchBoard, emailBuilder, titleService, stateService) {
        var _this = this;
        this._router = _router;
        this.reportService = reportService;
        this.excelService = excelService;
        this._toastService = _toastService;
        this.emailService = emailService;
        this.switchBoard = switchBoard;
        this.emailBuilder = emailBuilder;
        this.titleService = titleService;
        this.stateService = stateService;
        this.graphTabView = false;
        this.report = {};
        this.displayCurrency = 'USD';
        this.displayDate = null;
        this.companyName = null;
        this.headerArry = [];
        this.company = null;
        this.reportPeriod = null;
        this.isDisplay = false;
        this.isSuccess = false;
        this.isFailure = false;
        this.companyCurrency = 'USD';
        this.hasDifferentCurrencyBills = false;
        this.showInRed = false;
        this.emailAddress = [];
        this.showEmail = false;
        this.user = [];
        this.hideReportForm = false;
        this.columns = [];
        this.activeTab = "summary";
        this.allSections = { showReportForm: true, showTabber: false, showBills: false };
        this.titleService.setPageTitle("BILL PAYMENT HISTORY");
        this.emailForm = emailBuilder.group({
            Toaddress: ["", forms_1.Validators.required],
            EmailBody: [""],
            cc: [""],
            Emailsubject: [""]
        });
        this.switchBoard.onFetchCompanies.subscribe(function (companies) { return _this.setAllCompanies(companies); });
        this.user = Session_1.Session.get('user');
        this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(function (reportRequest) {
            _this.generateReport(reportRequest);
            _this.setActiveTab('summary');
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    BillPaymentHistory.prototype.backToSearch = function () {
        this.hideReportForm = false;
    };
    BillPaymentHistory.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Bill Payment History\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Bill Payment History';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    BillPaymentHistory.prototype.doEmail = function (event) {
        var _this = this;
        var emailJson = {};
        emailJson["recipients"] = jQuery('#Toaddress').tagit("assignedTags");
        emailJson["cc_recipients"] = jQuery('#cc').tagit("assignedTags");
        emailJson["subject"] = this.emailForm.value.Emailsubject;
        emailJson["reportName"] = this.reportName;
        emailJson["companyName"] = this.companyName;
        emailJson["userName"] = this.user.first_name + " " + this.user.last_name;
        emailJson["mailBodyContentType"] = "text/html";
        var emailReq = this.reportReq;
        emailReq["applicationName"] = "payments";
        emailReq["reportName"] = "paymentHistory";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.get('token');
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "Bills Payment History Report_" + this.companyName + "_" + this.displayDate + ".pdf";
        emailReq["sendEmail"] = "true";
        emailReq["emailJson"] = emailJson;
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.PDF_CREATE_SERVICE, emailReq)
            .subscribe(function (data) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Email Sent Successfully");
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Send Email");
        });
        jQuery("#Toaddress, #cc").tagit("removeAll");
        this.showEmail = false;
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is A/P Aging Summary\n\nRegards,\n';
        EmailBodyText += (this.user.firstName + " " + this.user.lastName);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your A/P Aging Summary';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    BillPaymentHistory.prototype.ngOnDestroy = function () {
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    BillPaymentHistory.prototype.handleError = function (error) {
    };
    BillPaymentHistory.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    BillPaymentHistory.prototype.printDiv = function () {
        window.print();
    };
    BillPaymentHistory.prototype.exportToExcel = function () {
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "payments";
        finalObj["reportName"] = "paymentHistory";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.get('token');
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "Bills Payment History Report_" + this.companyName + "_" + this.displayDate + ".excel";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Qount_constants_1.PATH.JAVA_SERVICE_URL + payments_constants_1.PAYMENTSPATHS.EXCEL_SERVICE, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/vnd.ms-excel" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link['download'] = "Aging_Payment_History_" + new Date() + ".xls";
                link.click();
            }
        };
        xhr.send(JSON.stringify(finalObj));
        jQuery('#example-dropdown').foundation('close');
    };
    BillPaymentHistory.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color', 'font-size'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    BillPaymentHistory.prototype.exportToPDF = function () {
        var _this = this;
        var html = jQuery('<div>').append(jQuery('style').clone()).append(jQuery('#numeric').clone()).html();
        var pdfReq = {
            "version": "1.1",
            "genericReport": {
                "payload": html,
                "footer": moment(new Date()).format("MMMM DD, YYYY HH:mm a")
            }
        };
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.PDF_SERVICE, pdfReq)
            .subscribe(function (data) {
            var blob = new Blob([data._body], { type: "application/pdf" });
            var link = jQuery('<a></a>');
            link[0].href = URL.createObjectURL(blob);
            link[0].download = "Bill Payment History " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    BillPaymentHistory.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    BillPaymentHistory.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    BillPaymentHistory.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        // this.companyName = customObj.customizations.includeCompanyName? customObj.customizations.customCompanyName: "";
        // this.reportName = customObj.customizations.includeReportTitle? customObj.customizations.reportTitle: "";
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
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
    BillPaymentHistory.prototype.isNegativeValue = function (value, column) {
        if (column == 'Paid Amount' || column == 'Original Amount') {
            if (value && value.indexOf('-') != -1 && this.showInRed) {
                return true;
            }
        }
    };
    BillPaymentHistory.prototype.generateReport = function (data) {
        var _this = this;
        var report = data.report;
        this.reportReq = report;
        this.populateCustomizationValues(data.customizationObj);
        report.daysPerAgingPeriod = 1;
        report.numberOfPeriods = 1;
        this.displayDate = moment(report.asOfDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        this.displayEndDate = moment(report.endDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        // this.companyName=report.company;
        report.companyCurrency = _.find(this.allCompanies, { 'id': report.companyID }).defaultCurrency;
        this.companyCurrency = report.companyCurrency;
        if (report.asOfDate)
            this.reportService.generateReport(report).subscribe(function (report) {
                _this.hideReportForm = true;
                _this.company = report.metadata.header;
                _this.headerSet = _this.company;
                _this.headerArry = _this.headerSet.split('\n');
                _this.actualCompany = _this.headerArry[0];
                _this.actualReport = _this.headerArry[1];
                _this.companyName = data.customizationObj.customizations.includeCompanyName ? data.customizationObj.customizations.customCompanyName : _this.actualCompany;
                _this.reportName = data.customizationObj.customizations.includeReportTitle ? data.customizationObj.customizations.reportTitle : _this.actualReport;
                _this.reportPeriod = data.customizationObj.customizations.includeReportPeriod ? _this.displayDate : "";
                _this.resetData();
                _this.results = report.bills;
                _this.columns = report.columns;
                _this.isDisplay = true;
                _this.isFailure = false;
                _this.isSuccess = true;
                _this.stateService.addState(new State_1.State('showReportForm', _this._router.url, null, null));
                _this.resetSections("showTabber");
            }, function (error) {
                _this.hideReportForm = true;
                _this.isDisplay = true;
                _this.isFailure = true;
                _this.isSuccess = false;
            });
    };
    BillPaymentHistory.prototype.resetData = function () {
        this.results = [];
    };
    BillPaymentHistory.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    BillPaymentHistory.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    BillPaymentHistory.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    BillPaymentHistory.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    BillPaymentHistory.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            this.resetSections(prevState.key);
        }
    };
    BillPaymentHistory.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    return BillPaymentHistory;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], BillPaymentHistory.prototype, "reportMail", void 0);
BillPaymentHistory = __decorate([
    core_1.Component({
        selector: 'reports',
        templateUrl: '/app/views/billPaymantHistory.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Reports_service_1.ReportService, Excel_service_1.ExcelService,
        Toast_service_1.ToastService, Email_service_1.EmailService, SwitchBoard_1.SwitchBoard,
        forms_1.FormBuilder, PageTitle_1.pageTitleService, StateService_1.StateService])
], BillPaymentHistory);
exports.BillPaymentHistory = BillPaymentHistory;
