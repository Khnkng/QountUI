/**
 * Created by seshu on 18-07-2016.
 */
import {Injectable} from "@angular/core";
import {abstractForm} from "./abstractForm";
import {Validators} from "@angular/forms";



@Injectable()
export class CompanyForm extends abstractForm{

  getForm() {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "name": ['', Validators.required],
      "einNumber": ['', Validators.required],
      "address": ['', Validators.required],
      "country": [''],
      "state": [''],
      "city": [''],
      "zipCode": [''],
      "phoneNumber": [''],
      "accountNumber": [''],
      "routingNumber": [''],
      "creditCardNumber": [''],
      //"user": [''],
      "invitedUserEmails": [[]],
      "bankName":[''],
      "cardHolderName":[''],
      "accountHolderName":[''],
      "type":[''],
      "paymentType":[''],
      "month":[''],
      "year":[''],
      "cvv":[''],
      "expiryDate":[''],
      "nickName":[''],
      "creditCardHolderName":[''],
      "itemCodes":[[]],
      "expenseCodes":[[]],
      "defaultCurrency":['',Validators.required]
    }
  }
}
