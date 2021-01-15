import { Component, Input, OnInit } from "@angular/core";
import { ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadSolution } from "@app/store/actions/solution.actions";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { selectSolution } from "@app/store/selectors/app/solution.selectors";
import { State } from "@app/store/state";
import { HideImage, ShowImage } from "@features/iotd/store/iotd.actions";
import { PromotionImageInterface } from "@features/iotd/store/iotd.reducer";
import { selectHiddenImageByImageId } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { SolutionInterface } from "@shared/interfaces/solution.interface";
import { Observable } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";

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
    this.solution$ = this.store$.select(selectApp).pipe(
      take(1),
      map(state => state.backendConfig.IMAGE_CONTENT_TYPE_ID),
      tap(contentTypeId =>
        this.store$.dispatch(new LoadSolution({ contentType: contentTypeId, objectId: "" + this.entry.pk }))
      ),
      switchMap(contentTypeId =>
        this.store$.select(selectSolution, { contentType: contentTypeId, objectId: "" + this.entry.pk })
      )
    );
  }

  isHidden$(imageId: number): Observable<boolean> {
    return this.store$.select(selectHiddenImageByImageId, imageId).pipe(map(hiddenImage => !!hiddenImage));
  }

  hide(imageId: number): void {
    this.store$.dispatch(new HideImage({ id: imageId }));
  }

  show(imageId: number): void {
    this.store$
      .select(selectHiddenImageByImageId, imageId)
      .pipe(take(1))
      .subscribe(hiddenImage => this.store$.dispatch(new ShowImage({ hiddenImage })));
  }

  abstract isPromoted$(imageId: number): Observable<boolean>;

  abstract hideDisabled$(imageId: number): Observable<boolean>;

  abstract promote(imageId: number): void;

  abstract retractPromotion(imageId: number): void;

  viewFullscreen(imageId: number): void {
    this.store$.dispatch(new ShowFullscreenImage(imageId));
  }
}
