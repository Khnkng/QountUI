/**
 * Created by seshu on 15-10-2016.
 */


import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {ShareModule} from "qCommon/app/share.module";
import {paidtablecomponent} from "./components/paidtable.component";
import {paymentdashboardComponent} from "./components/paymentdashboard.component";
import {ReportsModule} from "reportsUI/app/reports.module";
import {LoggedInActivator} from "qCommon/app/services/CheckSessionActivator";
import {AddCompanyComponent} from "qCommon/app/components/AddCompany.component";
import {CompaniesComponent} from "qCommon/app/components/Companies.component";
import {TaxesComponent} from "./components/taxes.component";
import {VerificationComponent} from "./components/Verification.component";
import {paymenttableComponent} from "./components/paymentstable.component";
import {CompanyComponent} from "qCommon/app/components/Company.component";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./components/app.component";
import {RouterModule} from "@angular/router";
import {HeaderComponent} from "./components/Header.component";
import {SideBarComponent} from "./components/SideBar.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CanvasComponent} from "./components/canvas.component";
import {HttpModule} from "@angular/http";
import {LogInComponent} from "./components/LogIn.component";
import {SignUpComponent} from "./components/SignUp.component";
import {CommonModule, APP_BASE_HREF} from "@angular/common";
import {SignUpService} from "./services/SignUp.service";
import {LoginForm} from "./forms/Login.form";
import {SignUpForm} from "./forms/SignUp.form";
import {TaxesForm} from "./forms/Taxes.form";
import {LockForm} from "./forms/lock.form";
import {VerifyForm} from "./forms/verify.form";
import {ForgotPassword} from "./forms/ForgotPassword.form";
import {VendorComponent} from "./components/Vendors.component";
import {UserProfileComponent} from "qCommon/app/components/UserProfile.component";
import {ChartOfAccountsComponent} from "./components/ChartOfAccounts.component";
import {MetricsComponent} from "./components/Metrics.component";
import {CreateMetricComponent} from "./components/CreateMetrics.component";
import {COAForm} from "./forms/COA.form";
import {MetricsForm,MetricsLineForm,metricPeriodForm} from "./forms/Metrics.form";
import {DashBoardActivator} from "qCommon/app/services/DashBoardActivator";
import {ToolsComponent} from "./components/Tools.component";
import {ItemCodesComponent} from "./components/ItemCodes.component";
import {ItemCodeForm} from "./forms/ItemCode.form";
import {BooksComponent} from "./components/Books.component";
import {JournalEntryComponent} from "./components/JournalEntry.component";
import {JournalEntryForm, JournalLineForm} from "./forms/JournalEntry.form";
import {ExpenseCodesForm} from "./forms/ExpenseCodes.form";
import {PaymentsModule} from "billsUI/app/payments.module";
import {InvoicesModule} from "invoicesUI/app/invoices.module";
import {RulesService} from "qCommon/app/services/Rules.service";
import {ExpensesCodesComponent} from "./components/ExpensesCodes.component";
import {CategorizationComponent} from "./components/Categorization.component";
import {CustomersComponent} from "./components/Customers.component";
import {CustomersForm,ContactLineForm} from "./forms/Customers.form";
import {DimensionsComponent} from "./components/Dimensions.component";
import {DimensionForm} from "./forms/Dimension.form";
import {UsersComponent} from "./components/Users.component";
import {UsersForm} from "./forms/Users.form";
import {SwitchCompanyComponent} from "./components/switchCompanies.component";
import {CurrentCompanyComponent} from "./components/CurrentCompany.component";
import {FinancialAccountsComponent} from "./components/FinancialAccounts.component";
import {FinancialAccountForm} from "./forms/FinancialAccount.form";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {LoadingComponent} from "qCommon/app/components/Loading.component";
import {OffCanvasMenuComponent} from "./components/OffCanvasMenu.component";
import {ModulesComponent} from "./components/modules.component";
import {ModulesService} from "./services/Modules.service";
import {ChangePasswordComponent} from "./components/changePassword.component";
import {TermsAndConditionsComponent} from "./components/TermsAndConditions.component";
import {ResetPasswordComponent} from "./components/resetpassword.component";
import {RulesComponent} from "./components/Rules.component";
import {lockComponent} from "./components/lock.component";
import {RuleForm, RuleActionForm} from "./forms/Rule.form";
import {ExpenseComponent} from "./components/Expense.component";
import {ExpenseForm, ExpenseItemForm} from "./forms/Expenses.form";
import {DepositComponent} from "./components/Deposit.component";
import {DepositsForm} from "./forms/Deposits.form";
import {DepositsLineForm} from "./forms/Deposits.form";
import {EmployeesComponent} from "./components/Employees.component";
import {EmployeesForm} from "./forms/Employees.form";
import {PaymentsComponent} from "./components/payments.component";
import {YodleeService} from "./services/Yodlee.service";
import {YodleeTokenComponent} from "./components/YodleeToken.component";
import {SearchComponent} from "./components/Search.component";
import {SearchResultsComponent} from "./components/SearchResults.component";
import {ReconcileComponent} from "./components/Reconsile.component";
import {ReconcileForm} from "./forms/Reconsile.form";
import {ReconcileService} from "./services/Reconsile.service";
import {MetricsService} from "./services/Metrics.service";
import {DocumentsComponent} from "./components/Documents.component";
import {DocumentService} from "./services/Documents.service";
import {DocumentComponent} from "./components/Document.component";
import {BudgetComponent} from "./components/Budget.component";
import {BudgetForm,BudgetItemForm} from "./forms/Budget.form";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {PaymentsPlanComponent} from "./components/PaymentsPlanComponent";
import {PaymentsPlan}from"./forms/PaymentsPlan.form";
import {RDCreditsComponent} from "./components/RDCredits.component";
import {RDcreditsService} from "./services/RDcredits.service";
import {RDcreditsForm} from "./forms/RDcredits.form";
import {CollaborationComponent} from "./components/Collaboration.component";
import {SubCommentComponent} from "./components/SubComment.component";


const APP_BASE = {provide: APP_BASE_HREF, useValue: '/'};

@NgModule({
  imports: [ BrowserModule, FormsModule, CommonModule, ReactiveFormsModule, ShareModule, HttpModule, RouterModule.forRoot([
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      component: CanvasComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'login',
      component: LogInComponent,
      canActivate: [DashBoardActivator]
    },{
      path: 'resetpassword/:token',
      component: ResetPasswordComponent,
      canActivate: [DashBoardActivator]
    },{
      path: 'yodleeToken',
      component: YodleeTokenComponent
    },
    {
      path: 'signUp',
      component: SignUpComponent,
      canActivate: [DashBoardActivator]
    },
    {
      path: 'addCompany',
      component: AddCompanyComponent,
      canActivate: [LoggedInActivator]
    },
    {   path: 'company/:id',
      component: CompanyComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'companies',
      component: CompaniesComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'taxes',
      component: TaxesComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'Verification/:VerificationID',
      component: VerificationComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'bills/:PaymentstableID',
      component: paymenttableComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'books/:tabId',
      component: BooksComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'paymentdashboard',
      component: paymentdashboardComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'paid/:PaymentstableID',
      component: paidtablecomponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'JournalEntry',
      component: JournalEntryComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'Expense',
      component: ExpenseComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'expense/:expenseID',
      component: ExpenseComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'journalEntry/:journalID',
      component: JournalEntryComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'journalEntry/:journalID/:reverse',
      component: JournalEntryComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'vendors',
      component: VendorComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'user-profile',
      component: UserProfileComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'chartOfAccounts',
      component: ChartOfAccountsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'dimensions',
      component: DimensionsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'financialAccounts',
      component: FinancialAccountsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'itemCodes',
      component: ItemCodesComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'expensecode',
      component: ExpensesCodesComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'tools',
      component: ToolsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'customers',
      component: CustomersComponent,
      canActivate: [LoggedInActivator]
    },{
      path: 'users',
      component: UsersComponent,
      canActivate: [LoggedInActivator]
    },{
      path: 'modules',
      component: ModulesComponent,
      canActivate: [LoggedInActivator]
    },{
      path: 'rules',
      component: RulesComponent,
      canActivate: [LoggedInActivator]
    },{
      path: 'lock',
      component: lockComponent,
      canActivate: [LoggedInActivator]
    },{
      path: 'activate',
      component: ChangePasswordComponent,
      canActivate: [LoggedInActivator]
    },{
      path: 'termsAndConditions',
      component: TermsAndConditionsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'deposit',
      component: DepositComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'deposit/:depositID',
      component: DepositComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'employees',
      component: EmployeesComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'categorization',
      component: CategorizationComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'search',
      component: SearchComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'payments',
      component: PaymentsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'payments/:paymentID',
      component: PaymentsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'reconcilation',
      component: ReconcileComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'documents/:tabId',
      component: DocumentsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'document/:type/:documentId',
      component: DocumentComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'budget',
      component: BudgetComponent,
      canActivate: [LoggedInActivator]
    },{
      path: 'switchCompany',
      component: SwitchCompanyComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'plans',
      component: PaymentsPlanComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'metrics',
      component: MetricsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'createMetrics',
      component: CreateMetricComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'rdCredits',
      component: RDCreditsComponent,
      canActivate: [LoggedInActivator]
    },
    {
      path: 'collaboration',
      component: CollaborationComponent,
      canActivate: [LoggedInActivator]
    }
  ]), PaymentsModule, ReportsModule, InvoicesModule
  ],
  declarations: [ AppComponent, CanvasComponent, HeaderComponent, SideBarComponent, ToolsComponent, LogInComponent, SignUpComponent,
    VendorComponent,TaxesComponent,VerificationComponent,paymenttableComponent,ChartOfAccountsComponent,MetricsComponent,CreateMetricComponent,ItemCodesComponent, JournalEntryComponent, BooksComponent, ExpensesCodesComponent,
    CustomersComponent, DimensionsComponent, UsersComponent, SwitchCompanyComponent,CurrentCompanyComponent, FinancialAccountsComponent,
    OffCanvasMenuComponent, LoadingComponent, ModulesComponent,ChangePasswordComponent, TermsAndConditionsComponent,
    ResetPasswordComponent,paymentdashboardComponent,paidtablecomponent, lockComponent, RulesComponent, ExpenseComponent,DepositComponent,EmployeesComponent,DocumentsComponent,
    CategorizationComponent,PaymentsComponent, SearchComponent, SearchResultsComponent, YodleeTokenComponent,ReconcileComponent,
    DocumentComponent,BudgetComponent,PaymentsPlanComponent,RDCreditsComponent,CollaborationComponent, SubCommentComponent],
  exports: [RouterModule],
  bootstrap: [ AppComponent ],
  providers: [APP_BASE, COAForm,MetricsForm,MetricsLineForm,metricPeriodForm, SignUpService, LoginForm, SignUpForm, ForgotPassword, ItemCodeForm, ExpenseCodesForm,
    TaxesForm, JournalEntryForm, JournalLineForm, RulesService, CustomersForm,ContactLineForm, DimensionForm, UsersForm, DocumentService,
    FinancialAccountForm, LoadingService,LockForm,VerifyForm, ModulesService, RuleForm, RuleActionForm, ExpenseForm, ExpenseItemForm,DepositsForm,DepositsLineForm,EmployeesForm,YodleeService,ReconcileForm,ReconcileService,MetricsService,
    BudgetForm,BudgetItemForm,pageTitleService,PaymentsPlan, RDcreditsService,RDcreditsForm],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {

}


