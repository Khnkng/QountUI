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
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Date_constants_1 = require("qCommon/app/constants/Date.constants");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Reports_service_1 = require("../services/Reports.service");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var ReportsSearchCriteriaComponent = (function () {
    function ReportsSearchCriteriaComponent(companyService, switchBoard, reportService, _router, toastService, loadingService) {
        var _this = this;
        this.companyService = companyService;
        this.switchBoard = switchBoard;
        this.reportService = reportService;
        this._router = _router;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.report = {};
        this.appName = "billpay";
        this.customizationObj = {
            "customizations": {}
        };
        this.companies = [];
        this.fields = [];
        this.allCompanies = [];
        this.expandedPanelCSS = {
            width: '0px'
        };
        this.isExpanded = false;
        this.vendors = [];
        this.rightArrowClass = "ion-arrow-right-b";
        this.downArrowClass = "ion-arrow-down-b";
        this.customPanel = {
            "General": true,
            "Aging": false,
            "Filters": false,
            "HeaderFooter": false
        };
        this.reportName = "New Report";
        this.reportDesc = "Sample Description";
        this.quarters = [];
        this.reportFields = {
            aging: ["reportPeriod", "company", "daysPerAgingPeriod", "numberOfPeriods"],
            agingDetail: ["reportPeriod", "company", "daysPerAgingPeriod", "numberOfPeriods"],
            paymentHistory: ["reportPeriod", "company", "startDate", "endDate"],
            vendorSummary: ["reportPeriod", "company", "startDate", "endDate"],
            vendorBalance: ["reportPeriod", "company", "startDate", "endDate"],
            vendorExpenses: ["reportPeriod", "company", "startDate", "endDate"],
            gainloss: ["reportPeriod", "company", "startDate", "endDate"],
            paymentRegister: ["reportPeriod", "company", "startDate", "endDate"],
            tb: ["asOfDate", "basis"],
            balanceSheet: ["asOfDate", "basis"],
            detailedBalanceSheet: ["asOfDate", "basis"],
            incomeStatement: ["reportPeriod", "startDate", "endDate", "basis"],
            cashFlowStatement: ["reportPeriod", "startDate", "endDate", "basis"],
            incomeDetailStatement: ["reportPeriod", "startDate", "endDate", "basis"]
        };
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.companies()
            .subscribe(function (companies) {
            _this.allCompanies = companies ? companies : [];
            _this.companies = companies ? _.map(companies, 'name') : [];
            _this.switchBoard.onFetchCompanies.next(companies);
            if (_this.companies.length > 0) {
                var companyObj = _.find(_this.allCompanies, ['id', Session_1.Session.getCurrentCompany()]);
                _this.report.companyID = companyObj.id;
                _this.report.companyCurrency = companyObj.defaultCurrency;
                _this.changeCompany(companyObj.id);
            }
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
        var today = moment();
        var fiscalStartDate = moment(Session_1.Session.getFiscalStartDate(), 'MM/DD/YYYY');
        this.currentFiscalStart = moment([today.get('year'), fiscalStartDate.get('month'), 1]);
        if (today < fiscalStartDate) {
            this.currentFiscalStart = moment([today.get('year') - 1, fiscalStartDate.get('month'), 1]);
        }
        this.quarters = this.getQuarters(this.currentFiscalStart);
        this.currentQuarter = this.getCurrentQuarter(this.quarters, today);
        this.customizationObj.filters = [{
                "filterName": "vendorID",
                "operator": "=",
                "values": []
            }];
    }
    Object.defineProperty(ReportsSearchCriteriaComponent.prototype, "setReportType", {
        set: function (reportType) {
            this.reportType = reportType;
            this.report.type = this.reportType;
            this.fields = this.reportFields[this.reportType];
            if (this.reportType == 'aging' || this.reportType == 'agingDetail') {
                this.periods = Date_constants_1.PERIODS.toDatePeriods;
            }
            else if (this.reportType == 'paymentHistory' || this.reportType == 'vendorSummary' || this.reportType == 'vendorExpenses'
                || this.reportType == 'vendorBalance' || this.reportType == 'gainloss' || this.reportType == 'paymentRegister' || this.reportType == 'incomeStatement'
                || this.reportType == 'incomeDetailStatement' || this.reportType == 'cashFlowStatement') {
                this.periods = Date_constants_1.PERIODS.billPaymentHistoryPeriods;
            }
            this.report.basis = 'accrual';
        },
        enumerable: true,
        configurable: true
    });
    ReportsSearchCriteriaComponent.prototype.setDate = function (val, targetObj) {
        if (this.reportType == 'paymentHistory' || this.reportType == 'vendorSummary' || this.reportType == 'vendorExpenses'
            || this.reportType == 'vendorBalance' || this.reportType == 'gainloss' || this.reportType == 'paymentRegister' || this.reportType == 'incomeStatement'
            || this.reportType == 'incomeDetailStatement' || this.reportType == 'cashFlowStatement') {
            this.setDates(val, targetObj);
        }
        else {
            this.calculateAsofDate(val, targetObj);
        }
    };
    ReportsSearchCriteriaComponent.prototype.changeCompany = function (company) {
        var _this = this;
        this.companyService.vendors(company).subscribe(function (vendors) {
            _this.vendors = vendors;
        }, function (error) {
        });
        this.reportService.getCustomizationObj(this.appName, company, this.reportType).subscribe(function (customObj) {
            _this.loadingService.triggerLoadingEvent(false);
            customObj.customizations = customObj.customizations || {};
            _this.customizationObj = customObj;
            if (!customObj.filters.length) {
                _this.customizationObj.filters = [{
                        "filterName": "vendorID",
                        "operator": "=",
                        "values": []
                    }];
            }
            _this.report.companyCurrency = _.find(_this.allCompanies, function (o) { return o.id == company; }).defaultCurrency;
            if (_this.reportType == 'incomeStatement' || _this.reportType == 'incomeDetailStatement' || _this.reportType == 'cashFlowStatement') {
                _this.setDates(_this.customizationObj.customizations.period, _this.report);
                _this.setDates(_this.customizationObj.customizations.period, _this.customizationObj.customizations);
            }
            else {
                _this.calculateAsofDate(_this.customizationObj.customizations.period, _this.report);
                _this.calculateAsofDate(_this.customizationObj.customizations.period, _this.customizationObj.customizations);
            }
            _this.report.period = _this.customizationObj.customizations.period;
            _this.report.endDate = _this.customizationObj.customizations.endDate;
            _this.report.startDate = _this.customizationObj.customizations.startDate;
            _this.report.daysPerAgingPeriod = _this.customizationObj.customizations.daysPerAgingPeriod;
            _this.report.numberOfPeriods = _this.customizationObj.customizations.numberOfPeriods;
            _this.report.breakdown = _this.customizationObj.customizations.breakdown;
            if (Session_1.Session.getReportCriteria(_this.reportType)) {
                _this.generateReport(Session_1.Session.getReportCriteria(_this.reportType));
            }
        }, function (error) {
            _this.loadingService.triggerLoadingEvent(false);
        });
    };
    ReportsSearchCriteriaComponent.prototype.calculateAsofDate = function (val, targetObj) {
        if (val && (val == 'Today' || val.indexOf('-to-date') != -1))
            targetObj.asOfDate = moment(new Date()).format("MM/DD/YYYY");
        else if (val) {
            switch (val) {
                case 'This Month':
                    targetObj.asOfDate = moment().endOf('month').format("MM/DD/YYYY");
                    break;
                case 'This Quarter':
                    targetObj.asOfDate = this.quarters[this.currentQuarter].endDate.format('MM/DD/YYYY');
                    break;
                case 'This Year':
                    targetObj.asOfDate = this.currentFiscalStart.add(1, 'year').subtract(1, 'day').format("MM/DD/YYYY");
                    break;
                case 'This Week':
                    targetObj.asOfDate = moment().endOf('isoWeek').format("MM/DD/YYYY");
                    break;
                case 'Yesterday':
                    targetObj.asOfDate = moment().subtract(1, 'days').format("MM/DD/YYYY");
                    break;
                case 'Last Week':
                    targetObj.asOfDate = moment().subtract(7, 'days').endOf('isoWeek').format("MM/DD/YYYY");
                    break;
                case 'Last Month':
                    targetObj.asOfDate = moment().subtract(1, 'months').endOf('month').format("MM/DD/YYYY");
                    break;
                case 'Last Quarter':
                    targetObj.asOfDate = this.quarters[this.currentQuarter - 1].endDate.format("MM/DD/YYYY");
                    break;
            }
        }
    };
    ReportsSearchCriteriaComponent.prototype.setDates = function (val, targetObj) {
        if (val) {
            switch (val) {
                case "This Month":
                    targetObj.asOfDate = moment().startOf('month').format("MM/DD/YYYY");
                    targetObj.endDate = moment().endOf('month').format("MM/DD/YYYY");
                    break;
                case "This Quarter":
                    targetObj.asOfDate = this.quarters[this.currentQuarter].startDate.format("MM/DD/YYYY");
                    targetObj.endDate = this.quarters[this.currentQuarter].endDate.format("MM/DD/YYYY");
                    break;
                case "This Year":
                    targetObj.asOfDate = this.currentFiscalStart.format("MM/DD/YYYY");
                    targetObj.endDate = this.currentFiscalStart.add(1, 'year').subtract(1, 'day').format("MM/DD/YYYY");
                    break;
                case "Last Month":
                    targetObj.asOfDate = moment().subtract(1, 'months').startOf('month').format("MM/DD/YYYY");
                    targetObj.endDate = moment().subtract(1, 'months').endOf('month').format("MM/DD/YYYY");
                    break;
                case "Last Quarter":
                    targetObj.asOfDate = this.quarters[this.currentQuarter - 1].startDate.format("MM/DD/YYYY");
                    targetObj.endDate = this.quarters[this.currentQuarter - 1].endDate.format("MM/DD/YYYY");
                    break;
            }
        }
    };
    ReportsSearchCriteriaComponent.prototype.getCurrentQuarter = function (quarters, today) {
        for (var i = 0; i < quarters.length; i++) {
            if (today >= quarters[i].startDate && today <= quarters[i].endDate) {
                return i;
            }
        }
    };
    ReportsSearchCriteriaComponent.prototype.getQuarters = function (startDate) {
        var result = [];
        var today = moment();
        for (var i = -1; i <= 3; i++) {
            var sd = _.cloneDeep(startDate).add(i, 'quarter');
            var ed = _.cloneDeep(startDate).add(i + 1, 'quarter').subtract(1, 'day');
            result.push({
                'startDate': sd,
                'endDate': ed
            });
        }
        return result;
    };
    ReportsSearchCriteriaComponent.prototype.setStartDate = function (val, targetObj) {
        targetObj.startDate = val;
    };
    ReportsSearchCriteriaComponent.prototype.setAsOfDate = function (val, targetObj) {
        targetObj.asOfDate = val;
    };
    ReportsSearchCriteriaComponent.prototype.setCustomEndDate = function (val, targetObj) {
        targetObj.endDate = val;
    };
    ReportsSearchCriteriaComponent.prototype.generateReport = function (criteria) {
        this.companyId = Session_1.Session.getCurrentCompany();
        var data = {
            "report": criteria ? _.cloneDeep(criteria) : _.cloneDeep(this.report),
            "customizationObj": _.cloneDeep(this.customizationObj)
        };
        this.switchBoard.onSubmitReport.next(data);
    };
    ReportsSearchCriteriaComponent.prototype.hideCustomizeFieldPanel = function () {
        this.isExpanded = false;
        this.customizePanelCSS = "collapsed";
    };
    ReportsSearchCriteriaComponent.prototype.showCustomizeFieldPanel = function () {
        this.isExpanded = true;
        this.customizePanelCSS = "expanded";
    };
    ReportsSearchCriteriaComponent.prototype.setNegativeNumberFormat = function (value) {
        this.customizationObj.customizations.negativeNumberFormat = value;
    };
    ReportsSearchCriteriaComponent.prototype.updateCheckedVendors = function (vendor, $event) {
        if ($event.target.checked) {
            this.customizationObj.filters[0].values.push(vendor);
        }
        else {
            this.customizationObj.filters[0].values.splice(this.customizationObj.filters[0].values.indexOf(vendor), 1);
        }
    };
    ReportsSearchCriteriaComponent.prototype.setHeaderAlignment = function (value) {
        this.customizationObj.customizations.headerAlignment = value;
    };
    ReportsSearchCriteriaComponent.prototype.setFooterAlignment = function (value) {
        this.customizationObj.customizations.footerAlignment = value;
    };
    ReportsSearchCriteriaComponent.prototype.saveFilterValues = function (filter) {
        var _this = this;
        if (filter.filters[0].values.length) {
            var base_1 = this;
            filter.app = this.appName;
            filter.reportType = this.reportType;
            var selectedCompany = _.find(this.allCompanies, function (company) {
                return company.id == base_1.report.companyID;
            });
            filter.companyID = selectedCompany.id;
            this.reportService.saveCustomizationObj(filter).subscribe(function (response) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Customization saved successfully");
                _this.customizationObj = filter;
                _this.hideCustomizeFieldPanel();
            }, function (error) {
            });
        }
        else {
            filter.filters = null;
            var base_2 = this;
            filter.app = this.appName;
            filter.reportType = this.reportType;
            var selectedCompany = _.find(this.allCompanies, function (company) {
                return company.id == base_2.report.companyID;
            });
            filter.companyID = selectedCompany.id;
            this.reportService.saveCustomizationObj(filter).subscribe(function (response) {
                _this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Customization saved successfully");
                _this.customizationObj = filter;
                _this.hideCustomizeFieldPanel();
            }, function (error) {
            });
        }
    };
    ReportsSearchCriteriaComponent.prototype.getIconClass = function (category) {
        if (this.customPanel[category]) {
            return this.downArrowClass;
        }
        else {
            return this.rightArrowClass;
        }
    };
    ReportsSearchCriteriaComponent.prototype.toggleCategory = function (category) {
        this.customPanel[category] = !this.customPanel[category];
    };
    ReportsSearchCriteriaComponent.prototype.ngOnInit = function () {
    };
    ReportsSearchCriteriaComponent.prototype.backToReportsPage = function () {
        this._router.navigate(['Reports']);
    };
    return ReportsSearchCriteriaComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], ReportsSearchCriteriaComponent.prototype, "hideReportForm", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ReportsSearchCriteriaComponent.prototype, "reportName", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ReportsSearchCriteriaComponent.prototype, "reportDesc", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], ReportsSearchCriteriaComponent.prototype, "setReportType", null);
ReportsSearchCriteriaComponent = __decorate([
    core_1.Component({
        selector: 'report-search-criteria',
        templateUrl: '/app/views/reportSearchCriteria.html'
    }),
    __metadata("design:paramtypes", [Companies_service_1.CompaniesService, SwitchBoard_1.SwitchBoard,
        Reports_service_1.ReportService, router_1.Router,
        Toast_service_1.ToastService, LoadingService_1.LoadingService])
], ReportsSearchCriteriaComponent);
exports.ReportsSearchCriteriaComponent = ReportsSearchCriteriaComponent;
