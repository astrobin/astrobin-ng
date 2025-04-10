import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import type { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import type { LoadingService } from "@core/services/loading.service";
import type { TitleService } from "@core/services/title/title.service";
import type { UpdateMarketplaceListingSuccess } from "@features/equipment/store/equipment.actions";
import { EquipmentActionTypes, UpdateMarketplaceListing } from "@features/equipment/store/equipment.actions";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import type { Actions } from "@ngrx/effects";
import { ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-create-listing-page",
  templateUrl: "./marketplace-edit-listing.page.component.html",
  styleUrls: [
    "../create-listing/marketplace-create-listing.page.component.scss",
    "./marketplace-edit-listing.page.component.scss"
  ]
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
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);

    this.listing = this.activatedRoute.snapshot.data.listing;

    if (this.equipmentMarketplaceService.listingSold(this.listing)) {
      this.router.navigateByUrl(`/equipment/marketplace/listing/${this.listing.hash}`).then();
    }
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
