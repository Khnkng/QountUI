/**
 * Created by venkatkollikonda on 27/03/17.
 */
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";


@Injectable()
export class ReconcileService extends  QountServices{

    constructor(http: Http) {
        super(http);
    }

    getReconcileData(data:any) : Observable<any> {
        var url = this.interpolateUrl(PATH.RECONCILE_GET_RECORN,null,{id:Session.getUser().id,companyId:Session.getCurrentCompany()});
        return this.create(url,data, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    createReconcile(data:any) : Observable<any> {
        var url = this.interpolateUrl(PATH.RECONCILE_CREATE_RECORN,null,{id:Session.getUser().id,companyId:Session.getCurrentCompany()});
        return this.create(url, data, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }

}