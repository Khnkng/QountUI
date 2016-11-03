/**
 * Created by seshu on 15-10-2016.
 */


import {NgModule} from "@angular/core";
//noinspection TypeScriptCheckImport
import {ShareModule} from "qCommon/app/share.module";
import {LoggedInActivator} from "qCommon/app/services/CheckSessionActivator";
import {DashBoardActivator} from "qCommon/app/services/DashBoardActivator";
import {AddCompanyComponent} from "qCommon/app/components/AddCompany.component";
import {CompaniesComponent} from "qCommon/app/components/Companies.component";
import {CompanyComponent} from "qCommon/app/components/Company.component";
import {FullScreenService} from "qCommon/app/services/fullScreen.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {NotificationService} from "qCommon/app/services/Notification.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {WindowService} from "qCommon/app/services/Window.service";
import {PrintEventService} from "qCommon/app/services/PrintEvent.service";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {FilterByValuePipe} from "qCommon/app/pipes/filter-by-value";
import {CompanyForm} from "qCommon/app/forms/Company.Form";
import {SocketService} from "qCommon/app/services/Socket.service";
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
import {CommonModule, CurrencyPipe} from "@angular/common";
import {LoginService} from "./services/Login.service";
import {SignUpService} from "./services/SignUp.service";
import {LoginForm} from "./forms/Login.form";
import {SignUpForm} from "./forms/SignUp.form";
import {ForgotPassword} from "./forms/ForgotPassword.form";

import {VendorComponent} from "./components/Vendors.component";
import {VendorForm} from "./forms/Vendor.form";

import {UserProfileComponent} from "qCommon/app/components/UserProfile.component";
import {UserProfileService} from "qCommon/app/services/UserProfile.service";
import {ChartOfAccountsComponent} from "./components/ChartOfAccounts.component";
import {COAForm} from "./forms/COA.form";

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

