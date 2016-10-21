import {SwitchBoard} from "./SwitchBoard";
import {Injectable} from "@angular/core";

@Injectable()
export class PrintEventService {


  constructor(private switchBoard: SwitchBoard){
    var base = this;
    if (window.matchMedia) {
      var mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener(function(mql) {
        if (mql.matches) {
          base.beforePrint();
        } else {
          base.afterPrint();
        }
      });
    }

    window.onbeforeprint = this.beforePrint;
    window.onafterprint = this.afterPrint;
  }

  beforePrint(){
    debugger;
    console.log("kllooo");
    this.switchBoard.onPrintWindowClose.next(true);
  }
  afterPrint(){
    console.log("kllooo");
    this.switchBoard.onPrintWindowClose.next(false);
  }
}
