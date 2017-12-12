/**
 * Created by Mateen on 30-11-2017.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class LateFeeForm extends abstractForm{

  getForm(model?:any) {
    return {
      "name": [model?model.name:'', Validators.required],
      "description": [model?model.description:'', Validators.required],
      "type": [model?model.type:'', Validators.required],
      "value": [model?model.value:0, Validators.required],
      "coa":[model?model.coa:'', Validators.required]
    }
  }

}
