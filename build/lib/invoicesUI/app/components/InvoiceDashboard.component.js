/**
 * Created by seshu on 26-02-2016.
 */
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
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Invoices_service_1 = require("../services/Invoices.service");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var Rx_1 = require("rxjs/Rx");
var InvoiceDashboardComponent = (function () {
    function InvoiceDashboardComponent(_router, _route, toastService, loadingService, companiesService, invoiceService, customerService, titleService, stateService, numeralService, switchBoard, reportService) {
        var _this = this;
        this._router = _router;
        this._route = _route;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.companiesService = companiesService;
        this.invoiceService = invoiceService;
        this.customerService = customerService;
        this.titleService = titleService;
        this.stateService = stateService;
        this.numeralService = numeralService;
        this.switchBoard = switchBoard;
        this.reportService = reportService;
        this.tabBackground = "#d45945";
        this.selectedTabColor = "#d45945";
        this.tabDisplay = [{ 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }];
        this.bgColors = [
            '#d45945',
            '#d47e47',
            '#2980b9',
            '#3dc36f'
        ];
        this.statesOrder = ["draft", "sent", "opened", "partially_Paid", "paid"];
        this.proposalsTableData = {};
        this.proposalsTableOptions = { search: true, pageSize: 10 };
        this.paidInvoiceTableData = {};
        this.paidInvoiceTableOptions = { search: true, pageSize: 10 };
        this.invoiceTableData = {};
        this.invoiceTableOptions = { search: true, pageSize: 10, selectable: false };
        this.badges = [];
        this.selectedTab = 0;
        this.isLoading = true;
        this.localBadges = {};
        this.hideBoxes = true;
        this.selectedColor = 'red-tab';
        this.hasInvoices = false;
        this.hasPaidInvoices = false;
        this.hasProposals = false;
        this.companyCurrency = 'USD';
        this.localeFortmat = 'en-US';
        this.customers = [];
        this.payments = [];
        this.actions = [];
        this.invoiceActions = [{
                'className': 'ion-edit',
                'name': 'Edit',
                'value': 'edit'
            },
            { 'className': 'ion-ios-copy-outline',
                'name': 'Duplicate',
                'value': 'duplicate'
            }, {
                'className': 'ion-social-usd',
                'name': 'Mark as paid',
                'value': 'paid'
            }, {
                'className': 'ion-android-send',
                'name': 'Mark as sent',
                'value': 'sent'
            }, { 'className': 'ion-ios-trash', 'name': 'Delete', 'value': 'delete' }];
        this.invoiceMultipleSelect = [{
                'className': 'ion-android-send',
                'name': 'Mark as sent',
                'value': 'sent'
            }, { 'className': 'ion-ios-trash', 'name': 'Delete', 'value': 'delete' }];
        this.paymentActions = [{
                'className': 'ion-edit',
                'name': 'Edit',
                'value': 'edit'
            }];
        this.selectedTableRows = [];
        this.hasBoxData = false;
        this.reportRequest = {};
        this.showDetailedChart = false;
        this.routeSubscribe = {};
        this.metrics = {};
        this.chartColors = ['#44B6E8', '#18457B', '#00B1A9', '#F06459', '#22B473', '#384986', '#4554A4', '#808CC5'];
        this.hasTotalReceivableData = false;
        this.hasAgingByCustomerData = false;
        this.hasARAgingSummaryData = false;
        this.currentCompanyId = Session_1.Session.getCurrentCompany();
        this.loadCustomers(this.currentCompanyId);
        this.stateService.clearAllStates();
        var today = moment();
        var fiscalStartDate = moment(Session_1.Session.getFiscalStartDate(), 'MM/DD/YYYY');
        this.currentFiscalStart = moment([today.get('year'), fiscalStartDate.get('month'), 1]);
        if (today < fiscalStartDate) {
            this.currentFiscalStart = moment([today.get('year') - 1, fiscalStartDate.get('month'), 1]);
        }
        this.currentFiscalStart = this.currentFiscalStart.format('MM/DD/YYYY');
        this.asOfDate = moment().format('MM/DD/YYYY');
        this.reportRequest = {
            "type": "aging",
            "companyID": this.currentCompanyId,
            "companyCurrency": this.companyCurrency,
            "asOfDate": this.asOfDate,
            "daysPerAgingPeriod": "30",
            "numberOfPeriods": "3",
        };
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.selectedTab = params['tabId'];
            _this.selectTab(_this.selectedTab, "");
            _this.hasInvoices = false;
            _this.hasPaidInvoices = false;
            _this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        });
        this.localBadges = JSON.parse(sessionStorage.getItem("localInvoicesBadges"));
        if (!this.localBadges) {
            this.localBadges = { proposal_count: 0, payment_count: 0, invoice_count: 0 };
            sessionStorage.setItem('localInvoicesBadges', JSON.stringify(this.localBadges));
        }
        else {
            this.localBadges = JSON.parse(sessionStorage.getItem("localInvoicesBadges"));
        }
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showDetailedChart) {
                _this.showDetailedChart = !_this.showDetailedChart;
            }
        });
        this.getBadgesCount();
    }
    InvoiceDashboardComponent.prototype.getBadgesCount = function () {
        var _this = this;
        this.invoiceService.getInvoicesCount().subscribe(function (badges) {
            sessionStorage.setItem("localInvoicesBadges", JSON.stringify(badges.badges));
            _this.localBadges = JSON.parse(sessionStorage.getItem("localInvoicesBadges"));
        }, function (error) { return _this.handleError(error); });
    };
    InvoiceDashboardComponent.prototype.addInvoiceDashboardState = function () {
        this.stateService.addState(new State_1.State('Invoices', this._router.url, null, this.selectedTab));
    };
    InvoiceDashboardComponent.prototype.loadCustomers = function (companyId) {
        var _this = this;
        this.customerService.customers(companyId)
            .subscribe(function (customers) {
            _this.customers = customers;
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load your customers");
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    InvoiceDashboardComponent.prototype.animateBoxInfo = function (boxInfo) {
        this.animateValue('payables', boxInfo.payables);
        this.animateValue('pastDue', boxInfo.pastDue);
        this.animateValue('dueToday', boxInfo.dueToday);
        this.animateValue('dueThisWeek', boxInfo.dueThisWeek);
    };
    InvoiceDashboardComponent.prototype.animateValue = function (param, value) {
        var base = this;
        jQuery({ val: value / 2 }).stop(true).animate({ val: value }, {
            duration: 2000,
            easing: "easeOutExpo",
            step: function () {
                var _val = this.val;
                base.boxInfo[param] = Number(_val.toFixed(2));
            }
        }).promise().done(function () {
            base.boxInfo[param] = value;
        });
    };
    InvoiceDashboardComponent.prototype.selectTab = function (tabNo, color) {
        var _this = this;
        this.selectedTab = tabNo;
        this.selectedColor = color;
        this.selectedTableRows = [];
        var base = this;
        this.addInvoiceDashboardState();
        this.loadingService.triggerLoadingEvent(true);
        this.tabDisplay.forEach(function (tab, index) {
            base.tabDisplay[index] = { 'display': 'none' };
        });
        this.tabDisplay[tabNo] = { 'display': 'block' };
        this.tabBackground = this.bgColors[tabNo];
        if (this.selectedTab == 0) {
            this.isLoading = true;
            this.loadingService.triggerLoadingEvent(true);
            this.getDashboardData();
            this.titleService.setPageTitle("Invoice Dashboard");
        }
        else if (this.selectedTab == 1) {
            this.isLoading = false;
            this.loadingService.triggerLoadingEvent(false);
            this.titleService.setPageTitle("Proposals");
        }
        else if (this.selectedTab == 2) {
            this.isLoading = false;
            this.titleService.setPageTitle("invoices");
            this.invoiceService.allInvoices().subscribe(function (invoices) {
                if (invoices.invoices) {
                    var sortedCollection = _.sortBy(invoices.invoices, function (item) {
                        return base.statesOrder.indexOf(item.state);
                    });
                    _this.buildInvoiceTableData(sortedCollection);
                }
                else {
                    _this.closeLoading();
                }
            }, function (error) { return _this.handleError(error); });
        }
        else if (this.selectedTab == 3) {
            this.isLoading = false;
            this.titleService.setPageTitle("Payments");
            this.invoiceService.getPayments().subscribe(function (payments) {
                _this.payments = payments;
                _this.buildPaymentsTableData();
            }, function (error) { return _this.handleError(error); });
        }
    };
    InvoiceDashboardComponent.prototype.getDashboardData = function () {
        var _this = this;
        var reportRequest = _.clone(this.reportRequest);
        reportRequest.startDate = this.currentFiscalStart;
        reportRequest.asOfDate = this.asOfDate;
        var boxData = this.invoiceService.getDashboardBoxData(this.currentCompanyId, this.currentFiscalStart, this.asOfDate);
        reportRequest.type = "cashFlowStatement";
        var cashFlowstatement = this.reportService.generateAccountReport(reportRequest, this.currentCompanyId);
        Rx_1.Observable.forkJoin(boxData, cashFlowstatement).subscribe(function (results) {
            _this.hasBoxData = true;
            _this.metrics["totalReceivable"] = _this.formatAmount(results[0].totalReceivableAmount);
            _this.metrics["totalPastDue"] = _this.formatAmount(results[0].totalPastDueAmount);
            _this.metrics["invoiceCount"] = _this.numeralService.format('0', results[0].invoiceCount);
            _this.metrics["openedInvoices"] = _this.numeralService.format('0', results[0].openedInvoices);
            _this.metrics["sentInvoices"] = _this.numeralService.format('0', results[0].sentInvoices);
            _this.metrics["totalReceivedLast30Days"] = _this.formatAmount(results[0].totalReceivedLast30Days);
            _this.metrics["cashBalance"] = _this.formatAmount(results[1].cashAtEndOfPeriod || 0);
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to get box data");
        });
        this.getTotalReceivablesByCustomer();
        this.getAgingTotalReceivablesByCustomer();
        this.getCustomerAgingSummary();
    };
    InvoiceDashboardComponent.prototype.getTotalReceivablesByCustomer = function () {
        var _this = this;
        var base = this;
        this.reportRequest.metricsType = 'totalReceivablesByCustomer';
        this.reportService.generateMetricReport(this.reportRequest, this.currentCompanyId)
            .subscribe(function (metricData) {
            _this.hasTotalReceivableData = true;
            _this.totalReceivablesChartOptions = {
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
                    text: 'Total Receivables By Customer',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
                },
                tooltip: {
                    pointFormatter: function () {
                        return '<b>Total: ' + base.formatAmount(this.y) + '</b><b>(' + base.getFormattedPercentage(this.percentage) + '%)</b>';
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                series: [{
                        colorByPoint: true,
                        data: base.getOpexData(metricData.data)
                    }]
            };
            _this.groupedTotalReceivablesChartOptions = {
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
                    text: 'Total Receivables By Customer',
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
                    pointFormatter: function () {
                        return '<b>Total: ' + base.formatAmount(this.y) + '</b><b>(' + base.getFormattedPercentage(this.percentage) + '%)</b>';
                    }
                },
                pie: {
                    dataLabels: {
                        enabled: true,
                        inside: true,
                        formatter: function () {
                            return this.y;
                        },
                        distance: -40,
                        color: 'white'
                    },
                    showInLegend: true
                },
                series: [{
                        colorByPoint: true,
                        data: base.getOpexData(metricData.groupedData)
                    }]
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    InvoiceDashboardComponent.prototype.showOtherCharts = function (type) {
        this.showDetailedChart = true;
        if (type == 'totalReceivablesChart') {
            this.detailedReportChartOptions = _.clone(this.totalReceivablesChartOptions);
            this.detailedReportChartOptions.legend = { enabled: true };
        }
        else if (type == 'agingByCustomer') {
            this.detailedReportChartOptions = _.clone(this.agingByCustomer);
            this.detailedReportChartOptions.legend = { enabled: true };
        }
        else if (type == 'customerAgingSummary') {
            this.detailedReportChartOptions = _.clone(this.customerAgingSummary);
        }
    };
    InvoiceDashboardComponent.prototype.getOpexData = function (data) {
        var result = [];
        _.each(data, function (valueObj) {
            _.each(valueObj, function (value, key) {
                result.push({
                    'name': key,
                    'y': value
                });
            });
        });
        return result;
    };
    InvoiceDashboardComponent.prototype.getAgingTotalReceivablesByCustomer = function () {
        var _this = this;
        var base = this;
        this.reportRequest.metricsType = 'ageingtotalReceivablesByCustomer';
        this.reportService.generateMetricReport(this.reportRequest, this.currentCompanyId)
            .subscribe(function (metricData) {
            _this.hasAgingByCustomerData = true;
            var columns = metricData.columns;
            var data = metricData.data;
            var keys = Object.keys(data);
            var series = [];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (key != 'TOTAL') {
                    var customer = data[key];
                    var customerName = customer['CustomerName'];
                    delete customer['TOTAL'];
                    delete customer['type'];
                    var values = Object.values(customer);
                    values = _this.removeCurrency(values);
                    series.push({
                        name: customerName,
                        data: values
                    });
                }
            }
            _this.agingByCustomer = {
                chart: {
                    type: 'bar',
                    marginRight: 50,
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Aging By Customer',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
                    }
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
                            color: '#878787',
                            fill: '#878787'
                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    },
                    labels: {
                        style: {
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: '#878787',
                            fill: '#878787'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    enabled: true,
                    series: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: false,
                            format: '${y}',
                            fontSize: '13px',
                            color: '#878787',
                            fill: '#878787',
                            style: {
                                fontSize: '13px'
                            },
                        }
                    },
                },
                series: series
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    InvoiceDashboardComponent.prototype.removeCurrency = function (values) {
        var _values = [];
        var base = this;
        values.forEach(function (value) {
            _values.push(base.numeralService.value(value));
        });
        return _values;
    };
    InvoiceDashboardComponent.prototype.getCustomerAgingSummary = function () {
        var _this = this;
        var base = this;
        this.reportRequest.metricsType = 'customerAgingSummary';
        this.reportService.generateMetricReport(this.reportRequest, this.currentCompanyId)
            .subscribe(function (metricData) {
            _this.hasARAgingSummaryData = true;
            var columns = metricData.columns;
            var data = metricData.data;
            var keys = Object.keys(data);
            var series = [];
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var key = keys_2[_i];
                if (key == 'TOTAL') {
                    var customer = data[key];
                    delete customer['CustomerName'];
                    var values = Object.values(customer);
                    var v = Object.keys(customer);
                    values = _this.removeCurrency(values);
                    for (var i = 0; i < values.length; i++) {
                        series.push({
                            name: v[i],
                            y: values[i]
                        });
                    }
                }
            }
            _this.customerAgingSummary = {
                chart: {
                    type: 'column',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'AR Aging Summary',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize: '24'
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
                            color: '#878787',
                            fill: '#878787'
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Receivable Amount',
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
                            color: '#878787',
                            fill: '#878787',
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
                        data: series
                    }],
            };
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    InvoiceDashboardComponent.prototype.getFormattedPercentage = function (value) {
        return this.numeralService.format("0,0.00", value);
    };
    InvoiceDashboardComponent.prototype.formatAmount = function (amount) {
        return this.numeralService.format("$0,0.00", amount);
    };
    InvoiceDashboardComponent.prototype.closeLoading = function () {
        this.loadingService.triggerLoadingEvent(false);
    };
    InvoiceDashboardComponent.prototype.removeInvoice = function () {
        var _this = this;
        var base = this;
        var selectedIds = _.map(this.selectedTableRows, 'id');
        this.invoiceService.deleteInvoice(selectedIds).subscribe(function (success) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Invoice deleted successfully.");
            _this.hasInvoices = false;
            _this.selectTab(2, "");
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invoice deletion failed.");
        });
    };
    InvoiceDashboardComponent.prototype.invoiceMarkAsSent = function () {
        var _this = this;
        var base = this;
        var selectedIds = _.map(this.selectedTableRows, 'id');
        this.invoiceService.markAsSentInvoice(selectedIds).subscribe(function (success) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Invoice mark as sent successfully.");
            _this.hasInvoices = false;
            _this.selectTab(2, "");
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invoice mark as sent failed.");
        });
    };
    InvoiceDashboardComponent.prototype.showPayment = function () {
        var link = ['payments/edit', this.selectedTableRows[0].id];
        this._router.navigate(link);
    };
    InvoiceDashboardComponent.prototype.showInvoice = function (invoice) {
        var link = ['invoices/edit', invoice.id];
        this._router.navigate(link);
    };
    InvoiceDashboardComponent.prototype.showDuplicate = function (invoice) {
        var link = ['invoices/duplicate', invoice.id];
        this._router.navigate(link);
    };
    InvoiceDashboardComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform action.");
    };
    InvoiceDashboardComponent.prototype.handleBadges = function (length, selectedTab) {
        if (selectedTab == 2) {
            this.badges.invoices = length;
            this.localBadges['invoices'] = length;
            sessionStorage.setItem('localInvoicesBadges', JSON.stringify(this.localBadges));
        }
    };
    InvoiceDashboardComponent.prototype.reRoutePage = function (tabId) {
        var link = ['invoices/dashboard', tabId];
        this._router.navigate(link);
    };
    InvoiceDashboardComponent.prototype.ngOnInit = function () {
    };
    InvoiceDashboardComponent.prototype.updateTabHeight = function () {
        var base = this;
        var topOfDiv = jQuery('.tab-content').offset().top;
        topOfDiv = topOfDiv < 150 ? 150 : topOfDiv;
        var bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
        base.tabHeight = (bottomOfVisibleWindow - topOfDiv - 25) + "px";
        jQuery('.tab-content').css('min-height', base.tabHeight);
        base.proposalsTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
        base.paidInvoiceTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 62) - 3;
        base.invoiceTableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
    };
    InvoiceDashboardComponent.prototype.ngAfterViewInit = function () {
        var base = this;
        jQuery(document).ready(function () {
            base.updateTabHeight();
        });
    };
    InvoiceDashboardComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
    };
    InvoiceDashboardComponent.prototype.addNewInvoice = function () {
        var link = ['invoices/NewInvoice'];
        this._router.navigate(link);
    };
    InvoiceDashboardComponent.prototype.addNewProposal = function () {
        var link = ['invoices/NewProposal'];
        this._router.navigate(link);
    };
    InvoiceDashboardComponent.prototype.addNewPayment = function () {
        var link = ['invoices/addPayment'];
        this._router.navigate(link);
    };
    InvoiceDashboardComponent.prototype.buildInvoiceTableData = function (invoices) {
        this.hasInvoices = false;
        this.invoices = invoices;
        this.invoiceTableData.rows = [];
        this.invoiceTableData.columns = [
            { "name": "id", "title": "id", "visible": false },
            { "name": "journalId", "title": "Journal ID", 'visible': false, 'filterable': false },
            {
                "name": "selectCol",
                "title": "<input type='checkbox' class='global-checkbox'>",
                "type": "html",
                "sortable": false,
                "filterable": false
            },
            { "name": "number", "title": "Number" },
            { "name": "customer", "title": "Customer" },
            { "name": "due_date", "title": "Due Date" },
            {
                "name": "amount", "title": "Invoice Amount", type: 'number', "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.localeFortmat, {
                        style: 'currency',
                        currency: base.companyCurrency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            },
            {
                "name": "amount_due", "title": "Due Amount", type: 'number', "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.localeFortmat, {
                        style: 'currency',
                        currency: base.companyCurrency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            },
            { "name": "status", "title": "Status" },
            { "name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false }
        ];
        var base = this;
        invoices.forEach(function (invoice) {
            var row = {};
            row['id'] = invoice['id'];
            row['journalId'] = invoice['journalID'];
            row['selectCol'] = "<input type='checkbox' class='checkbox'/>";
            row['number'] = invoice['number'];
            row['customer'] = base.getCustomerName(invoice['customer_id']);
            row['due_date'] = invoice['due_date'];
            row['amount'] = invoice['amount'];
            row['amount_due'] = invoice['amount_due'];
            if (invoice['state'] == 'partially_Paid') {
                row['status'] = "Partially Paid";
            }
            else {
                row['status'] = invoice['state'] ? _.startCase((invoice['state'])) : "";
            }
            if (invoice.journalID) {
                row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a>";
            }
            base.invoiceTableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasInvoices = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    InvoiceDashboardComponent.prototype.buildPaymentsTableData = function () {
        this.hasPaidInvoices = false;
        this.paidInvoiceTableData.rows = [];
        this.paidInvoiceTableData.columns = [
            { "name": "id", "title": "id", "visible": false },
            { "name": "journalId", "title": "Journal ID", 'visible': false, 'filterable': false },
            {
                "name": "selectCol",
                "title": "<input type='checkbox' class='global-checkbox'>",
                "type": "html",
                "sortable": false,
                "filterable": false
            },
            { "name": "type", "title": "Payment type/#" },
            { "name": "receivedFrom", "title": "Received From" },
            { "name": "dateReceived", "title": "Date Received" },
            { "name": "amount", "title": "Amount/Status" },
            { "name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false }
        ];
        var base = this;
        this.payments.forEach(function (payment) {
            var row = {};
            row['id'] = payment['id'];
            row['journalId'] = payment['journalID'];
            row['selectCol'] = "<input type='checkbox' class='checkbox'/>";
            var paymentType = payment.type == 'cheque' ? 'Check' : payment.type;
            row['type'] = "<div>" + paymentType + "</div><div><small>" + payment.referenceNo + "</small></div>";
            row['receivedFrom'] = base.getCustomerName(payment.receivedFrom);
            row['dateReceived'] = payment.paymentDate;
            var assignStatus = "";
            var assignedAmount = 0;
            payment.paymentLines.forEach(function (line) {
                assignedAmount += line.amount ? parseFloat(line.amount) : 0;
            });
            var assignmentHtml = "";
            if (assignedAmount >= payment.paymentAmount) {
                assignStatus = "Assigned";
                assignmentHtml = "<small style='color:#00B1A9'>" + assignStatus + "</small>";
            }
            else if (assignedAmount > 0) {
                assignStatus = "Partially Assigned";
                assignmentHtml = "<small style='color:#ff3219'>" + assignStatus + "</small>";
            }
            else {
                assignStatus = "Unassigned";
                assignmentHtml = "<small style='color:#ff3219'>" + assignStatus + "</small>";
            }
            row['amount'] = "<div>" + base.numeralService.format("$0,0.00", payment.paymentAmount) + "</div><div>" + assignmentHtml + "</div>";
            if (payment.journalID) {
                row['actions'] = "<a class='action' data-action='navigation'><span class='icon badge je-badge'>JE</span></a>";
            }
            base.paidInvoiceTableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasPaidInvoices = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    /*buildPaidInvoiceTableData(invoices) {
     this.hasPaidInvoices = false;
     this.invoices = invoices;
     this.paidInvoiceTableData.rows = [];
     this.paidInvoiceTableOptions.search = true;
     this.paidInvoiceTableOptions.pageSize = 9;
     this.paidInvoiceTableData.columns = [
     {"name": "id", "title": "id", "visible": false},
     {"name": "number", "title": "Number"},
     {"name": "customer", "title": "Customer"},
     {"name": "due_date", "title": "Due Date"},
     {"name": "amount", "title": "Amount",type:'number',"formatter": (amount)=>{
     amount = parseFloat(amount);
     return amount.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
     }}/!*,
     {"name": "actions", "title": ""}*!/
     ];
     let base = this;
     invoices.forEach(function (invoice) {
     let row: any = {};
     row['id'] = invoice['id'];
     row['selectCol'] = "<input type='checkbox' class='checkbox'/>";
     row['selectCol'] = "<input type='checkbox' class='checkbox'/>";
     row['number'] = invoice['number'];
     row['customer'] = base.getCustomerName(invoice['customer_id']);
     row['due_date'] = invoice['due_date'];
     row['amount'] = invoice['amount'];
     /!*row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";*!/
     base.paidInvoiceTableData.rows.push(row);
     });

     setTimeout(function () {
     base.hasPaidInvoices = true;
     }, 0)
     this.loadingService.triggerLoadingEvent(false);
     }*/
    InvoiceDashboardComponent.prototype.getCustomerName = function (id) {
        var customer = _.find(this.customers, { 'customer_id': id });
        return customer ? customer.customer_name : '';
    };
    InvoiceDashboardComponent.prototype.updateOptions = function () {
        var base = this;
        switch (this.selectedTab) {
            case "2":
                if (this.selectedTableRows.length > 1) {
                    base.actions = base.invoiceMultipleSelect;
                }
                else {
                    base.actions = base.invoiceActions;
                }
                break;
            case "1":
                if (this.selectedTableRows.length > 1) {
                    base.actions = base.paymentActions;
                }
                else {
                    base.actions = base.paymentActions;
                }
                break;
            case "0":
                if (this.selectedTableRows.length > 1) {
                    base.actions = base.invoiceMultipleSelect;
                }
                else {
                    base.actions = base.invoiceActions;
                }
                break;
        }
    };
    InvoiceDashboardComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'navigation') {
            var link = ['journalEntry', $event.journalId];
            this._router.navigate(link);
        }
    };
    InvoiceDashboardComponent.prototype.handleSelect = function (event) {
        var base = this;
        if (typeof event !== "object") {
            this.selectedTableRows = [];
            this.updateDashboardTable(event);
        }
        else {
            this.handleRowSelect(event);
        }
    };
    InvoiceDashboardComponent.prototype.getSelectedTabData = function () {
        if (this.selectedTab == "2") {
            return this.invoiceTableData;
        }
        else if (this.selectedTab == "1") {
            return this.paidInvoiceTableData;
        }
        else {
            return this.proposalsTableData;
        }
    };
    InvoiceDashboardComponent.prototype.getNativeElement = function () {
        if (this.selectedTab == "2") {
            return this.invoicesTable.nativeElement;
        }
        else if (this.selectedTab == "1") {
            return this.paidTable.nativeElement;
        }
        else {
            return this.proposalsTable.nativeElement;
        }
    };
    InvoiceDashboardComponent.prototype.updateTableData = function (tableData) {
        var base = this;
        if (this.selectedTab == "2") {
            this.invoiceTableData.rows = tableData.rows;
            this.invoiceTableData = _.clone(base.invoiceTableData);
        }
        else if (this.selectedTab == "1") {
            this.paidInvoiceTableData.rows = tableData.rows;
            this.paidInvoiceTableData = _.clone(base.paidInvoiceTableData);
        }
        else {
            this.paidInvoiceTableData.rows = tableData.rows;
            this.paidInvoiceTableData = _.clone(base.paidInvoiceTableData);
        }
    };
    InvoiceDashboardComponent.prototype.updateDashboardTable = function (state) {
        var tableData = this.getSelectedTabData();
        if (state) {
            for (var i in tableData.rows) {
                tableData.rows[i].selectCol = "<input type='checkbox' checked  class='checkbox'/>";
                tableData.rows[i].tempIsSelected = true;
            }
            this.handleRowSelect(tableData.rows);
            tableData.columns[1].title = "<input type='checkbox' class='global-checkbox' checked>";
        }
        else {
            for (var i in tableData.rows) {
                tableData.rows[i].selectCol = "<input type='checkbox' class='checkbox'/>";
                tableData.rows[i].tempIsSelected = false;
            }
            this.handleRowSelect([]);
            tableData.columns[1].title = "<input type='checkbox' class='global-checkbox'>";
        }
        this.updateTableData(tableData);
    };
    InvoiceDashboardComponent.prototype.handleRowSelect = function (selectedRows) {
        var base = this;
        var unCheckedRowsInPage = [];
        var selectedTable = this.getNativeElement();
        jQuery(selectedTable).find("tbody tr input.checkbox").each(function (idx, cbox) {
            var row = jQuery(cbox).closest('tr').data('__FooTableRow__');
            var obj = row.val();
            if (!jQuery(cbox).is(":checked")) {
                _.remove(base.selectedTableRows, { id: obj.id });
            }
        });
        _.each(selectedRows, function (invoices) {
            base.selectedTableRows.push(invoices);
        });
        this.selectedTableRows = _.uniqBy(this.selectedTableRows, 'id');
        _.remove(this.selectedTableRows, { 'tempIsSelected': false });
        this.updateOptions();
    };
    InvoiceDashboardComponent.prototype.handleInvoiceStateChange = function (action) {
        switch (action) {
            case 'edit':
                this.showInvoice(this.selectedTableRows[0]);
                break;
            case 'duplicate':
                this.showDuplicate(this.selectedTableRows[0]);
                break;
            case 'sent':
                this.invoiceMarkAsSent();
                break;
            case 'paid':
                var link = ['invoices', this.selectedTableRows[0].id];
                this._router.navigate(link);
                break;
            case 'delete':
                this.removeInvoice();
                break;
        }
    };
    return InvoiceDashboardComponent;
}());
__decorate([
    core_1.ViewChild('invoicesTable'),
    __metadata("design:type", Object)
], InvoiceDashboardComponent.prototype, "invoicesTable", void 0);
__decorate([
    core_1.ViewChild('paidTable'),
    __metadata("design:type", Object)
], InvoiceDashboardComponent.prototype, "paidTable", void 0);
__decorate([
    core_1.ViewChild('proposalsTable'),
    __metadata("design:type", Object)
], InvoiceDashboardComponent.prototype, "proposalsTable", void 0);
InvoiceDashboardComponent = __decorate([
    core_1.Component({
        selector: 'invoice-dashboard',
        templateUrl: '/app/views/invoiceDashboard.html',
    }),
    __metadata("design:paramtypes", [router_1.Router, router_1.ActivatedRoute,
        Toast_service_1.ToastService, LoadingService_1.LoadingService,
        Companies_service_1.CompaniesService, Invoices_service_1.InvoicesService,
        Customers_service_1.CustomersService, PageTitle_1.pageTitleService,
        StateService_1.StateService, Numeral_service_1.NumeralService, SwitchBoard_1.SwitchBoard,
        Reports_service_1.ReportService])
], InvoiceDashboardComponent);
exports.InvoiceDashboardComponent = InvoiceDashboardComponent;
