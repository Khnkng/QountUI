/**
 * Created by Nagaraju Thota on 14/11/17.
 */

import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Session} from "qCommon/app/services/Session";
import {ToastService} from "qCommon/app/services/Toast.service";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {CompaniesService} from "qCommon/app/services/Companies.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {DocumentService} from "../services/Documents.service";
import {pageTitleService} from "qCommon/app/services/PageTitle";
import {FileUploader, FileUploaderOptions} from "ng2-file-upload";

declare var jQuery: any;
declare var _: any;

@Component({
  selector: 'documentsType',
  templateUrl: '../views/documentsType.html'
})

export class DocumentsTypeComponent {
  routeSubscribe: any;
  companyCurrency: string;
  companyId: string;
  documentsData: any;
  uploader: FileUploader;
  docUploadResp: any;
  document: any;
  attachments: Array<any> = [];
  hasBaseDropZoneOver: boolean = false;
  showPage: boolean = false;
  currentDocType: string;
  documentName: string;
  documentNotes: string;

  constructor(private _router: Router, private _route: ActivatedRoute, private toastService: ToastService, private switchBoard: SwitchBoard,
              private loadingService: LoadingService, private companiesService: CompaniesService, private documentsService: DocumentService,
              private titleService: pageTitleService) {
    this.titleService.setPageTitle("Documents");
    this.companyId = Session.getCurrentCompany();
    this.companyCurrency = Session.getCurrentCompanyCurrency();

    this.routeSubscribe = this._route.params.subscribe(params => {

      this.currentDocType = params['docType'];
      this.uploader = new FileUploader(<FileUploaderOptions>{
        url: this.documentsService.getDocumentServiceUrl(this.companyId, this.currentDocType),
        headers: [{
          name: 'Authorization',
          value: 'Bearer ' + Session.getToken()
        }]
      });
      this.documentsService.getDocumentsByType(this.companyId, this.currentDocType)
        .subscribe(documentsData  => {
          this.documentsData = documentsData;
          this.showPage = true;
        }, error =>{
          this.loadingService.triggerLoadingEvent(false);
        });
    });

    this.routeSubscribe = switchBoard.onClickPrev.subscribe(title => {
      let link = ['documents'];
      this._router.navigate(link);
    });

  }

  ngOnInit() {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      let payload: any = {};
      // payload.sourceID = this.sourceId;
      payload.sourceType = 'documents';
      payload.documentNotes = this.documentNotes;
      form.append('payload', JSON.stringify(payload));
    };
    this.uploader.onCompleteItem = (item, response, status, header) => {
      if (status === 200) {
        this.uploader.progress = 100;
        this.docUploadResp = response;
        this.uploader.queue.forEach(function (item) {
          item.remove();
        });
        this.document = JSON.parse(response);
        this.compileLink();
        this.documentNotes = "";
        this.loadingService.triggerLoadingEvent(false);
        jQuery('#document-upload-conformation').foundation('close');
      }
    };
  }

  compileLink() {
    if (this.document && this.document.temporaryURL) {
      let data = {id: this.document.id,
        name: this.document.name,
        temporaryURL: this.document.temporaryURL
      };
      this.attachments.push(data);
    }
  }

  openUploadModalDailog() {
    jQuery('#document-upload-conformation').foundation('open');
  }

  closeUploadModalDailog() {
    this.uploader.queue.forEach(function (item) {
      item.remove();
    });
    this.documentNotes = "";
    jQuery('#document-upload-conformation').foundation('close');
  }

  startUpload($event) {
    let base = this;
    this.uploader.queue.forEach(function (item) {
      base.documentName = item.file.name;
    });
    setTimeout(function () {
      base.openUploadModalDailog();
    }, 500);
  }

  uploadDocument() {
    this.loadingService.triggerLoadingEvent(true);
    this.uploader.uploadAll();
  }

  ngOnDestroy() {
    if (jQuery('#document-upload-conformation')) {
      jQuery('#document-upload-conformation').remove();
    }
    if (this.routeSubscribe) {
      this.routeSubscribe.unsubscribe();
    }
  }

  fileDropOver(val) {
    let base = this;
    this.uploader.queue.forEach(function (item) {
      base.documentName = item.file.name;
    });
    base.openUploadModalDailog();
  }

}
