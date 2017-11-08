/**
 * Created by venkatkollikonda on 18/10/17.
 */
import {Component} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {NumeralService} from "qCommon/app/services/Numeral.service";
import {StateService} from "qCommon/app/services/StateService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {FileUploader, FileUploaderOptions} from "ng2-file-upload";
import {CollaborationService} from "../services/Collaboration.service";

declare const _: any;
declare const jQuery: any;
declare const moment: any;

@Component({
  selector: 'collaboration',
  templateUrl: '../views/Collaboration.html',
})

export class CollaborationComponent {
  companyId: string;
  user: any;
  routeSubscribe: any;
  logoURL: string;
  reconPeriod: string;
  dateFormat: string;
  serviceDateformat: string;
  filters: any = {'task': '#44B6E8', 'done': '#18457B', 'working': '#F06459', 'active': '#00B1A9', 'celebrating': '#22B473'};
  posts: any = [];
  newPost: any = {id: '', postedBy: '', message: '', entityType: 'expense', entityID: '4f96e2ba-dcda-498b-8cf3-03349c556c4d', badges: [], emoji: 'insert_emoticon', createdDate: '', updatedDate: ''};
  newComment: any = {id: '', postID: '', parentID: '', commentedBy: '', message: '', badges: [], emoji: 'insert_emoticon', createdDate: '', updatedDate: ''};
  badges: any = [{name: 'task', icon: 'grade', selected: false, color: '#44B6E8'}, {name: 'done', icon: 'check_circle', selected: false, color: '#18457B'}, {name: 'working', icon: 'watch_later', selected: false, color: '#F06459'}, {name: 'active', icon: 'alarm_add', selected: false, color: '#00B1A9'}, {name: 'celebrating', icon: 'insert_emoticon', selected: false, color: '#22B473'}];
  updateOptions = ['update', 'delete'];
  public uploader: FileUploader;
  postUploadResp: any;
  selectedCommentInput: string;
  generatedId: string;
  constructor(private toastService: ToastService, private _router: Router, private _route: ActivatedRoute,
              private loadingService: LoadingService, private companyService: CompaniesService, private numeralService: NumeralService,
              private stateService: StateService, private titleService: pageTitleService, _switchBoard: SwitchBoard,
              private dateFormater: DateFormater,  private collaborationService: CollaborationService) {
    this.titleService.setPageTitle("Collaboration Wall");
    this.companyId = Session.getCurrentCompany();
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
    this.user = Session.getUser();
    this.getPosts();
    this.uploader = new FileUploader(<FileUploaderOptions>{
      url: collaborationService.getDocumentServiceUrl(this.companyId),
      headers: [{
        name: 'Authorization',
        value: 'Bearer ' + Session.getToken()
      }]
    });
  }

  getCommentTime(date) {
    let startTime = moment.utc(date).toDate();
    startTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
    const duration = moment(startTime).fromNow();
    return moment(startTime).calendar(null, {
      sameDay: function (now) {
        if (this.isBefore(now)) {
          return '[' + duration + ']';
        } else {
          return moment(startTime).calendar();
        }
      },
      lastDay: function () {
        return '[Yesterday]';
      },
      lastWeek: 'MM/DD/YYYY',
      sameElse: 'MM/DD/YYYY'
    });
  }

  getPosts() {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.getPosts()
      .subscribe(response => {
        this.posts = response.posts;
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  updateBadges(badges) {
    for (const i in this.badges) {
      if (_.indexOf(badges, this.badges[i].name) !== -1) {
        this.badges[i].selected = true;
      } else {
        this.badges[i].selected = false;
      }
    }
  }

  createPost() {
    this.loadingService.triggerLoadingEvent(true);
    this.newPost.postedBy = Session.getUser().id;
    this.newPost.id = this.postUploadResp.sourceID;
    if (!_.isEmpty(this.postUploadResp)) {
      this.newPost["documentName"] = this.postUploadResp.name;
      this.newPost["documentID"] = this.postUploadResp.id;
    }else {
      this.newPost["documentName"] = '';
      this.newPost["documentID"] = '';
    }

    this.collaborationService.createPost(this.newPost)
      .subscribe(response => {
        this.getPosts();
        this.postUploadResp = {};
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  downloadDocument(id) {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.getDocument(id)
      .subscribe(response => {
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  getColor(type) {
    return this.filters[type];
  }

  getIcon(type) {
    if (type !== null) {
      return _.find(this.badges, {name: type}).icon;
    }
  }

  getRight(index) {
    return index * 5 + 'px';
  }

  generateId() {
    this.generatedId = this.guid();
  }

  getToggleId(id) {
    jQuery('#' + id).addClass('is-open');
  }

  onCommentEnter(event, id) {
    this.loadingService.triggerLoadingEvent(true);
    this.newComment.commentedBy = this.user.id;
    this.newComment.message = event.target.value;
    this.newComment.postID = id;
    this.newComment.id = this.guid();
    if (!_.isEmpty(this.postUploadResp)) {
      this.newComment["documentName"] = this.postUploadResp.name;
      this.newComment["documentID"] = this.postUploadResp.id;
    } else {
      this.newComment["documentName"] = null;
      this.newComment["documentID"] = null;
    }
    this.collaborationService.createComment(this.newComment)
      .subscribe(response => {
        //this.posts.push(response.posts);
        this.getPosts();
        this.postUploadResp = {};
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
    console.log(this.newComment);
  }

  onSubCommentEnter(event, id, parentId) {
    this.loadingService.triggerLoadingEvent(true);
    this.newComment.commentedBy = this.user.id;
    this.newComment.message = event.target.value;
    this.newComment.postID = id;
    this.newComment.parentID = parentId;
    this.newComment.id = this.guid();
    if (!_.isEmpty(this.postUploadResp)) {
      this.newComment["documentName"] = this.postUploadResp.name;
      this.newComment["documentID"] = this.postUploadResp.id;
    } else {
      this.newComment["documentName"] = null;
      this.newComment["documentID"] = null;
    }
    this.collaborationService.createComment(this.newComment)
      .subscribe(response => {
        //this.posts.push(response.posts);
        this.getPosts();
        this.postUploadResp = {};
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
    console.log(this.newComment);
  }

  showCommentInput(id) {
    this.selectedCommentInput = 'comment_' + id;
  }


  postSelectBadge(badge,targetObj) {
    if (typeof badge !== "string") {
      if (badge.selected) {
        targetObj.badges.push(badge.name);
      } else {
        targetObj.badges = _.without(targetObj.badges, badge.name);
      }
    }
  }

  s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  guid() {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
  }

  startUpload($event, id) {
    const base = this;
    if (id.length > 0) {
      this.generatedId = id;
    } else {
      this.generatedId = this.guid();
    }
    setTimeout(function(){
      base.uploader.uploadAll();
    }, 400);
  }

  ngOnInit () {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      const payload: any = {};
      payload.sourceID = this.generatedId;
      payload.sourceType = 'POST';
      form.append('payload', JSON.stringify(payload));
    };

    this.uploader.onCompleteItem = (item, response, status, header) => {
      if (status === 200) {
        this. postUploadResp = JSON.parse(response);
        this.uploader.progress = 100;
        this.uploader.queue.forEach(function(item){
          item.remove();
        });
        /* this.document = JSON.parse(response);
         this.billFileExist = true;
         this.compileLink();*/
        //Your code goes here
      }
    };
  };

  ngOnDestroy() {
  };

}
