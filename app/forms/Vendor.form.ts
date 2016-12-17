/**
 * Created by seshu on 19-07-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class VendorForm extends abstractForm{

  getForm() {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "vendorType": ['', Validators.required],
      "name": ['', Validators.required],
      "ein": [''],
      "ssn": [''],
      "accountNumber": [''],
      "accountNumbers": [['']],
      "email": ['', Validators.compose(numberValidator)],
      "address": ['', Validators.required],
      "routingNumber": [''],
      "creditCardNumber": [''],
      "country": ['', Validators.required],
      "state": ['', Validators.required],
      "city": ['',Validators.required],
      "zipcode": [''],
      "has1099":[''],
      "paymentMethod":[''],
      "coa":['']
    }
  }
}
