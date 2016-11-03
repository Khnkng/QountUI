/**
 * Created by seshu on 15-10-2016.
 */


import {NgModule} from "@angular/core";
import {ShareModule} from "qCommon/app/share.module";
import {LoggedInActivator} from "qCommon/app/services/CheckSessionActivator";
import {DashBoardActivator} from "qCommon/app/services/DashBoardActivator";
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
//noinspection TypeScriptCheckImport

@NgModule({
    imports: [ BrowserModule, FormsModule, CommonModule, ReactiveFormsModule, ShareModule, HttpModule, RouterModule.forRoot([
        {
            path: '',
            component: CanvasComponent,
            canActivate: [LoggedInActivator]
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
        {   path: 'addCompany',
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
        }
    ])],
    declarations: [ AppComponent, CanvasComponent, HeaderComponent, SideBarComponent, LogInComponent, SignUpComponent, VendorComponent, ChartOfAccountsComponent],
    bootstrap: [ AppComponent ],
    providers: [COAForm, SignUpService, LoginForm, SignUpForm, ForgotPassword]
})
export class AppModule {

}

