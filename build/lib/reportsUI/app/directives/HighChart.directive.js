/**
 * Created by seshu on 09-11-2016.
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
var eventNames = ['onRowClick', 'onAddRow', 'onDeleteRow', 'onEditRow', 'onMouseOver', 'onMouseOut', 'onRowAction'];
var HighChart = (function () {
    function HighChart(element) {
        var _this = this;
        this.element = element;
        // fill events dynamically
        eventNames.forEach(function (eventName) {
            _this[eventName] = new core_1.EventEmitter();
        });
    }
    HighChart.prototype.renderChart = function () {
        var base = this;
        var parent = jQuery(this.element.nativeElement).parent();
        var width = parent.width();
        var height = parent.height();
        console.log(height);
        height = height < 400 ? height : height;
        base.options.chart.width = width;
        base.options.chart.height = height;
        base.options.chart.padding = 10;
        this.chart = Highcharts.chart(base.view[0], base.options);
    };
    HighChart.prototype.redraw = function () {
        var parent = jQuery(this.element.nativeElement).parent();
        var width = parent.width();
        var height = parent.height();
        height = height < 400 ? height : height;
        this.chart.setSize(width, height);
    };
    HighChart.prototype.ngOnInit = function () {
        var base = this;
        var tblHtml = '<div class="chartArea"></div>';
        this.view = jQuery(tblHtml);
        jQuery(this.element.nativeElement).append(this.view);
        this.renderChart();
        this.hasInitialized = true;
    };
    HighChart.prototype.ngOnChanges = function (changes) {
        if (this.hasInitialized && (changes['options'])) {
            this.renderChart();
        }
    };
    HighChart.prototype.ngOnDestroy = function () {
        if (this.view) {
            this.view.remove();
        }
    };
    return HighChart;
}());
HighChart = __decorate([
    core_1.Directive({
        selector: 'high-chart',
        exportAs: 'highChart',
        inputs: ['options'],
        outputs: eventNames
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], HighChart);
exports.HighChart = HighChart;
