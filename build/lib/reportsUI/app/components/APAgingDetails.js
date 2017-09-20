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
var HighChart_directive_1 = require("qCommon/app/directives/HighChart.directive");
var Session_1 = require("qCommon/app/services/Session");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Reports_service_1 = require("../services/Reports.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var payments_constants_1 = require("../constants/payments.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var forms_1 = require("@angular/forms");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var APAgingDetails = (function () {
    function APAgingDetails(_router, excelService, numeralService, reportService, emailService, _toastService, switchBoard, emailBuilder, titleService, stateService) {
        var _this = this;
        this._router = _router;
        this.excelService = excelService;
        this.numeralService = numeralService;
        this.reportService = reportService;
        this.emailService = emailService;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.emailBuilder = emailBuilder;
        this.titleService = titleService;
        this.stateService = stateService;
        this.graphTabView = true;
        this.printmodes = false;
        this.columns = [];
        this.displayDate = null;
        this.companyName = null;
        this.headerArry = [];
        this.company = null;
        this.reportPeriod = null;
        this.isDisplay = false;
        this.isSuccess = false;
        this.isFailure = false;
        this.companyCurrency = 'USD';
        this.allCompanies = [];
        this.showPendingAmount = false;
        this.showInRed = false;
        this.showEmail = false;
        this.emailAddress = [];
        this.user = [];
        this.hideReportForm = false;
        this.allSections = { showReportForm: true, showTabber: false };
        this.activeTab = "summary";
        this.groupBy = [];
        this.headerColumns = [];
        this.titleService.setPageTitle("AP AGING DETAILS");
        this.switchBoard.onFetchCompanies.subscribe(function (companies) { return _this.setAllCompanies(companies); });
        this.emailForm = emailBuilder.group({
            Toaddress: ["", forms_1.Validators.required],
            EmailBody: [""],
            cc: [""],
            Emailsubject: [""]
        });
        this.user = Session_1.Session.get('user');
        this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(function (data) {
            _this.generateReport(data);
            _this.setActiveTab('summary');
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    APAgingDetails.prototype.generateChart = function (report) {
        var _this = this;
        var series = [];
        var sample = _.reduce(report.data, function (accumulator, date, name) {
            var totalvalue = date.Total ? date.Total : 0;
            var finalvalue = _this.numeralService.value(totalvalue);
            var item = { name: name, y: finalvalue };
            return accumulator.concat(item);
        }, []);
        this.reportChartOptions = {
            chart: {
                type: 'column'
            },
            title: {
                text: 'AP Aging Summary',
                style: {
                    fontSize: '17px',
                    color: '#666666',
                    fill: '#666666'
                }
            },
            credits: {
                enabled: false
            },
            xAxis: {
                type: 'category',
                labels: {
                    style: {
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#003399',
                        fill: '#003399'
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Total Amount',
                    style: {
                        fontSize: '15px'
                    }
                },
                labels: {
                    style: {
                        fontSize: '13px'
                    }
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return '$' + Highcharts.numberFormat(this.y, 2);
                        },
                        fontSize: '13px',
                        color: '#003399',
                        fill: '#003399',
                        style: {
                            fontSize: '13px'
                        }
                    }
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{point.color};font-size: 13px">TOTAL</span>: <b>${point.y:,.2f}</b><br/>',
            },
            series: [{
                    colorByPoint: true,
                    data: sample
                }],
        };
    };
    APAgingDetails.prototype.exportToPDF = function () {
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
            link[0].download = "AP Aging Detail " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    APAgingDetails.prototype.backToSearch = function () {
        this.hideReportForm = false;
    };
    APAgingDetails.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    APAgingDetails.prototype.exportToExcel = function () {
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "payments";
        finalObj["reportName"] = "agingDetail";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.getToken();
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "A/P Aging detail Report_" + this.companyName + "_" + this.displayDate + ".excel";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Qount_constants_1.PATH.JAVA_SERVICE_URL + payments_constants_1.PAYMENTSPATHS.EXCEL_SERVICE, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/vnd.ms-excel" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link['download'] = "Aging_Details_Report_" + new Date() + ".xls";
                link.click();
            }
        };
        xhr.send(JSON.stringify(finalObj));
        xhr.send(JSON.stringify(finalObj));
        jQuery('#example-dropdown').foundation('close');
    };
    APAgingDetails.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    APAgingDetails.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Ap Aging Details Summary\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Ap Aging Details Summary';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    APAgingDetails.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    APAgingDetails.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "agingDetail";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.getToken();
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "A/P Aging detail Report_" + this.companyName + "_" + this.displayDate + ".pdf";
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
        var EmailBodyText = 'Hello, \n\nAttached is A/P Aging Summary\n\nRegards,\n';
        EmailBodyText += (this.user.firstName + " " + this.user.lastName);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your A/P Aging Summary';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    APAgingDetails.prototype.handleError = function (error) {
    };
    APAgingDetails.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    APAgingDetails.prototype.printDiv = function () {
        window.print();
    };
    APAgingDetails.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    APAgingDetails.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    APAgingDetails.prototype.isNegativeValue = function (value, column) {
        if (column == 'AmountInBillCurrency' || column == 'AmountInCompanyCurrency') {
            if (value && value.indexOf('-') != -1 && this.showInRed) {
                return true;
            }
        }
    };
    APAgingDetails.prototype.generateReport = function (data) {
        var _this = this;
        var report = data.report;
        this.reportReq = report;
        this.populateCustomizationValues(data.customizationObj);
        this.displayDate = moment(report.asOfDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        report.companyCurrency = _.find(this.allCompanies, { 'id': report.companyID }).defaultCurrency;
        this.companyCurrency = report.companyCurrency;
        if (report.daysPerAgingPeriod && report.numberOfPeriods && report.asOfDate)
            this.reportService.generateReport(report).subscribe(function (report) {
                _this.generateChart(report);
                _this.stateService.addState(new State_1.State('showReportForm', _this._router.url, null, null));
                _this.resetSections("showTabber");
                _this.hideReportForm = true;
                _this.resetData();
                _this.agingDetails = report.data;
                _this.columns = report.columns;
                _this.headerColumns = _.cloneDeep(report.columns);
                _this.groupBy = report.groupBy;
                _this.showPendingAmount = report.showPendingAmount;
                if (_this.headerColumns && _this.headerColumns.indexOf('AmountInBillCurrency') != -1) {
                    _this.headerColumns.splice(_this.headerColumns.indexOf('AmountInBillCurrency'), 1, "Amount <br> (Bill Currency)");
                }
                if (_this.headerColumns && _this.headerColumns.indexOf('AmountInCompanyCurrency') != -1) {
                    _this.headerColumns.splice(_this.headerColumns.indexOf('AmountInCompanyCurrency'), 1, "Amount <br> (Company Currency)");
                }
                _this.company = report.metadata.header;
                _this.headerSet = _this.company;
                _this.headerArry = _this.headerSet.split('\n');
                _this.actualCompany = _this.headerArry[0];
                _this.actualReport = _this.headerArry[1];
                _this.companyName = data.customizationObj.customizations.includeCompanyName ? data.customizationObj.customizations.customCompanyName : _this.actualCompany;
                _this.reportName = data.customizationObj.customizations.includeReportTitle ? data.customizationObj.customizations.reportTitle : _this.actualReport;
                _this.reportPeriod = data.customizationObj.customizations.includeReportPeriod ? _this.displayDate : "";
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
    APAgingDetails.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    APAgingDetails.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    APAgingDetails.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    APAgingDetails.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    APAgingDetails.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            this.resetSections(prevState.key);
        }
    };
    /*add(a,b){
     return a+b;
     }*/
    APAgingDetails.prototype.resetData = function () {
    };
    APAgingDetails.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    return APAgingDetails;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], APAgingDetails.prototype, "reportMail", void 0);
__decorate([
    core_1.ViewChild('hChart1'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], APAgingDetails.prototype, "hChart1", void 0);
APAgingDetails = __decorate([
    core_1.Component({
        selector: 'reports',
        templateUrl: '/app/views/APAgingDetails.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Excel_service_1.ExcelService, Numeral_service_1.NumeralService,
        Reports_service_1.ReportService, Email_service_1.EmailService, Toast_service_1.ToastService,
        SwitchBoard_1.SwitchBoard, forms_1.FormBuilder, PageTitle_1.pageTitleService, StateService_1.StateService])
], APAgingDetails);
exports.APAgingDetails = APAgingDetails;
