import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {CustomersModel} from "../models/Customers.model";


@Injectable()
export class ModulesService extends  QountServices{

    constructor(http: Http) {
        super(http);
    }

    modules(): Observable<any> {
        var url = this.interpolateUrl(PATH.ALL_MODULES_SERVICE,null,{});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    saveModules(modules:any, companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.MODULES_SERVICE,null,{id: Session.getUser().id,companyId:companyID});
        return this.create(url, modules, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    getModules(companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.MODULES_SERVICE,null,{id: Session.getUser().id,companyId:companyID});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    updateModules(modules:any, companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.MODULES_SERVICE,null,{id: Session.getUser().id,companyId:companyID});
        return this.update(url, modules, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }


    private handleError (error: Response) {
        return Observable.throw(error.text());
    }
}
