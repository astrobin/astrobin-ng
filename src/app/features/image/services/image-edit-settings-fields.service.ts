import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import {
  DownloadLimitationOptions,
  FullSizeLimitationDisplayOptions,
  ImageRevisionInterface,
  LicenseOptions,
  MouseHoverImageOptions
} from "@shared/interfaces/image.interface";
import { ImageEditService, KeyValueTagsValidator } from "@features/image/services/image-edit.service";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { selectImageRevisionsForImage } from "@app/store/selectors/app/image-revision.selectors";
import { map, tap } from "rxjs/operators";
import { LoadImageRevisions } from "@app/store/actions/image.actions";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ImageEditFieldsBaseService } from "@features/image/services/image-edit-fields-base.service";

@Injectable({
  providedIn: null
})
export class ImageEditSettingsFieldsService extends ImageEditFieldsBaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService
  ) {
    super(loadingService);
  }

  onFieldsInitialized(): void {
  }

  getLicenseField(): FormlyFieldConfig {
    return {
      key: "license",
      type: "ng-select",
      id: "image-license-field",
      props: {
        required: true,
        clearable: false,
        label: this.translateService.instant("License"),
        description: this.translateService.instant(
          "You can associate a Creative Commons license with your content if you wish, to grant " +
          "people the right to use your work under certain circumstances. For more information on what your options " +
          "are, please visit the {{0}}Creative Commons website{{1}}.",
          {
            0: `<a target="_blank" href="https://creativecommons.org/choose/">`,
            1: `</a>`
          }
        ),
        options: [
          {
            value: LicenseOptions.ALL_RIGHTS_RESERVED,
            label: this.translateService.instant("None (All rights reserved)")
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE,
            label: this.translateService.instant("Attribution-NonCommercial-ShareAlike Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL,
            label: this.translateService.instant("Attribution-NonCommercial Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_NO_DERIVS,
            label: this.translateService.instant("Attribution-NonCommercial-NoDerivs Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION,
            label: this.translateService.instant("Attribution Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION_SHARE_ALIKE,
            label: this.translateService.instant("Attribution-ShareAlike Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION_NO_DERIVS,
            label: this.translateService.instant("Attribution-NoDerivs Creative Commons")
          }
        ]
      },
      validators: {
        validation: [{ name: "enum-value", options: { allowedValues: Object.values(LicenseOptions) } }]
      }
    };
  }

  getMouseHoverImageField(): FormlyFieldConfig {
    const image = this.imageEditService.model;

    this.store$.dispatch(new LoadImageRevisions({ imageId: image.pk }));
    const options = this.store$.select(selectImageRevisionsForImage, image.pk).pipe(
      distinctUntilChangedObj(),
      map(revisions => {
        const newOptions: {
          value: MouseHoverImageOptions | ImageRevisionInterface["label"];
          label: string;
          disabled?: boolean;
        }[] = [
          {
            value: MouseHoverImageOptions.NOTHING,
            label: this.translateService.instant("Nothing")
          },
          {
            value: MouseHoverImageOptions.SOLUTION,
            label: this.translateService.instant("Plate-solution annotations (if available)")
          },
          {
            value: MouseHoverImageOptions.INVERTED,
            label: this.translateService.instant("Inverted monochrome")
          }
        ];

        for (const revision of revisions) {
          const disabled = image.w !== revision.w || image.h !== revision.h;
          newOptions.push({
            value: `REVISION__${revision.label}`,
            label:
              this.translateService.instant("Revision") +
              `: ${revision.label} (${revision.w}x${revision.h}${
                disabled ? " " + this.translateService.instant("resolution not matching") : ""
              })`,
            disabled
          });
        }

        return newOptions;
      }),
      tap(newOptions => {
        const mouseHoverImageField = this.getMouseHoverImageField();
        mouseHoverImageField.props = {
          ...mouseHoverImageField.props,
          options: newOptions
        };
      })
    );

    return {
      key: "mouseHoverImage",
      type: "ng-select",
      id: "image-mouse-hover-image-field",
      props: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Mouse hover image"),
        description: this.translateService.instant(
          "Choose what will be displayed when somebody hovers the mouse over this image. Please note: only " +
          "revisions with the same width and height of your original image can be considered."
        ),
        options
      }
    };
  }

  getKeyValueTagsField(): FormlyFieldConfig {
    return {
      key: "keyValueTags",
      type: "textarea",
      wrappers: ["default-wrapper"],
      id: "image-key-value-tags-field",
      props: {
        label: this.translateService.instant("Key/value tags"),
        description:
          this.translateService.instant(
            "Provide a list of unique key/value pairs to tag this image with. Use the '=' symbol between key and " +
            "value, and provide one pair per line. These tags can be used to sort images by arbitrary properties."
          ) +
          " <a target='_blank' href='https://welcome.astrobin.com/image-collections'>" +
          this.translateService.instant("Learn more") +
          "</a>.",
        required: false,
        rows: 4
      },
      validators: {
        validation: [KeyValueTagsValidator]
      }
    };
  }

  getAllowCommentsField(): FormlyFieldConfig {
    return {
      key: "allowComments",
      type: "checkbox",
      id: "image-allow-comments-field",
      props: {
        label: this.translateService.instant("Allow comments")
      }
    };
  }

  getFullSizeDisplayLimitationField(): FormlyFieldConfig {
    return {
      key: "fullSizeDisplayLimitation",
      type: "ng-select",
      id: "image-full-size-display-limitation-field",
      props: {
        clearable: false,
        label: this.translateService.instant("Allow full-size display"),
        options: [
          {
            value: FullSizeLimitationDisplayOptions.EVERYBODY,
            label: this.translateService.instant("Everybody")
          },
          {
            value: FullSizeLimitationDisplayOptions.PAYING,
            label: this.translateService.instant("Paying members only")
          },
          {
            value: FullSizeLimitationDisplayOptions.MEMBERS,
            label: this.translateService.instant("Members only")
          },
          {
            value: FullSizeLimitationDisplayOptions.ME,
            label: this.translateService.instant("Me only")
          },
          {
            value: FullSizeLimitationDisplayOptions.NOBODY,
            label: this.translateService.instant("Nobody")
          }
        ]
      },
      validators: {
        validation: [{
          name: "enum-value",
          options: { allowedValues: Object.values(FullSizeLimitationDisplayOptions) }
        }]
      }
    };
  }

  getDownloadLimitationField(): FormlyFieldConfig {
    return {
      key: "downloadLimitation",
      type: "ng-select",
      id: "image-download-limitation-field",
      props: {
        clearable: false,
        label: this.translateService.instant("Display download menu"),
        options: [
          {
            value: DownloadLimitationOptions.EVERYBODY,
            label: this.translateService.instant("Everybody")
          },
          {
            value: DownloadLimitationOptions.ME_ONLY,
            label: this.translateService.instant("Me only")
          }
        ]
      },
      validators: {
        validation: [{ name: "enum-value", options: { allowedValues: Object.values(DownloadLimitationOptions) } }]
      }
    };
  }
}
