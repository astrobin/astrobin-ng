import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { selectAuth, selectCurrentUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, Observer } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import { AuthService } from "../auth.service";

@Injectable()
export class AstroBinGroupGuardService extends BaseService implements CanActivate {
  constructor(
    public readonly store$: Store<State>,
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
            this.router.navigateByUrl(redirectTo, { skipLocationChange: true }).then(() => {
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

              if (!user.astrobinGroups) {
                return false;
              }

              if (route.data.astroBinGroup) {
                return user.astrobinGroups.filter(group => group.name === route.data.astroBinGroup).length > 0;
              }

              const intersection = user.astrobinGroups
                .map(group => group.name)
                .filter(value => route.data.anyOfAstroBinGroups?.includes(value));

              if (route.data.anyOfAstroBinGroups) {
                return intersection.length > 0;
              }

              if (route.data.allOfAstroBinGroups) {
                return intersection.length === route.data.allOfAstroBinGroups;
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
