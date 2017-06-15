/**
 * Created by seshagirivellanki on 15/03/17.
 */

import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {Session} from "qCommon/app/services/Session";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";

@Injectable()
export class YodleeService extends  QountServices{

    constructor(http: Http) {
        super(http);
    }

    getAccessToken(companyId) : Observable<any> {
        var url = this.interpolateUrl(PATH.YODLEE_ACCESS_TOKEN,null,{id: Session.getUser().id, companyID:companyId});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    submitStatus(companyId, accountId, status) : Observable<any> {
        var url = this.interpolateUrl(PATH.YODLEE_SUBMIT_STATUS,null,{id: Session.getUser().id, companyID:companyId, accountID:accountId});
        return this.create(url, status, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    unlink(companyId, accountId, providerId) : Observable<any> {
        var url = this.interpolateUrl(PATH.YODLEE_DELETE_STATUS,null,{id: Session.getUser().id, companyID:companyId, accountID:accountId, providerID:providerId});
        return this.delete(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }

}