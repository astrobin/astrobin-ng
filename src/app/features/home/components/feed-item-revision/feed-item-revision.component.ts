import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-feed-item-revision",
  template: `
    <div class="feed-item-image">
      <img (click)="navigateToImage()" [src]="feedItem.image" alt="" loading="lazy" />
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
    // Implementation needed
  }
}
