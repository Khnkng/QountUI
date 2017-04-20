/**
 * Created by seshagirivellanki on 18/04/17.
 */

import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {QountServices} from "qCommon/app/services/QountServices";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";
import {Observable} from "rxjs/Rx";



@Injectable()
export class DocumentService extends  QountServices {

    constructor(http: Http) {
        super(http);
    }

    getDocumentsByType(companyId:string, type: any): any {
        var url = this.interpolateUrl(PATH.DOCUMENTS_SERVICE, null, {id: Session.getUser().id, companyId: companyId, type: type});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any>res.json())
            .catch(this.handleError);
    }

    getDocumentById(companyId:string, documentId: string): any {
        var url = this.interpolateUrl(PATH.DOCUMENT_ID_SERVICE, null, {id: Session.getUser().id, companyId: companyId, documentId: documentId});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any>res.json())
            .catch(this.handleError);
    }

    updateDocument(companyId, document): Observable<any> {
        var url = this.interpolateUrl(PATH.DOCUMENT_ID_SERVICE,null,{id: Session.getUser().id, companyId: companyId, documentId: document.id});
        return this.update(url, document, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError);
    }

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }

}