/**
 * Created by seshu on 21-07-2016.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var eventNames = ['onRowDoubleClick', 'onRowClick', 'onAddRow', 'onDeleteRow', 'onEditRow', 'onMouseOver', 'onMouseOut', 'onRowAction', 'onRowSelect'];
var FTable = (function () {
    function FTable(element) {
        var _this = this;
        this.element = element;
        this.data = {};
        this.options = {};
        // fill events dynamically
        eventNames.forEach(function (eventName) {
            _this[eventName] = new core_1.EventEmitter();
        });
    }
    FTable.prototype.renderTable = function () {
        this.columns = this.data.columns;
        this.rows = this.data.rows;
        var base = this;
        if (this.options.selectable) {
            this.rows.forEach(function (row) {
                row['selectCol'] = "<input type='checkbox' class='checkbox'/>";
            });
            if (this.columns[this.columns.length - 1].name != "selectCol") {
                var selCol = { "name": "selectCol", "title": "", "type": "html", "filterable": false };
                this.columns.push(selCol);
            }
        }
        if (this.options.singleSelectable) {
            this.rows.forEach(function (row) {
                row['selectCol'] = "<input type='radio' name='mapping' class='radio'/>";
            });
            if (this.columns[this.columns.length - 1].name != "selectCol") {
                var selCol = { "name": "selectCol", "title": "", "type": "html", "filterable": false };
                this.columns.push(selCol);
            }
        }
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
                    if (confirm('Are you sure you want to delete the row?')) {
                        var values = row.val();
                        base.handleDeleteRow(row);
                        // if(base.rows.length!=1){
                        //   row.delete();
                        // }alert
                    }
                },
                addText: base.options.addText ? base.options.addText : "Add Row",
                position: "right"
            }
        });
    };
    FTable.prototype.ngOnInit = function () {
        var base = this;
        var tblHtml = '<div><table class="table" data-filter-connectors="false" data-paging="true" data-sorting="true"';
        if (this.options.pageSize) {
            tblHtml += ' data-paging-size="' + this.options.pageSize + '"';
        }
        if (this.options.editable) {
            tblHtml += ' data-editing="true"';
        }
        if (this.options.search) {
            tblHtml += ' data-filtering="true" ';
        }
        tblHtml += "></table></div>";
        this.view = jQuery(tblHtml);
        jQuery(this.element.nativeElement).append(this.view);
        this.tableContainer = jQuery(this.element.nativeElement).find('.table')[0];
        this.renderTable();
        this.hasInitialized = true;
        if (!this.options.editable) {
            jQuery(this.tableContainer).on("click", "tbody tr", function (e) {
                var row = jQuery(this).closest('tr').data('__FooTableRow__');
                base.handleOnClick(row.val());
            });
            jQuery(this.tableContainer).on("dblclick", "tbody tr", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var row = jQuery(this).closest('tr').data('__FooTableRow__');
                base.handleOnDoubleClick(row.val());
            });
            jQuery(this.tableContainer).on("click", "tbody tr a", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var action = jQuery(this).data('action');
                var row = jQuery(this).closest('tr').data('__FooTableRow__');
                var obj = row.val();
                obj['action'] = action;
                if (action == 'delete') {
                    //if(confirm('Are you sure you want to delete the row?')) {
                    base.handleOnAction(obj);
                    // if(base.rows.length!=1){
                    //   row.delete();
                    // }
                    //}
                }
                else if (action == 'verify') {
                    jQuery(this).hide();
                }
                else {
                    base.handleOnAction(obj);
                }
            });
            /*jQuery(this.element.nativeElement).find('li a input').each(function(idx,cbx){
              if(idx !== 0){
                cbx.checked = false
              }
            });*/
            jQuery(this.tableContainer).on("click", "tbody tr input.checkbox", function (e) {
                var selectedRows = [];
                jQuery(base.tableContainer).find("tbody tr input.checkbox").each(function (idx, cbox) {
                    var row = jQuery(cbox).closest('tr').data('__FooTableRow__');
                    var obj = row.val();
                    if (jQuery(cbox).is(":checked")) {
                        obj.tempIsSelected = true;
                        selectedRows.push(obj);
                    }
                    else {
                        obj.tempIsSelected = false;
                    }
                });
                base.handleOnSelect(selectedRows);
            });
            jQuery(this.tableContainer).on("click", "thead tr input.global-checkbox", function (e) {
                jQuery(base.tableContainer).find("thead tr input.global-checkbox").each(function (idx, cbox) {
                    if (jQuery(cbox).is(":checked")) {
                        base.handleOnSelect(true);
                    }
                    else {
                        base.handleOnSelect(false);
                    }
                });
            });
            jQuery(this.tableContainer).on("click", "tbody tr input.radio", function (e) {
                var selectedRows = [];
                jQuery(base.tableContainer).find("tbody tr input.radio").each(function (idx, cbox) {
                    var row = jQuery(cbox).closest('tr').data('__FooTableRow__');
                    var obj = row.val();
                    if (jQuery(cbox).is(":checked")) {
                        selectedRows.push(obj);
                    }
                });
                base.handleOnSelect(selectedRows);
            });
        }
    };
    FTable.prototype.handleOnClick = function (obj) {
        this['onRowClick'].next(obj);
    };
    FTable.prototype.handleOnAction = function (obj) {
        this['onRowAction'].next(obj);
    };
    FTable.prototype.handleOnSelect = function (obj) {
        this['onRowSelect'].next(obj);
    };
    FTable.prototype.handleMouseOver = function (obj) {
        this['onMouseOver'].next(obj);
    };
    FTable.prototype.handleMouseOut = function () {
        this['onMouseOut'].next({});
    };
    FTable.prototype.handleAddRow = function () {
        this['onAddRow'].next({});
    };
    FTable.prototype.handleDeleteRow = function (obj) {
        this['onDeleteRow'].next(obj);
    };
    FTable.prototype.handleEditRow = function (obj) {
        this['onEditRow'].next(obj);
    };
    FTable.prototype.updateRow = function (row, values) {
        if (row instanceof FooTable.Row) {
            row.val(values);
        }
    };
    FTable.prototype.handleOnDoubleClick = function (obj) {
        this['onRowDoubleClick'].next(obj);
    };
    FTable.prototype.addRow = function (values) {
        this.table.rows.add(values);
    };
    FTable.prototype.ngOnChanges = function (changes) {
        if (this.hasInitialized && (changes['data'] || changes['options'])) {
            this.renderTable();
        }
    };
    FTable.prototype.ngOnDestroy = function () {
        if (this.view) {
            this.view.remove();
        }
    };
    return FTable;
}());
FTable = __decorate([
    core_1.Directive({
        selector: 'foo-table',
        exportAs: 'fooTable',
        inputs: ['data', 'options'],
        outputs: eventNames
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], FTable);
exports.FTable = FTable;
