import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public authService: AuthService, public router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.authService
        .isAuthenticated()
        .pipe(take(1))
        .subscribe(result => {
          if (result) {
            observer.next(true);
            observer.complete();
            return;
          }

          const redirectUrl = route["_routerState"]["url"];

          this.router
            .navigateByUrl(
              this.router.createUrlTree(["/account/login"], {
                queryParams: {
                  redirectUrl
                }
              })
            )
            .then(() => {
              observer.next(false);
              observer.complete();
            });
        });
    });
  }
}
