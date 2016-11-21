/**
 * Created by seshu on 25-07-2016.
 */

import {Http, Response} from "@angular/http";
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Observable} from "rxjs/Observable";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {BillModel} from "../models/Bill.model";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";
import {PAYMENTSPATHS} from "../constants/payments.constants";


@Injectable()
export class BillsService extends QountServices {

  constructor(http:Http) {
    super(http);
  }

  bills(companyId:string,filter?:string): Observable<any> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BILLS_SERVICE,null,{id: Session.getUser().id,companyID:companyId});
    if(filter) {
      url = url + "?filter="+filter;
    }
    return this.query(url, SOURCE_TYPE.BIG_PAY).map(res => <any> res.json())
      .catch(this.handleError)
  }

  bill(companyID:string, billID:string): Observable<BillModel> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BILL_SERVICE,null,{id: Session.getUser().id, companyID: companyID, billID: billID});
    return this.query(url, SOURCE_TYPE.BIG_PAY).map(res => <BillModel> res.json())
      .catch(this.handleError)
  }

  createBill(bill:BillModel, companyId): Observable<BillModel> {
    var url = this.interpolateUrl(PAYMENTSPATHS.CREATE_BILL_SERVICE,null,{id: Session.getUser().id, companyID: companyId});
    return this.create(url, bill, SOURCE_TYPE.BIG_PAY).map(res => <BillModel>res.json())
      .catch(this.handleError)
  }

  updateBill(bill:BillModel): Observable<BillModel> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BILL_SERVICE,null,{id: Session.getUser().id, companyID: bill.companyID, billID: bill.id});
    return this.update(url, bill, SOURCE_TYPE.BIG_PAY).map(res => <BillModel>res.json())
      .catch(this.handleError)
  }

  deleteBill(bill:BillModel): Observable<BillModel> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BILL_SERVICE,null,{id: Session.getUser().id, companyID: bill.companyID, billID: bill.id});
    return this.delete(url, SOURCE_TYPE.BIG_PAY).map(res => <BillModel>res.json())
      .catch(this.handleError)
  }

  getConvertedCurrencyValue(from:string,to:string,date:string) : Observable<any>{
    var url = this.interpolateUrl(PAYMENTSPATHS.CURRENCY_CONVERSION_SERVICE,null,{userId: Session.getUser().id, from: from, to: to,date:date});
    return this.query(url, SOURCE_TYPE.BIG_PAY).map(res => <BillModel> res.json())
      .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
