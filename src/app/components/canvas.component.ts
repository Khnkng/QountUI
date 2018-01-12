/**
 * Created by seshu on 18-10-2016.
 */

import { Component } from '@angular/core';
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ReportService} from "reportsUI/app/services/Reports.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {Session} from "qCommon/app/services/Session";
import {StateService} from "qCommon/app/services/StateService";
import {Observable} from "rxjs/Rx";
import {TOAST_TYPE, DEFAULT_PLOT_OPTIONS} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {InvoicesService} from "invoicesUI/app/services/Invoices.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";

declare let _:any;
declare let Highcharts:any;
declare let moment:any;

@Component({
    selector: 'qount-canvas',
    templateUrl: '../views/mainDashboard.html'
})
export class CanvasComponent {
    currentCompanyId: string;
    showDetailedChart: boolean = false;
    hasBoxData: boolean = false;
    currentFiscalStart: any;
    asOfDate: string;
    reportRequest: any;
    companyCurrency: string;
    reportCurrency: string;
    metrics:any = {};
    routeSubscribe:any;

    hasProfitTrendData: boolean = false;
    profitTrendChartOptions: any;
    hasCashBurnData: boolean = false;
    cashBurnDataOptions: any;
    hasAgingByVendor: boolean = false;
    agingByVendorChartOptions: any;
    hasAgingByCustomerData: boolean  = false;
    agingByCustomerChartOptions:any;
    hasArAPCashBalanceData: boolean = false;
    arApCashBalanceChartOptions: any;
    hasGPNPData: boolean = false;
    gpNpChartDataOptions: any;
    hasIndicatorData: boolean = false;
    indicatorChartOptions: any;
    hasMonthlyExpenseData: boolean = false;
    monthlyExpenseChartOptions: any;

    detailedReportChartOptions:any;
    chartColors:Array<any> = ['#44B6E8','#18457B','#00B1A9','#F06459','#22B473','#384986','#4554A4','#808CC5'];

    constructor(private titleService: pageTitleService, private loadingService: LoadingService, private numeralService: NumeralService,
        private reportService: ReportService, private stateService: StateService, private toastService: ToastService,
        private switchBoard: SwitchBoard, private invoiceService: InvoicesService, private companyService: CompaniesService) {
        let base = this;
        this.stateService.clearAllStates();
        this.titleService.setPageTitle("Dashboard");
        this.currentCompanyId = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.reportCurrency = Session.getCompanyReportCurrency()? Session.getCompanyReportCurrency(): this.companyCurrency;
        this.numeralService.switchLocale(this.reportCurrency);
        this.currentFiscalStart = moment().subtract(11, 'months').startOf('month').format("MM/DD/YYYY");
        this.asOfDate = moment().format('MM/DD/YYYY');
        this.reportRequest = {
            "basis":"accrual",
            "companyID": this.currentCompanyId,
            "companyCurrency": this.companyCurrency,
            "asOfDate": this.asOfDate,
            "startDate": this.currentFiscalStart
        };
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
            if(this.showDetailedChart){
                this.showDetailedChart = !this.showDetailedChart;
                this.detailedReportChartOptions.legend = {enabled: false};
                this.detailedReportChartOptions.yAxis.title = {text: null,style: {fontSize:'15px'}};
            }
        });
        setTimeout(function(){
            base.getData();
        });
    }

    ngOnDestroy() {
      this.numeralService.switchLocale(this.companyCurrency);
    }

    getData(){
        this.loadingService.triggerLoadingEvent(true);
        this.getBoxData();
        this.getIndicatorGraphData();
        this.getARAPCashBalanceData();
        this.getProfitTrendData();
        this.getGrossAndNetProfitData();
        this.getCashBurnData();
        this.getAgingByCustomer();
        this.getAgingByVendor();
        this.getMonthlyExpensesGraphData();
    }

    getMonthlyExpensesGraphData(){
      let base = this;
      let report = _.cloneDeep(this.reportRequest);
      report.type = 'incomeStatement';
      report.metricsType = "monthlyExpenseTrend";
      this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(metricData => {
        this.hasMonthlyExpenseData = true;
        this.monthlyExpenseChartOptions = {
          colors: this.chartColors,
          chart: {
            zoomType: 'xy',
            style: {
              fontFamily: 'NiveauGroteskRegular'
            }
          },
          title: {
            text: 'Monthly Expense Trend',
            align:'left',
            style: {
              color: '#878787',
              fontFamily: 'NiveauGroteskLight',
              fontSize:'24'
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
                fontSize:'13px',
                fontWeight:'bold',
                color:'#878787',
                fill:'#878787'
              }
            }
          }],
          yAxis: [{ // Primary yAxis
            labels: {
              formatter: function(){
                return base.formatAmount(this.value);
              },
              style: {
                fontSize:'13px',
                color:'#878787',
                fill:'#878787'
              }

            },
            title: {
              text: '',
              style: {
                color: Highcharts.getOptions().colors[2]
              }
            },
          }],
          plotOptions: DEFAULT_PLOT_OPTIONS,
          tooltip: {
            shared: true,
            pointFormatter: function(){
              return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>: <b>'+base.formatAmount(this.y)+'</b><br/>'
            }
          },
          series: base.getMonthlyExpenseData(metricData)
        };
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
    }

    getMonthlyExpenseData(data){
      let result = [];
      _.each(data.coas, function(coa){
        let coaData = data[coa] || {};
        let coaDataArray = [];
        _.each(data.categories, function(category){
          coaDataArray.push(coaData[category]);
        });
        result.push({
          name: coa,
          type: 'area',
          data: coaDataArray
        });
      });
      return result;
    }

  getIndicatorGraphData(){
    let base = this;
    let report = _.cloneDeep(this.reportRequest);
    report.type = "incomeStatement";
    report.metricsType = "indicatorComparision";
    this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(metricData => {
      if(!metricData){
        metricData = {
          categories: [],
          actual: [],
          target: []
        };
      }
      let catNames = [];
      _.each(metricData.categories, function(category){
        catNames.push(base.getCategoryName(category));
      });
      this.hasIndicatorData = true;
      this.indicatorChartOptions = {
        colors: this.chartColors,
        chart: {
          zoomType: 'xy',
          style: {
            fontFamily: 'NiveauGroteskRegular'
          }
        },
        title: {
          text: "KPI's Actual Vs Budget",
          align:'left',
          style: {
            color: '#878787',
            fontFamily: 'NiveauGroteskLight',
            fontSize:'24'
          }
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        xAxis: [{
          categories: catNames,
          crosshair: true,
          labels: {
            style: {
              fontSize:'13px',
              fontWeight:'bold',
              color:'#878787',
              fill:'#878787'
            }
          }
        }],
        yAxis: [{
          labels: {
            formatter: function(){
              return base.formatAmount(this.value);
            },
            style: {
              fontSize:'13px',
              color:'#878787',
              fill:'#878787'
            }
          },
          title: {
            text: '',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          }
        }],
        tooltip: {
          shared: true,
          pointFormatter: function(){
            return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>: <b>'+base.formatAmount(this.y)+'</b><br/>'
          }
        },
        plotOptions: DEFAULT_PLOT_OPTIONS,
        series: [{
          name: 'Actual',
          type: 'column',
          data: this.getDataArray(metricData.actual, metricData.categories)
        }, {
          name: 'Budget',
          type: 'column',
          data: this.getDataArray(metricData.target, metricData.categories),
          marker: {
            enabled: false
          },
          dashStyle: 'shortdot',
          color:'#00B1A9'
        }]
      };

      //this.exportHighchartData(this.indicatorChartOptions, "Revenue");

      this.loadingService.triggerLoadingEvent(false);
    }, error => {
      this.loadingService.triggerLoadingEvent(false);
    });
  }

  getCategoryName(category){
    if(category == 'revenue'){
      return "Revenue";
    } else if(category == 'cogs'){
      return "Cost Of Goods Sold";
    } else if(category == 'grossProfit'){
      return "Gross Profit";
    } else if(category == 'ebitda'){
      return "EBITDA";
    } else if(category == 'ebit'){
      return "EBIT";
    } else if(category == 'pbit'){
      return "PBIT";
    } else if(category == 'opex'){
      return "Opex";
    } else if(category == 'netProfit'){
      return "Net Profit";
    }
    return category;
  }

    getBoxData(){
        let base = this;
        let reportRequest = _.cloneDeep(this.reportRequest);
        reportRequest.type = "cashBalance";
        let cashBalance = this.reportService.generateAccountReport(reportRequest, reportRequest.companyID);
        reportRequest.type = "taxLiability";
        let taxLiability = this.reportService.generateAccountReport(reportRequest, reportRequest.companyID);
        reportRequest.type = "balanceSheet";
        let balanceSheet = this.reportService.generateAccountReport(reportRequest, reportRequest.companyID);
        reportRequest.type = "incomeStatement";
        let incomeStatement = this.reportService.generateAccountReport(reportRequest, reportRequest.companyID);
        let boxData = this.invoiceService.getDashboardBoxData(this.currentCompanyId, this.currentFiscalStart, this.asOfDate);
        let paymentCount = this.companyService.getpaymentcount(this.currentCompanyId);
        Observable.forkJoin(cashBalance, balanceSheet, incomeStatement, boxData, paymentCount,taxLiability)
            .subscribe(results => {
            this.metrics["cashBalance"] = this.formatAmount(results[0].cashBalance || 0);
            this.metrics["currentRatio"] = this.formatNumber(results[1].metrics.currentRatio || 0);
            this.metrics["quickRatio"] = this.formatNumber(results[1].metrics.quickRatio || 0);
            this.metrics["gpMargin"] = this.formatNumber(results[2].margins.grossProfitMargin || 0);
            this.metrics["npMargin"] = this.formatNumber(results[2].margins.netProfitMargin || 0);
            this.metrics["receivable"] = this.formatAmount(results[3].totalReceivableAmount || 0);
            this.metrics["payable"] = this.formatAmount(results[4].totalPayable || 0);
            this.metrics["taxLiability"] = this.formatAmount(results[5].taxLiability || 0);
            base.hasBoxData = true;
            this.loadingService.triggerLoadingEvent(false);
        }, error => {
            this.loadingService.triggerLoadingEvent(false);
            this.toastService.pop(TOAST_TYPE.error, "Failed to get box data");
        });
    }

    formatNumber(value){
        return this.numeralService.format("0.00", value);
    }

    formatAmount(amount){
        return this.numeralService.format("$0,0.00", amount);
    }

    getARAPCashBalanceData(){
        let base = this;
        let report = _.cloneDeep(this.reportRequest);
        report.type = "incomeStatement";
        report.metricsType = "arApCashBalance";
        this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(metricData => {
            this.hasArAPCashBalanceData = true;
            this.arApCashBalanceChartOptions = {
                colors: this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'AR vs AP vs Cash Balance',
                    align:'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize:'24'
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
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#878787',
                            fill:'#878787'
                        }
                    }
                }],
                yAxis: [{ // Primary yAxis
                    labels: {
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }

                    },
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[2]
                        }
                    },
                }, { // Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    }

                }, { // Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    labels: {
                        enabled:false,
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true,
                    pointFormatter: function(){
                        return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>: <b>'+base.formatAmount(this.y)+'</b><br/>'
                    }
                },
                plotOptions: DEFAULT_PLOT_OPTIONS,
                series: [{
                    name: 'Acc. Receivable',
                    type: 'column',
                    data: this.getDataArray(metricData.arData, metricData.categories)
                }, {
                    name: 'Cash Balance',
                    type: 'line',
                    data: this.getDataArray(metricData.cashBalance, metricData.categories),
                    dashStyle: 'solid',
                    color: '#00B1A9'
                }, {
                    name: 'Acc. Payable',
                    type: 'column',
                    data: this.getDataArray(metricData.apData, metricData.categories)
                }]
            };
        }, error => {
        });
    }

    getProfitTrendData(){
        let base = this;
        let report = _.cloneDeep(this.reportRequest);
        report.type = "incomeStatement";
        report.metricsType = "profitTrend";
        this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(metricData => {
            this.hasProfitTrendData = true;
            this.profitTrendChartOptions = {
                colors: this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Profit Trend',
                    align:'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize:'24'
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
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#878787',
                            fill:'#878787'
                        }
                    }
                }],
                yAxis: [{ // Primary yAxis
                    labels: {
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }

                    },
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[2]
                        }
                    },
                }, { // Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    }

                }, { // Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    labels: {
                        enabled:false,
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true,
                    pointFormatter: function(){
                        return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>: <b>'+base.formatAmount(this.y)+'</b><br/>'
                    }
                },
                plotOptions: DEFAULT_PLOT_OPTIONS,
                series: [{
                    name: 'Income',
                    type: 'column',
                    data: this.getDataArray(metricData.Income, metricData.categories)
                }, {
                    name: 'Profit',
                    type: 'line',
                    data: this.getDataArray(metricData.Profit, metricData.categories),
                    dashStyle: 'solid',
                    color: '#00B1A9'
                }, {
                    name: 'Expenses',
                    type: 'column',
                    data: this.getDataArray(metricData.Expenses, metricData.categories)
                }]
            };
        }, error => {
        });
    }

    getGrossAndNetProfitData(){
        let base = this;
        let report = _.cloneDeep(this.reportRequest);
        report.type = "incomeStatement";
        report.metricsType = "grossAndNetProfit";
        this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(metricData => {
            this.hasGPNPData = true;
            this.gpNpChartDataOptions = {
                colors: this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Gross Profit vs Net Profit',
                    align:'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize:'24'
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
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#878787',
                            fill:'#878787'
                        }
                    }
                }],
                yAxis: [{ // Primary yAxis
                    labels: {
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }

                    },
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[2]
                        }
                    },
                }, { // Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    }

                }, { // Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    labels: {
                        enabled:false,
                        formatter: function(){
                            return base.formatAmount(this.value);
                        },
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true,
                    pointFormatter: function(){
                        return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>: <b>'+base.formatAmount(this.y)+'</b><br/>'
                    }
                },
                plotOptions: DEFAULT_PLOT_OPTIONS,
                series: [{
                    name: 'Gross Profit',
                    type: 'column',
                    data: this.getDataArray(metricData.GrossProfit, metricData.categories)
                }, {
                    name: 'Net Profit',
                    type: 'column',
                    data: this.getDataArray(metricData.NetProfit, metricData.categories)
                }]
            };
        }, error => {
        });
    }

    getCashBurnData(){
        let base = this;
        let report = _.clone(this.reportRequest);
        report.type = "cashFlowStatement";
        report.metricsType = "cashBurn";
        this.reportService.generateMetricReport(report, this.currentCompanyId).subscribe(metricData => {
            this.hasCashBurnData = true;
            let categories = [];
            _.each(metricData.CashFlowMOM, function(value,key){
                categories.push(key);
            });
            this.cashBurnDataOptions = {
                colors: this.chartColors,
                chart: {
                    zoomType: 'xy',
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Cash Burn',
                    align:'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize:'24'
                    }
                },
                subtitle: {
                    text: '',
                    align:'left'
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
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#878787',
                            fill:'#878787'
                        }
                    }
                }],
                tooltip: {
                    shared: true,
                    pointFormatter: function(){
                        return '<span style="color:'+this.series.color+'">'+this.series.name+'</span>: <b>'+base.formatAmount(this.y)+'</b><br/>'
                    }
                },
                yAxis: [{ // Primary yAxis
                    labels: {
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    },
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[2]
                        }
                    },
                    opposite: true

                }, { // Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        style: {
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    }

                }, { // Tertiary yAxis
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
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787'
                        }
                    },
                    opposite: true
                }],
                plotOptions: DEFAULT_PLOT_OPTIONS,
                series: [{
                    name: 'Cash Burn',
                    type: 'line',
                    yAxis: 1,
                    data: this.getDataArray(metricData["CashFlowMOM"], categories),
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            };
        }, error => {
        });
    }

    getAgingByCustomer(){
        let base = this;
        let reportRequest = {
            "type":"aging",
            "companyID":this.currentCompanyId,
            "companyCurrency": this.companyCurrency,
            "asOfDate": this.asOfDate,
            "daysPerAgingPeriod":"30",
            "numberOfPeriods":"3",
            "metricsType":"ageingtotalReceivablesByCustomer"
        };
        this.reportService.generateMetricReport(reportRequest, this.currentCompanyId)
            .subscribe(metricData => {
                this.hasAgingByCustomerData = true;
                let columns = metricData.columns;
                let data = metricData.data;
                let series = [];
                _.each(data, function(value, key){
                    let array = [];
                    _.each(columns, function (column) {
                        array.push(value[column]);
                    });
                    let valueArray = base.removeCurrency(array);
                    series.push({
                        name: key,
                        data: valueArray
                    });
                });
                this.agingByCustomerChartOptions={
                    colors: this.chartColors,
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
                            fontSize:'24'
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        categories: columns,
                    },
                    tooltip: {
                        headerFormat: '<b>{point.x}</b><br/>',
                        pointFormatter: function(){
                          return '<span style="color:'+this.series.color+'">'+this.series.name+': '+base.formatAmount(this.y)+'</span><br/>'
                        },
                        shared: true
                    },
                    yAxis: {
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        min: 0,
                        title: {
                            text: null,
                            style: {
                                fontSize:'15px'
                            }
                        },

                        stackLabels: {
                            enabled: true,
                            formatter: function () {
                                return base.formatAmount(this.total);
                            },
                            style: {
                                fontSize:'13px',
                                fontWeight:'bold',
                                color:'#878787',
                                fill:'#878787'
                                // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                            }
                        },
                        labels: {
                            style: {
                                fontSize:'13px',
                                fontWeight:'bold',
                                color:'#878787',
                                fill:'#878787'
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
                                format: '{y}',
                                fontSize:'13px',
                                color:'#878787',
                                fill:'#878787',
                                style: {
                                    fontSize:'13px'
                                },
                            }
                        },

                    },
                    series:series
                };
            }, error => {
            });
    }

    getAgingByVendor(){
        let base = this;
        let request={
            "type": "aging",
            "companyID": this.currentCompanyId,
            "companyCurrency": "USD",
            "period": "Today",
            "asOfDate": this.asOfDate,
            "daysPerAgingPeriod": "30",
            "numberOfPeriods": "3"
        };
        this.reportService.generateReport(request).subscribe(report => {
            if(!report){
                return;
            }
            this.hasAgingByVendor = true;
            let columns = report.columns || [];
            let keys = Object.keys(report.data);
            let data:any = [];
            for (let key of keys) {
                if(key!='TOTAL') {
                    let vendor = report.data[key];
                    let vendorId = vendor['VendorID'];
                    delete vendor['TOTAL'];
                    delete vendor['VendorID'];
                    delete vendor['type'];
                    let values = Object.keys(vendor).map(k => vendor[k]);
                    values = this.removeCurrency(values);
                    let current = values.pop();
                    values.splice(0, 0, current);
                    data.push({
                        name : vendorId,
                        data : values
                    });
                }
            }
            this.agingByVendorChartOptions={
                colors: this.chartColors,
                chart: {
                    type: 'bar',
                    marginRight: 50,
                    style: {
                        fontFamily: 'NiveauGroteskRegular'
                    }
                },
                title: {
                    text: 'Aging By Vendor',
                    align: 'left',
                    style: {
                        color: '#878787',
                        fontFamily: 'NiveauGroteskLight',
                        fontSize:'24'
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
                    pointFormatter: function(){
                      return '<span style="color:'+this.series.color+'">'+this.series.name+': '+base.formatAmount(this.y)+'</span><br/>'
                    },
                    shared: true
                },
                yAxis: {
                    gridLineWidth: 0,
                    minorGridLineWidth: 0,
                    min: 0,
                    title: {
                        text: null,
                        style: {
                            fontSize:'15px'

                        }
                    },
                    stackLabels: {
                        enabled: true,
                        formatter: function () {
                            return base.formatAmount(this.total);
                        },
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#878787',
                            fill:'#878787'
                        }
                    },
                    labels: {
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#878787',
                            fill:'#878787'

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
                            format: '{y}',
                            fontSize:'13px',
                            color:'#878787',
                            fill:'#878787',
                            style: {
                                fontSize:'13px'
                            },
                        }
                    }
                },
                series: data
            };
        });
    }

    getDataArray(dataObj, categories){
        let result = [];
        _.each(categories, function(category){
            result.push(dataObj[category] || 0);
        });
        return result;
    }

    expandChart(type) {
        this.showDetailedChart = true;
        if (type == 'profitTrend') {
            this.detailedReportChartOptions = this.profitTrendChartOptions;
            this.detailedReportChartOptions.legend = {enabled: true};
        } else if (type == 'cashBurnChart') {
            this.detailedReportChartOptions = this.cashBurnDataOptions;
            this.detailedReportChartOptions.legend = {enabled: true};
        } else if (type == 'agingByVendor') {
            this.detailedReportChartOptions = _.clone(this.agingByVendorChartOptions);
            this.detailedReportChartOptions.legend = {enabled: true};
            this.detailedReportChartOptions.yAxis.title = {text: 'Payable Amount',style: {fontSize:'15px'}};
        } else if (type == 'agingByCustomer') {
            this.detailedReportChartOptions = _.clone(this.agingByCustomerChartOptions);
            this.detailedReportChartOptions.legend = {enabled: true};
            this.detailedReportChartOptions.yAxis.title = {text: 'Receivable Amount',style: {fontSize:'15px'}};
        } else if (type == 'arApCashBalance') {
            this.detailedReportChartOptions = this.arApCashBalanceChartOptions;
            this.detailedReportChartOptions.legend = {enabled: true};
        } else if (type == 'grossAndNetProfit') {
            this.detailedReportChartOptions = this.gpNpChartDataOptions;
            this.detailedReportChartOptions.legend = {enabled: true};
        } else if (type == 'indicatorChart') {
          this.detailedReportChartOptions = this.indicatorChartOptions;
          this.detailedReportChartOptions.legend = {enabled: true};
        } else if (type == 'monthlyExpenseChart') {
          this.detailedReportChartOptions = this.monthlyExpenseChartOptions;
          this.detailedReportChartOptions.legend = {enabled: true};
        }
    }

    removeCurrency(values) {
        let _values = [];
        let base = this;
        values.forEach(function(value) {
            _values.push(base.numeralService.value(value));
        });
        return _values;
    }
}
