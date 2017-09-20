/**
 * Created by seshagirivellanki on 19/04/17.
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
var router_1 = require("@angular/router");
var Session_1 = require("qCommon/app/services/Session");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Documents_service_1 = require("../services/Documents.service");
var DocumentComponent = (function () {
    function DocumentComponent(_router, _route, toastService, switchBoard, loadingService, companiesService, documentsService) {
        var _this = this;
        this._router = _router;
        this._route = _route;
        this.toastService = toastService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.companiesService = companiesService;
        this.documentsService = documentsService;
        this.doc = {};
        this.categories = [];
        this.allCategories = {
            "Expense": [{ value: "auto", "name": "Auto" },
                { value: "entertainment", "name": "Entertainment" },
                { value: "shippingAndFreight", "name": "Shipping and Freight" },
                { value: "travel", "name": "Travel" },
                { value: "travelMeals", "name": "Travel Meals" },
                { value: "supplies", "name": "Supplies" },
                { value: "utilities", "name": "Utilities" },
                { value: "officeG&AExpenses", "name": "Office G&A Expenses" }
            ],
            "Bill": [],
            "Refund": [],
            "Other": []
        };
        this.companyId = Session_1.Session.getCurrentCompany();
        this.routeSub = this._route.params.subscribe(function (params) {
            _this.companyCurrency = Session_1.Session.getCurrentCompanyCurrency();
            _this.documentId = params['documentId'];
            _this.type = params['type'];
            _this.loadingService.triggerLoadingEvent(true);
            _this.documentsService.getDocumentById(_this.documentId, "unused" + _this.type, _this.type)
                .subscribe(function (doc) {
                _this.loadingService.triggerLoadingEvent(false);
                _this.doc = doc;
            }, function (error) {
                _this.loadingService.triggerLoadingEvent(false);
            });
        });
    }
    DocumentComponent.prototype.routeToToolsPage = function () {
        var link = [Session_1.Session.getLastVisitedUrl()];
        this._router.navigate(link);
    };
    DocumentComponent.prototype.updateCategories = function (mapTo) {
        this.categories = mapTo ? this.allCategories[mapTo] : [];
    };
    DocumentComponent.prototype.updateDocument = function () {
        var _this = this;
        this.loadingService.triggerLoadingEvent(true);
        this.documentsService.updateDocument(this.companyId, this.doc)
            .subscribe(function (response) {
            _this.loadingService.triggerLoadingEvent(false);
            _this._router.navigate([Session_1.Session.getLastVisitedUrl()]);
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
            console.log(error);
        });
    };
    DocumentComponent.prototype.setDate = function (date) {
        this.doc.date = date;
    };
    return DocumentComponent;
}());
DocumentComponent = __decorate([
    core_1.Component({
        selector: 'employees',
        templateUrl: '/app/views/document.html'
    }),
    __metadata("design:paramtypes", [router_1.Router, router_1.ActivatedRoute,
        Toast_service_1.ToastService, SwitchBoard_1.SwitchBoard,
        LoadingService_1.LoadingService, Companies_service_1.CompaniesService,
        Documents_service_1.DocumentService])
], DocumentComponent);
exports.DocumentComponent = DocumentComponent;
