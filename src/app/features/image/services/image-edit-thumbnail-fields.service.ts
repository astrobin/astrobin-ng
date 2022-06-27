import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { BaseService } from "@shared/services/base.service";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { catchError, map } from "rxjs/operators";
import { retryWithDelay } from "rxjs-boost/lib/operators";
import { EMPTY } from "rxjs";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

@Injectable({
  providedIn: null
})
export class ImageEditThumbnailFieldsService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(loadingService);
  }

  getThumbnailField(): any {
    return {
      key: "squareCropping",
      type: "image-cropper",
      id: "image-cropper-field",
      templateOptions: {
        required: true,
        description: this.translateService.instant(
          "Select an area of the image to be used as thumbnail in your gallery."
        ),
        image: this.imageEditService.image,
        thumbnailURL$: this.store$
          .select(selectThumbnail, {
            id: this.imageEditService.image.pk,
            revision: "0",
            alias: ImageAlias.HD
          })
          .pipe(
            map(thumbnail => {
              if (!thumbnail) {
                throw new Error("THUMBNAIL_NOT_READY");
              }
              return `${thumbnail.url}?cache-block=true`;
            }),
            retryWithDelay(1000, 60),
            catchError(() => {
              this.popNotificationsService.error(
                "Timeout while loading the thumbnail, please refresh the page to try again!"
              );
              return EMPTY;
            })
          )
      }
    };
  }

  getSharpenThumbnailsField(): any {
    return {
      key: "sharpenThumbnails",
      type: "checkbox",
      id: "image-sharpen-thumbnails-field",
      templateOptions: {
        label: this.translateService.instant("Sharpen thumbnails"),
        description: this.translateService.instant(
          "If selected, AstroBin will use a resizing algorithm that slightly sharpens the image's thumbnails. " +
            "This setting applies to all revisions."
        )
      }
    };
  }
}
