
import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class DepositsForm extends abstractForm{

    getForm() {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);
        return {
            "title": ['', Validators.required],
            "amount": [''],
            "date": [''],
            "bank_account_id": [''],
            "notes": [''],
            "id": ['']
        }
    }
}

@Injectable()
export class DepositsLineForm extends abstractForm{

    getForm(model?:any) {
        return {
            amount: [model? model.amount: 0],
            title: [model? model.title: ''],
            chart_of_account_id: [model? model.chart_of_account_id: ''],
            customer_id: [model? model.customer_id: ''],
            date: [model? model.date: ''],
            id: [model? model.id: null],
            invoice_id: [model? model.invoice_id: ''],
            notes: [model? model.notes: ''],
            "destroy": [model? model.destroy: false],
            "dimensions": [model? model.dimensions: []]
        };
    }

}
