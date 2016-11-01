/**
 * Created by seshu on 28-03-2016.
 */

import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {QountServices} from "../share/services/QountServices";
import {PATH, SOURCE_TYPE} from "../share/constants/Qount.constants";


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
