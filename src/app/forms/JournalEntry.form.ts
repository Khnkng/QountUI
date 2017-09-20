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
      "source": ['Manual'],
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
      "jeType": ['Other'],

      "newType": [],
      "newTitle": [],
      "newCoa": [],
      "newDimensions": [],
      "newEntryType": [],
      "newAmount": [],
      "newMemo": [],
      "basis":['Accrual']
    }
  }
}

@Injectable()
export class JournalLineForm extends abstractForm{

  getForm(model?:any) {
    return {
      type: [model? model.type: ''],
      title: [model? model.title: ''],
      coa: [model? model.coa: ''],
      entryType: [model? model.entryType: ''],
      amount: [model? model.amount: 0],
      creditAmount: [model? model.creditAmount: 0],
      debitAmount: [model? model.debitAmount: 0],
      notes: [model? model.notes: ''],
      entity: [model? model.entity: ''],
      destroy: [model? model.destroy: false],
      id: [model? model.id: null],
      dimensions: [model? model.dimensions: []],
      entityType: [model? model.entityType: ''],
    };
  }

}
