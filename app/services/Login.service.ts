/**
 * Created by seshu on 10-03-2016.
 */

import {Observable} from "rxjs/Observable";
import {Response, Http} from "@angular/http";

import {Injectable} from "@angular/core";
import {LoginModel} from "../models/Login.model";
import {QountServices} from "../share/services/QountServices";
import {PATH, SOURCE_TYPE} from "../share/constants/Qount.constants";

@Injectable()
export class LoginService extends QountServices{

  constructor(http: Http) {
     super(http);
  }

  activateUser(token): Observable<any> {
    let url = this.interpolateUrl(PATH.ACTIVATE_USER, token);
    return this.query(url, SOURCE_TYPE.NODE, token)
      .map(res => res.json())
      .catch(this.handleError)
  }

  login(loginModel: LoginModel): Observable<any> {
    return this.create(PATH.LOGIN_SERVICE, loginModel, SOURCE_TYPE.NODE)
      .map(res => <any> res.json())
      .catch(this.handleError)
  }

  forgotPassword(forgotPassword): Observable<any> {
    return this.create(PATH.FORGOT_PASSWORD_SERVICE, forgotPassword, SOURCE_TYPE.NODE)
      .map(res => <any> res)
      .catch(this.handleError)
  }

  resetPassword(input): Observable<any> {
    return this.create(PATH.RESET_PASSWORD_SERVICE, input, SOURCE_TYPE.NODE)
      .map(res => <any> res)
      .catch(this.handleError)
  }


  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
