/**
 * Created by venkatkollikonda on 23/02/17.
 */

import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class EmployeesForm extends abstractForm{

    getForm() {
        return {
            "customer_name": ['', Validators.required],
            "customer_ein": ['', Validators.required],
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