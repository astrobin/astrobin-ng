import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { filter, switchMap } from "rxjs/operators";
import { RouterService } from "@shared/services/router.service";

@Injectable()
export class AuthGuardService extends BaseService implements CanActivate {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly authService: AuthService,
    public readonly routerService: RouterService
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

          this.routerService.redirectToLogin().then(() => {
            observer.next(false);
            observer.complete();
          });
        });
    });
  }
}
