/**
 * Created by seshu on 15-10-2016.
 */


import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {AppComponent} from "./components/app.component";
import {RouterModule} from "@angular/router";
import {HeaderComponent} from "./components/Header.component";
import {SideBarComponent} from "./components/SideBar.component";
import {FormsModule, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CanvasComponent} from "./components/canvas.component";
import {HttpModule} from "@angular/http";

import {LoggedInActivator} from "./share/services/CheckSessionActivator";
import {FullScreenService} from "./share/services/fullscreen.service";
import {SwitchBoard} from "./share/services/SwitchBoard";
import {NotificationService} from "./share/services/Notification.service";
import {ToastService} from "./share/services/Toast.service";
import {WindowService} from "./share/services/Window.service";
import {PrintEventService} from "./share/services/PrintEvent.service";
import {Focus} from "./share/directives/focus.directive";
import {Ripple} from "./share/directives/rippler.directive";
import {FoundationInit} from "./share/directives/foundation.directive";
import {LogInComponent} from "./components/LogIn.component";
import {SignUpComponent} from "./components/SignUp.component";
import {CommonModule} from "@angular/common";
import {LoginService} from "./services/Login.service";
import {SignUpService} from "./services/SignUp.service";
import {LoginForm} from "./forms/Login.form";
import {SignUpForm} from "./forms/SignUp.form";
import {ForgotPassword} from "./forms/ForgotPassword.form";
import {DashBoardActivator} from "./share/services/DashBoardActivator";

@NgModule({
    imports: [ BrowserModule, FormsModule, CommonModule, ReactiveFormsModule, HttpModule, RouterModule.forRoot([
        {
            name: 'Dashboard',
            path: '',
            component: CanvasComponent,
            canActivate: [LoggedInActivator]
        },
        {
            name: 'Login',
            path: 'login',
            component: LogInComponent,
            canActivate: [DashBoardActivator]
        },
        {
            name: 'SignUp',
            path: 'signUp',
            component: SignUpComponent,
            canActivate: [DashBoardActivator]
        }
    ])],
    declarations: [ AppComponent, CanvasComponent, HeaderComponent, SideBarComponent, Focus, Ripple, FoundationInit, LogInComponent, SignUpComponent],
    bootstrap:    [ AppComponent ],
    providers: [ LoggedInActivator, DashBoardActivator, FullScreenService, SwitchBoard, NotificationService, ToastService, WindowService, PrintEventService, LoginService, SignUpService, LoginForm, SignUpForm, ForgotPassword ]
})
export class AppModule {

}

