import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { Store } from "@ngrx/store";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { EMPTY, Observable } from "rxjs";
import { filter, tap } from "rxjs/operators";
import { LoadUser, LoadUserProfile } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";

@Component({
  selector: "astrobin-migration-review",
  templateUrl: "./migration-review.component.html",
  styleUrls: ["./migration-review.component.scss"]
})
export class MigrationReviewComponent implements OnInit {
  title = "Equipment migration review tool";
  pendingReview$: Observable<any[]> = this.getPendingMigrationReview$();

  constructor(
    public readonly store$: Store,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly legacyGearApi: GearApiService
  ) {}

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
    return this.legacyGearApi.getPendingMigrationReview().pipe(
      tap(items => {
        items.forEach(item => {
          this.store$.dispatch(new LoadUser({ id: item.migrationFlagModerator }));
          this.store$
            .select(selectUser, item.migrationFlagModerator)
            .pipe(filter(user => !!user))
            .subscribe(user => {
              this.store$.dispatch(new LoadUserProfile({ id: user.userProfile }));
            });
        });
      })
    );
  }

  getDisplayName$(userId: UserInterface["id"]): Observable<string> {
    return EMPTY;
  }
}
