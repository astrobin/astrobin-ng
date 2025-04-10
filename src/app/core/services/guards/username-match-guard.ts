import { Injectable } from "@angular/core";
import type { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { RouterService } from "@core/services/router.service";
import { selectAuth, selectCurrentUser } from "@features/account/store/auth.selectors";
import type { Actions } from "@ngrx/effects";
import { select } from "@ngrx/store";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { filter, map, switchMap, take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class UsernameMatchGuard {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly router: Router,
    public readonly routerService: RouterService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const username = route.paramMap.get("username");

    return this.store$.pipe(
      select(selectAuth),
      map(auth => auth.initialized),
      filter(initialized => !!initialized),
      switchMap(() => this.store$.select(selectCurrentUser)),
      take(1),
      map(currentUser => {
        if (currentUser) {
          if (currentUser.username === username) {
            return true;
          } else {
            return this.routerService.getPermissionDeniedUrlTree();
          }
        } else {
          return this.routerService.getLoginUrlTree();
        }
      })
    );
  }
}
