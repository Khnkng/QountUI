/**
 * Created by NAZIA on 11-04-2017.
 */

import {Component, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {HighChart} from "reportsUI/app/directives/HighChart.directive";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {ReportService} from "reportsUI/app/services/Reports.service";
declare var jQuery:any;
declare var _:any;
declare var Highcharts:any;

@Component({
    selector: 'paymentdashboard',
    templateUrl: '/app/views/paymentdashboard.html'
})
export class paymentdashboardComponent {
    report:any={};
    reportChartOptionsStacked:any;
    reportChartOptions:any;
    hasItemCodes: boolean = false;
    companyId:string;
    showFlyout:boolean = true;
    taxesList:any;
    tableData:any = {};
    tableColumns:Array<string> = ['bill_date','vendor_name', 'current_state', 'due_date', 'amount'];
    tableOptions:any = {};
    ttt:any;
    todaysDate:any;
    reportasas:boolean= false;
    paymentcount:any;
    payable:boolean=false;
    tablelist:any;
    @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('createtaxes') createtaxes;
    constructor(private _router: Router,private companyService: CompaniesService,
                private loadingService:LoadingService,private reportService: ReportService) {
        this.companyId = Session.getCurrentCompany();
        this.generateChart();

        this.companyService.getpaymentcount(this.companyId)
            .subscribe(paymentcount  => {
                this.paymentcount=paymentcount;
                this.payable=true;
            });

        this.companyService.getcurrentpaymenttable(this.companyId)
            .subscribe(tablelist  => {
                this.tablelist=tablelist;
                console.log("tablelist",tablelist);
                this.buildTableData(tablelist);
                // this.showMessage(true, success);
            }, error =>  console.log("error"));
    }
    removeCurrency(values) {
        let _values = [];
        values.forEach(function(value) {
            _values.push(Number(value.substring(1, value. length)));
        });
        return _values;
    }
    payableclick(payableclick){
        let link = ['Paymentstable', payableclick];
        this._router.navigate(link);
    }

    hideFlyout(){
        let link = ['payments/dashboard', 'enter'];
        this._router.navigate(link);
        this.showFlyout = !this.showFlyout;
    }

    generateChart() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        this.todaysDate= mm+"/"+dd+"/"+yyyy;
        this.ttt={
            "type": "aging",
            "companyID": this.companyId,
            "companyCurrency": "USD",
            "period": "Today",
            "asOfDate": this.todaysDate,
            "daysPerAgingPeriod": "30",
            "numberOfPeriods": "5"
        }
        this.reportService.generateReport(this.ttt).subscribe(report  => {


        let _report = _.cloneDeep(report);
        let columns = _report.columns || [];
        columns.splice(_report.columns.length - 1, 1);


        let keys=Object.keys(_report.data);
        let series:any = [];
        for (let key of keys) {
            if(key!='TOTAL') {
                let vendor = _report.data[key];
                let vendorId = vendor['VendorID'];
                delete vendor['TOTAL'];
                delete vendor['VendorID'];
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
        console.log("series",series);
        // Highcharts.setOptions({
        //     colors: ['#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263',      '#6AF9C4']
        // });
        Highcharts.theme = {
            colors: ['skyblue', 'deepskyblue', 'lightgreen', 'mediumspringgreen', 'skyblue', 'deepskyblue',
                'lightgreen', 'mediumspringgreen'],
            title: {
                style: {
                    color: '#003399',
                    font: 'bold 14px #003399'

                }
            },
            xAxis: {
                style: {
                    color: '##003399',
                    font: 'bold 14px #003399'

                }
            },
            subtitle: {
                style: {
                    color: '#003399',
                    font: 'bold 14px #003399',
                }
            },

            // legend: {
            //   itemStyle: {
            //     font: '9pt Trebuchet MS, Verdana, sans-serif',
            //     color: 'black'
            //   },
            //   itemHoverStyle:{
            //     color: 'gray'
            //   }
            // }
        };

// Apply the theme
        Highcharts.setOptions(Highcharts.theme);
            this.reportChartOptionsStacked = {
                chart: {
                    type: 'column',
                    width:500
                },
                title: {
                    text: 'AP Aging Report'
                },
                xAxis: {
                    categories: columns,
                    labels: {
                        style: {
                            fontWeight: 'bold',
                            color:'#003399'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    labels: {
                        style: {
                            fontWeight: 'bold',
                            color:'#003399'
                        }
                    },
                    title: {
                        style:{
                            fontWeight: 'bold',
                            color:'#003399'
                        },
                        text: 'Total Amount'
                    },colors: ['skyblue', 'deepskyblue', 'lightgreen', 'mediumspringgreen', 'skyblue', 'deepskyblue',
                        'lightgreen', 'mediumspringgreen'],
                    stackLabels: {
                        enabled: true,
                        format: '${total}',
                        style: {
                            fontWeight: 'bold',
                            color:'#003399',
                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: -40,
                    y: 10,
                    floating: true,
                    borderWidth: 1,
                    backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                    shadow: true
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
                            color: '#003399'
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    }
                },
                series: series
            }
        this.reportChartOptions = {
            chart: {
                type: 'column',
                width:500
            },
            title: {
                text: 'AP Aging Report'
            },
            xAxis: {
                categories: columns,
                labels: {
                    style: {
                        fontWeight: 'bold',
                        color:'#003399'
                    }
                }
            },
            yAxis: {
                min: 0,
                labels: {
                    style: {
                        fontWeight: 'bold',
                        color:'#003399'
                    }
                },
                title: {
                    style:{
                        fontWeight: 'bold',
                        color:'#003399'
                    },
                    text: 'Total Amount'
                },colors: ['skyblue', 'deepskyblue', 'lightgreen', 'mediumspringgreen', 'skyblue', 'deepskyblue',
                    'lightgreen', 'mediumspringgreen'],
                stackLabels: {
                    enabled: true,
                    format: '${total}',
                    style: {
                        fontWeight: 'bold',
                        color:'#003399',
                        // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 10,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                shadow: true
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: ${point.y}<br/>Total: ${point.stackTotal}'
            },
            plotOptions: {
                column: {
                    //stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        format: '${y}',
                        color: '#003399'
                        // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                    }
                }
            },
            series: series
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
            {"name": "amount", "title": "Amount"}
        ];
        let base = this;
        tablelist.forEach(function(expense) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                    row[key] = expense[key];
                // row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        base.hasItemCodes = false;
        setTimeout(function(){

            base.hasItemCodes = true;
        }, 0)
        this.loadingService.triggerLoadingEvent(false);
    }
}

