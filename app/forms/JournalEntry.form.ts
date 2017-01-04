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
      "type": ['Original'],
      "category": [''],
      "autoReverse": [false],
      "reversalDate": [''],
      "reversedFrom": [''],
      "recurring": [false],
      "nextJEDate": [''],
      "endDate": [''],
      "recurringFrequency": [''],
      "desc": [''],

      "newType": [],
      "newCoa": [],
      "newDimensions": [],
      "newEntryType": [],
      "newAmount": [],
      "newMemo": []
    }
  }
}

@Injectable()
export class JournalLineForm extends abstractForm{

  getForm(model?:any) {
    return {
      type: [model? model.type: ''],
      coa: [model? model.coa: ''],
      entryType: [model? model.entryType: ''],
      amount: [model? model.amount: 0],
      memo: [model? model.memo: ''],
      id: [model? model.id: null],
      dimensions: [model? model.dimensions: []]
    };
  }

}
