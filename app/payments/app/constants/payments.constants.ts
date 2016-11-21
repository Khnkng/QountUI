export const PAYMENTMETHOD={
    ach:'ACH',
    digitalCheque:'Digital Check',
    'mailCheque':'Check'
};

export const PAYMENTSPATHS={
    COMPANIES_PAYMENT_SERVICE: '/HalfService/user/:id/companies/:companyId/paymentInfo',
    BILLS_SERVICE: '/BigPayServices/user/:id/companies/:companyID/bills',
    BOX_SERVICE: '/BigPayServices/user/:id/boxInfo',
    BILL_SERVICE: '/BigPayServices/user/:id/companies/:companyID/bills/:billID',
    CREATE_BILL_SERVICE: '/BigPayServices/user/:id/companies/:companyID/bills',
    CURRENCY_CONVERSION_SERVICE:'/HalfService/user/:userId/currency/convert?from=:from&to=:to&date=:date',
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
    EMAIL_SERVICE:'/HalfService/report/pdf',
    EXCEL_SERVICE:'/HalfService/report/excel',
    PDF_CREATE_SERVICE:'https://dev-services.qount.io/HalfService/report/pdf'
};