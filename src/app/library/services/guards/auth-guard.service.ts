import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@lib/services/auth.service";

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }

    const redirectUrl = route["_routerState"]["url"];

    this.router.navigateByUrl(
      this.router.createUrlTree(["/login"], {
        queryParams: {
          redirectUrl
        }
      })
    );
    return false;
  }
}
