/**
 * Created by seshu on 29-04-2016.
 */

import {Directive, ElementRef, AfterViewInit} from "@angular/core";


declare var jQuery:any;
@Directive({
  selector: '[foundation]'
})

export class FoundationInit implements AfterViewInit{
  constructor(private el:ElementRef) {
  }

  ngAfterViewInit() {
    setTimeout(() => jQuery(this.el.nativeElement).foundation(), 1000);
  }
}
