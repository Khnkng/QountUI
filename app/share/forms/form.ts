/**
 * Created by seshu on 09-03-2016.
 */

import {FormGroup} from "@angular/forms";

export interface form {
  getData(group:FormGroup): any;
  getForm(model?:any): {[key: string]: any;}, extra?: {[key: string]: any;}
  updateForm(_form:FormGroup, obj:any)
}
