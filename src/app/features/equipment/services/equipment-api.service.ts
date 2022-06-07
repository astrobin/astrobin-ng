import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { EMPTY, forkJoin, Observable, of } from "rxjs";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerRejectionReason,
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { getEquipmentItemType } from "@features/equipment/store/equipment.selectors";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";

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

  getEquipmentItem(
    id: EquipmentItemBaseInterface["id"],
    type: EquipmentItemType
  ): Observable<EquipmentItemBaseInterface> {
    const url = `${this.configUrl}/${type.toLowerCase()}/${id}/`;

    return this.http.get<EquipmentItemBaseInterface>(url).pipe(map(item => this._parseItem(item)));
  }

  getAllEquipmentItems(
    type: EquipmentItemType,
    page = 1,
    sort?: string
  ): Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>> {
    let url = `${this.configUrl}/${type.toLowerCase()}/?page=${page}`;

    if (!!sort) {
      url += `&sort=${sort}`;
    }

    return this.http.get<PaginatedApiResultInterface<EquipmentItemBaseInterface>>(url).pipe(
      map(response => ({
        ...response,
        ...{
          results: response.results.map(result => this._parseItem(result))
        }
      }))
    );
  }

  getAllEquipmentItemsPendingReview(
    type: EquipmentItemType,
    page = 1
  ): Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>> {
    return this.http
      .get<PaginatedApiResultInterface<EquipmentItemBaseInterface>>(
        `${this.configUrl}/${type.toLowerCase()}/?pending_review=true&page=${page}`
      )
      .pipe(
        map(response => ({
          ...response,
          ...{
            results: response.results.map(result => this._parseItem(result))
          }
        }))
      );
  }

  getAllEquipmentItemsPendingEdit(
    type: EquipmentItemType,
    page = 1
  ): Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>> {
    return this.http
      .get<PaginatedApiResultInterface<EquipmentItemBaseInterface>>(
        `${this.configUrl}/${type.toLowerCase()}/?pending_edit=true&page=${page}`
      )
      .pipe(
        map(response => ({
          ...response,
          ...{
            results: response.results.map(result => this._parseItem(result))
          }
        }))
      );
  }

  findAllEquipmentItems(q: string, type: EquipmentItemType): Observable<EquipmentItemBaseInterface[]> {
    if (!q) {
      return of([]);
    }

    return this.http
      .get<PaginatedApiResultInterface<EquipmentItemBaseInterface>>(`${this.configUrl}/${type.toLowerCase()}/?q=${q}`)
      .pipe(map(response => response.results.map(item => this._parseItem(item))));
  }

  findRecentlyUsedEquipmentItems(
    type: EquipmentItemType,
    usageType: EquipmentItemUsageType
  ): Observable<EquipmentItemBaseInterface[]> {
    let url = `${this.configUrl}/${type.toLowerCase()}/recently-used/`;

    if (!!usageType) {
      url += `?usage-type=${usageType.toLowerCase()}`;
    }

    return this.http
      .get<EquipmentItemBaseInterface[]>(url)
      .pipe(map(items => items.map(item => this._parseItem(item))));
  }

  findSimilarInBrand(
    brand: BrandInterface["id"],
    q: string,
    type: EquipmentItemType
  ): Observable<EquipmentItemBaseInterface[]> {
    if (!brand || !q) {
      return of([]);
    }

    return this.http
      .get<EquipmentItemBaseInterface[]>(
        `${this.configUrl}/${type.toLowerCase()}/find-similar-in-brand/?brand=${brand}&q=${q}`
      )
      .pipe(map(items => items.map(item => this._parseItem(item))));
  }

  getOthersInBrand(
    brand: BrandInterface["id"],
    type: EquipmentItemType,
    item: EquipmentItemBaseInterface["id"]
  ): Observable<EquipmentItemBaseInterface[]> {
    if (!brand) {
      return of([]);
    }

    return this.http
      .get<EquipmentItemBaseInterface[]>(`${this.configUrl}/${type.toLowerCase()}/others-in-brand/?brand=${brand}`)
      .pipe(
        map(resultItems =>
          resultItems.map(resultItem => this._parseItem(resultItem)).filter(resultItem => resultItem.id !== item)
        )
      );
  }

  getByContentTypeAndObjectId(
    contentTypeId: ContentTypeInterface["id"],
    objectId: EquipmentItemBaseInterface["id"]
  ): Observable<EquipmentItemBaseInterface> {
    return this.commonApiService.getContentTypeById(contentTypeId).pipe(
      switchMap(contentType => {
        switch (contentType.model) {
          case "camera":
            return this.getCamera(objectId);
          case "sensor":
            return this.getSensor(objectId);
          case "telescope":
            return this.getTelescope(objectId);
          case "mount":
            return this.getMount(objectId);
          case "filter":
            return this.getFilter(objectId);
          case "accessory":
            return this.getAccessory(objectId);
          case "software":
            return this.getSoftware(objectId);
        }
      })
    );
  }

  getByProperties(
    type: EquipmentItemType,
    properties: { [key: string]: any }
  ): Observable<EquipmentItemBaseInterface> | null {
    const path = EquipmentItemType[type].toLowerCase();
    const queryString = new URLSearchParams(properties);
    return this.http
      .get<PaginatedApiResultInterface<EquipmentItemBaseInterface>>(`${this.configUrl}/${path}/?${queryString}`)
      .pipe(map(response => (response.count > 0 ? this._parseItem(response.results[0]) : null)));
  }

  getByBrandAndName(
    type: EquipmentItemType,
    brand: EquipmentItemBaseInterface["brand"],
    name: EquipmentItemBaseInterface["name"]
  ): Observable<EquipmentItemBaseInterface | null> {
    return this.getByProperties(type, { brand, name });
  }

  approveEquipmentItem(item: EquipmentItemBaseInterface, comment: string): Observable<EquipmentItemBaseInterface> {
    const type = getEquipmentItemType(item);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http
      .post<EquipmentItemBaseInterface>(`${this.configUrl}/${path}/${item.id}/approve/`, { comment })
      .pipe(map(responseItem => this._parseItem(responseItem)));
  }

  rejectEquipmentItem(
    item: EquipmentItemBaseInterface,
    reason: EquipmentItemReviewerRejectionReason,
    comment: string | null,
    duplicateOf: EquipmentItemBaseInterface["id"] | null
  ): Observable<EquipmentItemBaseInterface> {
    const type = getEquipmentItemType(item);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http
      .post<EquipmentItemBaseInterface>(`${this.configUrl}/${path}/${item.id}/reject/`, {
        reason,
        comment,
        duplicateOf
      })
      .pipe(map(responseItem => this._parseItem(responseItem)));
  }

  getEditProposals(
    item: EquipmentItemBaseInterface
  ): Observable<PaginatedApiResultInterface<EditProposalInterface<EquipmentItemBaseInterface>>> {
    const type = getEquipmentItemType(item);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http
      .get<PaginatedApiResultInterface<EditProposalInterface<EquipmentItemBaseInterface>>>(
        `${this.configUrl}/${path}-edit-proposal/?edit_proposal_target=${item.id}`
      )
      .pipe(
        map(response => ({
          ...response,
          ...{
            results: response.results.map(result => this._parseItem(result))
          }
        }))
      );
  }

  approveEditProposal(
    editProposal: EditProposalInterface<EquipmentItemBaseInterface>,
    comment: string
  ): Observable<EditProposalInterface<EquipmentItemBaseInterface>> {
    const type = getEquipmentItemType(editProposal);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http.post<EditProposalInterface<EquipmentItemBaseInterface>>(
      `${this.configUrl}/${path}-edit-proposal/${editProposal.id}/approve/`,
      { comment }
    );
  }

  rejectEditProposal(
    editProposal: EditProposalInterface<EquipmentItemBaseInterface>,
    comment: string
  ): Observable<EditProposalInterface<EquipmentItemBaseInterface>> {
    const type = getEquipmentItemType(editProposal);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http.post<EditProposalInterface<EquipmentItemBaseInterface>>(
      `${this.configUrl}/${path}-edit-proposal/${editProposal.id}/reject/`,
      { comment }
    );
  }

  findEquipmentPresets(): Observable<EquipmentPresetInterface[]> {
    return this.http.get<EquipmentPresetInterface[]>(`${this.configUrl}/equipment-preset/`);
  }

  createEquipmentPreset(preset: EquipmentPresetInterface): Observable<EquipmentPresetInterface> {
    return this.http.post<EquipmentPresetInterface>(`${this.configUrl}/equipment-preset/`, preset);
  }

  updateEquipmentPreset(preset: EquipmentPresetInterface): Observable<EquipmentPresetInterface> {
    return this.http.put<EquipmentPresetInterface>(`${this.configUrl}/equipment-preset/${preset.id}/`, preset);
  }

  deleteEquipmentPreset(id: EquipmentPresetInterface["id"]): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/equipment-preset/${id}/`);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // BRAND API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getBrand(id: BrandInterface["id"]): Observable<BrandInterface> {
    return this.http.get<BrandInterface>(`${this.configUrl}/brand/${id}/`);
  }

  getBrandsByName(name: BrandInterface["name"]): Observable<PaginatedApiResultInterface<BrandInterface>> {
    return this.http.get<PaginatedApiResultInterface<BrandInterface>>(`${this.configUrl}/brand/?name=${name}`);
  }

  getBrandsByWebsite(website: BrandInterface["website"]): Observable<PaginatedApiResultInterface<BrandInterface>> {
    return this.http.get<PaginatedApiResultInterface<BrandInterface>>(`${this.configUrl}/brand/?website=${website}`);
  }

  createBrand(brand: Omit<BrandInterface, "id">): Observable<BrandInterface> {
    const { logo, ...brandWithoutLogo } = brand;

    return new Observable<BrandInterface>(observer => {
      this.http
        .post<BrandInterface>(`${this.configUrl}/brand/`, {
          ...{
            ...brandWithoutLogo,
            website: UtilsService.ensureUrlProtocol(brandWithoutLogo.website)
          }
        })
        .pipe(take(1))
        .subscribe(createdBrand => {
          if (brand.logo && brand.logo.length > 0) {
            this.uploadBrandLogo(createdBrand.id, (brand.logo as File[])[0])
              .pipe(
                take(1),
                catchError(error => {
                  let message = "";

                  if (error && error.error && error.error.logo && error.error.logo.length > 0) {
                    message = error.error.logo[0];
                  }

                  this.popNotificationService.warning(
                    this.translateService.instant(
                      `Something went wrong with uploading the logo, but this brand was created anyway. ${message}`
                    )
                  );

                  return of(createdBrand);
                })
              )
              .subscribe(() => {
                observer.next(createdBrand);
                observer.complete();
              });
          } else {
            observer.next(createdBrand);
            observer.complete();
          }
        });
    });
  }

  uploadBrandLogo(id: BrandInterface["id"], logo: File): Observable<BrandInterface> {
    const formData: FormData = new FormData();
    formData.append("logo", logo);

    const httpOptions = {
      headers: new HttpHeaders({
        // Unsetting the Content-Type is necessary so it gets set to multipart/form-data with the correct boundary.
        "Content-Type": "__unset__",
        "Content-Disposition": `form-data; name="logo"; filename=${logo.name}`
      })
    };

    return this.http.post<BrandInterface>(`${this.configUrl}/brand/${id}/logo/`, formData, httpOptions);
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
    return this._createItem<SensorInterface>(sensor, "sensor");
  }

  createSensorEditProposal(
    editProposal: Omit<EditProposalInterface<SensorInterface>, "id">
  ): Observable<EditProposalInterface<SensorInterface>> {
    return this._createItemEditProposal<SensorInterface>(editProposal, "sensor");
  }

  getSensor(id: SensorInterface["id"]): Observable<SensorInterface> {
    return this.http
      .get<SensorInterface>(`${this.configUrl}/sensor/${id}/`)
      .pipe(map(sensor => this._parseSensor(sensor)));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // CAMERA API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createCamera(camera: Omit<CameraInterface, "id">): Observable<CameraInterface> {
    return this._createItem<CameraInterface>(camera, "camera");
  }

  createCameraEditProposal(
    editProposal: Omit<EditProposalInterface<CameraInterface>, "id">
  ): Observable<EditProposalInterface<CameraInterface>> {
    return this._createItemEditProposal<CameraInterface>(editProposal, "camera");
  }

  getCamera(id: CameraInterface["id"]): Observable<CameraInterface> {
    return this.http
      .get<CameraInterface>(`${this.configUrl}/camera/${id}/`)
      .pipe(map(camera => this._parseCamera(camera)));
  }

  findCameraVariants(id: CameraInterface["id"]): Observable<CameraInterface[]> {
    return this.http
      .get<CameraInterface[]>(`${this.configUrl}/camera/${id}/variants/`)
      .pipe(map(cameraVariants => cameraVariants.map(cameraVariant => this._parseCamera(cameraVariant))));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // TELESCOPE API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createTelescope(telescope: Omit<TelescopeInterface, "id">): Observable<TelescopeInterface> {
    const model = { ...(telescope as any) };

    if (model.fixedFocalLength) {
      model.minFocalLength = model.focalLength;
      model.maxFocalLength = model.focalLength;
      delete model.focalLength;
    }

    delete model.fixedFocalLength;

    return this._createItem<TelescopeInterface>(model, "telescope");
  }

  createTelescopeEditProposal(
    editProposal: Omit<EditProposalInterface<TelescopeInterface>, "id">
  ): Observable<EditProposalInterface<TelescopeInterface>> {
    return this._createItemEditProposal<TelescopeInterface>(editProposal, "telescope");
  }

  getTelescope(id: TelescopeInterface["id"]): Observable<TelescopeInterface> {
    return this.http
      .get<TelescopeInterface>(`${this.configUrl}/telescope/${id}/`)
      .pipe(map(telescope => this._parseTelescope(telescope)));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // MOUNT API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createMount(mount: Omit<MountInterface, "id">): Observable<MountInterface> {
    return this._createItem<MountInterface>(mount, "mount");
  }

  createMountEditProposal(
    editProposal: Omit<EditProposalInterface<MountInterface>, "id">
  ): Observable<EditProposalInterface<MountInterface>> {
    return this._createItemEditProposal<MountInterface>(editProposal, "mount");
  }

  getMount(id: MountInterface["id"]): Observable<MountInterface> {
    return this.http.get<MountInterface>(`${this.configUrl}/mount/${id}/`).pipe(map(mount => this._parseMount(mount)));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // FILTER API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createFilter(filter: Omit<FilterInterface, "id">): Observable<FilterInterface> {
    return this._createItem<FilterInterface>(filter, "filter");
  }

  createFilterEditProposal(
    editProposal: Omit<EditProposalInterface<FilterInterface>, "id">
  ): Observable<EditProposalInterface<FilterInterface>> {
    return this._createItemEditProposal<FilterInterface>(editProposal, "filter");
  }

  getFilter(id: FilterInterface["id"]): Observable<FilterInterface> {
    return this.http
      .get<FilterInterface>(`${this.configUrl}/filter/${id}/`)
      .pipe(map(filter => this._parseFilter(filter)));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ACCESSORY API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createAccessory(accessory: Omit<AccessoryInterface, "id">): Observable<AccessoryInterface> {
    return this._createItem<AccessoryInterface>(accessory, "accessory");
  }

  createAccessoryEditProposal(
    editProposal: Omit<EditProposalInterface<AccessoryInterface>, "id">
  ): Observable<EditProposalInterface<AccessoryInterface>> {
    return this._createItemEditProposal<AccessoryInterface>(editProposal, "accessory");
  }

  getAccessory(id: AccessoryInterface["id"]): Observable<AccessoryInterface> {
    return this.http
      .get<AccessoryInterface>(`${this.configUrl}/accessory/${id}/`)
      .pipe(map(accessory => this._parseAccessory(accessory)));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // SOFTWARE API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createSoftware(software: Omit<SoftwareInterface, "id">): Observable<SoftwareInterface> {
    return this._createItem<SoftwareInterface>(software, "software");
  }

  createSoftwareEditProposal(
    editProposal: Omit<EditProposalInterface<SoftwareInterface>, "id">
  ): Observable<EditProposalInterface<SoftwareInterface>> {
    return this._createItemEditProposal<SoftwareInterface>(editProposal, "software");
  }

  getSoftware(id: SoftwareInterface["id"]): Observable<SoftwareInterface> {
    return this.http
      .get<SoftwareInterface>(`${this.configUrl}/software/${id}/`)
      .pipe(map(software => this._parseSoftware(software)));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // PRIVATE
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // django-rest-framework will coerce floats to strings, so with these functions we parse them back.

  private _parseItem<T extends EquipmentItemBaseInterface | EditProposalInterface<EquipmentItemBaseInterface>>(
    item: T
  ): T {
    const type = getEquipmentItemType(item);

    switch (type) {
      case EquipmentItemType.SENSOR:
        return this._parseSensor<any>(item);
      case EquipmentItemType.CAMERA:
        return this._parseCamera<any>(item);
      case EquipmentItemType.TELESCOPE:
        return this._parseTelescope<any>(item);
      case EquipmentItemType.MOUNT:
        return this._parseMount<any>(item);
      case EquipmentItemType.FILTER:
        return this._parseFilter<any>(item);
      case EquipmentItemType.ACCESSORY:
        return this._parseAccessory<any>(item);
      case EquipmentItemType.SOFTWARE:
        return this._parseSoftware<any>(item);
    }
  }

  // The following _parse methods are here because django-rest-framework returns floats as strings (e.g. "1.23")

  private _parseSensor<T extends SensorInterface | EditProposalInterface<SensorInterface>>(item: T): T {
    return {
      ...item,
      ...{
        pixelSize: item.pixelSize !== null ? parseFloat((item.pixelSize as unknown) as string) : null,
        sensorWidth: item.sensorWidth !== null ? parseFloat((item.sensorWidth as unknown) as string) : null,
        sensorHeight: item.sensorHeight !== null ? parseFloat((item.sensorHeight as unknown) as string) : null,
        readNoise: item.readNoise !== null ? parseFloat((item.readNoise as unknown) as string) : null
      }
    };
  }

  private _parseCamera<T extends CameraInterface | EditProposalInterface<CameraInterface>>(item: T): T {
    return {
      ...item,
      ...{
        backFocus: item.backFocus !== null ? parseFloat((item.backFocus as unknown) as string) : null
      }
    };
  }

  private _parseTelescope<T extends TelescopeInterface | EditProposalInterface<TelescopeInterface>>(item: T): T {
    return {
      ...item,
      ...{
        aperture: item.aperture !== null ? parseFloat((item.aperture as unknown) as string) : null,
        minFocalLength: item.minFocalLength !== null ? parseFloat((item.minFocalLength as unknown) as string) : null,
        maxFocalLength: item.maxFocalLength !== null ? parseFloat((item.maxFocalLength as unknown) as string) : null
      }
    };
  }

  private _parseMount<T extends MountInterface | EditProposalInterface<MountInterface>>(item: T): T {
    return {
      ...item,
      ...{
        weight: item.weight !== null ? parseFloat((item.weight as unknown) as string) : null,
        maxPayload: item.maxPayload !== null ? parseFloat((item.maxPayload as unknown) as string) : null
      }
    };
  }

  private _parseFilter<T extends FilterInterface | EditProposalInterface<FilterInterface>>(item: T): T {
    return {
      ...item,
      ...{
        bandwidth: item.bandwidth !== null ? parseFloat((item.bandwidth as unknown) as string) : null,
        otherSize: item.otherSize !== null ? parseFloat((item.otherSize as unknown) as string) : null
      }
    };
  }

  private _parseAccessory<T extends AccessoryInterface | EditProposalInterface<AccessoryInterface>>(item: T): T {
    // Accessories have no float properties, so we don't need to do anything here.
    return item;
  }

  private _parseSoftware<T extends SoftwareInterface | EditProposalInterface<SoftwareInterface>>(item: T): T {
    // Software items have no float properties, so we don't need to do anything here.
    return item;
  }

  private _createItem<T extends EquipmentItemBaseInterface>(item: Omit<T, "id">, path: string): Observable<T> {
    const { image, ...itemWithoutImage } = item;

    return new Observable<T>(observer => {
      this.http
        .post<T>(`${this.configUrl}/${path}/`, {
          ...{
            ...itemWithoutImage,
            website: UtilsService.ensureUrlProtocol(itemWithoutImage.website)
          }
        })
        .pipe(take(1))
        .subscribe(createdItem => {
          if (item.image && item.image.length > 0) {
            this._uploadItemImage<T>(createdItem.id, (item.image as File[])[0], path)
              .pipe(
                take(1),
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

                  return of(createdItem);
                })
              )
              .subscribe(createdItemWithImage => {
                observer.next({ ...createdItem, ...createdItemWithImage });
                observer.complete();
              });
          } else {
            observer.next(createdItem);
            observer.complete();
          }
        });
    });
  }

  private _uploadItemImage<T extends EquipmentItemBaseInterface>(
    id: T["id"],
    image: File,
    path: string
  ): Observable<T> {
    const formData: FormData = new FormData();
    formData.append("image", image);

    const httpOptions = {
      headers: new HttpHeaders({
        // Unsetting the Content-Type is necessary so it gets set to multipart/form-data with the correct boundary.
        "Content-Type": "__unset__",
        "Content-Disposition": `form-data; name="image"; filename=${image.name}`
      })
    };

    return this.http.post<T>(`${this.configUrl}/${path}/${id}/image/`, formData, httpOptions);
  }

  private _createItemEditProposal<T extends EquipmentItemBaseInterface>(
    item: Omit<EditProposalInterface<T>, "id">,
    path: string
  ): Observable<EditProposalInterface<T>> {
    const { image, ...itemWithoutImage } = item;

    return new Observable<EditProposalInterface<T>>(observer => {
      this.http
        .post<EditProposalInterface<T>>(`${this.configUrl}/${path}-edit-proposal/`, {
          ...{
            ...itemWithoutImage,
            website: UtilsService.ensureUrlProtocol(itemWithoutImage.website)
          }
        })
        .pipe(
          take(1),
          catchError(error => {
            this.popNotificationService.error(`Something went wrong: ${JSON.stringify(error.error)}`);
            return EMPTY;
          })
        )
        .subscribe(createdEditProposal => {
          if (item.image && !UtilsService.isString(item.image) && item.image.length > 0) {
            this._uploadEditProposalImage<T>(createdEditProposal.id, (item.image as File[])[0], path)
              .pipe(
                take(1),
                catchError(error => {
                  let message = "";

                  if (error && error.error && error.error.image && error.error.image.length > 0) {
                    message = error.error.image[0];
                  }

                  this.popNotificationService.warning(
                    this.translateService.instant(
                      `Something went wrong with uploading the image, but the form was submitted anyway. ${message}`
                    )
                  );

                  return of(createdEditProposal);
                })
              )
              .subscribe(createdEditProposalWithImage => {
                observer.next({ ...createdEditProposal, ...createdEditProposalWithImage });
                observer.complete();
              });
          } else {
            observer.next(createdEditProposal);
            observer.complete();
          }
        });
    });
  }

  private _uploadEditProposalImage<T extends EquipmentItemBaseInterface>(
    id: T["id"],
    image: File,
    path: string
  ): Observable<EditProposalInterface<T>> {
    const formData: FormData = new FormData();
    formData.append("image", image);

    const httpOptions = {
      headers: new HttpHeaders({
        // Unsetting the Content-Type is necessary so it gets set to multipart/form-data with the correct boundary.
        "Content-Type": "__unset__",
        "Content-Disposition": `form-data; name="image"; filename=${image.name}`
      })
    };

    return this.http.post<EditProposalInterface<T>>(
      `${this.configUrl}/${path}-edit-proposal/${id}/image/`,
      formData,
      httpOptions
    );
  }
}
