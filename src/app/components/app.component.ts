/**
 * Created by seshu on 15-10-2016.
 */


import {Component, OnInit} from "@angular/core";
import {Router, NavigationEnd, ActivatedRoute} from "@angular/router";
import {UserModel} from "qCommon/app/models/User.model";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import "rxjs/add/operator/filter";
import {SocketService} from "qCommon/app/services/Socket.service";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {LoginService} from "qCommon/app/services/Login.service";
import {ToastService} from "qCommon/app/services/Toast.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {environment} from "../../environments/environment";
import {UrlService} from "../../../node_modules/qCommon/app/services/UrlService";

declare let jQuery:any;
declare let _:any;
declare let window:any;

@Component({
  selector: 'qount-app',
  templateUrl: '../views/qountApp.html'
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
  switchBoard:SwitchBoard;
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
  pageTitle:string='';
  currentEnvironment:any;
  cookieObj:any

  constructor(_switchBoard:SwitchBoard, private _router:Router, private route: ActivatedRoute, private toastService: ToastService,
              private titleService:pageTitleService, private companyService: CompaniesService,
              private loadingService:LoadingService,private loginService: LoginService, private _toastService:ToastService,
              private numeralService: NumeralService) {
    let self = this;
    this.currentEnvironment = environment;
    let cookieKey = this.currentEnvironment.production? "prod": "dev";
    UrlService.setUrls(this.currentEnvironment);
    let data= this.getCookie(cookieKey);
    if(data){
      this.cookieObj = JSON.parse(data);
      if (this.cookieObj && !Session.hasSession()) {
        this.updateSessionData(this.cookieObj);
        if (this.cookieObj.user.default_company) {
          this.fetchCompanies(this.cookieObj.user);
        }
      }else if (this.cookieObj.referer) {
        this.updateSessionData(this.cookieObj);
      }
    }else {
      if(Session.hasSession()) {
        this.hasLoggedIn = true;
      }else {
        if(this.currentEnvironment.isLocal){
          let link = ['/login'];
          this._router.navigate(link);
        } else{
          this.logout();
        }
      }
    }

    window.recivedYodleeToken = function(){
      self.switchBoard.onYodleeTokenRecived.next({});
    };
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
    this.switchBoard.onPageChange.subscribe(title => this.updatePageTitle(title));
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        this.queryParams = params;

      });
  }


  updateSessionData(obj) {
    Session.create(obj.user, obj.token);
    Session.setLockDate(obj.user['default_company']['lock_date']);
    Session.setTTL(obj['ttl']*1000);
    Session.setRefreshToken(obj['refreshToken']);
    Session.setCurrentCompany(obj.user.defaultCompany);
    Session.setCurrentCompanyName(obj.user.default_company.name);
    Session.setCurrentCompanyCurrency(obj.user.default_company.defaultCurrency);
    Session.setCompanyReportCurrency(obj.user.default_company.reportCurrency || "");
    this.numeralService.switchLocale(Session.getCurrentCompanyCurrency());
    Session.setFiscalStartDate(obj.user.default_company.fiscalStartDate?obj.user.default_company.fiscalStartDate:"");
    this.refreshToken();
  }


  refreshToken(){
    let base=this;
    let interval= setInterval(function(){
      let data={
        token:Session.getToken(),
        refreshToken:Session.getRefreshToken(),
        ttl:Number(Session.getTTL())/1000
      };
      base.loginService.refreshToken(data).subscribe(data  => {base.updateToken(data) }, error => {});
    }, 55*60*1000);
    Session.setTimer(interval);
  }


  getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


  updateToken(data){
    Session.removeToken();
    Session.setToken(data.token);
    Session.setRefreshToken(data.refreshToken);
    Session.setTTL(data.ttl);
  }

  fetchCompanies(user){
    let base=this;
    setTimeout(function(){
      base.companyService.companies().subscribe(companies => base.setComapnies(companies), error => base.handleError(error));
    },200);
  }

  setComapnies(companies){
    let user:any = Session.getUser();
    if(companies.length > 0){
      let defaultCompany:any = user.default_company;
      if(!_.isEmpty(defaultCompany)){
        /*Session.setCurrentCompany(defaultCompany.id);
         Session.setCurrentCompanyName(defaultCompany.name);
         Session.setCurrentCompanyCurrency(defaultCompany.defaultCurrency);
         Session.setFiscalStartDate(defaultCompany.fiscalStartDate?defaultCompany.fiscalStartDate:"");*/
        if(Session.hasSession()) {
          this.hasLoggedIn = true;
        }
      }
    } else{
      if(user.isAdmin){
        this._toastService.pop(TOAST_TYPE.warning, "No companies added yet. Please add a company to start.");
        this._router.navigate(['addCompany']);
      } else{
        this._toastService.pop(TOAST_TYPE.warning, "No companies found. Please contact admin to create companies.");
      }
    }
    if (!this.cookieObj.link) {
      this.gotoDefaultPage();
    }
  }

  gotoDefaultPage() {
    let  link ='dashboard';
    if(Session.get('user').tempPassword){
      link= 'activate';
    } else{
      let defaultCompany:any = Session.getUser().default_company;
      if(!_.isEmpty(defaultCompany) && (defaultCompany.roles.indexOf('Owner') != -1||defaultCompany.roles.indexOf('Yoda') != -1)){
        if(!defaultCompany.tcAccepted){
          link = 'termsAndConditions';
        }
      }
    }
    if(link == 'dashboard'){
      this.switchBoard.onLogin.next(Session.get('user'));
    }
    this._router.navigate([link]);
    this.loadingService.triggerLoadingEvent(false);
  }

  handleError(error){
    this.loadingService.triggerLoadingEvent(false);
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
    /*let link = ['/login'];
     this._router.navigate(link);*/
    this.logout();
  }

  logout(){
    this.loadingService.triggerLoadingEvent(true);
    if(this.currentEnvironment.production){
      document.cookie="prod=;path=/;domain=qount.io";
      window.location.href = 'https://welcome.qount.io/oneapp/login'
    } else {
      document.cookie="dev=;path=/;domain=qount.io";
      window.location.href = 'https://dev-welcome.qount.io/oneapp/login'
    }
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
      let status = this.queryParams['JSONcallBackStatus'];
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

  updatePageTitle(title){
    this.pageTitle = title;
  }

  showPrevious(){
    this.switchBoard.onClickPrev.next({});
  }

}

