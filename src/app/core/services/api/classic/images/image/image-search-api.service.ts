import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MainState } from "@app/store/state";
import { ImageSearchInterface } from "@core/interfaces/image-search.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { SearchPaginatedApiResultInterface } from "@core/services/api/interfaces/search-paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ImageSearchApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/images/image-search";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getFilterParamName(itemType: EquipmentItemType, usageType?: EquipmentItemUsageType): string | null {
    let usageTypePrefix = "";

    if (
      itemType === EquipmentItemType.TELESCOPE ||
      itemType === EquipmentItemType.CAMERA ||
      itemType === EquipmentItemType.SENSOR
    ) {
      if (usageType === EquipmentItemUsageType.GUIDING) {
        usageTypePrefix = "guiding_";
      } else if (usageType === EquipmentItemUsageType.IMAGING) {
        usageTypePrefix = "imaging_";
      } else {
        usageTypePrefix = "all_";
      }
    }

    return `${usageTypePrefix}${EquipmentItemType[itemType].toLowerCase()}_ids`;
  }

  search(options: SearchModelInterface): Observable<SearchPaginatedApiResultInterface<ImageSearchInterface>> {
    let url = `${this.configUrl}/`;

    // Handle special cases for property names before serialization
    if (options.itemType !== undefined) {
      const paramName = this.getFilterParamName(options.itemType, options.usageType);
      if (paramName) {
        options[paramName] = options.itemId; // Use itemId for the value in these special cases
        delete options.itemType;
        delete options.usageType;
        delete options.itemId;
      }
    }

    // Convert keys in options to snake_case
    Object.keys(options).forEach(key => {
      const snakeCaseKey = UtilsService.camelCaseToSnakeCase(key);
      if (key !== snakeCaseKey) {
        options[snakeCaseKey] = options[key];
        delete options[key];
      }
    });

    // Convert options to query string
    const queryString = UtilsService.toQueryString(options);

    // Compress query string
    const compressedQueryString = UtilsService.compressQueryString(queryString);

    // Encode query string
    const encodedQueryString = encodeURIComponent(compressedQueryString);

    // Convert options to query string
    url += `?params=${encodedQueryString}`;

    return this.http.get<SearchPaginatedApiResultInterface<ImageSearchInterface>>(url);
  }
}
