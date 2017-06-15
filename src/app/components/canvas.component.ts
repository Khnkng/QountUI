/**
 * Created by seshu on 18-10-2016.
 */

import { Component } from '@angular/core';
import {pageTitleService} from "qCommon/app/services/PageTitle";

@Component({
    selector: 'qount-canvas',
    template: '<div>main content</div>'
})
export class CanvasComponent {

    constructor(private titleService:pageTitleService) {
        console.log("into it...");
        this.titleService.setPageTitle("Dashboard");
    }
}
