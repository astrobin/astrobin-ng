import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { filter, switchMap } from "rxjs/operators";

@Injectable()
export class AuthGuardService extends BaseService implements CanActivate {
  constructor(
    public readonly store$: Store<State>,
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
        .pipe(
          switchMap(isAuthenticated => {
            if (isAuthenticated) {
              return this.store$.select(selectCurrentUser).pipe(filter(user => !!user));
            } else {
              return of(null);
            }
          })
        )
        .subscribe(user => {
          if (user) {
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
