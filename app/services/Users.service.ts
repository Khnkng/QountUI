import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {UsersModel} from "../models/Users.model";


@Injectable()
export class UsersService extends  QountServices{

    constructor(http: Http) {
        super(http);
    }

    users(companyID): Observable<any> {
        var url = this.interpolateUrl(PATH.USER_ROLE_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    addUser(user:UsersModel, companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.USER_ROLE_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.create(url, user, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    updateUser(user:UsersModel, companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.USER_ROLE_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.update(url+'/'+user.id, user, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    removeUser(userID:string,companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.USER_ROLE_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.delete(url+'/'+userID, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }
    user(userID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.USER_ROLE_SERVICE,null,{userId: Session.getUser().id});
        return this.query(url+"/"+userID, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    roles(): Observable<any> {
        var url = this.interpolateUrl(PATH.ROLES_SERVICE,null,{userId: Session.getUser().id});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }
}
