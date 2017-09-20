/**
 * Created by seshu on 21-10-2016.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var focus_directive_1 = require("./directives/focus.directive");
var foundation_directive_1 = require("./directives/foundation.directive");
var rippler_directive_1 = require("./directives/rippler.directive");
var Companies_component_1 = require("./components/Companies.component");
var footable_directive_1 = require("./directives/footable.directive");
var comboBox_directive_1 = require("./directives/comboBox.directive");
var HighChart_directive_1 = require("./directives/HighChart.directive");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var AddCompany_component_1 = require("./components/AddCompany.component");
var Company_component_1 = require("./components/Company.component");
var forms_1 = require("@angular/forms");
var customTags_1 = require("./directives/customTags");
var filter_by_value_1 = require("./pipes/filter-by-value");
var CustomTag_component_1 = require("./components/CustomTag.component");
var UserProfile_component_1 = require("./components/UserProfile.component");
var CheckSessionActivator_1 = require("./services/CheckSessionActivator");
var DashBoardActivator_1 = require("./services/DashBoardActivator");
var fullscreen_service_1 = require("./services/fullscreen.service");
var SwitchBoard_1 = require("./services/SwitchBoard");
var Notification_service_1 = require("./services/Notification.service");
var Toast_service_1 = require("./services/Toast.service");
var Window_service_1 = require("./services/Window.service");
var PrintEvent_service_1 = require("./services/PrintEvent.service");
var Login_service_1 = require("./services/Login.service");
var Companies_service_1 = require("./services/Companies.service");
var Currency_service_1 = require("./services/Currency.service");
var Vendor_form_1 = require("./forms/Vendor.form");
var Company_Form_1 = require("./forms/Company.Form");
var UserProfile_service_1 = require("./services/UserProfile.service");
var Socket_service_1 = require("./services/Socket.service");
var ChartOfAccounts_service_1 = require("./services/ChartOfAccounts.service");
var CodesService_service_1 = require("./services/CodesService.service");
var ExpenseCodes_service_1 = require("./services/ExpenseCodes.service");
var JournalEntries_service_1 = require("./services/JournalEntries.service");
var DimensionService_service_1 = require("./services/DimensionService.service");
var address_directive_1 = require("./directives/address.directive");
var Address_components_1 = require("./components/Address.components");
var USAddress_form_1 = require("./forms/USAddress.form");
var INDAddress_form_1 = require("./forms/INDAddress.form");
var FinancialAccounts_service_1 = require("./services/FinancialAccounts.service");
var CompanyUsers_service_1 = require("./services/CompanyUsers.service");
var ng2_file_upload_1 = require("ng2-file-upload");
var Customers_service_1 = require("./services/Customers.service");
var Expense_service_1 = require("./services/Expense.service");
var Deposit_service_1 = require("./services/Deposit.service");
var numeral_directive_1 = require("./directives/numeral.directive");
var Numeral_service_1 = require("./services/Numeral.service");
var Employees_service_1 = require("./services/Employees.service");
var Badge_service_1 = require("./services/Badge.service");
var Payments_service_1 = require("./services/Payments.service");
var customDatepicker_1 = require("./directives/customDatepicker");
var customDatepicker1_1 = require("./directives/customDatepicker1");
var DateFormatter_service_1 = require("./services/DateFormatter.service");
var Budget_service_1 = require("./services/Budget.service");
var StateService_1 = require("./services/StateService");
var PaymentsPlan_service_1 = require("./services/PaymentsPlan.service");
var ShareModule = (function () {
    function ShareModule() {
    }
    return ShareModule;
}());
ShareModule = __decorate([
    core_1.NgModule({
        imports: [router_1.RouterModule, common_1.CommonModule, forms_1.FormsModule, forms_1.ReactiveFormsModule],
        declarations: [focus_directive_1.Focus, rippler_directive_1.Ripple, foundation_directive_1.FoundationInit, Companies_component_1.CompaniesComponent, footable_directive_1.FTable, comboBox_directive_1.ComboBox, AddCompany_component_1.AddCompanyComponent, Company_component_1.CompanyComponent,
            customTags_1.CustomTags, filter_by_value_1.FilterByValuePipe, CustomTag_component_1.CustomTagComponent, UserProfile_component_1.UserProfileComponent, address_directive_1.Address, Address_components_1.USAddressContent, Address_components_1.INAddressContent,
            ng2_file_upload_1.FileDropDirective, ng2_file_upload_1.FileSelectDirective, numeral_directive_1.Numeral, customDatepicker_1.CustomDatepicker, customDatepicker1_1.CustomDatepicker1, HighChart_directive_1.HighChart],
        exports: [router_1.RouterModule, focus_directive_1.Focus, rippler_directive_1.Ripple, foundation_directive_1.FoundationInit, Companies_component_1.CompaniesComponent, footable_directive_1.FTable, comboBox_directive_1.ComboBox, AddCompany_component_1.AddCompanyComponent,
            Company_component_1.CompanyComponent, customTags_1.CustomTags, filter_by_value_1.FilterByValuePipe, CustomTag_component_1.CustomTagComponent, UserProfile_component_1.UserProfileComponent, address_directive_1.Address, Address_components_1.USAddressContent,
            Address_components_1.INAddressContent, ng2_file_upload_1.FileDropDirective, ng2_file_upload_1.FileSelectDirective, numeral_directive_1.Numeral, HighChart_directive_1.HighChart],
        providers: [CheckSessionActivator_1.LoggedInActivator, DashBoardActivator_1.DashBoardActivator, fullscreen_service_1.FullScreenService, SwitchBoard_1.SwitchBoard, Notification_service_1.NotificationService, Toast_service_1.ToastService,
            Window_service_1.WindowService, PrintEvent_service_1.PrintEventService, Login_service_1.LoginService, Companies_service_1.CompaniesService, Currency_service_1.CurrencyService, ChartOfAccounts_service_1.ChartOfAccountsService, Vendor_form_1.VendorForm,
            common_1.CurrencyPipe, filter_by_value_1.FilterByValuePipe, Company_Form_1.CompanyForm, UserProfile_service_1.UserProfileService, Socket_service_1.SocketService, CodesService_service_1.CodesService, ExpenseCodes_service_1.ExpensesService,
            JournalEntries_service_1.JournalEntriesService, DimensionService_service_1.DimensionService, USAddress_form_1.USAddressForm, INDAddress_form_1.INDAddressForm, FinancialAccounts_service_1.FinancialAccountsService, CompanyUsers_service_1.CompanyUsers,
            Customers_service_1.CustomersService, Expense_service_1.ExpenseService, Deposit_service_1.DepositService, Numeral_service_1.NumeralService, Employees_service_1.EmployeeService, Badge_service_1.BadgeService, Payments_service_1.PaymentsService,
            DateFormatter_service_1.DateFormater, Budget_service_1.BudgetService, StateService_1.StateService, PaymentsPlan_service_1.PaymentsPlanService],
        entryComponents: [Address_components_1.USAddressContent, Address_components_1.INAddressContent]
    })
], ShareModule);
exports.ShareModule = ShareModule;
