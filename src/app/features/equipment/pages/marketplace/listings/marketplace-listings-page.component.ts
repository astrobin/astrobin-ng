import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import { takeUntil } from "rxjs/operators";
import { LoadMarketplaceListings } from "@features/equipment/store/equipment.actions";

@Component({
  selector: "astrobin-listings",
  templateUrl: "./marketplace-listings-page.component.html",
  styleUrls: ["./marketplace-listings-page.component.scss"]
})
export class MarketplaceListingsPageComponent extends BaseComponentDirective implements OnInit {
  title = this.translateService.instant("Equipment marketplace");

  listings$ = this.store$.select(selectMarketplaceListings).pipe(takeUntil(this.destroyed$));
  page = 1;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService
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
            label: this.translateService.instant("Marketplace")
          }
        ]
      })
    );

    this.refresh();
  }

  public refresh() {
    this.store$.dispatch(new LoadMarketplaceListings({ page: this.page }));
  }
}
