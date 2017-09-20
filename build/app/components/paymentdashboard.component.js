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
/**
 * Created by NAZIA on 11-04-2017.
 */
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var HighChart_directive_1 = require("qCommon/app/directives/HighChart.directive");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var paymentdashboardComponent = (function () {
    function paymentdashboardComponent(_router, companyService, loadingService, reportService, dateFormater, numeralService) {
        var _this = this;
        this._router = _router;
        this.companyService = companyService;
        this.loadingService = loadingService;
        this.reportService = reportService;
        this.dateFormater = dateFormater;
        this.numeralService = numeralService;
        this.report = {};
        this.hasItemCodes = false;
        this.showFlyout = true;
        this.tableData = {};
        this.tableColumns = ['bill_date', 'vendor_name', 'current_state', 'due_date', 'amount', 'daysToPay'];
        this.tableOptions = {};
        this.reportasas = false;
        this.payable = false;
        this.isTransit = false;
        this.showCharts = false;
        this.paycount = false;
        this.payablecount = false;
        this.payableBalance = false;
        this.detailedChartIcons = 'apply';
        this.companyId = Session_1.Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.generateChart();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.getpaymentcount(this.companyId)
            .subscribe(function (paymentcount) {
            _this.paymentcount = paymentcount;
            console.log("paymentcount", _this.paymentcount);
            _this.payable = true;
        });
        this.companyService.getlastpaidcount(this.companyId)
            .subscribe(function (paidcount) {
            _this.paidcount = paidcount;
            _this.payablecount = true;
        });
        this.companyService.getbookcount(this.companyId)
            .subscribe(function (bookcount) {
            _this.bookcount = bookcount;
            _this.payableBalance = true;
        });
        this.companyService.getcurrentpaymenttable(this.companyId)
            .subscribe(function (tablelist) {
            _this.tablelist = tablelist;
            _this.buildTableData(tablelist);
            // this.showMessage(true, success);
        }, function (error) { return console.log("error"); });
        this.companyService.getPaymentsInTransit(this.companyId)
            .subscribe(function (paymentsTransit) {
            _this.paymentsInTransit = paymentsTransit;
            _this.isTransit = true;
        }, function (error) { return console.log("error"); });
    }
    paymentdashboardComponent.prototype.onResize = function (event) {
        var base = this;
        if (this.showFlyout) {
            base.hChart1.redraw();
            base.hChart2.redraw();
            base.hChart3.redraw();
        }
        else if (this.showCharts) {
            base.hChart4.redraw();
        }
        else {
        }
    };
    paymentdashboardComponent.prototype.removeCurrency = function (values) {
        var _values = [];
        var base = this;
        values.forEach(function (value) {
            _values.push(base.numeralService.value(value));
        });
        return _values;
    };
    paymentdashboardComponent.prototype.payableclick = function (payableclick) {
        var link = ['bills', payableclick];
        this._router.navigate(link);
    };
    paymentdashboardComponent.prototype.paidclick = function (payableclick) {
        var link = ['paid', payableclick];
        this._router.navigate(link);
    };
    paymentdashboardComponent.prototype.hideFlyout = function () {
        var link = ['payments/dashboard', 'enter'];
        this._router.navigate(link);
        this.showFlyout = !this.showFlyout;
    };
    paymentdashboardComponent.prototype.showOtherCharts = function (type) {
        if (type == 'stackedbar') {
            this.detailedReportChartOptions = this.reportChartOptionsStackedlegend;
        }
        else if (type == 'pie') {
            this.detailedReportChartOptions = this.reportChartOptionspielegend;
        }
        else if (type == "bar") {
            this.detailedReportChartOptions = this.reportChartOptions;
        }
        this.showFlyout = !this.showFlyout;
        this.showCharts = !this.showCharts;
        this.generateChart();
    };
    paymentdashboardComponent.prototype.generateChart = function () {
        var _this = this;
        this.todaysDate = moment(new Date()).format(this.dateFormat);
        this.ttt = {
            "type": "aging",
            "companyID": this.companyId,
            "companyCurrency": "USD",
            "period": "Today",
            "asOfDate": this.todaysDate,
            "daysPerAgingPeriod": "30",
            "numberOfPeriods": "3"
        };
        this.reportService.generateReport(this.ttt).subscribe(function (report) {
            var _report = _.cloneDeep(report);
            var columns = _report.columns || [];
            columns.splice(_report.columns.length - 1, 1);
            var keys = Object.keys(_report.data);
            var serieskkk = [];
            var seriesttt = [];
            var series = [];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (key != 'TOTAL') {
                    var vendor = _report.data[key];
                    var vendorId = vendor['VendorID'];
                    var q = _report.data[key];
                    var values = q.TOTAL;
                    var rtrtr = _this.numeralService.value(values);
                    serieskkk.push({
                        name: vendorId,
                        y: rtrtr
                    });
                }
            }
            var sliced = serieskkk[0];
            sliced['sliced'] = true;
            sliced['selected'] = true;
            for (var _a = 0, keys_2 = keys; _a < keys_2.length; _a++) {
                var key = keys_2[_a];
                if (key == 'TOTAL') {
                    var vendor = _report.data[key];
                    var vendorId = vendor['VendorID'];
                    delete vendor['TOTAL'];
                    delete vendor['VendorID'];
                    var values = Object.values(vendor);
                    var v = Object.keys(vendor);
                    values = _this.removeCurrency(values);
                    var current = values.pop();
                    values.splice(0, 0, current);
                    for (var i = 0; i < values.length; i++) {
                        seriesttt.push({
                            name: v[i],
                            y: values[i]
                        });
                    }
                }
            }
            for (var _b = 0, keys_3 = keys; _b < keys_3.length; _b++) {
                var key = keys_3[_b];
                if (key != 'TOTAL') {
                    var vendor = _report.data[key];
                    var vendorId = vendor['VendorID'];
                    delete vendor['TOTAL'];
                    delete vendor['VendorID'];
                    delete vendor['type'];
                    var values = Object.values(vendor);
                    values = _this.removeCurrency(values);
                    var current = values.pop();
                    values.splice(0, 0, current);
                    series.push({
                        name: vendorId,
                        data: values
                    });
                }
            }
            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });
            _this.reportChartOptionsStackedlegend = {
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
            _this.reportChartOptionsStacked = {
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
                    },
                },
                series: series
            };
            _this.reportChartOptionspielegend = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Total Payables by Vendor'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
                        data: serieskkk
                    }],
            };
            _this.reportChartOptionspie = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Total Payables by Vendor'
                },
                tooltip: {
                    pointFormat: 'TOTAL: <b>${point.y:,.2f}</b> <br/>{point.percentage:,.2f}%',
                },
                credits: {
                    enabled: false
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
                        data: serieskkk
                    }],
            };
            _this.reportChartOptions = {
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
                subtitle: {},
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
                        data: seriesttt
                    }],
            };
            _this.reportasas = true;
        });
    };
    paymentdashboardComponent.prototype.buildTableData = function (tablelist) {
        this.hasItemCodes = false;
        this.tablelist = tablelist;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "bill_date", "title": "Bill Date" },
            { "name": "vendor_name", "title": "Vendor Name" },
            { "name": "current_state", "title": "Current State" },
            { "name": "due_date", "title": "Due Date" },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = parseFloat(amount);
                    return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } },
            { "name": "daysToPay", "title": "Days to Pay" }
        ];
        var base = this;
        tablelist.forEach(function (expense) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                if (key == 'amount') {
                    var amount = parseFloat(expense[key]);
                    row[key] = amount.toFixed(2); // just to support regular number with .00
                }
                else {
                    row[key] = expense[key];
                }
                var currentDate = moment(new Date()).format("YYYY-MM-DD");
                var daysToPay = moment(expense['due_date'], "MM/DD/YYYY").diff(currentDate, 'days');
                if (daysToPay <= 0) {
                    daysToPay = '<span color="red" style="color: red">' + daysToPay + '</span>';
                }
                row['daysToPay'] = daysToPay;
                // row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function () {
            base.hasItemCodes = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
        base.detailedChartIcons = 'notApply';
    };
    ;
    return paymentdashboardComponent;
}());
__decorate([
    core_1.ViewChild('hChart1'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], paymentdashboardComponent.prototype, "hChart1", void 0);
__decorate([
    core_1.ViewChild('hChart2'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], paymentdashboardComponent.prototype, "hChart2", void 0);
__decorate([
    core_1.ViewChild('hChart3'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], paymentdashboardComponent.prototype, "hChart3", void 0);
__decorate([
    core_1.ViewChild('hChart4'),
    __metadata("design:type", HighChart_directive_1.HighChart)
], paymentdashboardComponent.prototype, "hChart4", void 0);
__decorate([
    core_1.ViewChild('createtaxes'),
    __metadata("design:type", Object)
], paymentdashboardComponent.prototype, "createtaxes", void 0);
__decorate([
    core_1.HostListener('window:resize', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], paymentdashboardComponent.prototype, "onResize", null);
paymentdashboardComponent = __decorate([
    core_1.Component({
        selector: 'paymentdashboard',
        templateUrl: '/app/views/paymentdashboard.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Companies_service_1.CompaniesService, LoadingService_1.LoadingService,
        Reports_service_1.ReportService, DateFormatter_service_1.DateFormater, Numeral_service_1.NumeralService])
], paymentdashboardComponent);
exports.paymentdashboardComponent = paymentdashboardComponent;
