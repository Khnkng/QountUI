/**
 * Created by seshu on 21-10-2016.
 */

import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Session} from "./Session";

@Injectable()
export class DashBoardActivator implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {
        if(Session.hasSession()) {
            this.router.navigate(['']);
            return false;
        }
        return true;
    }
    constructor(private router: Router) {}
}