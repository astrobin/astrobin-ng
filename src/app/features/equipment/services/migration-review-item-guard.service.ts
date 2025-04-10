import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { MainState } from "@app/store/state";
import { GearApiService } from "@core/services/api/classic/astrobin/gear/gear-api.service";
import { GearMigrationStrategyApiService } from "@core/services/api/classic/astrobin/grar-migration-strategy/gear-migration-strategy-api.service";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
import { Observer, combineLatest, EMPTY, Observable } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class MigrationReviewItemGuardService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly migrationStrategyApiService: GearMigrationStrategyApiService,
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

    const id = route.params["migrationStrategyId"];

    return new Observable<boolean>(observer => {
      combineLatest([
        this.store$.select(selectCurrentUser).pipe(map(user => user.id)),
        this.migrationStrategyApiService.get(id)
      ])
        .pipe(
          switchMap(result => {
            const userId = result[0];
            const migrationStrategy = result[1];

            return this.legacyGearApi.get(migrationStrategy.gear).pipe(
              map(item => ({
                userId,
                migrationStrategy,
                item
              }))
            );
          }),
          map(({ userId, migrationStrategy, item }) => {
            let message;

            if (!migrationStrategy.migrationFlag) {
              message = "You cannot review this item: a migration wasn't proposed yet.";
            } else if (migrationStrategy.migrationFlagModerator === userId) {
              message = "You cannot review this item: you were the one who proposed a migration for it.";
            } else if (migrationStrategy.migrationFlagReviewer) {
              message = "You cannot review this item: it's already been reviewed.";
            } else if (
              migrationStrategy.migrationFlagReviewerLock &&
              migrationStrategy.migrationFlagReviewerLock !== userId
            ) {
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
