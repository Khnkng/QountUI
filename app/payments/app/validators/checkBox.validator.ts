/**
 * Created by seshu on 06-08-2016.
 */

import {FormControl} from '@angular/forms';

export class CheckBoxValidator {
  static hasChecked(c: FormControl):boolean {
    console.log("valid", c.value === true);
    return c.value === true;
  }
}


