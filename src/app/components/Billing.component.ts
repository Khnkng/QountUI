
import {Component} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {BillingService} from "../services/Billing.service";
import {BillingForm} from "../forms/Billing.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {CustomersService} from "qCommon/app/services/Customers.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";

declare var jQuery: any;
declare var _: any;
declare const moment: any;

@Component({
  selector: 'billing',
  templateUrl: '../views/billing.html'
})

export class BillingComponent {
  status: any;
  dateFormat: string;
  serviceDateFormat: string;
  billForm: FormGroup;
  companyId: string;
  routeSubscribe: any;
  editMode:boolean = false;
  isCreditCard:boolean = true;
  years: Array<any> = [];
  publicKey: string;
  payment_spring_token: string;
  last4: string;
  savedCardData: {};
  hasData:boolean = false;
  companyCurrency:string;


  constructor(private _fb: FormBuilder, private billingService: BillingService,
              private billingForm: BillingForm, private _router: Router, private _toastService: ToastService,
              private switchBoard: SwitchBoard, private loadingService: LoadingService, private titleService: pageTitleService,
              private dateFormater: DateFormater, private customersService: CustomersService, private numeralService: NumeralService) {
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateFormat = dateFormater.getServiceDateformat();
    this.companyCurrency = Session.getCurrentCompanyCurrency();
    this.billForm = this._fb.group(this.billingForm.getCreditForm());
    this.titleService.setPageTitle("Billing");
    const default_company = Session.getUser().default_company;
    this.companyId = Session.getCurrentCompany();
    this.generateYears();
    this.getCardDetails();

    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      this.toolsRedirect();
    });
  }

  submit($event) {
    this.getToken();
  };

  toolsRedirect() {
    let link = ['tools'];
    this._router.navigate(link);
  }

  changePaymentType(type) {
    if (type === 'credit') {
      this.isCreditCard = true;
      this.billForm = this._fb.group(this.billingForm.getCreditForm());
    } else {
      this.billForm = this._fb.group(this.billingForm.getBankForm());
      this.isCreditCard = false;
    }
  }

  generateYears() {
    const base = this;
    const min = moment(new Date(), this.dateFormat).year();
    const max = min + 9;
    for (let i = min; i <= max; i++) {
      const option = {value: '', name: ''};
      option.value = i;
      option.name = i;
      base.years.push(option);
    }
  }

  getToken() {
    this.loadingService.triggerLoadingEvent(true);
    this.customersService.getPaymentSpringKeys()
      .subscribe(res  => {
        if(!_.isEmpty(res)) {
          this.publicKey = res.public_key;
          this.getCardTokenDetails();
        }else {
          this.loadingService.triggerLoadingEvent(false);
          this._toastService.pop(TOAST_TYPE.error, "Add Company To Payment Spring");
        }
      }, error =>  this.handleError(error));
  }

  getCardTokenDetails() {
    const data = this.billForm.value;
    if (!this.isCreditCard) {
      data['token_type'] = 'bank_account';
    }
    this.customersService.getCreditCardToken(data, this.publicKey)
      .subscribe(res  => {
        this.payment_spring_token = res.id;
        if (this.savedCardData['last_four']) {
          this.updateTokenSubscription(res);
        }else {
          this.tokenSubscription(res);
        }
      }, error =>  {
        const err = JSON.parse(error);
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.error, err.errors[0].message);
      });
  }

  tokenSubscription(res) {
    const obj = {
      "amount": this.savedCardData['amount'],
      "frequency": this.savedCardData['frequency'],
      "token": res.id,
      "charge_bank_account":res.token_type && res.token_type==="bank_account"
    };
    this.customersService.chargeToken(obj)
      .subscribe(res  => {
        this.savedCardData = res;
        this.last4 = res.last_four;
        if (this.last4) {
          this.editMode = true;
        }else {
          this.editMode = false;
        }
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.success, "Transaction Successful");
      }, error =>  {
        const err = JSON.parse(error);
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.error, err.errors[0].message);
      });
  }



  updateTokenSubscription(res) {
    const obj = {
      "payment_method": this.isCreditCard ? 'credit_card' : 'bank_account',
      "token": res.id
    };
    this.customersService.updateChargeToken(obj)
      .subscribe(res  => {
        this.savedCardData = res;
        this.last4 = res.last_four;
        if (this.last4) {
          this.editMode = true;
        }else {
          this.editMode = false;
        }
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.success, "Transaction Successful");
      }, error =>  {
        const err = JSON.parse(error);
        this.loadingService.triggerLoadingEvent(false);
        this._toastService.pop(TOAST_TYPE.error, err.errors[0].message);
      });
  }

  getCardDetails() {
    this.loadingService.triggerLoadingEvent(true);
    this.customersService.getBillingSavedCardDetails(this.companyId)
      .subscribe(res  => {
        this.loadingService.triggerLoadingEvent(false);
        if (res) {
          this.savedCardData = res;
          this.hasData = true;
          this.last4 = res.last_four || res.bank_account_number_last_4;
          if (this.last4) {
            this.editMode = true;
          } else {
            this.editMode = false;
            this.isCreditCard = res.credit_card_enabled;
            if (!this.isCreditCard) {
              this.changePaymentType('bank');
            }
          }
        }
      }, error =>  this.handleError(error));
  }

  editAccountDetails() {
    this.editMode = false;
  }

  cancel() {
    if (this.savedCardData['last_four']) {
      this.editMode = true;
    }
  }

  formatAmount(value){
    return this.numeralService.format('$0,0.00', value);
  }

  getNextCharge(date) {
    return moment(date).format(this.dateFormat);
  }

  handleError(error) {
    this.loadingService.triggerLoadingEvent(false);
    this._toastService.pop(TOAST_TYPE.error, "Failed To Perform Operation");
  }


  ngOnDestroy() {
    this.routeSubscribe.unsubscribe();
  }
}
