/**
 * Created by seshagirivellanki on 13/02/17.
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
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Invoices_service_1 = require("../services/Invoices.service");
var InvoicesComponent = (function () {
    function InvoicesComponent(switchBoard, toastService, loadingService, invoiceService) {
        var _this = this;
        this.switchBoard = switchBoard;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.invoiceService = invoiceService;
        this.invoices = [];
        this.hasInvoices = false;
        this.tableData = {};
        this.tableOptions = {};
        this.tableColumns = ['name', 'id', 'payment_coa_mapping', 'invoice_coa_mapping', 'desc'];
        var companyId = Session_1.Session.getCurrentCompany();
        this.invoiceService.invoices().subscribe(function (invoices) {
            debugger;
            _this.invoices = invoices;
        }, function (error) { return _this.handleError(error); });
    }
    InvoicesComponent.prototype.handleError = function (error) {
        this.row = {};
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not perform operation");
    };
    InvoicesComponent.prototype.ngOnInit = function () {
    };
    InvoicesComponent.prototype.handleAction = function ($event) {
        var action = $event.action;
        delete $event.action;
        delete $event.actions;
        if (action == 'edit') {
        }
        else if (action == 'delete') {
        }
    };
    InvoicesComponent.prototype.buildTableData = function (invoices) {
        this.hasInvoices = false;
        this.invoices = invoices;
        this.tableData.rows = [];
        this.tableOptions.search = true;
        this.tableOptions.pageSize = 9;
        this.tableData.columns = [
            { "name": "name", "title": "Name" },
            { "name": "desc", "title": "Description" },
            { "name": "paymentCOAName", "title": "Payment COA" },
            { "name": "payment_coa_mapping", "title": "payment COA id", "visible": false },
            { "name": "invoiceCOAName", "title": "Invoice COA" },
            { "name": "invoice_coa_mapping", "title": "invoice COA id", "visible": false },
            { "name": "companyID", "title": "Company ID", "visible": false },
            { "name": "id", "title": "Id", "visible": false },
            { "name": "actions", "title": "" }
        ];
        var base = this;
        invoices.forEach(function (invoice) {
            var row = {};
            _.each(base.tableColumns, function (key) {
                row[key] = invoice[key];
                row['actions'] = "<a class='action' data-action='edit' style='margin:0px 0px 0px 5px;'><i class='icon ion-edit'></i></a><a class='action' data-action='delete' style='margin:0px 0px 0px 5px;'><i class='icon ion-trash-b'></i></a>";
            });
            base.tableData.rows.push(row);
        });
        setTimeout(function () {
            base.hasInvoices = true;
        }, 0);
    };
    return InvoicesComponent;
}());
InvoicesComponent = __decorate([
    core_1.Component({
        selector: 'itemcodes',
        templateUrl: '/app/views/itemCodes.html',
    }),
    __metadata("design:paramtypes", [SwitchBoard_1.SwitchBoard,
        Toast_service_1.ToastService, LoadingService_1.LoadingService,
        Invoices_service_1.InvoicesService])
], InvoicesComponent);
exports.InvoicesComponent = InvoicesComponent;
