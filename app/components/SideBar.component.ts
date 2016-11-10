/**
 * Created by seshu on 27-02-2016.
 */

import {Component, Input, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {PAGES} from "qCommon/app/constants/Qount.constants";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'side-bar',
  templateUrl: '/app/views/sideBar.html'
})

export class SideBarComponent {
  isDashboard:boolean = false;
  isBooks:boolean = false;
  isInvoice:boolean = false;
  isPayments:boolean = false;
  isExpenses:boolean = false;
  isPayrol:boolean = false;
  isTaxes:boolean = false;
  isTools:boolean = false;

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
    if(Session.getCurrentCompany()){
      let currentCompany = _.find(this.companies, {id: Session.getCurrentCompany()});
      this.currentCompanyId = currentCompany.id;
      this.currentCompanyName = currentCompany.name;
    } else if(this.companies.length > 0){
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
    this.switchBoard.onCompanyChange.next({'id': companyId});
  }

  logout() {
    console.log("into logout1");
    Session.destroy();
    this.switchBoard.onLogOut.next({'loggedOut': true})
  }

  showPage(page:PAGES, $event) {
    $event && $event.stopImmediatePropagation();
    this.isDashboard = false;
    this.isBooks = false;
    this.isPayments = false;
    this.isExpenses = false;
    this.isPayrol = false;
    this.isTaxes = false;
    this.isTools = false;
    switch (page) {
      case PAGES.DASHBOARD: {
        let link = [''];
        this._router.navigate(link);
        this.isDashboard = true;
      }
      break;
      case PAGES.BOOKS: {
        let link = ['books'];
        this._router.navigate(link);
        this.isBooks = true;
      }
      break;
      case PAGES.PAYMENTS: {
        let link = ['payments'];
        this._router.navigate(link);
        this.isPayments = true;
      }
      break;
      case PAGES.EXPENSES: {
        let link = ['expenses'];
        this._router.navigate(link);
        this.isExpenses = true;
      }
      break;
      case PAGES.PAYROL: {
        let link = ['payrol'];
        this._router.navigate(link);
        this.isPayrol = true;
      }
      break;
      case PAGES.TAX: {
        let link = ['tax'];
        this._router.navigate(link);
        this.isTaxes = true;
      }
      break;
      case PAGES.TOOLS: {
        let link = ['tools'];
        this._router.navigate(link);
        this.isTools = true;
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
    this.companies = Session.getCompanies() || [];
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
