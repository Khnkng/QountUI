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
var Session_1 = require("qCommon/app/services/Session");
var Email_service_1 = require("../services/Email.service");
var Excel_service_1 = require("../services/Excel.service");
var core_1 = require("@angular/core");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Reports_service_1 = require("../services/Reports.service");
var Notification_service_1 = require("qCommon/app/services/Notification.service");
var forms_1 = require("@angular/forms");
var payments_constants_1 = require("../constants/payments.constants");
var HighChart_directive_1 = require("qCommon/app/directives/HighChart.directive");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var APAgingReportComponent = (function () {
    function APAgingReportComponent(_notificationService, emailService, excelService, emailBuilder, _router, reportService, switchBoard, _toastService, loadingService, numeralService, titleService, stateService) {
        var _this = this;
        this._notificationService = _notificationService;
        this.emailService = emailService;
        this.excelService = excelService;
        this.emailBuilder = emailBuilder;
        this._router = _router;
        this.reportService = reportService;
        this.switchBoard = switchBoard;
        this._toastService = _toastService;
        this.loadingService = loadingService;
        this.numeralService = numeralService;
        this.titleService = titleService;
        this.stateService = stateService;
        this.graphTabView = true;
        this.type = "component";
        this.report = {};
        this.displayCurrency = 'USD';
        this.printmode = false;
        this.printmodes = false;
        this.headerArry = [];
        this.company = null;
        this.footer = null;
        this.printableArea = false;
        this.modes = true;
        this.columns = [];
        this.results = [];
        this.displayDate = null;
        this.companyName = null;
        this.reportPeriod = null;
        this.isDisplay = false;
        this.isSuccess = false;
        this.isFailure = false;
        this.user = [];
        this.emailAddress = [];
        this.totals = [];
        this.showInRed = false;
        this.showEmail = false;
        this.printModal = false;
        this.printshow = false;
        this.vendorKeys = [];
        this.hideReportForm = false;
        this.sortBy = true;
        this.activeTab = "summary";
        this.allSections = { showReportForm: true, showTabber: false, showBills: false };
        this.titleService.setPageTitle("AP AGING SUMMARY");
        this.emailForm = emailBuilder.group({
            Toaddress: ["", forms_1.Validators.required],
            EmailBody: [""],
            cc: [""],
            Emailsubject: [""]
        });
        this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(function (data) {
            _this.generateReport(data);
            _this.setActiveTab('summary');
        });
        this.user = Session_1.Session.get('user');
        console.log("mnmn", this.user);
        this.switchBoard.onPrintWindowClose.subscribe(function (printStatus) {
            _this.hidePrint();
        });
        this.companyDisplayName = Session_1.Session.getCurrentCompanyName();
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    APAgingReportComponent.prototype.onResize = function (event) {
        var base = this;
        if (this.graphTabView) {
            base.hChart1.redraw();
        }
    };
    APAgingReportComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    APAgingReportComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is A/P Aging Summary\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your A/P Aging Summary';
        EmailsubjectControl.patchValue(EmailsubjectText);
        this.switchBoard.onSideMenuResize.subscribe(function (resize) {
            var base = _this;
            setTimeout(function () {
                if (this.graphTabView) {
                    base.hChart1.redraw();
                }
            }, 1000);
        });
    };
    APAgingReportComponent.prototype.hidePrint = function () {
        this.printmodes = false;
    };
    APAgingReportComponent.prototype.backToSearch = function () {
        this.hideReportForm = false;
        this.isSuccess = false;
        this.colName = null;
    };
    APAgingReportComponent.prototype.closePrint = function () {
        jQuery(this.printModalElement.nativeElement).foundation('close');
    };
    APAgingReportComponent.prototype.openPrint = function () {
        jQuery(this.printModalElement.nativeElement).foundation('open');
    };
    APAgingReportComponent.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    APAgingReportComponent.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "aging";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.getToken();
        ;
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "A/P Aging Summary Report_" + this.companyName + "_" + this.displayDate + ".pdf";
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
    APAgingReportComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    APAgingReportComponent.prototype.printDiv = function () {
        window.print();
    };
    APAgingReportComponent.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    APAgingReportComponent.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    APAgingReportComponent.prototype.isNegativeValue = function (value) {
        if (value && value.indexOf('-') != -1 && this.showInRed) {
            return true;
        }
    };
    APAgingReportComponent.prototype.getCurrentDate = function () {
    };
    APAgingReportComponent.prototype.generateReport = function (data) {
        var _this = this;
        var report = data.report;
        this.populateCustomizationValues(data.customizationObj);
        this.titleDisplayDate = report.asOfDate;
        this.displayDate = moment(report.asOfDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        this.reportReq = report;
        report.daysPerAgingPeriod = Number(report.daysPerAgingPeriod);
        report.numberOfPeriods = Number(report.numberOfPeriods);
        if (!isNaN(report.daysPerAgingPeriod) && !isNaN(report.numberOfPeriods) && report.asOfDate) {
            if (report.daysPerAgingPeriod === 0 && report.numberOfPeriods === 0) {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Days Aging and Number of Periods cannot be ZERO");
                return;
            }
            else if (report.daysPerAgingPeriod === 0) {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Days per Aging cannot be ZERO");
                return;
            }
            else if (report.numberOfPeriods === 0) {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Number of Periods cannot be ZERO");
                return;
            }
            this.loadingService.triggerLoadingEvent(true);
            this.reportService.generateReport(report).subscribe(function (report) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.hideReportForm = true;
                _this.resetData();
                _this.reportResponse = report;
                _this.generateChart(report);
                _this.stateService.addState(new State_1.State('showReportForm', _this._router.url, null, null));
                _this.resetSections("showTabber");
                var keys = Object.keys(report.data);
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    if (key != 'TOTAL')
                        _this.results.push(report.data[key]);
                }
                _this.vendorKeys = [];
                if (_this.results.length > 0) {
                    _this.vendorKeys = Object.keys(_this.results[0]);
                }
                if (report && report.data)
                    _this.company = report.metadata.header;
                _this.headerSet = _this.company;
                _this.headerArry = _this.headerSet.split('\n');
                _this.actualCompany = _this.headerArry[0];
                _this.actualReport = _this.headerArry[1];
                _this.companyName = data.customizationObj.customizations.includeCompanyName ? data.customizationObj.customizations.customCompanyName : _this.actualCompany;
                _this.reportName = data.customizationObj.customizations.includeReportTitle ? data.customizationObj.customizations.reportTitle : _this.actualReport;
                _this.reportPeriod = data.customizationObj.customizations.includeReportPeriod ? _this.displayDate : "";
                _this.footer = report.metadata.footer;
                _this.totals.push(report.data['TOTAL']);
                _this.columns = report.columns;
                _this.isDisplay = true;
                _this.isFailure = false;
                _this.isSuccess = true;
            }, function (error) {
                _this.isDisplay = true;
                _this.isFailure = true;
                _this.isSuccess = false;
                _this.hideReportForm = true;
                _this.loadingService.triggerLoadingEvent(false);
            });
        }
    };
    APAgingReportComponent.prototype.removeCurrency = function (values) {
        var _values = [];
        var base = this;
        values.forEach(function (value) {
            _values.push(base.numeralService.value(value));
        });
        return _values;
    };
    APAgingReportComponent.prototype.generateChart = function (report) {
        var _report = _.cloneDeep(report);
        var columns = _report.columns || [];
        columns.splice(_report.columns.length - 1, 1);
        var keys = Object.keys(_report.data);
        var series = [];
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            if (key != 'TOTAL') {
                var vendor = _report.data[key];
                var vendorId = vendor['VendorID'];
                delete vendor['TOTAL'];
                delete vendor['VendorID'];
                delete vendor['type'];
                var values = Object.values(vendor);
                values = this.removeCurrency(values);
                var current = values.pop();
                values.splice(0, 0, current);
                series.push({
                    name: vendorId,
                    data: values
                });
            }
        }
        this.reportChartOptions = {
            chart: {
                type: 'bar',
                marginRight: 50
            },
            title: {
                text: 'Aging By Vendor'
            },
            credits: {
                enabled: false
            },
            xAxis: {
                gridLineWidth: 0,
                minorGridLineWidth: 0,
                categories: columns
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '<span style="color:{series.color}">{series.name}: ${point.y:,.2f}</span><br/>',
                shared: true
            },
            yAxis: {
                gridLineWidth: 0,
                minorGridLineWidth: 0,
                min: 0,
                title: {
                    text: 'Payable Amount',
                    style: {
                        fontSize: '15px'
                    }
                },
                stackLabels: {
                    enabled: true,
                    formatter: function () {
                        return '$' + Highcharts.numberFormat(this.total, 2);
                    },
                    style: {
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#003399',
                        fill: '#003399'
                        // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                },
                labels: {
                    style: {
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#003399',
                        fill: '#003399'
                    }
                }
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                enabled: true,
                series: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false,
                        format: '${y}',
                        fontSize: '13px',
                        color: '#003399',
                        fill: '#003399',
                        style: {
                            fontSize: '13px'
                        },
                    }
                },
            },
            series: series
        };
    };
    APAgingReportComponent.prototype.add = function (a, b) {
        return a + b;
    };
    APAgingReportComponent.prototype.resetData = function () {
        this.totals = [];
        this.results = [];
    };
    APAgingReportComponent.prototype.exportToPDF = function () {
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
            link[0].download = "AP Aging report " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    APAgingReportComponent.prototype.showReportDetails = function (col, res, isAllVendors) {
        var _this = this;
        var fromDate, toDate, vendorsList = [];
        var req = {};
        var filters = [];
        var dates = [];
        if (this.reportResponse) {
            if (col == 'TOTAL') {
                toDate = this.reportResponse.metadata.dateRanges['Current'].split('~')[1];
                fromDate = this.reportResponse.metadata.dateRanges[this.reportResponse.columns[this.reportResponse.columns.length - 2]].split('~')[0];
            }
            else {
                fromDate = this.reportResponse.metadata.dateRanges[col].split('~')[0];
                toDate = this.reportResponse.metadata.dateRanges[col].split('~')[1];
            }
        }
        if (isAllVendors) {
            vendorsList = Object.keys(this.reportResponse.data);
        }
        else {
            vendorsList.push(res.VendorID);
        }
        dates.push(fromDate);
        dates.push(toDate);
        var dateFilter = {
            operator: "BETWEEN",
            values: dates,
            filterName: "dueDateLong"
        };
        var nameFilter = {
            operator: "=",
            values: vendorsList,
            filterName: "vendorName"
        };
        var stateFilter = {
            "operator": "!=",
            "values": [
                "paid"
            ],
            "filterName": "currentState"
        };
        filters.push(dateFilter);
        filters.push(nameFilter);
        filters.push(stateFilter);
        req = {
            asOfDate: moment(this.displayDate, 'MMMM DD, YYYY').format("MM/DD/YYYY"),
            filters: filters
        };
        this.loadingService.triggerLoadingEvent(true);
        this.reportService.getBillDetails(req, this.reportReq.companyID).subscribe(function (report) {
            _this.loadingService.triggerLoadingEvent(false);
            jQuery(_this.drillDown.nativeElement).foundation('open');
            _this.billsList = report;
        }, function (err) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    APAgingReportComponent.prototype.exportToExcel = function () {
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "payments";
        finalObj["reportName"] = "aging";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.getToken();
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "A/P Aging Summary Report_" + this.companyName + "_" + this.displayDate + ".excel";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Qount_constants_1.PATH.JAVA_SERVICE_URL + payments_constants_1.PAYMENTSPATHS.EXCEL_SERVICE, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/vnd.ms-excel" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link['download'] = "AgingReport_" + new Date() + ".xls";
                link.click();
            }
        };
        xhr.send(JSON.stringify(finalObj));
        jQuery('#example-dropdown').foundation('close');
    };
    APAgingReportComponent.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color', 'font-size'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    APAgingReportComponent.prototype.goTOBillDetailsPage = function (bill) {
        jQuery(this.drillDown.nativeElement).foundation('close');
        var selectedTab;
        if (bill.currentState == 'entry') {
            selectedTab = 0;
        }
        else if (bill.currentState == 'approve') {
            selectedTab = 1;
        }
        else if (bill.currentState == 'payee') {
            selectedTab = 2;
        }
        else {
            selectedTab = 3;
        }
        var link = ['BillEntry', { id: bill.id, companyId: bill.companyID, tabId: selectedTab }];
        this._router.navigate(link);
    };
    APAgingReportComponent.prototype.orderByColumn = function (column, sortType) {
        this.colName = column;
        this.sortBy = !this.sortBy;
        var order = 'asc';
        if (this.sortBy) {
            order = 'desc';
        }
        this.results = _.orderBy(this.results, [column], [order]);
    };
    APAgingReportComponent.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    APAgingReportComponent.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    APAgingReportComponent.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    APAgingReportComponent.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    APAgingReportComponent.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            this.resetSections(prevState.key);
        }
    };
    return APAgingReportComponent;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], APAgingReportComponent.prototype, "reportMail", void 0);
__decorate([
    core_1.ViewChild('printModal'),
    __metadata("design:type", Object)
], APAgingReportComponent.prototype, "printModalElement", void 0);
__decorate([
    core_1.ViewChild('drillDown'),
    __metadata("design:type", Object)
], APAgingReportComponent.prototype, "drillDown", void 0);
__decorate([
    core_1.ViewChild('hChart1'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], APAgingReportComponent.prototype, "hChart1", void 0);
__decorate([
    core_1.HostListener('window:resize', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], APAgingReportComponent.prototype, "onResize", null);
APAgingReportComponent = __decorate([
    core_1.Component({
        selector: 'ap-aging-report',
        templateUrl: '/app/views/apAgingReport.html'
    }),
    __metadata("design:paramtypes", [Notification_service_1.NotificationService, Email_service_1.EmailService, Excel_service_1.ExcelService, forms_1.FormBuilder, router_1.Router, Reports_service_1.ReportService, SwitchBoard_1.SwitchBoard,
        Toast_service_1.ToastService, LoadingService_1.LoadingService, Numeral_service_1.NumeralService, PageTitle_1.pageTitleService, StateService_1.StateService])
], APAgingReportComponent);
exports.APAgingReportComponent = APAgingReportComponent;
