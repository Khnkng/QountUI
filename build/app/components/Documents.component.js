/**
 * Created by seshagirivellanki on 14/04/17.
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
var router_1 = require("@angular/router");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Documents_service_1 = require("../services/Documents.service");
var DocumentsComponent = (function () {
    function DocumentsComponent(_router, _route, toastService, switchBoard, loadingService, companiesService, documentsService) {
        var _this = this;
        this._router = _router;
        this._route = _route;
        this.toastService = toastService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.companiesService = companiesService;
        this.documentsService = documentsService;
        this.tabBackground = "#d45945";
        this.selectedTabColor = "#d45945";
        this.tabDisplay = [{ 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }, { 'display': 'none' }];
        this.bgColors = [
            '#d45945',
            '#d47e47',
            '#2980b9',
            '#3dc36f'
        ];
        this.tableOptions = { search: true, pageSize: 7 };
        this.badges = [];
        this.selectedTab = 'deposits';
        this.isLoading = true;
        this.localBadges = {};
        this.hideBoxes = true;
        this.selectedColor = 'red-tab';
        this.hasReceipts = false;
        this.hasBills = false;
        this.hasRefunds = false;
        this.receiptsTableData = {};
        this.billsTableData = {};
        this.refundsTableData = {};
        this.companyId = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.companiesService.companies().subscribe(function (companies) {
            _this.allCompanies = companies;
            if (_this.companyId) {
                _this.currentCompany = _.find(_this.allCompanies, { id: _this.companyId });
            }
            else if (_this.allCompanies.length > 0) {
                _this.currentCompany = _.find(_this.allCompanies, { id: _this.allCompanies[0].id });
            }
            _this.routeSub = _this._route.params.subscribe(function (params) {
                if (params['tabId'] == 'receipts') {
                    _this.selectTab(0, "");
                }
                else if (params['tabId'] == 'bills') {
                    _this.selectTab(1, "");
                }
                else if (params['tabId'] == 'refunds') {
                    _this.selectTab(2, "");
                }
                else {
                    console.log("error");
                }
            });
        }, function (error) { return _this.handleError(error); });
    }
    DocumentsComponent.prototype.fetchReceipts = function () {
        var _this = this;
        this.documentsService.getDocumentBySource("unusedreceipt", "receipt").subscribe(function (docs) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.buildReceiptsTableData(docs);
        }, function (error) { });
    };
    DocumentsComponent.prototype.fetchBills = function () {
        var _this = this;
        this.documentsService.getDocumentBySource("unusedbill", "bill").subscribe(function (docs) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.buildBillsTableData(docs);
        }, function (error) { });
    };
    DocumentsComponent.prototype.fetchRefunds = function () {
        var _this = this;
        this.documentsService.getDocumentBySource("unusedrefund", "refund").subscribe(function (docs) {
            _this.loadingService.triggerLoadingEvent(false);
            _this.buildRefundsTableData(docs);
        }, function (error) { });
    };
    DocumentsComponent.prototype.selectTab = function (tabNo, color) {
        this.selectedTab = tabNo;
        this.selectedColor = color;
        var base = this;
        this.tabDisplay.forEach(function (tab, index) {
            base.tabDisplay[index] = { 'display': 'none' };
        });
        this.tabDisplay[tabNo] = { 'display': 'block' };
        this.tabBackground = this.bgColors[tabNo];
        this.loadingService.triggerLoadingEvent(true);
        if (this.selectedTab == 0) {
            this.isLoading = true;
            this.fetchReceipts();
            this.fetchBills();
            this.fetchRefunds();
        }
        else if (this.selectedTab == 1) {
            this.isLoading = true;
            this.fetchReceipts();
            this.fetchBills();
            this.fetchRefunds();
        }
        else if (this.selectedTab == 2) {
            this.isLoading = true;
            this.fetchReceipts();
            this.fetchBills();
            this.fetchRefunds();
        }
    };
    DocumentsComponent.prototype.buildReceiptsTableData = function (docs) {
        var base = this;
        this.isLoading = false;
        this.receiptsTableData.search = true;
        this.receiptsTableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = amount ? parseFloat(amount) : 0;
                    return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } },
            { "name": "category", "title": "Category" },
            { "name": "id", "title": "", 'visible': false, 'filterable': false },
            { "name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false }
        ];
        this.receiptsTableData.rows = [];
        docs.forEach(function (doc) {
            var row = {};
            row['id'] = doc.id;
            row['name'] = doc.name;
            row['amount'] = doc.amount;
            row['category'] = doc.category;
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.receiptsTableData.rows.push(row);
        });
        setTimeout(function () {
            if (base.receiptsTableData.rows.length > 0) {
                base.hasReceipts = true;
            }
        });
    };
    DocumentsComponent.prototype.buildBillsTableData = function (docs) {
        var base = this;
        this.isLoading = false;
        this.billsTableData.search = true;
        this.billsTableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = amount ? parseFloat(amount) : 0;
                    return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } },
            { "name": "category", "title": "Category" },
            { "name": "id", "title": "", 'visible': false, 'filterable': false },
            { "name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false }
        ];
        this.billsTableData.rows = [];
        docs.forEach(function (doc) {
            var row = {};
            row['id'] = doc.id;
            row['name'] = doc.name;
            row['description'] = doc.desc;
            row['image'] = "<img src='" + doc.temporaryURL + "' style='width:50px;height:50px;'/>";
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.billsTableData.rows.push(row);
        });
        setTimeout(function () {
            if (base.billsTableData.rows.length > 0) {
                base.hasBills = true;
            }
        });
    };
    DocumentsComponent.prototype.buildRefundsTableData = function (docs) {
        var base = this;
        this.isLoading = false;
        this.refundsTableData.search = true;
        this.refundsTableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "amount", "title": "Amount", "type": "number", "formatter": function (amount) {
                    amount = amount ? parseFloat(amount) : 0;
                    return amount.toLocaleString(base.companyCurrency, { style: 'currency', currency: base.companyCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } },
            { "name": "category", "title": "Category" },
            { "name": "id", "title": "", 'visible': false, 'filterable': false },
            { "name": "actions", "title": "", "type": "html", "sortable": false, "filterable": false }
        ];
        this.refundsTableData.rows = [];
        docs.forEach(function (doc) {
            var row = {};
            row['id'] = doc.id;
            row['name'] = doc.name;
            row['description'] = doc.desc;
            row['image'] = "<img src='" + doc.temporaryURL + "' style='width:50px;height:50px;'/>";
            row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a>";
            base.refundsTableData.rows.push(row);
        });
        setTimeout(function () {
            if (base.refundsTableData.rows.length > 0) {
                base.hasRefunds = true;
            }
        });
    };
    DocumentsComponent.prototype.ngOnInit = function () {
    };
    DocumentsComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        var sourceTypes = ['receipt', 'bill', 'refund'];
        if (action == 'edit') {
            var link = ['document', sourceTypes[this.selectedTab], $event.id];
            this._router.navigate(link);
        }
    };
    DocumentsComponent.prototype.updateTabHeight = function () {
        var base = this;
        var topOfDiv = jQuery('.tab-content').offset().top;
        topOfDiv = topOfDiv < 150 ? 170 : topOfDiv;
        var bottomOfVisibleWindow = Math.max(jQuery(document).height(), jQuery(window).height());
        base.tabHeight = (bottomOfVisibleWindow - topOfDiv - 25) + "px";
        jQuery('.tab-content').css('height', base.tabHeight);
        switch (this.selectedTab) {
            case 0:
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                break;
            case 1:
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                break;
            case 2:
                base.tableOptions.pageSize = Math.floor((bottomOfVisibleWindow - topOfDiv - 75) / 42) - 3;
                break;
        }
    };
    DocumentsComponent.prototype.ngAfterViewInit = function () {
        var base = this;
        jQuery(document).ready(function () {
            base.updateTabHeight();
        });
    };
    DocumentsComponent.prototype.reRoutePage = function (tabId) {
        if (tabId == 0) {
            var link = ['documents', 'receipts'];
            this._router.navigate(link);
            return;
        }
        else if (tabId == 1) {
            var link = ['documents', 'bills'];
            this._router.navigate(link);
            return;
        }
        else {
            var link = ['documents', 'refunds'];
            this._router.navigate(link);
            return;
        }
    };
    DocumentsComponent.prototype.handleError = function (error) {
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform action.");
    };
    DocumentsComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
    };
    return DocumentsComponent;
}());
DocumentsComponent = __decorate([
    core_1.Component({
        selector: 'employees',
        templateUrl: '/app/views/documents.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, router_1.ActivatedRoute,
        Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard, LoadingService_1.LoadingService, Companies_service_1.CompaniesService, Documents_service_1.DocumentService])
], DocumentsComponent);
exports.DocumentsComponent = DocumentsComponent;
