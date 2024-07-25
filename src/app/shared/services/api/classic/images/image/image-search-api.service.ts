import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";

@Injectable({
  providedIn: "root"
})
export class ImageSearchApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/images/image-search";
  function;

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getFilterParamName(itemType: EquipmentItemType, usageType?: EquipmentItemUsageType): string | null {
    if (itemType === EquipmentItemType.SENSOR) {
      if (usageType === EquipmentItemUsageType.GUIDING) {
        return "guiding_sensors_id";
      } else if (usageType === EquipmentItemUsageType.IMAGING) {
        return "imaging_sensors_id";
      } else {
        return "all_sensors_id";
      }
    } else if (itemType === EquipmentItemType.CAMERA) {
      if (usageType === EquipmentItemUsageType.GUIDING) {
        return "guiding_cameras_2_id";
      } else if (usageType === EquipmentItemUsageType.IMAGING) {
        return "imaging_cameras_2_id";
      } else {
        return "all_cameras_2_id";
      }
    } else if (itemType === EquipmentItemType.TELESCOPE) {
      if (usageType === EquipmentItemUsageType.GUIDING) {
        return "guiding_telescopes_2_id";
      } else if (usageType === EquipmentItemUsageType.IMAGING) {
        return "imaging_telescopes_2_id";
      } else {
        return "all_telescopes_2_id";
      }
    } else if (itemType === EquipmentItemType.MOUNT) {
      return "mounts_2_id";
    } else if (itemType === EquipmentItemType.FILTER) {
      return "filters_2_id";
    } else if (itemType === EquipmentItemType.ACCESSORY) {
      return "accessories_2_id";
    } else if (itemType === EquipmentItemType.SOFTWARE) {
      return "software_2_id";
    } else {
      return null;
    }
  }


  search(options: SearchModelInterface): Observable<PaginatedApiResultInterface<ImageSearchInterface>> {
    let url = `${this.configUrl}/`;

    // Add or update the dynamic parameters
    Object.keys(options).forEach(key => {
      let value = (options as any)[key];
      if (value !== undefined && value !== null && value !== "") {
        let paramName: string | null = key;

        // Handle special cases for property names
        if (key === "itemType" && options.itemType !== undefined) {
          paramName = this.getFilterParamName(options.itemType, options.usageType);
          value = options.itemId; // Use itemId for the value in these special cases
        }

        if (paramName) {
          url = UtilsService.addOrUpdateUrlParam(url, UtilsService.camelCaseToSnakeCase(paramName), value.toString());
        }
      }
    });

    return this.http.get<PaginatedApiResultInterface<ImageSearchInterface>>(url);
  }
}
