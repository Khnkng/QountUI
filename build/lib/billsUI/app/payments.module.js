"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var share_module_1 = require("qCommon/app/share.module");
var CheckSessionActivator_1 = require("qCommon/app/services/CheckSessionActivator");
var customDatepicker_1 = require("./directives/customDatepicker");
var customDatepicker1_1 = require("./directives/customDatepicker1");
var DocHub_service_1 = require("./services/DocHub.service");
var Bill_component_1 = require("./components/Bill.component");
var BillPay_component_1 = require("./components/BillPay.component");
var Workflow_component_1 = require("./components/Workflow.component");
var DashBoard_component_1 = require("./components/DashBoard.component");
var OAuthService_1 = require("./services/OAuthService");
var Box_service_1 = require("./services/Box.service");
var Bills_service_1 = require("./services/Bills.service");
var Workflow_service_1 = require("./services/Workflow.service");
var CheckListForm_1 = require("./forms/CheckListForm");
var CheckListForm_2 = require("./forms/CheckListForm");
var Bill_form_1 = require("./forms/Bill.form");
var Users_service_1 = require("./services/Users.service");
var Comments_service_1 = require("./services/Comments.service");
var RecipientInput_component_1 = require("./components/RecipientInput.component");
var MultiPay_component_1 = require("./components/MultiPay.component");
var Credit_component_1 = require("./components/Credit.component");
var Credit_form_1 = require("./forms/Credit.form");
var PaymentsModule = (function () {
    function PaymentsModule() {
    }
    return PaymentsModule;
}());
PaymentsModule = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule, forms_1.FormsModule, forms_1.ReactiveFormsModule, share_module_1.ShareModule, router_1.RouterModule.forChild([
                { path: 'payments/dashboard/:tabId', name: 'Dashboard', component: DashBoard_component_1.DashBoardComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payments/workflow', name: 'Workflow', component: Workflow_component_1.WorkflowComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payments/bill/:companyId/:id/:tabId', name: 'BillEntry', component: Bill_component_1.BillComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payments/bill-pay/:companyId/:id', name: 'BillPay', component: BillPay_component_1.BillPayComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payments/multipay/:companyId', component: MultiPay_component_1.MultiPayComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payments/newBill', name: 'NewBill', component: Bill_component_1.BillComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payments/newCredit/:companyId', component: Credit_component_1.CreditComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] },
                { path: 'payments/credit/:companyId/:id', component: Credit_component_1.CreditComponent, canActivate: [CheckSessionActivator_1.LoggedInActivator] }
            ])],
        declarations: [customDatepicker_1.CustomDatepicker, customDatepicker1_1.CustomDatepicker1, DashBoard_component_1.DashBoardComponent, Workflow_component_1.WorkflowComponent, Bill_component_1.BillComponent, BillPay_component_1.BillPayComponent, RecipientInput_component_1.RecipientInputComponent, MultiPay_component_1.MultiPayComponent, Credit_component_1.CreditComponent],
        exports: [router_1.RouterModule, customDatepicker_1.CustomDatepicker, customDatepicker1_1.CustomDatepicker1, DashBoard_component_1.DashBoardComponent, Workflow_component_1.WorkflowComponent, Bill_component_1.BillComponent, BillPay_component_1.BillPayComponent, RecipientInput_component_1.RecipientInputComponent, MultiPay_component_1.MultiPayComponent, Credit_component_1.CreditComponent],
        providers: [DocHub_service_1.DocHubService, Comments_service_1.CommentsService, Users_service_1.UsersService, Bill_form_1.BillForm, CheckListForm_2.CheckListForm, CheckListForm_1.LineListForm, Credit_form_1.CreditForm, CheckListForm_1.CreditLineListForm, Workflow_service_1.WorkflowService, Bills_service_1.BillsService, Box_service_1.BoxService, OAuthService_1.OAuthService],
        schemas: [core_1.CUSTOM_ELEMENTS_SCHEMA]
    })
], PaymentsModule);
exports.PaymentsModule = PaymentsModule;
