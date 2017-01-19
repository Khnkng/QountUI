/**
 * Created by Nazia on 19-01-2017.
 */
import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";
@Injectable()
export class TaxesForm extends abstractForm{

    getTax() {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);

        return {
            "name": ['', Validators.required],
            "tin": [''],
            "taxAuthorityName": [''],
            "taxAuthorityId":[''],
            "taxLiabilityCoa":[''],
            "description":[''],
            "taxRate":[''],
            "compoundTax":[''],
            "recoverableTax":[''],
            "visibleOnInvoices":['']
        }
    }
}
