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
  selector: 'tools',
  templateUrl: '/app/views/tools.html'
})

export class ToolsComponent {

  constructor(private switchBoard:SwitchBoard, private _router:Router) {
    console.info('QountApp Tools Component Mounted Successfully7');
  }

  showPage(page:PAGES, $event) {
    $event && $event.stopImmediatePropagation();
    switch (page) {
      case 'companies': {
        let link = ['companies'];
        this._router.navigate(link);
      }
      break;
      case 'vendors': {
        let link = ['vendors'];
        this._router.navigate(link);
      }
      break;
      case 'chartofaccounts': {
        let link = ['chartOfAccounts'];
        this._router.navigate(link);
      }
      break;
    }
  }
}
