/**
 * Created by Nazia on 13-03-2017.
 */
import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";
@Injectable()
export class LockForm extends abstractForm{

    getLock() {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);

        return {
            "lock_date": [''],
            "key":[''],
            "created_at":[''],
            "created_by":[''],
            "shared_with":['']
        }
    }
}
