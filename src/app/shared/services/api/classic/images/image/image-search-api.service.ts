import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";

export interface ImageSearchOptions {
  itemType: EquipmentItemType;
  itemId: EquipmentItem["id"];
  usageType?: EquipmentItemUsageType;
  ordering?: string;
  page: number;
}

@Injectable({
  providedIn: "root"
})
export class ImageSearchApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/images/image-search";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<State>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  search(options: ImageSearchOptions): Observable<PaginatedApiResultInterface<ImageSearchInterface>> {
    let url = `${this.configUrl}/`;

    url = UtilsService.addOrUpdateUrlParam(url, "page", options.page.toString());

    if (!!options.ordering) {
      url = UtilsService.addOrUpdateUrlParam(url, "ordering", options.ordering);
    }

    const emptyResponse = { results: [], count: 0, prev: null, next: null };
    let prop: string;

    switch (options.itemType) {
      case EquipmentItemType.SENSOR:
        // TODO: index sensors in the backend.
        return of(emptyResponse);
      case EquipmentItemType.CAMERA:
        if (options.usageType === EquipmentItemUsageType.GUIDING) {
          prop = "guiding_cameras_2_id";
        } else if (options.usageType === EquipmentItemUsageType.IMAGING) {
          prop = "imaging_cameras_2_id";
        } else {
          prop = "all_cameras_2_id";
        }
        break;
      case EquipmentItemType.TELESCOPE:
        if (options.usageType === EquipmentItemUsageType.GUIDING) {
          prop = "guiding_telescopes_2_id";
        } else if (options.usageType === EquipmentItemUsageType.IMAGING) {
          prop = "imaging_telescopes_2_id";
        } else {
          prop = "all_telescopes_2_id";
        }
        break;
      case EquipmentItemType.MOUNT:
        prop = "mounts_2_id";
        break;
      case EquipmentItemType.FILTER:
        prop = "filters_2_id";
        break;
      case EquipmentItemType.ACCESSORY:
        prop = "accessories_2_id";
        break;
      case EquipmentItemType.SOFTWARE:
        prop = "software_2_id";
        break;
    }

    if (!!prop) {
      url = UtilsService.addOrUpdateUrlParam(url, prop, options.itemId.toString());
    }

    return this.http.get<PaginatedApiResultInterface<ImageSearchInterface>>(url);
  }
}
