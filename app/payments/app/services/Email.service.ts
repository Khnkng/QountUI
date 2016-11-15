/**
 * Created by Nazia on 28-09-2016.
 */


import {Http, Response} from "@angular/http";
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {BillModel} from "../models/Bill.model";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";


@Injectable()
export class EmailService extends QountServices {

  constructor(http:Http) {
    super(http);
  }

  email(emailRequest?:any): Observable<any> {
    var url = PATH.EMAIL_SERVICE;
    return this.create(url,emailRequest, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }


  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
