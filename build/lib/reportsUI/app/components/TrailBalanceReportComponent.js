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
var TrailBalanceReportComponent = (function () {
    function TrailBalanceReportComponent(_router, reportService, _toastService, switchBoard, emailBuilder, loadingService, numeralService, companyService, customerService, employeeService, stateService, dateFormater, titleService) {
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
        this.columns = [];
        this.results = [];
        this.drillDownResults = [];
        this.categoryTypes = Qount_constants_2.COA_CATEGORY_TYPES;
        this.allSubTypes = Qount_constants_2.COA_SUBTYPES;
        this.creditTotal = 0;
        this.debitTotal = 0;
        this.actualReport = 'Trail Balance Report';
        this.categoryData = { 'depreciation': 'Depreciation', 'payroll': 'Payroll', 'apBalance': 'AP balance', 'arBalance': 'AR balance', 'inventory': 'Inventory', 'credit': 'Credit', 'bill': 'Bill', 'billPayment': 'Payment', 'deposit': 'Deposit', 'expense': 'Expense', 'amortization': 'Amortization', 'openingEntry': 'Opening Entry', 'creditMemo': 'Credit Memo', 'cashApplication': 'Cash Application', 'other': 'Other' };
        this.allSections = { showReportForm: true, showReportData: false, showJournals: false };
        this.vendors = [];
        this.employees = [];
        this.customers = [];
        this.localeFortmat = 'en-US';
        this.hasJornalDetailedData = false;
        this.journaldetailedtableData = {};
        this.journaldetailedtableOptions = {};
        this.titleService.setPageTitle("Trail Balance Report");
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
    TrailBalanceReportComponent.prototype.getUnformattedValue = function (value) {
        var val = this.numeralService.value(value);
        return val;
    };
    TrailBalanceReportComponent.prototype.goToJournalEntry = function (journalEntry) {
        this.stateService.addState(new State_1.State('JOURNAL_SELECTED', this._router.url, journalEntry, null));
        var link = ['journalEntry', journalEntry.id];
        this._router.navigate(link);
    };
    TrailBalanceReportComponent.prototype.getEntityName = function (journalEntry) {
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
    TrailBalanceReportComponent.prototype.filterJournals = function (coaId) {
        var _this = this;
        var data = {
            reportType: 'tb',
            asOfDate: this.reportReq.asOfDate,
            basis: this.reportReq.basis,
            coaID: coaId
        };
        this.drillDownResults = [];
        this.loadingService.triggerLoadingEvent(true);
        this.reportService.drillDownReport(this.company, data)
            .subscribe(function (results) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.drillDownResults = results;
            _this.stateService.addState(new State_1.State('showReportData', _this._router.url, data, null));
            _this.resetSections('showJournals');
            _this.buildJournalDetailTableData();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
        this.titleService.setPageTitle("Journal Details");
    };
    TrailBalanceReportComponent.prototype.buildJournalDetailTableData = function () {
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
            },
            { "name": "runningBalance", "title": "Running Balance", "formatter": function (amount) {
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
    TrailBalanceReportComponent.prototype.getSourceName = function (source) {
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
    TrailBalanceReportComponent.prototype.exportToPDF = function () {
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
            link[0].download = "Trail Balance " + moment(new Date()).format("MMMM DD, YYYY HH:mm a") + ".pdf";
            link[0].click();
        }, function (error) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    TrailBalanceReportComponent.prototype.getCOAType = function (type) {
        var typeObj = _.find(this.categoryTypes, { 'value': type });
        return typeObj ? typeObj.name : type;
    };
    TrailBalanceReportComponent.prototype.getCOASubType = function (type, subType) {
        var subTypeObj = _.find(this.allSubTypes[type], { 'value': subType });
        return subTypeObj ? subTypeObj.name : subType;
    };
    TrailBalanceReportComponent.prototype.backToSearch = function () {
        this.titleService.setPageTitle("Trail Balance Report");
        Session_1.Session.clearReportCriteria(this.reportReq.type);
        Session_1.Session.clearReportData(this.reportReq.type + '-data');
    };
    TrailBalanceReportComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.reportSubscription.unsubscribe();
        jQuery(".reveal-overlay").remove();
    };
    TrailBalanceReportComponent.prototype.exportToExcel = function () {
        var _this = this;
        var finalObj = this.reportReq;
        finalObj["applicationName"] = "books";
        finalObj["reportName"] = "tb";
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
    TrailBalanceReportComponent.prototype.styleToObject = function (cell) {
        var styleObj = {};
        var requiredStyleAttr = ['background-color', 'text-decoration', 'font-weight', 'color'];
        if (cell.length > 0) {
            requiredStyleAttr.forEach(function (styleAttr) {
                styleObj[styleAttr] = cell.css(styleAttr);
            });
        }
        return styleObj;
    };
    TrailBalanceReportComponent.prototype.ngAfterViewInit = function () {
        var EmailBodyControl = this.emailForm.controls['EmailBody'];
        var EmailBodyText = 'Hello, \n\nAttached is Trail Balance Report\n\nRegards,\n';
        EmailBodyText += (this.user.first_name + " " + this.user.last_name);
        EmailBodyControl.patchValue(EmailBodyText);
        var EmailsubjectControl = this.emailForm.controls['Emailsubject'];
        var EmailsubjectText = 'Your Trail Balance Report';
        EmailsubjectControl.patchValue(EmailsubjectText);
    };
    TrailBalanceReportComponent.prototype.setAllCompanies = function (companies) {
        this.allCompanies = companies;
    };
    TrailBalanceReportComponent.prototype.doEmail = function (event) {
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
        emailReq["reportName"] = "tb";
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
    TrailBalanceReportComponent.prototype.handleError = function (error) {
    };
    TrailBalanceReportComponent.prototype.goToReport = function () {
        var link = ['Reports'];
        this._router.navigate(link);
    };
    TrailBalanceReportComponent.prototype.printDiv = function () {
        window.print();
    };
    TrailBalanceReportComponent.prototype.openemail = function () {
        this.showEmail = true;
        this.emailAddress = [this.user.id];
        jQuery(this.reportMail.nativeElement).foundation('open');
    };
    TrailBalanceReportComponent.prototype.populateCustomizationValues = function (customObj) {
        this.customObj = customObj;
        this.datePrepared = moment(new Date()).format("DD-MM-YYYY");
        this.timePrepared = moment(new Date()).format("HH:mm:ss A");
        this.showInRed = customObj.customizations.showInRed;
    };
    TrailBalanceReportComponent.prototype.processReport = function (data, report) {
        var base = this;
        this.resetData();
        this.columns = report.columns;
        this.results = report.data;
        this.debitTotal = report.totals.Debit;
        this.creditTotal = report.totals.Credit;
        this.header = report.metadata.header;
        this.footer = report.metadata.footer;
        _.each(this.results, function (result) {
            result.SubType = base.getCOASubType(result.Type, result.SubType);
            result.Type = base.getCOAType(result.Type);
        });
        this.companyName = data.customizationObj.customizations.includeCompanyName ? data.customizationObj.customizations.customCompanyName : this.actualCompany;
        this.reportName = data.customizationObj.customizations.includeReportTitle ? data.customizationObj.customizations.reportTitle : this.actualReport;
        this.isDisplay = true;
        this.isFailure = false;
        this.isSuccess = true;
    };
    TrailBalanceReportComponent.prototype.generateReport = function (data) {
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
            base.resetSections('showReportData');
        }
        else {
            if (report.basis && report.asOfDate) {
                this.loadingService.triggerLoadingEvent(true);
                Session_1.Session.setReportCriteria(this.reportReq.type, this.reportReq);
                this.reportService.generateAccountReport(report, this.company).subscribe(function (report) {
                    Session_1.Session.setReportData(_this.reportReq.type + '-data', report);
                    _this.processReport(data, report);
                    _this.stateService.addState(new State_1.State('showReportForm', _this._router.url, null, null));
                    base.resetSections('showReportData');
                    _this.loadingService.triggerLoadingEvent(false);
                    _this.isDisplay = true;
                    _this.isFailure = false;
                    _this.isSuccess = true;
                }, function (error) {
                    _this.loadingService.triggerLoadingEvent(false);
                    _this.isDisplay = true;
                    _this.isFailure = true;
                    _this.isSuccess = false;
                });
            }
        }
    };
    TrailBalanceReportComponent.prototype.resetSections = function (activeSection) {
        var base = this;
        _.each(this.allSections, function (val, key) {
            base.allSections[key] = false;
            if (key == activeSection) {
                base.allSections[key] = true;
            }
        });
    };
    TrailBalanceReportComponent.prototype.gotoPreviousState = function () {
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
            else if (prevState.key == 'showReportData') {
                this.resetSections(prevState.key);
                this.titleService.setPageTitle("Trail Balance Report");
            }
            else if (prevState.key == 'showReportForm') {
                this.backToSearch();
                this.resetSections(prevState.key);
            }
            else {
                this.resetSections(prevState.key);
            }
        }
    };
    TrailBalanceReportComponent.prototype.resetData = function () {
    };
    TrailBalanceReportComponent.prototype.toggleView = function (event) {
        /*
         * Todo: need to convert this into directive if UI is approved, need event handling
         * */
        this.graphTabView = !this.graphTabView;
        var target = event.target || event.srcElement || event.currentTarget;
        jQuery(".tab-view-name").siblings(".tab-view-name").not(".active").addClass("active").siblings().removeClass("active");
    };
    return TrailBalanceReportComponent;
}());
__decorate([
    core_1.ViewChild('reportMail'),
    __metadata("design:type", Object)
], TrailBalanceReportComponent.prototype, "reportMail", void 0);
__decorate([
    core_1.ViewChild('drillDown'),
    __metadata("design:type", Object)
], TrailBalanceReportComponent.prototype, "drillDown", void 0);
TrailBalanceReportComponent = __decorate([
    core_1.Component({
        selector: 'tb-report',
        templateUrl: '/app/views/TrailBalanceReport.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Reports_service_1.ReportService, Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard,
        forms_1.FormBuilder, LoadingService_1.LoadingService, Numeral_service_1.NumeralService,
        Companies_service_1.CompaniesService, Customers_service_1.CustomersService, Employees_service_1.EmployeeService,
        StateService_1.StateService, DateFormatter_service_1.DateFormater, PageTitle_1.pageTitleService])
], TrailBalanceReportComponent);
exports.TrailBalanceReportComponent = TrailBalanceReportComponent;
