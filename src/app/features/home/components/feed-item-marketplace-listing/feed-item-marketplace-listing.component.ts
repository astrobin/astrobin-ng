import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
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
        <a
          [routerLink]="['/equipment/marketplace/listing', feedItem.actionObjectObjectId]"
          class="main-image-container"
        >
          <img
            #image
            [alt]="feedItem.actionObjectDisplayName"
            [src]="feedItem.image"
            loading="lazy"
            class="main-image"
          >
        </a>
      </div>

      <div class="feed-item-footer">
        <div class="feed-item-footer-text">
          <astrobin-feed-item-display-text [feedItem]="feedItem"></astrobin-feed-item-display-text>
        </div>

        <div class="feed-item-extra">
          <span class="timestamp">
            {{ feedItem.timestamp | localDate | timeago }}
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrls: [
    "../feed-item/feed-item.component.scss",
    "./feed-item-marketplace-listing.component.scss"
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedItemMarketplaceListingComponent extends BaseComponentDirective   {
  @Input() feedItem: FeedItemInterface;
  @ViewChild('image') imageElement: ElementRef<HTMLImageElement>;

  constructor(
    public readonly store$: Store<MainState>,
  ) {
    super(store$);
  }
}
