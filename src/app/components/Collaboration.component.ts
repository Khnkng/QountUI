/**
 * Created by venkatkollikonda on 18/10/17.
 */
import {Component} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {StateService} from "qCommon/app/services/StateService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";

declare let _:any;
declare let jQuery:any;
declare let moment:any;

@Component({
  selector: 'collaboration',
  templateUrl: '../views/Collaboration.html',
})

export class CollaborationComponent{
  companyId:string;
  routeSubscribe:any;
  logoURL:string;
  reconPeriod:string;
  dateFormat:string;
  serviceDateformat:string;
  filters: any = {'task': '#44B6E8', 'done': '#18457B', 'working': '#F06459', 'active': '#00B1A9', 'celebrating': '#22B473'};
  posts: any = [{"postedBy":"uday.koorella@qount.io","createdDate":"10/09/2017","entityMetadata":[{"name":"name","value":"Expense Title"},{"name":"amount","value":"15.0000000000"},{"name":"date","value":"2017-07-06 00:00:00"},{"name":"bank_account","value":"Chase Checking FA"},{"name":"type","value":"other"},{"name":"referenceNumber","value":""}],"comments":[{"likesCount":6,"createdDate":"2017-10-30 09:34:44","children":[{"likesCount":6,"createdDate":"2017-10-30 09:38:40","children":[{"likesCount":6,"createdDate":"2017-10-30 09:42:19","children":[],"id":"8741054e-7c05-41a4-941d-e033a23a2845","updatedDate":"2017-10-30 09:42:19","postID":"5bc21608-2016-43ae-8180-63de47472dba","message":"111","commentedBy":"uday.koorella@qount.io","parentID":"cf51280f-5f39-4790-94aa-e3fb869989d4"}],"id":"cf51280f-5f39-4790-94aa-e3fb869989d4","updatedDate":"2017-10-30 09:38:40","documentName":"report.pdf","postID":"5bc21608-2016-43ae-8180-63de47472dba","message":"11","commentedBy":"uday.koorella@qount.io","parentID":"766ffb23-c9b7-454d-891c-658826a871aa"},{"likesCount":6,"createdDate":"2017-10-30 09:39:29","children":[],"id":"4eae085b-af81-4ce1-bc0f-124b05fa99f0","updatedDate":"2017-10-30 09:39:29","documentName":"report.pdf","postID":"5bc21608-2016-43ae-8180-63de47472dba","message":"12","commentedBy":"uday.koorella@qount.io","parentID":"766ffb23-c9b7-454d-891c-658826a871aa"}],"id":"766ffb23-c9b7-454d-891c-658826a871aa","updatedDate":"2017-10-30 09:34:44","documentName":"report.pdf","postID":"5bc21608-2016-43ae-8180-63de47472dba","message":"1","commentedBy":"uday.koorella@qount.io","parentID":""},{"likesCount":6,"createdDate":"2017-10-30 09:35:26","children":[],"id":"22d0e41e-f72c-4928-8b94-1d217b96ed12","updatedDate":"2017-10-30 09:35:26","documentName":"report.pdf","postID":"5bc21608-2016-43ae-8180-63de47472dba","message":"2","commentedBy":"uday.koorella@qount.io","parentID":""},{"likesCount":6,"createdDate":"2017-10-30 09:36:14","children":[{"likesCount":6,"createdDate":"2017-10-30 09:43:40","children":[],"id":"acc418c8-4dea-4877-985d-f7ca45e6742a","updatedDate":"2017-10-30 09:43:40","documentName":"report.pdf","postID":"5bc21608-2016-43ae-8180-63de47472dba","message":"33","commentedBy":"uday.koorella@qount.io","parentID":"233b84ae-6e17-4937-82d0-072f269689e8"}],"id":"233b84ae-6e17-4937-82d0-072f269689e8","updatedDate":"2017-10-30 09:36:14","documentName":"report.pdf","postID":"5bc21608-2016-43ae-8180-63de47472dba","message":"3","commentedBy":"uday.koorella@qount.io","parentID":""}],"entityType":"expense","description":"first expense testing","entityID":"00162263-7c72-4baa-8c6a-d110230d93d6","id":"5bc21608-2016-43ae-8180-63de47472dba","updatedDate":"10/09/2017","postedInCompanies":[]},{"postedBy":"uday.koorella@qount.io","createdDate":"10/10/2017","entityMetadata":[{"name":"name","value":"Expense Title"},{"name":"amount","value":"100.0000000000"},{"name":"date","value":"2017-09-25 00:00:00"},{"name":"bank_account","value":"Second Bank"},{"name":"line_title","value":""},{"name":"line_amount","value":"100.0000000000"},{"name":"line_notes","value":""}],"comments":[{"likesCount":7,"createdDate":"2017-10-30 09:53:31","children":[],"id":"518853e6-8a87-4975-aac3-52ec7036789d","updatedDate":"2017-10-30 09:53:31","documentName":"report.pdf","postID":"67e9fd00-6a51-49b5-8196-14337504ff52","message":"0001","commentedBy":"uday.koorella@qount.io","parentID":""}],"entityType":"expenseLine","description":"first expense testing","entityID":"79be094a-22ac-41b2-9e80-53327f4793bc","id":"67e9fd00-6a51-49b5-8196-14337504ff52","updatedDate":"10/10/2017","postedInCompanies":[]}];

  constructor(private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
              private loadingService: LoadingService, private companyService: CompaniesService,private numeralService:NumeralService,
              private stateService: StateService, private titleService:pageTitleService,_switchBoard:SwitchBoard,
              private dateFormater: DateFormater) {
    this.titleService.setPageTitle("Collaboration Wall");
    this.companyId = Session.getCurrentCompany();
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
  }


  getColor(type) {
    return this.filters[type];
  }

  getRight(index) {
      return index * 5 + 'px';
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
