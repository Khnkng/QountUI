"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENTMETHOD = {
    ach: 'ACH',
    digitalCheque: 'Digital Check',
    'mailCheque': 'Physical Check'
};
exports.PAYMENTSPATHS = {
    COMPANIES_PAYMENT_SERVICE: '/HalfService/user/:id/companies/:companyId/paymentInfo',
    BILLS_SERVICE: '/BigPayServices/user/:id/companies/:companyID/bills',
    CREDITS_SERVICE: '/BigPayServices/user/:id/companies/:companyID/credits',
    BOX_SERVICE: '/BigPayServices/user/:id/boxInfo',
    BILL_SERVICE: '/BigPayServices/user/:id/companies/:companyID/bills/:billID',
    CREDIT_SERVICE: '/BigPayServices/user/:id/companies/:companyID/credits/:creditID',
    CREATE_BILL_SERVICE: '/BigPayServices/user/:id/companies/:companyID/bills',
    CREATE_CREDIT_SERVICE: '/BigPayServices/user/:id/companies/:companyID/credits',
    CURRENCY_CONVERSION_SERVICE: '/HalfService/user/:userId/currency/convert?from=:from&to=:to&date=:date',
    DOCHUB_SERVICE_URL: 'https://dev-services.qount.io/DocumentServices',
    DOCHUB_SERVICE: '/:id/preview/dochub/file',
    DWOLLA_TRANSFER_FUND_SERVICE: '/CheckbookService/user/:id/companies/:company/checkbook/transferFunds',
    DWOLLA_CODE_SUBMISSION_SERVICE: '/CheckbookService/user/:id/companies/:company/dwolla',
    DWOLLA_FUNDING_SOURCES_SERVICE: '/CheckbookService/user/:id/companies/:company/dwolla/fundingSources',
    BIGPAY_WORKFLOW_SERVICE: '/Flows/user/:id/companies/:company/workflow2',
    BIGPAY_SERVICE_URL: 'https://dev-services.qount.io',
    BILL_COMMENTS_SERVICE: '/BigPayServices/user/:userId/company/:companyID/bills/:billId/comments',
    DWOLLA_SERVICE_URL: 'https://dev-services.qount.io',
    WORKFLOW_SERVICE_URL: 'https://dev-services.qount.io',
    REPORT_SERVICE: '/BigPayServices/user/:id/companies/:companyID/report',
    REPORTS_SERVICE: '/ReportService/user/:userID/companies/:companyID/customReports/:reportType',
    EMAIL_SERVICE: '/HalfService/report/pdf',
    EXCEL_SERVICE: '/HalfService/report/excel',
    PDF_CREATE_SERVICE: 'https://dev-services.qount.io/HalfService/report/pdf',
    MULTI_PAYMENT_SERVICE: '/BigPayServices/user/:id/companies/:companyID/payments',
    BILL_LINE_SERVICE: '/BigPayServices/user/:id/companies/:companyId/bills/:billID/billLines',
    _1099_SERVICE: '/1099Service/1099',
    CURRENCY_CONVERT_SERVICE: '/HalfService/user/:id/currency/convert',
    COMPANY_ACCOUNTS_SERVICE: '/BooksServices/users/:id/companies/:companyId/accounts',
    MARK_PAID: '/BigPayServices/user/:id/companies/:companyID/bills?markPaid=true'
};
