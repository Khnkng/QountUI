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
      "starting_balance": [''],
      "starting_balance_date": [''],
      "bank_id": [''],
      "user_name": [''],
      "password": [''],
      "type":[1],
      "importType":['AUTO'],
      "chart_of_account_id": ['']
    }
  }
}