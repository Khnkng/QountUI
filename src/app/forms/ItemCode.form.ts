/**
 * Created by Chandu on 28-09-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class ItemCodeForm extends abstractForm{

  getForm(model?:any) {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "name": [model?model.name:'', Validators.required],
      "payment_coa_mapping": [model?model.payment_coa_mapping:''],
      "invoice_coa_mapping": [model?model.invoice_coa_mapping:''],
      "purchase_price": [model?model.purchase_price:''],
      "sales_price": [model?model.sales_price:''],
      "desc": [model?model.desc:''],
      "is_service":[model?model.is_service:false],
      "deferredRevenue":[model?model.deferredRevenue:false]
    }
  }

}
