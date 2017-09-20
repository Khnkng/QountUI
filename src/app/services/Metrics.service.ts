/**
 * Created by venkatkollikonda on 11/08/17.
 */
import {Injectable} from "@angular/core";
import {QountServices} from "qCommon/app/services/QountServices";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {PATH, SOURCE_TYPE} from "qCommon/app/constants/Qount.constants";
import {Session} from "qCommon/app/services/Session";


@Injectable()
export class MetricsService extends  QountServices{

    constructor(http: Http) {
        super(http);
    }

    getMetricsList(companyId): Observable<any> {
        var url = this.interpolateUrl(PATH.GET_METRIC_LIST, null, {id: Session.getUser().id, companyID: companyId});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    getLinesList(metricPeriod,companyId): Observable<any> {
        var url = this.interpolateUrl(PATH.GET_METRIC_LINES, null, {id: Session.getUser().id, companyID: companyId ,month: metricPeriod.month, year: metricPeriod.year});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    createMetricLines(metric, companyId): Observable<any> {
        var url = this.interpolateUrl(PATH.METRIC_LINES,null,{id: Session.getUser().id, companyID: companyId});
        return this.create(url, metric, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    updateMetricLines(metric, companyId): Observable<any> {
        var url = this.interpolateUrl(PATH.METRIC_LINES,null,{id: Session.getUser().id, companyID: companyId});
        return this.update(url, metric, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }


    addMetrics(metric, companyId): Observable<any> {
        var url = this.interpolateUrl(PATH.ADD_METRIC,null,{id: Session.getUser().id, companyID: companyId});
        return this.create(url, metric, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    updateMetric(id, metric, companyId): Observable<any> {
        var url = this.interpolateUrl(PATH.METRIC,null,{id: Session.getUser().id, companyID: companyId, metricID: id});
        return this.update(url, metric, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    removeMetric(id, companyId): Observable<any> {
        var url = this.interpolateUrl(PATH.METRIC,null,{id: Session.getUser().id, companyID: companyId, metricID: id});
        return this.delete(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }

    getMetric(metricId, companyId): Observable<any> {
        var url = this.interpolateUrl(PATH.METRIC, null, {id: Session.getUser().id, companyID: companyId, metricID: metricId});
        return this.query(url, SOURCE_TYPE.JAVA).map(res => <any> res.json())
            .catch(this.handleError)
    }


    private handleError (error: Response) {
        return Observable.throw(error.text());
    }

}