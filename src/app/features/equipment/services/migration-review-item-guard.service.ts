import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { combineLatest, EMPTY, Observable, Observer } from "rxjs";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { catchError, map } from "rxjs/operators";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
import { Location } from "@angular/common";
import { State } from "@app/store/state";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Injectable({
  providedIn: "root"
})
export class MigrationReviewItemGuardService extends BaseService implements CanActivate {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<State>,
    public readonly legacyGearApi: GearApiService,
    public readonly router: Router,
    public readonly location: Location,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const onSuccess = (observer: Observer<boolean>) => {
      observer.next(true);
      observer.complete();
    };

    const onError = (observer: Observer<boolean>, redirectTo: string) => {
      this.router.navigateByUrl(redirectTo, { skipLocationChange: true }).then(() => {
        observer.next(false);
        observer.complete();
        this.location.replaceState(state.url);
      });
    };

    const id = route.params["itemId"];

    return new Observable<boolean>(observer => {
      combineLatest([this.store$.select(selectCurrentUser).pipe(map(user => user.id)), this.legacyGearApi.get(id)])
        .pipe(
          map(result => {
            const userId = result[0];
            const item = result[1];

            let message;

            if (!item.migrationFlag) {
              message = "You cannot review this item: a migration wasn't proposed yet.";
            } else if (item.migrationFlagModerator === userId) {
              message = "You cannot review this item: you were the one who proposed a migration for it.";
            } else if (item.migrationFlagReviewer) {
              message = "You cannot review this item: it's already been reviewed.";
            } else if (item.migrationFlagReviewerLock && item.migrationFlagReviewerLock !== userId) {
              message = "You cannot review this item: it's currently locked by another user.";
            }

            if (message) {
              this.popNotificationsService.error(message, null, { timeOut: 0 });
              return false;
            }

            return true;
          }),
          catchError(error => {
            if (error.status === 404) {
              onError(observer, "/404");
              return EMPTY;
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
  }
}
