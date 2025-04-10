import { OnChanges, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { MainState } from "@app/store/state";
import { ImageInterface } from "@core/interfaces/image.interface";
import { FeedItemInterface, FeedItemVerb } from "@features/home/interfaces/feed-item.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-feed-item",
  template: `
    <div class="feed-item-content">
      <astrobin-feed-item-image
        *ngIf="isImageFeedItem"
        (openImage)="openImage.emit($event)"
        [feedItem]="feedItem"
      ></astrobin-feed-item-image>

      <astrobin-feed-item-marketplace-listing
        *ngIf="isMarketplaceListingFeedItem"
        [feedItem]="feedItem"
      ></astrobin-feed-item-marketplace-listing>

      <astrobin-feed-item-group *ngIf="isGroupFeedItem" [feedItem]="feedItem"></astrobin-feed-item-group>
    </div>
  `,
  styleUrls: ["./feed-item.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedItemComponent extends BaseComponentDirective implements OnChanges {
  @Input() feedItem: FeedItemInterface;
  @Output() readonly openImage = new EventEmitter<ImageInterface["hash"] | ImageInterface["pk"]>();

  protected isImageFeedItem = false;
  protected isMarketplaceListingFeedItem = false;
  protected isGroupFeedItem = false;

  constructor(public readonly store$: Store<MainState>) {
    super(store$);
  }

  ngOnChanges(): void {
    this.isImageFeedItem =
      [
        FeedItemVerb.VERB_UPLOADED_IMAGE,
        FeedItemVerb.VERB_LIKED_IMAGE,
        FeedItemVerb.VERB_BOOKMARKED_IMAGE,
        FeedItemVerb.VERB_COMMENTED_IMAGE,
        FeedItemVerb.VERB_UPLOADED_REVISION
      ].indexOf(this.feedItem.verb) !== -1;

    this.isMarketplaceListingFeedItem =
      [FeedItemVerb.VERB_CREATED_MARKETPLACE_LISTING].indexOf(this.feedItem.verb) !== -1;

    this.isGroupFeedItem =
      [FeedItemVerb.VERB_JOINED_GROUP, FeedItemVerb.VERB_CREATED_PUBLIC_GROUP].indexOf(this.feedItem.verb) !== -1;
  }
}
