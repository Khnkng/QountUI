import {Component} from "@angular/core";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
/**
 * Created by seshagirivellanki on 17/03/17.
 */


declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'vendors',
    templateUrl: '/app/views/yodleeToken.html'
})

export class YodleeTokenComponent {
    constructor(private switchBoard:SwitchBoard) {
        let status:any = this.getURLParameter("JSONcallBackStatus");
        localStorage.setItem("providerAccountId", status[0].providerAccountId);
        this.switchBoard.onYodleeTokenRecived.next({});
    }

    getURLParameter(name) {
       return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }
}