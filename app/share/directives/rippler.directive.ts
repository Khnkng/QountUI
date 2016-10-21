/**
 * Created by seshu on 05-03-2016.
 */

import {Directive, ElementRef} from '@angular/core';
declare var jQuery:any;
@Directive({
  selector: '[ripple]',
  host: {
    '(click)': 'onClick($event)'
  }
})

export class Ripple {
  constructor(private el: ElementRef) {
    //el.nativeElement.style.backgroundColor = 'yellow';
    el.nativeElement.classList.add('ripple-effect');
  }

  private onClick(e) {
    var rippler = jQuery(this.el.nativeElement);
    // create .ink element if it doesn't exist
    if(rippler.find(".ink").length == 0) {
      rippler.append("<span class='ink'></span>");
    }

    var ink = rippler.find(".ink");

    // prevent quick double clicks
    ink.removeClass("animate");

    // set .ink diametr

    var d = Math.max(rippler.outerWidth(), rippler.outerHeight());
    ink.css({height: d, width: d});


    // get click coordinates
    var x = e.pageX - rippler.offset().left - ink.width()/2;
    var y = e.pageY - rippler.offset().top - ink.height()/2;

    // set .ink position and add class .animate
    ink.css({
      top: y+'px',
      left:x+'px'
    }).addClass("animate");
  }
}
