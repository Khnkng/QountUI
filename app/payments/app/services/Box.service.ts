/**
 * Created by seshu on 16-08-2016.
 */
import {Http, Response} from "@angular/http";
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {BoxModel} from "../models/Box.model";
import {PAYMENTSPATHS} from "../constants/payments.constants";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";


@Injectable()
export class BoxService extends QountServices {

  constructor(http:Http) {
    super(http);
  }

  boxInfo(): Observable<BoxModel> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BOX_SERVICE,null,{id: Session.getUser().id});
    return this.create(url,null,SOURCE_TYPE.BIG_PAY).map(res => <any> res.json())
      .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
