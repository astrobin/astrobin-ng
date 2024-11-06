import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { select, Store } from "@ngrx/store";
import { filter, map, switchMap, take } from "rxjs/operators";
import { selectAuth, selectCurrentUser } from "@features/account/store/auth.selectors";
import { MainState } from "@app/store/state";
import { RouterService } from "@shared/services/router.service";
import { Actions } from "@ngrx/effects";

@Injectable({
  providedIn: "root"
})
export class UsernameMatchGuard  {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly router: Router,
    public readonly routerService: RouterService
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
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
