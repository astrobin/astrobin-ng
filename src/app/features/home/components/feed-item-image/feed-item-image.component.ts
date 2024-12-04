import { Component, Input, ViewContainerRef } from "@angular/core";
import { MainState } from "@app/store/state";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { FeedItemInterface, FeedItemVerb } from "@features/home/interfaces/feed-item.interface";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { ImageViewerService } from "@shared/services/image-viewer.service";

@Component({
  selector: "astrobin-feed-item-image",
  template: `
    <div class="feed-item-image">
      <div class="feed-item-header">
        <img
          class="feed-item-avatar"
          [alt]="feedItem.actionObjectDisplayName || feedItem.targetUserDisplayName"
          [ngSrc]="feedItem.actionObjectUserAvatar || feedItem.targetUserAvatar"
          width="60"
          height="60"
        >

        <div class="feed-item-header-text">
          <div class="feed-item-header-text-1">
            {{ feedItem.actionObjectDisplayName || feedItem.targetDisplayName }}
          </div>
          <div class="form-item-header-text-2">
            <a [routerLink]="['/u', feedItem.actionObjectUserUsername || feedItem.targetUserUsername]">
              {{ feedItem.actionObjectUserDisplayName || feedItem.targetUserDisplayName }}
            </a>
          </div>
        </div>
      </div>

      <div class="feed-item-body">
        <img
          (click)="openImage()"
          [alt]="feedItem.actionObjectDisplayName || feedItem.targetUserDisplayName"
          [src]="feedItem.image"
        >
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
    "./feed-item-image.component.scss"
  ],
})
export class FeedItemImageComponent extends BaseComponentDirective {
  @Input() feedItem: FeedItemInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef,
  ) {
    super(store$);
  }

  openImage(): void {
    this.imageViewerService.openSlideshow(
      this.componentId,
      this._getImageId(),
      FINAL_REVISION_LABEL,
      [],
      this.viewContainerRef,
      true
    ).subscribe();
  }

  _getImageId(): string {
    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
      case FeedItemVerb.VERB_LIKED_IMAGE:
      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        return this.feedItem.actionObjectObjectId;
      case FeedItemVerb.VERB_UPLOADED_REVISION:
      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        return this.feedItem.targetObjectId;
      default:
        return null;
    }
  }
}
