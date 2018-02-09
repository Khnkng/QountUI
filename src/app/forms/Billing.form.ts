/**
 * Created by venkatkollikonda on 23/02/17.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class BillingForm extends abstractForm {

  getCreditForm() {
    return {
      "card_number": ['', Validators.required],
      "card_exp_month": ['', Validators.required],
      "card_exp_year": ['', Validators.required],
      "card_owner_name": ['', Validators.required],
      "csc": ['', Validators.required],
    };
  }

  getBankForm() {
    return {
      "bank_account_holder_first_name": ['', Validators.required],
      "bank_account_holder_last_name": ['', Validators.required],
      "bank_account_type": ['', Validators.required],
      "bank_account_number": ['', Validators.required],
      "bank_routing_number": ['', Validators.required],
    };
  }
}
