import { Injectable } from "@angular/core";
import { MainState } from "@app/store/state";
import { LoadingService } from "@core/services/loading.service";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { ImageEditFieldsBaseService } from "@features/image/services/image-edit-fields-base.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";

@Injectable({
  providedIn: null
})
export class ImageEditEquipmentFieldsService extends ImageEditFieldsBaseService {
  creationMode = false;

  private _getGuidingTelescopesSubscription: Subscription;
  private _getGuidingCamerasSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService
  ) {
    super(loadingService);
  }

  onFieldsInitialized(): void {}

  getImagingTelescopes(componentId: string): FormlyFieldConfig {
    return {
      key: "imagingTelescopes2",
      type: "equipment-item-browser",
      id: "image-imaging-telescopes-field",
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Acquisition telescopes or lenses"),
        itemType: EquipmentItemType.TELESCOPE,
        usageType: EquipmentItemUsageType.IMAGING,
        quickAddRecentFromUserId: this.imageEditService.model.user,
        showPlaceholderImage: true,
        creationModeStarted: () => (this.creationMode = true),
        creationModeEnded: () => (this.creationMode = false),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId
      }
    };
  }

  getImagingCameras(componentId: string): FormlyFieldConfig {
    return {
      key: "imagingCameras2",
      type: "equipment-item-browser",
      id: "image-imaging-cameras-field",
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Acquisition cameras"),
        itemType: EquipmentItemType.CAMERA,
        usageType: EquipmentItemUsageType.IMAGING,
        quickAddRecentFromUserId: this.imageEditService.model.user,
        showPlaceholderImage: true,
        creationModeStarted: () => (this.creationMode = true),
        creationModeEnded: () => (this.creationMode = false),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId
      }
    };
  }

  getMounts(componentId: string): FormlyFieldConfig {
    return {
      key: "mounts2",
      type: "equipment-item-browser",
      id: "image-mounts-field",
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Mounts"),
        itemType: EquipmentItemType.MOUNT,
        quickAddRecentFromUserId: this.imageEditService.model.user,
        showPlaceholderImage: true,
        creationModeStarted: () => (this.creationMode = true),
        creationModeEnded: () => (this.creationMode = false),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId
      }
    };
  }

  getFilters(componentId: string): FormlyFieldConfig {
    return {
      key: "filters2",
      type: "equipment-item-browser",
      id: "image-filters-field",
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Filters"),
        itemType: EquipmentItemType.FILTER,
        quickAddRecentFromUserId: this.imageEditService.model.user,
        showPlaceholderImage: true,
        creationModeStarted: () => (this.creationMode = true),
        creationModeEnded: () => (this.creationMode = false),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId
      }
    };
  }

  getAccessories(componentId: string): FormlyFieldConfig {
    return {
      key: "accessories2",
      type: "equipment-item-browser",
      id: "image-accessories-field",
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Accessories"),
        itemType: EquipmentItemType.ACCESSORY,
        quickAddRecentFromUserId: this.imageEditService.model.user,
        showPlaceholderImage: true,
        creationModeStarted: () => (this.creationMode = true),
        creationModeEnded: () => (this.creationMode = false),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId
      }
    };
  }

  getSoftware(componentId: string): FormlyFieldConfig {
    return {
      key: "software2",
      type: "equipment-item-browser",
      id: "image-software-field",
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Software"),
        itemType: EquipmentItemType.SOFTWARE,
        quickAddRecentFromUserId: this.imageEditService.model.user,
        showPlaceholderImage: true,
        creationModeStarted: () => (this.creationMode = true),
        creationModeEnded: () => (this.creationMode = false),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId
      }
    };
  }

  getShowGuidingEquipment(): FormlyFieldConfig {
    return {
      className: "d-block mb-4 pb-2 pt-4 pl-lg-5 ml-lg-4 ml-xl-5 ",
      key: "showGuidingEquipment",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      id: "image-show-guiding-equipment-field",
      defaultValue:
        (this.imageEditService.model.guidingTelescopes2 && this.imageEditService.model.guidingTelescopes2.length > 0) ||
        (this.imageEditService.model.guidingCameras2 && this.imageEditService.model.guidingCameras2.length > 0),
      props: {
        required: false,
        label: this.translateService.instant("Show guiding equipment")
      }
    };
  }

  getGuidingTelescopes(componentId: string): FormlyFieldConfig {
    return {
      key: "guidingTelescopes2",
      type: "equipment-item-browser",
      id: "image-guiding-telescopes-field",
      hideExpression: () => !this.imageEditService.model.showGuidingEquipment,
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Guiding telescopes or lenses"),
        itemType: EquipmentItemType.TELESCOPE,
        usageType: EquipmentItemUsageType.GUIDING,
        quickAddRecentFromUserId: this.imageEditService.model.user,
        showPlaceholderImage: true,
        creationModeStarted: () => (this.creationMode = true),
        creationModeEnded: () => (this.creationMode = false),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!!this._getGuidingTelescopesSubscription) {
            this._getGuidingTelescopesSubscription.unsubscribe();
          }

          this._getGuidingTelescopesSubscription = field.formControl.valueChanges.subscribe(value => {
            if (value && value.length > 0) {
              this.imageEditService.model.showGuidingEquipment = true;
              // this.imageEditService.form.get("showGuidingEquipment").setValue(true);
            }
          });
        },
        onDestroy: () => {
          this._getGuidingTelescopesSubscription.unsubscribe();
          this._getGuidingTelescopesSubscription = undefined;
        }
      }
    };
  }

  getGuidingCameras(componentId: string): FormlyFieldConfig {
    return {
      key: "guidingCameras2",
      type: "equipment-item-browser",
      id: "image-guiding-cameras-field",
      hideExpression: () => !this.imageEditService.model.showGuidingEquipment,
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Guiding cameras"),
        itemType: EquipmentItemType.CAMERA,
        usageType: EquipmentItemUsageType.GUIDING,
        quickAddRecentFromUserId: this.imageEditService.model.user,
        creationModeStarted: () => (this.creationMode = true),
        creationModeEnded: () => (this.creationMode = false),
        showPlaceholderImage: true,
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!!this._getGuidingCamerasSubscription) {
            this._getGuidingCamerasSubscription.unsubscribe();
          }

          this._getGuidingCamerasSubscription = field.formControl.valueChanges.subscribe(value => {
            if (value && value.length > 0) {
              this.imageEditService.model.showGuidingEquipment = true;
              // this.imageEditService.form.get("showGuidingEquipment").setValue(true);
            }
          });
        },
        onDestroy: () => {
          this._getGuidingCamerasSubscription.unsubscribe();
          this._getGuidingCamerasSubscription = undefined;
        }
      }
    };
  }
}
