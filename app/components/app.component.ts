/**
 * Created by seshu on 15-10-2016.
 */


import {Component, OnInit} from "@angular/core";
import {Router, NavigationEnd, ActivatedRoute} from "@angular/router";
import {UserModel} from "qCommon/app/models/User.model";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {ToastService} from "qCommon/app/services/Toast.service";
import {Session} from "qCommon/app/services/Session";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import "rxjs/add/operator/filter";
import {SocketService} from "qCommon/app/services/Socket.service";


declare var jQuery:any;
declare var _:any;
declare var window:any;

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
    switchBoard:SwitchBoard
    confirmClass = "";
    isOffCanvasMenuExpanded:boolean=false;
    mainCanvasCss = {
        'main-canvas': true,
        'expanded': false
    };

    sMenuCss = {
        'small-2': false,
        'sidebar' : true,
        'shrink' : true
    };
    sub:any;
    queryParams:any;
    isOverlay:boolean=false;
    isLoading:boolean=false;

    constructor(_switchBoard:SwitchBoard, private _router:Router, private route: ActivatedRoute, private toastService: ToastService, private socketService: SocketService) {
        let self = this;
        window.recivedYodleeToken = function(){
            self.switchBoard.onYodleeTokenRecived.next({});
        };
        if(Session.hasSession()) {
            this.hasLoggedIn = true;
        }
        this.switchBoard = _switchBoard;
        this.toasts = [];
        this.toastClass = "";
        this.switchBoard.onNewToast.subscribe(toast => this.addToast(toast));
        jQuery('.loading-initial-cont').hide();
        jQuery('.loading-cont').show();
        this.switchBoard.onSideBarExpand.subscribe(flag => {
            this.isSideMenuExpanded = flag;
            this.togglemenu(flag)
        });

        this.switchBoard.onLoadingWheel.subscribe(toggle => this.toggleLoader(toggle));

        this.sub = this.route
            .queryParams
            .subscribe(params => {
                this.queryParams = params;

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
    confirm(toast){
        this.switchBoard.onToastConfirm.next({});
        this.removeToast(toast.toastId);
        this.confirmClass = "";
    }
    cancel(toast){
        this.removeToast(toast.toastId);
        this.confirmClass = "";
    }
    error(toast){
        this.removeToast(toast.toastId);
        // this.confirmClass = "";
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
            if(routeChange.url == '/activate' || routeChange.url == '/termsAndConditions'){
                this.hasLoggedIn = false;
            } else{
                this.hasLoggedIn = true;
            }
        } else {
            this.hasLoggedIn = false;
        }
        Session.setLastVisitedUrl(this.currentPath);
        this.isLoginPath = routeChange.url == 'login';
        this.currentPath = routeChange.url;




        if(this.currentPath.startsWith("/yodleeToken")) {
            var status = this.queryParams['JSONcallBackStatus'];
            Session.put("yodleeStatus", status);
            window.parent.recivedYodleeToken();
        }

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
    toggleOffCanvasMenu(){
        this.isOffCanvasMenuExpanded = !this.isOffCanvasMenuExpanded;
        this.isSideMenuExpanded = this.isOffCanvasMenuExpanded;
        this.switchBoard.onOffCanvasMenuExpand.next(this.isOffCanvasMenuExpanded);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    toggleLoader(toggle){
        this.isLoading=toggle;
        this.isOverlay=toggle;
    }

}
