/**
 * Created by seshu on 07-03-2016.
 */

import {Http, Response} from "@angular/http";
import {SignUpModel} from "../models/SignUp.model";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";
import {Injectable} from "@angular/core";
import {QountServices} from "../share/services/QountServices";
import {PATH, SOURCE_TYPE} from "../share/constants/Qount.constants";


@Injectable()
export class SignUpService extends  QountServices{

  constructor(http: Http) {
     super(http);
  }

  signUp(signUpModel: SignUpModel): Observable<any> {
    return this.create(PATH.SIGNUP_SERVICE, signUpModel, SOURCE_TYPE.NODE)
      .map(res => <any> res.text())
      .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
