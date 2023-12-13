import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { Actions, ofType } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import {
  EquipmentActionTypes,
  UpdateMarketplaceListing,
  UpdateMarketplaceListingSuccess
} from "@features/equipment/store/equipment.actions";
import { map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-create-listing-page",
  templateUrl: "./marketplace-edit-listing.page.component.html",
  styleUrls: ["./marketplace-edit-listing.page.component.scss"]
})
export class MarketplaceEditListingPageComponent extends BaseComponentDirective implements OnInit {
  readonly title = this.translateService.instant("Edit listing");
  readonly breadcrumb = new SetBreadcrumb({
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
        label: this.translateService.instant("Edit listing")
      }
    ]
  });

  listing: MarketplaceListingInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);

    this.listing = this.activatedRoute.snapshot.data.listing;
  }

  onSave(value) {
    this.loadingService.setLoading(true);

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.UPDATE_MARKETPLACE_LISTING_SUCCESS),
        take(1),
        map((action: UpdateMarketplaceListingSuccess) => action.payload.listing)
      )
      .subscribe(listing => {
        this.router.navigateByUrl(`/equipment/marketplace/listing/${listing.hash}`).then(() => {
          this.loadingService.setLoading(false);
        });
      });

    this.store$.dispatch(new UpdateMarketplaceListing({ listing: value }));
  }
}
