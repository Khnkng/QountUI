import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class PaymentsPlan extends abstractForm{

    getForm() {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);

        return {
            "id":[""],
            "name":["",Validators.required],
            "frequency":["",Validators.required],
            "day":[""],
            "week":[""],
            "month":[""],
            "quarter":[""],
            "ends_after":["",Validators.required],
            "amount":["",Validators.required]
        }
    }
}

