/**
 * Created by seshu on 18-07-2016.
 */
import {Injectable} from "@angular/core";
import {QountServices} from "./QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "../constants/Qount.constants";
import {Session} from "./Session";
import {CompanyModel} from "../../models/Company.model";


@Injectable()
export class CompaniesService extends  QountServices{

  constructor(http: Http) {
    super(http);
  }

  companies(): Observable<any> {
    var url = this.interpolateUrl(PATH.COMPANIES_SERVICE,null,{id: Session.getUser().id});
    return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

  company(companyName:string): Observable<any> {
    var url = this.interpolateUrl(PATH.COMPANIES_SERVICE,null,{id: Session.getUser().id});
    return this.query(url+"/"+companyName, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

  add(company:CompanyModel): Observable<any> {
    var url = this.interpolateUrl(PATH.COMPANIES_SERVICE,null,{id: Session.getUser().id});
    return this.create(url, company, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

  updateCompany(company:CompanyModel): Observable<any> {
    var url = this.interpolateUrl(PATH.COMPANIES_SERVICE,null,{id: Session.getUser().id});
    return this.update(url+"/"+company.id, company, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }

  removeCompany(companyID:string): Observable<any> {
    var url = this.interpolateUrl(PATH.COMPANIES_SERVICE,null,{id: Session.getUser().id});
    return this.delete(url+"/"+companyID, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError)
  }

}
