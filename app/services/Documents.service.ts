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

    getDocumentBySource(sourceId: any): any {
        var url = this.interpolateUrl(PATH.SOURCES_SERVICE, null, {id: Session.getUser().id, sourceId: sourceId});
        return this.query(url, SOURCE_TYPE.DOCUMENT).map(res => <any>res.json())
            .catch(this.handleError);
    }

    getDocumentById(documentId: string, sourceId: string): any {
        var url = this.interpolateUrl(PATH.SOURCES_DOCUMENT_SERVICE, null, {id: Session.getUser().id, sourceId: sourceId, documentId: documentId});
        return this.query(url, SOURCE_TYPE.DOCUMENT).map(res => <any>res.json())
            .catch(this.handleError);
    }

    private handleError (error: Response) {
        return Observable.throw(error.text());
    }

}