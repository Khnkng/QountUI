/**
 * Created by Chandu on 28-09-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class COAForm extends abstractForm{

  getForm() {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "name": ['', Validators.required],
      "type": [''],
      "subType": ['', Validators.required],
      "desc": [''],
      "subAccount": [false],
      "parentID": [''],
      "mapping": ['']
    }
  }

}
