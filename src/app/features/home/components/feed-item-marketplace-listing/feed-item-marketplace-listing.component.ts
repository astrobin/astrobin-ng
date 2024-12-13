import { Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";

@Component({
  selector: "astrobin-feed-item-marketplace-listing",
  template: `
    <div class="feed-item-component feed-item-marketplace-listing">
      <div class="feed-item-header">
        <img
          class="feed-item-avatar"
          [alt]="feedItem.actionObjectDisplayName"
          [ngSrc]="feedItem.actorAvatar"
          width="60"
          height="60"
        >

        <div class="feed-item-header-text">
          <div class="feed-item-header-text-1">
            {{ feedItem.actionObjectDisplayName }}
          </div>
          <div class="feed-item-header-text-2">
            <a [routerLink]="['/u', feedItem.actionObjectUserUsername]">
              {{ feedItem.actionObjectUserDisplayName }}
            </a>
          </div>
        </div>
      </div>

      <div class="feed-item-body">
        <a [routerLink]="['/equipment/marketplace/listing', feedItem.actionObjectObjectId]">
          <img
            [alt]="feedItem.actionObjectDisplayName"
            [src]="feedItem.image"
            [style.aspect-ratio]="feedItem.imageW && feedItem.imageH ? feedItem.imageW / feedItem.imageH : 1"
          >
        </a>
      </div>

      <div class="feed-item-footer">
        <div class="feed-item-footer-text">
          <astrobin-feed-item-display-text [feedItem]="feedItem"></astrobin-feed-item-display-text>
        </div>
      </div>
    </div>
  `,
  styleUrls: [
    "../feed-item/feed-item.component.scss",
    "./feed-item-marketplace-listing.component.scss"
  ],
})
export class FeedItemMarketplaceListingComponent extends BaseComponentDirective {
  @Input() feedItem: FeedItemInterface;

  constructor(
    public readonly store$: Store<MainState>,
  ) {
    super(store$);
  }
}
