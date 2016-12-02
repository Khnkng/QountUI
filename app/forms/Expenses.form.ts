/**
 * Created by Chandu on 28-09-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class ExpensesForm extends abstractForm{

  getForm() {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "name": ['', Validators.required],
      //"payment_coa_mapping": ['', Validators.required],
      //"invoice_coa_mapppping": ['', Validators.required],
      "coa_mapping_id": ['', Validators.required],
      "desc": ['']
    }
  }

}
