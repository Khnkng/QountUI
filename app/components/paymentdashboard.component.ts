/**
 * Created by NAZIA on 11-04-2017.
 */
import {Component, HostListener, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {HighChart} from "reportsUI/app/directives/HighChart.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ReportService} from "reportsUI/app/services/Reports.service";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";
declare var jQuery:any;
declare var _:any;
declare var Highcharts:any;
declare var numeral:any;
@Component({
    selector: 'paymentdashboard',
    templateUrl: '/app/views/paymentdashboard.html'
})
export class paymentdashboardComponent {
    report:any={};
    reportChartOptionsStacked:any;
    reportChartOptionsStackedlegend:any;
    reportChartOptionspielegend:any;
    reportChartOptions:any;
    reportChartOptionspie:any;
    detailedReportChartOptions:any;
    hasItemCodes: boolean = false;
    companyCurrency: string;
    companyId:string;
    showFlyout:boolean = true;
    taxesList:any;
    tableData:any = {};
    tableColumns:Array<string> = ['bill_date','vendor_name', 'current_state', 'due_date', 'amount','daysToPay'];
    tableOptions:any = {};
    ttt:any;
    todaysDate:any;
    reportasas:boolean= false;
    paymentcount:any;
    payable:boolean=false;
    isTransit:boolean=false;
    tablelist:any;
    totalapproveamount:any;
    totalpayamont:any;
    totalPayableamount:any;
    pastdue:any;
    totalPayBillAmount:any;
    dateFormat:string;
    serviceDateformat:string;
    showCharts:boolean = false;
    bookcount:any;
    paycount:boolean=false;
    paidcount:any;
    payablecount:boolean=false;
    payableBalance:boolean=false;
    paymentsInTransit:any;
    @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('hChart2') hChart2:HighChart;
    @ViewChild('hChart3') hChart3:HighChart;
    @ViewChild('hChart4') hChart4:HighChart;
    @ViewChild('createtaxes') createtaxes;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        let base = this;
        if(this.showFlyout) {
            base.hChart1.redraw();
            base.hChart2.redraw();
            base.hChart3.redraw();

        }
        else if(this.showCharts){
            base.hChart4.redraw();
        }
        else{

        }
    }

    constructor(private _router: Router,private companyService: CompaniesService,
                private loadingService:LoadingService,private reportService: ReportService,private dateFormater:DateFormater,private numeralService:NumeralService) {
        this.companyId = Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.generateChart();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.getpaymentcount(this.companyId)
            .subscribe(paymentcount  => {
                this.paymentcount=paymentcount;
                console.log("paymentcount",this.paymentcount);
                this.payable=true;
            });

        this.companyService.getlastpaidcount(this.companyId)
            .subscribe(paidcount  => {
                this.paidcount=paidcount;
                this.payablecount=true;
            });
        this.companyService.getbookcount(this.companyId)
            .subscribe(bookcount  => {
                this.bookcount=bookcount;
                this.payableBalance=true;
            });
        this.companyService.getcurrentpaymenttable(this.companyId)
            .subscribe(tablelist  => {
                this.tablelist=tablelist;
                this.buildTableData(tablelist);
                // this.showMessage(true, success);
            }, error =>  console.log("error"));
        this.companyService.getPaymentsInTransit(this.companyId)
            .subscribe(paymentsTransit  => {
                this.paymentsInTransit=paymentsTransit;
                this.isTransit = true;
            }, error =>  console.log("error"));
    }
    removeCurrency(values) {
        let _values = [];
        let base = this;
        values.forEach(function(value) {
            _values.push(base.numeralService.value(value));
        });
        return _values;
    }
    payableclick(payableclick){
        let link = ['bills', payableclick];
        this._router.navigate(link);
    }
    paidclick(payableclick){
        let link;
        link = ['paid',payableclick]
        this._router.navigate(link);
        /*if(payableclick == '30days') {
            link = ['paid'];
        }else{
        }*/
    }

    hideFlyout(){
        let link = ['payments/dashboard', 'enter'];
        this._router.navigate(link);
        this.showFlyout = !this.showFlyout;
    }
    showOtherCharts(type){
        if(type=='stackedbar'){
            this.detailedReportChartOptions = this.reportChartOptionsStackedlegend;
        }else if(type == 'pie'){
            this.detailedReportChartOptions = this.reportChartOptionspielegend;
        }else if(type=="bar"){
            this.detailedReportChartOptions = this.reportChartOptions;
        }
        this.showFlyout = !this.showFlyout;
        this.showCharts = !this.showCharts;
        this.generateChart();
    }
    generateChart() {
        this.todaysDate= moment(new Date()).format(this.dateFormat);
        this.ttt={
            "type": "aging",
            "companyID": this.companyId,
            "companyCurrency": "USD",
            "period": "Today",
            "asOfDate": this.todaysDate,
            "daysPerAgingPeriod": "30",
            "numberOfPeriods": "3"
        }
        this.reportService.generateReport(this.ttt).subscribe(report  => {
            let _report = _.cloneDeep(report);
            let columns = _report.columns || [];
            columns.splice(_report.columns.length - 1, 1);
            let keys=Object.keys(_report.data);
            let serieskkk:any = [];
            let seriesttt:any=[];
            let series:any = [];
            for (let key of keys) {
                if(key!='TOTAL') {
                    let vendor = _report.data[key];
                    let vendorId = vendor['VendorID'];
                    let q=_report.data[key];
                    let values = q.TOTAL;
                    let rtrtr=this.numeralService.value(values)
                    serieskkk.push({
                        name : vendorId,
                        y : rtrtr
                    });

                }
            }
            var sliced=serieskkk[0];
            sliced['sliced']=true;
            sliced['selected']=true;
            for (let key of keys) {
                if(key=='TOTAL') {
                    let vendor = _report.data[key];
                    let vendorId = vendor['VendorID'];
                    delete vendor['TOTAL'];
                    delete vendor['VendorID'];
                    let values = Object.values(vendor);
                    let v=Object.keys(vendor);
                    values = this.removeCurrency(values);
                    let current = values.pop();
                    values.splice(0, 0, current);
                    for(var i=0;i<values.length;i++){
                        seriesttt.push({
                            name : v[i],
                            y : values[i]
                        });
                    }
                }
            }
            for (let key of keys) {
                if(key!='TOTAL') {
                    let vendor = _report.data[key];
                    let vendorId = vendor['VendorID'];
                    delete vendor['TOTAL'];
                    delete vendor['VendorID'];
                    delete vendor['type'];
                    let values = Object.values(vendor);
                    values = this.removeCurrency(values);
                    let current = values.pop();
                    values.splice(0, 0, current);
                    series.push({
                        name : vendorId,
                        data : values
                    });
                }
            }
            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });
            this.reportChartOptionsStackedlegend={

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
                            fontSize:'15px'

                        }
                    },

                    stackLabels: {
                        enabled: true,
                        formatter: function () {
                            return '$'+Highcharts.numberFormat(this.total,2);
                        },
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#003399',
                            fill:'#003399'
                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    },
                    labels: {
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#003399',
                            fill:'#003399'

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
                            fontSize:'13px',
                            color:'#003399',
                            fill:'#003399',
                            style: {
                                fontSize:'13px'
                            },
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    },

                },
                series:series
            }

            this.reportChartOptionsStacked = {
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
                            fontSize:'15px'

                        }
                    },
                    stackLabels: {
                        enabled: true,
                        formatter: function () {
                            return '$'+Highcharts.numberFormat(this.total,2);
                        },
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#003399',
                            fill:'#003399'
                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    },
                    labels: {
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#003399',
                            fill:'#003399'

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
                            fontSize:'13px',
                            color:'#003399',
                            fill:'#003399',
                            style: {
                                fontSize:'13px'
                            },
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    },

                },
                series:series
            }
            this.reportChartOptionspielegend={
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
                series:  [{
                    colorByPoint: true,
                    data:serieskkk
                }],
            }
            this.reportChartOptionspie = {
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
                        formatter: function(){
                            return this.y;
                        },
                        distance: -40,
                        color: 'white'
                    },
                    showInLegend: true
                },
                series:  [{
                    colorByPoint: true,
                    data:serieskkk
                }],
            }
            this.reportChartOptions = {

                chart: {
                    type: 'column'
                },
                title: {
                    text: 'AP Aging Summary',
                    style: {
                        fontSize:'17px',
                        color:'#666666',
                        fill:'#666666'

                    }
                },

                subtitle: {
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    type: 'category',

                    labels: {
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#003399',
                            fill:'#003399'

                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Total Amount',
                        style: {
                            fontSize:'15px'

                        }

                    },
                    labels: {
                        style: {
                            fontSize:'13px'

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
                                return '$'+Highcharts.numberFormat(this.y,2);
                            },

                            fontSize:'13px',
                            color:'#003399',
                            fill:'#003399',
                            style: {
                                fontSize:'13px'
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
            }
            this.reportasas=true;
        });
    }

    buildTableData(tablelist) {
        this.hasItemCodes = false;
        this.tablelist = tablelist;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name": "bill_date", "title": "Bill Date"},
            {"name": "vendor_name", "title": "Vendor Name"},
            {"name": "current_state", "title": "Current State"},
            {"name": "due_date", "title": "Due Date"},

            {"name": "amount", "title": "Amount", "type":"number", "formatter": (amount)=>{
                amount = parseFloat(amount);
                return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }},
            {"name": "daysToPay", "title": "Days to Pay"}
        ];

        let base = this;
        tablelist.forEach(function(expense) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                if(key == 'amount') {
                    let amount = parseFloat(expense[key]);
                    row[key] = amount.toFixed(2); // just to support regular number with .00
                }else {
                    row[key] = expense[key];
                }
                let currentDate=moment(new Date()).format("YYYY-MM-DD");
                let daysToPay =moment(expense['due_date'],"MM/DD/YYYY").diff(currentDate,'days');
                if(daysToPay<=0){
                    daysToPay='<span color="red" style="color: red">'+daysToPay+'</span>'
                }
                row['daysToPay']=daysToPay;
                // row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function(){
            base.hasItemCodes = true;
        }, 0)
        this.loadingService.triggerLoadingEvent(false);
    };


}
