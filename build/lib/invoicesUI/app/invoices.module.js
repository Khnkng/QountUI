"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var share_module_1 = require("qCommon/app/share.module");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var CheckSessionActivator_1 = require("qCommon/app/services/CheckSessionActivator");
var customDatepicker_1 = require("./directives/customDatepicker");
var InvoiceSettings_component_1 = require("./components/InvoiceSettings.component");
var InvoiceSettings_form_1 = require("./forms/InvoiceSettings.form");
var Invoices_service_1 = require("./services/Invoices.service");
var InvoiceDashboard_component_1 = require("./components/InvoiceDashboard.component");
var Invoice_component_1 = require("./components/Invoice.component");
var Invoice_form_1 = require("./forms/Invoice.form");
var InvoiceLine_form_1 = require("./forms/InvoiceLine.form");
var invoices_component_1 = require("./components/invoices.component");
var customDatepicker1_1 = require("./directives/customDatepicker1");
var invoicePay_component_1 = require("./components/invoicePay.component");
var DashBoardActivator_1 = require("qCommon/app/services/DashBoardActivator");
var invoiceAddPayment_component_1 = require("./components/invoiceAddPayment.component");
var invoicePayment_form_1 = require("./forms/invoicePayment.form");
var AddPaymentToInvoice_component_1 = require("./components/AddPaymentToInvoice.component");
var InvoicePaymentPreview_component_1 = require("./components/InvoicePaymentPreview.component");
var InvoicesModule = (function () {
    function InvoicesModule() {
    }
    return InvoicesModule;
}());
InvoicesModule = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule, forms_1.FormsModule, forms_1.ReactiveFormsModule, share_module_1.ShareModule, router_1.RouterModule.forChild([
                { path: 'invoices/dashboard/:tabId', component: InvoiceDashboard_component_1.InvoiceDashboardComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'invoices/edit/:invoiceID', component: Invoice_component_1.InvoiceComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'invoices/duplicate/:invoiceID', component: Invoice_component_1.InvoiceComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'invoices/NewInvoice', component: Invoice_component_1.InvoiceComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'invoices/', component: invoices_component_1.InvoicesComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'invoices/invoiceSettings', component: InvoiceSettings_component_1.InvoiceSettingsComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'invoices/addPayment', component: invoiceAddPayment_component_1.InvoiceAddPaymentComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payments/edit/:paymentID', component: invoiceAddPayment_component_1.InvoiceAddPaymentComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payment/invoices/:invoiceID', component: invoicePay_component_1.InvoicePayComponent, canActivate: [DashBoardActivator_1.DashBoardActivator] },
                { path: 'invoices/:invoiceID', component: AddPaymentToInvoice_component_1.InvoiceAddPayment, canActivate: [CheckSessionActivator_1.LoggedInActivator] }
            ])],
        declarations: [customDatepicker_1.InvoiceCustomDatepicker, customDatepicker1_1.CustomDatepicker1, InvoiceSettings_component_1.InvoiceSettingsComponent, InvoiceDashboard_component_1.InvoiceDashboardComponent,
            Invoice_component_1.InvoiceComponent, invoices_component_1.InvoicesComponent, customDatepicker_1.InvoiceCustomDatepicker, invoicePay_component_1.InvoicePayComponent, invoiceAddPayment_component_1.InvoiceAddPaymentComponent,
            AddPaymentToInvoice_component_1.InvoiceAddPayment, InvoicePaymentPreview_component_1.InvoicePaymentPreview],
        exports: [router_1.RouterModule, customDatepicker1_1.CustomDatepicker1],
        providers: [InvoiceSettings_form_1.InvoiceSettingsForm, Invoices_service_1.InvoicesService, Invoice_form_1.InvoiceForm, InvoiceLine_form_1.InvoiceLineForm, InvoiceLine_form_1.InvoiceLineTaxesForm, invoicePayment_form_1.InvoicePaymentForm],
        schemas: [core_1.CUSTOM_ELEMENTS_SCHEMA]
    })
], InvoicesModule);
exports.InvoicesModule = InvoicesModule;
