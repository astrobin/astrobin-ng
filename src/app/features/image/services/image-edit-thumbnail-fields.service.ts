import { Injectable } from "@angular/core";
import { LoadingService } from "@core/services/loading.service";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { catchError, map, retry } from "rxjs/operators";
import { EMPTY } from "rxjs";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ImageEditFieldsBaseService } from "@features/image/services/image-edit-fields-base.service";

@Injectable({
  providedIn: null
})
export class ImageEditThumbnailFieldsService extends ImageEditFieldsBaseService {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(loadingService);
  }

  onFieldsInitialized(): void {
  }

  getThumbnailField(): FormlyFieldConfig {
    return {
      key: "squareCropping",
      type: "image-cropper",
      id: "image-cropper-field",
      props: {
        required: false,
        description: this.translateService.instant(
          "Select an area of the image to be used as thumbnail in your gallery."
        ),
        image: this.imageEditService.model,
        thumbnailURL$: this.store$
          .select(selectThumbnail, {
            id: this.imageEditService.model.pk,
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
            retry({ count: 600, delay: 2000 }),
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

  getSharpenThumbnailsField(): FormlyFieldConfig {
    return {
      key: "sharpenThumbnails",
      type: "checkbox",
      id: "image-sharpen-thumbnails-field",
      props: {
        label: this.translateService.instant("Sharpen thumbnails"),
        description: this.translateService.instant(
          "If selected, AstroBin will use a resizing algorithm that slightly sharpens the image's thumbnails. " +
          "This setting applies to all revisions."
        )
      }
    };
  }
}
