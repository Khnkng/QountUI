/**
 * Created by seshu on 15-10-2016.
 */


import {Component, OnInit} from "@angular/core";
import {Router, NavigationEnd} from "@angular/router";
import {UserModel} from "../share/models/User.model";
import {SwitchBoard} from "../share/services/SwitchBoard";
import {ToastService} from "../share/services/Toast.service";
import {Session} from "../share/services/Session";
import {TOAST_TYPE} from "../share/constants/Qount.constants";
import "rxjs/add/operator/filter";



declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'qount-app',
    templateUrl: '/app/views/qountApp.html'
})
export class AppComponent  implements OnInit{

    isSideMenuExpanded : boolean;
    hasLoggedIn : boolean;
    showSearch : boolean;
    loginSubscription = null;
    logoutSubscription = null;
    user : UserModel;
    currentPath : string;
    isLoginPath : boolean;
    toasts: Array<any>;
    toastClass: string;
    confirmClass = "";

    mainCanvasCss = {
        'main-canvas': true,
        'expanded': false
    }

    sMenuCss = {
        'small-2': false,
        'sidebar' : true,
        'shrink' : true
    }

    constructor(private switchBoard:SwitchBoard, private _router:Router, private toastService: ToastService) {
        if(Session.hasSession()) {
            this.hasLoggedIn = true;
        }
        this.toasts = [];
        this.toastClass = "";
        this.switchBoard.onNewToast.subscribe(toast => this.addToast(toast));
        jQuery('.loading-initial-cont').hide();
        jQuery('.loading-cont').show();
        this.switchBoard.onSideBarExpand.subscribe(flag => {
            this.isSideMenuExpanded = flag;
            this.togglemenu(flag)
        });
    }

    addToast(toast){
        let self = this;
        if(toast.type == TOAST_TYPE.confirm){
            this.confirmClass = "confirm-bg";
        }
        this.toasts.push(toast);
        setTimeout(function () {
            if (toast.type != TOAST_TYPE.confirm) {
                toast.toastClass += " fadeout";
                setTimeout(function () {
                    self.removeToast(toast.toastId);
                }, 2000);
            }
        }, 3000);
    }

    removeToast(toastId){
        let self = this;
        let index = _.findIndex(self.toasts, function(t){
            return t.toastId == toastId;
        });
        self.toasts.splice(index, 1);
    }

    cancel(toast){
        this.removeToast(toast.toastId);
        this.confirmClass = "";
    }

    loggedIn(user: UserModel) {
        this.user = user;
        this.hasLoggedIn = true;
    }

    loggedOut(obj) {
        this.hasLoggedIn = false;
        let link = ['/login'];
        this._router.navigate(link);
    }

    routeChanged(routeChange:NavigationEnd) {
        if(Session.hasSession()) {
            this.hasLoggedIn = true;
        } else {
            this.hasLoggedIn = false;
        }
        this.isLoginPath = routeChange.url == 'login';
        this.currentPath = routeChange.url;
        console.log("currentpath", this.currentPath);
    }

    ngOnInit() {
        this.loginSubscription = this.switchBoard.onLogin.subscribe(user => this.loggedIn(user));
        this.logoutSubscription = this.switchBoard.onLogOut.subscribe(status => this.loggedOut(status));
        this._router.events.filter(event => event instanceof NavigationEnd).subscribe(routeChange => {
            this.routeChanged(<NavigationEnd>routeChange)
        });
-
        jQuery(document).ready(function(){
            jQuery(document).foundation();
        });
    }

    goToDefaultPage(){
        let link = this.hasLoggedIn ? ['/dashboard']: ["/login"];
        this._router.navigate(link);
    }

    redirectToPage(routeName){
        this._router.navigate(routeName);
    }

    togglemenu(menuStatus: boolean){
        this.isSideMenuExpanded = menuStatus;
        this.sMenuCss = {
            'small-2': true,
            'sidebar' : true,
            'shrink' : false
        }
        this.mainCanvasCss = {
            'main-canvas': true,
            'expanded': true
        }
        if(!this.isSideMenuExpanded) {
            this.sMenuCss = {
                'small-2': false,
                'sidebar' : true,
                'shrink' : true
            }
            this.mainCanvasCss = {
                'main-canvas': true,
                'expanded': false
            }
        }
        this.switchBoard.onSideMenuResize.next({'resize': true});
    }
}
