/**
 * Created by seshu on 25-07-2016.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Session_1 = require("qCommon/app/services/Session");
var forms_1 = require("@angular/forms");
var InvoiceSettings_form_1 = require("../forms/InvoiceSettings.form");
var core_1 = require("@angular/core");
var ng2_file_upload_1 = require("ng2-file-upload");
var platform_browser_1 = require("@angular/platform-browser");
var Invoices_service_1 = require("../services/Invoices.service");
var angular2_uuid_1 = require("angular2-uuid");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var InvoiceSettingsComponent = (function () {
    function InvoiceSettingsComponent(_fb, _invoiceSettingsForm, dss, invoiceService, toastService) {
        var _this = this;
        this._fb = _fb;
        this._invoiceSettingsForm = _invoiceSettingsForm;
        this.dss = dss;
        this.invoiceService = invoiceService;
        this.toastService = toastService;
        this.hasBaseDropZoneOver = false;
        this.invoiceSettingsForm = this._fb.group(this._invoiceSettingsForm.getForm());
        this.companyId = Session_1.Session.getCurrentCompany();
        if (this.companyId) {
            this.invoiceService.getPreference(this.companyId)
                .subscribe(function (preference) { return _this.processPreference(preference); }, function (error) { return _this.handleError(error); });
        }
        this.uploader = new ng2_file_upload_1.FileUploader({
            url: invoiceService.getDocumentServiceUrl(),
            headers: [{
                    name: 'Authorization',
                    value: 'Bearer ' + Session_1.Session.getToken()
                }]
        });
    }
    InvoiceSettingsComponent.prototype.processPreference = function (preference) {
        this.preference = preference;
        if (preference && preference.companyLogo) {
            this.logoURL = preference.companyLogo;
            this.populateColumns();
            this._invoiceSettingsForm.updateForm(this.invoiceSettingsForm, preference);
        }
    };
    InvoiceSettingsComponent.prototype.populateColumns = function () {
        if (["Units", "Hours"].indexOf(this.preference.units) == -1) {
            this.preference.otherUnits = this.preference.units;
            this.preference.units = 'Other';
        }
        if (["Items", "Products", "Services"].indexOf(this.preference.items) == -1) {
            this.preference.otherItems = this.preference.items;
            this.preference.items = 'Other';
        }
        if (["Price", "Rate"].indexOf(this.preference.price) == -1) {
            this.preference.otherPrice = this.preference.price;
            this.preference.price = 'Other';
        }
        if (["Amount"].indexOf(this.preference.amount) == -1) {
            this.preference.otherAmount = this.preference.amount;
            this.preference.amount = 'Other';
        }
    };
    InvoiceSettingsComponent.prototype.handleError = function (error) {
    };
    InvoiceSettingsComponent.prototype.fileOverBase = function (e) {
        this.hasBaseDropZoneOver = e;
    };
    InvoiceSettingsComponent.prototype.startUpload = function ($event) {
        var base = this;
        setTimeout(function () {
            base.uploader.uploadAll();
        }, 500);
    };
    InvoiceSettingsComponent.prototype.deleteDocument = function () {
        //Invoke delete document service
    };
    InvoiceSettingsComponent.prototype.removeUploadItem = function (item) {
        item.remove();
        this.deleteDocument();
    };
    InvoiceSettingsComponent.prototype.compileLink = function () {
        if (this.document && this.document.temporaryURL) {
            var link = "";
            link = this.document.temporaryURL;
            this.logoURL = link;
            var data = this._invoiceSettingsForm.getData(this.invoiceSettingsForm);
            data.documentId = this.document.id;
            data.companyLogo = this.logoURL;
            this._invoiceSettingsForm.updateForm(this.invoiceSettingsForm, data);
        }
    };
    InvoiceSettingsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.uploader.onBuildItemForm = function (fileItem, form) {
            var payload = {};
            payload.sourceID = _this.companyId;
            payload.sourceType = 'company_invoice';
            form.append('payload', JSON.stringify(payload));
        };
        this.uploader.onCompleteItem = function (item, response, status, header) {
            if (status === 200) {
                _this.uploader.progress = 100;
                _this.billUploadResp = response;
                _this.uploader.queue.forEach(function (item) {
                    item.remove();
                });
                _this.document = JSON.parse(response);
                _this.compileLink();
            }
        };
    };
    InvoiceSettingsComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._invoiceSettingsForm.getData(this.invoiceSettingsForm);
        if (this.preference && !_.isEmpty(this.preference)) {
            data.id = this.preference.id;
            this.invoiceService.updatePreference(this.cleanData(data), this.preference.id, this.companyId)
                .subscribe(function (response) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Invoice Preference updated successfully");
            }, function (error) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not update Invoice Preference");
            });
        }
        else {
            data.id = angular2_uuid_1.UUID.UUID();
            this.invoiceService.createPreference(this.cleanData(data), this.companyId)
                .subscribe(function (response) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Invoice Preference created successfully");
            }, function (error) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Could not create Invoice Preference");
            });
        }
    };
    InvoiceSettingsComponent.prototype.cleanData = function (data) {
        if (data.units == 'Other') {
            data.units = data.otherUnits;
        }
        if (data.items == 'Other') {
            data.items = data.otherItems;
        }
        if (data.amount == 'Other') {
            data.amount = data.otherAmount;
        }
        if (data.price == 'Other') {
            data.price = data.otherPrice;
        }
        delete data.otherUnits;
        delete data.otherItems;
        delete data.otherAmount;
        delete data.otherPrice;
        return data;
    };
    InvoiceSettingsComponent.prototype.isOtherItem = function () {
        var data = this._invoiceSettingsForm.getData(this.invoiceSettingsForm);
        if (data.items == 'Other') {
            return false;
        }
        return true;
    };
    InvoiceSettingsComponent.prototype.isOtherPrice = function () {
        var data = this._invoiceSettingsForm.getData(this.invoiceSettingsForm);
        if (data.price == 'Other') {
            return false;
        }
        return true;
    };
    InvoiceSettingsComponent.prototype.isOtherAmount = function () {
        var data = this._invoiceSettingsForm.getData(this.invoiceSettingsForm);
        if (data.amount == 'Other') {
            return false;
        }
        return true;
    };
    InvoiceSettingsComponent.prototype.isOtherUnit = function () {
        var data = this._invoiceSettingsForm.getData(this.invoiceSettingsForm);
        if (data.units == 'Other') {
            return false;
        }
        return true;
    };
    return InvoiceSettingsComponent;
}());
InvoiceSettingsComponent = __decorate([
    core_1.Component({
        selector: 'invoice-settings',
        templateUrl: '/app/views/invoiceSettings.html',
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, InvoiceSettings_form_1.InvoiceSettingsForm, platform_browser_1.DomSanitizer,
        Invoices_service_1.InvoicesService, Toast_service_1.ToastService])
], InvoiceSettingsComponent);
exports.InvoiceSettingsComponent = InvoiceSettingsComponent;
