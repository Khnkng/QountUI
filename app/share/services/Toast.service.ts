/**
 * Created by nazia on 13-03-2016.
 */

import {Injectable} from "@angular/core";
import {SwitchBoard} from "./SwitchBoard";

@Injectable()
export class ToastService{
  constructor(private switchBoard: SwitchBoard){}

  pop(type: string, message: string){
    var toastObj = {
      toastId: Math.floor(Math.random() * 1000),
      type: type,
      message: message || "",
      toastClass: "toast-success"
    };
    switch(type){
      case 'success': {
        toastObj.toastClass = "toast-success";
        break;
      }
      case 'error': {
        toastObj.toastClass = "toast-error";
        break;
      }
      case 'info': {
        toastObj.toastClass = "toast-info";
        break;
      }
      case 'warning': {
        toastObj.toastClass = "toast-warning";
        break;
      }
      case 'confirm': {
        toastObj.toastClass = "toast-confirm";
        break;
      }
    }
    this.switchBoard.onNewToast.next(toastObj);
  }
}
