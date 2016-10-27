import {Directive, ElementRef, EventEmitter, Output, Input} from "@angular/core";

declare var jQuery:any;
@Directive({
  selector: '[custom-tags]'
})

export class CustomTags {

  list: Array<string> = [];

  @Output() valueChanged = new EventEmitter<any>();

  @Input()
  set tagsList(tagsList:Array<string>) {
    this.list = tagsList;
  }

  constructor(private el:ElementRef) {
  }

  ngAfterViewInit() {
    console.log("TAGS VIEW");
    var base=this;
    var elem = jQuery(this.el.nativeElement)[0];
    jQuery(elem).tagit({
      onchange: onChange,
    });
    if(this.list) {
        this.list.forEach(function(tag){
        jQuery(elem).tagit("createTag", tag);
      });
    }

    var onChange = function(value) {
      debugger;
      /*jQuery(base.el.nativeElement).val(value);
      let index = jQuery(base.el.nativeElement).prop('selectedIndex');
      if(index != -1) {
        base.valueChanged.emit(<any> base.list[index]);
      } else {
        base.valueChanged.emit(<any> value);
      }*/
    }

  }
}
