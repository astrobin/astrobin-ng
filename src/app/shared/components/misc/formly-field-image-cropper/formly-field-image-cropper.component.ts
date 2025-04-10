import { isPlatformBrowser } from "@angular/common";
import { ChangeDetectorRef, OnDestroy, Component, Inject, PLATFORM_ID } from "@angular/core";
import { MainState } from "@app/store/state";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { ImageEditorSetCropperShown } from "@features/image/store/image.actions";
import { selectImageEditorState } from "@features/image/store/image.selectors";
import { Store } from "@ngrx/store";
import { FieldType } from "@ngx-formly/core";
import { CropperPosition, Dimensions, ImageCroppedEvent, LoadedImage } from "ngx-image-cropper";
import { Subscription, fromEvent } from "rxjs";
import { debounceTime, filter, map, take, tap } from "rxjs/operators";

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
  firstReset = false;
  showCropper$ = this.store$.select(selectImageEditorState).pipe(
    map(state => state.cropperShown),
    tap(cropperShown => {
      if (cropperShown) {
        this.onCropperReady(null);
      }
    })
  );

  private readonly _resizeEventSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationService: PopNotificationsService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();

    if (isPlatformBrowser(platformId)) {
      this._resizeEventSubscription = fromEvent(window, "resize")
        .pipe(debounceTime(100))
        .subscribe(() => {
          this.showCropper$
            .pipe(
              take(1),
              filter(showCropper => showCropper)
            )
            .subscribe(() => {
              this._reset();

              const document = this.windowRefService.nativeWindow.document;
              if (document && !("ontouchend" in document)) {
                this.popNotificationService.info("As you resized your window, please check your image crop again.");
              }
            });
        });
    }
  }

  ngOnDestroy() {
    if (!!this._resizeEventSubscription) {
      this._resizeEventSubscription.unsubscribe();
    }
  }

  onCropperReady(dimensions: Dimensions) {
    const image: ImageInterface | ImageRevisionInterface = this.props.image;

    if (!dimensions) {
      return;
    }

    if (image.squareCropping && image.squareCropping !== "") {
      this.ratio = image.w / dimensions.width;

      this.cropper = {
        x1: parseInt(image.squareCropping.split(",")[0], 10) / this.ratio,
        y1: parseInt(image.squareCropping.split(",")[1], 10) / this.ratio,
        x2: parseInt(image.squareCropping.split(",")[2], 10) / this.ratio,
        y2: parseInt(image.squareCropping.split(",")[3], 10) / this.ratio
      };
    } else {
      const w = image.w;
      const h = image.h;
      const size = Math.min(w, h);

      // Calculate the coordinates of the top left corner of the square
      const x1 = (w - size) / 2;
      const y1 = (h - size) / 2;

      // Calculate the coordinates of the bottom right corner of the square
      const x2 = x1 + size;
      const y2 = y1 + size;

      this.cropper = {
        x1,
        y1,
        x2,
        y2
      };
      this.formControl.setValue(`${x1},${y1},${x2},${y2}`);
    }
  }

  onImageCropped(event: ImageCroppedEvent) {
    if (!this.ratio) {
      return;
    }

    const x1 = Math.round(event.cropperPosition.x1 * this.ratio);
    const y1 = Math.round(event.cropperPosition.y1 * this.ratio);
    const x2 = Math.round(event.cropperPosition.x2 * this.ratio);
    const y2 = Math.round(event.cropperPosition.y2 * this.ratio);

    this.formControl.setValue(`${x1},${y1},${x2},${y2}`);
    if (!this.firstReset) {
      this._reset();
      this.firstReset = true;
    }
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
