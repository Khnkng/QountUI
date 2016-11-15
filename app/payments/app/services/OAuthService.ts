
/**
 * Created by seshu on 30-08-2016.
 */

import {QountServices} from "qCommon/app/services/QountServices";
import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {Session} from "qCommon/app/services/Session";
import {PATH,SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {PAYMENTSPATHS} from "../constants/payments.constants";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";

@Injectable()
export class OAuthService extends QountServices{

  constructor(http: Http) {
    super(http);
  }

  submitCode(code:any, company:string) {
    var url = this.interpolateUrl(PAYMENTSPATHS.DWOLLA_CODE_SUBMISSION_SERVICE,null,{id: Session.getUser().id, company: company});
    return this.create(url, code, SOURCE_TYPE.DWOLLA)
      .map(res => <any> res.json())
      .catch(this.handleError)
  }

  fundingSources(company:string) {
    var url = this.interpolateUrl(PAYMENTSPATHS.DWOLLA_FUNDING_SOURCES_SERVICE,null,{id: Session.getUser().id, company: company});
    return this.query(url, SOURCE_TYPE.DWOLLA)
      .map(res => <any> res.json())
      .catch(this.handleError)
  }

  fundTransfer(transferObj, company:string) {
    var url = this.interpolateUrl(PAYMENTSPATHS.DWOLLA_TRANSFER_FUND_SERVICE,null,{id: Session.getUser().id, company: company});
    return this.create(url, transferObj, SOURCE_TYPE.DWOLLA)
      .map(res => <any> res.json())
      .catch(this.handleError)
  }

  futureFundTransfer(transferObj, company:string) {
    var url = this.interpolateUrl(PAYMENTSPATHS.DWOLLA_TRANSFER_FUND_SERVICE,null,{id: Session.getUser().id, company: company});
    return this.create(url, transferObj, SOURCE_TYPE.DWOLLA)
      .map(res => <any> res.json())
      .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }


}
