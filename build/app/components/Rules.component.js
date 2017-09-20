/**
 * Created by seshu on 27-02-2016.
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
var core_2 = require("@angular/core");
var router_1 = require("@angular/router");
var Rule_form_1 = require("../forms/Rule.form");
var forms_1 = require("@angular/forms");
var Rules_service_1 = require("qCommon/app/services/Rules.service");
var Session_1 = require("qCommon/app/services/Session");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var DimensionService_service_1 = require("qCommon/app/services/DimensionService.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var FinancialAccounts_service_1 = require("qCommon/app/services/FinancialAccounts.service");
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var DateFormatter_service_1 = require("qCommon/app/services/DateFormatter.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var RulesComponent = (function () {
    function RulesComponent(_router, customersService, switchBoard, companyService, _toastService, _fb, ruleservice, _ruleForm, coaService, dimensionService, titleService, financialAccountsService, _actionForm, loadingService, dateFormater) {
        var _this = this;
        this._router = _router;
        this.customersService = customersService;
        this.switchBoard = switchBoard;
        this.companyService = companyService;
        this._toastService = _toastService;
        this._fb = _fb;
        this.ruleservice = ruleservice;
        this._ruleForm = _ruleForm;
        this.coaService = coaService;
        this.dimensionService = dimensionService;
        this.titleService = titleService;
        this.financialAccountsService = financialAccountsService;
        this._actionForm = _actionForm;
        this.loadingService = loadingService;
        this.dateFormater = dateFormater;
        this.showFlyout = false;
        this.editMode = false;
        this.hasRuleList = false;
        this.hasAmount = false;
        this.actions = new forms_1.FormArray([]);
        this.depositlist = [];
        this.expenxeArray = [];
        this.expenxeArraylist = [];
        this.depositAarray = [];
        this.depositAarraylist = [];
        this.banks = [];
        this.rules = [];
        this.customernames = [];
        this.tableData = {};
        this.selectedDimensions = [];
        this.tableOptions = {};
        this.chartOfAccounts = [];
        this.dimensions = [];
        this.titleService.setPageTitle("Rules");
        this.companyId = Session_1.Session.getCurrentCompany();
        this.dateFormat = dateFormater.getFormat();
        this.serviceDateformat = dateFormater.getServiceDateformat();
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.RuleDelete(toast); });
        this.conparisionArray = ['--None--', 'BEGINS_WITH', 'CONTAINS', 'EQUALS_TO'];
        this.conparisionAmountArray = ['--None--', 'EQUALS_TO', 'LESS_THAN', 'BETWEEN', 'GREATER_THAN', 'GREATER_THAN_OR_EQUALS_TO', 'LESS_THAN_OR_EQUALS_TO'];
        this.vendorsArray = ['EQUALS_TO'];
        this.customersArray = ['EQUALS_TO'];
        this.todaysDate = moment(new Date()).format(this.dateFormat);
        this.financialAccountsService.financialAccounts(this.companyId)
            .subscribe(function (response) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.banks = response.accounts;
            console.log("this.banks", _this.banks);
            _this.ruleservice.getRulesofCompany(_this.companyId)
                .subscribe(function (RulesList) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.RulesList = RulesList;
                _this.buildTableData(RulesList);
                _this.showFlyout = false;
            }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
        this.companyService.vendors(this.companyId)
            .subscribe(function (vendors) {
            _this.vendors = vendors;
        }, function (error) { return _this.handleError(error); });
        this.customersService.customers(this.companyId)
            .subscribe(function (customernames) {
            _this.customernames = customernames;
        }, function (error) { return _this.handleError(error); });
        // this.financialAccountsService.financialInstitutions()
        //     .subscribe(banks => {
        //         this.banks = banks;
        //         this.ruleservice.getRulesofCompany(this.companyId)
        //             .subscribe(RulesList  => {
        //                 this.loadingService.triggerLoadingEvent(false);
        //                 this.RulesList=RulesList;
        //                 this.buildTableData(RulesList);
        //                 this.showFlyout = false;
        //             }, error =>  this.handleError(error));
        //         console.log("banks",banks);
        //     }, error => this.handleError(error));
        this.ruleservice.getattributes(this.companyId)
            .subscribe(function (AttributeList) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.AttributeList = AttributeList;
            for (var key_1 in AttributeList) {
                _this.depositlist.push(key_1);
                var exparray = AttributeList[key_1];
                _this.expenxeArray.push(exparray);
            }
            for (var key in _this.expenxeArray[0]) {
                _this.expenxeArraylist.push(key);
                _this.expenxeArrayvalue = _this.expenxeArraylist;
            }
            for (var key in _this.expenxeArray[1]) {
                _this.depositAarraylist.push(key);
            }
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
    RulesComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    RulesComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    RulesComponent.prototype.handleError = function (error) {
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    RulesComponent.prototype.expesevalue = function () {
        var expRate = this.ruleForm.controls['sourceType'];
        if (expRate.value == 'Expense') {
            var expense = this.ruleForm.controls['attributeName'];
            this.expenxeArrayvalue = this.expenxeArraylist;
        }
        else {
            var expense = this.ruleForm.controls['attributeName'];
            this.expenxeArrayvalue = this.depositAarraylist;
        }
    };
    RulesComponent.prototype.selectChange = function () {
        var attributeRate = this.ruleForm.controls['attributeName'];
        if (attributeRate.value == 'Title' || attributeRate.value == 'Notes') {
            this.conparisionArray = ['--None--', 'BEGINS_WITH', 'CONTAINS', 'EQUALS_TO'];
        }
        else {
            this.conparisionArray = ['--None--', 'BEGINS_WITH', 'CONTAINS', 'EQUALS_TO', 'GREATER_THAN_OR_EQUALS_TO', 'LESS_THAN', 'GREATER_THAN', 'LESS_THAN_OR_EQUALS_TO'];
        }
    };
    RulesComponent.prototype.RuleDelete = function (toast) {
        var _this = this;
        this.ruleservice.removeRule(this.ruleToDelete, this.companyId)
            .subscribe(function (success) {
            _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Rule deleted successfully");
            _this.ruleservice.getRulesofCompany(_this.companyId)
                .subscribe(function (RulesList) {
                _this.buildTableData(RulesList);
                _this.loadingService.triggerLoadingEvent(false);
                return;
            }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
    };
    RulesComponent.prototype.showAddRule = function () {
        this.titleService.setPageTitle("CREATE RULE");
        this.editMode = false;
        this.isDimensionSelected(null);
        this.selectedDimensions = [];
        this.showFlyout = true;
        this.isDimensionSelected(null);
        this.selectedDimensions == [];
        this.actions = new forms_1.FormArray([]);
        this.ruleForm.reset();
        var _form = this._ruleForm.getForm();
        this.ruleForm = this._fb.group(_form);
        this.selectedDimensions == [];
    };
    RulesComponent.prototype.showMessage = function (status, obj) {
        var _this = this;
        if (status) {
            this.status = {};
            this.status['success'] = true;
            if (this.editMode) {
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(function (RulesList) {
                    _this.loadingService.triggerLoadingEvent(false);
                    _this.RulesList = RulesList;
                    _this.buildTableData(RulesList);
                    _this.showFlyout = false;
                }, function (error) { return _this.handleError(error); });
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Rule updated successfully.");
            }
            else {
                this.ruleservice.getRulesofCompany(this.companyId)
                    .subscribe(function (RulesList) {
                    _this.loadingService.triggerLoadingEvent(false);
                    _this.RulesList = RulesList;
                    _this.buildTableData(RulesList);
                    _this.showFlyout = false;
                }, function (error) { return _this.handleError(error); });
                // this.TaxesForm.reset();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Rule created successfully.");
            }
        }
        else {
            this.status = {};
            this.status['error'] = true;
            try {
                var resp = JSON.parse(obj);
                if (resp.message) {
                    this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, resp.message);
                }
                else {
                    this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
                }
            }
            catch (err) {
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
            }
        }
    };
    RulesComponent.prototype.doNothing = function ($event) {
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    };
    RulesComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Rules");
        this.isDimensionSelected(null);
        this.hasAmount = false;
        this.selectedDimensions = [];
        // this.selectDimension=('','');
        this.dimensionFlyoutCSS = "collapsed";
        this.row = {};
        this.selectedDimensions = [];
        this.isDimensionSelected(null);
        this.showFlyout = !this.showFlyout;
    };
    RulesComponent.prototype.addNewAction = function () {
        var tempLineForm = this._fb.group(this._actionForm.getForm());
        var actionsControl = this.ruleForm.controls['actions'];
        actionsControl.push(tempLineForm);
    };
    RulesComponent.prototype.showAmount = function (amount) {
        var data = this._ruleForm.getData(this.ruleForm);
        if (data.comparisionType1 == 'BETWEEN') {
            this.hasAmount = true;
        }
        else {
            this.hasAmount = false;
        }
        if (data.comparisionType1 == '--None--') {
            data.comparisionType1 = "";
            var comparisionValue1 = this.ruleForm.controls['comparisionValue1'];
            comparisionValue1.patchValue("");
        }
        else {
            data.comparisionValue1 = data.comparisionValue1;
            var comparisionValue1 = this.ruleForm.controls['comparisionValue1'];
            comparisionValue1.patchValue(data.comparisionValue1);
        }
    };
    RulesComponent.prototype.showTitle = function (amount) {
        var data = this._ruleForm.getData(this.ruleForm);
        if (data.comparisionType == '--None--') {
            data.comparisionValue = "";
            var comparisionValue = this.ruleForm.controls['comparisionValue'];
            comparisionValue.patchValue("");
        }
        else {
            data.comparisionValue = data.comparisionValue;
            var comparisionValue = this.ruleForm.controls['comparisionValue'];
            comparisionValue.patchValue(data.comparisionValue);
        }
    };
    RulesComponent.prototype.showCOA = function (coa) {
        var data = this._ruleForm.getData(this.ruleForm);
        data.chartOfAccount = coa.id;
        if (coa.id != '' && coa != '--None--') {
            data.chartOfAccount = coa.id;
        }
        else if (coa == '--None--' || coa.id == '') {
            data.chartOfAccount = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    };
    RulesComponent.prototype.showVendor = function (vendor) {
        var data = this._ruleForm.getData(this.ruleForm);
        if (vendor.id != '' && vendor != '--None--') {
            data.vendorValue = vendor.id;
        }
        else if (vendor == '--None--' || vendor.id == '') {
            data.vendorValue = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    };
    RulesComponent.prototype.showSource = function (bank) {
        var data = this._ruleForm.getData(this.ruleForm);
        data.source = bank.id;
        if (bank.id != '' && bank != '--None--') {
            data.source = bank.id;
        }
        else if (bank == '--None--' || bank.id == '') {
            data.source = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    };
    RulesComponent.prototype.showCustomer = function (customer) {
        var data = this._ruleForm.getData(this.ruleForm);
        data.customerValue = customer.customer_id;
        if (customer.customer_id != '' && customer != '--None--') {
            data.customerValue = customer.customer_id;
        }
        else if (customer == '--None--' || customer.customer_id == '') {
            data.customerValue = '--None--';
        }
        this._ruleForm.updateForm(this.ruleForm, data);
    };
    RulesComponent.prototype.buildTableData = function (RulesList) {
        this.hasRuleList = false;
        this.RulesList = RulesList;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "id", "title": "id", "visible": false },
            { "name": "sourceType", "title": "Source Type" },
            { "name": "ruleName", "title": "Rule Name" },
            { "name": "chartOfAccount", "title": "COA" },
            { "name": "effectiveDate", "title": "Effective Date" },
            { "name": "conditions", "title": "conditions", "visible": false },
            { "name": "action", "title": "action", "visible": false },
            { "name": "actionValue", "title": "actionValue", "visible": false },
            { "name": "actions", "title": "" },
            { "name": "id", "title": "", "visible": false }
        ];
        var base = this;
        _.each(RulesList, function (RulesList) {
            var row = {};
            var coa = _.find(base.chartOfAccounts, function (_coa) {
                return _coa.id == RulesList.chartOfAccount;
            });
            row['id'] = RulesList.id;
            row['sourceType'] = RulesList.sourceType;
            row['ruleName'] = RulesList.ruleName;
            if (coa) {
                row['chartOfAccount'] = coa.name;
            }
            row['effectiveDate'] = base.dateFormater.formatDate(RulesList.effectiveDate, base.serviceDateformat, base.dateFormat);
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            base.tableData.rows.push(row);
        });
        base.hasRuleList = false;
        setTimeout(function () {
            base.hasRuleList = true;
        });
    };
    RulesComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditRule($event);
        }
        else if (action == 'delete') {
            this.removeRule($event);
        }
    };
    RulesComponent.prototype.removeRule = function (row) {
        this.ruleToDelete = row.id;
        this._toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    RulesComponent.prototype.deleteAction = function (index) {
        var indexValue = this.actions.controls.splice(index, 1);
        var actionsControl = this.ruleForm.controls['actions'];
        var actionsControlform = actionsControl.value.splice(index, 1);
    };
    RulesComponent.prototype.updateActionValueInUI = function (field, index, value, id) {
        var base = this;
        if (field == 'chartOfAccount') {
            setTimeout(function () {
                jQuery('#coa-' + index).siblings().children('input').val(value);
            }, 10);
        }
        else if (field == 'dimension') {
            setTimeout(function () {
                jQuery('#dimension-' + index).siblings().children('input').val(value);
            }, 10);
        }
    };
    RulesComponent.prototype.getCOAName = function (chartOfAccountId) {
        var coa = _.find(this.chartOfAccounts, { 'id': chartOfAccountId });
        return coa ? coa.name : '';
    };
    RulesComponent.prototype.showEditRule = function (row) {
        var _this = this;
        this.titleService.setPageTitle("UPDATE RULE");
        var base = this;
        this.showFlyout = true;
        this.editMode = true;
        this.actions = new forms_1.FormArray([]);
        this.ruleservice.rule(this.companyId, row.id).subscribe(function (rule) {
            _this.getRowDetails(row.id);
            rule.actions.forEach(function (action, index) {
                base.updateActionValueInUI(action.action, index, action.actionValue, action.id);
                var actionForm = base._fb.group(base._actionForm.getForm(action));
                base.actions.push(actionForm);
            });
            var _form = _this._ruleForm.getForm();
            _form['actions'] = _this.actions;
            _this.ruleForm = _this._fb.group(_form);
        });
        // this.getRowDetails(row.id);
    };
    RulesComponent.prototype.isValid = function (ruleForm) {
        if ((ruleForm.value.ruleName) && (ruleForm.value.chartOfAccount)) {
            return false;
        }
        return true;
    };
    RulesComponent.prototype.getRowDetails = function (RuleID) {
        var _this = this;
        var base = this;
        this.ruleservice.rule(this.companyId, RuleID).subscribe(function (rule) {
            _this.row = rule;
            rule.effectiveDate = base.dateFormater.formatDate(rule.effectiveDate, base.serviceDateformat, base.dateFormat);
            if (rule.endDate) {
                rule.endDate = base.dateFormater.formatDate(rule.endDate, base.serviceDateformat, base.dateFormat);
            }
            _this.selectedDimensions = rule.actions;
            var selectedCOAControl = _this.ruleForm.controls['sourceType'];
            selectedCOAControl.patchValue(rule.sourceType);
            var coa = _.find(_this.chartOfAccounts, function (_coa) {
                return _coa.id == rule.chartOfAccount;
            });
            if (!_.isEmpty(coa) && (rule.chartOfAccount != '--None--') || (rule.chartOfAccount != '')) {
                setTimeout(function () {
                    base.coaComboBox.setValue(coa, 'name');
                });
            }
            else {
                base.coaComboBox.setValue(coa, '--None--');
            }
            var chartOfAccount = _this.ruleForm.controls['chartOfAccount'];
            chartOfAccount.patchValue(rule.chartOfAccount);
            var effectiveDate = _this.ruleForm.controls['effectiveDate'];
            effectiveDate.patchValue(rule.effectiveDate);
            var endDate = _this.ruleForm.controls['endDate'];
            endDate.patchValue(rule.endDate);
            var ruleName = _this.ruleForm.controls['ruleName'];
            ruleName.patchValue(rule.ruleName);
            var _loop_1 = function () {
                if (rule.conditions[i].attributeName == 'Title') {
                    var comparisionType = _this.ruleForm.controls['comparisionType'];
                    comparisionType.patchValue(rule.conditions[i].comparisionType);
                    var comparisionValue = _this.ruleForm.controls['comparisionValue'];
                    comparisionValue.patchValue(rule.conditions[i].comparisionValue);
                }
                else if (rule.conditions[i].attributeName == 'Vendor') {
                    var base_1 = _this;
                    var coa_1 = _.find(base_1.vendors, function (_coa) {
                        return _coa.id == rule.conditions[i].comparisionValue;
                    });
                    if (!_.isEmpty(coa_1) && (rule.conditions[i].comparisionValue != '--None--') || (rule.conditions[i].comparisionValue != '')) {
                        setTimeout(function () {
                            base_1.vendorCountryComboBox.setValue(coa_1, 'name');
                        });
                    }
                    else {
                        base_1.vendorCountryComboBox.setValue(coa_1, '--None--');
                    }
                }
                else if (rule.conditions[i].attributeName == 'Customer') {
                    var customer_1 = _.find(base.customernames, function (_customer) {
                        return _customer.customer_id == rule.conditions[i].comparisionValue;
                    });
                    if (!_.isEmpty(customer_1) && (rule.conditions[i].comparisionValue != '--None--') || (rule.conditions[i].comparisionValue != '')) {
                        setTimeout(function () {
                            base.selectedCOAComboBox.setValue(customer_1, 'customer_name');
                        });
                    }
                    else {
                        base.selectedCOAComboBox.setValue(customer_1, '--None--');
                    }
                }
                else if (rule.conditions[i].attributeName == 'Amount') {
                    var comparisionType1 = _this.ruleForm.controls['comparisionType1'];
                    comparisionType1.patchValue(rule.conditions[i].comparisionType);
                    var comparisionValue1 = _this.ruleForm.controls['comparisionValue1'];
                    comparisionValue1.patchValue(rule.conditions[i].comparisionValue);
                    if (rule.conditions[i].comparisionValue2) {
                        _this.hasAmount = true;
                        var comparisionValue2 = _this.ruleForm.controls['comparisionValue2'];
                        comparisionValue2.patchValue(rule.conditions[i].comparisionValue2);
                    }
                    else {
                        _this.hasAmount = false;
                    }
                }
                else if (rule.conditions[i].attributeName == 'Source') {
                    var source_1 = _.find(base.banks, function (_bank) {
                        return _bank.id == rule.conditions[i].comparisionValue;
                    });
                    if (!_.isEmpty(source_1) && (rule.conditions[i].comparisionValue != '--None--') || (rule.conditions[i].comparisionValue != '')) {
                        setTimeout(function () {
                            base.accountComboBox.setValue(source_1, 'name');
                        });
                    }
                    else {
                        base.accountComboBox.setValue(source_1, '--None--');
                    }
                }
                else {
                    console.log("end");
                }
            };
            for (var i = 0; i < rule.conditions.length; i++) {
                _loop_1();
            }
            _this._ruleForm.updateForm(_this.ruleForm, rule);
        }, function (error) { return _this.handleError(error); });
    };
    RulesComponent.prototype.getSourceName = function () {
        var data = this._ruleForm.getData(this.ruleForm);
        return data.sourceType;
    };
    RulesComponent.prototype.setDate = function (date) {
        var jeDateControl = this.ruleForm.controls['effectiveDate'];
        jeDateControl.patchValue(date);
    };
    RulesComponent.prototype.setEndDate = function (date) {
        var jeDateControl = this.ruleForm.controls['endDate'];
        jeDateControl.patchValue(date);
    };
    RulesComponent.prototype.isActionCOA = function (actionForm) {
        if (actionForm) {
            var data = this._actionForm.getData(actionForm);
            if (data.action == 'chartOfAccount') {
                return true;
            }
        }
        return false;
    };
    RulesComponent.prototype.isActionDimension = function (actionForm) {
        if (actionForm) {
            var data = this._actionForm.getData(actionForm);
            if (data.action == 'dimension') {
                return true;
            }
        }
        return false;
    };
    RulesComponent.prototype.cleanData = function (data) {
        delete data.attributeName;
        delete data.comparisionType;
        delete data.comparisionValue;
        delete data.logicalOperator;
        delete data.attributeName1;
        delete data.comparisionType1;
        delete data.vendorValue;
        delete data.customerValue;
        delete data.comparisionValue1;
        delete data.comparisionValue2;
        delete data.source;
        delete data.vendorValue;
        delete data.vendorType;
        delete data.customerValue;
        delete data.customerType;
        delete data.comparisionType;
        delete data.comparisionValue;
        delete data.logicalOperator;
        delete data.attributeName1;
        delete data.comparisionValue2;
        delete data.attributeName;
        return data;
    };
    RulesComponent.prototype.submit = function ($event, dateFlag) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._ruleForm.getData(this.ruleForm);
        this.companyId = Session_1.Session.getCurrentCompany();
        if (data.effectiveDate == "" || data.effectiveDate == null) {
            data.effectiveDate = this.todaysDate;
        }
        else {
            console.log("data.effectiveDate", data.effectiveDate);
        }
        data.effectiveDate = this.dateFormater.formatDate(data.effectiveDate, this.dateFormat, this.serviceDateformat);
        if (data.endDate) {
            data.endDate = this.dateFormater.formatDate(data.endDate, this.dateFormat, this.serviceDateformat);
        }
        if (this.editMode) {
            data.conditions = [];
            var condition1 = {};
            var condition2 = {};
            var condition3 = {};
            var condition4 = {};
            var condition5 = {};
            var condition6 = {};
            data.actions = this.selectedDimensions;
            var chartOfAccount = this.ruleForm.controls['chartOfAccount'];
            chartOfAccount.patchValue(chartOfAccount.value);
            var attributeName = this.ruleForm.controls['attributeName'];
            attributeName.patchValue(attributeName.value);
            var selectedAmountControl = this.ruleForm.controls['comparisionType'];
            selectedAmountControl.patchValue(selectedAmountControl.value);
            var selectedValueControl = this.ruleForm.controls['comparisionValue'];
            selectedValueControl.patchValue(selectedValueControl.value);
            var logicalOperator = this.ruleForm.controls['logicalOperator'];
            logicalOperator.patchValue(logicalOperator.value);
            condition1['attributeName'] = "Title";
            condition1['comparisionType'] = selectedAmountControl.value;
            condition1['comparisionValue'] = selectedValueControl.value;
            condition1['logicalOperator'] = logicalOperator.value;
            var conditionrow = data.conditions.push(condition1);
            var attributeName1 = this.ruleForm.controls['attributeName1'];
            attributeName1.patchValue(attributeName1.value);
            var selectedAmountControl1 = this.ruleForm.controls['comparisionType1'];
            selectedAmountControl1.patchValue(selectedAmountControl1.value);
            var selectedValueControl1 = this.ruleForm.controls['comparisionValue1'];
            selectedValueControl1.patchValue(selectedValueControl1.value);
            var comparisionValue2 = this.ruleForm.controls['comparisionValue2'];
            comparisionValue2.patchValue(comparisionValue2.value);
            condition2['attributeName'] = "Amount";
            condition2['comparisionType'] = selectedAmountControl1.value;
            condition2['comparisionValue'] = selectedValueControl1.value;
            condition2['comparisionValue2'] = comparisionValue2.value;
            var conditionrow2 = data.conditions.push(condition2);
            var vendorType = this.ruleForm.controls['vendorType'];
            vendorType.patchValue(vendorType.value);
            var vendor = this.ruleForm.controls['vendorValue'];
            vendor.patchValue(vendor.value);
            condition3['attributeName'] = "Vendor";
            condition3['comparisionType'] = "EQUALS_TO";
            condition3['comparisionValue'] = vendor.value;
            var conditionrow3 = data.conditions.push(condition3);
            var customerType = this.ruleForm.controls['customerType'];
            customerType.patchValue(customerType.value);
            var customer = this.ruleForm.controls['customerValue'];
            customer.patchValue(customer.value);
            condition4['attributeName'] = "Customer";
            condition4['comparisionType'] = "EQUALS_TO";
            condition4['comparisionValue'] = customer.value;
            var conditionrow4 = data.conditions.push(condition4);
            var source = this.ruleForm.controls['source'];
            source.patchValue(source.value);
            condition5['attributeName'] = "Source";
            condition5['comparisionType'] = "EQUALS_TO";
            condition5['comparisionValue'] = source.value;
            var conditionrow5 = data.conditions.push(condition5);
            data.id = this.row.id;
            console.log("data", data);
            this.cleanData(data);
            this.ruleservice.updateRule(data, this.companyId)
                .subscribe(function (success) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.showMessage(true, success);
                _this.selectedDimensions == [];
                _this.showFlyout = false;
            }, function (error) { return _this.showMessage(false, error); });
        }
        else {
            if (data.attributeName == null || data.comparisionType == null || data.comparisionValue == null || data.logicalOperator == null || data.attributeName1 || data.comparisionType1 == null || data.comparisionValue1 == null
                || data.vendorValue == null || data.customerValue == null || data.source == null) {
                delete data.attributeName;
                delete data.comparisionType;
                delete data.comparisionValue;
                delete data.logicalOperator;
                delete data.attributeName1;
                delete data.comparisionType1;
                delete data.vendorValue;
                delete data.customerValue;
                delete data.comparisionValue1;
                delete data.source;
            }
            data.conditions = [];
            var condition1 = {};
            var condition2 = {};
            var condition3 = {};
            var condition4 = {};
            var condition5 = {};
            var condition6 = {};
            data.actions = this.selectedDimensions;
            var chartOfAccount = this.ruleForm.controls['chartOfAccount'];
            chartOfAccount.patchValue(chartOfAccount.value);
            var attributeName = this.ruleForm.controls['attributeName'];
            attributeName.patchValue(attributeName.value);
            var selectedAmountControl = this.ruleForm.controls['comparisionType'];
            selectedAmountControl.patchValue(selectedAmountControl.value);
            var selectedValueControl = this.ruleForm.controls['comparisionValue'];
            selectedValueControl.patchValue(selectedValueControl.value);
            var logicalOperator = this.ruleForm.controls['logicalOperator'];
            logicalOperator.patchValue(logicalOperator.value);
            condition1['attributeName'] = "Title";
            condition1['comparisionType'] = selectedAmountControl.value;
            condition1['comparisionValue'] = selectedValueControl.value;
            condition1['logicalOperator'] = logicalOperator.value;
            var conditionrow = data.conditions.push(condition1);
            var attributeName1 = this.ruleForm.controls['attributeName1'];
            attributeName1.patchValue(attributeName1.value);
            var selectedAmountControl1 = this.ruleForm.controls['comparisionType1'];
            selectedAmountControl1.patchValue(selectedAmountControl1.value);
            var selectedValueControl1 = this.ruleForm.controls['comparisionValue1'];
            selectedValueControl1.patchValue(selectedValueControl1.value);
            var comparisionValue2 = this.ruleForm.controls['comparisionValue2'];
            comparisionValue2.patchValue(comparisionValue2.value);
            condition2['attributeName'] = "Amount";
            condition2['comparisionType'] = selectedAmountControl1.value;
            condition2['comparisionValue'] = selectedValueControl1.value;
            condition2['comparisionValue2'] = comparisionValue2.value;
            var conditionrow2 = data.conditions.push(condition2);
            var vendorType = this.ruleForm.controls['vendorType'];
            vendorType.patchValue(vendorType.value);
            var vendor = this.ruleForm.controls['vendorValue'];
            vendor.patchValue(vendor.value);
            condition3['attributeName'] = "Vendor";
            condition3['comparisionType'] = "EQUALS_TO";
            condition3['comparisionValue'] = vendor.value;
            var conditionrow3 = data.conditions.push(condition3);
            var customerType = this.ruleForm.controls['customerType'];
            customerType.patchValue(customerType.value);
            var customer = this.ruleForm.controls['customerValue'];
            customer.patchValue(customer.value);
            condition4['attributeName'] = "Customer";
            condition4['comparisionType'] = "EQUALS_TO";
            condition4['comparisionValue'] = customer.value;
            var conditionrow4 = data.conditions.push(condition4);
            var source = this.ruleForm.controls['source'];
            source.patchValue(source.value);
            condition5['attributeName'] = "Source";
            condition5['comparisionType'] = "EQUALS_TO";
            condition5['comparisionValue'] = source.value;
            var conditionrow5 = data.conditions.push(condition5);
            this.cleanData(data);
            this.ruleservice.addRule(data, this.companyId)
                .subscribe(function (success) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.showMessage(true, success);
                _this.selectedDimensions == [];
                _this.showFlyout = false;
            }, function (error) { return _this.showMessage(false, error); });
        }
    };
    RulesComponent.prototype.isDimensionSelected = function (dimensionName) {
        var selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        return selectedDimensionNames.indexOf(dimensionName) != -1;
    };
    RulesComponent.prototype.selectDimension = function ($event, dimensionName) {
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
    RulesComponent.prototype.selectValue = function ($event, dimension, value) {
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
    RulesComponent.prototype.isValueSelected = function (dimension, value) {
        var currentDimension = _.find(this.selectedDimensions, { 'name': dimension.name });
        if (!_.isEmpty(currentDimension)) {
            if (currentDimension.values.indexOf(value) != -1) {
                return true;
            }
            return false;
        }
        return false;
    };
    RulesComponent.prototype.ngOnInit = function () {
        var _this = this;
        var companyId = Session_1.Session.getCurrentCompany();
        var _form = this._ruleForm.getForm();
        _form['actions'] = this.actions;
        this.ruleForm = this._fb.group(_form);
        this.coaService.chartOfAccounts(companyId)
            .subscribe(function (chartOfAccounts) {
            _this.chartOfAccounts = chartOfAccounts;
            _.sortBy(_this.chartOfAccounts, ['number', 'name']);
        });
        this.dimensionService.dimensions(companyId)
            .subscribe(function (dimensions) {
            _this.dimensions = dimensions;
        });
    };
    return RulesComponent;
}());
__decorate([
    core_2.ViewChild('coaComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], RulesComponent.prototype, "coaComboBox", void 0);
__decorate([
    core_2.ViewChild('vendorCountryComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], RulesComponent.prototype, "vendorCountryComboBox", void 0);
__decorate([
    core_2.ViewChild('selectedCOAComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], RulesComponent.prototype, "selectedCOAComboBox", void 0);
__decorate([
    core_2.ViewChild("accountComboBoxDir"),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], RulesComponent.prototype, "accountComboBox", void 0);
RulesComponent = __decorate([
    core_1.Component({
        selector: 'rules',
        templateUrl: '/app/views/rules.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, Customers_service_1.CustomersService, SwitchBoard_1.SwitchBoard, Companies_service_1.CompaniesService, Toast_service_1.ToastService, forms_1.FormBuilder, Rules_service_1.RulesService, Rule_form_1.RuleForm, ChartOfAccounts_service_1.ChartOfAccountsService,
        DimensionService_service_1.DimensionService, PageTitle_1.pageTitleService, FinancialAccounts_service_1.FinancialAccountsService, Rule_form_1.RuleActionForm, LoadingService_1.LoadingService, DateFormatter_service_1.DateFormater])
], RulesComponent);
exports.RulesComponent = RulesComponent;
