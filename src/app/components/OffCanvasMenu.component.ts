/**
 * Created by yaswanthvadugu on 12/4/16.
 */
import { Component } from '@angular/core';
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";

declare var jQuery:any;
declare var _:any;
@Component({
    selector: 'offcanvas-menu',
    templateUrl: '../views/offCanvasMenu.html'
})
export class OffCanvasMenuComponent {
    private subscription:any;
    private isExpanded:boolean=false;
    constructor(private switchBoard: SwitchBoard) {
        this.subscription = this.switchBoard.onOffCanvasMenuExpand.subscribe(offCanvasExpand =>{
            this.isExpanded = offCanvasExpand;
        });
    }
    ngOnDestroy(){
        this.subscription.unsubscribe();
    }

    closeFlyoutMenu(){
        //this.isExpanded = false;
        jQuery(".qount-off-canvas-menu-buttom").click();
    }
}
