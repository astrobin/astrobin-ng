import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { map } from "rxjs/operators";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";

@Injectable({
  providedIn: "root"
})
export class EquipmentApiService extends BaseClassicApiService implements BaseService {
  configUrl = this.baseUrl + "/equipment";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getBrand(id: number) {
    return this.http.get<BrandInterface>(`${this.configUrl}/brand/${id}/`);
  }

  findAllBrands(name: string): Observable<BrandInterface[]> {
    if (!name) {
      return of([]);
    }

    return this.http
      .get<PaginatedApiResultInterface<BrandInterface>>(`${this.configUrl}/brand/?name=${name}`)
      .pipe(map(response => response.results));
  }

  findAllEquipmentItems(q: string, type: EquipmentItemType): Observable<EquipmentItemBaseInterface[]> {
    if (!q) {
      return of([]);
    }

    return this.http
      .get<PaginatedApiResultInterface<EquipmentItemBaseInterface>>(`${this.configUrl}/${type.toLowerCase()}/?q=${q}`)
      .pipe(map(response => response.results));
  }
}
