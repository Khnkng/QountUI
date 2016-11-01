/**
 * Created by seshu on 24-03-2016.
 */
import {SwitchBoard} from "./SwitchBoard";
import {Injectable} from "@angular/core";
import {Session} from "./Session";
import {PATH} from "../constants/Qount.constants";
import {CompaniesService} from "./Companies.service";


declare var io;

export enum SocketServiceType{ALERTS_COMMENTS, NOTIFICATIONS, QOUNT_NOTIFICATIONS}

@Injectable()
export class SocketService {
  private alertsCommentsSocket:any;
  private notificationsSocket:any;
  private qountNotificationsSocket:any;

  constructor(private switchBoard: SwitchBoard, private companyService: CompaniesService){
    debugger;
    var base = this;
    if (window.matchMedia) {
      var mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener(function(mql) {
        if (mql.matches) {
          base.beforePrint();
        } else {
          base.afterPrint();
        }
      });
    }

    window.onbeforeprint = this.beforePrint;
    window.onafterprint = this.afterPrint;




    console.log("into alerts...");
    /*var base = this;
     this.alertsCommentsSocket = io.connect(PATH.ALERTS_AND_COMMENTS_URL, {path: PATH.ALERTS_AND_COMMENTS_PATH});
     this.notificationsSocket = io.connect(PATH.NOTIFICATIONS_URL, {path: PATH.NOTIFICATIONS_PATH});
     this.alertsCommentsSocket.on('connect', function() {
     console.log('alerts connected');
     base.emitUserStatus();
     base.defaultEvents(SocketServiceType.ALERTS_COMMENTS);
     });
     this.notificationsSocket.on('connect', function() {
     console.log('notifications connected');
     base.emitUserStatus();
     base.defaultEvents(SocketServiceType.NOTIFICATIONS);
     });
     this.switchBoard.onLogin.subscribe(status => this.emitUserStatus());
     this.switchBoard.onLogOut.subscribe(status => this.disconnect());*/

    var base = this;

    this.notificationsSocket = io.connect(PATH.NOTIFICATIONS_URL, {path: PATH.NOTIFICATIONS_PATH});
    this.notificationsSocket.on('connect', function() {
      console.log('notifications connected');
      base.emitUserStatus();
    });

    this.qountNotificationsSocket = io.connect(PATH.QOUNT_NOTIFICATIONS_URL, {path: PATH.NOTIFICATIONS_PATH});
    this.qountNotificationsSocket.on('connect', function() {
      console.log('qnotifications connected');
      base.emitUserStatus();
    });
    base.defaultEvents(SocketServiceType.NOTIFICATIONS);
    base.defaultEvents(SocketServiceType.QOUNT_NOTIFICATIONS);
    this.switchBoard.onLogin.subscribe(status => this.emitUserStatus());
    this.switchBoard.onLogOut.subscribe(status => this.disconnect());
  }

  on(event:string, type:SocketServiceType, callBack) {
    switch(type) {
      case SocketServiceType.ALERTS_COMMENTS: {
        console.log("intooooo1", event);
        this.alertsCommentsSocket.on(event, callBack);
      }
        break;
      case SocketServiceType.NOTIFICATIONS: {
        console.log("intooooo2", event);
        this.notificationsSocket.on(event, callBack);
      }
      break;
      case SocketServiceType.QOUNT_NOTIFICATIONS: {
        console.log("intooooo3", event);
        this.qountNotificationsSocket.on(event, callBack);
      }
      break;
    }
  }

  emit(event:string, type:SocketServiceType, obj?:any) {
    switch(type) {
      case SocketServiceType.ALERTS_COMMENTS: {
        this.alertsCommentsSocket.emit(event, obj);
      }
        break;
      case SocketServiceType.NOTIFICATIONS: {
        this.notificationsSocket.emit(event, obj);
      }
        break;
      case SocketServiceType.QOUNT_NOTIFICATIONS: {
        this.qountNotificationsSocket.emit(event, obj);
      }
        break;
    }
  }

  disconnect() {
    //this.alertsCommentsSocket.emit('disconnect', {});
    this.notificationsSocket.emit('disconnect', {});
    this.qountNotificationsSocket.emit('disconnect', {});
  }

  defaultEvents(type: SocketServiceType) {
    switch(type) {
      case SocketServiceType.ALERTS_COMMENTS: {
        this.on('new:card_alert', type, (alert) => this.handleAlerts(alert));
        this.on('new:comment', type, (comment) => this.handleComments(comment));
      }
        break;
      case SocketServiceType.NOTIFICATIONS: {
        this.on('new:notification', type, (notification) => this.handleNotifications(notification));
        this.on('new:notification_count', type, (notification) => this.handleNotificationCount(notification));
      }
        break;
      case SocketServiceType.QOUNT_NOTIFICATIONS: {
        this.on('new:qount-notification', type, (notification) => this.handleQountNotifications(notification));
      }
        break;
    }
  }

  emitUserStatus() {
    if(Session.hasSession()) {
       //this.emit('new:user', SocketServiceType.ALERTS_COMMENTS, {userId : Session.getUser().id});
       this.emit('new:user', SocketServiceType.NOTIFICATIONS, {userId : Session.getUser().id});
      this.companyService.companies()
        .subscribe(companies  => {
          this.emit('new:user', SocketServiceType.QOUNT_NOTIFICATIONS, {userId : Session.getUser().id, companies : companies});
        }, error =>  {});
    }
  }

  handleAlerts(alert: any) {
    console.log("got alert event", alert);
    this.switchBoard.onNewAlert.next(alert);
  }

  handleComments(comment: any) {
    console.log("got comment event", comment);
    this.switchBoard.onNewComment.next(comment);
  }

  handleNotifications(notifications: any) {
    console.log("got notification event", notifications);
    this.switchBoard.onNewNotification.next(notifications);
  }

  handleQountNotifications(notifications: any) {
    console.log("got qount notification event", notifications);
    this.switchBoard.onNewQountNotification.next(notifications);
  }

  handleNotificationCount(notifications: any) {
    console.log("got notification count event", notifications);
    this.switchBoard.onNotificationCountUpdate.next(notifications);
  }
  beforePrint(){
    this.switchBoard.onPrintWindowClose.next(true);
  }
  afterPrint(){
    this.switchBoard.onPrintWindowClose.next(false);
  }

}
