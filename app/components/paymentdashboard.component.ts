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
    reportChartOptions:any;
    hasItemCodes: boolean = false;
    companyId:string;
    showFlyout:boolean = true;
    taxesList:any;
    tableData:any = {};
    tableColumns:Array<string> = ['id','name', 'tin', 'visibleOnInvoices', 'taxAuthorityName', 'taxRate','coa_name','recoverableTax','compoundTax'];
    tableOptions:any = {};
    ttt:any;
    todaysDate:any;
    reportasas:boolean= false;
    @ViewChild('hChart1') hChart1:HighChart;
    @ViewChild('createtaxes') createtaxes;
    constructor(private _router: Router,private companyService: CompaniesService,
                private loadingService:LoadingService,private reportService: ReportService) {
        this.companyId = Session.getCurrentCompany();
        this.generateChart();
        this.companyService.getTaxofCompany(this.companyId)
            .subscribe(taxesList  => {
                this.buildTableData(taxesList);
                this.taxesList=taxesList;
                console.log("taxesListtaxesList",taxesList);
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
            "numberOfPeriods": "4"
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
        // Highcharts.setOptions({
        //     colors: ['#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263',      '#6AF9C4']
        // });
        Highcharts.theme = {
            colors: ['#4885ed', '#3cba54', '#f4c20d', '#00BFFF', '#db3236', '#64E572',
                '#FF9655', '#FFF263', '#6AF9C4'],
            title: {
                style: {
                    color: '#000',
                    font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
                }
            },
            subtitle: {
                style: {
                    color: '#666666',
                    font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
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

        this.reportChartOptions = {
            chart: {
                type: 'column'
            },
            title: {
                text: 'AP Aging Report'
            },
            xAxis: {
                categories: columns
            },
            yAxis: {
                title: {
                    text: 'Total Amount'
                },colors: ['#4885ed', '#3cba54', '#f4c20d', '#00BFFF', '#db3236', '#64E572',
                    '#FF9655', '#FFF263', '#6AF9C4'],
                stackLabels: {
                    enabled: true,
                    format: '${total}',
                    style: {
                        fontWeight: 'bold',
                        // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
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
                        // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                    }
                }
            },
            scrollbar: {
                enabled: true
            },
            series: series
        }
            this.reportasas=true;
        });
    }

    buildTableData(taxesList) {
       this.hasItemCodes = false;
        this.taxesList = taxesList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name":"id","title":"id","visible": false},
            {"name": "name", "title": "Tax Name"},
            {"name": "tin", "title": "Tax Number"},
            {"name": "visibleOnInvoices", "title": "Display Invoices"},
            {"name": "taxAuthorityName", "title": "Tax Authority Name"},
            {"name": "taxRate", "title": "Tax Rate"},
            {"name": "coa_name", "title": "COA"},

            {"name": "recoverableTax", "title": "Recoverable Tax"},
            {"name": "compoundTax", "title": "Compound Tax"},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        taxesList.forEach(function(expense) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                if(key == 'taxRate'){
                    console.log("taxRate");
                    row[key] = expense[key]+"%";
                }  else{
                    row[key] = expense[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
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

