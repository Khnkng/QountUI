/**
 * Created by seshu on 15-10-2016.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var share_module_1 = require("qCommon/app/share.module");
var paidtable_component_1 = require("./components/paidtable.component");
var paymentdashboard_component_1 = require("./components/paymentdashboard.component");
var reports_module_1 = require("reportsUI/app/reports.module");
var CheckSessionActivator_1 = require("qCommon/app/services/CheckSessionActivator");
var AddCompany_component_1 = require("qCommon/app/components/AddCompany.component");
var Companies_component_1 = require("qCommon/app/components/Companies.component");
var taxes_component_1 = require("./components/taxes.component");
var Verification_component_1 = require("./components/Verification.component");
var paymentstable_component_1 = require("./components/paymentstable.component");
var Company_component_1 = require("qCommon/app/components/Company.component");
var platform_browser_1 = require("@angular/platform-browser");
var app_component_1 = require("./components/app.component");
var router_1 = require("@angular/router");
var Header_component_1 = require("./components/Header.component");
var SideBar_component_1 = require("./components/SideBar.component");
var forms_1 = require("@angular/forms");
var canvas_component_1 = require("./components/canvas.component");
var http_1 = require("@angular/http");
var LogIn_component_1 = require("./components/LogIn.component");
var SignUp_component_1 = require("./components/SignUp.component");
var common_1 = require("@angular/common");
var SignUp_service_1 = require("./services/SignUp.service");
var Login_form_1 = require("./forms/Login.form");
var SignUp_form_1 = require("./forms/SignUp.form");
var Taxes_form_1 = require("./forms/Taxes.form");
var lock_form_1 = require("./forms/lock.form");
var verify_form_1 = require("./forms/verify.form");
var ForgotPassword_form_1 = require("./forms/ForgotPassword.form");
var Vendors_component_1 = require("./components/Vendors.component");
var UserProfile_component_1 = require("qCommon/app/components/UserProfile.component");
var ChartOfAccounts_component_1 = require("./components/ChartOfAccounts.component");
var COA_form_1 = require("./forms/COA.form");
var DashBoardActivator_1 = require("qCommon/app/services/DashBoardActivator");
var Tools_component_1 = require("./components/Tools.component");
var ItemCodes_component_1 = require("./components/ItemCodes.component");
var ItemCode_form_1 = require("./forms/ItemCode.form");
var Books_component_1 = require("./components/Books.component");
var JournalEntry_component_1 = require("./components/JournalEntry.component");
var JournalEntry_form_1 = require("./forms/JournalEntry.form");
var ExpenseCodes_form_1 = require("./forms/ExpenseCodes.form");
var payments_module_1 = require("billsUI/app/payments.module");
var invoices_module_1 = require("invoicesUI/app/invoices.module");
var Rules_service_1 = require("qCommon/app/services/Rules.service");
var ExpensesCodes_component_1 = require("./components/ExpensesCodes.component");
var Categorization_component_1 = require("./components/Categorization.component");
var Customers_component_1 = require("./components/Customers.component");
var Customers_form_1 = require("./forms/Customers.form");
var Dimensions_component_1 = require("./components/Dimensions.component");
var Dimension_form_1 = require("./forms/Dimension.form");
var Users_component_1 = require("./components/Users.component");
var Users_form_1 = require("./forms/Users.form");
var switchCompanies_component_1 = require("./components/switchCompanies.component");
var CurrentCompany_component_1 = require("./components/CurrentCompany.component");
var FinancialAccounts_component_1 = require("./components/FinancialAccounts.component");
var FinancialAccount_form_1 = require("./forms/FinancialAccount.form");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Loading_component_1 = require("qCommon/app/components/Loading.component");
var OffCanvasMenu_component_1 = require("./components/OffCanvasMenu.component");
var modules_component_1 = require("./components/modules.component");
var Modules_service_1 = require("./services/Modules.service");
var changePassword_component_1 = require("./components/changePassword.component");
var TermsAndConditions_component_1 = require("./components/TermsAndConditions.component");
var resetpassword_component_1 = require("./components/resetpassword.component");
var Rules_component_1 = require("./components/Rules.component");
var lock_component_1 = require("./components/lock.component");
var Rule_form_1 = require("./forms/Rule.form");
var Expense_component_1 = require("./components/Expense.component");
var Expenses_form_1 = require("./forms/Expenses.form");
var Deposit_component_1 = require("./components/Deposit.component");
var Deposits_form_1 = require("./forms/Deposits.form");
var Deposits_form_2 = require("./forms/Deposits.form");
var Employees_component_1 = require("./components/Employees.component");
var Employees_form_1 = require("./forms/Employees.form");
var payments_component_1 = require("./components/payments.component");
var Yodlee_service_1 = require("./services/Yodlee.service");
var YodleeToken_component_1 = require("./components/YodleeToken.component");
var Search_component_1 = require("./components/Search.component");
var SearchResults_component_1 = require("./components/SearchResults.component");
var Reconsile_component_1 = require("./components/Reconsile.component");
var Reconsile_form_1 = require("./forms/Reconsile.form");
var Reconsile_service_1 = require("./services/Reconsile.service");
var Documents_component_1 = require("./components/Documents.component");
var Documents_service_1 = require("./services/Documents.service");
var Document_component_1 = require("./components/Document.component");
var Budget_component_1 = require("./components/Budget.component");
var Budget_form_1 = require("./forms/Budget.form");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var PaymentsPlanComponent_1 = require("./components/PaymentsPlanComponent");
var PaymentsPlan_form_1 = require("./forms/PaymentsPlan.form");
var APP_BASE = { provide: common_1.APP_BASE_HREF, useValue: '/' };
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule, forms_1.FormsModule, common_1.CommonModule, forms_1.ReactiveFormsModule, share_module_1.ShareModule, http_1.HttpModule, router_1.RouterModule.forRoot([
                {
                    path: '',
                    redirectTo: 'books/dashboard',
                    pathMatch: 'full'
                },
                {
                    path: 'dashboard',
                    component: canvas_component_1.CanvasComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'login',
                    component: LogIn_component_1.LogInComponent,
                    canActivate: [DashBoardActivator_1.DashBoardActivator]
                }, {
                    path: 'resetpassword/:token',
                    component: resetpassword_component_1.ResetPasswordComponent,
                    canActivate: [DashBoardActivator_1.DashBoardActivator]
                }, {
                    path: 'yodleeToken',
                    component: YodleeToken_component_1.YodleeTokenComponent
                },
                {
                    path: 'signUp',
                    component: SignUp_component_1.SignUpComponent,
                    canActivate: [DashBoardActivator_1.DashBoardActivator]
                },
                {
                    path: 'addCompany',
                    component: AddCompany_component_1.AddCompanyComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                { path: 'company/:id',
                    component: Company_component_1.CompanyComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'companies',
                    component: Companies_component_1.CompaniesComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'taxes',
                    component: taxes_component_1.TaxesComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'Verification/:VerificationID',
                    component: Verification_component_1.VerificationComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'bills/:PaymentstableID',
                    component: paymentstable_component_1.paymenttableComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'books/:tabId',
                    component: Books_component_1.BooksComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'paymentdashboard',
                    component: paymentdashboard_component_1.paymentdashboardComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'paid/:PaymentstableID',
                    component: paidtable_component_1.paidtablecomponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'JournalEntry',
                    component: JournalEntry_component_1.JournalEntryComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'Expense',
                    component: Expense_component_1.ExpenseComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'expense/:expenseID',
                    component: Expense_component_1.ExpenseComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'journalEntry/:journalID',
                    component: JournalEntry_component_1.JournalEntryComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'journalEntry/:journalID/:reverse',
                    component: JournalEntry_component_1.JournalEntryComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'vendors',
                    component: Vendors_component_1.VendorComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'user-profile',
                    component: UserProfile_component_1.UserProfileComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'chartOfAccounts',
                    component: ChartOfAccounts_component_1.ChartOfAccountsComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'dimensions',
                    component: Dimensions_component_1.DimensionsComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'financialAccounts',
                    component: FinancialAccounts_component_1.FinancialAccountsComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'itemCodes',
                    component: ItemCodes_component_1.ItemCodesComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'expensecode',
                    component: ExpensesCodes_component_1.ExpensesCodesComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'tools',
                    component: Tools_component_1.ToolsComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'customers',
                    component: Customers_component_1.CustomersComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                }, {
                    path: 'users',
                    component: Users_component_1.UsersComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                }, {
                    path: 'modules',
                    component: modules_component_1.ModulesComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                }, {
                    path: 'rules',
                    component: Rules_component_1.RulesComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                }, {
                    path: 'lock',
                    component: lock_component_1.lockComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                }, {
                    path: 'activate',
                    component: changePassword_component_1.ChangePasswordComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                }, {
                    path: 'termsAndConditions',
                    component: TermsAndConditions_component_1.TermsAndConditionsComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'deposit',
                    component: Deposit_component_1.DepositComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'deposit/:depositID',
                    component: Deposit_component_1.DepositComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'employees',
                    component: Employees_component_1.EmployeesComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'categorization',
                    component: Categorization_component_1.CategorizationComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'search',
                    component: Search_component_1.SearchComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'payments',
                    component: payments_component_1.PaymentsComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'payments/:paymentID',
                    component: payments_component_1.PaymentsComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'reconcilation',
                    component: Reconsile_component_1.ReconcileComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'documents/:tabId',
                    component: Documents_component_1.DocumentsComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'document/:type/:documentId',
                    component: Document_component_1.DocumentComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'budget',
                    component: Budget_component_1.BudgetComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                }, {
                    path: 'switchCompany',
                    component: switchCompanies_component_1.SwitchCompanyComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                },
                {
                    path: 'plans',
                    component: PaymentsPlanComponent_1.PaymentsPlanComponent,
                    canActivate: [CheckSessionActivator_1.LoggedInActivator]
                }
            ]), payments_module_1.PaymentsModule, reports_module_1.ReportsModule, invoices_module_1.InvoicesModule
        ],
        declarations: [app_component_1.AppComponent, canvas_component_1.CanvasComponent, Header_component_1.HeaderComponent, SideBar_component_1.SideBarComponent, Tools_component_1.ToolsComponent, LogIn_component_1.LogInComponent, SignUp_component_1.SignUpComponent,
            Vendors_component_1.VendorComponent, taxes_component_1.TaxesComponent, Verification_component_1.VerificationComponent, paymentstable_component_1.paymenttableComponent, ChartOfAccounts_component_1.ChartOfAccountsComponent, ItemCodes_component_1.ItemCodesComponent, JournalEntry_component_1.JournalEntryComponent, Books_component_1.BooksComponent, ExpensesCodes_component_1.ExpensesCodesComponent,
            Customers_component_1.CustomersComponent, Dimensions_component_1.DimensionsComponent, Users_component_1.UsersComponent, switchCompanies_component_1.SwitchCompanyComponent, CurrentCompany_component_1.CurrentCompanyComponent, FinancialAccounts_component_1.FinancialAccountsComponent,
            OffCanvasMenu_component_1.OffCanvasMenuComponent, Loading_component_1.LoadingComponent, modules_component_1.ModulesComponent, changePassword_component_1.ChangePasswordComponent, TermsAndConditions_component_1.TermsAndConditionsComponent,
            resetpassword_component_1.ResetPasswordComponent, paymentdashboard_component_1.paymentdashboardComponent, paidtable_component_1.paidtablecomponent, lock_component_1.lockComponent, Rules_component_1.RulesComponent, Expense_component_1.ExpenseComponent, Deposit_component_1.DepositComponent, Employees_component_1.EmployeesComponent, Documents_component_1.DocumentsComponent,
            Categorization_component_1.CategorizationComponent, payments_component_1.PaymentsComponent, Search_component_1.SearchComponent, SearchResults_component_1.SearchResultsComponent, YodleeToken_component_1.YodleeTokenComponent, Reconsile_component_1.ReconcileComponent,
            Document_component_1.DocumentComponent, Budget_component_1.BudgetComponent, PaymentsPlanComponent_1.PaymentsPlanComponent],
        exports: [router_1.RouterModule],
        bootstrap: [app_component_1.AppComponent],
        providers: [APP_BASE, COA_form_1.COAForm, SignUp_service_1.SignUpService, Login_form_1.LoginForm, SignUp_form_1.SignUpForm, ForgotPassword_form_1.ForgotPassword, ItemCode_form_1.ItemCodeForm, ExpenseCodes_form_1.ExpenseCodesForm,
            Taxes_form_1.TaxesForm, JournalEntry_form_1.JournalEntryForm, JournalEntry_form_1.JournalLineForm, Rules_service_1.RulesService, Customers_form_1.CustomersForm, Customers_form_1.ContactLineForm, Dimension_form_1.DimensionForm, Users_form_1.UsersForm, Documents_service_1.DocumentService,
            FinancialAccount_form_1.FinancialAccountForm, LoadingService_1.LoadingService, lock_form_1.LockForm, verify_form_1.VerifyForm, Modules_service_1.ModulesService, Rule_form_1.RuleForm, Rule_form_1.RuleActionForm, Expenses_form_1.ExpenseForm, Expenses_form_1.ExpenseItemForm, Deposits_form_1.DepositsForm, Deposits_form_2.DepositsLineForm, Employees_form_1.EmployeesForm, Yodlee_service_1.YodleeService, Reconsile_form_1.ReconcileForm, Reconsile_service_1.ReconcileService,
            Budget_form_1.BudgetForm, Budget_form_1.BudgetItemForm, PageTitle_1.pageTitleService, PaymentsPlan_form_1.PaymentsPlan],
        schemas: [core_1.CUSTOM_ELEMENTS_SCHEMA]
    })
], AppModule);
exports.AppModule = AppModule;
