import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { DownloadLimitationOptions, FullSizeLimitationDisplayOptions, ImageInterface, ImageRevisionInterface, LicenseOptions, MouseHoverImageOptions } from "@shared/interfaces/image.interface";
import { ImageEditService, KeyValueTagsValidator } from "@features/image/services/image-edit.service";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ImageEditFieldsBaseService } from "@features/image/services/image-edit-fields-base.service";
import { ImageService } from "@shared/services/image/image.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Injectable({
  providedIn: null
})
export class ImageEditSettingsFieldsService extends ImageEditFieldsBaseService {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly imageEditService: ImageEditService,
    public readonly popNotificationsService: PopNotificationsService
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
            label: this.imageService.humanizeLicenseOption(LicenseOptions.ALL_RIGHTS_RESERVED)
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE,
            label: this.imageService.humanizeLicenseOption(LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE)
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL,
            label: this.imageService.humanizeLicenseOption(LicenseOptions.ATTRIBUTION_NON_COMMERCIAL)
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_NO_DERIVS,
            label: this.imageService.humanizeLicenseOption(LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_NO_DERIVS)
          },
          {
            value: LicenseOptions.ATTRIBUTION,
            label: this.imageService.humanizeLicenseOption(LicenseOptions.ATTRIBUTION)
          },
          {
            value: LicenseOptions.ATTRIBUTION_SHARE_ALIKE,
            label: this.imageService.humanizeLicenseOption(LicenseOptions.ATTRIBUTION_SHARE_ALIKE)
          },
          {
            value: LicenseOptions.ATTRIBUTION_NO_DERIVS,
            label: this.imageService.humanizeLicenseOption(LicenseOptions.ATTRIBUTION_NO_DERIVS)
          }
        ]
      },
      validators: {
        validation: [{ name: "enum-value", options: { allowedValues: Object.values(LicenseOptions) } }]
      }
    };
  }

  basicMouseHoverOptions(): { value: MouseHoverImageOptions | string, label: string, disabled?: boolean }[] {
    return [
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
  }

  additionalMouseHoverOptions(
    sourceImageOrRevision: Partial<ImageInterface> | Partial<ImageRevisionInterface>,
    revisions: ImageRevisionInterface[]
  ): { value: MouseHoverImageOptions | string, label: string, disabled?: boolean }[] {
    const options: { value: MouseHoverImageOptions | string, label: string, disabled?: boolean }[] = [];

    for (const revision of revisions) {
      const disabled = sourceImageOrRevision.w !== revision.w || sourceImageOrRevision.h !== revision.h;
      options.push({
        value: `REVISION__${revision.label}`,
        label:
          this.translateService.instant("Revision") +
          `: ${revision.label} (${revision.w}x${revision.h}${
            disabled ? " " + this.translateService.instant("resolution not matching") : ""
          })`,
        disabled
      });
    }

    return options;
  }

  mouseHoverImageLabel(): string {
    return this.translateService.instant("Mouse hover image");
  }

  mouseHoverImageDescription(): string {
    return  this.translateService.instant(
      "Choose what will be displayed when somebody hovers the mouse over this image. Please note: only " +
      "revisions with the same width and height of your original image can be considered."
    );
  }

  getMouseHoverImageField(): FormlyFieldConfig {
    const image = this.imageEditService.model;
    const revisions = image.revisions || [];

    const options: {
      value: MouseHoverImageOptions | string;
      label: string;
      disabled?: boolean;
    }[] = this.basicMouseHoverOptions();

    const additionalOptions: {
      value: MouseHoverImageOptions | string;
      label: string;
      disabled?: boolean;
    }[] = this.additionalMouseHoverOptions(image, revisions);

    return {
      key: "mouseHoverImage",
      type: "ng-select",
      id: "image-mouse-hover-image-field",
      props: {
        required: true,
        clearable: false,
        label: this.mouseHoverImageLabel(),
        description: this.mouseHoverImageDescription(),
        options: [...options, ...additionalOptions]
      }
    };
  }

  getLoopVideoField(): FormlyFieldConfig {
    return {
      key: "loopVideo",
      type: "checkbox",
      id: "image-loop-video-field",
      props: {
        label: this.translateService.instant("Loop video"),
        description: this.translateService.instant(
          "If checked, the video will loop."
        )
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
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges.subscribe(value => {
            if (value !== FullSizeLimitationDisplayOptions.EVERYBODY) {
              this.popNotificationsService.info(
                this.translateService.instant(
                  "Please note: if you submit this image for IOTD/TP consideration, it will be displayed in full size " +
                  "to members of the IOTD/TP staff, regardless of this setting. This is necessary for them to evaluate " +
                  "the image properly."
                )
              );
            }
          });
        }
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
