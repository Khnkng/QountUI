import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";
import {Session} from "qCommon/app/services/Session";


@Injectable()
export class ShareholdersForm extends abstractForm {

  getForm() {
    return {
      "id": [],
      "userId": [],
      "companyId": [Session.getCurrentCompany()],
      "firstName": ['', Validators.required],
      "lastName": ['', Validators.required],
      "email": ['', Validators.required],
      "coaId": ['', Validators.required],
      "ssn": [''],
      "percentage": [''],
      "phoneNumber": ['', Validators.required],
      "createdDate": [],
      "modifiedDate": []
    };
  }
}
