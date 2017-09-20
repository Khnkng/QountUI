/**
 * Created by seshu on 26-02-2016.
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
var Session_1 = require("qCommon/app/services/Session");
var JournalEntry_form_1 = require("../forms/JournalEntry.form");
var forms_1 = require("@angular/forms");
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var JournalEntries_service_1 = require("qCommon/app/services/JournalEntries.service");
var Employees_service_1 = require("qCommon/app/services/Employees.service");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var DimensionService_service_1 = require("qCommon/app/services/DimensionService.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var router_1 = require("@angular/router");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var JournalEntryComponent = (function () {
    function JournalEntryComponent(_jeForm, _fb, coaService, _lineListForm, journalService, toastService, _router, _route, companiesService, dimensionService, loadingService, employeeService, customerService, dateFormater, stateService, titleService, _switchBoard) {
        var _this = this;
        this._jeForm = _jeForm;
        this._fb = _fb;
        this.coaService = coaService;
        this._lineListForm = _lineListForm;
        this.journalService = journalService;
        this.toastService = toastService;
        this._router = _router;
        this._route = _route;
        this.companiesService = companiesService;
        this.dimensionService = dimensionService;
        this.loadingService = loadingService;
        this.employeeService = employeeService;
        this.customerService = customerService;
        this.dateFormater = dateFormater;
        this.stateService = stateService;
        this.titleService = titleService;
        this.active = true;
        this.lineActive = true;
        this.disableReversalDate = true;
        this.disableRecurring = true;
        this.disableReverseJournal = true;
        this.newTags = [];
        this.allCompanies = [];
        this.chartOfAccounts = [];
        this.vendors = [];
        this.employees = [];
        this.customers = [];
        this.allEntities = [];
        this.filteredChartOfAccounts = [];
        this.lines = [];
        this.newJournalEntry = true;
        this.existingJournals = [];
        this.isReverse = false;
        this.dimensions = [];
        this.selectedDimensions = [];
        this.newCOAActive = true;
        this.addNewLineFlag = false;
        this.isSystemCreatedJE = false;
        this.showAdvance = false;
        this.reversed = false;
        this.haveSourceId = false;
        this.stayFlyout = false;
        this.creditTotal = 0;
        this.debitTotal = 0;
        this.focusedIdx = -1;
        this.badgeText = "B";
        this.showBadge = false;
        this.titleService.setPageTitle("CREATE JOURNAL ENTRY");
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.companyId = Session_1.Session.getCurrentCompany();
        this.defaultDate = moment(new Date()).format(this.dateFormat);
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.journalID = params['journalID'];
            var tempReverse = params['reverse'];
            if (_this.journalID) {
                if (tempReverse) {
                    _this.isReverse = true;
                    _this.newJournalEntry = true;
                    _this.titleService.setPageTitle("CREATE JOURNAL ENTRY");
                }
                else {
                    _this.newJournalEntry = false;
                    _this.titleService.setPageTitle("UPDATE JOURNAL ENTRY");
                }
            }
        });
        this.companiesService.vendors(this.companyId).subscribe(function (vendors) {
            _.forEach(vendors, function (vendor) {
                vendor['entityType'] = "vendor";
            });
            _this.vendors = vendors;
        }, function (error) { return _this.handleError(error); });
        this.employeeService.employees(this.companyId).subscribe(function (employees) {
            _.forEach(employees, function (employee) {
                employee['entityType'] = "employee";
            });
            _this.employees = employees;
        }, function (error) { return _this.handleError(error); });
        this.customerService.customers(this.companyId).subscribe(function (customers) {
            _.forEach(customers, function (customer) {
                customer['id'] = customer.customer_id;
                customer['name'] = customer.customer_name;
                customer['entityType'] = "customer";
            });
            _this.customers = customers;
        }, function (error) { return _this.handleError(error); });
        this.routeSubscribe = _switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.dimensionFlyoutCSS == "expanded") {
                _this.hideFlyout();
            }
            else if (_this.showAdvance) {
                _this.showRecurringOpts();
            }
            else {
                _this.goToPreviousPage();
            }
        });
    }
    JournalEntryComponent.prototype.toggleReverseJournal = function (type, reversedFrom) {
        var base = this;
        if (type == 'Reversal') {
            this.disableReverseJournal = false;
            var journalEntry_1 = _.find(this.existingJournals, { 'id': reversedFrom });
            setTimeout(function () {
                base.reverseJournalComboBox.setValue(journalEntry_1, 'number');
            });
            if (this.journalEntry && this.journalEntry.id) {
                var index = _.findIndex(this.existingJournals, { 'id': this.journalEntry.id });
                this.existingJournals.splice(index, 1);
            }
        }
        else {
            this.disableReverseJournal = true;
        }
    };
    JournalEntryComponent.prototype.updateLineTotal = function () {
        var base = this;
        var journallineData = this.jeForm.controls['journalLines'];
        this.creditTotal = this.debitTotal = 0;
        _.each(journallineData.controls, function (lineForm) {
            var line = base._lineListForm.getData(lineForm);
            if (!line.destroy) {
                base.creditTotal += line.creditAmount ? base.roundOffValue(parseFloat(line.creditAmount)) : 0;
                base.debitTotal += line.debitAmount ? base.roundOffValue(parseFloat(line.debitAmount)) : 0;
            }
        });
    };
    JournalEntryComponent.prototype.newForm = function () {
        var base = this;
        this.active = false;
        setTimeout(function () {
            base.active = true;
        }, 0);
    };
    JournalEntryComponent.prototype.newLineForm = function () {
        var base = this;
        this.lineActive = false;
        setTimeout(function () {
            base.lineActive = true;
        }, 0);
    };
    JournalEntryComponent.prototype.refreshCOA = function () {
        var base = this;
        this.newCOAActive = false;
        setTimeout(function () {
            base.newCOAActive = true;
        }, 0);
    };
    JournalEntryComponent.prototype.showNewLine = function () {
        this.addNewLineFlag = true;
        this.newJournalLineForm = this._fb.group(this._lineListForm.getForm());
    };
    JournalEntryComponent.prototype.selectValue = function ($event, dimension, value) {
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        _.each(this.selectedDimensions, function (selectedDimension) {
            if (selectedDimension.name == dimension.name) {
                if (selectedDimension.values.indexOf(value) == -1) {
                    selectedDimension.values.push(value);
                }
                else {
                    selectedDimension.values.splice(selectedDimension.values.indexOf(value), 1);
                }
            }
        });
    };
    JournalEntryComponent.prototype.isDimensionSelected = function (dimensionName) {
        var selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        return selectedDimensionNames.indexOf(dimensionName) != -1;
    };
    JournalEntryComponent.prototype.isValueSelected = function (dimension, value) {
        var currentDimension = _.find(this.selectedDimensions, { 'name': dimension.name });
        if (!_.isEmpty(currentDimension)) {
            if (currentDimension.values.indexOf(value) != -1) {
                return true;
            }
            return false;
        }
        return false;
    };
    JournalEntryComponent.prototype.selectDimension = function ($event, dimensionName) {
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        var selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        if (selectedDimensionNames.indexOf(dimensionName) == -1) {
            this.selectedDimensions.push({
                "name": dimensionName,
                "values": []
            });
        }
        else {
            this.selectedDimensions.splice(selectedDimensionNames.indexOf(dimensionName), 1);
        }
    };
    /*This function will stop event bubbling to avoid default selection of first value in first dimension*/
    JournalEntryComponent.prototype.doNothing = function ($event) {
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    };
    JournalEntryComponent.prototype.hideFlyout = function () {
        this.editingLineIndex = undefined;
        this.dimensionFlyoutCSS = "collapsed";
    };
    JournalEntryComponent.prototype.resetLineForm = function () {
        var typeControl = this.lineForm.controls['type'];
        typeControl.patchValue('');
        var entryTypeControl = this.lineForm.controls['entryType'];
        entryTypeControl.patchValue('');
        var creditAmountControl = this.lineForm.controls['creditAmount'];
        creditAmountControl.patchValue(0);
        var debitAmountControl = this.lineForm.controls['debitAmount'];
        debitAmountControl.patchValue(0);
        var coaControl = this.lineForm.controls['coa'];
        coaControl.patchValue('');
        var amountControl = this.lineForm.controls['amount'];
        amountControl.patchValue('');
        var memoControl = this.lineForm.controls['notes'];
        memoControl.patchValue('');
        var dimensionsControl = this.lineForm.controls['dimensions'];
        dimensionsControl.patchValue([]);
        if (this.newCoaComboBox) {
            this.newCoaComboBox.clearValue();
        }
    };
    JournalEntryComponent.prototype.showFlyout = function ($event, index) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        this.dimensionFlyoutCSS = "expanded";
        this.lineActive = true;
        this.resetLineForm();
        this.selectedDimensions = [];
        this.editingLineIndex = index;
        var itemsControl = this.jeForm.controls['journalLines'];
        var lineListItem = itemsControl.controls[index];
        var tempLineForm = _.cloneDeep(lineListItem);
        var lineData = this._lineListForm.getData(tempLineForm);
        this.selectedDimensions = lineData.dimensions || [];
        this.updateLineFormForEdit(lineData);
        this.resetAllLinesFromEditing(itemsControl);
    };
    JournalEntryComponent.prototype.updateLineFormForEdit = function (lineData) {
        var base = this;
        this.newLineForm();
        this._lineListForm.updateForm(this.lineForm, lineData);
        this.filteredChartOfAccounts = _.filter(this.chartOfAccounts, { 'category': lineData.type });
        var coa = _.find(this.chartOfAccounts, { 'id': lineData.coa });
        var data = this._jeForm.getData(this.jeForm);
        var entity = {};
        if (data.jeType == 'Bill') {
            entity = _.find(this.vendors, { 'id': lineData.entity });
        }
        else if (data.jeType == 'Payroll') {
            entity = _.find(this.employees, { 'id': lineData.entity });
        }
        else if (data.jeType == 'Invoice') {
            entity = _.find(this.customers, { 'customer_id': lineData.entity });
        }
        else if (data.jeType == 'Other') {
            entity = _.find(this.allEntities, { 'id': lineData.entity });
        }
        this.selectedDimensions = lineData.dimensions;
        setTimeout(function () {
            base.newCoaComboBox.setValue(coa, 'name');
            if (data.jeType == 'Invoice') {
                base.newEntityComoboBoc.setValue(entity, 'customer_name');
            }
            else {
                base.newEntityComoboBoc.setValue(entity, 'name');
            }
        }, 0);
    };
    /*When user clicks on save button in the flyout*/
    JournalEntryComponent.prototype.saveLine = function () {
        var base = this;
        var dimensions = this.lineForm.controls['dimensions'];
        dimensions.patchValue(this.selectedDimensions);
        var lineData = this._lineListForm.getData(this.lineForm);
        if (lineData.coa == '--None--' || lineData.coa == '') {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select Chart of Account");
            return;
        }
        base.updateLineInView(lineData);
        this.selectedDimensions = [];
        this.hideFlyout();
    };
    /*This will just add new line details in VIEW*/
    JournalEntryComponent.prototype.saveLineInView = function (line) {
        var base = this;
        var linesControl = this.jeForm.controls['journalLines'];
        var lineListForm = _.cloneDeep(this._fb.group(this._lineListForm.getForm(line)));
        linesControl.controls.push(lineListForm);
        var journalData = [];
        _.each(linesControl.controls, function (lineForm) {
            journalData.push(base._lineListForm.getData(lineForm));
        });
        this.jeForm.controls['journalLines'].patchValue(journalData);
    };
    /*This will just update line details in VIEW*/
    JournalEntryComponent.prototype.updateLineInView = function (line) {
        var linesControl = this.jeForm.controls['journalLines'];
        var currentLineControl = linesControl.controls[this.editingLineIndex];
        if (currentLineControl.editable) {
            currentLineControl.editable = !currentLineControl.editable;
        }
        currentLineControl.controls['notes'].patchValue(line.notes);
        currentLineControl.controls['title'].patchValue(line.title);
        currentLineControl.controls['coa'].patchValue(line.coa);
        currentLineControl.controls['entity'].patchValue(line.entity);
        currentLineControl.controls['entityType'].patchValue(line.entityType);
        currentLineControl.controls['creditAmount'].patchValue(line.creditAmount);
        currentLineControl.controls['debitAmount'].patchValue(line.debitAmount);
        currentLineControl.controls['dimensions'].patchValue(line.dimensions);
    };
    JournalEntryComponent.prototype.resetAllLinesFromEditing = function (linesControl) {
        _.each(linesControl.controls, function (lineControl) {
            lineControl.editable = false;
        });
    };
    JournalEntryComponent.prototype.getLineCount = function () {
        var linesControl = this.jeForm.controls['journalLines'];
        var activeLines = [];
        _.each(linesControl.controls, function (lineControl) {
            if (!lineControl.controls['destroy'].value) {
                activeLines.push(lineControl);
            }
        });
        return activeLines.length;
    };
    JournalEntryComponent.prototype.getLastActiveLineIndex = function (linesControl) {
        var result = false;
        _.each(linesControl.controls, function (lineControl, index) {
            if (!lineControl.controls['destroy'].value) {
                result = index;
            }
        });
        return result;
    };
    //When user double clicks on the line, it toggles and show the fields
    JournalEntryComponent.prototype.editLine = function (lineListItem, index) {
        var linesControl = this.jeForm.controls['journalLines'];
        var data = this._jeForm.getData(lineListItem);
        //It works. Not sure whether it has better ways to do.
        jQuery('#coa-' + index).siblings().children('input').val(this.getCOAName(data.coa));
        var controls = {
            entity: {
                value: data.entity
            }
        };
        jQuery('#vendor-' + index).siblings().children('input').val(this.getEntityName(controls));
        jQuery('#employee-' + index).siblings().children('input').val(this.getEntityName(controls));
        jQuery('#invoice-' + index).siblings().children('input').val(this.getEntityName(controls));
        jQuery('#entity-' + index).siblings().children('input').val(this.getEntityName(controls));
        if (index == this.getLastActiveLineIndex(linesControl)) {
            this.addDefaultLine(1);
        }
        this.resetAllLinesFromEditing(linesControl);
        lineListItem.editable = !lineListItem.editable;
    };
    JournalEntryComponent.prototype.handleKeyEvent = function (event, index, key) {
        var current_ele = jQuery(this.el.nativeElement).find("tr")[index].closest('tr');
        var focusedIndex;
        jQuery(current_ele).find("td input").each(function (id, field) {
            if (jQuery(field).is(':focus')) {
                focusedIndex = id;
            }
        });
        var base = this;
        var journalLines = this.jeForm.controls.journalLines;
        if (key === 'Arrow Down') {
            var nextIndex_1 = this.getNextElement(current_ele, index, 'Arrow Down');
            base.editLine(journalLines.controls[nextIndex_1], nextIndex_1);
            setTimeout(function () {
                var elem = jQuery(base.el.nativeElement).find("tr")[nextIndex_1];
                jQuery(elem).find("td input").each(function (id, field) {
                    if (id == focusedIndex) {
                        jQuery(field).focus();
                    }
                });
            });
        }
        else {
            var nextIndex_2 = this.getNextElement(current_ele, index, 'Arrow Up');
            base.editLine(journalLines.controls[nextIndex_2], nextIndex_2);
            setTimeout(function () {
                var elem = jQuery(base.el.nativeElement).find("tr")[nextIndex_2];
                jQuery(elem).find("td input").each(function (id, field) {
                    if (id == focusedIndex) {
                        jQuery(field).focus();
                    }
                });
            });
        }
    };
    JournalEntryComponent.prototype.getNextElement = function (current_ele, curr_index, event) {
        var next_ele;
        if (event === 'Arrow Down') {
            next_ele = jQuery(current_ele).next('tr');
        }
        else {
            next_ele = jQuery(current_ele).prev('tr');
        }
        if (next_ele.length > 0) {
            if (next_ele[0].hidden) {
                return this.getNextElement(next_ele, next_ele[0].sectionRowIndex, event);
            }
            else {
                return next_ele[0].sectionRowIndex;
            }
        }
        else {
            return curr_index;
        }
    };
    JournalEntryComponent.prototype.setJournalDate = function (date) {
        var jeDateControl = this.jeForm.controls['date'];
        jeDateControl.patchValue(date);
    };
    JournalEntryComponent.prototype.setReversalDate = function (date) {
        var jeReversalDateControl = this.jeForm.controls['reversalDate'];
        jeReversalDateControl.patchValue(date);
    };
    JournalEntryComponent.prototype.setNextJEDate = function (date) {
        var nextJEDateControl = this.jeForm.controls['nextJEDate'];
        nextJEDateControl.patchValue(date);
    };
    JournalEntryComponent.prototype.setEndDate = function (date) {
        var endDateControl = this.jeForm.controls['endDate'];
        endDateControl.patchValue(date);
    };
    JournalEntryComponent.prototype.toggleAutoReverse = function () {
        var base = this;
        setTimeout(function () {
            base.disableReversalDate = !Boolean(base.jeForm.controls['autoReverse'].value);
        }, 0);
    };
    JournalEntryComponent.prototype.toggleRecurring = function () {
        var base = this;
        setTimeout(function () {
            base.disableRecurring = !Boolean(base.jeForm.controls['recurring'].value);
        }, 0);
    };
    JournalEntryComponent.prototype.setReverseJournal = function (reverseJournal) {
        var journal;
        _.each(this.existingJournals, function (existingJournal) {
            if (existingJournal.number == reverseJournal) {
                journal = existingJournal;
            }
        });
        if (!_.isEmpty(journal)) {
            var reverseJournalControl = this.jeForm.controls['reversedFrom'];
            reverseJournalControl.patchValue(journal.id);
        }
    };
    JournalEntryComponent.prototype.updateChartOfAccount = function (chartOfAccount) {
        var lineData = this._lineListForm.getData(this.lineForm);
        if (chartOfAccount && chartOfAccount.id) {
            lineData.coa = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            lineData.coa = '--None--';
        }
        this._lineListForm.updateForm(this.lineForm, lineData);
    };
    JournalEntryComponent.prototype.updateEntity = function (entity) {
        var lineData = this._lineListForm.getData(this.lineForm);
        if (entity && entity.id) {
            lineData.entity = entity.id;
            lineData.entityType = entity.entityType;
        }
        else if (entity && entity.customer_id) {
            lineData.entity = entity.customer_id;
            lineData.entityType = entity.entityType;
        }
        else if (!entity || entity == '--None--') {
            lineData.entity = '--None--';
        }
        this._lineListForm.updateForm(this.lineForm, lineData);
    };
    JournalEntryComponent.prototype.toggleLineEdit = function (lineListItem) {
        lineListItem.editable = !lineListItem.editable;
    };
    JournalEntryComponent.prototype.deleteLine = function ($event, lineIndex) {
        var base = this;
        $event && $event.stopImmediatePropagation();
        var lineList = this.jeForm.controls['journalLines'];
        lineList.controls[lineIndex].controls['destroy'].patchValue(true);
        setTimeout(function () {
            base.updateLineTotal();
            base.handleKeyEvent($event, lineIndex, 'Arrow Down');
        });
    };
    JournalEntryComponent.prototype.getCOAName = function (coaId) {
        var coa = _.find(this.chartOfAccounts, { id: coaId });
        if (coa) {
            return coa.name;
        }
        return "";
    };
    JournalEntryComponent.prototype.getEntityName = function (controls) {
        var data = this._jeForm.getData(this.jeForm);
        if (data.jeType == 'Bill') {
            var vendor = _.find(this.vendors, { 'id': controls.entity.value });
            return vendor ? vendor.name : '';
        }
        else if (data.jeType == 'Payroll') {
            var employee = _.find(this.employees, { 'id': controls.entity.value });
            return employee ? employee.name : '';
        }
        else if (data.jeType == 'Invoice') {
            var customer = _.find(this.customers, { 'customer_id': controls.entity.value });
            return customer ? customer.customer_name : '';
        }
        else if (data.jeType == 'Other') {
            var entity = _.find(this.allEntities, { 'id': controls.entity.value });
            return entity ? entity.name : '';
        }
        return '';
    };
    JournalEntryComponent.prototype.cleanData = function (data) {
        delete data.newType;
        delete data.newEntryType;
        delete data.newDimensions;
        delete data.newAmount;
        delete data.newCoa;
        delete data.newTitle;
        delete data.newMemo;
        return data;
    };
    JournalEntryComponent.prototype.updateJournalLinesData = function (data) {
        var base = this;
        _.each(data.journalLines, function (line) {
            if (line.coa == '--None--' || line.coa == '') {
                line.coa = null;
            }
            if (line.entity == '--None--' || line.entity == '') {
                line.entity = null;
            }
            if (line.creditAmount) {
                line.creditAmount = base.roundOffValue(line.creditAmount);
            }
            if (line.debitAmount) {
                line.debitAmount = base.roundOffValue(line.debitAmount);
            }
        });
    };
    JournalEntryComponent.prototype.getJournalLineData = function (jeForm) {
        var base = this;
        var data = [];
        var linesControl = jeForm.controls['journalLines'];
        var defaultLine = this._lineListForm.getData(this._fb.group(this._lineListForm.getForm()));
        _.each(linesControl.controls, function (jeLineControl) {
            var lineData = base._lineListForm.getData(jeLineControl);
            if (!_.isEqual(lineData, defaultLine)) {
                if (!base.newJournalEntry) {
                    data.push(lineData);
                }
                else if (!lineData.destroy) {
                    data.push(lineData);
                }
            }
        });
        return data;
    };
    JournalEntryComponent.prototype.validateLines = function (lines) {
        var base = this;
        var result = false;
        _.each(lines, function (line) {
            if (!line.destroy) {
                if (line.creditAmount && line.debitAmount) {
                    base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "One of the lines have both Credit and Debit amount");
                    result = true;
                    return false;
                }
                if (!line.coa) {
                    base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Chat of Account is not selected for line");
                    result = true;
                    return false;
                }
                if (line.debitAmount == 0 && line.creditAmount == 0) {
                    base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Line should have either Credit or Debit amount");
                    result = true;
                    return false;
                }
            }
        });
        if (!result) {
            this.updateLineTotal();
            if (this.creditTotal.toFixed(2) != this.debitTotal.toFixed(2)) {
                this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Credit and debit totals doesn't match");
                result = true;
            }
        }
        return result;
    };
    JournalEntryComponent.prototype.updateLineEntryTypes = function (lines) {
        _.each(lines, function (line) {
            if (line.creditAmount) {
                line.entryType = 'Credit';
                line.amount = line.creditAmount;
            }
            else if (line.debitAmount) {
                line.entryType = 'Debit';
                line.amount = line.debitAmount;
            }
            line.entity = line.entity ? line.entity : null;
            delete line.debitAmount;
            delete line.creditAmount;
        });
    };
    JournalEntryComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._jeForm.getData(this.jeForm);
        data.date = this.dateFormater.formatDate(data.date, this.dateFormat, this.serviceDateformat);
        data.journalLines = this.getJournalLineData(this.jeForm);
        this.updateJournalLinesData(data);
        if (this.validateLines(data.journalLines)) {
            return;
        }
        this.updateLineEntryTypes(data.journalLines);
        if (data.reversalDate) {
            data.autoReverse = true;
        }
        else {
            data.autoReverse = false;
        }
        this.loadingService.triggerLoadingEvent(true);
        if (this.newJournalEntry) {
            this.journalService.addJournalEntry(this.cleanData(data), this.companyId)
                .subscribe(function (journalEntry) {
                _this.stopLoaderAndShowMessage(false, "Journal Entry created successfully");
                _this.showDashboard();
            }, function (error) { return _this.handleError(error); });
        }
        else {
            data.id = this.journalEntry.id;
            this.journalService.updateJournalEntry(this.cleanData(data), this.companyId)
                .subscribe(function (journalEntry) {
                _this.stopLoaderAndShowMessage(false, "Journal Entry updated successfully");
                _this.showDashboard();
            }, function (error) { return _this.handleError(error); });
        }
    };
    JournalEntryComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    JournalEntryComponent.prototype.filterChartOfAccounts = function (category) {
        var base = this;
        this.filteredChartOfAccounts = [];
        _.each(this.chartOfAccounts, function (coa) {
            if (coa.category && category && (coa.category.toLowerCase() == category.toLowerCase())) {
                base.filteredChartOfAccounts.push(coa);
            }
        });
    };
    JournalEntryComponent.prototype.isJournalEntry = function (entityType) {
        var data = this._jeForm.getData(this.jeForm);
        return data.jeType == entityType;
    };
    JournalEntryComponent.prototype.getFilteredCOA = function (category) {
        var base = this;
        var filteredCOA = [];
        _.each(this.chartOfAccounts, function (coa) {
            if (coa.category && category && (coa.category.toLowerCase() == category.toLowerCase())) {
                filteredCOA.push(coa);
            }
        });
        return filteredCOA;
    };
    JournalEntryComponent.prototype.updateLineCOA = function (chartOfAccount, index) {
        var linesControl = this.jeForm.controls['journalLines'];
        var currentLineForm = linesControl.controls[index];
        var currentLineData = this._lineListForm.getData(currentLineForm);
        if (chartOfAccount && chartOfAccount.id) {
            currentLineData.coa = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            currentLineData.coa = '--None--';
        }
        this._lineListForm.updateForm(currentLineForm, currentLineData);
    };
    JournalEntryComponent.prototype.updateLineEntity = function (entity, index) {
        var linesControl = this.jeForm.controls['journalLines'];
        var currentLineForm = linesControl.controls[index];
        var currentLineData = this._lineListForm.getData(currentLineForm);
        if (entity && entity.id) {
            currentLineData.entity = entity.id;
            currentLineData.entityType = entity.entityType;
        }
        else if (entity && entity.customer_id) {
            currentLineData.entity = entity.customer_id;
            currentLineData.entityType = entity.entityType;
        }
        else if (!entity || entity == '--None--') {
            currentLineData.entity = '--None--';
        }
        this._lineListForm.updateForm(currentLineForm, currentLineData);
    };
    JournalEntryComponent.prototype.updateNewLineCOA = function (chartOfAccount) {
        var lineData = this._lineListForm.getData(this.newJournalLineForm);
        if (chartOfAccount && chartOfAccount.id) {
            lineData.coa = chartOfAccount.id;
        }
        else if (!chartOfAccount || chartOfAccount == '--None--') {
            lineData.coa = '--None--';
        }
        this._lineListForm.updateForm(this.newJournalLineForm, lineData);
    };
    JournalEntryComponent.prototype.processJournalEntry = function (journalEntry) {
        this.jeDetails = journalEntry;
        this.onJETypeSelect(this.jeDetails.jeType);
        this.setBadge();
        journalEntry.journalLines = _.orderBy(journalEntry.journalLines, ['entryType'], ['desc']);
        journalEntry.date = this.dateFormater.formatDate(journalEntry.date, this.serviceDateformat, this.dateFormat);
        var base = this;
        this.journalEntry = journalEntry;
        if (this.isReverse) {
            this.journalEntry.number += 'R';
            this.journalEntry.type = 'Reversal';
            this.journalEntry.reversedFrom = this.journalEntry.id;
            _.each(this.journalEntry.journalLines, function (line) {
                if (line.entryType == 'Debit') {
                    line.entryType = 'Credit';
                }
                else if (line.entryType == 'Credit') {
                    line.entryType = 'Debit';
                }
            });
        }
        if (journalEntry['createdBY'] === 'system') {
            this.isSystemCreatedJE = true;
        }
        this.disableReversalDate = !Boolean(journalEntry.autoReverse);
        this.disableRecurring = !Boolean(journalEntry.recurring);
        var linesControl = this.jeForm.controls['journalLines'];
        _.each(this.journalEntry.journalLines, function (line) {
            if (line.entryType == 'Credit') {
                line.creditAmount = line.amount;
            }
            else if (line.entryType == 'Debit') {
                line.debitAmount = line.amount;
            }
            line.destroy = false;
            var lineListForm = base._fb.group(base._lineListForm.getForm(line));
            linesControl.push(lineListForm);
        });
        this.stopLoaderAndShowMessage(false);
        this._jeForm.updateForm(this.jeForm, this.journalEntry);
        this.updateLineTotal();
        this.reversed = journalEntry.reversed;
        if (journalEntry.reversedFrom) {
            this.haveSourceId = true;
        }
        else {
            this.haveSourceId = false;
        }
    };
    JournalEntryComponent.prototype.stopLoaderAndShowMessage = function (error, message) {
        this.loadingService.triggerLoadingEvent(false);
        if (message) {
            var type = error ? Qount_constants_1.TOAST_TYPE.error : Qount_constants_1.TOAST_TYPE.success;
            this.toastService.pop(type, message);
        }
    };
    JournalEntryComponent.prototype.getDimensions = function (dimensions) {
        var result = "";
        _.each(dimensions, function (dimension, index) {
            if (index == 0) {
                result = dimension.name;
            }
            else {
                result += ',' + dimension.name;
            }
        });
        return result;
    };
    JournalEntryComponent.prototype.ngOnDestroy = function () {
        jQuery('.pika-single').remove();
        jQuery('.ui-helper-hidden-accessible').remove();
        jQuery('.ui-menu').remove();
        this.routeSubscribe.unsubscribe();
    };
    JournalEntryComponent.prototype.addDefaultLine = function (count) {
        var linesControl = this.jeForm.controls['journalLines'];
        for (var i = 0; i < count; i++) {
            var lineForm = this._fb.group(this._lineListForm.getForm());
            linesControl.controls.push(lineForm);
        }
    };
    JournalEntryComponent.prototype.ngOnInit = function () {
        this.initializeJournal();
    };
    JournalEntryComponent.prototype.initializeJournal = function () {
        var _this = this;
        var base = this;
        var _form = this._jeForm.getForm();
        _form['journalLines'] = new forms_1.FormArray([]); //this.journalLinesArray;
        this.jeForm = this._fb.group(_form);
        var _lineForm = this._lineListForm.getForm();
        this.lineForm = this._fb.group(_lineForm);
        if (this.newJournalEntry) {
            this.addDefaultLine(2);
        }
        this.newForm();
        this.loadingService.triggerLoadingEvent(true);
        this.companiesService.companies().subscribe(function (companies) {
            _this.allCompanies = companies;
            _this.dimensionService.dimensions(_this.companyId)
                .subscribe(function (dimensions) {
                _this.dimensions = dimensions;
            }, function (error) { return _this.handleError(error); });
            _this.coaService.chartOfAccounts(_this.companyId)
                .subscribe(function (chartOfAccounts) {
                _this.chartOfAccounts = chartOfAccounts;
                _.sortBy(_this.chartOfAccounts, ['number', 'name']);
                _this.toggleAutoReverse();
                _this.toggleRecurring();
                if (!_this.newJournalEntry || _this.isReverse) {
                    _this.journalService.journalEntry(_this.journalID, _this.companyId)
                        .subscribe(function (journalEntry) { return _this.processJournalEntry(journalEntry); }, function (error) { return _this.handleError(error); });
                }
                else {
                    _this.setJournalDate(_this.defaultDate);
                    _this.stopLoaderAndShowMessage(false);
                }
            }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
    };
    JournalEntryComponent.prototype.showDashboard = function () {
        if (this.stayFlyout) {
            this.initializeJournal();
            this.stayFlyout = false;
            this.dimensionFlyoutCSS = "";
        }
        else {
            var link = ['books', 'journalEntries'];
            this._router.navigate(link);
        }
    };
    JournalEntryComponent.prototype.goToPreviousPage = function () {
        var prevState = this.stateService.pop();
        if (prevState) {
            this._router.navigate([prevState.url]);
        }
        else {
            var link = ['books', 'journalEntries'];
            this._router.navigate(link);
        }
    };
    JournalEntryComponent.prototype.showRecurringOpts = function () {
        this.showAdvance = !this.showAdvance;
    };
    JournalEntryComponent.prototype.jeDrilldown = function () {
        var sourceID = this.jeDetails['sourceID'];
        var sourceType = this.jeDetails['sourceType'];
        var source = this.jeDetails['source'];
        this.stateService.addState(new State_1.State('JOURNAL_ENTRY', this._router.url, null, null));
        if (sourceID && sourceType == 'bill' && source == 'accountsPayable') {
            var link = ['payments/bill', Session_1.Session.getCurrentCompany(), sourceID, 'enter'];
            this._router.navigate(link);
        }
        else if (sourceID && sourceType == 'credit') {
            var link = ['payments/credit', Session_1.Session.getCurrentCompany(), sourceID];
            this._router.navigate(link);
        }
        else if (sourceID && sourceType == 'deposit' && source == 'inflow') {
            var link = ['/deposit', sourceID];
            this._router.navigate(link);
        }
        else if (sourceID && sourceType == 'expense' && source == 'outflow') {
            var link = ['/expense', sourceID];
            this._router.navigate(link);
        }
        else if (sourceID && sourceType == 'payment' && source == 'accountsPayable') {
            var link = ['/payments', sourceID];
            this._router.navigate(link);
        }
        else if (sourceID && source == 'accountsReceivable') {
            if (sourceType == 'invoice') {
                var link = ['invoices/edit', sourceID];
                this._router.navigate(link);
            }
            else if (sourceType == 'payment') {
                var link = ['payments/edit', sourceID];
                this._router.navigate(link);
            }
        }
    };
    JournalEntryComponent.prototype.setBadge = function () {
        var sourceID = this.jeDetails['sourceID'];
        var sourceType = this.jeDetails['sourceType'];
        var source = this.jeDetails['source'];
        if (sourceID && source === 'accountsPayable') {
            if (sourceType === 'payment') {
                this.badgeText = "P";
                this.showBadge = true;
            }
            else {
                this.badgeText = "B";
                this.showBadge = true;
            }
        }
        else if (sourceID && source === 'accountsReceivable') {
            if (sourceType === 'payment') {
                this.badgeText = "P";
                this.showBadge = true;
            }
            else if (sourceType === 'invoice') {
                this.badgeText = "I";
                this.showBadge = true;
            }
        }
        else if (sourceID && source === 'outflow') {
            this.badgeText = "E";
            this.showBadge = true;
        }
        else if (sourceID && source === 'inflow') {
            this.badgeText = "D";
            this.showBadge = true;
        }
        else if (sourceID && sourceType === 'credit') {
            this.badgeText = "C";
            this.showBadge = true;
        }
    };
    JournalEntryComponent.prototype.onJETypeSelect = function (jeType) {
        if (jeType == "Other") {
            var allArray = [];
            this.allEntities = allArray.concat(this.vendors).concat(this.customers).concat(this.employees);
        }
    };
    JournalEntryComponent.prototype.roundOffValue = function (num) {
        return Math.round(num * 100) / 100;
    };
    return JournalEntryComponent;
}());
__decorate([
    core_1.ViewChild('editDimension'),
    __metadata("design:type", Object)
], JournalEntryComponent.prototype, "editDimension", void 0);
__decorate([
    core_1.ViewChild('coaComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], JournalEntryComponent.prototype, "coaComboBox", void 0);
__decorate([
    core_1.ViewChild('newCoaComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], JournalEntryComponent.prototype, "newCoaComboBox", void 0);
__decorate([
    core_1.ViewChild('reverseJournalDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], JournalEntryComponent.prototype, "reverseJournalComboBox", void 0);
__decorate([
    core_1.ViewChild('newEntityComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], JournalEntryComponent.prototype, "newEntityComoboBoc", void 0);
__decorate([
    core_1.ViewChild('list'),
    __metadata("design:type", core_1.ElementRef)
], JournalEntryComponent.prototype, "el", void 0);
JournalEntryComponent = __decorate([
    core_1.Component({
        selector: 'journal-entry',
        templateUrl: '/app/views/journalEntry.html',
    }),
    __metadata("design:paramtypes", [JournalEntry_form_1.JournalEntryForm, forms_1.FormBuilder, ChartOfAccounts_service_1.ChartOfAccountsService, JournalEntry_form_1.JournalLineForm,
        JournalEntries_service_1.JournalEntriesService, Toast_service_1.ToastService, router_1.Router, router_1.ActivatedRoute,
        Companies_service_1.CompaniesService, DimensionService_service_1.DimensionService, LoadingService_1.LoadingService,
        Employees_service_1.EmployeeService, Customers_service_1.CustomersService, DateFormatter_service_1.DateFormater,
        StateService_1.StateService, PageTitle_1.pageTitleService, SwitchBoard_1.SwitchBoard])
], JournalEntryComponent);
exports.JournalEntryComponent = JournalEntryComponent;
