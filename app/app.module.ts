/**
 * Created by seshu on 15-10-2016.
 */


import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {ShareModule} from "qCommon/app/share.module";
import {ReportsModule} from "reportsUI/app/reports.module";
import {LoggedInActivator} from "qCommon/app/services/CheckSessionActivator";
import {AddCompanyComponent} from "qCommon/app/components/AddCompany.component";
import {CompaniesComponent} from "qCommon/app/components/Companies.component";
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
import {CommonModule} from "@angular/common";
import {SignUpService} from "./services/SignUp.service";
import {LoginForm} from "./forms/Login.form";
import {SignUpForm} from "./forms/SignUp.form";
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
import {SwitchCompanyComponent} from "./components/switchCompanies.component";

@NgModule({
    imports: [ BrowserModule, FormsModule, CommonModule, ReactiveFormsModule, ShareModule, HttpModule, RouterModule.forRoot([
        {
            path: '',
            component: CanvasComponent,
            canActivate: [LoggedInActivator],
            useAsDefault: true
        },
        {
            path: 'login',
            component: LogInComponent,
            canActivate: [DashBoardActivator]
        },
        {
            path: 'signUp',
            component: SignUpComponent,
            canActivate: [DashBoardActivator]
        },
        {
            path: 'addCompany',
            name: 'AddCompany',
            component: AddCompanyComponent,
            canActivate: [LoggedInActivator]
        },
        {   path: 'company/:id',
            name: 'Company',
            component: CompanyComponent,
            canActivate: [LoggedInActivator]
        },
        {
            path: 'companies',
            component: CompaniesComponent,
            canActivate: [LoggedInActivator]
        },
        {
            path: 'books/:tabId',
            component: BooksComponent,
            canActivate: [LoggedInActivator]
        },
        {
            path: 'newJournalEntry',
            component: JournalEntryComponent,
            canActivate: [LoggedInActivator]
        },
        {
            path: 'journalEntry/:journalID',
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
            name: 'UserProfile',
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
        }
    ]), ReportsModule,PaymentsModule
    ],
    declarations: [ AppComponent, CanvasComponent, HeaderComponent, SideBarComponent, ToolsComponent, LogInComponent, SignUpComponent,
        VendorComponent, ChartOfAccountsComponent,ItemCodesComponent, JournalEntryComponent, BooksComponent, ExpensesCodesComponent,
        CustomersComponent, DimensionsComponent, SwitchCompanyComponent],
    exports: [RouterModule],
    bootstrap: [ AppComponent ],
    providers: [COAForm, SignUpService, LoginForm, SignUpForm, ForgotPassword, ItemCodeForm,ExpensesForm, JournalEntryForm, JournalLineForm,
        ExpensesSerice, CustomersService, CustomersForm, DimensionForm],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {

}

