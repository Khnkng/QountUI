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
            "customer_ein": [''],
            "customer_country": ['', Validators.required],
            "email_id": ['', Validators.required],
             "coa":['', Validators.required],
            "customer_address":['', Validators.required],
            "customer_city":['', Validators.required],
            "customer_state":['', Validators.required],
            "customer_zipcode":['', Validators.required],
            "phone_number":['', Validators.required]
        }
    }
}
