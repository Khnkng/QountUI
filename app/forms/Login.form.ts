/**
 * Created by seshu on 10-03-2016.
 */

import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Injectable} from "@angular/core";
import {Validators} from "@angular/forms";

@Injectable()
export class LoginForm extends abstractForm{

  getForm() {
    return {
      "id": ['', Validators.required],
      "password": ['', Validators.required]
    }
  }

}
