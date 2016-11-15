import {Router} from "@angular/router";
import {Focus} from "qCommon/app/directives/focus.directive";
import {Ripple} from "qCommon/app/directives/rippler.directive";
import {Component} from "@angular/core";
import {FoundationInit} from "qCommon/app/directives/foundation.directive";
import {BoxService} from "../services/Box.service";
import {BoxModel} from "../models/Box.model";

declare var _:any;
declare var jQuery:any;

@Component({
  selector: 'reports',
  templateUrl: '/app/views/reports.html'
})

export class ReportsComponent {

  constructor(private _router: Router, private boxService: BoxService) {
  }

  private handleError(error:any) {

  }

  goToReport(type){
    let link = ['Report',{type:type}];
    this._router.navigate(link);
  }

  goToReports(name){
    let link = [name];
    this._router.navigate(link);
  }
}
