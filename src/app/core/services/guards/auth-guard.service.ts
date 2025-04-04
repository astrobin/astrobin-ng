import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@core/services/auth.service";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { Observable, of } from "rxjs";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { filter, switchMap } from "rxjs/operators";
import { RouterService } from "@core/services/router.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuardService extends BaseService  {
  constructor(
    public readonly store$: Store<MainState>,
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
