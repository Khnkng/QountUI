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
var CashFlowStatement = (function () {
    function CashFlowStatement(_router, excelService, reportService, emailService, _toastService, switchBoard, emailBuilder, loadingService, stateService, dateFormater, numeralService, titleService) {
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
        this.graphTabView = false;
        this.showCharts = false;
        this.showDetailedChart = false;
        this.printmodes = false;
        this.displayDate = null;
        this.companyName = null;
        this.company = null;
        this.isDisplay = false;
        this.isSuccess = false;
        this.isFailure = false;
        this.companyCurrency = 'USD';
        this.allCompanies = [];
        this.showInRed = false;
        this.showEmail = false;
        this.emailAddress = [];
        this.columns = [];
        this.result = {};
        this.drillDownResults = [];
        this.categoryTypes = Qount_constants_2.COA_CATEGORY_TYPES;
        this.allSubTypes = Qount_constants_2.COA_SUBTYPES;
        this.allSections = { showReportForm: true, showDetailedIncome: false, showTabber: false, showExpandChart: false, showJournals: false };
        this.detailedtableData = {};
        this.detailedtableDataOptions = {};
        this.hasDetailedData = false;
        this.hasJornalDetailedData = false;
        this.JournaldetailedtableData = {};
        this.actualReport = 'Cash Flow Statement';
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
        this.cashCompositionDataOptions = {};
        this.hasCashCompositionData = false;
        this.groupedCashCompositionDataOptions = {};
        this.cashTrendDataOptions = {};
        this.hasCashTrendData = false;
        this.cashBurnDataOptions = {};
        this.hasCashBurnData = false;
        this.titleService.setPageTitle("Cash Flow Statement");
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
    CashFlowStatement.prototype.onResize = function (event) {
        var base = this;
        base.hChart1.redraw();
        base.hChart2.redraw();
        base.hChart3.redraw();
        if (this.showCharts) {
            base.hChart4.redraw();
        }
    };
    CashFlowStatement.prototype.exportToPDF = function () {
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
            link[0].download = "Cash Flow Satement " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    CashFlowStatement.prototype.goToJournalEntry = function ($event) {
        this.stateService.addState(new State_1.State('showJournals', this._router.url, $event, null));
        var link = ['journalEntry', $event.id];
        this._router.navigate(link);
    };
    CashFlowStatement.prototype.filterJournals = function (coaId) {
        var _this = this;
        this.titleService.setPageTitle("Journal Details");
        var data = {
            reportType: 'cashFlowStatement',
            asOfDate: this.reportReq.asOfDate,
            startDate: this.reportReq.startDate,
            coaID: coaId
        };
        this.drillDownResults = [];
        if (this.activeTab == 'summary') {
            this.stateService.addState(new State_1.State('showDetailedIncome', this._router.url, data, null));
        }
        else {
            this.stateService.addState(new State_1.State('showTabber', this._router.url, null, this.activeTab));
        }
        this.loadingService.triggerLoadingEvent(true);
        this.reportService.drillDownReport(this.company, data)
            .subscribe(function (results) {
            _this.resetSections('showJournals');
            _this.loadingService.triggerLoadingEvent(false);
            _this.drillDownResults = results;
            _this.buildJournalDetailTableData();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    CashFlowStatement.prototype.getEntityName = function (journalEntry) {
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
    CashFlowStatement.prototype.getCOAType = function (type) {
        var typeObj = _.find(this.categoryTypes, { 'value': type });
        return typeObj ? typeObj.name : type;
    };
    CashFlowStatement.prototype.getCOASubType = function (type, subType) {
        var subTypeObj = _.find(this.allSubTypes[type], { 'value': subType });
        return subTypeObj ? subTypeObj.name : subType;
    };
    CashFlowStatement.prototype.showOtherCharts = function (type) {
        this.showDetailedChart = true;
        if (type == 'cashCompositionChart') {
            this.detailedReportChartOptions = this.cashCompositionDataOptions;
        }
        else if (type == 'cashTrendChart') {
            this.cashTrendDataOptions.legend = { enabled: true };
            this.detailedReportChartOptions = this.cashTrendDataOptions;
        }
        else if (type == 'cashBurnChart') {
            this.cashBurnDataOptions.legend = { enabled: true };
            this.detailedReportChartOptions = this.cashBurnDataOptions;
        }
        this.stateService.addState(new State_1.State('showTabber', this._router.url, null, this.activeTab));
        this.resetSections('showExpandChart');
    };
    CashFlowStatement.prototype.resetLegend = function () {
        this.cashTrendDataOptions.legend = { enabled: false };
        this.cashBurnDataOptions.legend = { enabled: false };
    };
    CashFlowStatement.prototype.backToSearch = function () {
        Session_1.Session.clearReportCriteria(this.reportReq.type);
        Session_1.Session.clearReportData(this.reportReq.type + '-data');
    };
    CashFlowStatement.prototype.backToGridView = function () {
        this.hasDetailedData = false;
        this.hasJornalDetailedData = false;
        this.titleService.setPageTitle("Cash Flow Statement");
    };
    CashFlowStatement.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(document).find(".reveal-overlay").remove();
    };
    CashFlowStatement.prototype.exportToExcel = function () {
        var _this = this;
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "books";
        finalObj["reportName"] = "cashFlowStatement";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.getToken();
        finalObj["userId"] = this.user.id;
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "Cash Flow Statement_" + this.companyName + "_" + this.displayDate + ".excel";
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.PDF_SERVICE, finalObj)
            .subscribe(function (data) {
            var blob = new Blob([data._body], { type: "application/vnd.ms-excel" });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link['download'] = "Cash_Flow_Statement_" + new Date() + ".xls";
            link.click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into Excel");
        });
        jQuery('#example-dropdown').foundation('close');
    };
    CashFlowStatement.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    CashFlowStatement.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Cash Flow Statement\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Cash Flow Statement';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    CashFlowStatement.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    CashFlowStatement.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "cashFlowStatement";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.getToken();
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "Cash_Flow_Statement_" + this.companyName + "_" + this.displayDate + ".pdf";
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
        var EmailBodyText = 'Hello, \n\nAttached is Cash Flow Statement\n\nRegards,\n';
        EmailBodyText += (this.user.firstName + " " + this.user.lastName);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Cash Flow Statement';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    CashFlowStatement.prototype.handleError = function (error) {
    };
    CashFlowStatement.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    CashFlowStatement.prototype.printDiv = function () {
        window.print();
    };
    CashFlowStatement.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    CashFlowStatement.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    CashFlowStatement.prototype.processReport = function (data, report) {
        this.resetData();
        this.columns = report.columns;
        this.rows = report.rows;
        this.result = report;
        this.companyName = data.customizationObj.customizations.includeCompanyName ? data.customizationObj.customizations.customCompanyName : this.actualCompany;
        this.reportName = data.customizationObj.customizations.includeReportTitle ? data.customizationObj.customizations.reportTitle : this.actualReport;
        this.isDisplay = true;
        this.isFailure = false;
        this.isSuccess = true;
    };
    CashFlowStatement.prototype.swapDates = function (report) {
        var temp = report.asOfDate;
        report.asOfDate = report.endDate;
        report.startDate = temp;
    };
    CashFlowStatement.prototype.generateReport = function (data) {
        var _this = this;
        var base = this;
        var report = data.report;
        this.reportReq = report;
        this.populateCustomizationValues(data.customizationObj);
        this.displayDate = moment(report.asOfDate, 'MM/DD/YYYY').format("MMMM DD, YYYY");
        report.companyCurrency = _.find(this.allCompanies, { 'id': report.companyID }).defaultCurrency;
        this.companyCurrency = report.companyCurrency;
        this.activeTab = 'summary';
        if (Session_1.Session.getReportData(this.reportReq.type + '-data')) {
            this.processReport(data, Session_1.Session.getReportData(this.reportReq.type + '-data'));
            this.stateService.addState(new State_1.State('showReportForm', this._router.url, null, null));
            base.resetSections('showTabber');
            report = Session_1.Session.getReportCriteria(this.reportReq.type);
            this.getCashBurnData(_.cloneDeep(report));
            this.getCashTrendData(_.cloneDeep(report));
            this.getCashCompositionData(_.cloneDeep(report));
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
                base.resetSections('showTabber');
                _this.loadingService.triggerLoadingEvent(false);
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.isDisplay = true;
                _this.isFailure = true;
                _this.isSuccess = false;
            });
            this.getCashBurnData(_.cloneDeep(report));
            this.getCashTrendData(_.cloneDeep(report));
            this.getCashCompositionData(_.cloneDeep(report));
        }
    };
    CashFlowStatement.prototype.getCashBurnData = function (report) {
        var _this = this;
        var base = this;
        report.metricsType = "cashBurn";
        this.reportService.generateMetricReport(report, this.company).subscribe(function (metricData) {
            _this.hasCashBurnData = true;
            var categories = [];
            _.each(metricData.CashFlowMOM, function (value, key) {
                categories.push(key);
            });
            _this.cashBurnDataOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Cash Burn',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                subtitle: {
                    text: '',
                    align: 'left'
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: [{
                        categories: categories,
                        crosshair: true,
                        labels: {
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    }],
                tooltip: {
                    shared: true
                },
                yAxis: [{
                        labels: {
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                        opposite: true
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        labels: {
                            format: '{value} %',
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        opposite: true
                    }],
                series: [{
                        name: 'Cash Burn',
                        type: 'line',
                        yAxis: 1,
                        data: _this.getDataArray(metricData["CashFlowMOM"], categories),
                        tooltip: {
                            valueDecimals: 2,
                            valuePrefix: metricData.currencySymbol
                        }
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    CashFlowStatement.prototype.getDataArray = function (obj, categories) {
        var result = [];
        _.each(obj, function (value, key) {
            result.push(value);
        });
        return result;
    };
    CashFlowStatement.prototype.getCashTrendData = function (report) {
        var _this = this;
        var base = this;
        report.metricsType = "cashTrend";
        this.reportService.generateMetricReport(report, this.company).subscribe(function (metricData) {
            _this.hasCashTrendData = true;
            var categories = [];
            _.each(metricData.cashTrendMOM, function (value, key) {
                categories.push(key);
            });
            _this.cashTrendDataOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Cash Trend',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                subtitle: {
                    text: '',
                    align: 'left'
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: [{
                        categories: categories,
                        crosshair: true,
                        labels: {
                            style: {
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    }],
                tooltip: {
                    shared: true
                },
                yAxis: [{
                        labels: {
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            },
                        },
                        title: {
                            text: '',
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        opposite: true
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        }
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        labels: {
                            format: '{value} %',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        opposite: true
                    }],
                series: [{
                        name: 'Cash Trend',
                        type: 'column',
                        yAxis: 1,
                        data: _this.getDataArray(metricData["cashTrendMOM"], categories),
                        tooltip: {
                            valueDecimals: 2,
                            valuePrefix: metricData.currencySymbol
                        }
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    CashFlowStatement.prototype.getCashCompositionData = function (report) {
        var _this = this;
        var base = this;
        report.metricsType = "cashComposition";
        this.reportService.generateMetricReport(report, this.company).subscribe(function (metricData) {
            _this.hasCashCompositionData = true;
            _this.cashCompositionDataOptions = {
                colors: _this.chartColors,
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: true
                },
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Cash Composistion',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>',
                            style: {
                                fontSize: '13px',
                                color: '#878787'
                            }
                        },
                        showInLegend: true
                    }
                },
                series: [{
                        colorByPoint: true,
                        data: base.getCashCompData(metricData.data)
                    }]
            };
            _this.groupedCashCompositionDataOptions = {
                colors: _this.chartColors,
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Cash Composistion'
                },
                subtitle: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: '<b>{point.y}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '<b>{point.name}</b>: {point.y} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        },
                        showInLegend: true
                    }
                },
                series: [{
                        colorByPoint: true,
                        data: base.getCashCompData(metricData.groupedData)
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    CashFlowStatement.prototype.getCashCompData = function (metricData) {
        var result = [];
        _.each(metricData, function (valueObj) {
            _.each(valueObj, function (value, key) {
                result.push({
                    'name': key,
                    'y': value
                });
            });
        });
        return result;
    };
    CashFlowStatement.prototype.getSourceName = function (source) {
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
    CashFlowStatement.prototype.resetData = function () {
    };
    CashFlowStatement.prototype.showDetailTable = function (type, key) {
        this.buildDetailtable(type, key);
        this.stateService.addState(new State_1.State('showTabber', this._router.url, null, null));
        this.resetSections('showDetailedIncome');
    };
    CashFlowStatement.prototype.buildDetailtable = function (type, key) {
        var base = this;
        this.detailedtableData.rows = [];
        this.detailedtableDataOptions.search = true;
        this.detailedtableDataOptions.pageSize = 9;
        this.hasDetailedData = true;
        this.detailedtableData.columns = [
            { "name": "Coa ID", "title": "COA ID", "visible": false },
            { "name": "COA Number", "title": "COA Number" },
            { "name": "COA Name", "title": "COA Name" },
            { "name": "Amount", "title": "Amount", "formatter": function (amount) {
                    if (amount) {
                        amount = parseFloat(amount);
                        return amount.toLocaleString(base.localeFortmat, {
                            style: 'currency',
                            currency: base.companyCurrency,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                }, "sortValue": function (value) {
                    return base.numeralService.value(value);
                }
            }
        ];
        base.RevenueType = base.result[type].displayName;
        _.each(base.result[type][key].coas, function (entry) {
            var row = {};
            _.each(entry, function (value, key) {
                row[key] = entry[key];
            });
            base.detailedtableData.rows.push(row);
        });
        this.titleService.setPageTitle('Cash Flow Statement - ' + base.RevenueType);
    };
    CashFlowStatement.prototype.buildJournalDetailTableData = function () {
        this.JournaldetailedtableData.rows = [];
        this.detailedtableDataOptions.search = true;
        this.detailedtableDataOptions.pageSize = this.drillDownResults.length;
        this.hasJornalDetailedData = false;
        this.JournaldetailedtableData.columns = [
            { "name": "id", "title": "ID", "visible": false },
            { "name": "number", "title": "Number" },
            { "name": "date", "title": "Date", "type": "date", "sortValue": function (value) {
                    return moment(value, "MM/DD/YYYY").valueOf();
                } },
            { "name": "category", "title": "Category" },
            { "name": "source", "title": "Source" },
            { "name": "credit", "title": "Credit", "formatter": function (amount) {
                    if (amount) {
                        amount = parseFloat(amount);
                        return amount.toLocaleString(base.localeFortmat, {
                            style: 'currency',
                            currency: base.companyCurrency,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                }, "sortValue": function (value) {
                    return base.numeralService.value(value);
                },
                "classes": "currency-align currency-padding"
            },
            { "name": "debit", "title": "Debit", "formatter": function (amount) {
                    if (amount) {
                        amount = parseFloat(amount);
                        return amount.toLocaleString(base.localeFortmat, {
                            style: 'currency',
                            currency: base.companyCurrency,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                }, "sortValue": function (value) {
                    return base.numeralService.value(value);
                },
                "classes": "currency-align currency-padding"
            }, { "name": "runningBalance", "title": "Running Balance", "formatter": function (amount) {
                    if (amount) {
                        amount = parseFloat(amount);
                        return amount.toLocaleString(base.localeFortmat, {
                            style: 'currency',
                            currency: base.companyCurrency,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                }, "sortValue": function (value) {
                    return base.numeralService.value(value);
                },
                "classes": "currency-align currency-padding"
            },
            { "name": "entity", "title": "Entity" }
        ];
        var base = this;
        base.drillDownResults.forEach(function (entry) {
            var row = {};
            _.each(Object.keys(entry), function (key) {
                if (key == 'date') {
                    row[key] = base.dateFormater.formatDate(entry[key], base.serviceDateformat, base.dateFormat);
                }
                else if (key == 'credit') {
                    if (entry[key]) {
                        var amount = parseFloat(entry[key]);
                        row[key] = {
                            'options': {
                                "classes": "text-right"
                            },
                            value: amount.toFixed(2)
                        };
                    }
                }
                else if (key == 'debit') {
                    if (entry[key]) {
                        var amount = parseFloat(entry[key]);
                        row[key] = {
                            'options': {
                                "classes": "text-right"
                            },
                            value: amount.toFixed(2)
                        };
                    }
                }
                else if (key == 'source') {
                    row[key] = base.getSourceName(entry[key]);
                }
                else if (key == 'category') {
                    row[key] = base.categoryData[entry[key]];
                }
                else if (key == 'entity') {
                    row[key] = base.getEntityName(entry);
                }
                else {
                    row[key] = entry[key];
                }
            });
            base.JournaldetailedtableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasJornalDetailedData = true;
        });
    };
    CashFlowStatement.prototype.handleSelectActivity = function ($event) {
        this.filterJournals($event['Coa ID']);
    };
    CashFlowStatement.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    CashFlowStatement.prototype.getChartOfAccounts = function (category, key) {
        return category[key].coas || [];
    };
    CashFlowStatement.prototype.getTotals = function (category, key) {
        var totals = [];
        _.forEach(category[key].totals, function (obj, key) {
            if (key != 'othersTotal' && obj.value) {
                totals.push(obj);
            }
        });
        return totals;
    };
    CashFlowStatement.prototype.getTotal = function (category, key, totalType) {
        var totalsObj = category[key].totals;
        var value = totalsObj[totalType].value || 0;
        return this.numeralService.format("$000,000.00", value);
    };
    CashFlowStatement.prototype.getOpexTotals = function (result) {
        var opexObj = result.expenses.opex;
        var opexCoas = opexObj.coas;
        if (opexCoas.length <= 3) {
            return opexCoas;
        }
        var resultOpexTotals = [];
        for (var i = 0; i < 3; i++) {
            resultOpexTotals.push({
                "displayName": opexCoas[i]["COA Name"],
                "value": this.numeralService.format("$000,000.00", opexCoas[i]["Amount"])
            });
        }
        resultOpexTotals.push({
            "displayName": "Others",
            "value": this.numeralService.format("$000,000.00", opexObj.totals.othersTotal.value)
        });
        return resultOpexTotals;
    };
    CashFlowStatement.prototype.getFormattedAmount = function (amount) {
        return this.numeralService.format("$000,000.00", amount);
    };
    CashFlowStatement.prototype.getFormattedPercentage = function (value) {
        return this.numeralService.format("000.00", value);
    };
    CashFlowStatement.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    CashFlowStatement.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    CashFlowStatement.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    CashFlowStatement.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    CashFlowStatement.prototype.gotoPreviousState = function () {
        var prevState = this.stateService.getPrevState();
        if (prevState && prevState.key == 'REPORTS_HOME') {
            this._router.navigate([prevState.url]);
        }
        else {
            this.stateService.pop();
            if (prevState.key == 'showJournals') {
                this.filterJournals(prevState.data.coaID);
                this.resetSections(prevState.key);
            }
            else if (prevState.key == 'showTabber' && this.activeTab == 'detailReport') {
                this.setActiveTab('detailReport');
                this.isTabActive('detailReport');
                this.resetSections(prevState.key);
                this.titleService.setPageTitle("Cash Flow Statement");
            }
            else if (prevState.key == 'showDetailedIncome') {
                this.titleService.setPageTitle('Cash Flow Statement - ' + this.RevenueType);
                this.resetSections(prevState.key);
            }
            else if (prevState.key == 'showReportForm') {
                this.backToSearch();
                this.resetSections(prevState.key);
            }
            else {
                this.resetSections(prevState.key);
                this.titleService.setPageTitle("Cash Flow Statement");
            }
        }
    };
    CashFlowStatement.prototype.sortChartOfAccounts = function (dataObj, key) {
        var result = [];
        var data = dataObj.data || [];
        this.addCOA(result, data, 3);
        result.push({
            "name": "Total " + key,
            "class": "level2",
            "amount": this.getFormattedAmount(dataObj.total || 0)
        });
        return result;
    };
    CashFlowStatement.prototype.addCOA = function (result, data, level) {
        var base = this;
        _.each(data, function (coa) {
            result.push({
                "name": coa['COA Number'] + ' - ' + coa['COA Name'],
                "class": "level" + level,
                "amount": coa['Amount']
            });
            base.addCOA(result, coa.children, level + 1);
        });
    };
    return CashFlowStatement;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], CashFlowStatement.prototype, "reportMail", void 0);
__decorate([
    core_1.ViewChild('drillDown'),
    __metadata("design:type", Object)
], CashFlowStatement.prototype, "drillDown", void 0);
__decorate([
    core_1.ViewChild('hChart1'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], CashFlowStatement.prototype, "hChart1", void 0);
__decorate([
    core_1.ViewChild('hChart2'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], CashFlowStatement.prototype, "hChart2", void 0);
__decorate([
    core_1.ViewChild('hChart3'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], CashFlowStatement.prototype, "hChart3", void 0);
__decorate([
    core_1.ViewChild('hChart4'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], CashFlowStatement.prototype, "hChart4", void 0);
CashFlowStatement = __decorate([
    core_1.Component({
        selector: 'cash-flow-statement',
        templateUrl: '/app/views/CashFlowStatement.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Excel_service_1.ExcelService, Reports_service_1.ReportService,
        Email_service_1.EmailService, Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard,
        forms_1.FormBuilder, LoadingService_1.LoadingService, StateService_1.StateService,
        DateFormatter_service_1.DateFormater, Numeral_service_1.NumeralService, PageTitle_1.pageTitleService])
], CashFlowStatement);
exports.CashFlowStatement = CashFlowStatement;
