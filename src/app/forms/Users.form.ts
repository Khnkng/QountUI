import {Injectable} from "@angular/core";
import {abstractForm} from "qCommon/app/forms/abstractForm";
import {Validators} from "@angular/forms";

@Injectable()
export class UsersForm extends abstractForm{

    getForm() {
        return {
        "firstName":['', Validators.required],
        "lastName":['', Validators.required],
        "email":['', Validators.required],
        "roleID":['', Validators.required]
        }
    }
}