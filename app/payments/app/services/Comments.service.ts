
import {Observable} from "rxjs/Observable";
import {Response, Http} from "@angular/http";
import {SOURCE_TYPE, PATH} from "qCommon/app/constants/Qount.constants";
import {Injectable} from "@angular/core";
import {CommentModel} from "../models/Comment.model";
import {QountServices} from "qCommon/app/services/QountServices";
import {Session} from "qCommon/app/services/Session";
import {PAYMENTSPATHS} from "../constants/payments.constants";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";

@Injectable()
export class CommentsService extends QountServices{
  userId:string;
  constructor(http: Http) {
    super(http);
    this.userId = Session.getUser().id;
  }

  saveComments(billId: string, companyID: string, comment:CommentModel): Observable<CommentModel> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BILL_COMMENTS_SERVICE,null,{userId:this.userId,billId: billId, companyID: companyID});
    return this.create(url, comment, SOURCE_TYPE.BIG_PAY)
      .map(res => <CommentModel> res.json())
      .catch(this.handleError);
  }

  getComments(billId: string, companyID: string): Observable<[CommentModel]> {
    var url = this.interpolateUrl(PAYMENTSPATHS.BILL_COMMENTS_SERVICE,null,{userId:this.userId,billId: billId,companyID: companyID});
    return this.query(url, SOURCE_TYPE.BIG_PAY)
      .map(res => <[CommentModel]> res.json())
      .catch(this.handleError);
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
