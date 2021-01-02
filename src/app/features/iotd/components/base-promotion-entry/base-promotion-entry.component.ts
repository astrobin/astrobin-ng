import { Component, Input } from "@angular/core";
import { ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { State } from "@app/store/state";
import { PromotionImageInterface } from "@features/iotd/store/iotd.reducer";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-base-promotion-entry",
  template: ""
})
export abstract class BasePromotionEntryComponent extends BaseComponentDirective {
  ImageAlias = ImageAlias;

  @Input()
  entry: PromotionImageInterface;

  protected constructor(public readonly store$: Store<State>) {
    super();
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
