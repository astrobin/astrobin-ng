import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CropperPosition, Dimensions, ImageCroppedEvent, LoadedImage } from "ngx-image-cropper";
import { OutputFormat } from "ngx-image-cropper/lib/interfaces/cropper-options.interface";
import { fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "astrobin-formly-field-image-cropper",
  templateUrl: "./formly-field-image-cropper.component.html",
  styleUrls: ["./formly-field-image-cropper.component.scss"]
})
export class FormlyFieldImageCropperComponent extends FieldType {
  cropper: CropperPosition = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  };
  ratio: number;
  cropperReady = false;
  showCropper = true;

  constructor(
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationService: PopNotificationsService
  ) {
    super();

    fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => {
        this._reset();
        this.popNotificationService.info("As you resized your window, please check your image crop again.");
      });
  }

  getFormat(url: string): OutputFormat {
    const ext = this.utilsService.fileExtension(url);

    if (["jpg", "jpeg"].indexOf(ext.toLowerCase()) > -1) {
      return "jpeg";
    }

    if (ext === "png") {
      return "png";
    }

    throw new Error("File type not supported by image cropper");
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
    this.showCropper = false;
    setTimeout(() => {
      this.showCropper = true;
    }, 250);
  }
}
