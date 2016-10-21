/**
 * Created by seshu on 05-03-2016.
 */

import {Directive, ElementRef, Input, OnChanges, SimpleChange} from '@angular/core';
declare var jQuery:any;
@Directive({
  selector: '[focus]'
})

export class Focus implements OnChanges{
  @Input('focus') status: boolean;
  constructor(private el: ElementRef) {

  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    let base = this;
    // Empty the changeLog whenever 'reset' property changes
    // hint: this is a way to respond programmatically to external value changes.
    if (changes['status']) {
      let prop = changes['status'];
      let cur = JSON.stringify(prop.currentValue);
      let prev = JSON.stringify(prop.previousValue);
      setTimeout(function(){
        if(cur) {
          base.el.nativeElement.focus();
        }
      }, 0);
    }
  }
}

