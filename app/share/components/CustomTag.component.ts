/**
 * Created by yvadugu.
 */

import {Component, ElementRef, Input} from "@angular/core";
import {FormGroup} from "@angular/forms";

declare var _:any;

/*export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CustomTagComponent),
  multi: true
};*/

@Component({
  selector: 'custom-tag',
  templateUrl: '/app/views/customTag.html'
})

export class CustomTagComponent {
  @Input() inputType: string;
  @Input('_list') _list: any;
  @Input('placeholder') placeholder: any;
  @Input('height') height: string;

  @Input('group')
  public group: FormGroup;

  @Input('controlName')
  public controlName: string;


  //propagateChange:any = (_: any) => {};

  constructor(private elementRef: ElementRef) {
    if(this.inputType === ""){
      this.inputType = 'text';
    }
    this.height  = "125px";

  }


  validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return (re.test(email));
  }

  ngAfterViewInit() {

  }

  writeValue(value) {
    if (value) {
      this._list = value;
    }
  }

  /*registerOnChange(fn) {
    this.propagateChange = fn;
  }*/

  registerOnTouched() {}

  addItem(event){
    event.preventDefault();
    event.stopPropagation();
    if((this.inputType !='email')||(this.inputType =='email' && this.validateEmail(event.target.value))){
      /*this will help Pipe on this array to be immutable*/
      if(this._list && this._list.length > 0) {
       this._list = [event.target.value, ...this._list];
      } else {
        this._list = [event.target.value];
      }
      //this.propagateChange(this._list);
      event.target.value = "";
      this.group.controls[this.controlName].patchValue(this._list);
    }
    else{
      console.log("Please check Email format");
    }
    return false;
  }

  removeItem(index){
    this._list.splice(index,1);
    this.group.controls[this.controlName].patchValue(this._list);
    //this.propagateChange(this._list);
  }
}
