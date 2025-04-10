import { OnInit, Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { LoadingService } from "@core/services/loading.service";
import { TitleService } from "@core/services/title/title.service";
import {
  UpdateMarketplaceListingSuccess,
  EquipmentActionTypes,
  UpdateMarketplaceListing
} from "@features/equipment/store/equipment.actions";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
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
