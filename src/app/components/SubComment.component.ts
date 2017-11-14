/**
 * Created by venkatkollikonda on 18/10/17.
 */
import {Component, Input} from "@angular/core";
import {Session} from "qCommon/app/services/Session";
import {FileUploader, FileUploaderOptions} from "ng2-file-upload";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {CollaborationService} from "../services/Collaboration.service";


declare let _: any;
declare let jQuery: any;
declare let moment: any;

@Component({
  selector: 'sub-comment',
  templateUrl: '../views/SubComment.html',
})

export class SubCommentComponent {
  filters: any = {'task': '#4ab9e8', 'done': '#1CB3AB', 'working': '#FDB844', 'active': '#CD0814', 'celebrating': '#ef655d'};
  comments: any;
  selectedCommentInput: string;
  user: any;
  newComment: any = {id: '', postID: '', parentID: '', commentedBy: '', message: '', badges: [],
    emoji: 'insert_emoticon', createdDate: '', updatedDate: ''};
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
  posts: any = [];


  @Input()
  set data(data: any){
    this.comments = data;
  }

  constructor(private loadingService: LoadingService, private collaborationService: CollaborationService) {
    this.user = Session.getUser();
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


  /*getEntityPosts() {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.getEntityPosts(this.entityId, this.entityType)
      .subscribe(response => {
        this.posts = response.posts;
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
  }*/



  getColor(type) {
    return this.filters[type];
  }

  getRight(index) {
    return index * 5 + 'px';
  }

  showCommentInput(id) {
    if (this.selectedCommentInput === 'comment_' + id) {
      this.selectedCommentInput = '';
    } else {
      this.selectedCommentInput = 'comment_' + id;
    }
  }

  handleCommentAction(action, commentId, postId) {
    if (action === 'delete') {
      this.deleteComment(commentId, postId);
    }
  }

  deleteComment(commentId, postId) {
    this.loadingService.triggerLoadingEvent(true);
    this.collaborationService.deleteComment(commentId, postId)
      .subscribe(response => {
        /*if (this.entityId) {
          this.getEntityPosts();
        } else {
          this.getPosts();
        }*/
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
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
        //this.getEntityPosts();
        this.postUploadResp = {};
        this.loadingService.triggerLoadingEvent(false);
      }, error => {
        this.loadingService.triggerLoadingEvent(false);
      });
    console.log(this.newComment);
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

  postSelectBadge(badge, targetObj) {
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

  startUpload($event) {
    const base = this;
    setTimeout(function(){
      base.uploader.uploadAll();
    }, 400);
  }

  ngOnInit () {
    /*this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      const payload: any = {};
      //payload.sourceID = this.newPost.id;
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
        /!* this.document = JSON.parse(response);
         this.billFileExist = true;
         this.compileLink();*!/
        //Your code goes here
      }
    };*/
  };

  ngOnDestroy() {
  }

}
