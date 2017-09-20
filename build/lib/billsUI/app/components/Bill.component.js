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
/**
 * Created by seshu on 25-07-2016.
 */
var Bills_service_1 = require("../services/Bills.service");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var Bill_form_1 = require("../forms/Bill.form");
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var Line_model_1 = require("../models/Line.model");
var CheckListForm_1 = require("../forms/CheckListForm");
var Session_1 = require("qCommon/app/services/Session");
var comboBox_directive_1 = require("qCommon/app/directives/comboBox.directive");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Comments_service_1 = require("../services/Comments.service");
var Currency_constants_1 = require("qCommon/app/constants/Currency.constants");
var Workflow_service_1 = require("../services/Workflow.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var index_1 = require("angular2-uuid/index");
var CodesService_service_1 = require("qCommon/app/services/CodesService.service");
var Numeral_service_1 = require("qCommon/app/services/Numeral.service");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var ExpenseCodes_service_1 = require("qCommon/app/services/ExpenseCodes.service");
var ng2_file_upload_1 = require("ng2-file-upload");
var DimensionService_service_1 = require("qCommon/app/services/DimensionService.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var StateService_1 = require("qCommon/app/services/StateService");
var State_1 = require("qCommon/app/models/State");
var BillComponent = (function () {
    function BillComponent(elementRef, _fb, billsService, _billForm, _checkListForm, _lineListForm, _route, dss, _router, _toastService, _commentsService, companyService, workflowService, codeService, switchBoard, expensesService, dimensionService, loadingService, coaService, numeralService, stateService) {
        var _this = this;
        this.elementRef = elementRef;
        this._fb = _fb;
        this.billsService = billsService;
        this._billForm = _billForm;
        this._checkListForm = _checkListForm;
        this._lineListForm = _lineListForm;
        this._route = _route;
        this.dss = dss;
        this._router = _router;
        this._toastService = _toastService;
        this._commentsService = _commentsService;
        this.companyService = companyService;
        this.workflowService = workflowService;
        this.codeService = codeService;
        this.switchBoard = switchBoard;
        this.expensesService = expensesService;
        this.dimensionService = dimensionService;
        this.loadingService = loadingService;
        this.coaService = coaService;
        this.numeralService = numeralService;
        this.stateService = stateService;
        this.type = "component";
        this.lines = [];
        this.checkList = [];
        this.havingChecklist = false;
        this.havingLinelist = false;
        this.chkLstArray = new forms_1.FormArray([]);
        this.addLineItemMode = false;
        this.notes = null;
        this.itemCodes = [];
        this.expenseCodes = [];
        this._1099Codes = [];
        this.currencies = Currency_constants_1.CURRENCY;
        this.vendors = [];
        this.displayCurrency = 'USD';
        this.editingName = false;
        this.billTags = [];
        this.loaded = false;
        this.vendorsList = [];
        this.show1099 = false;
        this.billCurrency = 'USD';
        this.companyCurrency = 'USD';
        this.showConvertedCurrency = false;
        this.convertedAmount = 1;
        this.companyCurrencyAmount = 0;
        this.onBillApplied = false;
        this.newBill = false;
        this.billFileExist = false;
        this.allowEditAmount = false;
        this.accountNumbers = [];
        this.hasBaseDropZoneOver = false;
        this.dimensions = [];
        this.selectedDimensions = [];
        this.lineTags = [];
        this.showMarkPaidFlyout = false;
        this.paidBill = {};
        this.companyAccounts = [];
        this.chartOfAccounts = [];
        this.defaultConversionAmount = 1;
        this.validateLockDate = false;
        // Reset the form with a new hero AND restore 'pristine' class state
        // by toggling 'active' flag which causes the form
        // to be removed/re-added in a tick via NgIf
        // TODO: Workaround until NgForm has a reset method (#6822)
        this.active = true;
        this.billComments = [];
        this.commentsLength = 0;
        this.lineActive = true;
        /*------------------------------------payment changes-----------------------------*/
        this.selectedRows = [];
        this.currencyConversionList = [];
        this.companyID = Session_1.Session.getCurrentCompany();
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.billID = params['id'];
            _this.tabId = params['tabId'];
            if (params['showComments']) {
                _this.showComments = params['showComments'] == 'true';
                if (_this.showComments) {
                    _this.showOverlay = true;
                }
            }
            if (_this.billID) {
                _this.newBillEntry = false;
            }
            else {
                _this.newBillEntry = true;
            }
            _this.dimensionService.dimensions(Session_1.Session.getCurrentCompany())
                .subscribe(function (dimensions) {
                _this.dimensions = dimensions;
                console.log("DIMENSIONS", dimensions);
            }, function (error) { return _this.handleError(error); });
            _this.billsService.getCompanyAccounts(_this.companyID)
                .subscribe(function (accountsList) {
                _this.companyAccounts = accountsList.accounts;
            }, function (error) { return _this.handleError(error); });
            _this.loadData();
            _this.loadCodes();
        });
        this.switchBoard.onSideBarExpand.subscribe(function (flag) {
            _this.toggleLine();
        });
        this.uploader = new ng2_file_upload_1.FileUploader({
            url: billsService.getDocumentServiceUrl(this.companyID),
            headers: [{
                    name: 'Authorization',
                    value: 'Bearer ' + Session_1.Session.getToken()
                }]
        });
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            if (_this.dimensionFlyoutCSS == "expanded") {
                _this.hideFlyout();
            }
            else if (_this.showMarkPaidFlyout) {
                _this.hideMarkPaidFlyout();
            }
            else {
                _this.goToPreviousPage();
            }
        });
    }
    BillComponent.prototype.toggleLine = function () {
        if (this.addLineItemMode) {
            this.addLineItemMode = false;
        }
    };
    BillComponent.prototype.loadData = function () {
        var _this = this;
        this.companyService.vendors(this.companyID)
            .subscribe(function (vendors) {
            vendors ? _this.vendors = _.map(vendors, 'name') : [];
            vendors ? _this.vendorsList = vendors : [];
        }, function (error) { return _this.handleError(error); });
        this.workflowService.workflow(this.companyID)
            .subscribe(function (workflow) {
            var approveFlowSteps = workflow.Approve ? workflow.Approve : [];
            _this.maxRank = Math.max.apply(Math, _.map(approveFlowSteps, 'rank'));
        }, function (error) { return _this.handleError(error); });
        if (this.billID) {
            this.tabHeight = (jQuery(window).height() - 250) + "px";
            this._commentsService.getComments(this.billID, this.companyID).subscribe(function (comments) { return _this.handleComments(comments); }, function (error) { return _this.showError(error); });
            this.formHeight = (jQuery(window).height() - 250) + "px";
        }
        else {
            this.newBill = true;
        }
    };
    BillComponent.prototype.loadCodes = function () {
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
        this.billsService.get1099Data().subscribe(function (_1099Codes) {
            _this._1099Codes = _1099Codes ? _.map(_1099Codes, 'name') : [];
        }, function (error) { return _this.handleError(error); });
    };
    BillComponent.prototype.displayItemCodeCOA = function (itemCodeName) {
        if (itemCodeName) {
            var itemCode = _.find(this.itemCodes, { 'name': itemCodeName });
            var paymentCOA = _.find(this.chartOfAccounts, { 'id': itemCode.payment_coa_mapping });
            var invoiceCOA = _.find(this.chartOfAccounts, { 'id': itemCode.invoice_coa_mapping });
            if (paymentCOA && paymentCOA.name) {
                this.paymentCOAName = paymentCOA.name;
            }
            if (invoiceCOA && invoiceCOA.name) {
                this.invoiceCOAName = invoiceCOA.name;
            }
        }
        else {
            this.paymentCOAName = "";
            this.invoiceCOAName = "";
        }
    };
    BillComponent.prototype.displayExpenseCodeCOA = function (expenseCodeName) {
        if (expenseCodeName) {
            var coaMappingId = _.find(this.expenseCodes, { 'name': expenseCodeName }).coa_mapping_id;
            var coa = _.find(this.chartOfAccounts, { 'id': coaMappingId });
            if (coa && coa.name) {
                this.expenseCOAName = coa.name;
            }
        }
        else {
            this.expenseCOAName = "";
        }
    };
    BillComponent.prototype.addDefaultLine = function (count) {
        var linesControl = this.billForm.controls['lines'];
        for (var i = 0; i < count; i++) {
            var lineForm = this._fb.group(this._lineListForm.getForm());
            linesControl.push(lineForm);
        }
    };
    BillComponent.prototype.ngOnInit = function () {
        var _this = this;
        var _form = this._billForm.getForm();
        this.chkLstArray = this._fb.array([]);
        _form['checkList'] = this.chkLstArray;
        _form['lines'] = new forms_1.FormArray([]);
        this.billForm = this._fb.group(_form);
        var _lineForm = this._lineListForm.getForm();
        this.lineForm = this._fb.group(_lineForm);
        this.loadingService.triggerLoadingEvent(true);
        if (!this.newBill) {
            this.companyService.vendors(this.companyID)
                .subscribe(function (vendors) {
                vendors ? _this.vendors = _.map(vendors, 'name') : [];
                vendors ? _this.vendorsList = vendors : [];
                _this.getBillData();
            }, function (error) { return _this.handleError(error); });
        }
        else {
            this.bill = this._billForm.getData(this.billForm);
            this.billID = index_1.UUID.UUID();
            this.bill.id = this.billID;
            this.addDefaultLine(2);
            var recurringCtrl = this.billForm.controls['recurring'];
            recurringCtrl.patchValue("onlyonce");
            this.loadingService.triggerLoadingEvent(false);
        }
        this.uploader.onBuildItemForm = function (fileItem, form) {
            var payload = {};
            payload.sourceID = _this.billID;
            payload.sourceType = 'bill';
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
    BillComponent.prototype.getBillData = function () {
        var _this = this;
        this.billsService.bill(this.companyID, this.billID)
            .subscribe(function (bill) { return _this.processBill(bill); }, function (error) { return _this.handleError(error); });
    };
    BillComponent.prototype.isBillLoading = function () {
        return !this.newBill && !this.bill;
    };
    BillComponent.prototype.roundOffAmount = function ($event) {
        var value = $event.target.value;
        if (value.indexOf('.') != -1) {
            if (!(value.split('.').length == 2 && value.split('.')[1].length < 2)) {
                if (($event.keyCode >= 48 && $event.keyCode <= 57) || ($event.keyCode >= 65 && $event.keyCode <= 90)) {
                    $event && $event.preventDefault();
                }
            }
        }
    };
    BillComponent.prototype.updateName = function ($event) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        this.bill.name = this.newName;
        this._billForm.updateForm(this.billForm, this.bill);
        this.editingName = false;
    };
    BillComponent.prototype.editName = function ($event) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        this.editingName = true;
    };
    BillComponent.prototype.ngOnDestroy = function () {
        this.notes = null;
        this.billTags = [];
        this.lineTags = [];
        this.routeSubscribe.unsubscribe();
    };
    BillComponent.prototype.stopPropagation = function ($event) {
        $event && $event.stopImmediatePropagation();
    };
    BillComponent.prototype.processBill = function (bill) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(false);
        var base = this;
        if (bill.lines) {
            bill.lines = JSON.parse(bill.lines);
        }
        else {
            bill.lines = [];
        }
        this.bill = bill;
        this.billRank = bill.rank;
        if (!this.bill.recurring) {
            this.bill.recurring = "onlyonce";
        }
        if (!this.bill.amount) {
            this.bill.amount = 0;
        }
        if (!this.bill._1099Amount) {
            this.bill._1099Amount = 0;
        }
        this._billForm.updateForm(this.billForm, this.bill);
        this.newName = bill.name;
        if (this.bill.checkList) {
            this.bill.checkList.forEach(function (item) {
                var checkListForm = base._fb.group(base._checkListForm.getForm(item));
                base.chkLstArray.push(checkListForm);
            });
            if (this.bill.checkList && this.bill.checkList.length > 0) {
                this.havingChecklist = true;
            }
        }
        this.lines = this.bill.lines;
        this.notes = this.bill.notes;
        this.displayCurrency = this.bill.currency ? this.bill.currency : 'USD';
        if (this.bill.lines) {
            var linesControl_1 = this.billForm.controls['lines'];
            _.each(this.bill.lines, function (lineItem) {
                linesControl_1.controls.push(base._fb.group(base._lineListForm.getForm(lineItem)));
            });
            if (this.bill.lines && this.bill.lines.length > 0) {
                this.havingLinelist = true;
            }
        }
        if (this.bill.currentState == 'Paid') {
            if (this.bill.currency != this.companyCurrency) {
                this.companyCurrencyAmount = this.bill.amountPaid;
                this.showConvertedCurrency = true;
            }
        }
        else {
            if (this.bill.currency)
                this.onCurrencySelect(this.bill.currency);
        }
        // this.currentState=this.bill.currentState.toLowerCase()=='paid'?this.bill.currentState.toLowerCase():this.bill.currentState;
        this.currentState = this.bill.currentState;
        this.journalID = this.bill.journalID;
        this.billTags = bill.tags;
        this.loaded = true;
        this.billsService.getDocumentByBill(this.companyID, this.bill.id).subscribe(function (sources) {
            _this.document = sources[0];
            _this.compileLink();
        }, function (error) {
            base.billFileExist = false;
        });
        if (this.bill.vendorName)
            this.onVendorSelect(this.bill.vendorName);
        this.loadingService.triggerLoadingEvent(false);
    };
    BillComponent.prototype.resetAllLinesFromEditing = function (linesControl) {
        _.each(linesControl.controls, function (lineControl) {
            lineControl.editable = false;
        });
    };
    BillComponent.prototype.getLastActiveLineIndex = function (linesControl) {
        var result = false;
        _.each(linesControl.controls, function (lineControl, index) {
            if (!lineControl.controls['destroy'].value) {
                result = index;
            }
        });
        return result;
    };
    BillComponent.prototype.editLine = function (lineListForm, index) {
        var linesControl = this.billForm.controls['lines'];
        if (index == this.getLastActiveLineIndex(linesControl) && this.currentState != 'Paid') {
            this.addDefaultLine(1);
        }
        this.resetAllLinesFromEditing(linesControl);
        if (this.currentState != 'Paid')
            lineListForm.editable = !lineListForm.editable;
    };
    BillComponent.prototype.reinitialize = function (plugins) {
        var base = this;
        setTimeout(function () {
            Foundation.reflow(base.elementRef.nativeElement, plugins);
        }, 0);
    };
    BillComponent.prototype.compileLink = function () {
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
        this.loadingService.triggerLoadingEvent(false);
    };
    BillComponent.prototype.getStatusClass = function (status) {
        var labelClass;
        switch (status) {
            case 'Draft':
                labelClass = 'secondary';
                break;
            case 'Rejected':
                labelClass = 'alert';
                break;
            case 'Paid':
                labelClass = 'success';
                break;
            case 'Scheduled':
                labelClass = 'success';
                break;
            default:
                labelClass = 'warning';
        }
        return labelClass;
    };
    BillComponent.prototype.calcAmount = function (event, form) {
        var quantity, unitPrice, amount, amountValue;
        quantity = this.checkNumber(form.controls['quantity'].value);
        unitPrice = this.checkNumber(form.controls['unitPrice'].value);
        amountValue = form.controls['amount'].value;
        amount = form.controls['amount'];
        if ((quantity || quantity == 0) && (unitPrice || unitPrice == 0)) {
            amountValue = quantity * unitPrice;
            amount.patchValue(this.checkNumber(amountValue));
            this.allowEditAmount = true;
        }
        else if (amountValue) {
            /*if((""+amountValue).indexOf('.') != amountValue.length - 1){
             amount.patchValue(+(this.checkNumber(amountValue)).toFixed(2));
             }*/
            amount.patchValue(this.checkNumber(amountValue));
        }
        this.updateLineToatal(null, null);
    };
    BillComponent.prototype.checkNumber = function (val) {
        if ((val || val == 0) && !isNaN(val)) {
            var _val = parseFloat(val);
            return _val;
        }
        return null;
    };
    BillComponent.prototype.addLineAmount = function ($event) {
        $event && $event.preventDefault() && $event.stopPropagation();
        var amount = this.numeralService.value(this.billForm.controls['lineAmount'].value);
        if (!isNaN(amount)) {
            var line = new Line_model_1.LineModel();
            line.number = this.lines.length + 1;
            line.amount = parseFloat(amount);
            this.lines.push(line);
            var lineControl = this.billForm.controls['lineAmount'];
            lineControl.patchValue(null);
        }
        return false;
    };
    BillComponent.prototype.addLine = function ($event) {
        var base = this;
        $event.preventDefault();
        $event.stopPropagation();
        this.allowEditAmount = false;
        var values = this.checkLine();
        if (values) {
            var line = new Line_model_1.LineModel();
            line.number = this.lines.length + 1;
            line.amount = values.amount;
            line.description = values.description;
            line.itemCode = values.itemCode;
            line.quantity = values.quantity;
            line.unitPrice = values.unitPrice;
            line.expenseCode = values.expenseCode;
            if (this.show1099) {
                line.has1099 = true;
                line.tags = [];
            }
            this.lines.push(line);
            var lineAmountControl = this.billForm.controls['lineAmount'];
            lineAmountControl.patchValue(null);
            var lineUnitControl = this.billForm.controls['unitPrice'];
            lineUnitControl.patchValue(null);
            var lineQuantityControl = this.billForm.controls['quantity'];
            lineQuantityControl.patchValue(null);
            var lineItemCodeControl = this.billForm.controls['itemCode'];
            lineItemCodeControl.patchValue(null);
            var lineAccountCodeControl = this.billForm.controls['expenseCode'];
            lineAccountCodeControl.patchValue(null);
            var lineDescriptionControl = this.billForm.controls['lineDescription'];
            lineDescriptionControl.patchValue(null);
            var lineListForm = base._fb.group(base._lineListForm.getForm(line));
            this.updateLineToatal(null, null);
            this.addLineItemMode = false;
        }
        return false;
    };
    BillComponent.prototype.checkLine = function (index) {
        var amount, quantity, unitPrice, description, itemCode, expenseCode;
        if (index || index == 0) {
            var lineList = this.billForm.controls['lines'];
            amount = this.checkNumber(lineList.controls[index].controls['amount'].value);
            quantity = this.checkNumber(lineList.controls[index].controls['quantity'].value);
            unitPrice = this.checkNumber(lineList.controls[index].controls['unitPrice'].value);
            description = lineList.controls[index].controls['description'].value;
            itemCode = lineList.controls[index].controls['itemCode'].value;
            expenseCode = lineList.controls[index].controls['expenseCode'].value;
        }
        else {
            amount = this.checkNumber(this.billForm.controls['lineAmount'].value);
            quantity = this.checkNumber(this.billForm.controls['quantity'].value);
            unitPrice = this.checkNumber(this.billForm.controls['unitPrice'].value);
            description = this.billForm.controls['lineDescription'].value;
            itemCode = this.billForm.controls['itemCode'].value;
            expenseCode = this.billForm.controls['expenseCode'].value;
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
                itemCode: itemCode,
                expenseCode: expenseCode
            };
        }
        return null;
    };
    BillComponent.prototype.updateLineToatal = function (id, index) {
        var values = this.checkLine(index);
        var lineList = this.billForm.controls['lines'];
        if (values) {
            lineList.controls[index].editable = false;
        }
        var base = this;
        var total = 0;
        var _1099total = 0;
        lineList.controls.forEach(function (control) {
            if (!control.controls.destroy.value) {
                if (control.controls.amount.value) {
                    total = total + parseFloat('' + control.controls.amount.value);
                    if (base.show1099 && control.controls.has1099.value)
                        _1099total = _1099total + parseFloat('' + control.controls.amount.value);
                }
            }
        });
        var totalAmountControl = this.billForm.controls['amount'];
        if (this.show1099) {
            var total1099AmountControl = this.billForm.controls['_1099Amount'];
            total1099AmountControl.patchValue(_1099total);
        }
        totalAmountControl.patchValue(total);
        this.companyCurrencyAmount = total * this.convertedAmount;
        return total;
    };
    BillComponent.prototype.removeLine = function ($event, index) {
        $event.preventDefault();
        $event.stopPropagation();
        var lineList = this.billForm.controls['lines'];
        this.lines.splice(index, 1);
        lineList.controls.splice(index, 1);
        this.updateLineToatal(null, null);
        return false;
    };
    BillComponent.prototype.setDueDate = function (date) {
        var dueDateControl = this.billForm.controls['dueDate'];
        dueDateControl.patchValue(date);
    };
    BillComponent.prototype.setBillDate = function (date) {
        var billDateControl = this.billForm.controls['billDate'];
        billDateControl.patchValue(date);
        if (this.billForm.controls['term'].value) {
            this.selectTerm(this.billForm.controls['term'].value);
        }
        if (this.billCurrency != this.companyCurrency) {
            this.getCurrencyValue(this.billCurrency, this.companyCurrency, this.billForm.controls['billDate'].value);
        }
    };
    BillComponent.prototype.setEndDate = function (date) {
        var endDateControl = this.billForm.controls['endDate'];
        endDateControl.patchValue(date);
    };
    BillComponent.prototype.setBillLines = function (data) {
        var base = this;
        data.lines = [];
        var lineListControl = this.billForm.controls['lines'];
        var defaultLine = this._lineListForm.getData(this._fb.group(this._lineListForm.getForm()));
        _.each(lineListControl.controls, function (lineListForm) {
            var lineData = base._lineListForm.getData(lineListForm);
            if (base.newBill) {
                if (!lineData.destroy && !_.isEqual(lineData, defaultLine)) {
                    data.lines.push(lineData);
                }
            }
            else {
                if (lineData.billLineId) {
                    data.lines.push(lineData);
                }
                else if (!lineData.destroy && !_.isEqual(lineData, defaultLine)) {
                    data.lines.push(lineData);
                }
            }
        });
    };
    BillComponent.prototype.validateLines = function (data) {
        var base = this;
        var result = false;
        _.each(data.lines, function (line) {
            if (!line.destroy) {
                if (!line.quantity) {
                    base._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Line should have quantity");
                    result = true;
                    return false;
                }
                if (!line.unitPrice) {
                    base._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Line should have Unit Price");
                    result = true;
                    return false;
                }
                if (!line.itemCode && !line.expenseCode) {
                    base._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Line should have Item code or Expense code");
                    result = true;
                    return false;
                }
            }
        });
        return result;
    };
    BillComponent.prototype.submit = function ($event, action) {
        var _this = this;
        $event && $event.preventDefault();
        var data = this._billForm.getData(this.billForm);
        this.billAction = action;
        if (data.hasPaidApplied) {
            this.onBillApplied = data.hasPaidApplied;
            data.paidBillDetails = this.paidBill;
            data.action = 'submit';
        }
        data.notes = this.notes;
        delete data.currentUsers;
        delete data.link;
        delete data['userID'];
        delete data['lineAmount'];
        delete data['lineDescription'];
        if (action) {
            data.action = action;
        }
        this.setBillLines(data);
        if (this.validateLines(data)) {
            return;
        }
        if (this.newBill) {
            this.loadingService.triggerLoadingEvent(true);
            data.id = this.billID;
            data.companyID = this.companyID;
            data.companyName = Session_1.Session.getCurrentCompanyName();
            this.billsService.createBill(data, this.companyID)
                .subscribe(function (success) { return _this.showMessage(true, success, action); }, function (error) { return _this.showMessage(false, error, action); });
        }
        else {
            this.tempData = data;
            this.checkLockDate();
        }
    };
    BillComponent.prototype.reject = function () {
    };
    BillComponent.prototype.updateBillDetails = function () {
        var _this = this;
        this.billsService.updateBill(this.tempData)
            .subscribe(function (success) { return _this.showMessage(true, success, _this.billAction); }, function (error) { return _this.showMessage(false, error, _this.billAction); });
    };
    BillComponent.prototype.showMessage = function (status, obj, action) {
        this.loadingService.triggerLoadingEvent(false);
        var base = this;
        var nextTab = base.tabId;
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.message = "Bill saved successfully.";
            var lines = this.bill.lines;
            if (this.bill.currentState == 'Enter' && this.bill.lines.length == 0) {
                this.saveBillLines();
                return;
            }
            if (action && action == 'reject') {
                this.message = "Bill got rejected successfully.";
            }
            if (action && action != 'reject') {
                if (nextTab == 'enter') {
                    nextTab = 'approve';
                    this.message = "Bill Sent For Approval.";
                }
                else if (nextTab == 'approve') {
                    nextTab = 'pay';
                    this.message = "Bill Approved.";
                    if (this.billRank != this.maxRank) {
                        nextTab = base.tabId;
                    }
                }
                else if (nextTab == 'pay') {
                    this.message = "Bill Payment Initiated";
                    nextTab = 'paid';
                }
                /*if(this.tabId == 'enter') {
                 this.message = "Bill Sent For Approval.";
                 } else if(this.tabId == 'approve') {
                 this.message = "Bill Approved.";
                 if(this.billRank!=this.maxRank){
                 nextTab=base.tabId;
                 }
                 } else if(this.tabId == 'pay') {
                 this.message = "Bill Payment Initiated";
                 }*/
            }
            if (this.newBill) {
                nextTab = 'enter';
                if (action == 'submit') {
                    nextTab = 'approve';
                }
                var link = ['payments/dashboard', nextTab];
                base._router.navigate(link);
            }
            else {
                if (this.onBillApplied) {
                    nextTab = 'paid';
                    this.message = "Bill Payed Successfully";
                }
                this.newForm();
                this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, this.message);
                var link = ['payments/dashboard', nextTab];
                base._router.navigate(link);
            }
        }
        else {
            this.status = {};
            this.status['error'] = true;
            this.message = obj;
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to update");
        }
    };
    BillComponent.prototype.hasCheckedAll = function () {
        var checkListCntl = this.billForm.controls['checkList'];
        var status = true;
        checkListCntl.controls.forEach(function (control) {
            if (!control.controls['acknowledged'].value) {
                status = false;
            }
        });
        var amount = this.checkNumber(this.billForm.controls['amount'].value);
        if (!amount || amount <= 0.00) {
            status = false;
        }
        return status;
    };
    BillComponent.prototype.edit1099Bill = function () {
        jQuery(this.edit1099.nativeElement).foundation('open');
    };
    BillComponent.prototype.isCurrentUser = function () {
        if (this.bill && this.bill.currentState != 'Paid' && (this.bill.ownerID == Session_1.Session.getUser().id || this.bill.currentUsers.indexOf(Session_1.Session.getUser().id) != -1)) {
            return true;
        }
        return false;
    };
    BillComponent.prototype.newForm = function () {
        var _this = this;
        this.active = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    BillComponent.prototype.ngAfterViewInit = function () {
        // jQuery(this.tags.nativeElement).tagit();
    };
    BillComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    BillComponent.prototype.submitPay = function ($event) {
        $event && $event.preventDefault();
        this.paySelected();
        /*let link = ['payments/bill-pay',this.companyID,this.billID];
         this._router.navigate(link);*/
    };
    BillComponent.prototype.onEnter = function (recipientInput) {
        var _this = this;
        var commentModel = {};
        commentModel.sourceID = this.billID;
        commentModel.mentions_id = _.map(recipientInput.recipients, 'id');
        commentModel.mentions_name = _.map(recipientInput.recipients, 'name');
        commentModel.comment = recipientInput.comment;
        commentModel.user = Session_1.Session.getUser().firstName;
        this._commentsService.saveComments(this.billID, this.companyID, commentModel).subscribe(function (comment) { return _this.handleComment(comment); }, function (error) { return _this.showError(error); });
    };
    BillComponent.prototype.handleComment = function (comment) {
        this.billComments.splice(0, 0, comment);
        this.commentsLength = this.billComments.length;
    };
    BillComponent.prototype.handleComments = function (comments) {
        this.billComments = comments;
        this.commentsLength = comments.length;
    };
    BillComponent.prototype.selectTerm = function (term) {
        var days = term == 'custom' ? 0 : term.substring(3, term.length);
        var new_date = moment(this.billForm.controls['billDate'].value, 'MM/DD/YYYY').add(days, 'days');
        var dueDateControl = this.billForm.controls['dueDate'];
        dueDateControl.patchValue(moment(new_date).format('MM/DD/YYYY'));
    };
    BillComponent.prototype.showError = function (error) {
    };
    BillComponent.prototype.onVendorSelect = function (val) {
        var vendor = _.find(this.vendorsList, function (o) { return o.name == val; });
        this.accountNumbers = [];
        if (vendor) {
            this.show1099 = vendor.has1099;
            var vendorID = this.billForm.controls['vendorID'];
            vendorID.patchValue(vendor.id);
            if (vendor.accountNumbers) {
                this.accountNumbers = vendor.accountNumbers;
            }
            else if (vendor.accountNumber) {
                this.accountNumbers = [vendor.accountNumber];
            }
            var vendorPaymentMethod = this.billForm.controls['vendorPaymentMethod'];
            vendorPaymentMethod.patchValue(vendor.paymentMethod);
        }
        console.log("this.show1099", this.show1099);
    };
    BillComponent.prototype.onCurrencySelect = function (val) {
        this.billCurrency = val;
        this.displayCurrency = val;
        if (this.billCurrency != this.companyCurrency) {
            this.getCurrencyValue(this.billCurrency, this.companyCurrency, this.billForm.controls['billDate'].value);
        }
        else {
            this.showConvertedCurrency = false;
        }
    };
    BillComponent.prototype.getCurrencyValue = function (billCurrency, companyCurrency, billDate) {
        var _this = this;
        if (billDate)
            billDate = moment(this.billForm.controls['billDate'].value, 'MM/DD/YYYY').format('YYYY-MM-DD');
        if (billCurrency && companyCurrency && billDate)
            this.billsService.getConvertedCurrencyValue(billCurrency, companyCurrency, billDate)
                .subscribe(function (res) {
                _this.convertedAmount = res.result;
                _this.companyCurrencyAmount = (_this.billForm.controls['amount'].value) * _this.convertedAmount;
                _this.showConvertedCurrency = true;
            }, function (error) { return _this.handleError(error); });
    };
    BillComponent.prototype.fileOverBase = function (e) {
        this.hasBaseDropZoneOver = e;
    };
    BillComponent.prototype.startUpload = function ($event) {
        var base = this;
        setTimeout(function () {
            base.uploader.uploadAll();
        }, 500);
    };
    BillComponent.prototype.deleteDocument = function () {
        var _this = this;
        this.billsService.deleteDocumentBySource(this.billID, this.document.id).subscribe(function (res) {
            _this.billFileExist = false;
            _this.billImageLink = null;
            _this.billPdfLink = null;
        }, function (error) {
        });
    };
    BillComponent.prototype.removeUploadItem = function (item) {
        item.remove();
        this.deleteDocument();
    };
    //----------------------------------------------------------------Line Changes---------------------//
    BillComponent.prototype.selectValue = function ($event, dimension, value) {
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        _.each(this.selectedDimensions, function (selectedDimension) {
            if (selectedDimension.name == dimension.name) {
                if (selectedDimension.values.indexOf(value) == -1) {
                    selectedDimension.values.push(value);
                }
                else {
                    selectedDimension.values.splice(selectedDimension.values.indexOf(value), 1);
                }
            }
        });
    };
    BillComponent.prototype.isDimensionSelected = function (dimensionName) {
        var selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        return selectedDimensionNames.indexOf(dimensionName) != -1;
    };
    BillComponent.prototype.isValueSelected = function (dimension, value) {
        var currentDimension = _.find(this.selectedDimensions, { 'name': dimension.name });
        if (!_.isEmpty(currentDimension)) {
            if (currentDimension.values.indexOf(value) != -1) {
                return true;
            }
            return false;
        }
    };
    BillComponent.prototype.selectDimension = function ($event, dimensionName) {
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
        var selectedDimensionNames = _.map(this.selectedDimensions, 'name');
        if (selectedDimensionNames.indexOf(dimensionName) == -1) {
            this.selectedDimensions.push({
                "name": dimensionName,
                "values": []
            });
        }
        else {
            this.selectedDimensions.splice(selectedDimensionNames.indexOf(dimensionName), 1);
        }
    };
    BillComponent.prototype.showFlyout = function (lineStatus, index) {
        this.dimensionFlyoutCSS = "expanded";
        this.lineActive = true;
        this.resetLineForm();
        this.selectedDimensions = [];
        this.editingLineIndex = index;
        var itemsControl = this.billForm.controls['lines'];
        var lineListItem = itemsControl.controls[index];
        var tempLineForm = _.cloneDeep(lineListItem);
        var lineData = this._lineListForm.getData(tempLineForm);
        this.displayItemCodeCOA(lineData.itemCode);
        this.displayExpenseCodeCOA(lineData.expenseCode);
        this.selectedDimensions = lineData.dimensions || [];
        this.updateLineFormForEdit(lineData);
    };
    BillComponent.prototype.resetLineForm = function () {
        var description = this.lineForm.controls['description'];
        description.patchValue('');
        var unitPrice = this.lineForm.controls['unitPrice'];
        unitPrice.patchValue('');
        var quantity = this.lineForm.controls['quantity'];
        quantity.patchValue('');
        var amount = this.lineForm.controls['amount'];
        amount.patchValue('');
        var dimensionsControl = this.lineForm.controls['dimensions'];
        dimensionsControl.patchValue([]);
        var has1099 = this.lineForm.controls['has1099'];
        has1099.patchValue('');
        var hasAsset = this.lineForm.controls['hasAsset'];
        hasAsset.patchValue('');
        var _1099Mapping = this.lineForm.controls['_1099Mapping'];
        _1099Mapping.patchValue('');
        var itemCode = this.lineForm.controls['itemCode'];
        itemCode.patchValue('');
        var expenseCode = this.lineForm.controls['expenseCode'];
        expenseCode.patchValue('');
    };
    BillComponent.prototype.saveLine = function () {
        var base = this;
        var dimensions = this.lineForm.controls['dimensions'];
        dimensions.patchValue(this.selectedDimensions);
        var amount = this.lineForm.controls['amount'];
        amount.patchValue(this.numeralService.format("0,0.00", this._lineListForm.getData(this.lineForm).amount));
        var lineData = this._lineListForm.getData(this.lineForm);
        lineData['amount'] = parseFloat(this.numeralService.value(lineData['amount']));
        if (lineData.expenseCode && lineData.itemCode) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select either item code or account code");
            return;
        }
        if (!lineData.expenseCode && !lineData.itemCode) {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select either item code or account code");
            return;
        }
        if (this.bill.currentState == 'Enter' && this.bill.lines.length == 0) {
            this.submit(null);
            this.hideFlyout();
            return;
        }
        this.selectedDimensions = [];
        this.updateLineInView(lineData);
        this.hideFlyout();
    };
    BillComponent.prototype.hideFlyout = function () {
        this.dimensionFlyoutCSS = "collapsed";
    };
    /*This will just add new line details in VIEW*/
    BillComponent.prototype.saveLineInView = function (line) {
        var base = this;
        var lineListForm = _.cloneDeep(this._fb.group(this._lineListForm.getForm(line)));
        var lineListControl = this.billForm.controls['lines'];
        lineListControl.controls.push(lineListForm);
        var lineData = [];
        _.each(lineListControl.controls, function (lineForm) {
            lineData.push(base._lineListForm.getData(lineForm));
        });
        this.billForm.controls['lines'].patchValue(lineData);
        setTimeout(function () {
            base.updateLineToatal(null, null);
        }, 1000);
    };
    BillComponent.prototype.newLineForm = function () {
        var base = this;
        this.lineActive = false;
        setTimeout(function () {
            base.lineActive = true;
        }, 0);
    };
    BillComponent.prototype.updateLineFormForEdit = function (lineData) {
        var base = this;
        this.newLineForm();
        lineData.amount = parseFloat(lineData.amount).toFixed(2);
        this._lineListForm.updateForm(this.lineForm, lineData);
        this.lineTags = lineData.tags;
        var data = this._billForm.getData(this.billForm);
        this.selectedDimensions = lineData.dimensions;
    };
    /*This function will stop event bubbling to avoid default selection of first value in first dimension*/
    BillComponent.prototype.doNothing = function ($event) {
        $event && $event.preventDefault();
        $event && $event.stopPropagation();
        $event && $event.stopImmediatePropagation();
    };
    BillComponent.prototype.getLineCount = function () {
        var linesControl = this.billForm.controls['lines'];
        var activeLines = [];
        _.each(linesControl.controls, function (lineControl) {
            if (!lineControl.controls['destroy'].value) {
                activeLines.push(lineControl);
            }
        });
        return activeLines.length;
    };
    /*This will just update line details in VIEW*/
    BillComponent.prototype.updateLineInView = function (line) {
        var linesControl = this.billForm.controls['lines'];
        var currentLineControl = linesControl.controls[this.editingLineIndex];
        if (currentLineControl.editable) {
            currentLineControl.editable = !currentLineControl.editable;
        }
        var billLines = this.billForm.controls['lines'];
        var lineControl = billLines.controls[this.editingLineIndex];
        lineControl.controls['description'].patchValue(line.description);
        lineControl.controls['amount'].patchValue(line.amount);
        lineControl.controls['unitPrice'].patchValue(line.unitPrice);
        lineControl.controls['quantity'].patchValue(line.quantity);
        lineControl.controls['itemCode'].patchValue(line.itemCode);
        lineControl.controls['expenseCode'].patchValue(line.expenseCode);
        lineControl.controls['dimensions'].patchValue(line.dimensions);
        lineControl.controls['destroy'].patchValue(line.destroy);
        this.updateLineToatal(null, null);
    };
    BillComponent.prototype.stopLoaderAndShowMessage = function (error, message) {
        this.loadingService.triggerLoadingEvent(false);
        if (message) {
            var type = error ? Qount_constants_1.TOAST_TYPE.error : Qount_constants_1.TOAST_TYPE.success;
            this._toastService.pop(type, message);
        }
    };
    BillComponent.prototype.deleteLine = function ($event, lineIndex) {
        var base = this;
        $event && $event.stopImmediatePropagation();
        var lineList = this.billForm.controls['lines'];
        lineList.controls[lineIndex].controls['destroy'].patchValue(true);
        setTimeout(function () {
            base.updateLineToatal(null, null);
        });
    };
    BillComponent.prototype.refreshLineForm = function () {
        var base = this;
        this.lineActive = false;
        setTimeout(function () {
            base.lineActive = true;
        }, 0);
    };
    BillComponent.prototype.hasMarkPaidApplied = function () {
        this.showMarkPaidFlyout = this.billForm.controls['hasPaidApplied'].value;
        if (!this.showMarkPaidFlyout) {
            this.resetPaidBill();
        }
    };
    BillComponent.prototype.hideMarkPaidFlyout = function () {
        this.showMarkPaidFlyout = !this.showMarkPaidFlyout;
        if (!this.showMarkPaidFlyout) {
            this.resetPaidBill();
            var markPaidControl = this.billForm.controls['hasPaidApplied'];
            markPaidControl.patchValue(false);
        }
    };
    BillComponent.prototype.resetPaidBill = function () {
        this.paidBill = {};
    };
    BillComponent.prototype.saveMarkPaidDetails = function (paidBillDetails) {
        if ((paidBillDetails.title && paidBillDetails.payMethod && paidBillDetails.bankAccountID && paidBillDetails.payNumber && paidBillDetails.payDate)) {
            this.submit(null);
        }
        else {
            this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "All fields are mandatory");
        }
    };
    BillComponent.prototype.setMarkPaidDate = function (date) {
        this.paidBill.payDate = date;
    };
    BillComponent.prototype.showDashboard = function () {
        var tabId = this.newBill ? 'enter' : this.tabId;
        var link = ['payments/dashboard', tabId];
        this._router.navigate(link);
    };
    BillComponent.prototype.onBankSelect = function (bankAccount) {
        this.paidBill.bankAccountID = bankAccount.id;
    };
    BillComponent.prototype.getCurrencyFormatted = function (value) {
        var locale = this.billForm.controls['currency'].value;
        this.numeralService.switchLocale(locale);
        this.numeralService.format("0,0.00", value);
    };
    BillComponent.prototype.saveBillLines = function () {
        var lineData = this._lineListForm.getData(this.lineForm);
    };
    BillComponent.prototype.goToPreviousPage = function () {
        var prevState = this.stateService.pop();
        if (prevState) {
            this._router.navigate([prevState.url]);
        }
        else {
            var tabId = this.newBill ? 'enter' : this.tabId;
            var link = ['payments/dashboard', tabId.toLowerCase()];
            this._router.navigate(link);
        }
    };
    BillComponent.prototype.showMappingPage = function () {
        if (this.journalID) {
            this.stateService.addState(new State_1.State("BILL_PAGE", this._router.url, null, null));
            var link = ['journalEntry', this.journalID];
            this._router.navigate(link);
        }
    };
    BillComponent.prototype.paySelected = function () {
        var currentDate = moment(new Date()).format("YYYY-MM-DD");
        var defaultCompanyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        var currencyConversionOBJ = {
            toCurrency: defaultCompanyCurrency,
            date: currentDate
        };
        var billAmount = this.bill.amount ? this.bill.amount : 0;
        var currency = this.bill.currency ? this.bill.currency : 'USD';
        this.bill.billAmount = billAmount.toLocaleString(currency, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.selectedRows.push(this.bill);
        this.bill.amountPaid = this.bill.amountPaid ? this.bill.amountPaid : 0;
        this.bill.payAmount = (this.bill.amount - this.bill.amountPaid) ? (this.bill.amount - this.bill.amountPaid).toFixed(2) : 0;
        this.bill.unpaidAmount = this.bill.amount - this.bill.amountPaid;
        this.bill.id = this.bill.id;
        this.bill.billNumber = this.bill.billNumber;
        this.bill.currency = this.bill.currency;
        this.bill.vendorPaymentMethod = this.bill.vendorPaymentMethod;
        currencyConversionOBJ.id = this.bill.id;
        currencyConversionOBJ.fromCurrency = this.bill.currency;
        currencyConversionOBJ.amount = this.bill.amount;
        this.currencyConversionList.push(currencyConversionOBJ);
        this.navigateTOMultiPay();
    };
    BillComponent.prototype.navigateTOMultiPay = function () {
        var _this = this;
        var base = this;
        var foreignCurrency = false;
        this.billsService.convertCurrency(this.currencyConversionList)
            .subscribe(function (conversionData) {
            base.selectedRows.forEach(function (bill, index) {
                var billFound = _.find(conversionData, function (_bill) {
                    return _bill.id == bill.id;
                });
                if (billFound) {
                    if (bill.currency != Session_1.Session.getCurrentCompanyCurrency()) {
                        foreignCurrency = true;
                        bill.amountPaid = bill.amountPaid ? bill.amountPaid : 0;
                        bill.payAmount = (billFound.convertedAmount - bill.amountPaid) ? (billFound.convertedAmount - bill.amountPaid).toFixed(2) : 0;
                        bill.unpaidAmount = billFound.convertedAmount - bill.amountPaid;
                        bill.conversionRate = billFound.conversionRate;
                    }
                }
            });
            Session_1.Session.put("selectedBills", _this.selectedRows);
            Session_1.Session.put("selectedCredits", []);
            Session_1.Session.put("hasForeignCurrency", foreignCurrency);
            var link = ['payments/multipay', Session_1.Session.getCurrentCompany()];
            base._router.navigate(link);
        }, function (error) { return _this.handleError(error); });
    };
    BillComponent.prototype.checkLockDate = function () {
        if (Session_1.Session.getLockDate()) {
            if (moment(Session_1.Session.getLockDate(), "MM/DD/YYYY").valueOf() > moment().valueOf()) {
                jQuery('#bill-password-conformation').foundation('open');
            }
            else {
                this.updateBillDetails();
            }
        }
        else {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please set company lock date");
        }
    };
    BillComponent.prototype.validateLockKey = function () {
        var _this = this;
        var data = {
            "key": this.key
        };
        this.companyService.validateLockKey(Session_1.Session.getCurrentCompany(), data).subscribe(function (res) {
            _this.validateLockDate = res.validation;
            if (res.validation) {
                _this.closePasswordConfirmation();
                _this.loadingService.triggerLoadingEvent(true);
                _this.updateBillDetails();
            }
            else {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invalid key");
            }
        }, function (fail) {
        });
    };
    BillComponent.prototype.closePasswordConfirmation = function () {
        this.resetPasswordConformation();
        jQuery('#bill-password-conformation').foundation('close');
    };
    BillComponent.prototype.checkValidation = function () {
        if (this.key)
            return true;
        else
            return false;
    };
    BillComponent.prototype.resetPasswordConformation = function () {
        this.key = null;
    };
    return BillComponent;
}());
__decorate([
    core_1.ViewChild('edit1099'),
    __metadata("design:type", Object)
], BillComponent.prototype, "edit1099", void 0);
__decorate([
    core_1.ViewChild('bankAccountsComboBoxDir'),
    __metadata("design:type", comboBox_directive_1.ComboBox)
], BillComponent.prototype, "bankAccountsComboBox", void 0);
BillComponent = __decorate([
    core_1.Component({
        selector: 'bill',
        templateUrl: '/app/views/bill.html',
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, forms_1.FormBuilder, Bills_service_1.BillsService, Bill_form_1.BillForm, CheckListForm_1.CheckListForm, CheckListForm_1.LineListForm,
        router_1.ActivatedRoute, platform_browser_1.DomSanitizer, router_1.Router, Toast_service_1.ToastService, Comments_service_1.CommentsService, Companies_service_1.CompaniesService,
        Workflow_service_1.WorkflowService, CodesService_service_1.CodesService, SwitchBoard_1.SwitchBoard, ExpenseCodes_service_1.ExpensesService, DimensionService_service_1.DimensionService,
        LoadingService_1.LoadingService, ChartOfAccounts_service_1.ChartOfAccountsService, Numeral_service_1.NumeralService, StateService_1.StateService])
], BillComponent);
exports.BillComponent = BillComponent;
