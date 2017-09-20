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
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var COA_form_1 = require("../forms/COA.form");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_2 = require("qCommon/app/constants/Qount.constants");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var router_1 = require("@angular/router");
var ChartOfAccountsComponent = (function () {
    function ChartOfAccountsComponent(_fb, _coaForm, switchBoard, _router, coaService, loadingService, toastService, companiesService, numeralService, titleService) {
        var _this = this;
        this._fb = _fb;
        this._coaForm = _coaForm;
        this.switchBoard = switchBoard;
        this._router = _router;
        this.coaService = coaService;
        this.loadingService = loadingService;
        this.toastService = toastService;
        this.companiesService = companiesService;
        this.numeralService = numeralService;
        this.titleService = titleService;
        this.chartOfAccounts = [];
        this.newFormActive = true;
        this.categoryTypes = Qount_constants_1.COA_CATEGORY_TYPES;
        this.allSubTypes = Qount_constants_1.COA_SUBTYPES;
        this.descriptions = Qount_constants_1.SUBTYPE_DESCRIPTIONS;
        this.displaySubtypes = [];
        this.description = '';
        this.parentAccounts = [];
        this.subAccount = false;
        this.hasCOAList = false;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.coaColumns = ['name', 'id', 'parentID', 'subAccount', 'type', 'subType', 'desc', 'number', 'balance'];
        this.combo = true;
        this.sortingOrder = ["accountsReceivable", "bank", "otherCurrentAssets", "fixedAssets", "otherAssets", "accountsPayable", "creditCard", "otherCurrentLiabilities", "longTermLiabilities", "equity", "income", "otherIncome", "costOfGoodsSold", "expenses", "otherExpense", "costOfServices", "loansTo"];
        this.hasParentOrChild = false;
        this.hasChildren = false;
        this.showFlyout = false;
        this.localeFortmat = 'en-US';
        this.titleService.setPageTitle("CHART OF ACCOUNTS");
        this.coaForm = this._fb.group(_coaForm.getForm());
        var companyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteCOA(toast); });
        this.categoryTypes = _.sortBy(this.categoryTypes, ['name']);
        this.companiesService.companies().subscribe(function (companies) {
            _this.allCompanies = companies;
            if (companyId) {
                _this.currentCompany = _.find(_this.allCompanies, { id: companyId });
            }
            else if (_this.allCompanies.length > 0) {
                _this.currentCompany = _.find(_this.allCompanies, { id: _this.allCompanies[0].id });
            }
            _this.fetchChartOfAccountData();
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
    ChartOfAccountsComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    ChartOfAccountsComponent.prototype.fetchChartOfAccountData = function () {
        var _this = this;
        this.coaService.chartOfAccounts(this.currentCompany.id)
            .subscribe(function (chartOfAccounts) {
            _this.buildTableData(chartOfAccounts);
        }, function (error) { return _this.handleError(error); });
    };
    ChartOfAccountsComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    ChartOfAccountsComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_2.TOAST_TYPE.error, "Could not perform operation");
    };
    ChartOfAccountsComponent.prototype.getCategoryName = function (value) {
        var category = _.find(this.categoryTypes, function (categoryType) {
            return categoryType.value == value;
        });
        if (category) {
            return category.name;
        }
    };
    ChartOfAccountsComponent.prototype.getSubTypeName = function (categoryValue, value) {
        var subType = _.find(this.allSubTypes[categoryValue], function (subType) {
            return subType.value == value;
        });
        if (subType) {
            return subType.name;
        }
    };
    ChartOfAccountsComponent.prototype.populateSubtypes = function ($event) {
        var data = this._coaForm.getData(this.coaForm);
        if (this.editMode && data.parentID) {
            this.toastService.pop(Qount_constants_2.TOAST_TYPE.error, "Type cannot be changed for a child");
            $event && $event.preventDefault();
            return false;
        }
        var categoryType = $event.target.value;
        this.displaySubtypes = _.sortBy(this.allSubTypes[categoryType], ['name']);
        this.description = "";
        this.coaForm.controls['subType'].patchValue('');
        this.setParents(categoryType, data.id);
    };
    ChartOfAccountsComponent.prototype.setParents = function (categoryType, coaId) {
        if (categoryType) {
            this.parentAccounts = _.filter(this.chartOfAccounts, { type: categoryType });
            if (coaId) {
                this.removeChildren(coaId);
            }
            _.sortBy(this.parentAccounts, ['number', 'name']);
            this.refreshComboBox();
        }
    };
    ChartOfAccountsComponent.prototype.removeChildren = function (coaId) {
        var base = this;
        var children = this.getChildren(this.chartOfAccounts, coaId);
        _.remove(base.parentAccounts, { id: coaId });
        if (children.length > 0) {
            _.each(children, function (child) {
                _.remove(base.parentAccounts, { id: child.id });
                base.removeChildren(child.id);
            });
        }
    };
    ChartOfAccountsComponent.prototype.selectSubtype = function ($event) {
        this.description = this.descriptions[$event.target.value];
    };
    ChartOfAccountsComponent.prototype.showAddCOA = function () {
        this.titleService.setPageTitle("CREATE CHART OF ACCOUNT");
        this.editMode = false;
        this.coaForm = this._fb.group(this._coaForm.getForm());
        this.displaySubtypes = [];
        this.description = "";
        this.subAccount = false;
        this.hasParentOrChild = false;
        this.hasChildren = false;
        this.showFlyout = true;
    };
    ChartOfAccountsComponent.prototype.changeStatus = function () {
        var coaData = this._coaForm.getData(this.coaForm);
        if (coaData.subAccount) {
            this.subAccount = true;
        }
        else {
            this.subAccount = false;
        }
    };
    ChartOfAccountsComponent.prototype.showEditCOA = function (row) {
        var _this = this;
        var base = this;
        this.titleService.setPageTitle("UPDATE CHART OF ACCOUNT");
        this.loadingService.triggerLoadingEvent(true);
        this.coaService.getChartOfAccount(row.id, this.currentCompany.id).subscribe(function (coa) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.editMode = true;
            _this.showFlyout = true;
            _this.coaForm = _this._fb.group(_this._coaForm.getForm());
            _this.subAccount = Boolean(coa.subAccount);
            _this.displaySubtypes = _this.allSubTypes[coa.type];
            _this.description = _this.descriptions[coa.subType];
            _this.setParents(coa.type, coa.id);
            var parentIndex = _.findIndex(_this.parentAccounts, { id: coa.parentID });
            if (parentIndex != -1) {
                setTimeout(function () {
                    base.parentAccountComboBox.setValue(base.parentAccounts[parentIndex], 'name');
                }, 100);
            }
            _this.updateCOAStatus(coa);
            _this._coaForm.updateForm(_this.coaForm, coa);
        }, function (error) {
        });
    };
    ChartOfAccountsComponent.prototype.updateCOAStatus = function (coa) {
        this.hasParentOrChild = this.hasRelation(coa);
        this.hasChildren = false;
        var children = _.filter(this.chartOfAccounts, { 'parentID': coa.id });
        if (children.length > 0) {
            this.hasChildren = true;
        }
    };
    ChartOfAccountsComponent.prototype.hasRelation = function (coa) {
        var hasParentOrChild = false;
        if (coa.parentID != "" && coa.subAccount) {
            hasParentOrChild = true; //Child of another COA
        }
        else {
            var children = _.filter(this.chartOfAccounts, { 'parentID': coa.id });
            if (children.length > 0) {
                hasParentOrChild = true;
            }
        }
        return hasParentOrChild;
    };
    ChartOfAccountsComponent.prototype.deleteCOA = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.coaService.removeCOA(this.coaId, this.currentCompany.id)
            .subscribe(function (coa) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_2.TOAST_TYPE.success, "Chart of Account deleted successfully");
            _this.fetchChartOfAccountData();
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            if (error.message) {
                _this.toastService.pop(Qount_constants_2.TOAST_TYPE.error, error.message);
            }
            else {
                _this.toastService.pop(Qount_constants_2.TOAST_TYPE.error, "Failed to delete Chart of account");
            }
        });
    };
    ChartOfAccountsComponent.prototype.removeCOA = function (row) {
        this.coaId = row.id;
        this.toastService.pop(Qount_constants_2.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    ChartOfAccountsComponent.prototype.newForm = function () {
        var _this = this;
        this.newFormActive = false;
        setTimeout(function () { return _this.newFormActive = true; }, 0);
    };
    ChartOfAccountsComponent.prototype.refreshComboBox = function () {
        var base = this;
        this.combo = false;
        setTimeout(function () { return base.combo = true; }, 0);
    };
    ChartOfAccountsComponent.prototype.ngOnInit = function () {
    };
    ChartOfAccountsComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditCOA($event);
        }
        else if (action == 'delete') {
            this.removeCOA($event);
        }
    };
    ChartOfAccountsComponent.prototype.updateParent = function (parentCoa) {
        var coaData = this._coaForm.getData(this.coaForm);
        coaData.parentID = parentCoa.id;
        coaData.level = parentCoa.level + 1;
        this._coaForm.updateForm(this.coaForm, coaData);
    };
    ChartOfAccountsComponent.prototype.saveCOA = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._coaForm.getData(this.coaForm);
        if (!data.subAccount) {
            data.parentID = null;
            data.level = 0;
        }
        this.loadingService.triggerLoadingEvent(true);
        if (this.editMode) {
            this.coaService.updateCOA(data.id, data, this.currentCompany.id)
                .subscribe(function (coa) {
                base.hideFlyout();
                _this.loadingService.triggerLoadingEvent(false);
                base.toastService.pop(Qount_constants_2.TOAST_TYPE.success, "Chart of Account updated successfully");
                _this.fetchChartOfAccountData();
            }, function (error) { return _this.handleCOAError(error); });
        }
        else {
            this.coaService.addChartOfAccount(data, this.currentCompany.id)
                .subscribe(function (newCOA) {
                base.hideFlyout();
                _this.loadingService.triggerLoadingEvent(false);
                _this.toastService.pop(Qount_constants_2.TOAST_TYPE.success, "Chart of account created successfully");
                _this.fetchChartOfAccountData();
            }, function (error) { return _this.handleCOAError(error); });
        }
        this.buildTableData(this.chartOfAccounts);
    };
    ChartOfAccountsComponent.prototype.handleCOAError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        if (error && error.message) {
            this.toastService.pop(Qount_constants_2.TOAST_TYPE.error, error.message);
        }
        else {
            this.toastService.pop(Qount_constants_2.TOAST_TYPE.error, "Could not perform operation");
        }
    };
    ChartOfAccountsComponent.prototype.getMappingName = function (mappingValue) {
        var allMappings = [];
        _.each(this.mappings, function (mapping) {
            return allMappings.push(mapping);
        });
        var mapping = _.find(_.flatten(allMappings), { value: mappingValue });
        if (mapping) {
            return mapping.name;
        }
        return "";
    };
    ChartOfAccountsComponent.prototype.buildTableData = function (coaList) {
        this.titleService.setPageTitle("Chart Of Accounts");
        this.sortChartOfAccounts(coaList);
        this.hasCOAList = false;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "number", "title": "Number" },
            { "name": "name", "title": "Name" },
            { "name": "categoryType", "title": "Type" },
            { "name": "subTypeCode", "title": "Sub Type" },
            { "name": "parentName", "title": "Parent" },
            { "name": "balance", "title": "Balance", "type": "number", "formatter": function (balance) {
                    balance = parseFloat(balance);
                    return balance.toLocaleString(base.localeFortmat, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }, "sortValue": function (value) {
                    return base.numeralService.value(value);
                }, "classes": "currency-align currency-padding"
            },
            { "name": "type", "title": "Type", "visible": false },
            { "name": "subType", "title": "Sub type", "visible": false },
            { "name": "desc", "title": "Description", "visible": false },
            { "name": "id", "title": "COA ID", "visible": false },
            { "name": "parentID", "title": "Parent", "visible": false },
            { "name": "subAccount", "title": "Sub account", "visible": false },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        this.chartOfAccounts.forEach(function (coa) {
            var row = {};
            coa.subAccount = coa.subAccount ? coa.subAccount : false;
            _.each(base.coaColumns, function (key) {
                if (key == 'type') {
                    row[key] = coa[key];
                    row['categoryType'] = base.getCategoryName(coa[key]);
                }
                else if (key == 'subType') {
                    row[key] = coa[key];
                    row['subTypeCode'] = base.getSubTypeName(coa.type, coa[key]);
                }
                else if (key == 'parentID') {
                    row[key] = coa[key];
                    row['parentName'] = coa[key] ? _.find(base.chartOfAccounts, { id: coa[key] }).name : "";
                }
                else if (key == 'name') {
                    row[key] = coa[key];
                    if (coa['parentID']) {
                        row[key] = { options: {
                                classes: "coa-child-" + coa.level,
                                sortValue: base.getName(coa['parentID'])
                            }, value: coa[key] };
                    }
                    else {
                        row[key] = coa[key];
                    }
                }
                else if (key == 'number') {
                    if (coa['parentID']) {
                        row[key] = { options: {
                                classes: "coa-child-" + coa.level,
                                sortValue: base.getNumber(coa['parentID'])
                            }, value: coa[key]
                        };
                    }
                    else {
                        row[key] = coa[key];
                    }
                }
                else if (key == 'balance') {
                    row[key] = {
                        'options': {
                            "classes": "text-right"
                        },
                        value: coa[key]
                    };
                }
                else {
                    row[key] = coa[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
                if (!base.hasRelation(coa)) {
                    row['actions'] += "<a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
                }
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasCOAList = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    ChartOfAccountsComponent.prototype.getNumber = function (coaId) {
        var coa = _.find(this.chartOfAccounts, { id: coaId });
        return coa.number;
    };
    ChartOfAccountsComponent.prototype.getName = function (coaId) {
        var coa = _.find(this.chartOfAccounts, { id: coaId });
        return coa.name;
    };
    ChartOfAccountsComponent.prototype.getChildren = function (coaList, parentID) {
        var data = [];
        _.each(coaList, function (child) {
            if (child.parentID == parentID) {
                data.push(child);
            }
        });
        return data;
    };
    ChartOfAccountsComponent.prototype.addChildren = function (coaList, coa) {
        var base = this;
        var children = this.getChildren(coaList, coa.id);
        if (children.length == 0 && coa.subAccount) {
            return;
        }
        else {
            _.each(children, function (child) {
                child.level = coa.level + 1;
                base.chartOfAccounts.push(child);
                base.addChildren(coaList, child);
            });
        }
    };
    ChartOfAccountsComponent.prototype.sortChartOfAccounts = function (coaList) {
        var base = this;
        this.chartOfAccounts = [];
        coaList = _.sortBy(coaList, function (coa) {
            return base.sortingOrder.indexOf(coa.type);
        });
        var parents = _.filter(coaList, function (coa) {
            return !coa.parentID || coa.subAccount == false;
        });
        _.each(parents, function (parent) {
            parent.level = 0;
            base.chartOfAccounts.push(parent);
            base.addChildren(coaList, parent);
        });
    };
    ChartOfAccountsComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("CHART OF ACCOUNTS");
        this.showFlyout = !this.showFlyout;
    };
    return ChartOfAccountsComponent;
}());
__decorate([
    core_1.ViewChild('addCOA'),
    __metadata("design:type", Object)
], ChartOfAccountsComponent.prototype, "addCOA", void 0);
__decorate([
    core_1.ViewChild('parentAccountComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], ChartOfAccountsComponent.prototype, "parentAccountComboBox", void 0);
ChartOfAccountsComponent = __decorate([
    core_1.Component({
        selector: 'chart-of-accounts',
        templateUrl: '/app/views/chartOfAccounts.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, COA_form_1.COAForm, SwitchBoard_1.SwitchBoard, router_1.Router,
        ChartOfAccounts_service_1.ChartOfAccountsService, LoadingService_1.LoadingService,
        Toast_service_1.ToastService, Companies_service_1.CompaniesService, Numeral_service_1.NumeralService, PageTitle_1.pageTitleService])
], ChartOfAccountsComponent);
exports.ChartOfAccountsComponent = ChartOfAccountsComponent;
