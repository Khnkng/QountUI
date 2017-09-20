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
var core_1 = require("@angular/core");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Email_service_1 = require("../services/Email.service");
var Excel_service_1 = require("../services/Excel.service");
var Reports_service_1 = require("../services/Reports.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var forms_1 = require("@angular/forms");
var Session_1 = require("qCommon/app/services/Session");
var payments_constants_1 = require("../constants/payments.constants");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var VendorExpenseAmountsByPeriod = (function () {
    function VendorExpenseAmountsByPeriod(_router, reportService, _toastService, emailService, excelService, switchBoard, emailBuilder, titleService, stateService) {
        var _this = this;
        this._router = _router;
        this.reportService = reportService;
        this._toastService = _toastService;
        this.emailService = emailService;
        this.excelService = excelService;
        this.switchBoard = switchBoard;
        this.emailBuilder = emailBuilder;
        this.titleService = titleService;
        this.stateService = stateService;
        this.graphTabView = false;
        this.companies = [];
        this.report = {};
        this.periods = ['This Month', 'This Quarter', 'This Year', 'Last Month', 'Last Quarter', 'Last Year', 'Custom'];
        this.displayCurrency = 'USD';
        this.headerArry = [];
        this.company = null;
        this.reportPeriod = null;
        this.columns = [];
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
        this.activeTab = "summary";
        this.allSections = { showReportForm: true, showTabber: false, showBills: false };
        this.titleService.setPageTitle("BILLS AND PAYMENTS SUMMARY");
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
    VendorExpenseAmountsByPeriod.prototype.backToSearch = function () {
        this.hideReportForm = false;
    };
    VendorExpenseAmountsByPeriod.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    VendorExpenseAmountsByPeriod.prototype.generateChart = function (report) {
        var _report = _.cloneDeep(report);
        var columns = _report.columns || [];
        columns.splice(_report.columns.length - 1, 1);
        var keys = Object.keys(_report.data);
        var series = [];
        var _loop_1 = function (key) {
            if (key != 'TOTAL') {
                vendor = _report.data[key];
                vendorId = vendor['VendorID'];
                delete vendor['TOTAL'];
                delete vendor['VendorID'];
                /* var payments=Object.keys(vendor);*/
                stackableKeys = Object.keys(vendor);
                stackableKeys.forEach(function (stackableKey) {
                    var stableItem = vendor[stackableKey];
                    var yaxisValueArrayPerStack = [];
                    var stackArrObj = {};
                    stackArrObj['name'] = key;
                    //need to see if key need to be human readable name
                    stackArrObj['data'] = [];
                    stackArrObj['stack'] = stackableKey;
                    columns.forEach(function (xaxiskey) {
                        var unformattedReportCellValue = 0;
                        var currentValue = stableItem[xaxiskey];
                        if (stableItem[xaxiskey]) {
                            unformattedReportCellValue = parseFloat(currentValue.slice(1));
                        }
                        stackArrObj['data'].push(unformattedReportCellValue);
                    });
                    series.push(stackArrObj);
                });
                console.log(series, "series check this");
            }
        };
        var vendor, vendorId, stackableKeys;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            _loop_1(key);
        }
        console.log("series", JSON.stringify(series));
        Highcharts.theme = {
            colors: ['#4885ed', '#3cba54', '#f4c20d', '#00BFFF', '#db3236', '#64E572',
                '#FF9655', '#FFF263', '#6AF9C4'],
            title: {
                style: {
                    color: '#000',
                    font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
                }
            },
            subtitle: {
                style: {
                    color: '#666666',
                    font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
                }
            },
        };
        Highcharts.setOptions(Highcharts.theme);
        this.reportChartOptions = {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Bills and Payments'
            },
            xAxis: {
                categories: columns,
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
        };
    };
    VendorExpenseAmountsByPeriod.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "vendorSummary";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.get('token');
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "Bills And Payment Summary Report_" + this.companyName + "_" + this.displayDate + ".pdf";
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
    VendorExpenseAmountsByPeriod.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    VendorExpenseAmountsByPeriod.prototype.exportToExcel = function () {
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "payments";
        finalObj["reportName"] = "vendorSummary";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.get('token');
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "Bills And Payment Summary Report_" + this.companyName + "_" + this.displayDate + ".excel";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Qount_constants_1.PATH.JAVA_SERVICE_URL + payments_constants_1.PAYMENTSPATHS.EXCEL_SERVICE, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/vnd.ms-excel" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link['download'] = "Aging_Vendor_Summary_" + new Date() + ".xls";
                link.click();
            }
        };
        xhr.send(JSON.stringify(finalObj));
        jQuery('#example-dropdown').foundation('close');
    };
    VendorExpenseAmountsByPeriod.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    VendorExpenseAmountsByPeriod.prototype.handleError = function (error) {
    };
    VendorExpenseAmountsByPeriod.prototype.exportToPDF = function () {
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
            link[0].download = "Bills And Payments summary " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    VendorExpenseAmountsByPeriod.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nVendor Expense Amount By Period\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Vendor Expense Amount By Period';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    VendorExpenseAmountsByPeriod.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    VendorExpenseAmountsByPeriod.prototype.isNegativeValue = function (value) {
        if (value && value.indexOf('-') != -1 && this.showInRed) {
            return true;
        }
    };
    VendorExpenseAmountsByPeriod.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    VendorExpenseAmountsByPeriod.prototype.printDiv = function () {
        window.print();
    };
    VendorExpenseAmountsByPeriod.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    VendorExpenseAmountsByPeriod.prototype.generateReport = function (data) {
        var _this = this;
        var report = data.report;
        this.reportReq = report;
        var plainData = [];
        this.populateCustomizationValues(data.customizationObj);
        report.daysPerAgingPeriod = 1;
        report.numberOfPeriods = 1;
        if (report.period == 'Last Month' || report.period == 'This Month')
            delete report.breakdown;
        this.displayDate = moment(report.asOfDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        this.displayEndDate = moment(report.endDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        report.companyCurrency = _.find(this.allCompanies, { 'id': report.companyID }).defaultCurrency;
        this.companyCurrency = report.companyCurrency;
        this.reportPeriod = data.customizationObj.customizations.includeReportPeriod ? this.displayDate : "";
        this.reportReq = report;
        this.stateService.addState(new State_1.State('showReportForm', this._router.url, null, null));
        this.resetSections("showTabber");
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
                _this.reportResponse = report;
                _this.generateChart(report);
                var keys = Object.keys(report.data);
                for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                    var key = keys_2[_i];
                    if (key != 'TOTAL') {
                        _this.results.push(report.data[key]);
                        plainData.push(report.data[key].payments);
                        plainData.push(report.data[key].payables);
                    }
                }
                var vendorKeys = Object.keys(_this.results[0] ? _this.results[0].payments : []);
                if (report && report.data)
                    _this.totals.push(report.data['TOTAL']);
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
    VendorExpenseAmountsByPeriod.prototype.resetData = function () {
        this.totals = [];
        this.results = [];
    };
    VendorExpenseAmountsByPeriod.prototype.add = function (a, b) {
        return a + b;
    };
    VendorExpenseAmountsByPeriod.prototype.setAsOfDate = function (val) {
        this.report.asOfDate = val;
    };
    VendorExpenseAmountsByPeriod.prototype.setEndDate = function (val) {
        this.report.endDate = val;
    };
    VendorExpenseAmountsByPeriod.prototype.showReportDetails = function (col, res, isAllVendors, type) {
        var _this = this;
        var fromDate, toDate, vendorsList = [];
        var req = {};
        var filters = [];
        var dates = [];
        if (this.reportResponse) {
            if (col == 'TOTAL') {
                fromDate = this.reportResponse.metadata.dateRanges[this.reportResponse.columns[0]].split('~')[0];
                toDate = this.reportResponse.metadata.dateRanges[this.reportResponse.columns[this.reportResponse.columns.length - 2]].split('~')[1];
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
            vendorsList.push(res.vendorID);
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
        if (type == 'payables') {
            var stateFilter = {
                "operator": "!=",
                "values": [
                    "paid"
                ],
                "filterName": "currentState"
            };
        }
        else if (type == 'payments') {
            var stateFilter = {
                "operator": "=",
                "values": [
                    "paid"
                ],
                "filterName": "currentState"
            };
        }
        filters.push(dateFilter);
        filters.push(nameFilter);
        if (stateFilter)
            filters.push(stateFilter);
        req = {
            filters: filters
        };
        this.reportService.getBillDetails(req, this.reportReq.company).subscribe(function (report) {
            jQuery(_this.drillDown.nativeElement).foundation('open');
            _this.billsList = report;
        }, function (err) {
        });
    };
    VendorExpenseAmountsByPeriod.prototype.goTOBillDetailsPage = function (bill) {
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
    VendorExpenseAmountsByPeriod.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    VendorExpenseAmountsByPeriod.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    VendorExpenseAmountsByPeriod.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    VendorExpenseAmountsByPeriod.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    VendorExpenseAmountsByPeriod.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            this.resetSections(prevState.key);
        }
    };
    VendorExpenseAmountsByPeriod.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    return VendorExpenseAmountsByPeriod;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], VendorExpenseAmountsByPeriod.prototype, "reportMail", void 0);
__decorate([
    core_1.ViewChild('drillDown'),
    __metadata("design:type", Object)
], VendorExpenseAmountsByPeriod.prototype, "drillDown", void 0);
VendorExpenseAmountsByPeriod = __decorate([
    core_1.Component({
        selector: 'vendor-expense-amounts-by-period',
        templateUrl: '/app/views/vendorExpenseAmountsByPeriod.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Reports_service_1.ReportService, Toast_service_1.ToastService,
        Email_service_1.EmailService, Excel_service_1.ExcelService, SwitchBoard_1.SwitchBoard,
        forms_1.FormBuilder, PageTitle_1.pageTitleService, StateService_1.StateService])
], VendorExpenseAmountsByPeriod);
exports.VendorExpenseAmountsByPeriod = VendorExpenseAmountsByPeriod;
