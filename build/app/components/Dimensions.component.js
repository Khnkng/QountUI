/**
 * Created by Chandu on 28-09-2016.
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
var forms_1 = require("@angular/forms");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var DimensionService_service_1 = require("qCommon/app/services/DimensionService.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Dimension_form_1 = require("../forms/Dimension.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var router_1 = require("@angular/router");
var DimensionsComponent = (function () {
    function DimensionsComponent(_fb, _dimensionForm, dimensionService, _router, loadingService, switchBoard, toastService, companiesService, titleService) {
        var _this = this;
        this._fb = _fb;
        this._dimensionForm = _dimensionForm;
        this.dimensionService = dimensionService;
        this._router = _router;
        this.loadingService = loadingService;
        this.switchBoard = switchBoard;
        this.toastService = toastService;
        this.companiesService = companiesService;
        this.titleService = titleService;
        this.dimensions = [];
        this.newFormActive = true;
        this.hasDimensions = false;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.showFlyout = false;
        this.values = [];
        this.tableColumns = ['name', 'id', 'values', 'desc'];
        this.titleService.setPageTitle("Dimensions");
        this.dimensionForm = this._fb.group(_dimensionForm.getForm());
        var companyId = Session_1.Session.getCurrentCompany();
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteDimensions(toast); });
        this.loadingService.triggerLoadingEvent(true);
        this.companiesService.companies().subscribe(function (companies) {
            _this.allCompanies = companies;
            if (companyId) {
                _this.currentCompany = _.find(_this.allCompanies, { id: companyId });
            }
            else if (_this.allCompanies.length > 0) {
                _this.currentCompany = _.find(_this.allCompanies, { id: _this.allCompanies[0].id });
            }
            _this.dimensionService.dimensions(_this.currentCompany.id)
                .subscribe(function (dimensions) {
                _this.buildTableData(dimensions);
            }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.showFlyout) {
                _this.hideFlyout();
            }
            else {
                _this.toolsRedirect();
            }
        });
    }
    DimensionsComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    DimensionsComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    DimensionsComponent.prototype.handleError = function (error) {
        this.row = {};
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    DimensionsComponent.prototype.showAddDimension = function () {
        this.titleService.setPageTitle("CREATE DIMENSION");
        this.editMode = false;
        this.dimensionForm = this._fb.group(this._dimensionForm.getForm());
        this.showFlyout = true;
        this.newForm();
        this.values = [];
        this.showFlyout = true;
    };
    DimensionsComponent.prototype.showEditDimension = function (row) {
        this.titleService.setPageTitle("UPDATE DIMENSION");
        var base = this;
        this.showFlyout = true;
        this.editMode = true;
        var tempValues = row.values.split(',');
        this.newForm();
        this.row = row;
        this.values = [];
        _.each(tempValues, function (value) {
            base.values.push({
                value: value,
                newValue: value,
                action: "",
                editing: false
            });
        });
        this._dimensionForm.updateForm(this.dimensionForm, row);
    };
    DimensionsComponent.prototype.editValue = function (valueObj) {
        valueObj.editing = !valueObj.editing;
    };
    DimensionsComponent.prototype.updateValue = function (valueObj) {
        valueObj.editing = !valueObj.editing;
        valueObj.action = 'update';
    };
    DimensionsComponent.prototype.deleteValue = function (valueObj) {
        valueObj.action = 'delete';
    };
    DimensionsComponent.prototype.deleteFromEditing = function (valueObj) {
        valueObj.editing = !valueObj.editing;
        valueObj.newValue = valueObj.value;
    };
    DimensionsComponent.prototype.onValueChange = function (valueObj, $event) {
        valueObj.newValue = $event.target.value;
    };
    DimensionsComponent.prototype.deleteDimensions = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.dimensionService.removeDimension(this.dimensionName, this.currentCompany.id)
            .subscribe(function (coa) {
            // this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Dimension deleted successfully");
            _this.dimensions.splice(_.findIndex(_this.dimensions, { name: _this.dimensionName }), 1);
            _this.buildTableData(_this.dimensions);
        }, function (error) { return _this.handleError(error); });
    };
    DimensionsComponent.prototype.removeDimension = function (row) {
        this.dimensionName = row.name;
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    DimensionsComponent.prototype.newForm = function () {
        var _this = this;
        this.newFormActive = false;
        setTimeout(function () { return _this.newFormActive = true; }, 0);
    };
    DimensionsComponent.prototype.ngOnInit = function () {
    };
    DimensionsComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditDimension($event);
        }
        else if (action == 'delete') {
            this.removeDimension($event);
        }
    };
    DimensionsComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Dimensions");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    };
    DimensionsComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        this.loadingService.triggerLoadingEvent(true);
        var data = this._dimensionForm.getData(this.dimensionForm);
        var values = jQuery('#dimensionValues').tagit("assignedTags");
        if (this.editMode) {
            _.each(values, function (value) {
                base.values.push({
                    value: value,
                    action: 'new',
                    newValue: value
                });
            });
            data.values = this.values;
        }
        else {
            if (values.length == 0) {
                this.loadingService.triggerLoadingEvent(false);
                this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Dimension should have atleast one value");
                return false;
            }
            else {
                data.values = values;
            }
        }
        if (this.editMode) {
            data.id = this.row.id;
            this.dimensionService.updateDimension(this.cleanData(data), this.currentCompany.id)
                .subscribe(function (dimension) {
                base.row = {};
                _this.showFlyout = false;
                // base.loadingService.triggerLoadingEvent(false);
                base.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Dimension updated successfully");
                var index = _.findIndex(base.dimensions, { name: dimension.name });
                base.dimensions[index] = dimension;
                base.buildTableData(base.dimensions);
            }, function (error) { return _this.handleError(error); });
        }
        else {
            this.dimensionService.addDimensions(data, this.currentCompany.id)
                .subscribe(function (newDimension) {
                // this.loadingService.triggerLoadingEvent(false);
                _this.showFlyout = false;
                _this.handleDimension(newDimension);
            }, function (error) { return _this.handleError(error); });
        }
        //this.buildTableData(this.dimensions);
    };
    DimensionsComponent.prototype.cleanData = function (data) {
        _.each(data.values, function (value) {
            delete value.editing;
        });
        return data;
    };
    DimensionsComponent.prototype.handleDimension = function (newDimension) {
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Dimension created successfully");
        this.dimensions.push(newDimension);
        this.buildTableData(this.dimensions);
    };
    DimensionsComponent.prototype.buildTableData = function (dimensions) {
        this.hasDimensions = false;
        this.dimensions = dimensions;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "values", "title": "Values" },
            { "name": "desc", "title": "Description" },
            { "name": "id", "title": "Id", "visible": false },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        dimensions.forEach(function (dimension) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                row[key] = dimension[key];
                if (key == 'id') {
                    row[key] = dimension['name'];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasDimensions = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    return DimensionsComponent;
}());
DimensionsComponent = __decorate([
    core_1.Component({
        selector: 'dimensions',
        templateUrl: '/app/views/dimensions.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, Dimension_form_1.DimensionForm, DimensionService_service_1.DimensionService, router_1.Router,
        LoadingService_1.LoadingService, SwitchBoard_1.SwitchBoard,
        Toast_service_1.ToastService, Companies_service_1.CompaniesService, PageTitle_1.pageTitleService])
], DimensionsComponent);
exports.DimensionsComponent = DimensionsComponent;
