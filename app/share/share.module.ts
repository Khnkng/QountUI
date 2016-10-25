/**
 * Created by seshu on 21-10-2016.
 */


import {NgModule} from "@angular/core";
import {Focus} from "./directives/focus.directive";
import {FoundationInit} from "./directives/foundation.directive";
import {Ripple} from "./directives/rippler.directive";
import {CompaniesComponent} from "./components/Companies.component";
import {FTable} from "./directives/footable.directive";
import {ComboBox} from "./directives/comboBox.directive";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [RouterModule, CommonModule],
    declarations: [ Focus, Ripple, FoundationInit, CompaniesComponent, FTable, ComboBox],
    exports: [Focus, Ripple, FoundationInit, CompaniesComponent, FTable, ComboBox]
})
export class ShareModule {

}