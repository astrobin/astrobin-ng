import { ChangeDetectorRef, OnChanges, ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";
import { selectNestedCommentsByContentTypeIdAndObjectId } from "@app/store/selectors/app/nested-comments.selectors";
import { MainState } from "@app/store/state";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Subscription } from "rxjs";
import { filter, map, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-nested-comments-count",
  template: ` <span class="count">{{ count }}</span> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestedCommentsCountComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  contentType: ContentTypeInterface;

  @Input()
  objectId: number;

  @Input()
  hideZero = false;

  @HostBinding("class.d-none")
  hide = false;

  protected count: number;

  private _storeSubscription: Subscription;

  constructor(public readonly store$: Store<MainState>, public readonly changeDetectorRef: ChangeDetectorRef) {
    super(store$);
  }

  ngOnChanges() {
    if (!this.contentType || !this.objectId) {
      return;
    }

    if (this._storeSubscription) {
      this._storeSubscription.unsubscribe();
    }

    // Assume that the nested comments are already loaded.
    this._storeSubscription = this.store$
      .select(selectNestedCommentsByContentTypeIdAndObjectId(this.contentType.id, this.objectId))
      .pipe(
        filter(nestedComments => nestedComments !== null),
        map(nestedComments => nestedComments.length),
        tap(count => {
          this.count = count;
          this.hide = count === 0 && this.hideZero;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }
}
