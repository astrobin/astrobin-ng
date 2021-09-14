import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { Store } from "@ngrx/store";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { combineLatest, Observable, of } from "rxjs";
import { filter, map, tap } from "rxjs/operators";
import { LoadUser, LoadUserProfile } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { UserService } from "@shared/services/user.service";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { Router } from "@angular/router";

@Component({
  selector: "astrobin-migration-review",
  templateUrl: "./migration-review.component.html",
  styleUrls: ["./migration-review.component.scss"]
})
export class MigrationReviewComponent extends BaseComponentDirective implements OnInit {
  title = "Migration review";
  pendingReview$: Observable<any[]> = this.getPendingMigrationReview$();

  constructor(
    public readonly store$: Store<State>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly legacyGearApi: GearApiService,
    public readonly usernameService: UsernameService,
    public readonly userService: UserService,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
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
  }

  getPendingMigrationReview$(): Observable<any[]> {
    return this.legacyGearApi.getPendingMigrationReview();
  }

  migrationFlagTooltip(migrationFlag: MigrationFlag): string {
    switch (migrationFlag) {
      case MigrationFlag.WRONG_TYPE:
        return "This legacy item was classified as the wrong type (e.g. a telescope classified as a mount) and will be dealt with later.";
      case MigrationFlag.MULTIPLE_ITEMS:
        return "This legacy item actually collates multiple items together (e.g. 'LRGB filters') and will be dealt with later.";
      case MigrationFlag.DIY:
        return "This legacy item is a DIY object and will migrated as-is automatically.";
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
  isOwnItem$(legacyItem: any): Observable<boolean> {
    return this.currentUser$.pipe(
      map(currentUser => !currentUser || currentUser.id === legacyItem.migrationFlagModerator)
    );
  }

  // The item is locked for review by another reviewer.
  isLocked$(legacyItem: any): Observable<boolean> {
    return this.currentUser$.pipe(
      map(
        currentUser =>
          !currentUser ||
          (legacyItem.migrationFlagReviewerLock && legacyItem.migrationFlagReviewerLock === currentUser.id)
      )
    );
  }

  isAlreadyReviewed$(legacyItem: any): Observable<boolean> {
    return of(legacyItem.migrationFlagReviewer);
  }

  reviewButtonDisabled$(legacyItem: any): Observable<boolean> {
    return combineLatest([
      this.isOwnItem$(legacyItem),
      this.isLocked$(legacyItem),
      this.isAlreadyReviewed$(legacyItem)
    ]).pipe(map(result => result[0] || result[1] || result[2]));
  }

  reviewButtonIcon$(legacyItem: any): Observable<string> {
    return combineLatest([
      this.isOwnItem$(legacyItem),
      this.isLocked$(legacyItem),
      this.isAlreadyReviewed$(legacyItem)
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
