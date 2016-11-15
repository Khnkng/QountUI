/**
 * Created by seshu on 28-03-2016.
 */

import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {QountServices} from "qCommon/app/services/QountServices";
import {PATH} from "qCommon/app/constants/Qount.constants";
import {SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";


@Injectable()
export class UsersService extends QountServices {

  constructor(http: Http) {
    super(http);
  }

  getUsersByPrefix(prefix: string) : Observable<any> {
    var url = this.interpolateUrl(PATH.USERS_SERVICE, {prefix: prefix}, null);
    return this.query(url, SOURCE_TYPE.NODE)
      .map(res => <any> res.json())
      .catch(this.handleError)
  }

  getUsersById(id: string) {
    return this.query(PATH.USERS+id, SOURCE_TYPE.NODE)
      .map(res => <any> res.json())
      .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }

}
