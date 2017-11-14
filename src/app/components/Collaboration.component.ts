/**
 * Created by venkatkollikonda on 18/10/17.
 */
import {Component} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {Router, ActivatedRoute} from "@angular/router";
import {ToastService} from "qCommon/app/services/Toast.service";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {DateFormater} from "qCommon/app/services/DateFormatter.service";
import {FileUploader, FileUploaderOptions} from "ng2-file-upload";
import {CollaborationService} from "../services/Collaboration.service";
import { ScrollEvent } from 'ngx-scroll-event';

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
  routeSub: any;
  entityId: string;
  entityType: string;
  dateFormat: string;
  serviceDateformat: string;
  filters: any = {'task': '#4ab9e8', 'done': '#1CB3AB', 'working': '#FDB844', 'active': '#CD0814', 'celebrating': '#ef655d'};
  posts: any = [];
  metaData: string;
  newPost: any = {id: '', postedBy: '', message: '', badges: [], emoji: 'insert_emoticon', createdDate: '', updatedDate: ''};
  newComment: any = {id: '', postID: '', parentID: '', commentedBy: '', message: '', badges: [], emoji: 'insert_emoticon', createdDate: '', updatedDate: ''};
  badges: any = [
    {name: 'task', icon: 'grade', selected: false, color: '#4ab9e8'},
    {name: 'done', icon: 'check_circle', selected: false, color: '#1CB3AB'},
    {name: 'working', icon: 'watch_later', selected: false, color: '#FDB844'},
    {name: 'active', icon: 'alarm_add', selected: false, color: '#CD0814'},
    {name: 'celebrating', icon: 'insert_emoticon', selected: false, color: '#ef655d'}
  ];
  updateOptions = ['update', 'delete'];
  public uploader: FileUploader;
  postUploadResp: any;
  selectedCommentInput: string;
  generatedId: string;
  isNewPostAttachment = false;
  postIndex = 0 ;

  constructor(private toastService: ToastService, private _router: Router, private _route: ActivatedRoute,
              private loadingService: LoadingService, private titleService: pageTitleService,
              private dateFormater: DateFormater,  private collaborationService: CollaborationService) {
    this.titleService.setPageTitle("Wall");
    this.companyId = Session.getCurrentCompany();
    this.dateFormat = dateFormater.getFormat();
    this.serviceDateformat = dateFormater.getServiceDateformat();
    this.user = Session.getUser();
    this.routeSub = this._route.params.subscribe(params => {
      this.entityId = params['entityId'];
      this.entityType = params['entityType'];
      if (this.entityId) {
        this.getEntityPosts();
      } else {
        this.getPosts();
      }
      this.loadingService.triggerLoadingEvent(true);
    });

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
    this.collaborationService.getPosts(this.postIndex)
      .subscribe(response => {
        //this.posts = response.posts;
        this.posts = _.concat(this.posts, response.posts);
        this.postIndex = this.postIndex + 10;
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  getEntityPosts() {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.getEntityPosts(this.entityId, this.entityType, this.postIndex)
      .subscribe(response => {
        this.posts = _.concat(this.posts, response.posts);
        //this.posts = response.posts;
        this.postIndex = this.postIndex + 10;
        this.metaData = response.metadata;
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
    this.newPost.entityID = this.entityId || 'Default';
    this.newPost.entityType = this.entityType || 'Default';
    if (!_.isEmpty(this.postUploadResp)) {
      this.newPost["documentName"] = this.postUploadResp.name;
      this.newPost["documentID"] = this.postUploadResp.id;
      this.newPost.id = this.postUploadResp.sourceID;
    }else {
      /*this.newPost["documentName"] = '';
       this.newPost["documentID"] = '';*/
      this.newPost.id = this.guid();
    }

    this.collaborationService.createPost(this.newPost)
      .subscribe(response => {
        if (this.entityId) {
          this.getEntityPosts();
        } else {
          this.getPosts();
        }
        this.postUploadResp = {};
        this.resetPostObj();
        this.generatedId = '';
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  resetPostObj() {
    this.newPost.message = '';
    this.newPost.badges = [];
    this.newPost.id = '';
  }

  downloadDocument(id) {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.getDocument(id)
      .subscribe(response => {
        console.log(response);
        window.open(response.temporaryURL);
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
        if (this.entityId) {
          this.getEntityPosts();
        } else {
          this.getPosts();
        }
        this.postUploadResp = {};
        this.generatedId = '';
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
        this.selectedCommentInput = '';
        this.isNewPostAttachment = false;
        if (this.entityId) {
          this.getEntityPosts();
        } else {
          this.getPosts();
        }
        this.postUploadResp = {};
        this.generatedId = '';
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  showCommentInput(id) {
    if (this.selectedCommentInput === 'comment_' + id) {
      this.selectedCommentInput = '';
    } else {
      this.selectedCommentInput = 'comment_' + id;
    }
  }


  postSelectBadge(badge, targetObj) {
    if (typeof badge !== "string") {
      const selectedBadges = _.filter(this.badges, {selected: true});
      targetObj.badges = _.map(selectedBadges, 'name');
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

  startUpload($event, id?: string) {
    const base = this;
    if (id) {
      this.generatedId = id;
    } else {
      this.generatedId = this.guid();
      this.isNewPostAttachment = true;
    }
    setTimeout(function(){
      base.uploader.uploadAll();
    }, 400);
  }

  handlePostAction(action, id) {
    if (action === 'delete') {
      this.deletePost(id);
    }
  }

  handleCommentAction(action, commentId, postId) {
    if (action === 'delete') {
      this.deleteComment(commentId, postId);
    }
  }


  deletePost(id) {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.deletePost(id)
      .subscribe(response => {
        this.posts = [];
        this.postIndex = 0;
        if (this.entityId) {
          this.getEntityPosts();
        } else {
          this.getPosts();
        }
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  deleteComment(commentId, postId) {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.deleteComment(commentId, postId)
      .subscribe(response => {
        this.posts = [];
        this.postIndex = 0;
        if (this.entityId) {
          this.getEntityPosts();
        } else {
          this.getPosts();
        }
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  like(comment, type) {
    this.loadingService.triggerLoadingEvent(true);
    const data = {};
    data['entityID'] = comment.id;
    data['entitytype'] = type;
    data['id'] = '';
    data['userID'] = Session.getUser().id;

    this.collaborationService.like(data)
      .subscribe(response => {
        comment.likedByUser = true;
        comment.likesCount++;
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }

  unLike(comment) {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.unLike(comment.id)
      .subscribe(response => {
        comment.likedByUser = false;
        comment.likesCount--;
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }


  getPostsByIndex() {
    console.log(this.postIndex);
  }

  handleScroll(event: ScrollEvent) {
    //console.log('scroll occurred', event.originalEvent);
    if (event.isReachingBottom) {
      if (this.entityId) {
        this.getEntityPosts();
      } else {
        this.getPosts();
      }
      console.log(`the user is reaching the bottom`);
    }
    /*if (event.isWindowEvent) {
     console.log(`This event is fired on Window not on an element.`);
     }*/

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
      }
    };
  };

  ngOnDestroy() {
  };

}
