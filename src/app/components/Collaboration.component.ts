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
  hasReconcileData:boolean = false;
  reconDate:string;
  reconCompletedOn:string;
  previousReconDate:string;
  reconPeriod:string;
  dateFormat:string;
  serviceDateformat:string;

  constructor(private toastService: ToastService, private _router:Router, private _route: ActivatedRoute,
              private loadingService: LoadingService, private companyService: CompaniesService,private numeralService:NumeralService,
              private stateService: StateService, private titleService:pageTitleService,_switchBoard:SwitchBoard,
              private dateFormater: DateFormater) {
    this.titleService.setPageTitle("Collaboration Wall");
    this.companyId = Session.getCurrentCompany();
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
  }


  ngOnInit(){
  }

  ngOnDestroy(){
  }

}
