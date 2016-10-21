/**
 * Created by seshu on 09-08-2016.
 */
import {Injectable} from "@angular/core";

@Injectable()
export class WindowService {
  
  constructor() {
    window.saveData = (function () {
      var a = document.createElement("a");
      a.style = "display: none";
      document.body.appendChild(a);
      return function (data, fileName) {
        var json = JSON.stringify(data),
          blob = new Blob([json], {type: "octet/stream"}),
          url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      };
    }());
  }
  
  
  
}
