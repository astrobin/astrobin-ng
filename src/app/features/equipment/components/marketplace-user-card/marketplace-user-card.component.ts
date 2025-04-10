import type { OnChanges } from "@angular/core";
import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { UserInterface } from "@core/interfaces/user.interface";
import { CountryService } from "@core/services/country.service";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Observable } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-user-card",
  templateUrl: "./marketplace-user-card.component.html",
  styleUrls: ["./marketplace-user-card.component.scss"]
})
export class MarketplaceUserCardComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  listing: MarketplaceListingInterface;

  user$: Observable<UserInterface>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly countryService: CountryService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnChanges(): void {
    this.user$ = this.store$.select(selectUser, this.listing.user).pipe(
      filter(user => !!user),
      takeUntil(this.destroyed$)
    );

    this.store$.dispatch(new LoadUser({ id: this.listing.user }));
  }
}
