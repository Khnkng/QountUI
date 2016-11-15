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
import {PAYMENTSPATHS} from "../constants/payments.constants";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";

@Injectable()
export class ExcelService extends QountServices {
  userId:string;
  constructor(http:Http) {
    super(http);
    this.userId = Session.getUser().id;
  }

  excel(emailRequest?:any): Observable<any> {
    var url = this.interpolateUrl(PAYMENTSPATHS.EXCEL_SERVICE ,null,{id:this.userId});
    return this.createExcel(url,emailRequest, SOURCE_TYPE.JAVA).map(res => <any> res)
      .catch(this.handleError)
  }


  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
