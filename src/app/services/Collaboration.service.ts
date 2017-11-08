/**
 * Created by venkatkollikonda on 27/03/17.
 */
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {UrlService} from "qCommon/app/services/UrlService";


@Injectable()
export class CollaborationService extends  QountServices {

  constructor(http: Http) {
    super(http);
  }

  getPosts(): Observable<any> {
    const url = this.interpolateUrl(PATH.GET_POSTS, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany()});
    return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }




  createPost(data: any): Observable<any> {
    const url = this.interpolateUrl(PATH.CREATE_POST, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany()});
    return this.create(url, data, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }

  createComment(data: any): Observable<any> {
    const url = this.interpolateUrl(PATH.CREATE_COMMENT, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany(), postID: data.postID});
    return this.create(url, data, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }

  getDocumentServiceUrl(companyId: string): string {
    let url = this.interpolateUrl(PATH.DOCUMENT_SERVICE, null, {id: Session.getUser().id, companyId: companyId});
    url = UrlService.getBaseUrl('DOCUMENT') + url;
    return url;
  }

  getDocument(id): Observable<any> {
    const url = this.interpolateUrl(PATH.DOCUMENT_DOWNLOAD, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany(), documentId: id});
    return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }

  private handleError (error: Response) {
    return Observable.throw(error.text());
  }

}
