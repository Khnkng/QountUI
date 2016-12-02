/**
 * Created by Chandu on 28-09-2016.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class CustomersForm extends abstractForm{

    getForm() {
        return {
            "customer_name": ['', Validators.required],
            "customer_ein": ['', Validators.required],
            "customer_address":[''],
            "customer_city":[''],
            "customer_country": [''],
            "customer_state": [''],
            "customer_zipcode": ['']

        }
    }
}
