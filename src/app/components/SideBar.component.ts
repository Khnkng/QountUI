/**
 * Created by seshu on 27-02-2016.
 */

import {Component, Input, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {PAGES} from "qCommon/app/constants/Qount.constants";
import {StateService} from "qCommon/app/services/StateService";
import {pageTitleService} from "qCommon/app/services/PageTitle";


declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'side-bar',
  templateUrl: '../views/sideBar.html'
})

export class SideBarComponent {
  isDashboard:boolean = true;
  isBooks:boolean = false;
  isInvoice:boolean = false;
  isPayments:boolean = false;
  isExpenses:boolean = false;
  report:boolean=false;
  isPayrol:boolean = false;
  isTaxes:boolean = false;
  isTools:boolean = false;
  isReports:boolean=false;

  allBoards:any;
  currentBoardName = null;
  showSwitchCompany:boolean = false;
  currentCompanyId:string;
  currentCompanyName:string;

  @Input() isExpanded:boolean;

  constructor(private switchBoard:SwitchBoard, private _router:Router, private stateService: StateService,private titleService:pageTitleService) {
    console.info('QountApp sidebar Component Mounted Successfully7');
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
    this.isInvoice = false;
    this.isExpenses = false;
    this.isReports = false;
    this.isTaxes = false;
    this.isTools = false;
    this.isPayments=false;
    this.stateService.clearAllStates();
    var base = this;
    switch (page) {
      case PAGES.DASHBOARD: {
        let link = [''];
        this._router.navigate(link);
        base.isDashboard = true;
      }
        break;
      case PAGES.BOOKS: {
        let link = ['books', 'deposits'];
        this._router.navigate(link);
        base.isBooks = true;
      }
        break;
      case PAGES.INVOICES: {
        let link = ['invoices/dashboard', 0];
        this._router.navigate(link);
        base.isInvoice = true;
      }
      break;
      case PAGES.REPORT: {
        let link = ['reports/dashboard'];
        this._router.navigate(link);
        base.isReports = true;
      }
        break;
      case PAGES.TAX: {
        let link = ['tax'];
        this._router.navigate(link);
        base.isTaxes = true;
      }
        break;
      case PAGES.TOOLS: {
        let link = ['tools'];
        this._router.navigate(link);
        base.isTools = true;
      }
        break;
      case PAGES.PAYMENTS: {
        let link = ['payments/dashboard','dashboard'];
        this._router.navigate(link);
        base.isPayments = true;
      }
        break;
    }
  }

  toggleMenu(){
    this.isExpanded = false;
    this.switchBoard.onSideBarExpand.next(this.isExpanded)
  }

  showError(err){

  }
}
