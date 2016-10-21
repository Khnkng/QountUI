/**
 * Created by seshu on 17-10-2016.
 */

import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Session} from "./Session";
import {Observable} from "rxjs";

@Injectable()
export class LoggedInActivator implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {
        if(!Session.hasSession()) {
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }
    constructor(private router: Router) {}
}