/**
 * Created by seshagirivellanki on 19/01/17.
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
var core_1 = require("@angular/core");
var Credit_form_1 = require("../forms/Credit.form");
var Bills_service_1 = require("../services/Bills.service");
var forms_1 = require("@angular/forms");
var CheckListForm_1 = require("../forms/CheckListForm");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var CreditLine_model_1 = require("../models/CreditLine.model");
var Currency_constants_1 = require("qCommon/app/constants/Currency.constants");
var ng2_file_upload_1 = require("ng2-file-upload");
var platform_browser_1 = require("@angular/platform-browser");
var Session_1 = require("qCommon/app/services/Session");
var angular2_uuid_1 = require("angular2-uuid");
var CodesService_service_1 = require("qCommon/app/services/CodesService.service");
var ExpenseCodes_service_1 = require("qCommon/app/services/ExpenseCodes.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var CreditComponent = (function () {
    function CreditComponent(elementRef, _fb, billsService, _creditForm, _creditLineListForm, _router, _toastService, companyService, switchBoard, _route, dss, coaService, expensesService, codeService) {
        var _this = this;
        this.elementRef = elementRef;
        this._fb = _fb;
        this.billsService = billsService;
        this._creditForm = _creditForm;
        this._creditLineListForm = _creditLineListForm;
        this._router = _router;
        this._toastService = _toastService;
        this.companyService = companyService;
        this.switchBoard = switchBoard;
        this._route = _route;
        this.dss = dss;
        this.coaService = coaService;
        this.expensesService = expensesService;
        this.codeService = codeService;
        this.addLineItemMode = false;
        this.creditLinesArray = new forms_1.FormArray([]);
        this.lines = [];
        this.creditCurrency = 'USD';
        this.companyCurrency = 'USD';
        this.convertedAmount = 0;
        this.totalAmountInCompanyCurrency = 0;
        this.displayCurrency = 'USD';
        this.vendors = [];
        this.vendorsList = [];
        this.currencies = Currency_constants_1.CURRENCY;
        this.accountNumbers = [];
        this.hasBaseDropZoneOver = false;
        this.showConvertedCurrency = false;
        this.lineActive = true;
        this.newCredit = false;
        this.chartOfAccounts = [];
        this.defaultConversionAmount = 1;
        // Reset the form with a new hero AND restore 'pristine' class state
        // by toggling 'active' flag which causes the form
        // to be removed/re-added in a tick via NgIf
        // TODO: Workaround until NgForm has a reset method (#6822)
        this.active = true;
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.companyID = params['companyId'];
            _this.creditID = params['id'];
            _this.companyService.company(_this.companyID).subscribe(function (companies) {
                _this.companyCurrency = companies.defaultCurrency;
            }, function (error) { return _this.showError(error); });
            _this.companyService.vendors(_this.companyID)
                .subscribe(function (vendors) {
                vendors ? _this.vendors = _.map(vendors, 'name') : [];
                vendors ? _this.vendorsList = vendors : [];
            }, function (error) { return _this.handleError(error); });
        });
        if (this.creditID) {
            this.billsService.credit(this.companyID, this.creditID).subscribe(function (credit) { return _this.processBill(credit); });
        }
        else {
            this.creditID = angular2_uuid_1.UUID.UUID();
            this.newCredit = true;
        }
        this.switchBoard.onSideBarExpand.subscribe(function (flag) {
            _this.toggleLine();
        });
        this.uploader = new ng2_file_upload_1.FileUploader({
            url: billsService.getDocumentServiceUrl(),
            headers: [{
                    name: 'Authorization',
                    value: 'Bearer ' + Session_1.Session.getToken()
                }]
        });
        this.loadCodes();
    }
    CreditComponent.prototype.isBillLoading = function () {
        return !this.creditID && !this.credit;
    };
    CreditComponent.prototype.getCreditData = function () {
        var _this = this;
        this.billsService.credit(this.companyID, this.creditID)
            .subscribe(function (bill) { return _this.processBill(bill); }, function (error) { return _this.handleError(error); });
    };
    CreditComponent.prototype.loadCodes = function () {
        var _this = this;
        this.coaService.chartOfAccounts(Session_1.Session.getCurrentCompany())
            .subscribe(function (chartOfAccounts) {
            _this.chartOfAccounts = chartOfAccounts;
        }, function (error) {
        });
        this.codeService.itemCodes(Session_1.Session.getCurrentCompany())
            .subscribe(function (itemCodes) {
            _this.itemCodes = itemCodes;
        }, function (error) { return _this.handleError(error); });
        this.expensesService.getAllExpenses(Session_1.Session.getCurrentCompany())
            .subscribe(function (expenseCodes) {
            _this.expenseCodes = expenseCodes;
        }, function (error) { return _this.handleError(error); });
    };
    CreditComponent.prototype.processBill = function (credit) {
        var _this = this;
        var base = this;
        if (credit.creditLines) {
            credit.lines = credit.creditLines;
        }
        else {
            credit.lines = [];
        }
        this.credit = credit;
        if (!this.credit.totalAmount) {
            this.credit.totalAmount = 0;
        }
        this._creditForm.updateForm(this.creditForm, this.credit);
        this.lines = this.credit.lines;
        this.displayCurrency = this.credit.currency ? this.credit.currency : 'USD';
        if (this.credit.lines) {
            this.credit.lines.forEach(function (line) {
                var lineListForm = base._fb.group(base._creditLineListForm.getForm(line));
                base.creditLinesArray.push(lineListForm);
            });
            if (this.credit.lines && this.credit.lines.length > 0) {
                this.havingLinelist = true;
            }
        }
        if (this.credit.currency)
            this.onCurrencySelect(this.credit.currency);
        this.loaded = true;
        this.billsService.getDocumentBySource(this.credit.id).subscribe(function (sources) {
            _this.document = sources[0];
            _this.compileLink();
        }, function (error) {
            base.billFileExist = false;
        });
        /*if(this.bill.bucketName && this.bill.documentKeyName){
         let docHubModel = new DocHubModel();
         docHubModel.bucketName = this.bill.bucketName;
         docHubModel.keyName = this.bill.documentKeyName;
         docHubModel.token = Session.getToken();
         docHubModel.accessLinkFlag = true;
         this.downloadLink = this.docHubService.getStreamLink(docHubModel);
         let link = this.docHubService.getStreamLink(docHubModel);
         if(this.bill.name.indexOf(".pdf") == -1) {
         this.isPdf = false;
         this.docHubService.getLink(docHubModel).subscribe(docResp  => {
         link = docResp.message;
         }, error =>  this.handleError(error));
         setTimeout(function(){
         base.billFileExist = true;
         base.billImageLink = base.dss.bypassSecurityTrustUrl(link);
         }, 10);
         } else {
         this.isPdf = true;
         base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl("/app/views/loadingBill.html");
         link = 'https://docs.google.com/gview?embedded=true&url='+encodeURIComponent(this.downloadLink);
         setTimeout(function(){
         base.billFileExist = true;
         base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl(link);
         }, 0);
         }
         }*/ /* else{
        this.billFileExist = false;
        }*/
        if (this.credit.vendorName)
            this.onVendorSelect(this.credit.vendorName);
        /* TODO: need to reinitialize tooltips to updated title*/
        /*this.reinitialize(['tooltip']);*/
    };
    CreditComponent.prototype.toggleLine = function () {
        if (this.addLineItemMode) {
            this.addLineItemMode = false;
        }
    };
    CreditComponent.prototype.ngOnInit = function () {
        var _this = this;
        var _form = this._creditForm.getForm();
        _form['lines'] = this.creditLinesArray;
        this.creditForm = this._fb.group(_form);
        var _lineForm = this._creditLineListForm.getForm();
        this.lineForm = this._fb.group(_lineForm);
        this.uploader.onBuildItemForm = function (fileItem, form) {
            var payload = {};
            payload.sourceID = _this.creditID;
            payload.sourceType = 'credit';
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
                _this.billFileExist = true;
                _this.compileLink();
                //Your code goes here
            }
        };
    };
    CreditComponent.prototype.calcAmount = function (event, index) {
        var quantity, unitPrice, amount, amountValue;
        if (index || index == 0) {
            var lineList = this.creditForm.controls['lines'];
            quantity = this.checkNumber(lineList.controls[index].controls['quantity'].value);
            unitPrice = this.checkNumber(lineList.controls[index].controls['unitPrice'].value);
            amountValue = lineList.controls[index].controls['totalAmount'].value;
            amount = lineList.controls[index].controls['totalAmount'];
        }
        else {
            quantity = this.checkNumber(this.lineForm.controls['quantity'].value);
            unitPrice = this.checkNumber(this.lineForm.controls['unitPrice'].value);
            amountValue = this.lineForm.controls['totalAmount'].value;
            amount = this.lineForm.controls['totalAmount'];
        }
        if ((quantity || quantity == 0) && (unitPrice || unitPrice == 0)) {
            amountValue = quantity * unitPrice;
            amount.patchValue((this.checkNumber(amountValue)).toFixed(2));
            this.allowEditAmount = true;
        }
        else if (amountValue) {
            if (("" + amountValue).indexOf('.') != amountValue.length - 1) {
                amount.patchValue(+(this.checkNumber(amountValue)).toFixed(2));
            }
        }
    };
    CreditComponent.prototype.checkNumber = function (val) {
        if ((val || val == 0) && !isNaN(val)) {
            var _val = parseFloat(val);
            return _val;
        }
        return null;
    };
    CreditComponent.prototype.addLineAmount = function ($event) {
        $event && $event.preventDefault() && $event.stopPropagation();
        var amount = this.creditForm.controls['lineAmount'].value;
        if (!isNaN(amount)) {
            var line = new CreditLine_model_1.CreditLineModel();
            line.number = this.lines.length + 1;
            line.totalAmount = amount;
            this.lines.push(line);
            var lineControl = this.creditForm.controls['lineAmount'];
            lineControl.patchValue(null);
        }
        return false;
    };
    CreditComponent.prototype.addLine = function ($event) {
        var base = this;
        $event.preventDefault();
        $event.stopPropagation();
        this.allowEditAmount = false;
        var values = this.checkLine();
        if (values) {
            var line = new CreditLine_model_1.CreditLineModel();
            line.number = this.lines.length + 1;
            line.totalAmount = values.amount;
            line.description = values.description;
            line.quantity = values.quantity;
            line.unitPrice = values.unitPrice;
            this.lines.push(line);
            var lineAmountControl = this.creditForm.controls['lineAmount'];
            lineAmountControl.patchValue(null);
            var lineUnitControl = this.creditForm.controls['unitPrice'];
            lineUnitControl.patchValue(null);
            var lineQuantityControl = this.creditForm.controls['quantity'];
            lineQuantityControl.patchValue(null);
            var lineDescriptionControl = this.creditForm.controls['lineDescription'];
            lineDescriptionControl.patchValue(null);
            var lineListForm = base._fb.group(base._creditLineListForm.getForm(line));
            base.creditLinesArray.push(lineListForm);
            this.updateLineToatal(null, null);
            this.addLineItemMode = false;
        }
        return false;
    };
    CreditComponent.prototype.checkLine = function (index) {
        var amount, quantity, unitPrice, description;
        if (index || index == 0) {
            var lineList = this.creditForm.controls['lines'];
            amount = this.checkNumber(lineList.controls[index].controls['totalAmount'].value);
            quantity = this.checkNumber(lineList.controls[index].controls['quantity'].value);
            unitPrice = this.checkNumber(lineList.controls[index].controls['unitPrice'].value);
            description = lineList.controls[index].controls['description'].value;
        }
        else {
            amount = this.checkNumber(this.creditForm.controls['lineAmount'].value);
            quantity = this.checkNumber(this.creditForm.controls['quantity'].value);
            unitPrice = this.checkNumber(this.creditForm.controls['unitPrice'].value);
            description = this.creditForm.controls['lineDescription'].value;
        }
        if ((!quantity && quantity != 0) || (!unitPrice && unitPrice != 0)) {
            quantity = null;
            unitPrice = null;
        }
        if (amount && description) {
            return {
                amount: amount,
                quantity: quantity,
                unitPrice: unitPrice,
                description: description,
            };
        }
        return null;
    };
    CreditComponent.prototype.updateLineToatal = function (id, index) {
        var values = this.checkLine(index);
        var lineList = this.creditForm.controls['lines'];
        if (values) {
            lineList.controls[index].editable = false;
        }
        var total = 0;
        lineList.controls.forEach(function (control) {
            if (control.controls.totalAmount.value) {
                total = total + parseFloat('' + control.controls.totalAmount.value);
            }
        });
        var totalAmountControl = this.creditForm.controls['totalAmount'];
        totalAmountControl.patchValue(total);
        this.totalAmountInCompanyCurrency = total * this.convertedAmount;
        return total;
    };
    CreditComponent.prototype.removeLine = function ($event, index) {
        $event.preventDefault();
        $event.stopPropagation();
        var lineList = this.creditForm.controls['lines'];
        this.lines.splice(index, 1);
        lineList.controls.splice(index, 1);
        this.updateLineToatal(null, null);
        return false;
    };
    CreditComponent.prototype.setDueDate = function (date) {
        var dueDateControl = this.creditForm.controls['dueDate'];
        dueDateControl.patchValue(date);
    };
    CreditComponent.prototype.setCreditDate = function (date) {
        var billDateControl = this.creditForm.controls['creditDate'];
        billDateControl.patchValue(date);
        if (this.creditCurrency != this.companyCurrency) {
            this.showConvertedCurrency = true;
            this.getCurrencyValue(this.creditCurrency, this.companyCurrency, this.creditForm.controls['creditDate'].value);
        }
    };
    CreditComponent.prototype.setEndDate = function (date) {
        var endDateControl = this.creditForm.controls['endDate'];
        endDateControl.patchValue(date);
    };
    CreditComponent.prototype.hasCheckedAll = function () {
        var status = true;
        var amount = this.checkNumber(this.creditForm.controls['totalAmount'].value);
        if (!amount || amount <= 0.00) {
            status = false;
        }
        return status;
    };
    CreditComponent.prototype.newForm = function () {
        var _this = this;
        this.active = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    CreditComponent.prototype.handleError = function (error) {
    };
    CreditComponent.prototype.onCurrencySelect = function (val) {
        this.creditCurrency = val;
        this.displayCurrency = val;
        if (this.creditCurrency != this.companyCurrency) {
            this.showConvertedCurrency = true;
            this.getCurrencyValue(this.creditCurrency, this.companyCurrency, this.creditForm.controls['creditDate'].value);
        }
        else {
            this.showConvertedCurrency = false;
        }
    };
    CreditComponent.prototype.getCurrencyValue = function (creditCurrency, companyCurrency, creditDate) {
        var _this = this;
        if (creditDate)
            creditDate = moment(this.creditForm.controls['creditDate'].value, 'MM/DD/YYYY').format('YYYY-MM-DD');
        if (creditCurrency && companyCurrency && creditDate)
            this.billsService.getConvertedCurrencyValue(creditCurrency, companyCurrency, creditDate)
                .subscribe(function (res) {
                _this.convertedAmount = res.result;
                _this.totalAmountInCompanyCurrency = (_this.creditForm.controls['totalAmount'].value) * _this.convertedAmount;
            }, function (error) { return _this.handleError(error); });
    };
    CreditComponent.prototype.onVendorSelect = function (val) {
        var vendor = _.find(this.vendorsList, function (o) { return o.name == val; });
        this.accountNumbers = [];
        if (vendor) {
            var vendorID = this.creditForm.controls['vendorID'];
            vendorID.patchValue(vendor.id);
            if (vendor.accountNumbers) {
                this.accountNumbers = vendor.accountNumbers;
            }
            else if (vendor.accountNumber) {
                this.accountNumbers = [vendor.accountNumber];
            }
        }
    };
    CreditComponent.prototype.showError = function (error) {
    };
    CreditComponent.prototype.submit = function ($event) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._creditForm.getData(this.creditForm);
        delete data['lineAmount'];
        delete data['lineDescription'];
        data.creditLines = data.lines;
        delete data['lines'];
        data['companyID'] = this.companyID;
        data.id = this.creditID;
        if (this.creditCurrency != this.companyCurrency) {
            data.totalAmountInCompanyCurrency = this.totalAmountInCompanyCurrency;
        }
        else {
            data.totalAmountInCompanyCurrency = data.totalAmount;
        }
        if (this.newCredit) {
            this.billsService.createCredit(data, this.companyID)
                .subscribe(function (success) {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Credit Created Successfully");
                _this.showPaymentsTab();
            }, function (error) {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Credit Creation Failed");
            });
        }
        else {
            this.billsService.updateCredit(data, this.companyID)
                .subscribe(function (success) {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Credit Created Successfully");
                _this.showPaymentsTab();
            }, function (error) {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Credit Creation Failed");
            });
        }
    };
    CreditComponent.prototype.showPaymentsTab = function () {
        var link = ['payments/dashboard', 'pay'];
        this._router.navigate(link);
    };
    CreditComponent.prototype.compileLink = function () {
        var base = this;
        if (this.document && this.document.temporaryURL) {
            var link_1 = "";
            link_1 = this.document.temporaryURL;
            this.downloadLink = link_1;
            if (this.document.name.indexOf(".pdf") == -1) {
                this.isPdf = false;
                setTimeout(function () {
                    base.billFileExist = true;
                    base.billImageLink = base.dss.bypassSecurityTrustUrl(link_1);
                }, 10);
            }
            else {
                this.isPdf = true;
                base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl("/app/views/loadingBill.html");
                link_1 = 'https://docs.google.com/gview?embedded=true&url=' + encodeURIComponent(this.downloadLink);
                setTimeout(function () {
                    base.billFileExist = true;
                    base.billPdfLink = base.dss.bypassSecurityTrustResourceUrl(link_1);
                }, 0);
            }
        }
    };
    CreditComponent.prototype.fileOverBase = function (e) {
        this.hasBaseDropZoneOver = e;
    };
    CreditComponent.prototype.startUpload = function ($event) {
        var base = this;
        setTimeout(function () {
            base.uploader.uploadAll();
        }, 500);
    };
    CreditComponent.prototype.deleteDocument = function () {
        var _this = this;
        this.billsService.deleteDocumentBySource(this.creditID, this.document.id).subscribe(function (res) {
            _this.billFileExist = false;
            _this.billImageLink = null;
            _this.billPdfLink = null;
        }, function (error) {
        });
    };
    CreditComponent.prototype.removeUploadItem = function (item) {
        item.remove();
        this.deleteDocument();
    };
    CreditComponent.prototype.showDashboard = function () {
        var link = [Session_1.Session.getLastVisitedUrl()];
        this._router.navigate(link);
    };
    CreditComponent.prototype.hideFlyout = function () {
        this.dimensionFlyoutCSS = "collapsed";
    };
    CreditComponent.prototype.showFlyout = function (lineStatus, index) {
        this.dimensionFlyoutCSS = "expanded";
        this.lineActive = true;
        this.resetLineForm();
        if (lineStatus == 'NEW') {
            this.editingLine = {
                status: 'NEW'
            };
        }
        else {
            var lineListItem = this.creditLinesArray.controls[index];
            this.editingLine = {
                status: 'UPDATE',
                index: index
            };
            var tempLineForm = _.cloneDeep(lineListItem);
            this.getLineData(tempLineForm);
        }
    };
    CreditComponent.prototype.getLineData = function (lineForm) {
        var lineData = this._creditLineListForm.getData(lineForm);
        this.updateLineFormForEdit(lineData);
    };
    CreditComponent.prototype.updateLineFormForEdit = function (lineData) {
        var base = this;
        lineData.totalAmount = parseFloat(lineData.totalAmount).toFixed(2);
        this._creditLineListForm.updateForm(this.lineForm, lineData);
    };
    CreditComponent.prototype.resetLineForm = function () {
        var idControl = this.lineForm.controls['id'];
        idControl.patchValue('');
        var descriptionControl = this.lineForm.controls['description'];
        descriptionControl.patchValue('');
        var unitPriceTypeControl = this.lineForm.controls['unitPrice'];
        unitPriceTypeControl.patchValue('');
        var quantityControl = this.lineForm.controls['quantity'];
        quantityControl.patchValue('');
        var totalAmountControl = this.lineForm.controls['totalAmount'];
        totalAmountControl.patchValue('');
        var itemCodeControl = this.lineForm.controls['itemCode'];
        itemCodeControl.patchValue('');
        var expenseCodeControl = this.lineForm.controls['expenseCode'];
        expenseCodeControl.patchValue('');
    };
    CreditComponent.prototype.newLineForm = function () {
        var base = this;
        this.lineActive = false;
        setTimeout(function () {
            base.lineActive = true;
        }, 0);
    };
    /*When user clicks on save button in the flyout*/
    CreditComponent.prototype.saveLine = function () {
        var base = this;
        var lineData = this._creditLineListForm.getData(this.lineForm);
        if (lineData.expenseCode && lineData.itemCode) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select either item code or account code");
            return;
        }
        if (!lineData.expenseCode && !lineData.itemCode) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select either item code or account code");
            return;
        }
        if (this.editingLine.status == 'NEW') {
            this.resetLineForm();
            if (this.newCredit) {
                this.saveLineInView(lineData);
            }
            else {
                this.saveLineInView(lineData);
            }
        }
        else {
            if (base.newCredit) {
                base.updateLineInView(lineData);
            }
            else {
                base.updateLineInView(lineData);
            }
        }
        this.hideFlyout();
    };
    /*This will just add new line details in VIEW*/
    CreditComponent.prototype.saveLineInView = function (line) {
        var base = this;
        var lineListForm = _.cloneDeep(this._fb.group(this._creditLineListForm.getForm(line)));
        this.creditLinesArray.push(lineListForm);
        var lineData = [];
        _.each(this.creditLinesArray.controls, function (lineListForm) {
            lineData.push(base._creditLineListForm.getData(lineListForm));
        });
        this.creditForm.controls['lines'].patchValue(lineData);
        setTimeout(function () {
            base.updateLineToatal(null, null);
        }, 500);
    };
    CreditComponent.prototype.updateLineInView = function (line) {
        var base = this;
        var linesControl = this.creditForm.controls['lines'];
        var currentLineControl = linesControl.controls[this.editingLine.index];
        if (currentLineControl.editable) {
            currentLineControl.editable = !currentLineControl.editable;
        }
        var journalLines = this.creditForm.controls['lines'];
        var lineControl = journalLines.controls[this.editingLine.index];
        lineControl.controls['description'].patchValue(line.description);
        lineControl.controls['unitPrice'].patchValue(line.unitPrice);
        lineControl.controls['quantity'].patchValue(line.quantity);
        lineControl.controls['totalAmount'].patchValue(line.totalAmount);
        lineControl.controls['itemCode'].patchValue(line.itemCode);
        lineControl.controls['expenseCode'].patchValue(line.expenseCode);
        setTimeout(function () {
            base.updateLineToatal(null, null);
        }, 500);
    };
    CreditComponent.prototype.deleteLine = function (lineIndex) {
        var base = this;
        var lineList = this.creditForm.controls['lines'];
        lineList.controls.splice(lineIndex, 1);
        this.creditLinesArray.controls.splice(lineIndex, 1);
        setTimeout(function () {
            base.updateLineToatal(null, null);
        }, 500);
    };
    CreditComponent.prototype.getItemCodeName = function (_id) {
        var itemCode = _.find(this.itemCodes, { id: _id });
        if (itemCode) {
            return itemCode.name;
        }
        return "";
    };
    CreditComponent.prototype.getExpenseCodeName = function (_id) {
        var expenseCode = _.find(this.expenseCodes, { id: _id });
        if (expenseCode) {
            return expenseCode.name;
        }
        return "";
    };
    CreditComponent.prototype.displayItemCodeCOA = function ($event) {
        if ($event.target.value) {
            var paymentCOAMappingId = _.find(this.itemCodes, { 'id': $event.target.value }).payment_coa_mapping;
            var invoiceCOAMappingId = _.find(this.itemCodes, { 'id': $event.target.value }).invoice_coa_mapping;
            var paymentCOA = _.find(this.chartOfAccounts, { 'id': paymentCOAMappingId });
            if (paymentCOA && paymentCOA.name) {
                this.paymentCOAName = paymentCOA.name;
            }
        }
        else {
            this.paymentCOAName = "";
        }
    };
    CreditComponent.prototype.displayExpenseCodeCOA = function ($event) {
        if ($event.target.value) {
            var coaMappingId = _.find(this.expenseCodes, { 'id': $event.target.value }).coa_mapping_id;
            var coa = _.find(this.chartOfAccounts, { 'id': coaMappingId });
            if (coa && coa.name) {
                this.expenseCOAName = coa.name;
            }
        }
        else {
            this.expenseCOAName = "";
        }
    };
    CreditComponent.prototype.updateLine = function (lineListItem, index) {
        this.editingLine = {
            index: index
        };
        var data = this._creditLineListForm.getData(lineListItem);
        if (data.expenseCode && data.itemCode) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select either item code or account code");
            return;
        }
        if (this.newCredit) {
            this.updateLineInView(data);
        }
        else {
            this.updateLineInView(data);
        }
    };
    return CreditComponent;
}());
CreditComponent = __decorate([
    core_1.Component({
        selector: 'bill',
        templateUrl: '/app/views/credit.html',
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, forms_1.FormBuilder, Bills_service_1.BillsService,
        Credit_form_1.CreditForm, CheckListForm_1.CreditLineListForm,
        router_1.Router, Toast_service_1.ToastService, Companies_service_1.CompaniesService,
        SwitchBoard_1.SwitchBoard, router_1.ActivatedRoute, platform_browser_1.DomSanitizer, ChartOfAccounts_service_1.ChartOfAccountsService,
        ExpenseCodes_service_1.ExpensesService, CodesService_service_1.CodesService])
], CreditComponent);
exports.CreditComponent = CreditComponent;
