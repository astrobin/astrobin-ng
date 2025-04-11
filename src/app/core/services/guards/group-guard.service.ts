import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { selectAuth, selectCurrentUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
import { Observer, Observable } from "rxjs";
import { filter, map, take } from "rxjs/operators";

import { AuthService } from "../auth.service";

@Injectable({
  providedIn: "root"
})
export class GroupGuardService extends BaseService {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly authService: AuthService,
    public readonly router: Router,
    public readonly location: Location
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Observable<boolean> {
    const onSuccess = (observer: Observer<boolean>) => {
      observer.next(true);
      observer.complete();
    };

    const onError = (observer: Observer<boolean>, redirectTo: string) => {
      this.store$
        .select(selectAuth)
        .pipe(
          take(1),
          map(state => state.loggingOutViaBackend)
        )
        .subscribe(loggingOutViaBackend => {
          if (!loggingOutViaBackend) {
            void this.router.navigateByUrl(redirectTo, { skipLocationChange: true }).then(() => {
              observer.next(false);
              observer.complete();
              this.location.replaceState(routerState.url);
            });
          }
        });
    };

    return new Observable<boolean>(observer => {
      this.authService.isAuthenticated$().subscribe(authenticated => {
        if (!authenticated) {
          onError(observer, "/permission-denied");
          return;
        }

        this.store$
          .select(selectCurrentUser)
          .pipe(
            filter(user => !!user),
            map((user: UserInterface) => {
              if (!user) {
                return false;
              }

              if (route.data.group) {
                return user.groups.filter(group => group.name === route.data.group).length > 0;
              }

              const intersection = user.groups
                .map(group => group.name)
                .filter(value => route.data.anyOfGroups.includes(value));

              if (route.data.anyOfGroups) {
                return intersection.length > 0;
              }

              if (route.data.allOfGroups) {
                return intersection.length === route.data.allOfGroups;
              }
            })
          )
          .subscribe(canActivate => {
            if (canActivate) {
              onSuccess(observer);
            } else {
              onError(observer, "/permission-denied");
            }
          });
      });
    });
  }
}
