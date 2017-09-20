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
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Reports_service_1 = require("../services/Reports.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Session_1 = require("qCommon/app/services/Session");
var Email_service_1 = require("../services/Email.service");
var Excel_service_1 = require("../services/Excel.service");
var core_1 = require("@angular/core");
var payments_constants_1 = require("../constants/payments.constants");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var ForeignCurrencyReport = (function () {
    function ForeignCurrencyReport(_router, reportService, switchBoard, emailService, excelService, emailBuilder, _toastService, titleService, stateService) {
        var _this = this;
        this._router = _router;
        this.reportService = reportService;
        this.switchBoard = switchBoard;
        this.emailService = emailService;
        this.excelService = excelService;
        this.emailBuilder = emailBuilder;
        this._toastService = _toastService;
        this.titleService = titleService;
        this.stateService = stateService;
        this.graphTabView = false;
        this.report = {};
        this.displayCurrency = 'USD';
        this.columns = [];
        this.headerArry = [];
        this.company = null;
        this.reportPeriod = null;
        this.displayDate = null;
        this.companyName = null;
        this.isDisplay = false;
        this.isSuccess = false;
        this.isFailure = false;
        this.companyCurrency = 'USD';
        this.hasDifferentCurrencyBills = false;
        this.showEmail = false;
        this.showInRed = false;
        this.emailAddress = [];
        this.user = [];
        this.hideReportForm = false;
        this.activeTab = "summary";
        this.allSections = { showReportForm: true, showTabber: false, showBills: false };
        this.titleService.setPageTitle("FOREIGN CURRENCY REPORT");
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
    ForeignCurrencyReport.prototype.backToSearch = function () {
        this.hideReportForm = false;
    };
    ForeignCurrencyReport.prototype.exportToExcel = function () {
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "payments";
        finalObj["reportName"] = "gainloss";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.get('token');
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "Foreign Currency Report_" + this.companyName + "_" + this.displayDate + ".excel";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Qount_constants_1.PATH.JAVA_SERVICE_URL + payments_constants_1.PAYMENTSPATHS.EXCEL_SERVICE, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/vnd.ms-excel" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link['download'] = "Aging_Gainloss_" + new Date() + ".xls";
                link.click();
            }
        };
        xhr.send(JSON.stringify(finalObj));
        jQuery('#example-dropdown').foundation('close');
    };
    ForeignCurrencyReport.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color', 'font-size'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    ForeignCurrencyReport.prototype.exportToPDF = function () {
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
            link[0].download = "Foreign Currency Report " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    ForeignCurrencyReport.prototype.ngOnDestroy = function () {
        this.reportSubscription.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    ForeignCurrencyReport.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Foreign Currency Report\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Foreign Currency Report';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    ForeignCurrencyReport.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    ForeignCurrencyReport.prototype.printDiv = function (divName) {
        window.print();
    };
    ForeignCurrencyReport.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "gainloss";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.get('token');
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "Foreign Currency Report_" + this.companyName + "_" + this.displayDate + ".pdf";
        emailReq["sendEmail"] = "true";
        emailReq["emailJson"] = emailJson;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', payments_constants_1.PAYMENTSPATHS.PDF_CREATE_SERVICE, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        var that = this;
        xhr.onload = function (e) {
            if (this.status == 200) {
                that._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Email sent sucessfully");
            }
        };
        xhr.send(JSON.stringify(emailReq));
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
    ForeignCurrencyReport.prototype.handleError = function (error) {
    };
    ForeignCurrencyReport.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    ForeignCurrencyReport.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    ForeignCurrencyReport.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        // this.companyName = customObj.customizations.includeCompanyName? customObj.customizations.customCompanyName: "";
        // this.reportName = customObj.customizations.includeReportTitle? customObj.customizations.reportTitle: "";
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    ForeignCurrencyReport.prototype.isNegativeValue = function (value, column) {
        if (column == 'Gain/Loss') {
            if (value && value.indexOf('-') != -1 && this.showInRed) {
                return true;
            }
        }
    };
    ForeignCurrencyReport.prototype.generateReport = function (data) {
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
                _this.stateService.addState(new State_1.State('showReportForm', _this._router.url, null, null));
                _this.resetSections("showTabber");
                _this.results = report.bills;
                _this.columns = report.columns;
                _this.isDisplay = true;
                _this.isFailure = false;
                _this.isSuccess = true;
            }, function (error) {
                _this.hideReportForm = true;
                _this.isDisplay = true;
                _this.isFailure = true;
                _this.isSuccess = false;
            });
    };
    ForeignCurrencyReport.prototype.resetData = function () {
        this.results = [];
    };
    ForeignCurrencyReport.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    ForeignCurrencyReport.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    ForeignCurrencyReport.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    ForeignCurrencyReport.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    ForeignCurrencyReport.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            this.resetSections(prevState.key);
        }
    };
    ForeignCurrencyReport.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    return ForeignCurrencyReport;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], ForeignCurrencyReport.prototype, "reportMail", void 0);
ForeignCurrencyReport = __decorate([
    core_1.Component({
        selector: 'foreign-currency-report',
        templateUrl: '/app/views/foreignCurrencyReport.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Reports_service_1.ReportService, SwitchBoard_1.SwitchBoard,
        Email_service_1.EmailService, Excel_service_1.ExcelService, forms_1.FormBuilder,
        Toast_service_1.ToastService, PageTitle_1.pageTitleService, StateService_1.StateService])
], ForeignCurrencyReport);
exports.ForeignCurrencyReport = ForeignCurrencyReport;
