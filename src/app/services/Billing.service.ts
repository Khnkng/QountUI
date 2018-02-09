import {Injectable} from "@angular/core";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {QountServices} from "qCommon/app/services/QountServices";
import {Session} from "qCommon/app/services/Session";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";

@Injectable()
export class BillingService extends  QountServices{
    constructor(http: Http) {
        super(http);
    }

    employees(companyID): Observable<any> {
        var url = this.interpolateUrl(PATH.EMPLOYEES_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    addEmployee(company, companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.EMPLOYEES_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.create(url, company, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    updateEmployee(employee, companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.EMPLOYEES_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.update(url+'/'+employee.id, employee, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    removeEmployee(employeeID:string,companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.EMPLOYEES_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.delete(url+'/'+employeeID, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }
    employee(employeeID:string,companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.EMPLOYEES_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.query(url+"/"+employeeID, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }
}
