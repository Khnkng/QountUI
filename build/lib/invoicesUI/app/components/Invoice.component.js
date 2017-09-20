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
var router_1 = require("@angular/router");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Invoices_service_1 = require("../services/Invoices.service");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Customers_service_1 = require("qCommon/app/services/Customers.service");
var CodesService_service_1 = require("qCommon/app/services/CodesService.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Invoice_form_1 = require("../forms/Invoice.form");
var forms_1 = require("@angular/forms");
var InvoiceLine_form_1 = require("../forms/InvoiceLine.form");
var ChartOfAccounts_service_1 = require("qCommon/app/services/ChartOfAccounts.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var Reports_service_1 = require("reportsUI/app/services/Reports.service");
var payments_constants_1 = require("reportsUI/app/constants/payments.constants");
var StateService_1 = require("qCommon/app/services/StateService");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var InvoiceComponent = (function () {
    function InvoiceComponent(_fb, _router, _route, loadingService, invoiceService, toastService, codeService, companyService, customerService, _invoiceForm, _invoiceLineForm, _invoiceLineTaxesForm, coaService, titleService, stateService, reportService, switchBoard) {
        var _this = this;
        this._fb = _fb;
        this._router = _router;
        this._route = _route;
        this.loadingService = loadingService;
        this.invoiceService = invoiceService;
        this.toastService = toastService;
        this.codeService = codeService;
        this.companyService = companyService;
        this.customerService = customerService;
        this._invoiceForm = _invoiceForm;
        this._invoiceLineForm = _invoiceLineForm;
        this._invoiceLineTaxesForm = _invoiceLineTaxesForm;
        this.coaService = coaService;
        this.titleService = titleService;
        this.stateService = stateService;
        this.reportService = reportService;
        this.switchBoard = switchBoard;
        this.preference = {};
        this.customers = [];
        this.invoiceLineArray = new forms_1.FormArray([]);
        this.taxArray = [];
        this.itemActive = false;
        this.chartOfAccounts = [];
        this.maillIds = [];
        //hasMilIds:boolean=true;
        this.tasksLineArray = new forms_1.FormArray([]);
        this.taskTaxArray = [];
        this.amount = 0;
        this.customerContacts = [];
        this.selectedContact = {};
        this.selectedCustomer = {};
        this.taxTotal = 0;
        this.subTotal = 0;
        this.localeFormat = 'en-us';
        this.taskItemCodes = [];
        this.itemItemCodes = [];
        this.discountEditMode = false;
        this.amountPaidEditMode = false;
        this.preViewText = "Preview Invoice";
        this.coreValue = 0;
        this.titleService.setPageTitle("Invoices");
        var _form = this._invoiceForm.getForm();
        _form['invoiceLines'] = this.invoiceLineArray;
        _form['taskLines'] = this.tasksLineArray;
        this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
        this.invoiceForm = this._fb.group(_form);
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.invoiceID = params['invoiceID'];
            _this.defaultDate = moment(new Date()).format("MM/DD/YYYY");
            _this.loadInitialData();
            _this.loadCOA();
            _this.getCompanyDetails();
        });
        this.getCompanyLogo();
        if (this._router.url.indexOf('duplicate') != -1) {
            this.isDuplicate = true;
        }
        ;
        this.routeSubscribe = switchBoard.onClickPrev.subscribe(function (title) {
            _this.gotoPreviousState();
        });
    }
    InvoiceComponent.prototype.gotoPreviousState = function () {
        var previousState = this.stateService.getPrevState();
        if (previousState && previousState.key == "New-Payment-Invoice") {
            var link = [previousState.url];
            this._router.navigate(link);
        }
        else {
            this._router.navigate([previousState.url]);
        }
    };
    InvoiceComponent.prototype.loadCustomers = function (companyId) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.customerService.customers(companyId)
            .subscribe(function (customers) {
            _this.customers = customers;
            _this.loadItemCodes(companyId);
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load your customers");
            _this.closeLoader();
        });
    };
    InvoiceComponent.prototype.getCompanyLogo = function () {
        var _this = this;
        this.invoiceService.getCompanyLogo(Session_1.Session.getCurrentCompany(), Session_1.Session.getUser().id)
            .subscribe(function (preference) { return _this.processPreference(preference[0]); }, function (error) { return _this.handleError(error); });
    };
    InvoiceComponent.prototype.processPreference = function (preference) {
        if (preference && preference.temporaryURL) {
            this.logoURL = preference.temporaryURL;
        }
    };
    InvoiceComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
        this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to perform operation");
    };
    InvoiceComponent.prototype.closeLoader = function () {
        this.loadingService.triggerLoadingEvent(false);
    };
    InvoiceComponent.prototype.loadItemCodes = function (companyId) {
        var _this = this;
        this.codeService.itemCodes(companyId)
            .subscribe(function (itemCodes) {
            _this.itemCodes = itemCodes;
            _this.taskItemCodes = _.filter(itemCodes, { 'is_service': true });
            _this.itemItemCodes = _.filter(itemCodes, { 'is_service': false });
            _this.loadTaxList(companyId);
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load your Items");
            _this.closeLoader();
        });
    };
    InvoiceComponent.prototype.loadTaxList = function (companyId) {
        var _this = this;
        this.companyService.getTaxofCompany(companyId)
            .subscribe(function (taxesList) {
            _this.taxesList = taxesList;
            _this.setupForm();
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load your Taxes");
            _this.closeLoader();
        });
    };
    InvoiceComponent.prototype.setupForm = function () {
        var _this = this;
        var base = this;
        if (!this.invoiceID) {
            this.closeLoader();
            this.setInvoiceDate(this.defaultDate);
            this.newInvoice = true;
            for (var i = 0; i < 2; i++) {
                this.addInvoiceList(null, 'item');
                this.addInvoiceList(null, 'task');
            }
            this.titleService.setPageTitle("New Invoice");
        }
        else {
            this.titleService.setPageTitle("Edit Invoice");
            this.invoiceService.getInvoice(this.invoiceID).subscribe(function (invoice) {
                var base = _this;
                _this.invoice = invoice;
                _this.subTotal = invoice.sub_total;
                _this.taxTotal = invoice.tax_amount;
                var _invoice = _.cloneDeep(invoice);
                delete _invoice.invoiceLines;
                var taskLines = [];
                var itemLines = [];
                taskLines = _.filter(_this.invoice.invoiceLines, function (invoice) { return invoice.type == 'task'; });
                itemLines = _.filter(_this.invoice.invoiceLines, function (invoice) { return invoice.type == 'item'; });
                if (taskLines.length == 0) {
                    for (var i = 0; i < 2; i++) {
                        _this.addInvoiceList(null, 'task');
                    }
                }
                if (itemLines.length == 0) {
                    for (var i = 0; i < 2; i++) {
                        _this.addInvoiceList(null, 'item');
                    }
                }
                _this.coreValue = _.random(50, 75) + '%';
                _this.getCustomrtDetails(invoice.customer_id);
                _this.loadContacts(invoice.customer_id);
                _this._invoiceForm.updateForm(_this.invoiceForm, _invoice);
                _this.invoice.invoiceLines.forEach(function (invoiceLine) {
                    base.addInvoiceList(invoiceLine, invoiceLine.type);
                });
            });
        }
    };
    InvoiceComponent.prototype.loadInitialData = function () {
        var companyId = Session_1.Session.getCurrentCompany();
        this.loadCustomers(companyId);
    };
    InvoiceComponent.prototype.getCompanyDetails = function () {
        var _this = this;
        this.companyService.company(Session_1.Session.getCurrentCompany())
            .subscribe(function (companyAddress) {
            if (companyAddress) {
                var address = {
                    name: companyAddress.name,
                    address: companyAddress.addresses[0].line,
                    country: companyAddress.addresses[0].country,
                    state: companyAddress.addresses[0].stateCode,
                    zipcode: companyAddress.addresses[0].zipcode
                };
                _this.companyAddress = address;
            }
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load your Company details");
        });
    };
    InvoiceComponent.prototype.addInvoiceList = function (line, type) {
        var base = this;
        if (type == 'task') {
            var _taskForm = this._invoiceLineForm.getForm(line);
            var tasksListForm = this._fb.group(_taskForm);
            this.tasksLineArray.push(tasksListForm);
        }
        else if (type == 'item') {
            var _form = this._invoiceLineForm.getForm(line);
            var invoiceListForm = this._fb.group(_form);
            this.invoiceLineArray.push(invoiceListForm);
        }
    };
    InvoiceComponent.prototype.deleteInvoiceLine = function (index, type) {
        if (type == 'item') {
            this.invoiceLineArray.removeAt(index);
            this.taxArray.splice(index, 1);
        }
        else if (type == 'task') {
            this.tasksLineArray.removeAt(index);
            this.taskTaxArray.splice(index, 1);
        }
    };
    InvoiceComponent.prototype.deleteTaxLine = function (index, taxLineIndex, type) {
        if (type == 'task') {
            this.taskTaxArray[index].removeAt(taxLineIndex);
        }
        else if (type == 'item') {
            this.taxArray[index].removeAt(taxLineIndex);
        }
    };
    InvoiceComponent.prototype.ngOnInit = function () {
        if (!this.newInvoice) {
            //Fetch existing invoice
        }
    };
    InvoiceComponent.prototype.setInvoiceDate = function (date) {
        var invoiceDateControl = this.invoiceForm.controls['invoice_date'];
        invoiceDateControl.patchValue(date);
        var term = this.invoiceForm.controls['term'].value;
        if (term)
            this.selectTerm(term);
    };
    InvoiceComponent.prototype.setPaymentDate = function (date) {
        var paymentDateControl = this.invoiceForm.controls['due_date'];
        paymentDateControl.patchValue(date);
    };
    InvoiceComponent.prototype.setPlanEndDate = function (date) {
        var planEndDateControl = this.invoiceForm.controls['ends_after'];
        planEndDateControl.patchValue(date);
    };
    InvoiceComponent.prototype.populateCustomers = function () {
    };
    InvoiceComponent.prototype.gotoCustomersPage = function () {
        var link = ['/customers'];
        this._router.navigate(link);
    };
    InvoiceComponent.prototype.calcLineTax = function (taxId, price, quantity) {
        var tax = _.find(this.taxesList, { id: taxId });
        if (taxId && price && quantity && tax) {
            var priceVal = numeral(price).value();
            var quantityVal = numeral(quantity).value();
            return numeral((tax.taxRate * parseFloat(priceVal) * parseFloat(quantityVal)) / 100).value();
        }
        return numeral(0).value();
    };
    InvoiceComponent.prototype.calcAmt = function (price, quantity) {
        if (price && quantity) {
            var priceVal = numeral(price).value();
            var quantityVal = numeral(quantity).value();
            return numeral(parseFloat(priceVal) * parseFloat(quantityVal)).value();
        }
        return numeral(0).value();
    };
    /*calcSubTotal() {
     let invoiceData = this._invoiceForm.getData(this.invoiceForm);
     let subTotal = 0;
     let base = this;
     if(invoiceData.invoiceLines) {
     invoiceData.invoiceLines.forEach(function(invoiceLine){
     subTotal = subTotal + numeral(base.calcAmt(invoiceLine.price, invoiceLine.quantity)).value();
     });
     }
     return numeral(subTotal).format('$00.00');
     }*/
    InvoiceComponent.prototype.calcSubTotal = function () {
        var invoiceData = this._invoiceForm.getData(this.invoiceForm);
        var total = 0;
        var base = this;
        var taskTotal = 0;
        if (invoiceData.invoiceLines) {
            invoiceData.invoiceLines.forEach(function (invoiceLine) {
                if (!invoiceLine.destroy) {
                    total = total + base.calcAmt(invoiceLine.price, invoiceLine.quantity);
                }
            });
        }
        if (invoiceData.taskLines) {
            invoiceData.taskLines.forEach(function (invoiceLine) {
                if (!invoiceLine.destroy) {
                    taskTotal = taskTotal + base.calcAmt(invoiceLine.price, invoiceLine.quantity);
                }
            });
        }
        this.subTotal = numeral(total + taskTotal).value();
        return this.subTotal;
    };
    InvoiceComponent.prototype.calTaxTotal = function () {
        var invoiceData = this._invoiceForm.getData(this.invoiceForm);
        var base = this;
        var lineTaxTotal = 0;
        var itemTaxTotal = 0;
        if (invoiceData.invoiceLines) {
            invoiceData.invoiceLines.forEach(function (invoiceLine) {
                var total = base.calcAmt(invoiceLine.price, invoiceLine.quantity);
                if (invoiceLine.tax_id) {
                    var taxAmt = base.calcLineTax(invoiceLine.tax_id, 1, total);
                    if (!invoiceLine.destroy) {
                        itemTaxTotal = itemTaxTotal + taxAmt;
                    }
                }
            });
        }
        if (invoiceData.taskLines) {
            invoiceData.taskLines.forEach(function (invoiceLine) {
                var total = base.calcAmt(invoiceLine.price, invoiceLine.quantity);
                if (invoiceLine.tax_id) {
                    var taxAmt = base.calcLineTax(invoiceLine.tax_id, 1, total);
                    if (!invoiceLine.destroy) {
                        lineTaxTotal = lineTaxTotal + taxAmt;
                    }
                }
            });
        }
        this.taxTotal = numeral(lineTaxTotal + itemTaxTotal).value();
        return this.taxTotal;
    };
    InvoiceComponent.prototype.submit = function ($event, sendMail, action) {
        $event.preventDefault();
        $event.stopPropagation();
        var itemLines = [];
        var taskLines = [];
        var invoiceData = this._invoiceForm.getData(this.invoiceForm);
        var base = this;
        invoiceData.amount = this.amount;
        delete invoiceData.invoiceLines;
        taskLines = this.getInvoiceLines('task');
        itemLines = this.getInvoiceLines('item');
        if (this.amount < 0) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invoice amount should grater than or equal to zero");
            return;
        }
        if (taskLines.length == 0 && itemLines.length == 0) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please add Tasks or Item Lines");
            return;
        }
        if (this.validateLines(itemLines, 'item') || this.validateLines(taskLines, 'task')) {
            return;
        }
        invoiceData.sub_total = this.subTotal;
        invoiceData.amount_due = this.amount;
        invoiceData.tax_amount = this.taxTotal;
        invoiceData.invoiceLines = itemLines.concat(taskLines);
        invoiceData.recepientsMails = this.maillIds;
        invoiceData.sendMail = sendMail;
        invoiceData.company = this.companyAddress;
        invoiceData.customer = this.selectedCustomer;
        invoiceData.user_id = Session_1.Session.getUser().id;
        invoiceData.company_id = Session_1.Session.getCurrentCompany();
        invoiceData.logoURL = this.logoURL;
        this.invoiceProcessedData = invoiceData;
        if (action == 'email') {
            this.openEmailDailog();
        }
        else if (action == 'draft') {
            this.saveInvoiceDetails(invoiceData);
        }
        else if (action == 'preview') {
            this.togelPreview();
        }
        else if (action == 'download') {
            if (!this.showPreview) {
                this.togelPreview();
            }
            var base_1 = this;
            setTimeout(function () {
                base_1.exportToPDF();
            });
        }
    };
    InvoiceComponent.prototype.togelPreview = function () {
        this.showPreview = !this.showPreview;
        if (this.showPreview) {
            this.preViewText = "Close Preview";
        }
        else {
            this.preViewText = "Preview Invoice";
        }
    };
    InvoiceComponent.prototype.openEmailDailog = function () {
        jQuery('#invoice-email-conformation').foundation('open');
    };
    InvoiceComponent.prototype.closeEmailDailog = function () {
        this.resetEmailDailogFields();
        jQuery('#invoice-email-conformation').foundation('close');
    };
    InvoiceComponent.prototype.resetEmailDailogFields = function () {
        this.additionalMails = null;
    };
    InvoiceComponent.prototype.sendInvoiceMails = function () {
        if (this.additionalMails) {
            this.invoiceProcessedData.recepientsMails.push(this.additionalMails);
        }
        this.saveInvoiceDetails(this.invoiceProcessedData);
        this.closeEmailDailog();
    };
    InvoiceComponent.prototype.saveInvoiceDetails = function (invoiceData) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        delete invoiceData.company;
        delete invoiceData.customer;
        delete invoiceData.taskLines;
        delete invoiceData.logoURL;
        if (this.newInvoice || this.isDuplicate) {
            this.invoiceService.createInvoice(invoiceData).subscribe(function (resp) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Invoice created successfully");
                //this.navigateToDashborad();
                _this.gotoPreviousState();
            }, function (error) {
                if (error && JSON.parse(error))
                    _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, JSON.parse(error).message);
                else
                    _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invoice creation  failed");
                _this.closeLoader();
            });
        }
        else {
            this.invoiceService.updateInvoice(invoiceData).subscribe(function (resp) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Invoice updated successfully");
                _this.navigateToDashborad();
            }, function (error) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Invoice update failed");
                _this.closeLoader();
            });
        }
    };
    InvoiceComponent.prototype.navigateToDashborad = function () {
        var link = ['invoices/dashboard', 2];
        this._router.navigate(link);
    };
    InvoiceComponent.prototype.selectTerm = function (term) {
        var days = term == 'custom' ? 0 : term.substring(3, term.length);
        var new_date = moment(this.invoiceForm.controls['invoice_date'].value, 'MM/DD/YYYY').add(days, 'days');
        var dueDateControl = this.invoiceForm.controls['due_date'];
        dueDateControl.patchValue(moment(new_date).format('MM/DD/YYYY'));
    };
    InvoiceComponent.prototype.itemChange = function (item, index, type) {
        var itemCode = _.find(this.itemCodes, { 'id': item });
        var itemsControl;
        var itemControl;
        if (type == 'item') {
            itemsControl = this.invoiceForm.controls['invoiceLines'];
        }
        else if (type == 'task') {
            itemsControl = this.invoiceForm.controls['taskLines'];
        }
        if (itemCode) {
            itemControl = itemsControl.controls[index];
            itemControl.controls['description'].patchValue(itemCode.desc);
            itemControl.controls['price'].patchValue(itemCode.sales_price);
        }
        this.calculateTotals();
    };
    InvoiceComponent.prototype.onCustomerSelect = function (value) {
        this.selectedContact = null;
        this.maillIds = [];
        this.getCustomerContacts(value);
        var customer = _.find(this.customers, { 'customer_id': value });
        this.selectedCustomer = customer;
        if (customer) {
            if (customer.term) {
                this.selectTerm(customer.term);
                var term = this.invoiceForm.controls['term'];
                term.patchValue(customer.term);
            }
        }
    };
    InvoiceComponent.prototype.getCustomrtDetails = function (value) {
        //this.getCustomerContacts(value);
        var customer = _.find(this.customers, { 'customer_id': value });
        this.selectedCustomer = customer;
    };
    InvoiceComponent.prototype.onCustomerContactSelect = function (id) {
        var contact = _.find(this.customerContacts, { 'id': id });
        this.selectedContact = contact;
        this.maillIds.push(contact.email);
    };
    InvoiceComponent.prototype.getCustomerContacts = function (id) {
        this.loadingService.triggerLoadingEvent(true);
        this.loadContacts(id);
    };
    InvoiceComponent.prototype.loadContacts = function (id) {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.customerService.customer(id, Session_1.Session.getCurrentCompany())
            .subscribe(function (customers) {
            _this.loadingService.triggerLoadingEvent(false);
            if (customers.customer_contact_details) {
                _this.customerContacts = customers.customer_contact_details;
                if (_this.invoiceID) {
                    var contact = _.find(_this.customerContacts, { 'id': _this.invoice.send_to });
                    if (contact) {
                        _this.selectedContact = contact;
                        _this.maillIds.push(contact.email);
                    }
                }
            }
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to load your customers");
            _this.closeLoader();
        });
    };
    InvoiceComponent.prototype.loadCOA = function () {
        var _this = this;
        this.coaService.chartOfAccounts(Session_1.Session.getCurrentCompany())
            .subscribe(function (chartOfAccounts) {
            _this.chartOfAccounts = chartOfAccounts;
        }, function (error) {
        });
    };
    InvoiceComponent.prototype.displayItemCodeCOA = function (itemId) {
        if (itemId) {
            var itemCode = _.find(this.itemCodes, { 'id': itemId });
            this.updateCOADisplay(itemId);
            if (itemCode) {
                this.editItemForm.controls['description'].patchValue(itemCode.desc);
                this.editItemForm.controls['price'].patchValue(itemCode.sales_price);
            }
        }
        else {
            this.paymentCOAName = "";
            this.invoiceCOAName = "";
        }
    };
    InvoiceComponent.prototype.updateCOADisplay = function (itemId) {
        var itemCode = _.find(this.itemCodes, { 'id': itemId });
        var paymentCOA = _.find(this.chartOfAccounts, { 'id': itemCode.payment_coa_mapping });
        var invoiceCOA = _.find(this.chartOfAccounts, { 'id': itemCode.invoice_coa_mapping });
        if (paymentCOA && paymentCOA.name) {
            this.paymentCOAName = paymentCOA.name;
        }
        if (invoiceCOA && invoiceCOA.name) {
            this.invoiceCOAName = invoiceCOA.name;
        }
    };
    InvoiceComponent.prototype.editInvoiceLine = function ($event, index) {
        $event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        var base = this, data, itemsControl;
        this.itemActive = true;
        this.dimensionFlyoutCSS = "expanded";
        itemsControl = this.invoiceForm.controls['invoiceLines'];
        data = this._invoiceLineForm.getData(itemsControl.controls[index]);
        this.editItemForm = this._fb.group(this._invoiceLineForm.getForm(data));
        if (data.item_id) {
            this.updateCOADisplay(data.item_id);
        }
        this.editItemIndex = index;
    };
    InvoiceComponent.prototype.hideFlyout = function () {
        this.dimensionFlyoutCSS = "collapsed";
        this.itemActive = false;
        this.editItemIndex = null;
    };
    InvoiceComponent.prototype.saveItem = function () {
        var itemData = this._invoiceLineForm.getData(this.editItemForm);
        this.updateLineInView(itemData);
        this.hideFlyout();
    };
    InvoiceComponent.prototype.updateLineInView = function (item) {
        var itemsControl = this.invoiceForm.controls['invoiceLines'];
        var itemControl = itemsControl.controls[this.editItemIndex];
        itemControl.controls['description'].patchValue(item.description);
        itemControl.controls['price'].patchValue(item.price);
        itemControl.controls['quantity'].patchValue(item.quantity);
        itemControl.controls['item_id'].patchValue(item.item_id);
    };
    /*Table implementation*/
    InvoiceComponent.prototype.editItem = function (index, itemForm, type) {
        var linesControl;
        if (type == 'item') {
            linesControl = this.invoiceForm.controls['invoiceLines'];
            this.resetAllLinesFromEditing(linesControl);
            itemForm.editable = !itemForm.editable;
        }
        else if (type == 'task') {
            linesControl = this.invoiceForm.controls['taskLines'];
            this.resetAllLinesFromEditing(linesControl);
            itemForm.editable = !itemForm.editable;
        }
        if (index == this.getLastActiveLineIndex(linesControl)) {
            this.addInvoiceList(null, type);
        }
    };
    InvoiceComponent.prototype.resetAllLinesFromEditing = function (linesControl) {
        _.each(linesControl.controls, function (lineControl) {
            lineControl.editable = false;
        });
    };
    InvoiceComponent.prototype.getLastActiveLineIndex = function (linesControl) {
        var result = false;
        _.each(linesControl.controls, function (lineControl, index) {
            if (!lineControl.controls['destroy'].value) {
                result = index;
            }
        });
        return result;
    };
    InvoiceComponent.prototype.getLineCount = function () {
        var linesControl = this.invoiceForm.controls['invoiceLines'];
        var activeLines = [];
        _.each(linesControl.controls, function (lineControl) {
            if (!lineControl.controls['destroy'].value) {
                activeLines.push(lineControl);
            }
        });
        return activeLines.length;
    };
    InvoiceComponent.prototype.getTaxName = function (taxId) {
        var tax = _.find(this.taxesList, { 'id': taxId });
        return tax ? tax.name + "-" + tax.taxRate : '';
    };
    InvoiceComponent.prototype.getItemCodeName = function (id) {
        var itemcode = _.find(this.itemCodes, { 'id': id });
        return itemcode ? itemcode.name : '';
    };
    InvoiceComponent.prototype.onCurrencySelect = function (currency) {
        this.companyCurrency = currency;
        if (currency == 'USD') {
            this.localeFormat = 'en-Us';
        }
        else if (currency == 'INR') {
            this.localeFormat = 'ind';
        }
    };
    InvoiceComponent.prototype.calculateAmount = function (discount, paidAmount) {
        this.amount = numeral(this.subTotal + this.taxTotal - (numeral(numeral(discount).value() + numeral(paidAmount).value()).value())).value();
        return this.amount;
    };
    InvoiceComponent.prototype.validateTaskLines = function () {
        var status = true;
        if (this.subTotal <= 0) {
            status = false;
        }
        return status;
    };
    InvoiceComponent.prototype.getInvoiceLines = function (type) {
        var base = this;
        var lines = [];
        var lineListControl;
        if (type == 'task') {
            lineListControl = this.invoiceForm.controls['taskLines'];
        }
        else if (type == 'item') {
            lineListControl = this.invoiceForm.controls['invoiceLines'];
        }
        var defaultLine = this._invoiceLineForm.getData(this._fb.group(this._invoiceLineForm.getForm()));
        _.each(lineListControl.controls, function (lineListForm) {
            var lineData = base._invoiceLineForm.getData(lineListForm);
            if (!base.invoiceID) {
                if (!_.isEqual(lineData, defaultLine)) {
                    var item = {};
                    lineData.item = item;
                    lineData.item.name = base.getItemCodeName(lineData.item_id);
                    lineData.type = type;
                    lineData.amount = lineData.quantity * lineData.price;
                    if (!lineData.destroy) {
                        lines.push(lineData);
                    }
                }
            }
            else {
                if (lineData.id) {
                    var item = {};
                    lineData.item = item;
                    lineData.item.name = base.getItemCodeName(lineData.item_id);
                    lineData.amount = lineData.quantity * lineData.price;
                    if (!lineData.destroy) {
                        lines.push(lineData);
                    }
                }
                else if (!_.isEqual(lineData, defaultLine)) {
                    var item = {};
                    lineData.item = item;
                    lineData.item.name = base.getItemCodeName(lineData.item_id);
                    lineData.type = type;
                    lineData.amount = lineData.quantity * lineData.price;
                    if (!lineData.destroy) {
                        lines.push(lineData);
                    }
                }
            }
        });
        return lines;
    };
    InvoiceComponent.prototype.validateLines = function (lines, type) {
        var base = this;
        var result = false;
        _.each(lines, function (line) {
            if (!line.destroy) {
                if (!line.item_id) {
                    if (type == 'task') {
                        base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select task");
                    }
                    else {
                        base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Please select item");
                    }
                    result = true;
                    return false;
                }
                if (!line.quantity) {
                    if (type == 'task') {
                        base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Hours should grater than zero");
                    }
                    else {
                        base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Quantity should grater than zero");
                    }
                    result = true;
                    return false;
                }
                if (!line.price) {
                    if (type == 'task') {
                        base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Rate should grater than zero");
                    }
                    else {
                        base.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Unit cost grater than zero");
                    }
                    result = true;
                    return false;
                }
            }
        });
        return result;
    };
    InvoiceComponent.prototype.exportToPDF = function () {
        var _this = this;
        var imgString = jQuery('#company-img').clone().html();
        var html = jQuery('<div>').append(jQuery('style').clone()).append(jQuery('#payment-preview').clone()).html();
        if (imgString)
            html = html.replace(imgString, imgString.replace('>', '/>'));
        var pdfReq = {
            "version": "1.1",
            "genericReport": {
                "payload": html
            }
        };
        this.reportService.exportReportIntoFile(payments_constants_1.PAYMENTSPATHS.PDF_SERVICE, pdfReq)
            .subscribe(function (data) {
            var blob = new Blob([data._body], { type: "application/pdf" });
            var link = jQuery('<a></a>');
            link[0].href = URL.createObjectURL(blob);
            link[0].download = "Invoice.pdf";
            link[0].click();
        }, function (error) {
            _this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to Export report into PDF");
        });
    };
    InvoiceComponent.prototype.ngOnDestroy = function () {
        if (jQuery('#invoice-email-conformation'))
            jQuery('#invoice-email-conformation').remove();
        if (this.routeSubscribe) {
            this.routeSubscribe.unsubscribe();
        }
    };
    InvoiceComponent.prototype.deleteLineItem = function ($event, index, type) {
        $event && $event.stopImmediatePropagation();
        var itemsList = this.invoiceForm.controls[type];
        var itemControl = itemsList.controls[index];
        itemControl.controls['destroy'].patchValue(true);
        var base = this;
        setTimeout(function () {
            base.calculateTotals();
        });
    };
    InvoiceComponent.prototype.calculateTotals = function () {
        this.calcSubTotal();
        this.calTaxTotal();
    };
    return InvoiceComponent;
}());
InvoiceComponent = __decorate([
    core_1.Component({
        selector: 'invoice',
        templateUrl: '/app/views/invoice.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.Router, router_1.ActivatedRoute, LoadingService_1.LoadingService,
        Invoices_service_1.InvoicesService, Toast_service_1.ToastService, CodesService_service_1.CodesService, Companies_service_1.CompaniesService,
        Customers_service_1.CustomersService, Invoice_form_1.InvoiceForm, InvoiceLine_form_1.InvoiceLineForm, InvoiceLine_form_1.InvoiceLineTaxesForm,
        ChartOfAccounts_service_1.ChartOfAccountsService, PageTitle_1.pageTitleService, StateService_1.StateService, Reports_service_1.ReportService, SwitchBoard_1.SwitchBoard])
], InvoiceComponent);
exports.InvoiceComponent = InvoiceComponent;
