/**
 * Created by seshu on 19-07-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "./abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class VendorForm extends abstractForm{

  getForm() {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "name": ['', Validators.required],
      "ein": ['', Validators.required],
      "accountNumber": [''],
      "email": ['', Validators.compose(numberValidator)],
      "address": ['', Validators.required],
      "routingNumber": [''],
      "creditCardNumber": [''],
      "phoneNumber": ['', Validators.compose(numberValidator)],
      "country": ['', Validators.required],
      "state": ['', Validators.required],
      "city": ['',Validators.required],
      "zipcode": [''],
      "has1099":[''],
      "paymentMethod":['']
    }
  }
}
