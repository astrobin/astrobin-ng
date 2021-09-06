import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CameraInterface, CameraType } from "@features/equipment/interfaces/camera.interface";
import { TranslateService } from "@ngx-translate/core";

export enum CameraDisplayProperty {
  TYPE,
  COOLED,
  MAX_COOLING,
  BACK_FOCUS
}

@Injectable({
  providedIn: "root"
})
export class CameraService extends BaseService implements EquipmentItemServiceInterface {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly utilsService: UtilsService,
    public readonly translateService: TranslateService
  ) {
    super(loadingService);
  }

  humanizeType(type: CameraType) {
    switch (type) {
      case CameraType.DEDICATED_DEEP_SKY:
        return this.translateService.instant("Dedicated deep-sky camera");
      case CameraType.DSLR_MIRRORLESS:
        return this.translateService.instant("General purpose DSLR or mirrorless camera");
      case CameraType.GUIDER_PLANETARY:
        return this.translateService.instant("Guider or planetary camera");
      case CameraType.VIDEO:
        return this.translateService.instant("General purpose video camera");
      case CameraType.FILM:
        return this.translateService.instant("Film camera");
    }
  }

  getPrintableProperty(item: CameraInterface, property: CameraDisplayProperty): string {
    switch (property) {
      case CameraDisplayProperty.TYPE:
        return this.humanizeType(item.type);
      case CameraDisplayProperty.COOLED:
        return this.utilsService.yesNo(item.cooled);
      case CameraDisplayProperty.MAX_COOLING:
        return item.maxCooling ? `${item.maxCooling} &deg;C` : "";
      case CameraDisplayProperty.BACK_FOCUS:
        return item.backFocus ? `${item.backFocus} mm` : "";
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }
}
