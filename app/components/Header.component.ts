/**
 * Created by seshu on 26-02-2016.
 */

import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {NotificationModel} from "qCommon/app//models/Notification.model";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {FullScreenService} from "qCommon/app/services/fullscreen.service";
import {NotificationService} from "qCommon/app/services/Notification.service";
import {Session} from "qCommon/app/services/Session";


declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'qount-header',
  templateUrl: '/app/views/header.html'
})

export class HeaderComponent implements  OnInit{
  hasLoggedIn:boolean;
  isSideMenuExpanded = false;
  isFullScreen : boolean;
  unreadNotifications: Array<any> = [];
  unreadNotificationCount: number = 0;
  notifications: Array<NotificationModel>;
  showSearch : boolean;
  searchText:any;
  fullScreenIcon: string;
  shareLength=0;
  commentLength=0;
  groupByLength=0;
  alertsLength=0;

  mainCanvasCss = {
    'main-canvas': true,
    'expanded': false
  }

  sMenuCss = {
    'small-2': false,
    'sidebar' : true,
    'shrink' : true
  }

  /*Search fields*/
  selectedComponents:Array<string> = [];
  amountCondition:string;
  companyCurrency:string;
  amount:number = 0;
  lowerLimit:number = 0;
  upperLimit:number = 0;
  title:string;
  beginDate:string;
  endDate:string;

  @Output() togglemenu = new EventEmitter<boolean>();
  @Output() redirect = new EventEmitter<any>();

  constructor(private _router: Router, private switchBoard: SwitchBoard, private _fullscreen: FullScreenService, private notificationServie: NotificationService) {

    /*this.switchBoard.onNotificationCountUpdate.subscribe(notification => {
      console.log(notification,'notification');
      this.handleNotifications(notification);
    });
    notificationServie.getNotificationsCount()
      .subscribe(notifications => this.handleNotifications(notifications), error => this.showError(error));*/
    this.getNotifications();
    this.switchBoard.onNewQountNotification.subscribe(notification => {
      this.handleQountNotifications(notification);
    });
    this.fullScreenIcon = "ion-arrow-expand";
    this.searchText = "";
    this.switchBoard.onNotificationMarkRead.subscribe(status => this.getNotifications());
    this.companyCurrency=Session.getCurrentCompanyCurrency();
  }

  getNotifications() {
    this.notificationServie.getNotifications().subscribe(notifications =>  {this.unreadNotifications = _.filter(notifications, function(notification) {
      return notification.notification_type == "Comments" || notification.notification_type == "BillPay";
    });
      this.unreadNotificationCount = this.unreadNotifications.length;
      this.parseUnreadNotifications();
    }, error => this.showError(error));
  }

  parseUnreadNotifications() {

    let unreadNotificationsCopy = this.unreadNotifications;
    this.unreadNotifications = [];
    if(unreadNotificationsCopy.length > 0) {
      let noOfNotifications = 0;
      noOfNotifications = unreadNotificationsCopy.length > 5 ? 5 : unreadNotificationsCopy.length;
      for(let index=0;index<noOfNotifications;index++) {
        let parsedData = JSON.parse(unreadNotificationsCopy[index].data);
        console.log("parsedData", parsedData);
        for(let prop in parsedData) {
          unreadNotificationsCopy[index][prop] = parsedData[prop];
        }
        this.unreadNotifications.splice(index, 0, unreadNotificationsCopy[index]);
      }
    }

  }

  handleQountNotifications(notification) {
    console.log('notification', notification);
    this.unreadNotificationCount = this.unreadNotificationCount + 1;
    this.unreadNotifications.splice(0, 0, notification);
  }

  /*handleNotifications(notifications){
    this.alertsLength=notifications.alerts;
    this.groupByLength=notifications.groups;
    this.commentLength=notifications.messages;
    this.shareLength=notifications.shares;
    this.unreadNotifications=this.alertsLength+this.groupByLength+this.commentLength+this.shareLength;
  }
*/
  viewAll(){
    let link=['/Notification'];
    this.redirect.emit(link);
  }

  showError(error){

  }

  showFullScreen() {
    if(this.isFullScreen) {
      this._fullscreen.exitFullscreen();
      this.fullScreenIcon = "ion-arrow-expand";
    } else {
      this.fullScreenIcon = "ion-arrow-shrink";
      this._fullscreen.launchFullscreen(document.documentElement);
    }
    this.isFullScreen = !this.isFullScreen;
  }

  toggleSideMenuStatus($event) {
    this.isSideMenuExpanded = !this.isSideMenuExpanded;
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
    this.togglemenu.emit(this.isSideMenuExpanded);
    this.switchBoard.onSideMenuResize.next({'resize': true});
  }

  ngOnInit() {
    jQuery(document).ready(function(){
      jQuery(document).foundation();
    });
  }

  toggleSearch(){
    this.showSearch = !this.showSearch;
  }

  viewUserProfilePage($event){
    let link = ["/user-profile"];
    this.redirect.emit(link);
  }

  showSearchPage(){
    sessionStorage.removeItem('searchcriteria');
    let link = ['search'];
    this._router.navigate(link);
  }
}
