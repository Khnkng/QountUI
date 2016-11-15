/**
 * Created by seshu on 15-10-2016.
 */


import {NgModule} from "@angular/core";
import {ShareModule} from "qCommon/app/share.module";
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
import {DashBoardComponent} from "./payments/app/components/DashBoard.component";
import {WorkflowService} from "./payments/app/services/Workflow.service";
import {BillsService} from "./payments/app/services/Bills.service";
import {BoxService} from "./payments/app/services/Box.service";
import {OAuthService} from "./payments/app/services/OAuthService";
import {DocHubService} from "./payments/app/services/DocHub.service";
import {CommentsService} from "./payments/app/services/Comments.service";
import {UsersService} from "./payments/app/services/Users.service";
import {BillForm} from "./payments/app/forms/Bill.form";
import {CheckListForm} from "./payments/app/forms/CheckListForm";
import {LineListForm} from "./payments/app/forms/CheckListForm";
import {ReportService} from "./payments/app/services/Reports.service";
import {ExcelService} from "./payments/app/services/Excel.service";
import {EmailService} from "./payments/app/services/Email.service";
import {CustomDatepicker1} from "./payments/app/directives/customDatepicker1";
import {CustomDatepicker} from "./payments/app/directives/customDatepicker";
import {WorkflowComponent} from "./payments/app/components/Workflow.component";
import {BillComponent} from "./payments/app/components/Bill.component";
import {BillPayComponent} from "./payments/app/components/BillPay.component";
import {ReportsComponent} from "./payments/app/components/Reports.component";
import {APAgingReportComponent} from "./payments/app/components/APAgingReport.component";
import {APAgingDetails} from "./payments/app/components/APAgingDetails";
import {VendorExpenseAmountsByPeriod} from "./payments/app/components/VendorExpenseAmountsByPeriod.component";
import {VendorPaidUnpaidBills} from "./payments/app/components/VendorPaidUnpaidBills.compoenet";
import {BillPaymentHistory} from "./payments/app/components/BillPaymentHistory.component";
import {VendorExpencesByExpenseType} from "./payments/app/components/VendorExpencesByExpenseType.component";
import {ForeignCurrencyReport} from "./payments/app/components/ForeignCurrencyReport.component";
import {PaymentRegister} from "./payments/app/components/PaymentRegister.component";
import {RecipientInputComponent} from "./payments/app/components/RecipientInput.component";
import {HighChart} from "./payments/app/directives/HighChart.directive";
import {ReportsSearchCriteriaComponent} from "./payments/app/components/ReportSearchCriteria.component";
//noinspection TypeScriptCheckImport

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
            path: 'tools',
            component: ToolsComponent,
            canActivate: [LoggedInActivator]
        },
        {path: 'dashboard/:tabId', name: 'Dashboard', component: DashBoardComponent,canActivate: [LoggedInActivator]},
        {path: 'workflow', name: 'Workflow', component: WorkflowComponent,canActivate: [LoggedInActivator]},
        {path: 'bill/:companyId/:id/:tabId', name: 'BillEntry', component: BillComponent,canActivate: [LoggedInActivator]},
        {path: 'bill-pay/:companyId/:id', name: 'BillPay', component: BillPayComponent,canActivate: [LoggedInActivator]},
        {path: 'newBill', name: 'NewBill', component: BillComponent,canActivate: [LoggedInActivator]},
        {path: 'reports', name: 'Reports', component:ReportsComponent,canActivate: [LoggedInActivator]},
        {path: 'reports/ap-aging', name: 'APAgingReport', component:APAgingReportComponent,canActivate: [LoggedInActivator]},

        {path: 'reports/ap-aging-details', name: 'APAgingDetails', component:APAgingDetails,canActivate: [LoggedInActivator]},
        {path: 'reports/vendor-expense-amounts-by-period', name: 'VendorExpenseAmountsByPeriod', component:VendorExpenseAmountsByPeriod,canActivate: [LoggedInActivator]},
        {path: 'reports/vendor-paid-unpaid-bills', name: 'VendorPaidUnpaidBills', component:VendorPaidUnpaidBills,canActivate: [LoggedInActivator]},
        {path: 'reports/bills-payment-history', name: 'BillPaymentHistory', component:BillPaymentHistory,canActivate: [LoggedInActivator]},
        {path: 'reports/vendor-expense-by-expense-type', name: 'VendorExpencesByExpenseType', component:VendorExpencesByExpenseType,canActivate: [LoggedInActivator]},
        {path: 'reports/foreign-currency-report', name: 'ForeignCurrencyReport', component:ForeignCurrencyReport,canActivate: [LoggedInActivator]},
        {path: 'reports/payment-register-report', name: 'PaymentRegister', component:PaymentRegister,canActivate: [LoggedInActivator]},
    ])],
    declarations: [ AppComponent, CanvasComponent, HeaderComponent, SideBarComponent, ToolsComponent, LogInComponent, SignUpComponent, VendorComponent, ChartOfAccountsComponent,
        DashBoardComponent,WorkflowComponent,BillComponent,BillPayComponent,CustomDatepicker,CustomDatepicker1,RecipientInputComponent,ReportsComponent,
        APAgingReportComponent,HighChart,ReportsSearchCriteriaComponent,APAgingDetails,VendorExpenseAmountsByPeriod,VendorPaidUnpaidBills,BillPaymentHistory,
        VendorExpencesByExpenseType,ForeignCurrencyReport,PaymentRegister
    ],
    bootstrap: [ AppComponent ],
    providers: [COAForm, SignUpService, LoginForm, SignUpForm, ForgotPassword,
        ,WorkflowService,BillsService,BoxService,OAuthService,DocHubService,CommentsService,UsersService,BillForm,CheckListForm, LineListForm,
        EmailService,ExcelService,ReportService]
})
export class AppModule {

}

