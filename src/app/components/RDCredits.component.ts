
import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {RDcreditsService} from "../services/RDcredits.service";
import {RDcreditsForm} from "../forms/RDcredits.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";

declare var jQuery: any;
declare var _: any;
declare let moment: any;

@Component({
  selector: 'rdCredits',
  templateUrl: '../views/RDCredits.html'
})

export class RDCreditsComponent {
  status: any;
  dateFormat: string;
  serviceDateformat: string;
  editMode:boolean = false;
  @ViewChild('coaComboBoxDir') coaComboBox: ComboBox;

  row: any;
  rdCreditsForm: FormGroup;
  message: string;
  companyId: string;
  showFlyout: boolean = false;
  routeSubscribe: any;
  companyCurrency: string;
  years: Array<any> = [];
  chartOfAccounts: Array<any>=[];
  bankCoa: Array<any>=[];
  creditCoa: Array<any>=[];
  rdCredits: Array<any>=[];
  defaultDate:string;
  count: any = 0;

  constructor(private _fb: FormBuilder, private rdCreditsService: RDcreditsService,
              private _rdCreditsForm: RDcreditsForm, private _router: Router, private _toastService: ToastService,
              private switchBoard: SwitchBoard, private loadingService: LoadingService, private titleService: pageTitleService,
              private dateFormater: DateFormater, private coaService: ChartOfAccountsService) {
    this.companyCurrency = Session.getCurrentCompanyCurrency();
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
    this.generateYears();
    this.titleService.setPageTitle("R&D Credits");
    this.rdCreditsForm = this._fb.group(_rdCreditsForm.getForm());
    this.companyId = Session.getCurrentCompany();
    this.defaultDate = moment(new Date()).format(this.dateFormat);

    if(this.companyId){
      let base= this;
      this.loadingService.triggerLoadingEvent(true);
      this.coaService.chartOfAccounts(this.companyId)
        .subscribe(chartOfAccounts => {
          chartOfAccounts = _.filter(chartOfAccounts, {'inActive': false});
          this.bankCoa=_.filter(chartOfAccounts, {'type': 'bank'});
          this.creditCoa=_.filter(chartOfAccounts, {'type': 'creditCard'});
          this.chartOfAccounts = chartOfAccounts;
          base.getAllCredits();
        }, error =>{
          this.loadingService.triggerLoadingEvent(false);
          this._toastService.pop(TOAST_TYPE.error, "Failed To Load Chart Of Accounts");
        });
    } else{
      this._toastService.pop(TOAST_TYPE.warning, "No Default Company Set. Please Hop To A Company.");
    }

    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      if(this.showFlyout){
        this.count = 0;
        this.hideFlyout();
      }else {
        this.toolsRedirect();
      }
    });
  }

  getAllCredits(){
    this.loadingService.triggerLoadingEvent(true);
    this.serviceCallForCredits();
  }

  toolsRedirect(){
    let link = ['tools'];
    this._router.navigate(link);
  }

  getDateValue(date){
    return (date) ? this.dateFormater.formatDate(date,this.serviceDateformat, "MMM DD, YYYY") : date;
  }

  updateChartOfAccount(coa){
    let data = this._rdCreditsForm.getData(this.rdCreditsForm);
    if(coa && coa.id){
      data.coaId = coa.id;
    }else if(!coa||coa=='--None--'){
      data.coaId='--None--';
    }
    this._rdCreditsForm.updateForm(this.rdCreditsForm, data);
  }

  setDate(date){
    let data = this._rdCreditsForm.getData(this.rdCreditsForm);
    data.date = date;
    this._rdCreditsForm.updateForm(this.rdCreditsForm, data);
  }

  getCircleColor() {
    let colors = ["2px solid #44B6E8", "2px solid #18457B", "2px solid #00B1A9", "2px solid #F06459", "2px solid #22B473","2px solid #384986","2px solid #4554A4 "];
    if (this.count < 7) {
      this.count++;
      return colors[this.count - 1];
    } else {
      this.count = 0;
      return colors[this.count];
    }

  };

  updateCredits(credits) {
    for(var i in credits){
      credits[i]["color"] = this.getCircleColor();
    }
  }

  showCreateCredit() {
    this.titleService.setPageTitle("R&D Credit");
    this.editMode = false;
    this.rdCreditsForm = this._fb.group(this._rdCreditsForm.getForm());
    this.newForm1();
    this.setDate(this.defaultDate);
    this.showFlyout = true;
  }

  active1:boolean=true;
  newForm1(){
    this.active1 = false;
    setTimeout(()=> this.active1=true, 0);
  }

  showCreditForEdit(credits) {
    this.titleService.setPageTitle("R&D CREDIT");
    this.editMode = true;
    this.row = credits;
    this.rdCreditsService.getCredit(credits.id, this.companyId)
      .subscribe(credit => {
        this.row = credit;
        this.loadingService.triggerLoadingEvent(false);
        this.row.date = this.dateFormater.formatDate(this.row.date, this.serviceDateformat, this.dateFormat);
        let coa = _.find(this.chartOfAccounts, {'id': credit.coaId});
        let base = this;
        setTimeout(function(){
          base.coaComboBox.setValue(coa, 'name');
        },0);
        this._rdCreditsForm.updateForm(this.rdCreditsForm, this.row);
      }, error => this.handleError(error));
    this.showFlyout = true;
  }

  serviceCallForCredits(){
    this.rdCreditsService.credits(this.companyId)
      .subscribe(credits  => {
        this.rdCredits = credits;
        this.updateCredits(this.rdCredits);
        this.loadingService.triggerLoadingEvent(false);
      }, error =>  this.handleError(error));
  }

  deleteCredit(credits){
    this.loadingService.triggerLoadingEvent(true);
    this.rdCreditsService.removeCredit(credits, this.companyId)
      .subscribe(success  => {
        this._toastService.pop(TOAST_TYPE.success, "Credit Deleted Successfully");
        this.serviceCallForCredits();
      }, error =>  this.handleError(error));
  }

  submit($event) {
    $event && $event.preventDefault();
    var data = this._rdCreditsForm.getData(this.rdCreditsForm);
    this.companyId = Session.getCurrentCompany();
    data.date = this.dateFormater.formatDate(data.date, this.dateFormat, this.serviceDateformat);
    data.id = this.companyId;
    this.loadingService.triggerLoadingEvent(true);
    if(this.editMode) {
      data.id=this.row.id;
      this.rdCreditsService.updateCredit(data, this.companyId)
        .subscribe(success  => {
          this.loadingService.triggerLoadingEvent(false);
          this.showMessage(true, success);
        }, error =>  this.showMessage(false, error));
      this.showFlyout = false;

    } else {
      this.rdCreditsService.addCredits(data, this.companyId)
        .subscribe(success  => {
          this.showFlyout = false;
          this.loadingService.triggerLoadingEvent(false);
          this.showMessage(true, success);
        }, error =>  this.showMessage(false, error));
    }

  }

  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      if(this.editMode) {
        this.serviceCallForCredits();
        this.newForm1();
        this._toastService.pop(TOAST_TYPE.success, "Credit Updated Successfully.");
      } else {
        this.newForm1();
        this.serviceCallForCredits();
        this._toastService.pop(TOAST_TYPE.success, "Credit Created Successfully.");
      }
      this.newCustomer();
    } else {
      this.status = {};
      this.status['error'] = true;
      this._toastService.pop(TOAST_TYPE.error, "Failed To Update The Credit");
      this.message = obj;
      this.loadingService.triggerLoadingEvent(false);
    }
  }

  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;

  newCustomer() {
    this.active = false;
    setTimeout(()=> this.active=true, 0);
  }

  handleError(error) {
    this.loadingService.triggerLoadingEvent(false);
    this._toastService.pop(TOAST_TYPE.error, "Failed To Perform Operation");
  }

  hideFlyout(){
    this.titleService.setPageTitle("R&D Credits");
    this.row = {};
    this.showFlyout = false;
  }

  generateYears(){
    let base = this;
    let min = moment(new Date(),this.dateFormat).year();
    let max = min + 9;
    for (let i = min; i<=max; i++){
      let option = {value:'',name:''};
      option.value = i;
      option.name = i;
      base.years.push(option);
    }
  }

}
