import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { Store } from "@ngrx/store";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { Observable } from "rxjs";
import { filter, tap } from "rxjs/operators";
import { LoadUser, LoadUserProfile } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";

@Component({
  selector: "astrobin-migration-review",
  templateUrl: "./migration-review.component.html",
  styleUrls: ["./migration-review.component.scss"]
})
export class MigrationReviewComponent extends BaseComponentDirective implements OnInit {
  title = "Equipment migration review tool";
  pendingReview$: Observable<any[]> = this.getPendingMigrationReview$();

  constructor(
    public readonly store$: Store<State>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly legacyGearApi: GearApiService,
    public readonly usernameService: UsernameService
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

  getUser$(userId: UserInterface["id"]): Observable<UserInterface> {
    return this.store$.select(selectUser, userId);
  }
}
