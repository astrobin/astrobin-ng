import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUserByUsername } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { MarketplaceFeedbackInterface } from "@features/equipment/types/marketplace-feedback.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { filter, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-user-feedback-list",
  templateUrl: "./marketplace-user-feedback-list-page.component.html",
  styleUrls: ["./marketplace-user-feedback-list-page.component.scss"]
})
export class MarketplaceUserFeedbackListPageComponent extends BaseComponentDirective implements OnInit {
  page = 1;
  user: UserInterface;
  title: string;
  feedback: PaginatedApiResultInterface<MarketplaceFeedbackInterface>;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    const username = this.activatedRoute.snapshot.paramMap.get("username");

    this.store$.dispatch(new LoadUser({ username }));

    this.store$.select(selectUserByUsername, username).pipe(
      filter(user => !!user),
      take(1),
      tap(user => this.user = user),
      tap(() => this._setTitle()),
      tap(() => this._setBreadCrumb()),
      tap(() => this.loadFeedback(this.page))
    ).subscribe();
  }

  loadFeedback(page: number) {
    this.page = page;

    this.equipmentApiService.loadUserMarketplaceFeedback(this.user.id, this.page).subscribe(response => {
      this.feedback = response;
    });
  }

  private _setTitle() {
    this.title = this.translateService.instant(
      `${this.user.displayName}'s marketplace feedback`
    );
  }

  private _setBreadCrumb() {
    this.store$.dispatch(new SetBreadcrumb({
      breadcrumb: [
        {
          label: this.translateService.instant("Equipment"),
          link: "/equipment/explorer"
        },
        {
          label: this.translateService.instant("Marketplace"),
          link: "/equipment/marketplace"
        },
        {
          label: this.user.displayName
        },
        {
          label: this.translateService.instant("Feedback")
        }
      ]
    }));
  }
}
