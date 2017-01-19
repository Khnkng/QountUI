/**
 * Created by seshu on 15-10-2016.
 */


import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {ShareModule} from "qCommon/app/share.module";
import {ReportsModule} from "reportsUI/app/reports.module";
import {LoggedInActivator} from "qCommon/app/services/CheckSessionActivator";
import {AddCompanyComponent} from "qCommon/app/components/AddCompany.component";
import {CompaniesComponent} from "qCommon/app/components/Companies.component";
import {TaxesComponent} from "./components/taxes.component"
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
import {TaxesForm} from "./forms/Taxes.form"
import {ForgotPassword} from "./forms/ForgotPassword.form";
import {VendorComponent} from "./components/Vendors.component";
import {UserProfileComponent} from "qCommon/app/components/UserProfile.component";
import {ChartOfAccountsComponent} from "./components/ChartOfAccounts.component";
import {COAForm} from "./forms/COA.form";
import {DashBoardActivator} from "qCommon/app/services/DashBoardActivator";
import {ToolsComponent} from "./components/Tools.component";
import {ItemCodesComponent} from "./components/ItemCodes.component";
import {ItemCodeForm} from "./forms/ItemCode.form";
import {BooksComponent} from "./components/Books.component";
import {JournalEntryComponent} from "./components/JournalEntry.component";
import {JournalEntryForm, JournalLineForm} from "./forms/JournalEntry.form";
import {ExpensesForm} from "./forms/Expenses.form";
import {ExpensesSerice} from "./services/Expenses.service";
import {PaymentsModule} from "billsUI/app/payments.module";
import {ExpensesCodesComponent} from "./components/ExpensesCodes.component";
import {CustomersComponent} from "./components/Customers.component";
import {CustomersService} from "./services/Customers.service";
import {CustomersForm} from "./forms/Customers.form";
import {DimensionsComponent} from "./components/Dimensions.component";
import {DimensionForm} from "./forms/Dimension.form";
import {UsersComponent} from "./components/Users.component";
import {UsersForm} from "./forms/Users.form";
import {SwitchCompanyComponent} from "./components/switchCompanies.component";
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
import {RuleForm, RuleActionForm} from "./forms/Rule.form";

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
            canActivate: [LoggedInActivator]
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
            path: 'books/:tabId',
            component: BooksComponent,
            canActivate: [LoggedInActivator]
        },
        {
            path: 'JournalEntry',
            component: JournalEntryComponent,
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
            path: 'activate',
            component: ChangePasswordComponent,
            canActivate: [LoggedInActivator]
        },{
            path: 'termsAndConditions',
            component: TermsAndConditionsComponent,
            canActivate: [LoggedInActivator]
        }
    ]), PaymentsModule, ReportsModule
    ],
    declarations: [ AppComponent, CanvasComponent, HeaderComponent, SideBarComponent, ToolsComponent, LogInComponent, SignUpComponent,
        VendorComponent,TaxesComponent, ChartOfAccountsComponent,ItemCodesComponent, JournalEntryComponent, BooksComponent, ExpensesCodesComponent,
        CustomersComponent, DimensionsComponent, UsersComponent, SwitchCompanyComponent, FinancialAccountsComponent,
        OffCanvasMenuComponent, LoadingComponent, ModulesComponent,ChangePasswordComponent, TermsAndConditionsComponent, ResetPasswordComponent, RulesComponent],
    exports: [RouterModule],
    bootstrap: [ AppComponent ],
    providers: [APP_BASE, COAForm, SignUpService, LoginForm, SignUpForm, ForgotPassword, ItemCodeForm,ExpensesForm, TaxesForm, JournalEntryForm, JournalLineForm,
        ExpensesSerice, CustomersService, CustomersForm, DimensionForm, UsersForm, FinancialAccountForm, LoadingService, ModulesService, RuleForm, RuleActionForm],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {

}

