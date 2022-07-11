import { Component, OnDestroy } from "@angular/core";
import { State } from "@app/store/state";
import { ImageEditorSetCropperShown } from "@features/image/store/image.actions";
import { selectImageEditorState } from "@features/image/store/image.selectors";
import { Store } from "@ngrx/store";
import { FieldType } from "@ngx-formly/core";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CropperPosition, Dimensions, ImageCroppedEvent, LoadedImage } from "ngx-image-cropper";
import { fromEvent, interval, Subscription } from "rxjs";
import { debounceTime, filter, map, take } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-formly-field-image-cropper",
  templateUrl: "./formly-field-image-cropper.component.html",
  styleUrls: ["./formly-field-image-cropper.component.scss"]
})
export class FormlyFieldImageCropperComponent extends FieldType implements OnDestroy {
  cropper: CropperPosition = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  };
  ratio: number;
  cropperReady = false;
  showCropper$ = this.store$.select(selectImageEditorState).pipe(map(state => state.cropperShown));

  private resizeEventSubscription: Subscription;

  constructor(
    public readonly store$: Store<State>,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationService: PopNotificationsService,
    public readonly utilsService: UtilsService
  ) {
    super();

    this.resizeEventSubscription = fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.showCropper$
          .pipe(
            take(1),
            filter(showCropper => showCropper)
          )
          .subscribe(() => {
            this._reset();
            this.popNotificationService.info("As you resized your window, please check your image crop again.");
          });
      });
  }

  ngOnDestroy() {
    this.resizeEventSubscription.unsubscribe();
  }

  onCropperReady(dimensions: Dimensions) {
    const image = this.to.image;

    this.ratio = image.w / dimensions.width;

    this.cropper = {
      x1: image.squareCropping.split(",")[0] / this.ratio,
      y1: image.squareCropping.split(",")[1] / this.ratio,
      x2: image.squareCropping.split(",")[2] / this.ratio,
      y2: image.squareCropping.split(",")[3] / this.ratio
    };
  }

  onImageCropped(event: ImageCroppedEvent) {
    const x1 = Math.round(event.cropperPosition.x1 * this.ratio);
    const y1 = Math.round(event.cropperPosition.y1 * this.ratio);
    const x2 = Math.round(event.cropperPosition.x2 * this.ratio);
    const y2 = Math.round(event.cropperPosition.y2 * this.ratio);

    this.formControl.setValue(`${x1},${y1},${x2},${y2}`);
  }

  onImageLoaded(imageLoaded: LoadedImage) {
    this.cropperReady = true;
  }

  private _reset() {
    this.store$.dispatch(new ImageEditorSetCropperShown(false));
    this.utilsService.delay(100).subscribe(() => {
      this.store$.dispatch(new ImageEditorSetCropperShown(true));
    });
  }
}
