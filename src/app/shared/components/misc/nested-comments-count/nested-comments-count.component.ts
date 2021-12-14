import { Component, HostBinding, Input, OnChanges } from "@angular/core";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Observable } from "rxjs";
import { LoadNestedComments } from "@app/store/actions/nested-comments.actions";
import { selectNestedCommentsByContentTypeIdAndObjectId } from "@app/store/selectors/app/nested-comments.selectors";
import { map, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-nested-comments-count",
  templateUrl: "./nested-comments-count.component.html"
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

  count$: Observable<number>;

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }

  ngOnChanges() {
    if (!this.contentType || !this.objectId) {
      return;
    }

    const data = { contentTypeId: this.contentType.id, objectId: this.objectId };
    this.store$.dispatch(new LoadNestedComments(data));
    this.count$ = this.store$.select(selectNestedCommentsByContentTypeIdAndObjectId, data).pipe(
      takeUntil(this.destroyed$),
      map(nestedComments => nestedComments.length),
      tap(count => (this.hide = count === 0 && this.hideZero))
    );
  }
}
