/**
 * Created by seshu on 08-08-2016.
 */

import {Http, Response} from "@angular/http";
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {DocHubModel} from "../models/DocHub.model";
import {PAYMENTSPATHS} from "../constants/payments.constants";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";


@Injectable()
export class DocHubService extends QountServices {

  downLoadAnchor:any;

  constructor(http:Http) {
    super(http);
    this.downLoadAnchor = document.createElement("a");
    document.body.appendChild(this.downLoadAnchor);
    this.downLoadAnchor.style = "display: none";
  }

  getLink(docHubModel:DocHubModel): Observable<DocHubModel>{
    var url = this.interpolateUrl(PAYMENTSPATHS.DOCHUB_SERVICE,null,{id: Session.getUser().id});
    let queryParams = "?accessLinkFlag="+docHubModel.accessLinkFlag;
    queryParams += "&bucketName="+docHubModel.bucketName;
    queryParams += "&keyName="+docHubModel.keyName;
    queryParams += "&token="+docHubModel.token;
    return this.query(url+queryParams, SOURCE_TYPE.DOCHUB)
      .map(res => <any> res.json())
      .catch(this.handleError)
  }

  getStream(docHubModel:DocHubModel): Observable<Response>{
    var url = this.interpolateUrl(PAYMENTSPATHS.DOCHUB_SERVICE,null,{id: Session.getUser().id});
    return this.create(url, docHubModel, SOURCE_TYPE.DOCHUB)
      .catch(this.handleError)
  }

  getStreamLink(docHubModel:DocHubModel):string {
    var url = this.interpolateUrl(PAYMENTSPATHS.DOCHUB_SERVICE,null,{id: Session.getUser().id});
    let queryParams = "?download=true";
    queryParams += "&bucketName="+docHubModel.bucketName;
    queryParams += "&keyName="+docHubModel.keyName;
    queryParams += "&token="+docHubModel.token;
    return PAYMENTSPATHS.DOCHUB_SERVICE_URL+url+queryParams;
  }

  downloadFile(data: Response, fileName:string){
    //let json = JSON.stringify(data);
    var byteArray = new Uint8Array(data['_body']);
    let blob = new Blob([byteArray], {type: data.headers.get('Content-Type')});
    //let url:string = window.URL.createObjectURL(blob);
    //let uriContent = "data:application/octet-stream," + encodeURIComponent(url);
    //window.location.href = uriContent
    //this.downLoadAnchor.href = encodeURIComponent(url);
    /* this.downLoadAnchor.href = url;
     this.downLoadAnchor.download = fileName;
     this.downLoadAnchor.click();
     window.URL.revokeObjectURL(url);*/
     saveAs(blob, fileName);
  }




  private handleError (error: Response) {
    return Observable.throw(error.text());
  }
}
