import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Injectable()
export class AuthGuardService extends BaseService implements CanActivate {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly authService: AuthService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly classicRouteService: ClassicRoutesService
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.authService
        .isAuthenticated$()
        .pipe(take(1))
        .subscribe(result => {
          if (result) {
            observer.next(true);
            observer.complete();
            return;
          }

          this.router
            .navigateByUrl(
              this.router.createUrlTree(["/account/logging-in"], {
                queryParams: {
                  redirectUrl: this.windowRefService.getCurrentUrl().toString()
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
