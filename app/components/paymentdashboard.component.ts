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
import {DateFormater} from "qCommon/app/services/DateFormatter.service";

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
    tablelist:any;
    totalapproveamount:any;
    totalpayamont:any;
    totalPayableamount:any;
    pastdue:any;
    totalPayBillAmount:any;
    dateFormat:string;
    serviceDateformat:string;
    @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('createtaxes') createtaxes;
    constructor(private _router: Router,private companyService: CompaniesService,
                private loadingService:LoadingService,private reportService: ReportService,private dateFormater:DateFormater) {
        this.companyId = Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.generateChart();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.companyService.getpaymentcount(this.companyId)
            .subscribe(paymentcount  => {
                this.paymentcount=paymentcount;
                var t=paymentcount.totalApproveBillAmount;
                this.totalapproveamount=t.toFixed(2);
                var payableAmount=paymentcount.totalPayable;
                this.totalPayableamount=payableAmount.toFixed(2);
                var pastdueamount=paymentcount.pastDue;
                this.pastdue=pastdueamount.toFixed(2);
                this.totalpayamont=paymentcount.totalPayBillAmount;
                var totalbillAmount=paymentcount.totalPayBillAmount;
                this.totalPayBillAmount=totalbillAmount.toFixed(2);
                this.payable=true;
            });

        this.companyService.getcurrentpaymenttable(this.companyId)
            .subscribe(tablelist  => {
                this.tablelist=tablelist;
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
        let link = ['bills', payableclick];
        this._router.navigate(link);
    }

    hideFlyout(){
        let link = ['payments/dashboard', 'enter'];
        this._router.navigate(link);
        this.showFlyout = !this.showFlyout;
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
            "numberOfPeriods": "5"
        }
        this.reportService.generateReport(this.ttt).subscribe(report  => {


            let _report = _.cloneDeep(report);
            let columns = _report.columns || [];
            columns.splice(_report.columns.length - 1, 1);


            let keys=Object.keys(_report.data);
            let series:any = [];
            let seriesttt:any=[];
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

            this.reportChartOptionsStacked = {
                chart: {
                    type: 'column',
                    width:500
                },
                title: {
                    text: 'Ap Aging Report',
                    style: {
                        fontSize:'17px',
                        color:'#666666',
                        fill:'#666666'

                    }
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    categories: columns,
                    labels: {
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#003399',
                            fill:'#003399',
                            textDecoration:'underline'

                        }
                    }
                },
                yAxis: {
                    min: 0,
                    labels: {
                        style: {
                            fontSize:'15px'

                        }
                    },
                    title: {
                        text: 'Total Amount',
                        style: {
                            fontSize:'15px'

                        }
                    },
                    stackLabels: {
                        enabled: true,
                        format: '${total}',
                        style: {
                            fontSize:'13px',
                            fontWeight:'bold',
                            color:'#003399',
                            fill:'#003399'
                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                },
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    x: 0,
                    y: 0
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
                            fontSize:'13px',
                            color:'#003399',
                            fill:'#003399',
                            textDecoration:'underline',
                            style: {
                                fontSize:'13px'
                            }
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    }
                },
                series: series
            }
            this.reportChartOptions = {

                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Ap Aging Report',
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
                            fill:'#003399',
                            textDecoration:'underline'

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
                            format: '${y}',
                            fontSize:'13px',
                            color:'#003399',
                            fill:'#003399',
                            textDecoration:'underline',
                            style: {
                                fontSize:'13px'
                            }

                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y}</b> of total<br/>'
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
    }
}

