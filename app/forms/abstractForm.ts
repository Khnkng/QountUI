/**
 * Created by seshu on 09-03-2016.
 */

import {form} from "./form";
import {FormGroup} from "@angular/forms";

export class abstractForm implements form {

  getForm(model?:any):{} {
    return undefined;
  }

  getData(group):any {
    var data = {};
    for(var key in group.controls) {
      data[key] = group.controls[key].value;
    }
    return data;
  }

  updateForm(_form:FormGroup, obj?:any) {
    if(obj) {
      for(let key in obj) {
        let control:any = _form.controls[key];
        if(control && control.updateValue) {
         if(!(obj[key] instanceof  Array)) {
           control.updateValue(obj[key]);
         }
        }
      }
    } else {
      for(let key in _form.controls) {
        let control:any = _form.controls[key];
        if(control && control.updateValue) {
          if(!(obj[key] instanceof  Array)) {
            control.updateValue(null);
          }
        }
      }
    }
  }

}
