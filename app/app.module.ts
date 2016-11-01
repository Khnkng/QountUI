/**
 * Created by seshu on 15-10-2016.
 */


import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./components/app.component";
import {RouterModule} from "@angular/router";
import {HeaderComponent} from "./components/Header.component";
import {SideBarComponent} from "./components/SideBar.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CanvasComponent} from "./components/canvas.component";
import {HttpModule} from "@angular/http";
import {LoggedInActivator} from "./share/services/CheckSessionActivator";
import {FullScreenService} from "./share/services/fullscreen.service";
import {SwitchBoard} from "./share/services/SwitchBoard";
import {NotificationService} from "./share/services/Notification.service";
import {ToastService} from "./share/services/Toast.service";
import {WindowService} from "./share/services/Window.service";
import {PrintEventService} from "./share/services/PrintEvent.service";
import {LogInComponent} from "./components/LogIn.component";
import {SignUpComponent} from "./components/SignUp.component";
import {CommonModule, CurrencyPipe} from "@angular/common";
import {LoginService} from "./services/Login.service";
import {SignUpService} from "./services/SignUp.service";
import {LoginForm} from "./forms/Login.form";
import {SignUpForm} from "./forms/SignUp.form";
import {ForgotPassword} from "./forms/ForgotPassword.form";
import {DashBoardActivator} from "./share/services/DashBoardActivator";
import {CompaniesService} from "./share/services/Companies.service";
import {VendorComponent} from "./components/Vendors.component";
import {VendorForm} from "./forms/Vendor.form";
import {ShareModule} from "./share/share.module";
import {CompaniesComponent} from "./share/components/Companies.component";
import {CompanyComponent} from "./share/components/Company.component";
import {AddCompanyComponent} from "./share/components/AddCompany.component";
import {CompanyForm} from "./share/forms/Company.Form";
import {FilterByValuePipe} from "./share/pipes/filter-by-value";
import {UserProfileComponent} from "./components/UserProfile.component";
import {UserProfileService} from "./services/UserProfile.service";

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
    ])],
    declarations: [ AppComponent, CanvasComponent, HeaderComponent, SideBarComponent, LogInComponent, SignUpComponent, VendorComponent],
    bootstrap: [ AppComponent ],
    providers: [ LoggedInActivator, DashBoardActivator, FullScreenService, SwitchBoard, NotificationService, ToastService, WindowService, PrintEventService, LoginService, SignUpService, LoginForm, SignUpForm, ForgotPassword, CompaniesService, VendorForm, CurrencyPipe, FilterByValuePipe, CompanyForm, UserProfileService]
})
export class AppModule {

}

