import { Location } from "@angular/common";
import type { OnInit } from "@angular/core";
import { Component, Inject, PLATFORM_ID } from "@angular/core";
import type { IsActiveMatchOptions } from "@angular/router";
import { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import { RouterService } from "@core/services/router.service";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

export enum MarketplaceNavPage {
  ACTIVE_LISTINGS,
  PENDING_MODERATION,
  SOLD_LISTINGS,
  USER_LISTINGS,
  USER_SOLD_LISTINGS,
  USER_EXPIRED_LISTINGS,
  USER_OFFERS,
  USER_PURCHASES,
  USER_FOLLOWED,
  USER_FEEDBACK
}

@Component({
  selector: "astrobin-marketplace-nav",
  templateUrl: "./marketplace-nav.component.html",
  styleUrls: ["./marketplace-nav.component.scss"]
})
export class MarketplaceNavComponent extends BaseComponentDirective implements OnInit {
  readonly MarketplaceNavPage = MarketplaceNavPage;
  readonly routerLinkActiveOptions: IsActiveMatchOptions = {
    fragment: "ignored",
    queryParams: "ignored",
    paths: "exact",
    matrixParams: "ignored"
  };

  constructor(
    public readonly store$: Store<MainState>,
    public readonly router: Router,
    public readonly location: Location,
    @Inject(PLATFORM_ID) public readonly platformId: object,
    public readonly routerService: RouterService
  ) {
    super(store$);
  }

  getLink$(page: MarketplaceNavPage): Observable<{ path: string[]; queryParams: { [key: string]: any } }> {
    return this.currentUser$.pipe(
      map(user => {
        let path: string[];
        let shouldRedirectToLogin = false;

        switch (page) {
          case MarketplaceNavPage.ACTIVE_LISTINGS:
            path = ["/equipment/marketplace"];
            break;
          case MarketplaceNavPage.PENDING_MODERATION:
            path = ["/equipment/marketplace/pending-moderation"];
            break;
          case MarketplaceNavPage.SOLD_LISTINGS:
            path = ["/equipment/marketplace/sold"];
            break;
          case MarketplaceNavPage.USER_LISTINGS:
          case MarketplaceNavPage.USER_SOLD_LISTINGS:
          case MarketplaceNavPage.USER_EXPIRED_LISTINGS:
          case MarketplaceNavPage.USER_OFFERS:
          case MarketplaceNavPage.USER_PURCHASES:
          case MarketplaceNavPage.USER_FOLLOWED:
            path = !!user ? [`/equipment/marketplace/users/${user.username}/${this.getPathSuffix(page)}`] : null;
            shouldRedirectToLogin = true;
            break;
          case MarketplaceNavPage.USER_FEEDBACK:
            path = !!user ? [`/equipment/marketplace/users/${user.username}/feedback`] : null;
            break;
          default:
            return { path: [], queryParams: {} };
        }

        if (!!user || !shouldRedirectToLogin) {
          return { path: path, queryParams: {} };
        } else {
          const loginUrlTree = this.routerService.getLoginUrlTree();
          const loginPath = loginUrlTree.root.children.primary.segments.map(segment => segment.path);
          // Ensure the path starts from the root
          if (loginPath[0] !== "") {
            loginPath.unshift("");
          }
          return {
            path: loginPath,
            queryParams: loginUrlTree.queryParams
          };
        }
      })
    );
  }

  private getPathSuffix(page: MarketplaceNavPage): string {
    switch (page) {
      case MarketplaceNavPage.USER_LISTINGS:
        return "listings";
      case MarketplaceNavPage.USER_SOLD_LISTINGS:
        return "sold";
      case MarketplaceNavPage.USER_EXPIRED_LISTINGS:
        return "expired";
      case MarketplaceNavPage.USER_OFFERS:
        return "offers";
      case MarketplaceNavPage.USER_PURCHASES:
        return "purchases";
      case MarketplaceNavPage.USER_FOLLOWED:
        return "followed";
      case MarketplaceNavPage.USER_FEEDBACK:
        return "feedback";
      default:
        return "";
    }
  }
}
