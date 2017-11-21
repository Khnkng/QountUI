/**
 * Created by seshagirivellanki on 18/04/17.
 */

import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {QountServices} from "qCommon/app/services/QountServices";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {Observable} from "rxjs/Rx";
import {UrlService} from "qCommon/app/services/UrlService";


@Injectable()
export class DocumentService extends  QountServices {

    constructor(http: Http) {
        super(http);
    }

    getDocumentBySource(sourceId: any, sourceType: any): any {
        var url = this.interpolateUrl(PATH.SOURCES_SERVICE, {sourceId: sourceId, sourceType: sourceType}, {id: Session.getUser().id, companyId: Session.getCurrentCompany()});
        return this.query(url, SOURCE_TYPE.DOCUMENT).map(res => <any>res.json())
            .catch(this.handleError);
    }

    getDocumentById(documentId: string, sourceId: string, sourceType): any {
        var url = this.interpolateUrl(PATH.SOURCES_DOCUMENT_SERVICE, {sourceId: sourceId, sourceType: sourceType}, {id: Session.getUser().id, companyId: Session.getCurrentCompany(), documentId: documentId});
        return this.query(url, SOURCE_TYPE.DOCUMENT).map(res => <any>res.json())
            .catch(this.handleError);
    }

    updateDocument(companyId, document): Observable<any> {
        var url = this.interpolateUrl(PATH.DOCUMENT_ID_SERVICE,null,{id: Session.getUser().id, companyId: companyId, documentId: document.id});
        return this.update(url, document, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError);
    }

    getDocumentsByType(companyId: string, typeParam: string): Observable<any> {
      var url = this.interpolateUrl(PATH.DOCUMENT_TYPE_SERVICE,null,{id: Session.getUser().id, companyId: companyId});
      return this.query(url+"?docType="+typeParam, SOURCE_TYPE.JAVA).map(res => <any> res.json())
        .catch(this.handleError);
    }

    getDocumentServiceUrl(companyId: string, typeParam: string): string {
      let url = this.interpolateUrl(PATH.DOCUMENT_SERVICE, null, {id: Session.getUser().id, companyId: companyId});
      url = UrlService.getBaseUrl('DOCUMENT') + url + "?docType=" + typeParam;
      return url;
    }

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }

}
