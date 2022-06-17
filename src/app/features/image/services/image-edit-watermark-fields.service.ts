import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { WatermarkPositionOptions, WatermarkSizeOptions } from "@shared/interfaces/image.interface";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

@Injectable({
  providedIn: null
})
export class ImageEditWatermarkFieldsService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService
  ) {
    super(loadingService);
  }

  getWatermarkCheckboxField(): any {
    return {
      key: "watermark",
      type: "checkbox",
      id: "image-watermark-field",
      templateOptions: {
        required: true,
        label: this.translateService.instant("Apply watermark to image"),
        description:
          this.translateService.instant(
            "AstroBin can protect your images from theft by applying a watermark to them."
          ) + this.translateService.instant("Please note: animated GIFs cannot be watermarked at this time.")
      }
    };
  }

  getWatermarkTextField(): any {
    return {
      key: "watermarkText",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-watermark-text-field",
      templateOptions: {
        label: this.translateService.instant("Text")
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges.subscribe(() => {
            this._setWatermarkTrue();
          });
        }
      }
    };
  }

  getWatermarkPosition(): any {
    return {
      key: "watermarkPosition",
      type: "ng-select",
      id: "image-watermark-position-field",
      templateOptions: {
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
          field.formControl.valueChanges.subscribe(() => {
            this._setWatermarkTrue();
          });
        }
      }
    };
  }

  getWatermarkTextSize(): any {
    return {
      key: "watermarkSize",
      type: "ng-select",
      id: "image-watermark-size-field",
      templateOptions: {
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
          field.formControl.valueChanges.subscribe(() => {
            this._setWatermarkTrue();
          });
        }
      }
    };
  }

  getWatermarkTextOpacity(): any {
    return {
      key: "watermarkOpacity",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-watermark-opacity-field",
      templateOptions: {
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
          field.formControl.valueChanges.subscribe(() => {
            this._setWatermarkTrue();
          });
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
