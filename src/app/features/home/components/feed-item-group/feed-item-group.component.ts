import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from "@angular/core";
import { MainState } from "@app/store/state";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";

@Component({
  selector: "astrobin-feed-item-group",
  template: `
    <div class="feed-item-component feed-item-marketplace-listing">
      <div class="feed-item-header">
        <div class="feed-item-header-text">
          <div class="feed-item-header-text-1">
            {{ feedItem.actionObjectDisplayName }}
          </div>
        </div>
      </div>

      <div class="feed-item-body">
        <a
          [href]="classicRoutesService.GROUP(+feedItem.actionObjectObjectId)"
          class="main-image-container"
        >
          <img
            #image
            src="/assets/images/actstream-group-action.jpg"
            alt=""
            class="main-image"
            loading="lazy"
          />
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
    "./feed-item-group.component.scss"
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedItemGroupComponent extends BaseComponentDirective {
  @Input() feedItem: FeedItemInterface;
  @ViewChild("image") imageElement: ElementRef<HTMLImageElement>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }
}
