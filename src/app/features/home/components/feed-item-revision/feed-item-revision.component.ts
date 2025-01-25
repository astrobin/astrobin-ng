import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";

@Component({
  selector: "astrobin-feed-item-revision",
  template: `
    <div class="feed-item-image">
      <img
        (click)="navigateToImage()"
        [src]="feedItem.image"
        alt=""
      >
    </div>
  `,
  styleUrls: ["./feed-item-revision.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedItemRevisionComponent extends BaseComponentDirective {
  @Input() feedItem: FeedItemInterface;

  constructor(public readonly store$: Store<MainState>) {
    super(store$);
  }

  navigateToImage(): void {
    const imageId = this.feedItem.actionObjectObjectId;
  }
}
