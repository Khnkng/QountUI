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

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }

}