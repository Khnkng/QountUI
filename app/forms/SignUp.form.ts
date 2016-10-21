/**
 * Created by seshu on 06-03-2016.
 */

import {Validators} from "@angular/common";
import {Injectable} from "@angular/core";
import {abstractForm} from "./abstractForm";

@Injectable()
export class SignUpForm extends abstractForm{

  getForm() {
    var emailValidators = [];
    emailValidators.push(Validators.pattern);
    emailValidators.push(Validators.required);
    return {
      "firstName": ['', Validators.required],
      "lastName": ['', Validators.required],
      "phoneNumber": [''],
      "email": ['', Validators.compose(emailValidators)],
      "password": ['', Validators.required],
      "passwordConfirmation": ['', Validators.required],
      "firm": ['']
    }
  }

}
