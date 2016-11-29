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
  isReports:boolean=false;

  allBoards:any;
  currentBoardName = null;
  showSwitchCompany:boolean = false;
  currentCompanyId:string;
  currentCompanyName:string;

  @Input() isExpanded:boolean;

  constructor(private switchBoard:SwitchBoard, private _router:Router) {
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
    this.isPayments = false;
    this.isExpenses = false;
    this.isPayrol = false;
    this.isTaxes = false;
    this.isTools = false;
    this.isReports=false;
    switch (page) {
      case PAGES.DASHBOARD: {
        let link = [''];
        this._router.navigate(link);
        this.isDashboard = true;
      }
        break;
      case PAGES.BOOKS: {
        let link = ['books', 0];
        this._router.navigate(link);
        this.isBooks = true;
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
      case PAGES.PAYMENTS: {
        let link = ['payments/dashboard', 0];
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

  showError(err){

  }
}
