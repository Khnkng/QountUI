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
            /*"email_ids": [['']],
            "customer_address":[''],*/
            "coa":[''],
            "customer_city":['', Validators.required],
            "customer_state":['', Validators.required],
            "customer_zipcode":['', Validators.required],
            "phone_number":['', Validators.required],
            "term":[''],
            "street_1":['',Validators.required],
            "street_2":[''],
            "fax":['']
        }
    }
}


@Injectable()
export class ContactLineForm extends abstractForm{
    getForm(item?) {
        return {
            "first_name": [item? item.first_name: ''],
            "last_name": [item? item.last_name: ''],
            "mobile": [item? item.mobile: ''],
            "email": [item? item.email: ''],
            "id": [item? item.id: null],
            "other": [item? item.other: ""]
        }
    }
}
