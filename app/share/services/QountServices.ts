/**
 * Created by seshu on 07-03-2016.
 */

import {PATH, SOURCE_TYPE} from "../constants/Qount.constants";
import {Http, RequestOptionsArgs, Headers, Response} from "@angular/http";
import {InterPolateUrlService} from "./InterPolateUrl.service";
import {Session} from "./Session";
import {Observable} from "rxjs/Observable";

export class QountServices extends InterPolateUrlService{

  private headers:Headers;
  private http:Http;

  defaultOptionsArgs: RequestOptionsArgs;

  constructor (http: Http) {
    super();
    this.http = http;
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    if(Session.getToken()) {
      this.headers.append('Authorization', 'Bearer ' + Session.getToken());
    }
    this.defaultOptionsArgs = {
      'headers' : this.headers
    };
  }

  private getUrl(servicePath:string, sourceType:string) {
    var url = "";
    switch (sourceType) {
      case SOURCE_TYPE.NODE: {
        url = PATH.NODE_SERVICE_URL + servicePath;
      }
        break;
      case SOURCE_TYPE.JAVA: {
        url = PATH.JAVA_SERVICE_URL + servicePath;
      }
        break;
    }
    return url;
  }

  create(servicePath:string, model:any, sourceType:string, options?:RequestOptionsArgs) : Observable<Response>{
    var url = this.getUrl(servicePath, sourceType);
    var options = options ? options : this.defaultOptionsArgs;
    return this.http.post(url, JSON.stringify(model), options);
  }

  update(servicePath:string, model:any, sourceType:string, options?:RequestOptionsArgs) : Observable<Response>{
    var url = this.getUrl(servicePath, sourceType);
    var options = options ? options : this.defaultOptionsArgs;
    return this.http.put(url, JSON.stringify(model), options);
  }
  updateWithoutJson(servicePath:string, sourceType:string, options?:RequestOptionsArgs) : Observable<Response>{
    var url = this.getUrl(servicePath, sourceType);
    var options = options ? options : this.defaultOptionsArgs;
    return this.http.put(url, null, options);
  }

  delete(servicePath:string, sourceType:string, options?:RequestOptionsArgs) : Observable<Response>{
    var url = this.getUrl(servicePath, sourceType);
    var options = options ? options : this.defaultOptionsArgs;
    return this.http.delete(url, options);
  }

  query(servicePath:string, sourceType:string, options?:RequestOptionsArgs) : Observable<Response>{
    var url = this.getUrl(servicePath, sourceType);
    var options = options ? options : this.defaultOptionsArgs;
    return this.http.get(url, options);
  }

}
