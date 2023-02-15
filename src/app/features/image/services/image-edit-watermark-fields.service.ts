import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { WatermarkPositionOptions, WatermarkSizeOptions } from "@shared/interfaces/image.interface";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Subscription } from "rxjs";
import { ImageEditFieldsBaseService } from "@features/image/services/image-edit-fields-base.service";

@Injectable({
  providedIn: null
})
export class ImageEditWatermarkFieldsService extends ImageEditFieldsBaseService {
  private _watermarkTextValueChangesSubscription: Subscription;
  private _watermarkPositionValueChangesSubscription: Subscription;
  private _watermarkTextSizeValueChangesSubscription: Subscription;
  private _watermarkTextOpacityValueChangesSubscription: Subscription;

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

  getWatermarkCheckboxField(): FormlyFieldConfig {
    return {
      key: "watermark",
      type: "checkbox",
      id: "image-watermark-field",
      props: {
        required: true,
        label: this.translateService.instant("Apply watermark to image"),
        description:
          this.translateService.instant(
            "AstroBin can protect your images from theft by applying a watermark to them."
          ) + this.translateService.instant("Please note: animated GIFs cannot be watermarked at this time.")
      }
    };
  }

  getWatermarkTextField(): FormlyFieldConfig {
    return {
      key: "watermarkText",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-watermark-text-field",
      props: {
        label: this.translateService.instant("Text")
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!!this._watermarkTextValueChangesSubscription) {
            this._watermarkTextValueChangesSubscription.unsubscribe();
          }

          this._watermarkTextValueChangesSubscription = field.formControl.valueChanges.subscribe(() => {
            this._setWatermarkTrue();
          });
        },
        onDestroy: () => {
          this._watermarkTextValueChangesSubscription.unsubscribe();
          this._watermarkTextValueChangesSubscription = undefined;
        }
      }
    };
  }

  getWatermarkPosition(): FormlyFieldConfig {
    return {
      key: "watermarkPosition",
      type: "ng-select",
      id: "image-watermark-position-field",
      props: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Position"),
        options: [
          {
            value: WatermarkPositionOptions.CENTER,
            label: this.translateService.instant("Center")
          },
          {
            value: WatermarkPositionOptions.TOP_LEFT,
            label: this.translateService.instant("Top left")
          },
          {
            value: WatermarkPositionOptions.TOP_CENTER,
            label: this.translateService.instant("Top center")
          },
          {
            value: WatermarkPositionOptions.TOP_RIGHT,
            label: this.translateService.instant("Top right")
          },
          {
            value: WatermarkPositionOptions.BOTTOM_LEFT,
            label: this.translateService.instant("Bottom left")
          },
          {
            value: WatermarkPositionOptions.BOTTOM_CENTER,
            label: this.translateService.instant("Bottom center")
          },
          {
            value: WatermarkPositionOptions.BOTTOM_RIGHT,
            label: this.translateService.instant("Bottom right")
          }
        ]
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!!this._watermarkPositionValueChangesSubscription) {
            this._watermarkPositionValueChangesSubscription.unsubscribe();
          }

          this._watermarkPositionValueChangesSubscription = field.formControl.valueChanges.subscribe(() => {
            this._setWatermarkTrue();
          });
        },
        onDestroy: () => {
          this._watermarkPositionValueChangesSubscription.unsubscribe();
          this._watermarkPositionValueChangesSubscription = undefined;
        }
      }
    };
  }

  getWatermarkTextSize(): FormlyFieldConfig {
    return {
      key: "watermarkSize",
      type: "ng-select",
      id: "image-watermark-size-field",
      props: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Size"),
        description: this.translateService.instant("The final font size will depend on how long your watermark is."),
        options: [
          {
            value: WatermarkSizeOptions.SMALL,
            label: this.translateService.instant("Small")
          },
          {
            value: WatermarkSizeOptions.MEDIUM,
            label: this.translateService.instant("Medium")
          },
          {
            value: WatermarkSizeOptions.LARGE,
            label: this.translateService.instant("Large")
          }
        ]
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!!this._watermarkTextSizeValueChangesSubscription) {
            this._watermarkTextSizeValueChangesSubscription.unsubscribe();
          }

          this._watermarkTextSizeValueChangesSubscription = field.formControl.valueChanges.subscribe(() => {
            this._setWatermarkTrue();
          });
        },
        onDestroy: () => {
          this._watermarkTextSizeValueChangesSubscription.unsubscribe();
          this._watermarkTextSizeValueChangesSubscription = undefined;
        }
      }
    };
  }

  getWatermarkTextOpacity(): FormlyFieldConfig {
    return {
      key: "watermarkOpacity",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-watermark-opacity-field",
      props: {
        type: "number",
        min: 0,
        max: 100,
        label: this.translateService.instant("Opacity") + " (%)",
        description: this.translateService.instant(
          "0 means invisible; 100 means completely opaque. Recommended values are: 10 if the watermark will appear on the dark sky background, 50 if on some bright object."
        )
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!!this._watermarkTextOpacityValueChangesSubscription) {
            this._watermarkTextOpacityValueChangesSubscription.unsubscribe();
          }

          this._watermarkTextOpacityValueChangesSubscription = field.formControl.valueChanges.subscribe(() => {
            this._setWatermarkTrue();
          });
        },
        onDestroy: () => {
          this._watermarkTextOpacityValueChangesSubscription.unsubscribe();
          this._watermarkTextOpacityValueChangesSubscription = undefined;
        }
      }
    };
  }

  private _setWatermarkTrue(): void {
    this.imageEditService.model = {
      ...this.imageEditService.model,
      watermark: true
    };
  }
}
