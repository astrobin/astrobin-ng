import { Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

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
        <a [href]="classicRoutesService.GROUP(+feedItem.actionObjectObjectId)">
          <img src="/assets/images/actstream-group-action.jpg" alt="" />
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
    "./feed-item-group.component.scss"
  ],
})
export class FeedItemGroupComponent extends BaseComponentDirective {
  @Input() feedItem: FeedItemInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }
}
