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
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var CodesService_service_1 = require("qCommon/app/services/CodesService.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var ItemCode_form_1 = require("../forms/ItemCode.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var router_1 = require("@angular/router");
var ItemCodesComponent = (function () {
    function ItemCodesComponent(_fb, _itemCodeForm, switchBoard, _router, codeService, toastService, loadingService, coaService, companiesService, titleService) {
        var _this = this;
        this._fb = _fb;
        this._itemCodeForm = _itemCodeForm;
        this.switchBoard = switchBoard;
        this._router = _router;
        this.codeService = codeService;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.coaService = coaService;
        this.companiesService = companiesService;
        this.titleService = titleService;
        this.itemCodes = [];
        this.paymentChartOfAccounts = [];
        this.invoiceChartOfAccounts = [];
        this.newFormActive = true;
        this.hasItemCodes = false;
        this.tableData = {};
        this.tableOptions = {};
        this.editMode = false;
        this.tableColumns = ['name', 'id', 'payment_coa_mapping', 'invoice_coa_mapping', 'desc'];
        this.combo = true;
        this.allCOAList = [];
        this.showFlyout = false;
        this.titleService.setPageTitle("Item Codes");
        this.itemcodeForm = this._fb.group(_itemCodeForm.getForm());
        this.confirmSubscription = this.switchBoard.onToastConfirm.subscribe(function (toast) { return _this.deleteItemCode(toast); });
        var companyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.loadingService.triggerLoadingEvent(true);
        this.companiesService.companies().subscribe(function (companies) {
            _this.allCompanies = companies;
            if (companyId) {
                _this.currentCompany = _.find(_this.allCompanies, { id: companyId });
            }
            else if (_this.allCompanies.length > 0) {
                _this.currentCompany = _.find(_this.allCompanies, { id: _this.allCompanies[0].id });
            }
            _this.coaService.chartOfAccounts(_this.currentCompany.id)
                .subscribe(function (chartOfAccounts) {
                _this.filterChartOfAccounts(chartOfAccounts);
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
    ItemCodesComponent.prototype.toolsRedirect = function () {
        var link = ['tools'];
        this._router.navigate(link);
    };
    ItemCodesComponent.prototype.ngOnDestroy = function () {
        this.routeSubscribe.unsubscribe();
        this.confirmSubscription.unsubscribe();
    };
    ItemCodesComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.row = {};
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    ItemCodesComponent.prototype.filterChartOfAccounts = function (chartOfAccounts) {
        var _this = this;
        this.allCOAList = chartOfAccounts;
        this.paymentChartOfAccounts = _.filter(chartOfAccounts, function (coa) {
            return coa.category == 'Expenses';
        });
        this.invoiceChartOfAccounts = _.filter(chartOfAccounts, function (coa) {
            return coa.category == 'Income' || coa.category == 'Revenue';
        });
        _.sortBy(this.paymentChartOfAccounts, ['number', 'name']);
        _.sortBy(this.invoiceChartOfAccounts, ['number', 'name']);
        this.codeService.itemCodes(this.currentCompany.id)
            .subscribe(function (itemCodes) { return _this.buildTableData(itemCodes); }, function (error) { return _this.handleError(error); });
    };
    ItemCodesComponent.prototype.isValid = function (itemcodeForm) {
        var data = this._itemCodeForm.getData(itemcodeForm);
        if (data.payment_coa_mapping || data.invoice_coa_mapping) {
            return itemcodeForm.valid;
        }
        return false;
    };
    ItemCodesComponent.prototype.showAddItemCode = function () {
        this.titleService.setPageTitle("CREATE ITEM CODE");
        this.editMode = false;
        this.itemcodeForm = this._fb.group(this._itemCodeForm.getForm());
        this.newForm();
        this.showFlyout = true;
    };
    ItemCodesComponent.prototype.showEditItemCode = function (row) {
        var _this = this;
        this.titleService.setPageTitle("UPDATE ITEM CODE");
        this.loadingService.triggerLoadingEvent(true);
        this.codeService.getItemCode(row.id)
            .subscribe(function (item) {
            _this.row = item;
            var paymentCOAIndex = _.findIndex(_this.paymentChartOfAccounts, function (coa) {
                return coa.id == row.payment_coa_mapping;
            });
            var invoiceCOAIndex = _.findIndex(_this.invoiceChartOfAccounts, function (coa) {
                return coa.id == row.invoice_coa_mapping;
            });
            setTimeout(function () {
                base.paymentCOAComboBox.setValue(base.paymentChartOfAccounts[paymentCOAIndex], 'name');
                base.invoiceCOAComboBox.setValue(base.invoiceChartOfAccounts[invoiceCOAIndex], 'name');
            }, 0);
            var isService = _this.itemcodeForm.controls['is_service'];
            isService.patchValue(item.is_service);
            var deferredRevenue = _this.itemcodeForm.controls['deferredRevenue'];
            deferredRevenue.patchValue(item.deferredRevenue);
            _this._itemCodeForm.updateForm(_this.itemcodeForm, item);
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { return _this.handleError(error); });
        var base = this;
        this.editMode = true;
        this.newForm();
        this.showFlyout = true;
    };
    ItemCodesComponent.prototype.deleteItemCode = function (toast) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.codeService.removeItemCode(this.itemCodeId)
            .subscribe(function (coa) {
            // this.loadingService.triggerLoadingEvent(false);
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Item code deleted successfully");
            //this.itemCodes.splice(_.findIndex(this.itemCodes, {id: this.itemCodeId}, 1));
            _this.codeService.itemCodes(_this.currentCompany.id)
                .subscribe(function (itemCodes) { return _this.buildTableData(itemCodes); }, function (error) { return _this.handleError(error); });
        }, function (error) { return _this.handleError(error); });
    };
    ItemCodesComponent.prototype.removeItemCode = function (row) {
        this.itemCodeId = row.id;
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.confirm, "Are you sure you want to delete?");
    };
    ItemCodesComponent.prototype.newForm = function () {
        var _this = this;
        this.newFormActive = false;
        setTimeout(function () { return _this.newFormActive = true; }, 0);
    };
    ItemCodesComponent.prototype.updatePaymentCOA = function (paymentCOA) {
        var data = this._itemCodeForm.getData(this.itemcodeForm);
        if (paymentCOA && paymentCOA.id) {
            data.payment_coa_mapping = paymentCOA.id;
        }
        else if (!paymentCOA || paymentCOA == '--None--') {
            data.payment_coa_mapping = '--None--';
        }
        this._itemCodeForm.updateForm(this.itemcodeForm, data);
    };
    ItemCodesComponent.prototype.updateInvoiceCOA = function (invoiceCOA) {
        var data = this._itemCodeForm.getData(this.itemcodeForm);
        if (invoiceCOA && invoiceCOA.id) {
            data.invoice_coa_mapping = invoiceCOA.id;
        }
        else if (!invoiceCOA || invoiceCOA == '--None--') {
            data.invoice_coa_mapping = '--None--';
        }
        this._itemCodeForm.updateForm(this.itemcodeForm, data);
    };
    ItemCodesComponent.prototype.ngOnInit = function () {
    };
    ItemCodesComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
            this.showEditItemCode($event);
        }
        else if (action == 'delete') {
            this.removeItemCode($event);
        }
    };
    ItemCodesComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var data = this._itemCodeForm.getData(this.itemcodeForm);
        if (data.payment_coa_mapping == '--None--' || data.payment_coa_mapping == '') {
            data.payment_coa_mapping = null;
        }
        if (data.invoice_coa_mapping == '--None--' || data.invoice_coa_mapping == '') {
            data.invoice_coa_mapping = null;
        }
        if (!data.payment_coa_mapping && !data.invoice_coa_mapping) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select payment COA or invoice COA");
            return;
        }
        this.loadingService.triggerLoadingEvent(true);
        if (this.editMode) {
            data.id = this.row.id;
            data.companyID = this.currentCompany.id;
            this.codeService.updateItemCode(data)
                .subscribe(function (itemCode) {
                //base.loadingService.triggerLoadingEvent(false);
                base.row = {};
                base.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "ItemCode updated successfully");
                var index = _.findIndex(base.itemCodes, { id: data.id });
                base.itemCodes[index] = itemCode;
                base.buildTableData(base.itemCodes);
                _this.showFlyout = false;
            }, function (error) { return _this.handleError(error); });
        }
        else {
            data.companyID = this.currentCompany.id;
            this.codeService.addItemCode(data)
                .subscribe(function (newItemcode) {
                //this.loadingService.triggerLoadingEvent(false);
                _this.handleItemCode(newItemcode);
                _this.showFlyout = false;
            }, function (error) { return _this.handleError(error); });
        }
        //this.buildTableData(this.itemCodes);
    };
    ItemCodesComponent.prototype.handleItemCode = function (newItemCode) {
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "ItemCode created successfully");
        this.itemCodes.push(newItemCode);
        this.buildTableData(this.itemCodes);
    };
    ItemCodesComponent.prototype.buildTableData = function (itemCodes) {
        this.hasItemCodes = false;
        this.itemCodes = itemCodes;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "name", "title": "Name", "visible": false },
            { "name": "name", "title": "Name" },
            { "name": "paymentCOAName", "title": "Payment COA" },
            { "name": "payment_coa_mapping", "title": "payment COA id", "visible": false },
            { "name": "invoiceCOAName", "title": "Invoice COA" },
            { "name": "invoice_coa_mapping", "title": "invoice COA id", "visible": false },
            { "name": "companyID", "title": "Company ID", "visible": false },
            { "name": "id", "title": "Id", "visible": false },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        itemCodes.forEach(function (itemCode) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                if (key == 'payment_coa_mapping') {
                    row['paymentCOAName'] = base.getCOAName(itemCode[key]);
                    row[key] = itemCode[key];
                }
                else if (key == 'invoice_coa_mapping') {
                    row['invoiceCOAName'] = base.getCOAName(itemCode[key]);
                    row[key] = itemCode[key];
                }
                else {
                    row[key] = itemCode[key];
                }
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasItemCodes = true;
        }, 0);
        this.loadingService.triggerLoadingEvent(false);
    };
    ItemCodesComponent.prototype.getCOAName = function (coaId) {
        var coa = _.find(this.allCOAList, function (coa) {
            return coa.id == coaId;
        });
        if (coa) {
            return coa.name;
        }
        return "";
    };
    ItemCodesComponent.prototype.hideFlyout = function () {
        this.titleService.setPageTitle("Item Codes");
        this.row = {};
        this.showFlyout = !this.showFlyout;
    };
    return ItemCodesComponent;
}());
__decorate([
    core_1.ViewChild('addItemcode'),
    __metadata("design:type", Object)
], ItemCodesComponent.prototype, "addItemcode", void 0);
__decorate([
    core_1.ViewChild('paymentCOAComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], ItemCodesComponent.prototype, "paymentCOAComboBox", void 0);
__decorate([
    core_1.ViewChild('invoiceCOAComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], ItemCodesComponent.prototype, "invoiceCOAComboBox", void 0);
ItemCodesComponent = __decorate([
    core_1.Component({
        selector: 'itemcodes',
        templateUrl: '/app/views/itemCodes.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, ItemCode_form_1.ItemCodeForm, SwitchBoard_1.SwitchBoard, router_1.Router,
        CodesService_service_1.CodesService, Toast_service_1.ToastService, LoadingService_1.LoadingService,
        ChartOfAccounts_service_1.ChartOfAccountsService, Companies_service_1.CompaniesService, PageTitle_1.pageTitleService])
], ItemCodesComponent);
exports.ItemCodesComponent = ItemCodesComponent;
