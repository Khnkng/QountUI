/**
 * Created by seshu on 21-07-2016.
 */

import {Directive, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChange, EventEmitter} from "@angular/core";

declare var FooTable:any;
declare var jQuery:any;
declare var _:any;

let eventNames:Array<string> = ['onRowClick', 'onAddRow', 'onDeleteRow', 'onEditRow', 'onMouseOver', 'onMouseOut', 'onRowAction'];

@Directive({
  selector: 'foo-table',
  exportAs: 'fooTable',
  properties: [
    'data',
    'options'
  ],
  events: eventNames
})

export class FTable implements OnInit, OnDestroy, OnChanges {

  inst:any;
  view:any;

  private data:any = {};
  private columns:Array<any>;
  private rows:Array<any>;
  private options:any = {};
  private hasInitialized:boolean;
  private table:any;
  private empty:string;
  private tableContainer:any;


  constructor(private element:ElementRef) {
    // fill events dynamically
    eventNames.forEach(eventName => {
      this[eventName] = new EventEmitter<any>();
    });
  }

  private renderTable() {
    this.columns = this.data.columns;
    this.rows = this.data.rows;
    let base = this;

    this.table = FooTable.init(this.tableContainer, {
      columns: base.columns,
      rows: base.rows,
      empty: base.data.empty,
      paging: {
        size: 20,
        limit: 5,
        position: "right"
      },
      editing: {
        addRow: function () {
          base.handleAddRow();
        },
        editRow: function (row) {
          base.handleEditRow(row);
        },
        deleteRow: function (row) {
          //if (confirm('Are you sure you want to delete the row?')) {
            var values = row.val();
          base.handleDeleteRow(row);
          if(base.rows.length!=1){
            row.delete();
          }
          //}
        },
        addText: base.options.addText ? base.options.addText : "Add Row",
        position: "right"
      }
    })
  }

  ngOnInit() {
    let base = this;
    let tblHtml = '<div><table class="table" data-paging="true" data-sorting="true"';
    if(this.options.pageSize){
      tblHtml += ' data-paging-size="'+this.options.pageSize+'"'
    }
    if(this.options.editable) {
      tblHtml += ' data-editing="true"'
    }
    if(this.options.search){
      tblHtml += ' data-filtering="true" '
    }
    tblHtml += "></table></div>";
    this.view = jQuery(tblHtml);
    jQuery(this.element.nativeElement).append(this.view);
    this.tableContainer = jQuery(this.element.nativeElement).find('.table')[0];
    this.renderTable();
    this.hasInitialized = true;
    if(!this.options.editable) {
      jQuery(this.tableContainer).on("click", "tbody tr", function(e){
        let row = jQuery(this).closest('tr').data('__FooTableRow__');
        base.handleOnClick(row.val());
      });

      jQuery(this.tableContainer).on("click", "tbody tr a", function(e){
        e.preventDefault();
        e.stopPropagation();
        let action = jQuery(this).data('action');
        let row = jQuery(this).closest('tr').data('__FooTableRow__');
        let obj = row.val();
        obj['action'] = action;
        if (action == 'delete') {
          //if(confirm('Are you sure you want to delete the row?')) {
          base.handleOnAction(obj);
          if(base.rows.length!=1){
            row.delete();
          }
          //}
        } else if(action == 'verify'){
          jQuery(this).hide();
        } else {
          base.handleOnAction(obj);
        }
      });

    }
  }

  handleOnClick(obj) {
    this['onRowClick'].next(obj);
  }

  handleOnAction(obj) {
    this['onRowAction'].next(obj);
  }

  handleMouseOver(obj) {
    this['onMouseOver'].next(obj);
  }

  handleMouseOut() {
    this['onMouseOut'].next({});
  }

  handleAddRow() {
    this['onAddRow'].next({});
  }

  handleDeleteRow(obj) {
    this['onDeleteRow'].next(obj);
  }

  handleEditRow(obj) {
    this['onEditRow'].next(obj);
  }

  updateRow(row, values) {
    if (row instanceof FooTable.Row){
      row.val(values);
    }
  }

  addRow(values) {
    this.table.rows.add(values);
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (this.hasInitialized && (changes['data'] || changes['options'])) {
      this.renderTable();
    }
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.remove();
    }
  }
}

