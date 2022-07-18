import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { Store } from "@ngrx/store";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { combineLatest, forkJoin, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { UserService } from "@shared/services/user.service";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { Router } from "@angular/router";
import { GearMigrationStrategyApiService } from "@shared/services/api/classic/astrobin/grar-migration-strategy/gear-migration-strategy-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";

@Component({
  selector: "astrobin-migration-review",
  templateUrl: "./migration-review.component.html",
  styleUrls: ["./migration-review.component.scss"]
})
export class MigrationReviewComponent extends BaseComponentDirective implements OnInit {
  title = "Migration review";
  migrationStrategies: any[];
  legacyItems = {};

  constructor(
    public readonly store$: Store<State>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly legacyGearApi: GearApiService,
    public readonly gearMigrationStrategyApiService: GearMigrationStrategyApiService,
    public readonly usernameService: UsernameService,
    public readonly userService: UserService,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);

    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment")
          },
          {
            label: this.title
          }
        ]
      })
    );

    this.getMigrationStrategies$().subscribe(response => {
      this.migrationStrategies = response.results;
    });
  }

  getMigrationStrategies$(): Observable<PaginatedApiResultInterface<any>> {
    return this.gearMigrationStrategyApiService.getPendingReview().pipe(
      switchMap(response => {
        if (response.count === 0) {
          return of(response);
        }

        return forkJoin(
          response.results.map(migrationStrategy =>
            this.legacyGearApi.get(migrationStrategy.gear).pipe(map(item => ({ migrationStrategy, item })))
          )
        ).pipe(
          tap(results => {
            for (const result of results) {
              this.legacyItems[result.migrationStrategy.pk] = result.item;
            }
          }),
          map(() => response)
        );
      })
    );
  }

  migrationFlagTooltip(migrationFlag: MigrationFlag): string {
    switch (migrationFlag) {
      case MigrationFlag.WRONG_TYPE:
        return "This legacy item was classified as the wrong type (e.g. a telescope classified as a mount) and will be dealt with later.";
      case MigrationFlag.MULTIPLE_ITEMS:
        return "This legacy item actually collates multiple items together (e.g. 'LRGB filters') and will be dealt with later.";
      case MigrationFlag.NOT_ENOUGH_INFO:
        return "This legacy item doesn't have enough information to decide on a migration strategy.";
      case MigrationFlag.MIGRATE:
        return "This legacy item will be migrated to a specific item in the new database.";
    }
  }

  reviewItem($event, itemId) {
    $event.target.classList.add("loading");
    this.router.navigate(["equipment", "migration-review", itemId]);
  }

  // The legacy item was moderated by the same user, so they cannot review it too.
  isOwnItem$(migrationStrategy: any): Observable<boolean> {
    return this.currentUser$.pipe(
      map(currentUser => !currentUser || currentUser.id === migrationStrategy.migrationFlagModerator)
    );
  }

  // The item is locked for review by another reviewer.
  isLocked$(migrationStrategy: any): Observable<boolean> {
    return this.currentUser$.pipe(
      map(
        currentUser =>
          !currentUser ||
          (migrationStrategy.migrationFlagReviewerLock &&
            migrationStrategy.migrationFlagReviewerLock === currentUser.id)
      )
    );
  }

  isAlreadyReviewed$(migrationStrategy: any): Observable<boolean> {
    return of(migrationStrategy.migrationFlagReviewer);
  }

  reviewButtonDisabled$(migrationStrategy: any): Observable<boolean> {
    return combineLatest([
      this.isOwnItem$(migrationStrategy),
      this.isLocked$(migrationStrategy),
      this.isAlreadyReviewed$(migrationStrategy)
    ]).pipe(map(result => result[0] || result[1] || result[2]));
  }

  reviewButtonIcon$(migrationStrategy: any): Observable<string> {
    return combineLatest([
      this.isOwnItem$(migrationStrategy),
      this.isLocked$(migrationStrategy),
      this.isAlreadyReviewed$(migrationStrategy)
    ]).pipe(
      map(result => {
        const isOwnItem: boolean = result[0];
        const isLocked: boolean = result[1];
        const isAlreadyReviewed: boolean = result[2];

        if (isOwnItem) {
          return "ban";
        }

        if (isLocked) {
          return "lock";
        }

        if (isAlreadyReviewed) {
          return "check";
        }

        return "arrow-right";
      })
    );
  }
}
