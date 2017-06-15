/**
 * Created by venkatkollikonda on 26/03/17.
 */
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Injectable} from "@angular/core";
import {Validators} from "@angular/forms";

@Injectable()
export class ReconcileForm extends abstractForm{

    getForm() {
        return {
            "date": ['', Validators.required],
            "bankAccountId": ['', Validators.required],
            "statementInflow":[''],
            "statementOutflow":[''],
            "statementEndingBalance":['',Validators.required]
        }
    }

}
