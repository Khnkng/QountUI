/**
 * Created by Bighalf-PC on 9/25/2016.
 */
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http, Headers} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {PAYMENTSPATHS} from "../constants/payments.constants";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";


@Injectable()
export class ReportService extends  QountServices{

  constructor(http: Http) {
    super(http);
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }

  generateReport(data): Observable<any> {
    var url = this.interpolateUrl(PAYMENTSPATHS.REPORT_SERVICE,null,{id: Session.getUser().id,companyID:data.company});
    return this.create(url, data, SOURCE_TYPE.BIG_PAY).map(res => <any> res.json())
      .catch(this.handleError)
  }

  saveCustomizationObj(data): Observable<any>{
    var url = this.interpolateUrl(PAYMENTSPATHS.REPORTS_SERVICE,null,{userID: Session.getUser().id, companyID:data.company, reportType: data.reportType});
    return this.create(url, data, SOURCE_TYPE.BIG_PAY).map(res => <any> res.json())
      .catch(this.handleError)
  }

  getCustomizationObj(appName, company, reportType): Observable<any>{
    var url = this.interpolateUrl(PAYMENTSPATHS.REPORTS_SERVICE,null,{userID: Session.getUser().id, companyID:company, reportType: reportType});
    let headers = new Headers();
    headers.append('app', appName);
    let appNameHeader = {
      'headers' : headers
    };
    return this.query(url, SOURCE_TYPE.BIG_PAY, appNameHeader).map(res => <any> res.json())
      .catch(this.handleError)
  }

  getBillDetails(data,companyID){
    var url = this.interpolateUrl(PAYMENTSPATHS.CREATE_BILL_SERVICE,null,{id: Session.getUser().id, companyID:companyID});
    return this.create(url, data, SOURCE_TYPE.BIG_PAY).map(res => <any> res.json())
      .catch(this.handleError)
  }
}
