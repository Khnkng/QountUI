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
var Excel_service_1 = require("../services/Excel.service");
var Email_service_1 = require("../services/Email.service");
var core_1 = require("@angular/core");
var Session_1 = require("qCommon/app/services/Session");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Reports_service_1 = require("../services/Reports.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var payments_constants_1 = require("../constants/payments.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var forms_1 = require("@angular/forms");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Qount_constants_2 = require("qCommon/app/constants/Qount.constants");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var HighChart_directive_1 = require("qCommon/app/directives/HighChart.directive");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var IncomeDetailStatementComponent = (function () {
    function IncomeDetailStatementComponent(_router, excelService, reportService, emailService, _toastService, switchBoard, emailBuilder, loadingService, stateService, dateFormater, numeralService, titleService) {
        var _this = this;
        this._router = _router;
        this.excelService = excelService;
        this.reportService = reportService;
        this.emailService = emailService;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.emailBuilder = emailBuilder;
        this.loadingService = loadingService;
        this.stateService = stateService;
        this.dateFormater = dateFormater;
        this.numeralService = numeralService;
        this.titleService = titleService;
        this.displayDate = null;
        this.companyName = null;
        this.company = null;
        this.isSuccess = false;
        this.isFailure = false;
        this.companyCurrency = 'USD';
        this.allCompanies = [];
        this.showInRed = false;
        this.showEmail = false;
        this.emailAddress = [];
        this.hideReportForm = false;
        this.columns = [];
        this.result = {};
        this.drillDownResults = [];
        this.categoryTypes = Qount_constants_2.COA_CATEGORY_TYPES;
        this.allSubTypes = Qount_constants_2.COA_SUBTYPES;
        this.showIncomeDetailsdiv = false;
        this.detailedtableData = {};
        this.detailedtableDataOptions = {};
        this.hasDetailedData = false;
        this.hasJornalDetailedData = false;
        this.JournaldetailedtableData = {};
        this.actualReport = 'Detailed Income Statement';
        this.RevenueType = '';
        this.chartColors = ['#44B6E8', '#18457B', '#00B1A9', '#F06459', '#22B473', '#384986', '#4554A4', '#808CC5'];
        this.rows = [];
        this.categoryData = { 'depreciation': 'Depreciation', 'payroll': 'Payroll', 'apBalance': 'AP balance', 'arBalance': 'AR balance', 'inventory': 'Inventory', 'credit': 'Credit', 'bill': 'Bill', 'billPayment': 'Payment', 'deposit': 'Deposit', 'expense': 'Expense', 'amortization': 'Amortization', 'openingEntry': 'Opening Entry', 'creditMemo': 'Credit Memo', 'cashApplication': 'Cash Application', 'other': 'Other' };
        this.vendors = [];
        this.employees = [];
        this.customers = [];
        this.incomeStatsColors = ['#05807C', '#F06459', '#87D0CE', '#00B1A6'];
        this.localeFortmat = 'en-US';
        this.activeTab = "summary";
        this.collapsedCOA = [];
        this.allSections = { showReportForm: true, showReportData: false };
        this.titleService.setPageTitle("Detailed Income Statement");
        this.company = Session_1.Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.actualCompany = Session_1.Session.getCurrentCompanyName();
        this.switchBoard.onFetchCompanies.subscribe(function (companies) { return _this.setAllCompanies(companies); });
        this.emailForm = emailBuilder.group({
            Toaddress: ["", forms_1.Validators.required],
            EmailBody: [""],
            cc: [""],
            Emailsubject: [""]
        });
        this.user = Session_1.Session.get('user');
        this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(function (data) { return _this.generateReport(data); });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    IncomeDetailStatementComponent.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            if (prevState.key == 'showReportForm') {
                this.backToSearch();
                this.resetSections(prevState.key);
            }
            else {
                this.resetSections(prevState.key);
            }
        }
    };
    IncomeDetailStatementComponent.prototype.exportToPDF = function () {
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
            link[0].download = "Detailed Income Statement_" + new Date() + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    IncomeDetailStatementComponent.prototype.toggleCollapse = function (coa) {
        if (this.collapsedCOA.indexOf(coa) == -1) {
            this.collapsedCOA.push(coa);
        }
        else {
            this.collapsedCOA.splice(this.collapsedCOA.indexOf(coa), 1);
        }
    };
    IncomeDetailStatementComponent.prototype.goToJournalEntry = function ($event) {
        jQuery(this.drillDown.nativeElement).foundation('close');
        this.stateService.addState(new State_1.State('JOURNAL_SELECTED', this._router.url, $event, null));
        var link = ['journalEntry', $event.id];
        this._router.navigate(link);
    };
    IncomeDetailStatementComponent.prototype.getEntityName = function (journalEntry) {
        if (journalEntry.entity) {
            if (journalEntry.jeType == 'Bill') {
                var vendor = _.find(this.vendors, { 'id': journalEntry.entity });
                return vendor ? vendor.name : "";
            }
            else if (journalEntry.jeType == 'Payroll') {
                var employee = _.find(this.employees, { 'id': journalEntry.entity });
                return employee ? employee.name : "";
            }
            else if (journalEntry.jeType == 'Invoice') {
                var customer = _.find(this.customers, { 'customer_id': journalEntry.entity });
                return customer ? customer.customer_name : "";
            }
        }
        return "";
    };
    IncomeDetailStatementComponent.prototype.getCOAType = function (type) {
        var typeObj = _.find(this.categoryTypes, { 'value': type });
        return typeObj ? typeObj.name : type;
    };
    IncomeDetailStatementComponent.prototype.getCOASubType = function (type, subType) {
        var subTypeObj = _.find(this.allSubTypes[type], { 'value': subType });
        return subTypeObj ? subTypeObj.name : subType;
    };
    IncomeDetailStatementComponent.prototype.backToSearch = function () {
        Session_1.Session.clearReportCriteria(this.reportReq.type);
        Session_1.Session.clearReportData(this.reportReq.type + '-data');
        this.hideReportForm = false;
    };
    IncomeDetailStatementComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    IncomeDetailStatementComponent.prototype.exportToExcel = function () {
        var _this = this;
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "books";
        finalObj["reportName"] = "incomeDetailStatement";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.getToken();
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "Detailed Income Statement_" + this.companyName + "_" + this.displayDate + ".excel";
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.PDF_SERVICE, finalObj)
            .subscribe(function (data) {
            var blob = new Blob([data._body], { type: "application/vnd.ms-excel" });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link['download'] = "Income_Statement_" + new Date() + ".xls";
            link.click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into Excel");
        });
        jQuery('#example-dropdown').foundation('close');
    };
    IncomeDetailStatementComponent.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    IncomeDetailStatementComponent.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Detailed Income Statement\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Detailed Income Statement';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    IncomeDetailStatementComponent.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    IncomeDetailStatementComponent.prototype.doEmail = function (event) {
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
        emailReq["applicationName"] = "books";
        emailReq["reportName"] = "incomeDetailStatement";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.getToken();
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "Income_Statement_" + this.companyName + "_" + this.displayDate + ".pdf";
        emailReq["emailJson"] = emailJson;
        emailReq["sendEmail"] = "true";
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.PDF_CREATE_SERVICE, emailReq)
            .subscribe(function (data) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Email Sent Successfully");
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Send Email");
        });
        jQuery("#Toaddress, #cc").tagit("removeAll");
        this.showEmail = false;
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Detailed Income Statement\n\nRegards,\n';
        EmailBodyText += (this.user.firstName + " " + this.user.lastName);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Detailed Income Statement';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    IncomeDetailStatementComponent.prototype.handleError = function (error) {
    };
    IncomeDetailStatementComponent.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    IncomeDetailStatementComponent.prototype.printDiv = function () {
        this.collapsedCOA = [];
        setTimeout(function () {
            window.print();
        });
    };
    IncomeDetailStatementComponent.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    IncomeDetailStatementComponent.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    IncomeDetailStatementComponent.prototype.processReport = function (data, report) {
        this.hideReportForm = true;
        this.columns = report.columns;
        this.rows = report.rows;
        this.result = report;
        this.calculateNetIncome();
        this.companyName = data.customizationObj.customizations.includeCompanyName ? data.customizationObj.customizations.customCompanyName : this.actualCompany;
        this.reportName = data.customizationObj.customizations.includeReportTitle ? data.customizationObj.customizations.reportTitle : this.actualReport;
        this.isFailure = false;
        this.isSuccess = true;
    };
    IncomeDetailStatementComponent.prototype.calculateNetIncome = function () {
        var netProfit = this.result.expenses.incomeTax.totals.netProfit || 0;
        this.netIncome = this.numeralService.format("$000,000.00", netProfit.value);
    };
    IncomeDetailStatementComponent.prototype.swapDates = function (report) {
        var temp = report.asOfDate;
        report.asOfDate = report.endDate;
        report.startDate = temp;
    };
    IncomeDetailStatementComponent.prototype.generateReport = function (data) {
        var _this = this;
        var base = this;
        var report = data.report;
        this.reportReq = report;
        this.populateCustomizationValues(data.customizationObj);
        this.displayDate = moment(report.asOfDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        report.companyCurrency = _.find(this.allCompanies, { 'id': report.companyID }).defaultCurrency;
        this.companyCurrency = report.companyCurrency;
        if (Session_1.Session.getReportData(this.reportReq.type + '-data')) {
            this.processReport(data, Session_1.Session.getReportData(this.reportReq.type + '-data'));
            this.stateService.addState(new State_1.State('showReportForm', this._router.url, null, null));
            this.resetSections("showReportData");
        }
        else {
            this.swapDates(report);
            delete report.breakdown;
            if (report.startDate && report.asOfDate)
                this.loadingService.triggerLoadingEvent(true);
            Session_1.Session.setReportCriteria(this.reportReq.type, this.reportReq);
            this.reportService.generateAccountReport(report, this.company).subscribe(function (report) {
                Session_1.Session.setReportData(_this.reportReq.type + '-data', report);
                _this.processReport(data, report);
                _this.stateService.addState(new State_1.State('showReportForm', _this._router.url, null, null));
                _this.resetSections("showReportData");
                _this.titleService.setPageTitle("Detailed Income Statement");
                _this.loadingService.triggerLoadingEvent(false);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.hideReportForm = true;
                _this.isFailure = true;
                _this.isSuccess = false;
            });
        }
    };
    IncomeDetailStatementComponent.prototype.getSourceName = function (source) {
        var result = source;
        switch (source) {
            case 'manual':
                result = 'Manual';
                break;
            case 'payroll':
                result = 'Payroll';
                break;
            case 'accountsPayable':
                result = 'Accounts Payable';
                break;
            case 'accountsReceivable':
                result = 'Accounts Receivable';
                break;
            case 'inventory':
                result = 'Inventory';
                break;
            case 'inflow':
                result = 'Inflow';
                break;
            case 'outflow':
                result = 'Outflow';
                break;
        }
        return result;
    };
    IncomeDetailStatementComponent.prototype.getChartOfAccounts = function (category, key) {
        return category[key].coas || [];
    };
    IncomeDetailStatementComponent.prototype.getTotals = function (category, key) {
        var totals = [];
        _.forEach(category[key].totals, function (obj, key) {
            if (key != 'othersTotal' && obj.value) {
                totals.push(obj);
            }
        });
        return totals;
    };
    IncomeDetailStatementComponent.prototype.getTotal = function (category, key, totalType) {
        var totalsObj = category[key].totals;
        var value = totalsObj[totalType].value || 0;
        return this.numeralService.format("$000,000.00", value);
    };
    IncomeDetailStatementComponent.prototype.getFormattedAmount = function (amount) {
        return this.numeralService.format("$000,000.00", amount);
    };
    IncomeDetailStatementComponent.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    IncomeDetailStatementComponent.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    return IncomeDetailStatementComponent;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], IncomeDetailStatementComponent.prototype, "reportMail", void 0);
__decorate([
    core_1.ViewChild('drillDown'),
    __metadata("design:type", Object)
], IncomeDetailStatementComponent.prototype, "drillDown", void 0);
__decorate([
    core_1.ViewChild('hChart1'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], IncomeDetailStatementComponent.prototype, "hChart1", void 0);
__decorate([
    core_1.ViewChild('hChart2'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], IncomeDetailStatementComponent.prototype, "hChart2", void 0);
__decorate([
    core_1.ViewChild('hChart3'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], IncomeDetailStatementComponent.prototype, "hChart3", void 0);
__decorate([
    core_1.ViewChild('hChart4'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], IncomeDetailStatementComponent.prototype, "hChart4", void 0);
IncomeDetailStatementComponent = __decorate([
    core_1.Component({
        selector: 'income-detail-statement',
        templateUrl: '/app/views/IncomeDetailStatement.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Excel_service_1.ExcelService, Reports_service_1.ReportService,
        Email_service_1.EmailService, Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard,
        forms_1.FormBuilder, LoadingService_1.LoadingService, StateService_1.StateService,
        DateFormatter_service_1.DateFormater, Numeral_service_1.NumeralService, PageTitle_1.pageTitleService])
], IncomeDetailStatementComponent);
exports.IncomeDetailStatementComponent = IncomeDetailStatementComponent;
