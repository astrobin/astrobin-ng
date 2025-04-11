import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-feed-item-revision",
  template: `
    <div class="feed-item-image">
      <img [src]="feedItem.image" (click)="navigateToImage()" alt="" loading="lazy" />
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
