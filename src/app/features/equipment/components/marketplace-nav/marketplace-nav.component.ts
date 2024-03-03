import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { isPlatformBrowser, Location } from "@angular/common";

export enum MarketplaceNavPage {
  ALL_LISTINGS = "all-listings",
  MY_LISTINGS = "my-listings",
  MY_OFFERS = "my-offers",
  MY_PURCHASES = "my-purchases",
}

@Component({
  selector: "astrobin-marketplace-nav",
  templateUrl: "./marketplace-nav.component.html",
  styleUrls: ["./marketplace-nav.component.scss"]
})
export class MarketplaceNavComponent extends BaseComponentDirective implements OnInit {
  readonly MarketplaceNavPage = MarketplaceNavPage;
  active: MarketplaceNavPage = MarketplaceNavPage.ALL_LISTINGS;

  constructor(
    public readonly store$: Store<State>,
    public readonly router: Router,
    public readonly location: Location,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this._setActive();

    this.router.events?.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this._setActive();
      }
    });
  }

  private _setActive() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const path = this.location.path();

    if (path === "/equipment/marketplace") {
      this.active = MarketplaceNavPage.ALL_LISTINGS;
    } else if (path === "/equipment/marketplace/my-listings") {
      this.active = MarketplaceNavPage.MY_LISTINGS;
    } else if (path === "/equipment/marketplace/my-offers") {
      this.active = MarketplaceNavPage.MY_OFFERS;
    } else if (path === "/equipment/marketplace/my-purchases") {
      this.active = MarketplaceNavPage.MY_PURCHASES;
    }
  }
}
