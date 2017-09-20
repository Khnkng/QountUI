/**
 * Created by seshu on 29-07-2016.
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
var Workflow_service_1 = require("../services/Workflow.service");
var Companies_service_1 = require("qCommon/app/services/Companies.service");
var Session_1 = require("qCommon/app/services/Session");
var CompanyUsers_service_1 = require("qCommon/app/services/CompanyUsers.service");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var WorkflowComponent = (function () {
    function WorkflowComponent(workflowService, titleService, companyService, usersService, loadingService) {
        var _this = this;
        this.workflowService = workflowService;
        this.titleService = titleService;
        this.companyService = companyService;
        this.usersService = usersService;
        this.loadingService = loadingService;
        this.entryUsers = [];
        this.checkList = ['Delivered or Serviced', 'Check Terms', 'Check 1099'];
        this.rankCheckList = [];
        this.approveUsers = [];
        this.approveFlowSteps = [];
        this.editApproveFlowTitle = null;
        this.payeeUsers = [];
        this.companies = [];
        this.approverUsersList = [];
        this.isOwner = false;
        this.entryUsers1 = [];
        this.payeeUsers1 = [];
        this.titleService.setPageTitle("WORKFLOW MANAGEMENT");
        this.loadingService.triggerLoadingEvent(true);
        this.companyService.companies()
            .subscribe(function (companies) {
            _this.companies = companies;
            if (_this.companies && _this.companies.length > 0) {
                var companyObj = _.find(_this.companies, ['id', Session_1.Session.getCurrentCompany()]);
                _this.companyName = companyObj.id;
                _this.isOwner = companyObj.roles.indexOf('Owner') != -1 || companyObj.roles.indexOf('Account Manager') != -1;
                _this.loadWorkFlow(companyObj.id);
                _this.loadApproveUsers(companyObj.id);
            }
        }, function (error) { return _this.handleError(error); });
    }
    WorkflowComponent.prototype.ngOnInit = function () {
        return undefined;
    };
    WorkflowComponent.prototype.loadApproveUsers = function (companyId) {
        var _this = this;
        this.usersService.users(companyId).subscribe(function (users) {
            if (users) {
                var approvers = _.filter(users, _.matches({ roleID: "Payment Approver" }));
                var enter = _.filter(users, _.matches({ roleID: "Payment Entry" }));
                var pay = _.filter(users, _.matches({ roleID: "Payer" }));
                var owner = _.filter(users, _.matches({ roleID: "Owner" }));
                var accountManager = _.filter(users, _.matches({ roleID: "Owner" }));
                if (owner.length > 0) {
                    approvers = _.concat(approvers, owner);
                    enter = _.concat(enter, owner);
                    pay = _.concat(pay, owner);
                }
                if (accountManager.length > 0) {
                    approvers = _.concat(approvers, accountManager);
                    enter = _.concat(enter, accountManager);
                    pay = _.concat(pay, accountManager);
                }
                if (approvers) {
                    _this.approverUsersList = _.map(_.map(_.uniqBy(approvers, function (e) { return e.email; }), 'email'));
                }
                if (enter) {
                    _this.entryUsers1 = _.map(_.map(_.uniqBy(enter, function (e) { return e.email; }), 'email'));
                }
                if (pay) {
                    _this.payeeUsers1 = _.map(_.map(_.uniqBy(pay, function (e) { return e.email; }), 'email'));
                }
            }
        }, function (error) { return _this.handleError(error); });
    };
    WorkflowComponent.prototype.addEntryUser = function ($event) {
        var user = $event;
        if (this.validateEmail(user)) {
            _.remove(this.entryUsers, function (usr) {
                return usr == user;
            });
            this.entryUsers.push(user);
        }
    };
    WorkflowComponent.prototype.removeEntryUser = function (index) {
        this.entryUsers.splice(index, 1);
    };
    WorkflowComponent.prototype.addPayeeUser = function ($event) {
        var user = $event;
        if (this.validateEmail(user)) {
            _.remove(this.payeeUsers, function (usr) {
                return usr == user;
            });
            this.payeeUsers.push(user);
        }
    };
    WorkflowComponent.prototype.removePayeeUser = function (index) {
        this.payeeUsers.splice(index, 1);
    };
    WorkflowComponent.prototype.addApproveUser = function ($event) {
        var user = $event;
        if (this.validateEmail(user)) {
            _.remove(this.approveUsers, function (usr) {
                return usr == user;
            });
            this.approveUsers.push(user);
        }
        return false;
    };
    WorkflowComponent.prototype.removeApproveUser = function (index) {
        this.approveUsers.splice(index, 1);
    };
    WorkflowComponent.prototype.addCheckListItem = function ($event) {
        _.remove(this.rankCheckList, function (chklstitem) {
            return chklstitem == $event;
        });
        this.rankCheckList.push($event);
    };
    WorkflowComponent.prototype.addToApproveFlowSteps = function () {
        var approveFlowStep = {};
        approveFlowStep.rank = this.approveFlowSteps.length + 1;
        approveFlowStep.name = this.approveFlowName;
        approveFlowStep.emails = this.approveUsers;
        approveFlowStep.checkList = this.rankCheckList;
        this.approveFlowSteps.push(approveFlowStep);
        this.approveUsers = [];
        this.rankCheckList = [];
        this.approveFlowName = null;
    };
    WorkflowComponent.prototype.removeCheckListItem = function (index) {
        this.rankCheckList.splice(index, 1);
    };
    WorkflowComponent.prototype.editApproveFlow = function (flow) {
        this.approveUsers = _.clone(flow.emails);
        this.rankCheckList = _.clone(flow.checkList);
        this.editApproveFlowTitle = "Edit workflow for rank" + flow.rank;
        this.approveFlowName = flow.name;
        this.editedFlowRank = flow.rank;
    };
    WorkflowComponent.prototype.syncEdittedApproveFlow = function () {
        var approveFlowStep = {};
        approveFlowStep.rank = this.editedFlowRank;
        approveFlowStep.name = this.approveFlowName;
        approveFlowStep.emails = this.approveUsers;
        approveFlowStep.checkList = this.rankCheckList;
        this.approveFlowSteps[this.editedFlowRank - 1] = approveFlowStep;
        this.approveUsers = [];
        this.rankCheckList = [];
        this.editedFlowRank = null;
        this.approveFlowName = null;
    };
    WorkflowComponent.prototype.cancelEditApproveFlow = function () {
        this.approveUsers = [];
        this.rankCheckList = [];
        this.editedFlowRank = null;
    };
    WorkflowComponent.prototype.removeApproveFlow = function (flow) {
        this.approveFlowSteps.splice(flow.rank - 1, 1);
        this.approveFlowSteps.forEach(function (flow, index) {
            flow.rank = index + 1;
        });
    };
    WorkflowComponent.prototype.saveWorkflow = function () {
        var _this = this;
        var base = this;
        var workflow = {};
        workflow.Enter = [{
                name: 'Enter',
                emails: base.entryUsers,
                rank: 1
            }];
        workflow.Approve = this.approveFlowSteps;
        workflow.Pay = [{
                name: 'Pay',
                emails: base.payeeUsers,
                rank: 1
            }];
        this.loadingService.triggerLoadingEvent(true);
        this.workflowService.createWorkflow(workflow, this.companyName)
            .subscribe(function (success) { return _this.showMessage(true, success); }, function (error) { return _this.showMessage(false, error); });
    };
    WorkflowComponent.prototype.loadWorkFlow = function (companyId) {
        var _this = this;
        this.workflowService.workflow(companyId)
            .subscribe(function (workflow) {
            _this.approveFlowSteps = workflow.Approve ? workflow.Approve : [];
            _this.entryUsers = workflow.Enter ? workflow.Enter[0].emails : [];
            _this.payeeUsers = workflow.Pay ? workflow.Pay[0].emails : [];
            _this.loadingService.triggerLoadingEvent(false);
        }, function (error) { return _this.handleError(error); });
        var company = _.find(this.companies, function (_company) {
            return _company.id == companyId;
        });
        this.isOwner = company.roles.indexOf('Owner') != -1 || company.roles.indexOf('Account Manager') != -1;
        /*this.companyUsers = company.invitedUserEmails;
        let currentUserId = Session.getUser().id;
        if(this.companyUsers.indexOf(currentUserId) == -1){
          this.companyUsers.push(currentUserId);
        }*/
    };
    WorkflowComponent.prototype.showMessage = function (status, obj) {
        if (status) {
            this.status = {};
            this.status['success'] = true;
            this.message = "Workflow created successfully";
            this.entryUsers = [];
            this.payeeUsers = [];
            this.loadWorkFlow(Session_1.Session.getCurrentCompany());
            //this.companyName = null;
        }
        else {
            this.loadingService.triggerLoadingEvent(false);
            this.status = {};
            this.status['error'] = true;
            this.message = obj;
        }
    };
    WorkflowComponent.prototype.handleError = function (error) {
        this.loadingService.triggerLoadingEvent(false);
    };
    WorkflowComponent.prototype.validateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };
    return WorkflowComponent;
}());
WorkflowComponent = __decorate([
    core_1.Component({
        selector: 'workflow',
        templateUrl: '/app/views/workflow.html'
    }),
    __metadata("design:paramtypes", [Workflow_service_1.WorkflowService, PageTitle_1.pageTitleService, Companies_service_1.CompaniesService, CompanyUsers_service_1.CompanyUsers, LoadingService_1.LoadingService])
], WorkflowComponent);
exports.WorkflowComponent = WorkflowComponent;
