
import {Component,ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {PaymentsPlanService} from "qCommon/app/services/PaymentsPlan.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {PaymentsPlan} from "../forms/PaymentsPlan.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {Router} from "@angular/router";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {DAYS_OF_WEEK, DAYS_OF_MONTH,WEEK_OF_MONTH,MONTH_OF_QUARTER,MONTH_OF_YEAR} from "qCommon/app/constants/Date.constants";
import {ReportService} from "reportsUI/app/services/Reports.service";

declare let jQuery:any;
declare let _:any;
declare let moment:any;

@Component({
    selector: 'payments-plan',
    templateUrl: '../views/PaymentsPlan.html',
})

export class PaymentsPlanComponent{
    paymentPlanForm: FormGroup;
    paymentPlans = [];
    newFormActive:boolean = true;
    hasPaymentPlans: boolean = false;
    tableData:any = {};
    tableOptions:any = {};
    editMode:boolean = false;
    paymentPlanId:any;
    row:any;
    tableColumns:Array<string> = ['name', 'id', 'frequency', 'ends_after'];
    showFlyout:boolean = false;
    confirmSubscription:any;
    companyCurrency:string;
    routeSubscribe:any;
    companyID:string;
    dayOfWeek:Array<string>=DAYS_OF_WEEK;
    dayOfMonth:Array<string>=DAYS_OF_MONTH;
    weekOfMonth:Array<string>=WEEK_OF_MONTH;
    monthOfQuarter:Array<string>=MONTH_OF_QUARTER;
    monthOfYear:Array<string>=MONTH_OF_YEAR;
    dateFormat:string;
    serviceDateformat:string;
    paymentsPlanTableColumns: Array<any> = ['Name', 'Frequency', 'End Date'];
    pdfTableData: any = {"tableHeader": {"values": []}, "tableRows" : {"rows": []} };

    constructor(private _fb: FormBuilder, private _paymentPlanForm: PaymentsPlan, private switchBoard: SwitchBoard,private _router: Router,
                private codeService: PaymentsPlanService, private toastService: ToastService, private loadingService:LoadingService,
                private titleService:pageTitleService, private dateFormater:DateFormater, private reportsService: ReportService){
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.titleService.setPageTitle("Payments Plan");
        this.paymentPlanForm = this._fb.group(_paymentPlanForm.getForm());
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(toast => this.deleteItemCode(toast));
        this.companyID = Session.getCurrentCompany();
        this.companyCurrency = Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
            if(this.showFlyout){
                this.hideFlyout();
            }else {
                this.toolsRedirect();
            }
        });
        this.codeService.paymentPlans(this.companyID)
            .subscribe(paymentPlans => this.buildTableData(paymentPlans), error=> this.handleError(error));
    }

    toolsRedirect(){
        let link = ['tools'];
        this._router.navigate(link);
    }
    ngOnDestroy(){
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    }

    handleError(error){
        this.loadingService.triggerLoadingEvent(false);
        this.row = {};
        this.toastService.pop(TOAST_TYPE.error, "Could not perform operation");
    }

    showPaymentPlan() {
        this.titleService.setPageTitle("Create Payment Plan");
        this.editMode = false;
        this.paymentPlanForm = this._fb.group(this._paymentPlanForm.getForm());
        this.newForm();
        this.showFlyout = true;
    }

    showEditPaymentPlan(row: any){
        this.titleService.setPageTitle("Update Payment Plan");
        this.loadingService.triggerLoadingEvent(true);
        this.codeService.getPaymentPlan(row.id,this.companyID)
            .subscribe(item => {
                this.row=item;
                this._paymentPlanForm.updateForm(this.paymentPlanForm, this.row);
                this.loadingService.triggerLoadingEvent(false);
            }, error => this.handleError(error));
        this.editMode = true;
        this.showFlyout = true;
    }
    deleteItemCode(toast){
        this.loadingService.triggerLoadingEvent(true);
        this.codeService.removePaymentPlan(this.paymentPlanId,this.companyID)
            .subscribe(coa => {
                this.toastService.pop(TOAST_TYPE.success, "Payment plan deleted successfully");
                this.codeService.paymentPlans(this.companyID)
                    .subscribe(paymentPlans => this.buildTableData(paymentPlans), error=> this.handleError(error));
            }, error => this.handleError(error));
    }
    removePaymentPlan(row: any){
        this.paymentPlanId = row.id;
        this.toastService.pop(TOAST_TYPE.confirm, "Are you sure you want to delete?");
    }

    newForm(){
        this.newFormActive = false;
        setTimeout(()=> this.newFormActive=true, 0);
    }

    ngOnInit(){

    }

    handleAction($event){
        let action = $event.action;
        delete $event.action;
        delete $event.actions;
        if(action == 'edit') {
            this.showEditPaymentPlan($event);
        } else if(action == 'delete'){
            this.removePaymentPlan($event);
        }
    }

    submit($event){
        let base = this;
        $event && $event.preventDefault();
        let data = this._paymentPlanForm.getData(this.paymentPlanForm);

    if(data.frequency!='daily'&&!data.day){
            this.toastService.pop(TOAST_TYPE.error, "Please select day");
            return
        }else if((data.frequency=='quarterly'||data.frequency=='yearly')&&!data.month){
            this.toastService.pop(TOAST_TYPE.error, "Please select month");
            return
        }
        data.amount=data.amount+"";
        //data.ends_after=moment(data.ends_after,'MM/DD/YYYY').format("YYYY-MM-DD");
        data.ends_after=this.dateFormater.formatDate(data.ends_after,this.dateFormat,this.serviceDateformat);
        if(data.frequency=='quarterly'||data.frequency=='yearly'){
            let dayObj:any={};
            dayObj.month=data.month;
            dayObj.day=data.day;
            data.day_map=dayObj;
            delete data.day;
        }
        this.loadingService.triggerLoadingEvent(true);
        if(this.editMode){
            data.id = this.row.id;
            this.codeService.updatePaymentPlan(data,this.companyID)
                .subscribe(itemCode => {
                    base.row = {};
                    base.toastService.pop(TOAST_TYPE.success, "Payment plan updated successfully");
                    let index = _.findIndex(base.paymentPlans, {id: data.id});
                    base.paymentPlans[index] = itemCode;
                    base.buildTableData(base.paymentPlans);
                    this.showFlyout = false;
                }, error => this.handleError(error));
        } else{
            this.codeService.addPaymentPlan(data,this.companyID)
                .subscribe(newItemcode => {
                    this.handleItemCode(newItemcode);
                    this.showFlyout = false;
                }, error => this.handleError(error));
        }
    }

    handleItemCode(newItemCode){
        this.toastService.pop(TOAST_TYPE.success, "Payment plan created successfully");
        this.paymentPlans.push(newItemCode);
        this.buildTableData(this.paymentPlans);
    }

    buildTableData(paymentPlans) {
        this.hasPaymentPlans = false;
        this.paymentPlans = paymentPlans;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            {"name": "name", "title": "Name"},
            {"name": "frequency", "title": "Frequency"},
            {"name": "ends_after", "title": "End Date"},
            {"name": "id", "title": "Id", "visible": false},
            {"name": "actions", "title": ""}
        ];
        let base = this;
        paymentPlans.forEach(function(itemCode) {
            let row:any = {};
            _.each(base.tableColumns, function(key) {
                if(key == 'ends_after') {
                    row[key] = base.dateFormater.formatDate(itemCode[key],base.serviceDateformat,base.dateFormat);
                }else {
                    row[key] = itemCode[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function(){
            base.hasPaymentPlans = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    }

    hideFlyout(){
        this.titleService.setPageTitle("Payments Plan");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    }

    setPlanEndDate(date){
        let planEndDateControl:any = this.paymentPlanForm.controls['ends_after'];
        planEndDateControl.patchValue(date);
    }

  getPaymentsPlanTableData(inputData) {
    let tempData = _.cloneDeep(inputData);
    let newTableData: Array<any> = [];
    let tempJsonArray: any;

    for( var i in  tempData) {
      tempJsonArray = {};
      tempJsonArray["Name"] = tempData[i].name;
      tempJsonArray["Frequency"] = tempData[i].frequency;
      tempJsonArray["End Date"] = tempData[i].ends_after;

      newTableData.push(tempJsonArray);
    }

    return newTableData;
  }

  buildPdfTabledata(fileType){
    this.pdfTableData['documentHeader'] = "Header";
    this.pdfTableData['documentFooter'] = "Footer";
    this.pdfTableData['fileType'] = fileType;
    this.pdfTableData['name'] = "Name";

    this.pdfTableData.tableHeader.values = this.paymentsPlanTableColumns;
    this.pdfTableData.tableRows.rows = this.getPaymentsPlanTableData(this.tableData.rows);
  }

  exportToExcel() {
    this.buildPdfTabledata("excel");
    this.reportsService.exportFooTableIntoFile(this.companyID, this.pdfTableData)
      .subscribe(data =>{
        let blob = new Blob([data._body], {type:"application/vnd.ms-excel"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link['download'] = "PaymentsPlan.xls";
        link.click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed to Export table into Excel");
      });
    // jQuery('#example-dropdown').foundation('close');

  }

  exportToPDF(tabId) {
    this.buildPdfTabledata("pdf");

    this.reportsService.exportFooTableIntoFile(this.companyID, this.pdfTableData)
      .subscribe(data =>{
        var blob = new Blob([data._body], {type:"application/pdf"});
        var link = jQuery('<a></a>');
        link[0].href = URL.createObjectURL(blob);
        link[0].download = "PaymentsPlan.pdf";
        link[0].click();
      }, error =>{
        this.toastService.pop(TOAST_TYPE.error, "Failed to Export table into PDF");
      });

  }

}
