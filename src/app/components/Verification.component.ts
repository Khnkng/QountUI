/**
 * Created by Nazia on 28-03-2016.
 */

import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {PROVINCES} from "qCommon/app/constants/Provinces.constants";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {FTable} from "qCommon/app/directives/footable.directive";
import {TaxesForm} from "../forms/Taxes.form";
import {VerifyForm} from "../forms/verify.form"
import {VendorModel} from "../models/Vendor.model";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {CompanyModel} from "../models/Company.model";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ChartOfAccountsService} from "qCommon/app/services/ChartOfAccounts.service";
import {Address} from "qCommon/app/directives/address.directive";
import {Router,ActivatedRoute} from "@angular/router";
import {pageTitleService} from "qCommon/app/services/PageTitle";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'Verification',
    templateUrl: '../views/Verification.html'
})

export class VerificationComponent {
    tableData: any = {};
    tableOptions: any = {};
    status: any;
    vendors: Array<any>;
    hasItemCodes: boolean = false;
    editMode: boolean = false;
    @ViewChild('createtaxes') createtaxes;
    row: any;
    VerifyForm: FormGroup;
    countries: Array<any> = PROVINCES.COUNTRIES;
    @ViewChild('fooTableDir') fooTableDir: FTable;
    message: string;
    companyId: string;
    companies: Array<CompanyModel> = [];
    currentCompany: any = {};
    chartOfAccounts: any;
    tableColumns: Array<string> = ['id', 'name', 'tin', 'visibleOnInvoices', 'taxAuthorityName', 'taxRate', 'coa_name', 'recoverableTax', 'compoundTax'];
    taxesList: any;
    countryCode: string;
    showAddress: boolean;
    showFlyout: boolean = true;
    taxId: any;
    confirmSubscription: any;
    routeSub:any;
    currentverificationId:any;
    routeSubscribe:any;

    constructor(private _fb: FormBuilder,private _route: ActivatedRoute, private companyService: CompaniesService, private _VerifyForm: VerifyForm,
                private _router: Router, private loadingService: LoadingService, private vendorService: CompaniesService,
                private _toastService: ToastService, private switchBoard: SwitchBoard, private coaService: ChartOfAccountsService,private titleService:pageTitleService) {
        this.titleService.setPageTitle("Verify Account");
        this.companyId = Session.getCurrentCompany();
        this.routeSub = this._route.params.subscribe(params => {
            this.currentverificationId = params['VerificationID'];
        });
        this.VerifyForm = this._fb.group(_VerifyForm.getVerified());
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
            if(this.showFlyout){
                this.hideFlyout();
            }else {
                this.toolsRedirect();
            }
        });
    }

    toolsRedirect(){
        let link = ['tools'];
        this._router.navigate(link);
    }

    ngOnDestroy(){
        this.routeSubscribe.unsubscribe();
    }

    hideFlyout() {
        let link = ['financialAccounts'];
        this._router.navigate(link);
        this.showFlyout = !this.showFlyout;
    }
    submit($event) {
        let base = this;
        $event && $event.preventDefault();
        let data = this._VerifyForm.getData(this.VerifyForm);
        data.amount1=Number(data.amount1);
        data.amount2=Number(data.amount2);
        this.companyService.updateAccount(data, this.companyId,this.currentverificationId)
            .subscribe(success  => {
                this.loadingService.triggerLoadingEvent(false);
                this.showMessage(true, success);
                this.showFlyout = false;
            }, error => this.handleError(error));

    }
    handleError(error) {
        this._toastService.pop(TOAST_TYPE.error, "Failed To Perform Operation");
    }
    isValid(VerifyForm){
        if((VerifyForm.value.amount1) && (VerifyForm.value.amount2)){
            return false;
        }
        return true;
    }
    showMessage(status, obj) {
        if(status) {
            this.status = {};
            this.status['success'] = true;
            this._toastService.pop(TOAST_TYPE.success, "Verification Created Successfully.");
            let link = ['financialAccounts'];
            this._router.navigate(link);

        }
    }
}
