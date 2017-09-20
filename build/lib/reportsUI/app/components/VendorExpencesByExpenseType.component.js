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
var forms_1 = require("@angular/forms");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Reports_service_1 = require("../services/Reports.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var core_1 = require("@angular/core");
var Session_1 = require("qCommon/app/services/Session");
var Excel_service_1 = require("../services/Excel.service");
var Email_service_1 = require("../services/Email.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var payments_constants_1 = require("../constants/payments.constants");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var VendorExpencesByExpenseType = (function () {
    function VendorExpencesByExpenseType(_router, emailService, excelService, _toastService, reportService, switchBoard, emailBuilder, titleService, stateService) {
        var _this = this;
        this._router = _router;
        this.emailService = emailService;
        this.excelService = excelService;
        this._toastService = _toastService;
        this.reportService = reportService;
        this.switchBoard = switchBoard;
        this.emailBuilder = emailBuilder;
        this.titleService = titleService;
        this.stateService = stateService;
        this.graphTabView = false;
        this.companies = [];
        this.report = {};
        this.headerArry = [];
        this.company = null;
        this.reportPeriod = null;
        this.periods = ['This Month', 'This Quarter', 'This Year', 'Last Month', 'Last Quarter', 'Custom'];
        this.displayCurrency = 'USD';
        this.columns = [];
        this.footer = null;
        this.results = [];
        this.displayDate = null;
        this.companyName = null;
        this.isDisplay = false;
        this.isSuccess = false;
        this.isFailure = false;
        this.totals = [];
        this.companyCurrency = 'USD';
        this.showEmail = false;
        this.showInRed = false;
        this.user = [];
        this.emailAddress = [];
        this.hideReportForm = false;
        this.groupBy = [];
        this.activeTab = "summary";
        this.allSections = { showReportForm: true, showTabber: false, showBills: false };
        this.titleService.setPageTitle("VENDOR EXPENSE BY EXPENSE TYPE");
        this.emailForm = emailBuilder.group({
            Toaddress: ["", forms_1.Validators.required],
            EmailBody: [""],
            cc: [""],
            Emailsubject: [""]
        });
        this.user = Session_1.Session.get('user');
        this.switchBoard.onFetchCompanies.subscribe(function (companies) { return _this.setAllCompanies(companies); });
        this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(function (data) {
            _this.generateReport(data);
            _this.setActiveTab('summary');
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    VendorExpencesByExpenseType.prototype.backToSearch = function () {
        this.hideReportForm = false;
    };
    VendorExpencesByExpenseType.prototype.ngOnDestroy = function () {
        this.reportSubscription.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    VendorExpencesByExpenseType.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Vendor Expense By Expense Type\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Vendor Expense By Expense Type';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    VendorExpencesByExpenseType.prototype.exportToExcel = function () {
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "payments";
        finalObj["reportName"] = "vendorExpenses";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.get('token');
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "Vendor Expenses By Expense Type Report_" + this.companyName + "_" + this.displayDate + ".excel";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Qount_constants_1.PATH.JAVA_SERVICE_URL + payments_constants_1.PAYMENTSPATHS.EXCEL_SERVICE, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/vnd.ms-excel" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link['download'] = "Aging_Vendor_Expenses_" + new Date() + ".xls";
                link.click();
            }
        };
        xhr.send(JSON.stringify(finalObj));
        jQuery('#example-dropdown').foundation('close');
    };
    VendorExpencesByExpenseType.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color', 'font-size'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    VendorExpencesByExpenseType.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    VendorExpencesByExpenseType.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "vendorExpenses";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.get('token');
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "Vendor Expenses By Expense Type Report_" + this.companyName + "_" + this.displayDate + ".pdf";
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
    VendorExpencesByExpenseType.prototype.printDiv = function () {
        window.print();
    };
    VendorExpencesByExpenseType.prototype.exportToPDF = function () {
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
            link[0].download = "Venodr Expenses by Type " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    VendorExpencesByExpenseType.prototype.handleError = function (error) {
    };
    VendorExpencesByExpenseType.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    VendorExpencesByExpenseType.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    VendorExpencesByExpenseType.prototype.isNegativeValue = function (value, column) {
        if (column == 'Debit') {
            if (value && value.indexOf('-') != -1 && this.showInRed) {
                return true;
            }
        }
    };
    VendorExpencesByExpenseType.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    VendorExpencesByExpenseType.prototype.generateReport = function (data) {
        var _this = this;
        var report = data.report;
        this.reportReq = report;
        this.populateCustomizationValues(data.customizationObj);
        report.daysPerAgingPeriod = 1;
        report.numberOfPeriods = 1;
        this.displayDate = moment(report.asOfDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        this.displayEndDate = moment(report.endDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        // this.companyName=report.company;
        this.reportPeriod = data.customizationObj.customizations.includeReportPeriod ? this.displayDate : "";
        report.companyCurrency = _.find(this.allCompanies, { 'id': report.companyID }).defaultCurrency;
        this.companyCurrency = report.companyCurrency;
        if (report.daysPerAgingPeriod && report.numberOfPeriods && report.asOfDate)
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
                _this.expenseDetails = report.data;
                _this.columns = report.columns;
                _this.groupBy = report.expenses;
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
    VendorExpencesByExpenseType.prototype.resetData = function () {
        this.totals = [];
        this.results = [];
    };
    VendorExpencesByExpenseType.prototype.setAsOfDate = function (val) {
        this.report.asOfDate = val;
    };
    VendorExpencesByExpenseType.prototype.setEndDate = function (val) {
        this.report.endDate = val;
    };
    VendorExpencesByExpenseType.prototype.getVendors = function (column) {
        return Object.keys(this.expenseDetails[column]);
    };
    VendorExpencesByExpenseType.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    VendorExpencesByExpenseType.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    VendorExpencesByExpenseType.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    VendorExpencesByExpenseType.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    VendorExpencesByExpenseType.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            this.resetSections(prevState.key);
        }
    };
    VendorExpencesByExpenseType.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    return VendorExpencesByExpenseType;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], VendorExpencesByExpenseType.prototype, "reportMail", void 0);
VendorExpencesByExpenseType = __decorate([
    core_1.Component({
        selector: 'vendor-expences-by-expense-type',
        templateUrl: '/app/views/vendorExpencesByExpenseType.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Email_service_1.EmailService, Excel_service_1.ExcelService,
        Toast_service_1.ToastService, Reports_service_1.ReportService, SwitchBoard_1.SwitchBoard,
        forms_1.FormBuilder, PageTitle_1.pageTitleService, StateService_1.StateService])
], VendorExpencesByExpenseType);
exports.VendorExpencesByExpenseType = VendorExpencesByExpenseType;
