/**
 * Created by seshu on 29-07-2016.
 */
import {Http, Response} from "@angular/http";
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Observable} from "rxjs/Rx";
import {Session} from "qCommon/app/services/Session";
import {PAYMENTSPATHS} from "../constants/payments.constants";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";


@Injectable()
export class WorkflowService extends QountServices {

  constructor(http:Http) {
    super(http);
  }

  workflow(company:string): Observable<any> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BIGPAY_WORKFLOW_SERVICE,null,{id:Session.getUser().id, company:company});
    return this.query(url, SOURCE_TYPE.WORKFLOW).map(res => <any> res.json()).catch(this.handleError);
  }
  
  createWorkflow(workflow:any, company:string): Observable<any> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BIGPAY_WORKFLOW_SERVICE,null,{id:Session.getUser().id, company:company});
    return this.create(url, workflow, SOURCE_TYPE.WORKFLOW).map(res => <any> res.json()).catch(this.handleError);
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
