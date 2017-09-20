"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVOICE_PATHS = {
    INVOICE_PREFERENCE: "/Invoices/users/:id/companies/:companyId/invoice/preference",
    INVOICE: "/Invoices/users/:id/companies/:companyId/invoice",
    INVOICE_BY_CLIENTID: "/Invoices/users/:id/companies/:companyId/invoice/client/:clientId",
    INVOICE_PAY: "/Invoices/invoices/:invoiceID",
    INVOICE_PAYMENTS: "/Invoices/users/:id/companies/:companyId/invoice/payment",
    INVOICE_DELETE: '/Invoices/users/:id/companies/:companyId/invoice/delete',
    INVOICE_SENT: '/Invoices/users/:id/companies/:companyId/invoice/sent',
    INVOICE_PAID: '/Invoices/users/:id/companies/:companyId/invoice/:invoiceId/state',
    INVOICE_DASHBOARD_BOX: '/Invoices/users/:id/companies/:companyId/invoice/metrics'
};
