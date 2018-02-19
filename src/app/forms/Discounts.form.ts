import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class DiscountsForm extends abstractForm{

  getForm() {
    return {
      "name": ['', Validators.required],
      "description": [''],
      "type": ['', Validators.required],
      "id": [''],
    }
  }
}


@Injectable()
export class DiscountRangeForm extends abstractForm{
  getForm(item?) {
    return {
      "fromDay": [item? item.fromDay: 0],
      "toDay": [item? item.toDay: 0],
      "value": [item? item.value: 0],
      "id": [item? item.value: '']
    }
  }
}
