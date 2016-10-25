/**
 * Created by seshu on 19-04-2016.
 */

import {Directive, ElementRef, EventEmitter, Output, Input} from "@angular/core";

declare var jQuery:any;
declare var _:any;
@Directive({
  selector: '[combo-box]',
  exportAs: 'comboBox'
})

export class ComboBox {
  constructor(private el:ElementRef) {
  }

  list: Array<any> = [];
  inputBox:any;

  @Output() valueChanged = new EventEmitter<string>();

  @Input()
  set listObject(_objectList:Array<any>) {
    this.list = _objectList;
  }

  clearValue() {
    jQuery(this.inputBox).val('');
  }

  setValue(value:any, prop:string) {
    if(value) {
      jQuery(this.inputBox).val(value[prop]);
      this.valueChanged.emit(<any> value);
    }
  }

  ngAfterViewInit() {
    var base = this;
    var elem = jQuery(this.el.nativeElement);
    var title = elem.attr('title');
    var placeholder = elem.attr('data-placeholder');
    var clearOnSelect = elem.attr('data-clear-onselect');
    var allowInvalid = elem.attr('data-allow-invalid');
    var onChange = function(value) {
      jQuery(base.el.nativeElement).val(value);
      let index = jQuery(base.el.nativeElement).prop('selectedIndex');
      if(index != -1) {
        base.valueChanged.emit(<any> base.list[index]);
      } else {
        base.valueChanged.emit(<any> value);
      }
    }
    elem.combobox(
      {
        allowInvalid:allowInvalid,
        title: title,
        placeholder: placeholder,
        clearOnSelect: clearOnSelect,
        onchange: onChange,
        inputBox: function(input) {
          base.inputBox = input;
        }
      }
    );
  }
}
