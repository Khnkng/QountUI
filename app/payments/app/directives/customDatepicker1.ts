import {Directive, ElementRef, EventEmitter, Output, Input} from "@angular/core";


declare var jQuery:any;
declare var Pikaday:any;
declare var moment:any;
@Directive({
  selector: '[customDatepicker1]'
})

export class CustomDatepicker1 {
dateFormat:any;
  @Output() valueChanged = new EventEmitter<any>();

  constructor(private el:ElementRef) {
  }


  @Input('customDatepicker1') fmt: string;

 /* @Input() set format(_format: string){
    this.fmt = _format;
  }*/

  ngAfterViewInit() {
    console.log("INIT VIEW");
    var base=this;
    var elem = jQuery(this.el.nativeElement)[0];
    var picker = new Pikaday({ field: elem, format:this.fmt?this.fmt:'MM/DD/YYYY',minDate: new Date(),
      onSelect: function(date) {
        var dt=picker.toString(base.fmt || '');
        elem.value = dt;
        base.valueChanged.emit(<any>dt);
      }
    });
  }
}
