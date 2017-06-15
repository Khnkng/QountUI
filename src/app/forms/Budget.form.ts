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
           /* "amount": [model ? model.amount : '',Validators.required],
            "frequency": [model ? model.frequency : '',Validators.required],*/
            "description": [model ? model.description : ''],
            id: [model ? model.id : ''],
        }
    }

}

@Injectable()
export class BudgetItemForm extends abstractForm{
    getForm(item?) {
        return {
            "coaID": [item? item.coaID: ''],
            "jan": [item? item.jan: ''],
            "feb": [item? item.feb: ''],
            "mar": [item? item.mar: ''],
            "apr": [item? item.apr: ''],
            "may": [item? item.may: ''],
            "jun": [item? item.jun: ''],
            "jul": [item? item.jul: ''],
            "aug": [item? item.aug: ''],
            "sep": [item? item.sep: ''],
            "oct": [item? item.oct: ''],
            "nov": [item? item.nov: ''],
            "dec": [item? item.dec: ''],
            "total": [item? item.total: '']
        }
    }
}
