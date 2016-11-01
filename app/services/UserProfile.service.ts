
/**
 * Created by Mateen on 07-05-2016.
 */


import {Observable} from "rxjs/Observable";
import {Response, Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {QountServices} from "../share/services/QountServices";
import {Session} from "../share/services/Session";
import {PATH, SOURCE_TYPE} from "../share/constants/Qount.constants";

@Injectable()
export class UserProfileService extends QountServices{

  userId:String;

  constructor(http: Http) {
    super(http);
    this.userId = Session.getUser().id;
  }

  updateUserProfile(input:any){
    return this.update(PATH.USER_SERVICE+"/"+this.userId,input,SOURCE_TYPE.JAVA)
      .map(res => res)
      .catch(this.handleError)
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
