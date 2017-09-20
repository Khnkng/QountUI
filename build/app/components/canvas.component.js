/**
 * Created by seshu on 18-10-2016.
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
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var Session_1 = require("qCommon/app/services/Session");
var StateService_1 = require("qCommon/app/services/StateService");
var Rx_1 = require("rxjs/Rx");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Invoices_service_1 = require("invoicesUI/app/services/Invoices.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var CanvasComponent = (function () {
    function CanvasComponent(titleService, loadingService, numeralService, reportService, stateService, toastService, switchBoard, invoiceService, companyService) {
        var _this = this;
        this.titleService = titleService;
        this.loadingService = loadingService;
        this.numeralService = numeralService;
        this.reportService = reportService;
        this.stateService = stateService;
        this.toastService = toastService;
        this.switchBoard = switchBoard;
        this.invoiceService = invoiceService;
        this.companyService = companyService;
        this.showDetailedChart = false;
        this.hasBoxData = false;
        this.metrics = {};
        this.hasProfitTrendData = false;
        this.hasCashBurnData = false;
        this.hasAgingByVendor = false;
        this.hasAgingByCustomerData = false;
        this.hasArAPCashBalanceData = false;
        this.hasGPNPData = false;
        this.chartColors = ['#44B6E8', '#18457B', '#00B1A9', '#F06459', '#22B473', '#384986', '#4554A4', '#808CC5'];
        var base = this;
        this.stateService.clearAllStates();
        this.titleService.setPageTitle("Dashboard");
        this.currentCompanyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        var today = moment();
        var fiscalStartDate = moment(Session_1.Session.getFiscalStartDate(), 'MM/DD/YYYY');
        this.currentFiscalStart = moment([today.get('year'), fiscalStartDate.get('month'), 1]);
        if (today < fiscalStartDate) {
            this.currentFiscalStart = moment([today.get('year') - 1, fiscalStartDate.get('month'), 1]);
        }
        this.currentFiscalStart = this.currentFiscalStart.format('MM/DD/YYYY');
        this.asOfDate = moment().format('MM/DD/YYYY');
        this.reportRequest = {
            "basis": "accrual",
            "companyID": this.currentCompanyId,
            "companyCurrency": this.companyCurrency,
            "asOfDate": this.asOfDate,
            "startDate": this.currentFiscalStart
        };
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showDetailedChart) {
                _this.showDetailedChart = !_this.showDetailedChart;
                _this.detailedReportChartOptions.legend = { enabled: false };
            }
        });
        setTimeout(function () {
            base.getData();
        });
    }
    CanvasComponent.prototype.getData = function () {
        this.loadingService.triggerLoadingEvent(true);
        this.getBoxData();
        this.getARAPCashBalanceData();
        this.getProfitTrendData();
        this.getGrossAndNetProfitData();
        this.getCashBurnData();
        this.getAgingByCustomer();
        this.getAgingByVendor();
    };
    CanvasComponent.prototype.getBoxData = function () {
        var _this = this;
        var base = this;
        var reportRequest = _.cloneDeep(this.reportRequest);
        reportRequest.type = "cashBalance";
        var cashBalance = this.reportService.generateAccountReport(reportRequest, reportRequest.companyID);
        reportRequest.type = "balanceSheet";
        var balanceSheet = this.reportService.generateAccountReport(reportRequest, reportRequest.companyID);
        reportRequest.type = "incomeStatement";
        var incomeStatement = this.reportService.generateAccountReport(reportRequest, reportRequest.companyID);
        var boxData = this.invoiceService.getDashboardBoxData(this.currentCompanyId, this.currentFiscalStart, this.asOfDate);
        var paymentCount = this.companyService.getpaymentcount(this.currentCompanyId);
        Rx_1.Observable.forkJoin(cashBalance, balanceSheet, incomeStatement, boxData, paymentCount).subscribe(function (results) {
            _this.metrics["cashBalance"] = _this.formatAmount(results[0].cashBalance || 0);
            _this.metrics["currentRatio"] = _this.formatNumber(results[1].metrics.currentRatio || 0);
            _this.metrics["quickRatio"] = _this.formatNumber(results[1].metrics.quickRatio || 0);
            _this.metrics["gpMargin"] = _this.formatNumber(results[2].margins.grossProfitMargin || 0);
            _this.metrics["npMargin"] = _this.formatNumber(results[2].margins.netProfitMargin || 0);
            _this.metrics["receivable"] = _this.formatAmount(results[3].totalReceivableAmount || 0);
            _this.metrics["payable"] = _this.formatAmount(results[4].totalPayable || 0);
            base.hasBoxData = true;
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to get box data");
        });
    };
    CanvasComponent.prototype.formatNumber = function (value) {
        return this.numeralService.format("0.00", value);
    };
    CanvasComponent.prototype.formatAmount = function (amount) {
        return this.numeralService.format("$0,0.00", amount);
    };
    CanvasComponent.prototype.getARAPCashBalanceData = function () {
        var _this = this;
        var base = this;
        var report = _.cloneDeep(this.reportRequest);
        report.type = "incomeStatement";
        report.metricsType = "arApCashBalance";
        this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(function (metricData) {
            _this.hasArAPCashBalanceData = true;
            _this.arApCashBalanceChartOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'AR vs AP vs Cash Balance',
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
                                return base.formatAmount(this.value);
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
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            formatter: function () {
                                return base.formatAmount(this.value);
                            },
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
                            enabled: false,
                            formatter: function () {
                                return base.formatAmount(this.value);
                            },
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        opposite: true
                    }],
                tooltip: {
                    shared: true,
                    pointFormatter: function () {
                        return '<span style="color:' + this.series.color + '">' + this.series.name + '</span>: <b>' + base.formatAmount(this.y) + '</b><br/>';
                    }
                },
                series: [{
                        name: 'Acc. Receivable',
                        type: 'column',
                        data: _this.getDataArray(metricData.arData, metricData.categories)
                    }, {
                        name: 'Cash Balance',
                        type: 'line',
                        data: _this.getDataArray(metricData.cashBalance, metricData.categories),
                        dashStyle: 'solid',
                        color: '#00B1A9'
                    }, {
                        name: 'Acc. Payable',
                        type: 'column',
                        data: _this.getDataArray(metricData.apData, metricData.categories)
                    }]
            };
        }, function (error) {
        });
    };
    CanvasComponent.prototype.getProfitTrendData = function () {
        var _this = this;
        var base = this;
        var report = _.cloneDeep(this.reportRequest);
        report.type = "incomeStatement";
        report.metricsType = "profitTrend";
        this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(function (metricData) {
            _this.hasProfitTrendData = true;
            _this.profitTrendChartOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Profit Trend',
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
                                return base.formatAmount(this.value);
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
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            formatter: function () {
                                return base.formatAmount(this.value);
                            },
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
                            enabled: false,
                            formatter: function () {
                                return base.formatAmount(this.value);
                            },
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        opposite: true
                    }],
                tooltip: {
                    shared: true,
                    pointFormatter: function () {
                        return '<span style="color:' + this.series.color + '">' + this.series.name + '</span>: <b>' + base.formatAmount(this.y) + '</b><br/>';
                    }
                },
                series: [{
                        name: 'Income',
                        type: 'column',
                        data: _this.getDataArray(metricData.Income, metricData.categories)
                    }, {
                        name: 'Profit',
                        type: 'line',
                        data: _this.getDataArray(metricData.Profit, metricData.categories),
                        dashStyle: 'solid',
                        color: '#00B1A9'
                    }, {
                        name: 'Expenses',
                        type: 'column',
                        data: _this.getDataArray(metricData.Expenses, metricData.categories)
                    }]
            };
        }, function (error) {
        });
    };
    CanvasComponent.prototype.getGrossAndNetProfitData = function () {
        var _this = this;
        var base = this;
        var report = _.cloneDeep(this.reportRequest);
        report.type = "incomeStatement";
        report.metricsType = "grossAndNetProfit";
        this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(function (metricData) {
            _this.hasGPNPData = true;
            _this.gpNpChartDataOptions = {
                colors: _this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Gross Profit vs Net Profit',
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
                                return base.formatAmount(this.value);
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
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                    }, {
                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            formatter: function () {
                                return base.formatAmount(this.value);
                            },
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
                            enabled: false,
                            formatter: function () {
                                return base.formatAmount(this.value);
                            },
                            style: {
                                fontSize: '13px',
                                color: '#878787',
                                fill: '#878787'
                            }
                        },
                        opposite: true
                    }],
                tooltip: {
                    shared: true,
                    pointFormatter: function () {
                        return '<span style="color:' + this.series.color + '">' + this.series.name + '</span>: <b>' + base.formatAmount(this.y) + '</b><br/>';
                    }
                },
                series: [{
                        name: 'Gross Profit',
                        type: 'column',
                        data: _this.getDataArray(metricData.GrossProfit, metricData.categories)
                    }, {
                        name: 'Net Profit',
                        type: 'column',
                        data: _this.getDataArray(metricData.NetProfit, metricData.categories)
                    }]
            };
        }, function (error) {
        });
    };
    CanvasComponent.prototype.getCashBurnData = function () {
        var _this = this;
        var base = this;
        var report = _.clone(this.reportRequest);
        report.type = "cashFlowStatement";
        report.metricsType = "cashBurn";
        this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(function (metricData) {
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
                    shared: true,
                    pointFormatter: function () {
                        return '<span style="color:' + this.series.color + '">' + this.series.name + '</span>: <b>' + base.formatAmount(this.y) + '</b><br/>';
                    }
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
                            valueDecimals: 2
                        }
                    }]
            };
        }, function (error) {
        });
    };
    CanvasComponent.prototype.getAgingByCustomer = function () {
        var _this = this;
        var base = this;
        var reportRequest = {
            "type": "aging",
            "companyID": this.currentCompanyId,
            "companyCurrency": this.companyCurrency,
            "asOfDate": this.asOfDate,
            "daysPerAgingPeriod": "30",
            "numberOfPeriods": "3",
            "metricsType": "ageingtotalReceivablesByCustomer"
        };
        this.reportService.generateMetricReport(reportRequest, this.currentCompanyId)
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
            _this.agingByCustomerChartOptions = {
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
                        text: 'Receivable Amount',
                        style: {
                            fontSize: '15px'
                        }
                    },
                    stackLabels: {
                        enabled: true,
                        formatter: function () {
                            return base.formatAmount(this.total);
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
        }, function (error) {
        });
    };
    CanvasComponent.prototype.getAgingByVendor = function () {
        var _this = this;
        var base = this;
        var request = {
            "type": "aging",
            "companyID": this.currentCompanyId,
            "companyCurrency": "USD",
            "period": "Today",
            "asOfDate": this.asOfDate,
            "daysPerAgingPeriod": "30",
            "numberOfPeriods": "3"
        };
        this.reportService.generateReport(request).subscribe(function (report) {
            if (!report) {
                return;
            }
            _this.hasAgingByVendor = true;
            var columns = report.columns || [];
            var keys = Object.keys(report.data);
            var data = [];
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var key = keys_2[_i];
                if (key != 'TOTAL') {
                    var vendor = report.data[key];
                    var vendorId = vendor['VendorID'];
                    delete vendor['TOTAL'];
                    delete vendor['VendorID'];
                    delete vendor['type'];
                    var values = Object.values(vendor);
                    values = _this.removeCurrency(values);
                    var current = values.pop();
                    values.splice(0, 0, current);
                    data.push({
                        name: vendorId,
                        data: values
                    });
                }
            }
            _this.agingByVendorChartOptions = {
                chart: {
                    type: 'bar',
                    marginRight: 50
                },
                title: {
                    text: 'Aging By Vendor',
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
                            return base.formatAmount(this.total);
                        },
                        style: {
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: '#003399',
                            fill: '#003399'
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
                            color: '#003399',
                            fill: '#003399',
                            style: {
                                fontSize: '13px'
                            },
                        }
                    }
                },
                series: data
            };
        });
    };
    CanvasComponent.prototype.getDataArray = function (dataObj, categories) {
        var result = [];
        _.each(categories, function (category) {
            result.push(dataObj[category] || 0);
        });
        return result;
    };
    CanvasComponent.prototype.expandChart = function (type) {
        this.showDetailedChart = true;
        if (type == 'profitTrend') {
            this.detailedReportChartOptions = this.profitTrendChartOptions;
            this.detailedReportChartOptions.legend = { enabled: true };
        }
        else if (type == 'cashBurnChart') {
            this.detailedReportChartOptions = this.cashBurnDataOptions;
            this.detailedReportChartOptions.legend = { enabled: true };
        }
        else if (type == 'agingByVendor') {
            this.detailedReportChartOptions = this.agingByVendorChartOptions;
            this.detailedReportChartOptions.legend = { enabled: true };
        }
        else if (type == 'agingByCustomer') {
            this.detailedReportChartOptions = this.agingByCustomerChartOptions;
            this.detailedReportChartOptions.legend = { enabled: true };
        }
        else if (type == 'arApCashBalance') {
            this.detailedReportChartOptions = this.arApCashBalanceChartOptions;
            this.detailedReportChartOptions.legend = { enabled: true };
        }
        else if (type == 'grossAndNetProfit') {
            this.detailedReportChartOptions = this.gpNpChartDataOptions;
            this.detailedReportChartOptions.legend = { enabled: true };
        }
    };
    CanvasComponent.prototype.removeCurrency = function (values) {
        var _values = [];
        var base = this;
        values.forEach(function (value) {
            _values.push(base.numeralService.value(value));
        });
        return _values;
    };
    return CanvasComponent;
}());
CanvasComponent = __decorate([
    core_1.Component({
        selector: 'qount-canvas',
        templateUrl: '/app/views/mainDashboard.html'
    }),
    __metadata("design:paramtypes", [PageTitle_1.pageTitleService, LoadingService_1.LoadingService, Numeral_service_1.NumeralService,
        Reports_service_1.ReportService, StateService_1.StateService, Toast_service_1.ToastService,
        SwitchBoard_1.SwitchBoard, Invoices_service_1.InvoicesService, Companies_service_1.CompaniesService])
], CanvasComponent);
exports.CanvasComponent = CanvasComponent;
