/**
 * Created by Chandu on 06-02-2017.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class ExpenseForm extends abstractForm{
    getForm() {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);
        return {
            "title": ['', Validators.required],
            "amount": ['', Validators.required],
            "is_paid": [false],
            "paid_date": [''],
            "due_date": [''],
            "bank_account_id": ['']
        }
    }
}

@Injectable()
export class ExpenseItemForm extends abstractForm{
    getForm() {
        return {
            "title": ['', Validators.required],
            "amount": ['', Validators.required],
            "notes": [''],
            "vendor_id": [''],
            "chart_of_account_id": ['']
        }
    }
}
