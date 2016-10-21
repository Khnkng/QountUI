/**
 * Created by seshu on 21-10-2016.
 */


import {NgModule} from "@angular/core";
import {LoggedInActivator} from "./services/CheckSessionActivator";
import {Focus} from "./directives/focus.directive";
import {FoundationInit} from "./directives/foundation.directive";
import {Ripple} from "./directives/rippler.directive";
import {PrintEventService} from "./services/PrintEvent.service";
import {WindowService} from "./services/Window.service";
import {ToastService} from "./services/Toast.service";
import {NotificationService} from "./services/Notification.service";
import {SwitchBoard} from "./services/SwitchBoard";
import {FullScreenService} from "./services/fullscreen.service";

@NgModule({
    declarations: [ Focus, Ripple, FoundationInit],
    exports: [LoggedInActivator, Focus, Ripple, FoundationInit, PrintEventService, WindowService, ToastService, NotificationService, SwitchBoard, FullScreenService]
})
export class ShareModule {

}