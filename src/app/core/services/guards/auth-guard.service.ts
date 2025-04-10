import { Injectable } from "@angular/core";
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { AuthService } from "@core/services/auth.service";
import { BaseService } from "@core/services/base.service";
import type { LoadingService } from "@core/services/loading.service";
import type { RouterService } from "@core/services/router.service";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import type { Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { filter, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AuthGuardService extends BaseService {
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
