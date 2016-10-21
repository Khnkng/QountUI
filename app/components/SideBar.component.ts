/**
 * Created by seshu on 27-02-2016.
 */

import {Component, Input} from "@angular/core";
import {Router} from "@angular/router";
import {SwitchBoard} from "../share/services/SwitchBoard";
import {Session} from "../share/services/Session";
import {PAGES} from "../share/constants/Qount.constants";


@Component({
  selector: 'side-bar',
  templateUrl: '/app/views/sideBar.html'
})

export class SideBarComponent {

  isDashboard:boolean = false;
  isCompanies:boolean = false;
  isWorkflow:boolean = false;
  isNotifications:boolean = false;
  isReports:boolean = false;
  allBoards:any;
  currentBoardName = null;

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
    this.isCompanies = false;
    this.isWorkflow = false;
    this.isNotifications = false;
    switch (page) {
      case PAGES.DASHBOARD: {
        let link = ['Dashboard',{tabId:0}];
        this._router.navigate(link);
        this.isDashboard = true;
      }
      break;
      case PAGES.COMPANIES: {
        let link=['/Companies'];
        this._router.navigate(link);
        this.isCompanies = true;
      }
      break;
      case PAGES.WORKFLOW: {
        let link=['/Workflow'];
        this._router.navigate(link);
        this.isWorkflow = true;
      }
      break;
      case PAGES.NOTIFICATIONS: {
        let link=['/Notification'];
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

  showError(err){

  }
}
