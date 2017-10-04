import {Injectable} from "@angular/core";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {QountServices} from "qCommon/app/services/QountServices";
import {Session} from "qCommon/app/services/Session";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";

@Injectable()
export class RDcreditsService extends  QountServices{
  constructor(http: Http) {
    super(http);
  }

  credits(companyID): Observable<any> {
    var url = this.interpolateUrl(PATH.RD_CREDITS_SERVICE, null, {id: Session.getUser().id, companyId: companyID});
    return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }

  addCredits(company, companyID: string): Observable<any> {
    var url = this.interpolateUrl(PATH.RD_CREDITS_SERVICE, null, {id: Session.getUser().id, companyId: companyID});
    return this.create(url, company, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

  getCredit(creditId: string, companyID: string): Observable<any> {
    var url = this.interpolateUrl(PATH.RD_CREDITS_SERVICE, null, {id: Session.getUser().id, companyId: companyID});
    return this.query(url+'/'+creditId, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

  updateCredit(credit, companyID: string): Observable<any> {
    var url = this.interpolateUrl(PATH.RD_CREDITS_SERVICE, null, {id: Session.getUser().id, companyId: companyID});
    return this.update(url+'/'+credit.id, credit, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

  removeCredit(credit, companyID: string): Observable<any> {
    var url = this.interpolateUrl(PATH.RD_CREDITS_SERVICE, null, {id: Session.getUser().id, companyId: companyID});
    return this.delete(url+'/'+credit.id, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }

}
