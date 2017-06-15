/**
 * Created by seshu on 10-03-2016.
 */

import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Injectable} from "@angular/core";
import {Validators} from "@angular/forms";

@Injectable()
export class ForgotPassword extends abstractForm{

  getForm() {
    var emailValidators = [];
    emailValidators.push(Validators.pattern);
    emailValidators.push(Validators.required);
    return {
      "id": ['', Validators.compose(emailValidators)]
    }
  }

}
