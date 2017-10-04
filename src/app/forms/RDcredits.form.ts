/**
 * Created by Nagaraju Thota on 26/09/17.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class RDcreditsForm extends abstractForm{

  getForm() {
    return {
      "id": [''],
      "name": ['', Validators.required],
      "description": [''],
      "amount": ['', Validators.required],
      "year": ['', Validators.required],
      "date": ['', Validators.required],
      "creditType": ["Acquired"],
      "coaId": ['', Validators.required]
    };
  }
}
