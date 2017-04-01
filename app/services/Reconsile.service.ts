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
        var url = this.interpolateUrl(PATH.RECONCILE_GET_RECON,null,{id:Session.getUser().id,companyId:Session.getCurrentCompany()});
        return this.create(url,data, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    createReconcile(data:any) : Observable<any> {
        var url = this.interpolateUrl(PATH.RECONCILE_CREATE_RECON,null,{id:Session.getUser().id,companyId:Session.getCurrentCompany()});
        return this.update(url, data, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    getStartingBalance(bankId:number) : Observable<any> {
        var url = this.interpolateUrl(PATH.RECONCILE_RECON_STARTING_BALANCE,null,{id:Session.getUser().id,companyId:Session.getCurrentCompany(),bankId:bankId});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    updateStartingBalance(data:any,bankId): Observable<any> {
        var url = this.interpolateUrl(PATH.RECONCILE_RECON_DATE,null,{id: Session.getUser().id,companyId:Session.getCurrentCompany(),bankId:bankId});
        return this.update(url, data, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    getUnreconciledCount() : Observable<any> {
        var url = this.interpolateUrl(PATH.RECONCILE_RECON_COUNT,null,{id:Session.getUser().id,companyId:Session.getCurrentCompany()});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    getUnreconciledRecords() : Observable<any> {
        var url = this.interpolateUrl(PATH.RECONCILE_UNRECON_DATA, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany()});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }


    private handleError (error: Response) {
        return Observable.throw(error.text());
    }

}