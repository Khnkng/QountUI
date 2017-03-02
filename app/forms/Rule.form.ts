/**
 * Created by Chandu on 28-09-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class RuleForm extends abstractForm{
    getForm() {
        return {
            "sourceType": ['Expense', Validators.required],
            "source":['', Validators.required],
            "attributeName": [''],
            "vendorValue":[''],
            "vendorType":[''],
            "sourceType":[''],
            "customerValue":[''],
            "customerType":[''],
            "comparisionType": ['', Validators.required],
            "comparisionValue": ['', Validators.required],
            "logicalOperator":[''],
            "effectiveDate": [''],
            "endDate":[''],
            "attributeName1": [''],
            "chartOfAccount":[''],
            "comparisionType1": ['', Validators.required],
            "comparisionValue1": ['', Validators.required]

        }
    }
}

@Injectable()
export class RuleActionForm extends abstractForm{
    getForm(model?:any) {
        return {
            action: [model? model.action: ''],
            actionValue: [model? model.actionValue: ''],
            id:[model? model.id: '', Validators.required]
        };
    }
}

