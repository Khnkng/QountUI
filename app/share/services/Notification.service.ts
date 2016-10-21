/**
 * Created by Mateen on 12-03-2016.
 */


import {Observable} from "rxjs/Observable";
import {Response, Http} from "@angular/http";
import {SOURCE_TYPE, PATH} from "../constants/Qount.constants";
import {QountServices} from "./QountServices";
import {Injectable} from "@angular/core";
import {Session} from "./Session";
import {NotificationModel} from "../models/Notification.model";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class NotificationService extends QountServices{

  userId:String;

  constructor(http: Http) {
    super(http);
    this.userId = Session.getUser().id;
  }

  getNotifications(): Observable<[NotificationModel]> {
    //var url = this.interpolateUrl(PATH.BOARDS_SERVICE,null,{userId: this.userId})
    return this.query(PATH.UNREAD_NOTIFICATIONS_SERVICE, SOURCE_TYPE.NODE)
      .map(res => <[NotificationModel]> res.json())
      .catch(this.handleError)
  }

  getNotificationsCount(): Observable<any> {
    var url = this.interpolateUrl(PATH.NOTIFICATIONS_COUNT,null,{userId: this.userId});
    return this.query(url, SOURCE_TYPE.NODE)
      .map(res => <any> res.json())
      .catch(this.handleError);
  }

  markNotificationsAsRead(notif_id:string): Observable<[NotificationModel]> {
    return this.updateWithoutJson(PATH.NOTIFICATIONS_SERVICE+"/"+notif_id, SOURCE_TYPE.NODE)
      .map(res => res)
      .catch(this.handleError)
  }


  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
