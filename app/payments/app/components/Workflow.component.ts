/**
 * Created by seshu on 29-07-2016.
 */

import {OnInit, Component} from "@angular/core";
import {FoundationInit} from "qCommon/app/directives/foundation.directive";
import {ComboBox} from "qCommon/app/directives/comboBox.directive";
import {WorkflowService} from "../services/Workflow.service";
import {CompanyModel} from "qCommon/app/models/Company.model";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {Session} from "qCommon/app/services/Session";

declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'workflow',
  templateUrl: '/app/views/workflow.html'
})

export class WorkflowComponent implements OnInit {
  entryUsers:Array<string> = [];
  entryUser:string;
  checkList:Array<string> =['checkList1','checkList2','checkList3','checkList4'];
  rankCheckList:Array<string> = [];
  approveUsers:Array<string> = [];
  approveUser:string;
  approveFlowSteps:Array<any> = [];
  editApproveFlowTitle:string = null;
  edittedFlowRank:number;
  payeeUsers:Array<string> = [];
  payeeUser:string;
  approveFlowName:string;
  status:any;
  message:string;
  companyName:string;
  companies:Array<CompanyModel> = [];
  companyUsers:Array<string> = [];
  isOwner:boolean = false;

  constructor(private workflowService:WorkflowService, private companyService:CompaniesService) {
    this.companyService.companies()
      .subscribe(companies  => {
        this.companies = companies;
        if(this.companies && this.companies.length > 0) {
          this.companyName = this.companies[0].id;
          this.isOwner = this.companies[0].roles.indexOf('owner') != -1;
          this.loadWorkFlow(this.companies[0].id);
        }
      }, error =>  this.handleError(error));
  }


  ngOnInit():any {
    return undefined;
  }

  addEntryUser($event) {
    let user = $event;
    if(this.validateEmail(user)) {
      _.remove(this.entryUsers, function (usr) {
        return usr == user;
      });
      this.entryUsers.push(user);
    }
  }

  removeEntryUser(index) {
    this.entryUsers.splice(index, 1);
  }

  addPayeeUser($event) {
    let user = $event;
    if(this.validateEmail(user)) {
      _.remove(this.payeeUsers, function (usr) {
        return usr == user;
      });
      this.payeeUsers.push(user);
    }
  }

  removePayeeUser(index) {
    this.payeeUsers.splice(index, 1);
  }

  addApproveUser($event) {
    let user = $event;
    if(this.validateEmail(user)) {
      _.remove(this.approveUsers, function (usr) {
        return usr == user;
      });
      this.approveUsers.push(user);
    }
    return false;
  }

  removeApproveUser(index) {
    this.approveUsers.splice(index, 1);
  }

  addCheckListItem($event) {
    _.remove(this.rankCheckList, function (chklstitem) {
      return chklstitem == $event;
    });
    this.rankCheckList.push($event);
  }

  addToApproveFlowSteps() {
    let approveFlowStep:any = {};
    approveFlowStep.rank = this.approveFlowSteps.length + 1;
    approveFlowStep.name = this.approveFlowName;
    approveFlowStep.emails = this.approveUsers;
    approveFlowStep.checkList = this.rankCheckList;
    this.approveFlowSteps.push(approveFlowStep);
    this.approveUsers = [];
    this.rankCheckList = [];
    this.approveFlowName = null;
  }

  removeCheckListItem(index) {
    this.rankCheckList.splice(index, 1);
  }

  editApproveFlow(flow:any) {
    this.approveUsers = _.clone(flow.emails);
    this.rankCheckList = _.clone(flow.checkList);
    this.editApproveFlowTitle = "Edit workflow for rank" + flow.rank;
    this.approveFlowName = flow.name;
    this.edittedFlowRank = flow.rank;
  }

  syncEdittedApproveFlow() {
    let approveFlowStep:any = {};
    approveFlowStep.rank = this.edittedFlowRank;
    approveFlowStep.name = this.approveFlowName;
    approveFlowStep.emails = this.approveUsers;
    approveFlowStep.checkList = this.rankCheckList;
    this.approveFlowSteps[this.edittedFlowRank-1] = approveFlowStep;
    this.approveUsers = [];
    this.rankCheckList = [];
    this.edittedFlowRank = null;
    this.approveFlowName = null;
  }

  cancelEditApproveFlow() {
    this.approveUsers = [];
    this.rankCheckList = [];
    this.edittedFlowRank = null;
  }

  removeApproveFlow(flow:any) {
    this.approveFlowSteps.splice(flow.rank-1, 1);
    this.approveFlowSteps.forEach(function(flow, index){
      flow.rank = index+1;
    })
  }

  saveWorkflow() {
    let base = this;
    let workflow:any = {};
    workflow.entry = [{
      name: 'entry',
      emails: base.entryUsers,
      rank: 1
    }];

    workflow.approve = this.approveFlowSteps;

    workflow.payee = [{
      name : 'payee',
      emails: base.payeeUsers,
      rank: 1
    }];

    this.workflowService.createWorkflow(workflow, this.companyName)
      .subscribe(success  => this.showMessage(true, success), error =>  this.showMessage(false, error));
  }

  loadWorkFlow(companyId:string) {
    this.workflowService.workflow(companyId)
      .subscribe(workflow  => {
        this.approveFlowSteps = workflow.approve ? workflow.approve : [];
        this.entryUsers = workflow.entry ? workflow.entry[0].emails : [];
        this.payeeUsers = workflow.payee ? workflow.payee[0].emails : [];
      }, error =>  this.handleError(error));
    let company:CompanyModel = _.find(this.companies, function(_company:CompanyModel) {
      return _company.id == companyId;
    });
    this.isOwner = company.roles.indexOf('owner') != -1;
    this.companyUsers = company.invitedUserEmails;
    let currentUserId = Session.getUser().id;
    if(this.companyUsers.indexOf(currentUserId) == -1){
      this.companyUsers.push(currentUserId);
    }
  }

  showMessage(status, obj) {
    if(status) {
      this.status = {};
      this.status['success'] = true;
      this.message = "Workflow created successfully";
      this.entryUsers = [];
      this.payeeUsers = [];
      this.companyName = null;
    } else {
      this.status = {};
      this.status['error'] = true;
      this.message = obj;
    }
  }

  handleError(error) {

  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

}
