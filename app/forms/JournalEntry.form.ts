/**
 * Created by Chandu on 28-09-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class JournalEntryForm extends abstractForm{

  getForm() {
    var numberValidator = [];
    numberValidator.push(Validators.pattern);
    numberValidator.push(Validators.required);
    return {
      "number": ['', Validators.required],
      "date": ['', Validators.required],
      "source": [''],
      "type": ['original'],
      "category": [''],
      "autoReverse": [false],
      "reversalDate": [''],
      "recurring": [false],
      "nextJEDate": [''],
      "recurringFrequency": [''],
      "desc": [''],

      "newType": [],
      "newCoa": [],
      "newAmount": [],
      "newMemo": [],
      "newTags": [[]]
    }
  }
}

@Injectable()
export class JournalLineForm extends abstractForm{

  getForm(model?:any) {
    return {
      type: [model? model.type: ''],
      coa: [model? model.coa: ''],
      amount: [model? model.amount: 0],
      memo: [model? model.memo: '']
    };
  }

}
