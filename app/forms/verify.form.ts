/**
 * Created by Nazia on 28-03-2017.
 */
import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";
@Injectable()
export class VerifyForm extends abstractForm{

    getVerified() {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);

        return {
            "Amount1": [''],
            "Amount2":['']
        }
    }
}