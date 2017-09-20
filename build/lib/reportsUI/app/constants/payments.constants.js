"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENTMETHOD = {
    ach: 'ACH',
    digitalCheque: 'Digital Check',
    'mailCheque': 'Check'
};
exports.PAYMENTSPATHS = {
    COMPANIES_PAYMENT_SERVICE: '/HalfService/user/:id/companies/:companyId/paymentInfo',
    BILLS_SERVICE: '/BigPayServices/user/:id/bills',
    BOX_SERVICE: '/BigPayServices/user/:id/boxInfo',
    BILL_SERVICE: '/BigPayServices/user/:id/companies/:companyID/bills/:billID',
    CREATE_BILL_SERVICE: '/BigPayServices/user/:id/companies/:companyID/bills2',
    CURRENCY_CONVERSION_SERVICE: '/HalfService/user/:userId/currency/convert?from=:from&to=:to&date=:date',
    DOCHUB_SERVICE_URL: 'https://dev-services.qount.io/DocumentServices',
    DOCHUB_SERVICE: '/:id/preview/dochub/file',
    DWOLLA_TRANSFER_FUND_SERVICE: '/CheckbookService/user/:id/companies/:company/checkbook/transferFunds',
    DWOLLA_CODE_SUBMISSION_SERVICE: '/CheckbookService/user/:id/companies/:company/dwolla',
    DWOLLA_FUNDING_SOURCES_SERVICE: '/CheckbookService/user/:id/companies/:company/dwolla/fundingSources',
    BIGPAY_WORKFLOW_SERVICE: '/Flows/user/:id/companies/:company/workflow',
    BIGPAY_SERVICE_URL: 'https://dev-services.qount.io',
    BILL_COMMENTS_SERVICE: '/BigPayServices/user/:userId/company/:companyID/bills/:billId/comments',
    DWOLLA_SERVICE_URL: 'https://dev-services.qount.io',
    WORKFLOW_SERVICE_URL: 'https://dev-services.qount.io',
    REPORT_SERVICE: '/BigPayServices/user/:id/companies/:companyID/report',
    REPORTS_SERVICE: '/ReportService/user/:userID/companies/:companyID/customReports/:reportType',
    REPORT_FILTER_SERVICE: '/AccountantReportsService/users/:id/companies/:companyId/reports/:reportType/filters',
    EMAIL_SERVICE: '/ReportService/report/pdf',
    EXCEL_SERVICE: '/ReportService/report/excel',
    PDF_SERVICE: '/ReportService/report/pdf',
    PDF_CREATE_SERVICE: '/ReportService/report/pdf',
    ACCOUNTANT_REPORT_SERVICE: "/AccountantReportsService/users/:id/companies/:companyID/report",
    ACCOUNTANT_METRIC_SERVICE: "/AccountantReportsService/users/:id/companies/:companyID/metrics"
};
