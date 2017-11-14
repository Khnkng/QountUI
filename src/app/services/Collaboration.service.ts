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

  getPosts(index): Observable<any> {
    let indexInc = index;
    if (index !== 0) {
      indexInc = 1 + index;
    }
    indexInc = indexInc.toString();

    const url = this.interpolateUrl(PATH.GET_POSTS, {from: indexInc}, {id: Session.getUser().id, companyId: Session.getCurrentCompany()});
    return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }

  getEntityPosts(entityId, entityType, index): Observable<any> {
    index = index.toString();
    const url = this.interpolateUrl(PATH.GET_ENTITY_POSTS, {entityId: entityId, entityType: entityType, from: index},
      {id: Session.getUser().id, companyId: Session.getCurrentCompany()});
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

  deletePost(id): Observable<any> {
    const url = this.interpolateUrl(PATH.DELETE_POST, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany(), postID: id});
    return this.delete(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }

  deleteComment(commentId, postId): Observable<any> {
    const url = this.interpolateUrl(PATH.DELETE_COMMENT, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany(), postID: postId, commentID: commentId});
    return this.delete(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
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

  like(data): Observable<any> {
    const url = this.interpolateUrl(PATH.LIKE, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany()});
    return this.create(url, data, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }

  unLike(id): Observable<any> {
    const url = this.interpolateUrl(PATH.UNLIKE, null, {id: Session.getUser().id, companyId: Session.getCurrentCompany(), entityID: id});
    return this.delete(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
      .catch(this.handleError);
  }


  private handleError (error: Response) {
    return Observable.throw(error.text());
  }

}
