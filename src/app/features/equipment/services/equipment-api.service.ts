import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { catchError, map, switchMap } from "rxjs/operators";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { TelescopeInterface } from "@features/equipment/interfaces/telescope.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root"
})
export class EquipmentApiService extends BaseClassicApiService implements BaseService {
  configUrl = this.baseUrl + "/equipment";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly http: HttpClient,
    public readonly commonApiService: CommonApiService,
    public readonly popNotificationService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {
    super(loadingService);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GENERIC API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // BRAND API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // SENSOR API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createSensor(sensor: Omit<SensorInterface, "id">): Observable<SensorInterface> {
    return this.http.post<SensorInterface>(`${this.configUrl}/sensor/`, sensor);
  }

  getSensor(id: SensorInterface["id"]): Observable<SensorInterface> {
    return this.http.get<SensorInterface>(`${this.configUrl}/sensor/${id}/`);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // CAMERA API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createCamera(camera: Omit<CameraInterface, "id">): Observable<CameraInterface> {
    const { image, ...cameraWithoutImage } = camera;

    let creation = this.http.post<CameraInterface>(`${this.configUrl}/camera/`, cameraWithoutImage);

    if (camera.image) {
      creation = creation.pipe(
        switchMap(createdCamera =>
          this.uploadCameraImage(createdCamera.id, (camera.image as File[])[0]).pipe(
            catchError(error => {
              let message = "";

              if (error && error.error && error.error.image && error.error.image.length > 0) {
                message = error.error.image[0];
              }

              this.popNotificationService.warning(
                this.translateService.instant(
                  `Something went wrong with uploading the image, but this item was created anyway. ${message}`
                )
              );
              return of(createdCamera);
            })
          )
        )
      );
    }

    return creation;
  }

  uploadCameraImage(id: CameraInterface["id"], image: File): Observable<CameraInterface> {
    const formData: FormData = new FormData();
    formData.append("image", image);

    const httpOptions = {
      headers: new HttpHeaders({
        // Unsetting the Content-Type is necessary so it gets set to multipart/form-data with the correct boundary.
        "Content-Type": "__unset__",
        "Content-Disposition": `form-data; name="image"; filename=${image.name}`
      })
    };

    return this.http.put<CameraInterface>(`${this.configUrl}/camera/${id}/image/`, formData, httpOptions);
  }

  getCamera(id: CameraInterface["id"]): Observable<CameraInterface> {
    return this.http.get<CameraInterface>(`${this.configUrl}/camera/${id}/`);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // TELESCOPE API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getTelescope(id: TelescopeInterface["id"]): Observable<TelescopeInterface> {
    return this.http.get<TelescopeInterface>(`${this.configUrl}/telescope/${id}/`);
  }
}
