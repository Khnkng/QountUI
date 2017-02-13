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
            "tin": ['',Validators.required],
            // "taxAuthorityName": ['',Validators.required],
            // "taxAuthorityId":['',Validators.required],
            "taxLiabilityCoa":['',Validators.required],
            "description":['',Validators.required],
            "taxRate":['',Validators.required],
            "compoundTax":['',],
            "recoverableTax":[''],
            "visibleOnInvoices":['']
        }
    }
}
