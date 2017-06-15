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
            "id": [''],
            "first_name": ['', Validators.required],
            "last_name": ['', Validators.required],
            "ssn": ['', Validators.required],
            "email_id": ['', Validators.required],
            "phone_number":['', Validators.required],
            "dob":[''],
        }
    }
}