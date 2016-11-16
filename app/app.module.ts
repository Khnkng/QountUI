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
import {CustomDatepicker1} from "./payments/app/directives/customDatepicker1";
import {CustomDatepicker} from "./payments/app/directives/customDatepicker";
import {WorkflowComponent} from "./payments/app/components/Workflow.component";
import {BillComponent} from "./payments/app/components/Bill.component";
import {BillPayComponent} from "./payments/app/components/BillPay.component";
import {RecipientInputComponent} from "./payments/app/components/RecipientInput.component";
import {ItemCodesComponent} from "./components/ItemCodes.component";
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
            path: 'itemCodes',
            component: ItemCodesComponent,
            canActivate: [LoggedInActivator]
        },
        {
            path: 'tools',
            component: ToolsComponent,
            canActivate: [LoggedInActivator]
        },
        {path: 'payments/dashboard/:tabId', name: 'Dashboard', component: DashBoardComponent,canActivate: [LoggedInActivator]},
        {path: 'payments/workflow', name: 'Workflow', component: WorkflowComponent,canActivate: [LoggedInActivator]},
        {path: 'payments/bill/:companyId/:id/:tabId', name: 'BillEntry', component: BillComponent,canActivate: [LoggedInActivator]},
        {path: 'payments/bill-pay/:companyId/:id', name: 'BillPay', component: BillPayComponent,canActivate: [LoggedInActivator]},
        {path: 'payments/newBill', name: 'NewBill', component: BillComponent,canActivate: [LoggedInActivator]}
    ]), ReportsModule],
    declarations: [ AppComponent, CanvasComponent, HeaderComponent, SideBarComponent, ToolsComponent, LogInComponent, SignUpComponent, VendorComponent, ChartOfAccountsComponent,
        DashBoardComponent,WorkflowComponent,BillComponent,BillPayComponent,CustomDatepicker,CustomDatepicker1,RecipientInputComponent, ItemCodesComponent
    ],
    exports: [RouterModule],
    bootstrap: [ AppComponent ],
    providers: [COAForm, SignUpService, LoginForm, SignUpForm, ForgotPassword,
        WorkflowService,BillsService,BoxService,OAuthService,DocHubService,CommentsService,UsersService,BillForm,CheckListForm, LineListForm],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {

}

