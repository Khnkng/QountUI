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
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Reports_service_1 = require("../services/Reports.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var forms_1 = require("@angular/forms");
var Session_1 = require("qCommon/app/services/Session");
var core_1 = require("@angular/core");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Email_service_1 = require("../services/Email.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var payments_constants_1 = require("../constants/payments.constants");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var VendorPaidUnpaidBills = (function () {
    function VendorPaidUnpaidBills(_router, companyService, emailService, _toastService, emailBuilder, reportService, switchBoard, titleService, stateService) {
        var _this = this;
        this._router = _router;
        this.companyService = companyService;
        this.emailService = emailService;
        this._toastService = _toastService;
        this.emailBuilder = emailBuilder;
        this.reportService = reportService;
        this.switchBoard = switchBoard;
        this.titleService = titleService;
        this.stateService = stateService;
        this.graphTabView = false;
        this.companies = [];
        this.report = {};
        this.periods = ['This Month', 'This Quarter', 'This Year', 'Last Month', 'Last Quarter', 'Custom'];
        this.displayCurrency = 'USD';
        this.columns = [];
        this.results = [];
        this.headerArry = [];
        this.company = null;
        this.reportPeriod = null;
        this.displayDate = null;
        this.companyName = null;
        this.isDisplay = false;
        this.isSuccess = false;
        this.isFailure = false;
        this.totals = [];
        this.companyCurrency = 'USD';
        this.hasDifferentCurrencyBills = false;
        this.showInRed = false;
        this.showEmail = false;
        this.emailAddress = [];
        this.user = [];
        this.hideReportForm = false;
        this.activeTab = "detailReport";
        this.allSections = { showReportForm: true, showTabber: false, showBills: false };
        this.groupBy = [];
        this.headerColumns = [];
        this.titleService.setPageTitle("BILLS AND PAYMENTS DETAIL");
        this.emailForm = emailBuilder.group({
            Toaddress: ["", forms_1.Validators.required],
            EmailBody: [""],
            cc: [""],
            Emailsubject: [""]
        });
        this.switchBoard.onFetchCompanies.subscribe(function (companies) { return _this.setAllCompanies(companies); });
        this.user = Session_1.Session.get('user');
        this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(function (data) {
            _this.generateReport(data);
            _this.setActiveTab('summary');
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    VendorPaidUnpaidBills.prototype.backToSearch = function () {
        this.hideReportForm = false;
    };
    VendorPaidUnpaidBills.prototype.ngOnDestroy = function () {
        this.reportSubscription.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    VendorPaidUnpaidBills.prototype.exportToExcel = function () {
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "payments";
        finalObj["reportName"] = "vendorBalance";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.get('token');
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "Bills And Payment Detail Report_" + this.companyName + "_" + this.displayDate + ".excel";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Qount_constants_1.PATH.JAVA_SERVICE_URL + payments_constants_1.PAYMENTSPATHS.EXCEL_SERVICE, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/vnd.ms-excel" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link['download'] = "Aging_Vendor_Balance_" + new Date() + ".xls";
                link.click();
            }
        };
        xhr.send(JSON.stringify(finalObj));
        jQuery('#example-dropdown').foundation('close');
    };
    VendorPaidUnpaidBills.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color', 'font-size'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    VendorPaidUnpaidBills.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "vendorBalance";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.get('token');
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "Bills And Payment Detail Report_" + this.companyName + "_" + this.displayDate + ".pdf";
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
    VendorPaidUnpaidBills.prototype.handleError = function (error) {
    };
    VendorPaidUnpaidBills.prototype.exportToPDF = function () {
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
            link[0].download = "Bills and Payment Detail report " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    VendorPaidUnpaidBills.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    VendorPaidUnpaidBills.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    VendorPaidUnpaidBills.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Vendor Paid Unpaid Bills\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Vendor Paid Unpaid Bills';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    VendorPaidUnpaidBills.prototype.printDiv = function () {
        window.print();
    };
    VendorPaidUnpaidBills.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    VendorPaidUnpaidBills.prototype.populateCustomizationValues = function (customObj) {
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
    VendorPaidUnpaidBills.prototype.isNegativeValue = function (value, column) {
        if (column == 'AmountInBillCurrency' || column == 'AmountInCompanyCurrency' || column == 'BalanceInBillCurrency' || column == 'BalanceInCompanyCurrency') {
            if (value && value.indexOf('-') != -1 && this.showInRed) {
                return true;
            }
        }
    };
    VendorPaidUnpaidBills.prototype.generateReport = function (data) {
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
        if (report.daysPerAgingPeriod && report.numberOfPeriods && report.asOfDate)
            this.reportService.generateReport(report).subscribe(function (report) {
                _this.hideReportForm = true;
                _this.resetData();
                _this.stateService.addState(new State_1.State('showReportForm', _this._router.url, null, null));
                _this.resetSections("showTabber");
                _this.vendorBillDetails = report.data;
                _this.columns = report.columns;
                _this.headerColumns = _.cloneDeep(report.columns);
                _this.groupBy = Object.keys(report.data);
                if (_this.headerColumns && _this.headerColumns.indexOf('AmountInBillCurrency') != -1) {
                    _this.headerColumns.splice(_this.headerColumns.indexOf('AmountInBillCurrency'), 1, "Amount <br> (Bill Currency)");
                }
                if (_this.headerColumns && _this.headerColumns.indexOf('BalanceInBillCurrency') != -1) {
                    _this.headerColumns.splice(_this.headerColumns.indexOf('BalanceInBillCurrency'), 1, "Balance <br> (Bill Currency)");
                }
                if (_this.headerColumns && _this.headerColumns.indexOf('AmountInCompanyCurrency') != -1) {
                    _this.headerColumns.splice(_this.headerColumns.indexOf('AmountInCompanyCurrency'), 1, "Amount <br> (Company Currency)");
                }
                if (_this.headerColumns && _this.headerColumns.indexOf('BalanceInCompanyCurrency') != -1) {
                    _this.headerColumns.splice(_this.headerColumns.indexOf('BalanceInCompanyCurrency'), 1, "Balance <br> (Company Currency)");
                }
                _this.company = report.metadata.header;
                _this.headerSet = _this.company;
                _this.headerArry = _this.headerSet.split('\n');
                _this.actualCompany = _this.headerArry[0];
                _this.actualReport = _this.headerArry[1];
                _this.companyName = data.customizationObj.customizations.includeCompanyName ? data.customizationObj.customizations.customCompanyName : _this.actualCompany;
                _this.reportName = data.customizationObj.customizations.includeReportTitle ? data.customizationObj.customizations.reportTitle : _this.actualReport;
                _this.reportPeriod = data.customizationObj.customizations.includeReportPeriod ? _this.displayDate : "";
                _this.hasDifferentCurrencyBills = report.hasDifferentCurrencyBills;
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
    VendorPaidUnpaidBills.prototype.resetData = function () {
        this.totals = [];
        this.results = [];
    };
    VendorPaidUnpaidBills.prototype.setAsOfDate = function (val) {
        this.report.asOfDate = val;
    };
    VendorPaidUnpaidBills.prototype.setEndDate = function (val) {
        this.report.endDate = val;
    };
    VendorPaidUnpaidBills.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    VendorPaidUnpaidBills.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    VendorPaidUnpaidBills.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    VendorPaidUnpaidBills.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    VendorPaidUnpaidBills.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            this.resetSections(prevState.key);
        }
    };
    VendorPaidUnpaidBills.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    return VendorPaidUnpaidBills;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], VendorPaidUnpaidBills.prototype, "reportMail", void 0);
VendorPaidUnpaidBills = __decorate([
    core_1.Component({
        selector: 'vendor-paid-unpaid-bills',
        templateUrl: '/app/views/VendorPaidUnpaidBills.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Companies_service_1.CompaniesService, Email_service_1.EmailService,
        Toast_service_1.ToastService, forms_1.FormBuilder, Reports_service_1.ReportService,
        SwitchBoard_1.SwitchBoard, PageTitle_1.pageTitleService, StateService_1.StateService])
], VendorPaidUnpaidBills);
exports.VendorPaidUnpaidBills = VendorPaidUnpaidBills;
