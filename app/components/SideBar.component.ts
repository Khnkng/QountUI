/**
 * Created by seshu on 27-02-2016.
 */

import {Component, Input, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "../share/services/SwitchBoard";
import {Session} from "../share/services/Session";
import {PAGES} from "../share/constants/Qount.constants";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'side-bar',
  templateUrl: '/app/views/sideBar.html'
})

export class SideBarComponent {

  isDashboard:boolean = false;
  isCompanies:boolean = false;
  isVendors:boolean = false;
  isWorkflow:boolean = false;
  isNotifications:boolean = false;
  isReports:boolean = false;
  allBoards:any;
  currentBoardName = null;
  companies:Array<any>;
  showSwitchCompany:boolean = false;
  currentCompanyId:string;
  currentCompanyName:string;

  @Input() isExpanded:boolean;

  constructor(private switchBoard:SwitchBoard, private _router:Router) {
    console.info('QountApp sidebar Component Mounted Successfully7');
    this.companies = Session.getCompanies() || [];
    if(this.companies.length > 0){
      this.currentCompanyId = this.companies[0].id;
      this.currentCompanyName = this.companies[0].name;
    }
  }

  changeCompany(companyId){
    Session.setCurrentCompany(companyId);
    let currentCompany = _.find(this.companies, {id: companyId});
    this.currentCompanyId = currentCompany.id;
    this.currentCompanyName = currentCompany.name;
    jQuery("#switchCompany").foundation('close');
    this.showSwitchCompany = !this.showSwitchCompany;
    this.toggleMenu();
    this.switchBoard.onCompanyChange.next({'companyId': companyId});
  }

  logout() {
    console.log("into logout1");
    Session.destroy();
    this.switchBoard.onLogOut.next({'loggedOut': true})
  }

  showPage(page:PAGES, $event) {
    $event && $event.stopImmediatePropagation();
    this.isDashboard = false;
    this.isCompanies = false;
    this.isVendors = false;
    this.isWorkflow = false;
    this.isNotifications = false;
    switch (page) {
      case PAGES.DASHBOARD: {
        let link = ['/dashboard'];
        this._router.navigate(link);
        this.isDashboard = true;
      }
      break;
      case PAGES.COMPANIES: {
        let link=['/companies'];
        this._router.navigate(link);
        this.isCompanies = true;
      }
      break;
      case PAGES.VENDORS: {
        let link=['/vendors'];
        this._router.navigate(link);
        this.isVendors = true;
      }
        break;
      case PAGES.WORKFLOW: {
        let link=['/Workflow'];
        this._router.navigate(link);
        this.isWorkflow = true;
      }
      break;
      case PAGES.NOTIFICATIONS: {
        let link=['/notification'];
        this._router.navigate(link);
        this.isNotifications = true;
      }
      break;
      case PAGES.REPORTS: {
        let link=['/Reports'];
        this._router.navigate(link);
        this.isReports = true;
      }
      break;
    }
  }

  toggleMenu(){
    this.isExpanded = !this.isExpanded;
    this.switchBoard.onSideBarExpand.next(this.isExpanded)
  }

  showCompaniesDropdown($event){
    $event && $event.preventDefault();
    $event && $event.stopImmediatePropagation();
    if(!this.showSwitchCompany){
      jQuery("#switchCompany").foundation('open');
    } else{
      jQuery("#switchCompany").foundation('close');
    }
    this.showSwitchCompany = !this.showSwitchCompany;
  }

  showError(err){

  }
}
