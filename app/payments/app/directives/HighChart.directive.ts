/**
 * Created by seshu on 09-11-2016.
 */

import {Directive,EventEmitter, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChange} from "@angular/core";

declare var Highcharts:any;
declare var jQuery:any;
declare var _:any;

let eventNames:Array<string> = ['onRowClick', 'onAddRow', 'onDeleteRow', 'onEditRow', 'onMouseOver', 'onMouseOut', 'onRowAction'];

@Directive({
  selector: 'high-chart',
  exportAs: 'highChart',
  inputs: [ 'options'],
  events: eventNames
})

export class HighChart implements OnInit, OnDestroy, OnChanges {

  view:any;

  private options:any;
  private chart:any;
  private hasInitialized:boolean;


  constructor(private element:ElementRef) {
    // fill events dynamically
    eventNames.forEach(eventName => {
      this[eventName] = new EventEmitter<any>();
    });
  }

  private renderChart() {
    let base = this;
    this.chart = Highcharts.chart(base.view[0], base.options);
  }

  ngOnInit() {
    let base = this;
    let tblHtml = '<div style="width:100%; height:400px;"></div>';
    this.view = jQuery(tblHtml);
    jQuery(this.element.nativeElement).append(this.view);
    this.renderChart();
    this.hasInitialized = true;
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (this.hasInitialized && (changes['options'])) {
      this.renderChart();
    }
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.remove();
    }
  }
}

