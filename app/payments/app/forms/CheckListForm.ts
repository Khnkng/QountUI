/**
 * Created by seshu on 06-08-2016.
 */

import {Injectable} from "@angular/core";
import {CheckBoxValidator} from "../validators/checkBox.validator";
import {abstractForm} from "qCommon/app/forms/abstractForm";

@Injectable()
export class CheckListForm extends abstractForm{

  getForm(model?:any) {
    return {
      item: [model ? model.item : ''],
      acknowledged: [model ? model.acknowledged : '',CheckBoxValidator.hasChecked]
    };
  }

}

@Injectable()
export class LineListForm extends abstractForm{

  getForm(model?:any) {
    return {
      number:[model ? model.number : 0],
      description:[model ? model.description : ''],
      unitPrice:[model ? model.unitPrice : 0],
      quantity:[model ? model.quantity : 0],
      amount:[model ? model.amount : 0],
      itemCode:[model ? model.itemCode : ''],
      expenseCode:[model ? model.expenseCode : ''],
      has1099:[model? model.has1099 : false],
      hasAsset: [model? model.hasAsset : false],
      _1099Mapping:[model ? model._1099Mapping : ''],
      tags:[model? model.tags : []]
    };
  }

}

