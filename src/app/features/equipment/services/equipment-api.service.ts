import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { map, switchMap } from "rxjs/operators";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { TelescopeInterface } from "@features/equipment/interfaces/telescope.interface";

@Injectable({
  providedIn: "root"
})
export class EquipmentApiService extends BaseClassicApiService implements BaseService {
  configUrl = this.baseUrl + "/equipment";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly http: HttpClient,
    public readonly commonApiService: CommonApiService
  ) {
    super(loadingService);
  }

  getBrand(id: BrandInterface["id"]) {
    return this.http.get<BrandInterface>(`${this.configUrl}/brand/${id}/`);
  }

  createBrand(brand: Omit<BrandInterface, "id">) {
    return this.http.post<BrandInterface>(`${this.configUrl}/brand/`, brand);
  }

  findAllBrands(q: string): Observable<BrandInterface[]> {
    if (!q) {
      return of([]);
    }

    return this.http
      .get<PaginatedApiResultInterface<BrandInterface>>(`${this.configUrl}/brand/?q=${q}`)
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

  getByContentTypeAndObjectId(
    contentTypeId: ContentTypeInterface["id"],
    objectId: EquipmentItemBaseInterface["id"]
  ): Observable<EquipmentItemBaseInterface> {
    return this.commonApiService.getContentTypeById(contentTypeId).pipe(
      switchMap(contentType => {
        // TODO: complete
        switch (contentType.model) {
          case "camera":
            return this.getCamera(objectId);
          case "sensor":
            return this.getSensor(objectId);
          case "telescope":
            return this.getTelescope(objectId);
        }
      })
    );
  }

  getCamera(id: CameraInterface["id"]): Observable<CameraInterface> {
    return this.http.get<CameraInterface>(`${this.configUrl}/camera/${id}/`);
  }

  getSensor(id: SensorInterface["id"]): Observable<SensorInterface> {
    return this.http.get<SensorInterface>(`${this.configUrl}/sensor/${id}/`);
  }

  getTelescope(id: TelescopeInterface["id"]): Observable<TelescopeInterface> {
    return this.http.get<TelescopeInterface>(`${this.configUrl}/telescope/${id}/`);
  }
}
