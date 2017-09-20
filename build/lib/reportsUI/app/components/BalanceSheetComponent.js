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
var Session_1 = require("qCommon/app/services/Session");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Reports_service_1 = require("../services/Reports.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var payments_constants_1 = require("../constants/payments.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var forms_1 = require("@angular/forms");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var Employees_service_1 = require("qCommon/app/services/Employees.service");
var Qount_constants_2 = require("qCommon/app/constants/Qount.constants");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var BalanceSheetComponent = (function () {
    function BalanceSheetComponent(_router, reportService, _toastService, switchBoard, emailBuilder, loadingService, numeralService, companyService, customerService, employeeService, stateService, dateFormater, titleService) {
        var _this = this;
        this._router = _router;
        this.reportService = reportService;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.emailBuilder = emailBuilder;
        this.loadingService = loadingService;
        this.numeralService = numeralService;
        this.companyService = companyService;
        this.customerService = customerService;
        this.employeeService = employeeService;
        this.stateService = stateService;
        this.dateFormater = dateFormater;
        this.titleService = titleService;
        this.graphTabView = false;
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
        this.hideReportForm = false;
        this.columns = [];
        this.result = {};
        this.drillDownResults = [];
        this.categoryTypes = Qount_constants_2.COA_CATEGORY_TYPES;
        this.allSubTypes = Qount_constants_2.COA_SUBTYPES;
        this.creditTotal = 0;
        this.debitTotal = 0;
        this.actualReport = 'Balance Sheet';
        this.categoryData = { 'depreciation': 'Depreciation', 'payroll': 'Payroll', 'apBalance': 'AP balance', 'arBalance': 'AR balance', 'inventory': 'Inventory', 'credit': 'Credit', 'bill': 'Bill', 'billPayment': 'Payment', 'deposit': 'Deposit', 'expense': 'Expense', 'amortization': 'Amortization', 'openingEntry': 'Opening Entry', 'creditMemo': 'Credit Memo', 'cashApplication': 'Cash Application', 'other': 'Other' };
        this.vendors = [];
        this.employees = [];
        this.customers = [];
        this.incomeStatsColors = ['#05807C', '#F06459', '#87D0CE', '#00B1A6'];
        this.chartColors = ['#44B6E8', '#18457B', '#00B1A9', '#F06459', '#22B473', '#384986', '#4554A4', '#808CC5'];
        this.localeFortmat = 'en-US';
        this.hasJornalDetailedData = false;
        this.journaldetailedtableData = {};
        this.journaldetailedtableOptions = {};
        this.allSections = { showReportForm: true, showTabber: false, showJournals: false, showExpandChart: false };
        this.activeTab = "summary";
        this.showDetailedChart = false;
        this.hasCurrentRatioData = false;
        this.currentRatioDataOptions = {};
        this.hasTotalAssetsTrendData = false;
        this.totalAssetsTrendOptions = {};
        this.hasLiabilitiesCompositionData = false;
        this.liabilitiesCompositionOptions = {};
        this.groupedLiabilitiesCompOptions = {};
        this.titleService.setPageTitle("Balance Sheet");
        this.company = Session_1.Session.getCurrentCompany();
        this.actualCompany = Session_1.Session.getCurrentCompanyName();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.dateFormat = dateFormater.getFormat();
        this.switchBoard.onFetchCompanies.subscribe(function (companies) { return _this.setAllCompanies(companies); });
        this.emailForm = emailBuilder.group({
            Toaddress: ["", forms_1.Validators.required],
            EmailBody: [""],
            cc: [""],
            Emailsubject: [""]
        });
        this.user = Session_1.Session.get('user');
        this.reportSubscription = this.switchBoard.onSubmitReport.subscribe(function (data) { return _this.generateReport(data); });
        this.companyService.vendors(this.company)
            .subscribe(function (vendors) {
            _this.vendors = vendors;
        }, function (error) { });
        this.customerService.customers(this.company)
            .subscribe(function (customers) {
            _this.customers = customers;
        }, function (error) { });
        this.employeeService.employees(this.company)
            .subscribe(function (employees) {
            _this.employees = employees;
        }, function (error) { });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    BalanceSheetComponent.prototype.gotoPreviousState = function () {
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
            else if (prevState.key == 'showReportForm') {
                this.backToSearch();
                this.resetSections(prevState.key);
                this.titleService.setPageTitle("Balance Sheet");
            }
            else {
                this.resetSections(prevState.key);
                this.titleService.setPageTitle("Balance Sheet");
                this.resetLegend();
            }
        }
    };
    BalanceSheetComponent.prototype.getUnformattedValue = function (value) {
        var val = this.numeralService.value(value);
        return val;
    };
    BalanceSheetComponent.prototype.goToJournalEntry = function (journalEntry) {
        this.stateService.addState(new State_1.State('JOURNAL_SELECTED', this._router.url, journalEntry, null));
        var link = ['journalEntry', journalEntry.id];
        this._router.navigate(link);
    };
    BalanceSheetComponent.prototype.getEntityName = function (journalEntry) {
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
    BalanceSheetComponent.prototype.filterJournals = function (coaId) {
        var _this = this;
        var data = {
            reportType: 'balanceSheet',
            asOfDate: this.reportReq.asOfDate,
            basis: this.reportReq.basis,
            coaID: coaId
        };
        this.drillDownResults = [];
        this.stateService.addState(new State_1.State('showTabber', this._router.url, data, null));
        this.resetSections("showJournals");
        this.loadingService.triggerLoadingEvent(true);
        this.reportService.drillDownReport(this.company, data)
            .subscribe(function (results) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.drillDownResults = results;
            _this.buildJournalDetailTableData();
            _this.titleService.setPageTitle("JOURNALS");
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    BalanceSheetComponent.prototype.buildJournalDetailTableData = function () {
        this.journaldetailedtableData.rows = [];
        this.journaldetailedtableOptions.search = true;
        this.journaldetailedtableOptions.pageSize = this.drillDownResults.length;
        this.hasJornalDetailedData = false;
        this.journaldetailedtableData.columns = [
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
            base.journaldetailedtableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasJornalDetailedData = true;
        });
    };
    BalanceSheetComponent.prototype.getSourceName = function (source) {
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
    BalanceSheetComponent.prototype.exportToPDF = function () {
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
            link[0].download = "Balance Sheet " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    BalanceSheetComponent.prototype.getCOAType = function (type) {
        var typeObj = _.find(this.categoryTypes, { 'value': type });
        return typeObj ? typeObj.name : type;
    };
    BalanceSheetComponent.prototype.getCOASubType = function (type, subType) {
        var subTypeObj = _.find(this.allSubTypes[type], { 'value': subType });
        return subTypeObj ? subTypeObj.name : subType;
    };
    BalanceSheetComponent.prototype.backToSearch = function () {
        Session_1.Session.clearReportCriteria(this.reportReq.type);
        Session_1.Session.clearReportData(this.reportReq.type + '-data');
    };
    BalanceSheetComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(".reveal-overlay").remove();
    };
    BalanceSheetComponent.prototype.exportToExcel = function () {
        var _this = this;
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "books";
        finalObj["reportName"] = "balanceSheet";
        finalObj["reportType"] = "excel";
        finalObj["sendEmail"] = "false";
        finalObj["Authorization"] = "Bearer " + Session_1.Session.getToken();
        finalObj["companyId"] = finalObj.companyID;
        finalObj["fileName"] = "Trail Balance Report_" + this.companyName + "_" + this.displayDate + ".excel";
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.EXCEL_SERVICE, finalObj)
            .subscribe(function (data) {
            var blob = new Blob([data._body], { type: "application/vnd.ms-excel" });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link['download'] = "Trail_Balance_Report_" + new Date() + ".xls";
            link.click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into Excel");
        });
        jQuery('#example-dropdown').foundation('close');
    };
    BalanceSheetComponent.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    BalanceSheetComponent.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Trail Balance Report\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Trail Balance Report';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    BalanceSheetComponent.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    BalanceSheetComponent.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "balanceSheet";
        emailReq["reportType"] = "pdf";
        emailReq["Authorization"] = "Bearer " + Session_1.Session.getToken();
        emailReq["userId"] = this.user.id;
        emailReq["companyId"] = emailReq.companyID;
        emailReq["fileName"] = "Trail Balance Report_" + this.companyName + "_" + this.displayDate + ".pdf";
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
        var EmailBodyText = 'Hello, \n\nAttached is Trail Balance Report\n\nRegards,\n';
        EmailBodyText += (this.user.firstName + " " + this.user.lastName);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Trail Balance Report';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    BalanceSheetComponent.prototype.handleError = function (error) {
    };
    BalanceSheetComponent.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    BalanceSheetComponent.prototype.printDiv = function () {
        window.print();
    };
    BalanceSheetComponent.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    BalanceSheetComponent.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    BalanceSheetComponent.prototype.processReport = function (data, report) {
        var base = this;
        this.hideReportForm = true;
        this.resetData();
        this.columns = report.columns;
        this.result = report;
        this.header = report.metadata.header;
        this.footer = report.metadata.footer;
        this.companyName = data.customizationObj.customizations.includeCompanyName ? data.customizationObj.customizations.customCompanyName : this.actualCompany;
        this.reportName = data.customizationObj.customizations.includeReportTitle ? data.customizationObj.customizations.reportTitle : this.actualReport;
        this.isDisplay = true;
        this.isFailure = false;
        this.isSuccess = true;
    };
    BalanceSheetComponent.prototype.generateReport = function (data) {
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
            this.resetSections("showTabber");
            this.getCurrentRatioTrendData(_.cloneDeep(report));
            this.getTotalAssetsTrendData(_.cloneDeep(report));
            this.getLiabilitiesCompositionData(_.cloneDeep(report));
        }
        else {
            if (report.basis && report.asOfDate) {
                this.loadingService.triggerLoadingEvent(true);
                Session_1.Session.setReportCriteria(this.reportReq.type, this.reportReq);
                this.reportService.generateAccountReport(report, this.company).subscribe(function (report) {
                    Session_1.Session.setReportData(_this.reportReq.type + '-data', report);
                    _this.processReport(data, report);
                    _this.stateService.addState(new State_1.State('showReportForm', _this._router.url, null, null));
                    _this.resetSections("showTabber");
                    _this.loadingService.triggerLoadingEvent(false);
                }, function (error) {
                    _this.loadingService.triggerLoadingEvent(false);
                    _this.hideReportForm = true;
                    _this.isDisplay = true;
                    _this.isFailure = true;
                    _this.isSuccess = false;
                });
                this.getCurrentRatioTrendData(_.cloneDeep(report));
                this.getTotalAssetsTrendData(_.cloneDeep(report));
                this.getLiabilitiesCompositionData(_.cloneDeep(report));
            }
        }
    };
    BalanceSheetComponent.prototype.showOtherCharts = function (type) {
        this.showDetailedChart = true;
        if (type == 'currentRatioTrend') {
            this.currentRatioDataOptions.legend = { enabled: true };
            this.detailedReportChartOptions = this.currentRatioDataOptions;
        }
        if (type == 'totalAssetsChart') {
            this.totalAssetsTrendOptions.legend = { enabled: true };
            this.detailedReportChartOptions = this.totalAssetsTrendOptions;
        }
        if (type == 'liabilitiesComposition') {
            this.detailedReportChartOptions = this.liabilitiesCompositionOptions;
        }
        this.stateService.addState(new State_1.State('showTabber', this._router.url, null, this.activeTab));
        this.resetSections('showExpandChart');
    };
    BalanceSheetComponent.prototype.resetLegend = function () {
        this.currentRatioDataOptions.legend = { enabled: false };
        this.totalAssetsTrendOptions.legend = { enabled: false };
    };
    BalanceSheetComponent.prototype.getCurrentRatioTrendData = function (report) {
        var _this = this;
        var base = this;
        report.metricsType = "currentRatioTrend";
        this.reportService.generateMetricReport(report, this.company).subscribe(function (metricData) {
            _this.hasCurrentRatioData = true;
            _this.currentRatioDataOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Current Ratio Trend',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                subtitle: {
                    text: '',
                    align: 'left',
                    y: 25,
                    style: {
                        fontSize: '15'
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: [{
                        categories: metricData.categories,
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
                yAxis: [{
                        labels: {
                            formatter: function () {
                                return base.getFormattedAmount(this.value);
                            },
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        }
                    }, {
                        labels: {
                            format: '{value}',
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        opposite: true
                    }],
                tooltip: {
                    shared: true
                },
                series: [{
                        name: 'Current Assets',
                        type: 'column',
                        yAxis: 0,
                        data: _this.getCurrentRatioDataArray(metricData, "Current Assets", metricData.categories),
                        tooltip: {
                            valueDecimals: 2,
                            valuePrefix: metricData.currencySymbol
                        }
                    }, {
                        name: 'Current Liabilities',
                        type: 'column',
                        yAxis: 0,
                        data: _this.getCurrentRatioDataArray(metricData, "Current Liabilities", metricData.categories),
                        tooltip: {
                            valueDecimals: 2,
                            valuePrefix: metricData.currencySymbol
                        }
                    }, {
                        name: 'Current Ratio Trend',
                        type: 'line',
                        yAxis: 1,
                        data: _this.getCurrentRatioDataArray(metricData, "Current Ratio", metricData.categories),
                        dashStyle: 'shortdot',
                        tooltip: {
                            valueDecimals: 2,
                            valueSuffix: ''
                        }
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    BalanceSheetComponent.prototype.getTotalAssetsTrendData = function (report) {
        var _this = this;
        var base = this;
        report.metricsType = "totalAssetsTrend";
        this.reportService.generateMetricReport(report, this.company).subscribe(function (metricData) {
            _this.hasTotalAssetsTrendData = true;
            _this.totalAssetsTrendOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Total Assets Trend',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                subtitle: {
                    text: '',
                    align: 'left',
                    y: 25,
                    style: {
                        fontSize: '15'
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: [{
                        categories: metricData.categories,
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
                        name: 'Total Assets',
                        type: 'column',
                        yAxis: 1,
                        data: _this.getAssetsDataArray(metricData["Total Assets"], metricData.categories),
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
    BalanceSheetComponent.prototype.getLiabilitiesCompositionData = function (report) {
        var _this = this;
        var base = this;
        report.metricsType = "liabilitiesComposition";
        this.reportService.generateMetricReport(report, this.company).subscribe(function (metricData) {
            _this.hasLiabilitiesCompositionData = true;
            _this.liabilitiesCompositionOptions = {
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
                    text: 'Liabilities Composistion',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                subtitle: {
                    text: '',
                    align: 'left',
                    y: 25,
                    style: {
                        fontSize: '15'
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: true
                },
                tooltip: {
                    pointFormat: '<b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
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
                        data: base.getLiabilitiesData(metricData.data)
                    }]
            };
            _this.groupedLiabilitiesCompOptions = {
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
                    text: 'Liabilities Composistion',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
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
                    pointFormat: '<b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        },
                        showInLegend: true
                    }
                },
                series: [{
                        colorByPoint: true,
                        data: base.getLiabilitiesData(metricData.groupedData)
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    BalanceSheetComponent.prototype.getLiabilitiesData = function (dataObj) {
        var result = [];
        _.each(dataObj, function (data) {
            result.push({
                'name': data.name,
                'y': data.value
            });
        });
        return result;
    };
    BalanceSheetComponent.prototype.getAssetsDataArray = function (dataObj, categories) {
        var result = [];
        _.each(categories, function (category) {
            result.push(dataObj[category] || 0);
        });
        return result;
    };
    BalanceSheetComponent.prototype.getCurrentRatioDataArray = function (dataObj, key, categories) {
        var result = [];
        _.each(categories, function (category) {
            result.push(dataObj[category][key] || 0);
        });
        return result;
    };
    BalanceSheetComponent.prototype.resetData = function () {
    };
    BalanceSheetComponent.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    BalanceSheetComponent.prototype.getFormattedAmount = function (amount) {
        return this.numeralService.format("$000,000.00", amount);
    };
    BalanceSheetComponent.prototype.getTotal = function (obj, key, totalKey) {
        var value = obj[key].total || 0;
        return this.numeralService.format("$000,000.00", value);
    };
    BalanceSheetComponent.prototype.getCategories = function (obj, key) {
        var base = this;
        var result = [];
        var rows = obj[key].rows;
        _.each(rows, function (row) {
            result.push({
                "displayName": row,
                "class": 'level1',
                "value": base.getFormattedAmount(obj[key][row].total)
            });
            var childRows = obj[key][row].rows;
            _.each(childRows, function (childRow) {
                result.push({
                    "displayName": childRow,
                    "class": 'level2',
                    "value": base.getFormattedAmount(obj[key][row][childRow].total)
                });
            });
        });
        return result;
    };
    BalanceSheetComponent.prototype.sortChartOfAccounts = function (data, flag) {
        var base = this;
        var flatDataArray = [];
        var chartOfAccounts = [];
        _.each(data, function (level) {
            flatDataArray.push(level);
            base.flatChildrenArray(level, flatDataArray);
        });
        var parents = _.filter(flatDataArray, function (coa) {
            return !coa.Parent;
        });
        _.each(parents, function (parent) {
            parent.level = flag ? 2 : 1;
            parent.class = "coa-child-" + parent.level;
            chartOfAccounts.push(parent);
            base.addChildren(parent, chartOfAccounts);
            if (parent.children.length > 0) {
                chartOfAccounts.push({
                    "class": "coa-child-" + parent.level,
                    "COA Name": "Total " + parent["COA Name"],
                    "Amount": parent["total"],
                    "isTotal": true
                });
            }
        });
        return chartOfAccounts;
    };
    BalanceSheetComponent.prototype.addChildren = function (coa, chartOfAccounts) {
        var base = this;
        _.each(coa.children, function (child) {
            child.level = coa.level + 1;
            child.class = "coa-child-" + child.level;
            chartOfAccounts.push(child);
            base.addChildren(child, chartOfAccounts);
        });
    };
    BalanceSheetComponent.prototype.flatChildrenArray = function (level, flatDataArray) {
        var base = this;
        _.each(level.children, function (level) {
            flatDataArray.push(level);
            base.flatChildrenArray(level, flatDataArray);
        });
    };
    BalanceSheetComponent.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    BalanceSheetComponent.prototype.isTabActive = function (tab) {
        return this.activeTab == tab;
    };
    BalanceSheetComponent.prototype.setActiveTab = function (tab) {
        this.activeTab = tab;
        this.resetSelection();
        jQuery("#a-" + tab).attr("aria-selected", "true");
    };
    BalanceSheetComponent.prototype.resetSelection = function () {
        jQuery("#a-summary").attr("aria-selected", "false");
        jQuery("#a-detailReport").attr("aria-selected", "flase");
    };
    return BalanceSheetComponent;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], BalanceSheetComponent.prototype, "reportMail", void 0);
BalanceSheetComponent = __decorate([
    core_1.Component({
        selector: 'balance-sheet',
        templateUrl: '/app/views/BalanceSheet.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Reports_service_1.ReportService, Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard,
        forms_1.FormBuilder, LoadingService_1.LoadingService, Numeral_service_1.NumeralService,
        Companies_service_1.CompaniesService, Customers_service_1.CustomersService, Employees_service_1.EmployeeService,
        StateService_1.StateService, DateFormatter_service_1.DateFormater, PageTitle_1.pageTitleService])
], BalanceSheetComponent);
exports.BalanceSheetComponent = BalanceSheetComponent;
