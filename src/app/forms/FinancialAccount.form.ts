/**
 * Created by Chandu on 28-09-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class FinancialAccountForm extends abstractForm{

  getForm() {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "name": ['', Validators.required],
      "starting_balance": ['', Validators.required],
      "starting_balance_date": ['', Validators.required],
      "user_name": [''],
      "id": [''],
      "password": [''],
      "account_holder_type":['company',Validators.required],
      "type":['', Validators.required],
      "importType":['MANUAL'],
      "chart_of_account_id": [''],
      "account_number":[''],
      "routing_number":[''],
      "name_on_account":['',Validators.required],
      "transit_chart_of_account_id":[''],
      "showPaymentInfo":[false]
    }
  }
}