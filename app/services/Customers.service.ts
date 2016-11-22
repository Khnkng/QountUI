import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {CustomersModel} from "../models/Customers.model";


@Injectable()
export class CustomersService extends  QountServices{

    constructor(http: Http) {
        super(http);
    }

    customers(companyID): Observable<any> {
        var url = this.interpolateUrl(PATH.CUSTOMERS_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    addCustomer(company:CustomersModel, companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.CUSTOMERS_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.create(url, company, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    updateCustomer(customer:CustomersModel, companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.CUSTOMERS_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.update(url, customer, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    removeCustomer(customerID:string,companyID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.CUSTOMERS_SERVICE,null,{userId: Session.getUser().id,companyId:companyID});
        return this.delete(url+'/'+customerID, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }
    customer(customerID:string): Observable<any> {
        var url = this.interpolateUrl(PATH.CUSTOMERS_SERVICE,null,{userId: Session.getUser().id});
        return this.query(url+"/"+customerID, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }
}
