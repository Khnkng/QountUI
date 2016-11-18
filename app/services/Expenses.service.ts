/**
 * Created by seshu on 18-07-2016.
 */
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {VendorModel} from "../models/Vendor.model";
import {CompanyModel} from "../models/Company.model";
import {ExpensesForm} from "../forms/Expenses.form";


@Injectable()
export class ExpensesSerice extends  QountServices{

  constructor(http: Http) {
    super(http);
  }

  getAllExpenses(company_id:String): Observable<any> {
    var url = this.interpolateUrl(PATH.EXPENSES_SERVICE,null,{id: Session.getUser().id,cid:company_id});
    //var url = "/HalfService/user/"+ Session.getUser().id+"/company/"+company_id+"/expensecode";
    return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
        .catch(this.handleError)
  }

  addExpense(expense:ExpensesForm, company_id:string): Observable<any> {
    //var url = "/HalfService/user/"+ Session.getUser().id+"/company/"+company_id+"/expensecode";
    var url = this.interpolateUrl(PATH.EXPENSES_SERVICE,null,{id: Session.getUser().id,cid:company_id});
    return this.create(url, expense, SOURCE_TYPE.JAVA).map(res => <any> res.json())
        .catch(this.handleError)
  }

  updateExpense(expense:ExpensesForm, company_id:string): Observable<any> {
    //var url = "/HalfService/user/"+ Session.getUser().id+"/company/"+company_id+"/expensecode";
    var url = this.interpolateUrl(PATH.EXPENSES_SERVICE,null,{id: Session.getUser().id,cid:company_id});
    return this.update(url, expense, SOURCE_TYPE.JAVA).map(res => <any> res.json())
        .catch(this.handleError)
  }

  removeExpense(company_id:string,expense_id: string): Observable<any> {
    //var url = this.interpolateUrl(PATH.COMPANIES_SERVICE,null,{id: Session.getUser().id});
    //var url = "/HalfService/user/"+ Session.getUser().id+"/company/"+company_id+"/expensecode/"+expense_id;
    var url = this.interpolateUrl(PATH.EXPENSES_SERVICE,null,{id: Session.getUser().id,cid:company_id});
    return this.delete(url+"/"+expense_id, SOURCE_TYPE.JAVA).map(res => <any> res.json())
        .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
