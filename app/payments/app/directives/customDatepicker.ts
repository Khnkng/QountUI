import {Directive, ElementRef, EventEmitter, Output, Input} from "@angular/core";


declare var jQuery:any;
declare var Pikaday:any;
declare var moment:any;
@Directive({
  selector: '[custom-datepicker]'
})

export class CustomDatepicker {
dateFormat:any;
  fmt:string;
  minDate:any = new Date();
  @Output() valueChanged = new EventEmitter<any>();

  constructor(private el:ElementRef) {
  }

  @Input() set format(_format: string){
    this.fmt = _format;
  }

  @Input() set mindate(_mindate: string){
    if(_mindate == 'past'){
      this.minDate = null;
    } else if(moment(_mindate, "MM/DD/YYYY", true).isValid()){
      this.minDate = new Date(_mindate);
    }
  }

  ngAfterViewInit() {
    var base=this;
    var elem = jQuery(this.el.nativeElement)[0];
    var picker = new Pikaday({ field: elem, format:this.fmt?this.fmt:'MM/DD/YYYY',minDate: this.minDate,
      onSelect: function(date) {
        var dt=picker.toString(base.fmt || '');
        elem.value = dt;
        base.valueChanged.emit(<any>dt);
      }
    });
  }
}
