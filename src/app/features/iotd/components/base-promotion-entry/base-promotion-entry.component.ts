import { Component, Input, OnInit } from "@angular/core";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadSolution } from "@app/store/actions/solution.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { selectSolution } from "@app/store/selectors/app/solution.selectors";
import { State } from "@app/store/state";
import { PromotionImageInterface } from "@features/iotd/store/iotd.reducer";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { SolutionInterface } from "@shared/interfaces/solution.interface";
import { Observable } from "rxjs";
import { filter, switchMap, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-base-promotion-entry",
  template: ""
})
export abstract class BasePromotionEntryComponent extends BaseComponentDirective implements OnInit {
  ImageAlias = ImageAlias;
  solution$: Observable<SolutionInterface>;

  @Input()
  entry: PromotionImageInterface;

  protected constructor(public readonly store$: Store<State>) {
    super();
  }

  ngOnInit() {
    const contentTypeOptions = {
      appLabel: "astrobin",
      model: "image"
    };

    this.store$.dispatch(new LoadContentType(contentTypeOptions));

    this.solution$ = this.store$.select(selectContentType, contentTypeOptions).pipe(
      filter(contentType => !!contentType),
      tap(contentType =>
        this.store$.dispatch(new LoadSolution({ contentType: contentType.id, objectId: "" + this.entry.pk }))
      ),
      switchMap(contentType =>
        this.store$.select(selectSolution, { contentType: contentType.id, objectId: "" + this.entry.pk })
      )
    );
  }

  abstract isPromoted$(imageId: number): Observable<boolean>;

  abstract hide(imageId: number): void;

  abstract hideDisabled$(imageId: number): Observable<boolean>;

  abstract promote(imageId: number): void;

  abstract retractPromotion(imageId: number): void;

  viewFullscreen(imageId: number): void {
    this.store$.dispatch(new ShowFullscreenImage(imageId));
  }
}
