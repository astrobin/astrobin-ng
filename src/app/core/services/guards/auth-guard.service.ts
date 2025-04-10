import { Injectable } from "@angular/core";
import type { MainState } from "@app/store/state";
import { AuthService } from "@core/services/auth.service";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { RouterService } from "@core/services/router.service";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
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

  canActivate(): Observable<boolean> {
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
