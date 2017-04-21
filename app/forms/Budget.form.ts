import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class BudgetForm extends abstractForm{

    getForm(model?:any) {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);
        return {
            "name": [model ? model.name : '', Validators.required],
            "category": [model ? model.category : ''],
            "coa": [model ? model.coa : ''],
            "amount": [model ? model.amount : '',Validators.required],
            "frequency": [model ? model.frequency : '',Validators.required],
            "rollOver": [model ? model.rollOver : false],
            "description": [model ? model.description : ''],
            "startDate":[model ? model.startDate : ''],
            id: [model ? model.id : ''],
        }
    }

}
