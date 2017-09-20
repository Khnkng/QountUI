/**
 * Created by venkatkollikonda on 07/08/17.
 */
import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class MetricsForm extends abstractForm{

    getForm() {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);
        return {
            "name": ['', Validators.required],
            "type": [''],
            "subType": ['', Validators.required],
            "description": [''],
            "subAccount": [false],
            "parentID": [''],
            "id": [],
            "level": [0]
        }
    }

}

@Injectable()
export class metricPeriodForm extends abstractForm{

    getForm() {
        var numberValidator = [];
        numberValidator.push(Validators.pattern);
        numberValidator.push(Validators.required);
        return {
            "year": ['', Validators.required],
            "month": ['', Validators.required],
        }
    }
}


@Injectable()
export class MetricsLineForm extends abstractForm{

    getForm(model?:any) {
        return {
            metricID: [model? model.metricID: ''],
            value: [model? model.value: 0],
            description: [model? model.description: ''],
            destroy: [model? model.destroy: false],
            id: [model? model.id: null],
        };
    }

}
