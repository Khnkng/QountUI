/**
 * Created by seshu on 25-07-2016.
 */

import {Injectable} from "@angular/core";
import {Validators} from "@angular/forms";
import {abstractForm} from "qCommon/app/forms/abstractForm";

@Injectable()
export class BillForm extends abstractForm{

  getForm() {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "name": ['', Validators.required],
      "vendorID": [''],
      "amount": [0, Validators.required],
      "companyID": [''],
      "elibleFor1099": [''],
      "id": [''],
      "link": [''],
      "userID": [''],
      "currentUsers": [''],
      "poNumber": ['', Validators.required],
      "accountNumber": [''],
      "notes": [''],
      "lineAmount": [''],
      "lineDescription": [''],
      "quantity": [''],
      "unitPrice":[''],
      "dueDate": ['', Validators.required],
      "term": ['', Validators.required],
      "billDate": ['', Validators.required],
      "endDate": [''],
      "recurring": ['', Validators.required],
      "itemCode":[''],
      "expenseCode":[''],
      "currency":[''],
      "billID":[''],
      "has1099":[''],
      "tags":[[]],
      "_1099Amount":[0],
      "vendorName":['', Validators.required],
      "hasPaidApplied":[false],
      "vendorPaymentMethod":['']
    }
  }

}
