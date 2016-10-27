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
import {AddCompanyComponent} from "./components/AddCompany.component";
import {CompanyComponent} from "./components/Company.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CustomTags} from "./directives/customTags";
import {FilterByValuePipe} from "./pipes/filter-by-value";
import {CustomTagComponent} from "./components/CustomTag.component";

@NgModule({
    imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
    declarations: [ Focus, Ripple, FoundationInit, CompaniesComponent, FTable, ComboBox, AddCompanyComponent, CompanyComponent, CustomTags, FilterByValuePipe, CustomTagComponent],
    exports: [Focus, Ripple, FoundationInit, CompaniesComponent, FTable, ComboBox, AddCompanyComponent, CompanyComponent, CustomTags, FilterByValuePipe, CustomTagComponent]
})
export class ShareModule {

}