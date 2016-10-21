/**
 * Created by seshu on 10-03-2016.
 */

import {Injectable} from "@angular/core";
import {UserModel} from "../models/User.model";

@Injectable()
export class Session {

  static create(user:UserModel, token:string) {
    this.put('user', user);
    this.put('token', token);
  }

  static hasSession() {
    if(localStorage.getItem('user') && localStorage.getItem('token')) {
      return true;
    }
    return false;
  }

  static getUser(): UserModel {
    return this.get('user');
  }

  static getToken(): string {
    return ''+this.get('token');
  }

  static put(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  static getKey(key): any {
    return localStorage.getItem(key)?localStorage.getItem(key).replace(/"/g, ""):null;
  }
  static deleteKey(key) {
    return localStorage.removeItem(key);
  }

  static get(key): UserModel {
    return JSON.parse(localStorage.getItem(key));
  }
  
  static getJSON(key): any {
    return JSON.parse(localStorage.getItem(key));
  }

  static destroy() {
    localStorage.clear();
    sessionStorage.clear();
  }

}
