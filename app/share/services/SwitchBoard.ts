/**
 * Created by seshu on 11-03-2016.
 */

import {Subject} from "rxjs/Subject";
import {UserModel} from "../models/User.model";
import {Injectable} from "@angular/core";

@Injectable()
export class SwitchBoard {
  onLogin:Subject<UserModel>;
  onLogOut:Subject<any>;
  onSideMenuResize:Subject<any>;
  onNewAlert:Subject<any>;
  onNewComment:Subject<any>;
  onNewNotification:Subject<any>;
  onNewQountNotification:Subject<any>;
  onNewToast: Subject<any>;
  onNotificationCountUpdate: Subject<any>;
  onSideBarExpand :Subject<any>;
  onSubmitReport: Subject<any>;
  onFetchCompanies: Subject<any>;
  onPrintWindowClose: Subject<any>;
  onNotificationMarkRead: Subject<any>;

  constructor() {
    this.onLogin = new Subject<UserModel>();
    this.onLogOut = new Subject<any>();
    this.onSideMenuResize = new Subject<any>();
    this.onNewAlert = new Subject<any>();
    this.onNewComment = new Subject<any>();
    this.onNewNotification = new Subject<any>();
    this.onNewQountNotification = new Subject<any>();
    this.onNewToast = new Subject<any>();
    this.onNotificationCountUpdate=new Subject<any>();
    this.onSideBarExpand=new Subject<any>();
    this.onSubmitReport=new Subject<any>();
    this.onFetchCompanies=new Subject<any>();
    this.onPrintWindowClose=new Subject<any>();
    this.onNotificationMarkRead = new Subject<any>();
  }
}
