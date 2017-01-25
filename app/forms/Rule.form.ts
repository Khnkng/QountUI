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
            "attributeName": ['TITLE', Validators.required],
            "comparisionType": ['BEGINS_WITH', Validators.required],
            "comparisionValue": ['', Validators.required],
            "effectiveDate": ['']
        }
    }
}

@Injectable()
export class RuleActionForm extends abstractForm{
    getForm(model?:any) {
        return {
            action: [model? model.action: 'chartOfAccount'],
            actionValue: [model? model.actionValue: '', Validators.required],
            actions:[model ? model.actions:'']
        };
    }
}

