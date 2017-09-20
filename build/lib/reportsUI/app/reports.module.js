/**
 * Created by seshu on 21-10-2016.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var share_module_1 = require("qCommon/app/share.module");
var CheckSessionActivator_1 = require("qCommon/app/services/CheckSessionActivator");
var Reports_component_1 = require("./components/Reports.component");
var APAgingReport_component_1 = require("./components/APAgingReport.component");
var TrailBalanceReportComponent_1 = require("./components/TrailBalanceReportComponent");
var APAgingDetails_1 = require("./components/APAgingDetails");
var VendorExpenseAmountsByPeriod_component_1 = require("./components/VendorExpenseAmountsByPeriod.component");
var VendorPaidUnpaidBills_compoenet_1 = require("./components/VendorPaidUnpaidBills.compoenet");
var VendorExpencesByExpenseType_component_1 = require("./components/VendorExpencesByExpenseType.component");
var BillPaymentHistory_component_1 = require("./components/BillPaymentHistory.component");
var ForeignCurrencyReport_component_1 = require("./components/ForeignCurrencyReport.component");
var PaymentRegister_component_1 = require("./components/PaymentRegister.component");
var customDatepicker_1 = require("./directives/customDatepicker");
var customDatepicker1_1 = require("./directives/customDatepicker1");
var DocHub_service_1 = require("./services/DocHub.service");
var Email_service_1 = require("./services/Email.service");
var Excel_service_1 = require("./services/Excel.service");
var Reports_service_1 = require("./services/Reports.service");
var ReportSearchCriteria_component_1 = require("./components/ReportSearchCriteria.component");
var IncomeStatement_Component_1 = require("./components/IncomeStatement.Component");
var IncomeDetailStatement_Component_1 = require("./components/IncomeDetailStatement.Component");
var BalanceSheetComponent_1 = require("./components/BalanceSheetComponent");
var DetailedBalanceSheet_Component_1 = require("./components/DetailedBalanceSheet.Component");
var CashFlowStatement_Component_1 = require("./components/CashFlowStatement.Component");
var ReportsModule = (function () {
    function ReportsModule() {
    }
    return ReportsModule;
}());
ReportsModule = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule, forms_1.FormsModule, forms_1.ReactiveFormsModule, share_module_1.ShareModule, router_1.RouterModule.forChild([
                { path: 'reports/dashboard', component: Reports_component_1.ReportsComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/ap-aging', component: APAgingReport_component_1.APAgingReportComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/trail-balance', component: TrailBalanceReportComponent_1.TrailBalanceReportComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/detailed-balance-sheet', component: DetailedBalanceSheet_Component_1.DetailedBalanceSheetComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/balance-sheet', component: BalanceSheetComponent_1.BalanceSheetComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/income-statement', component: IncomeStatement_Component_1.IncomeStatementComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/cashflow-statement', component: CashFlowStatement_Component_1.CashFlowStatement, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/income-detail-statement', component: IncomeDetailStatement_Component_1.IncomeDetailStatementComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/ap-aging-details', component: APAgingDetails_1.APAgingDetails, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/vendor-expense-amounts-by-period', component: VendorExpenseAmountsByPeriod_component_1.VendorExpenseAmountsByPeriod, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/vendor-paid-unpaid-bills', component: VendorPaidUnpaidBills_compoenet_1.VendorPaidUnpaidBills, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/bills-payment-history', component: BillPaymentHistory_component_1.BillPaymentHistory, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/vendor-expense-by-expense-type', component: VendorExpencesByExpenseType_component_1.VendorExpencesByExpenseType, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/foreign-currency-report', component: ForeignCurrencyReport_component_1.ForeignCurrencyReport, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'reports/payment-register-report', component: PaymentRegister_component_1.PaymentRegister, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
            ])],
        declarations: [Reports_component_1.ReportsComponent, APAgingReport_component_1.APAgingReportComponent, TrailBalanceReportComponent_1.TrailBalanceReportComponent, IncomeStatement_Component_1.IncomeStatementComponent, APAgingDetails_1.APAgingDetails,
            VendorExpenseAmountsByPeriod_component_1.VendorExpenseAmountsByPeriod, VendorPaidUnpaidBills_compoenet_1.VendorPaidUnpaidBills, BillPaymentHistory_component_1.BillPaymentHistory, VendorExpencesByExpenseType_component_1.VendorExpencesByExpenseType, ForeignCurrencyReport_component_1.ForeignCurrencyReport,
            PaymentRegister_component_1.PaymentRegister, customDatepicker_1.CustomDatepicker, customDatepicker1_1.CustomDatepicker1, ReportSearchCriteria_component_1.ReportsSearchCriteriaComponent, BalanceSheetComponent_1.BalanceSheetComponent, IncomeDetailStatement_Component_1.IncomeDetailStatementComponent,
            DetailedBalanceSheet_Component_1.DetailedBalanceSheetComponent, CashFlowStatement_Component_1.CashFlowStatement],
        exports: [router_1.RouterModule, Reports_component_1.ReportsComponent, APAgingReport_component_1.APAgingReportComponent, APAgingDetails_1.APAgingDetails, VendorExpenseAmountsByPeriod_component_1.VendorExpenseAmountsByPeriod, VendorPaidUnpaidBills_compoenet_1.VendorPaidUnpaidBills,
            BillPaymentHistory_component_1.BillPaymentHistory, VendorExpencesByExpenseType_component_1.VendorExpencesByExpenseType, ForeignCurrencyReport_component_1.ForeignCurrencyReport, PaymentRegister_component_1.PaymentRegister, ReportSearchCriteria_component_1.ReportsSearchCriteriaComponent],
        providers: [DocHub_service_1.DocHubService, Email_service_1.EmailService, Excel_service_1.ExcelService, Reports_service_1.ReportService],
        schemas: [core_1.CUSTOM_ELEMENTS_SCHEMA]
    })
], ReportsModule);
exports.ReportsModule = ReportsModule;
