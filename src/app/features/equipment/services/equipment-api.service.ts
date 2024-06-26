import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { EMPTY, Observable, of } from "rxjs";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerRejectionReason,
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { catchError, expand, map, reduce, switchMap, take } from "rxjs/operators";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { CameraInterface } from "@features/equipment/types/camera.interface";
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
import { UserInterface } from "@shared/interfaces/user.interface";
import { EquipmentItemMostOftenUsedWith } from "@features/equipment/types/equipment-item-most-often-used-with-data.interface";
import { ExplorerFilterInterface } from "@features/equipment/pages/explorer/explorer-filters/explorer-filters.component";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { ContributorInterface } from "@features/equipment/types/contributor.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentListingsInterface } from "@features/equipment/types/equipment-listings.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceImageInterface } from "@features/equipment/types/marketplace-image.interface";
import { MarketplacePrivateConversationInterface } from "@features/equipment/types/marketplace-private-conversation.interface";
import { MarketplaceListingQueryOptionsInterface } from "@features/equipment/types/marketplace-listing-query-options.interface";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { MarketplaceFeedbackInterface } from "@features/equipment/types/marketplace-feedback.interface";

export interface AllEquipmentItemsOptionsInterface {
  brand?: BrandInterface["id"];
  query?: string;
  sortOrder?: string;
  filters?: ExplorerFilterInterface[];
  page?: number;
  includeVariants?: boolean;
}

export enum EquipmentItemsSortOrder {
  AZ = "az",
  AZ_DESC = "-az",
  USERS = "users",
  USERS_DESC = "-users",
  IMAGES = "images",
  IMAGES_DESC = "-images",
}

@Injectable({
  providedIn: "root"
})
export class EquipmentApiService extends BaseClassicApiService implements BaseService {
  configUrl = this.baseUrl + "/equipment";

  constructor(
    public readonly store$: Store<State>,
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
    type: EquipmentItemType,
    allowUnapproved = false,
    allowDIY = false
  ): Observable<EquipmentItemBaseInterface> {
    let url = `${this.configUrl}/${type.toLowerCase()}/${id}/`;

    if (allowUnapproved) {
      url = UtilsService.addOrUpdateUrlParam(url, "allow-unapproved", "true");
    }

    if (allowDIY) {
      url = UtilsService.addOrUpdateUrlParam(url, "allow-DIY", "true");
    }

    return this.http.get<EquipmentItemBaseInterface>(url).pipe(map(item => this._parseItem(item)));
  }

  findAllEquipmentItems(
    type: EquipmentItemType,
    options: AllEquipmentItemsOptionsInterface
  ): Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>> {
    let url = `${this.configUrl}/${type.toLowerCase()}/`;

    url = UtilsService.addOrUpdateUrlParam(url, "page", String(options.page || 1));
    url = UtilsService.addOrUpdateUrlParam(url, "sort", options.sortOrder || EquipmentItemsSortOrder.AZ);
    url = UtilsService.addOrUpdateUrlParam(url, "q", options.query || "");

    if (!!options.brand) {
      url = UtilsService.addOrUpdateUrlParam(url, "brand", options.brand + "" || "");
    }

    if (!!options.filters) {
      for (const filter of options.filters) {
        let value = filter.value;

        if (UtilsService.isObject(value)) {
          value = JSON.stringify(value);
        }

        url = UtilsService.addOrUpdateUrlParam(url, filter.type, value);
      }
    }

    url = UtilsService.addOrUpdateUrlParam(url, "include-variants", String(options.includeVariants || false));

    return this.http.get<PaginatedApiResultInterface<EquipmentItemBaseInterface>>(url).pipe(
      map(response => ({
        ...response,
        ...{
          results: response.results.map(result => this._parseItem(result))
        }
      }))
    );
  }

  itemCount(type: EquipmentItemType): Observable<number> {
    return this.http.get<number>(`${this.configUrl}/${type.toLowerCase()}/count/`);
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

  getAllFollowedEquipmentItems(
    type: EquipmentItemType,
    page = 1
  ): Observable<PaginatedApiResultInterface<EquipmentItem>> {
    return this.http
      .get<PaginatedApiResultInterface<EquipmentItem>>(
        `${this.configUrl}/${type.toLowerCase()}/?followed=true&page=${page}`
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

  findRecentlyUsedEquipmentItems(
    type: EquipmentItemType,
    usageType: EquipmentItemUsageType,
    includeFrozen = false,
    query?: string
  ): Observable<EquipmentItemBaseInterface[]> {
    let url = `${this.configUrl}/${type.toLowerCase()}/recently-used/`;

    if (!!usageType) {
      url = UtilsService.addOrUpdateUrlParam(url, "usage-type", usageType.toLowerCase());
    }

    if (includeFrozen) {
      url = UtilsService.addOrUpdateUrlParam(url, "include-frozen", String(includeFrozen));
    }

    if (query) {
      url = UtilsService.addOrUpdateUrlParam(url, "q", query);
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

  getAllInBrand(
    brand: BrandInterface["id"],
    type: EquipmentItemType,
    page: number = 1
  ): Observable<PaginatedApiResultInterface<EquipmentItem>> {
    return this.http.get<PaginatedApiResultInterface<EquipmentItem>>(
      `${this.configUrl}/${type.toLowerCase()}/?brand=${brand}&page=${page}&include-variants=false`
    );
  }

  getOthersInBrand(
    brand: BrandInterface["id"],
    type: EquipmentItemType,
    name: string
  ): Observable<EquipmentItemBaseInterface[]> {
    if (!brand) {
      return of([]);
    }

    return this.http.get<EquipmentItemBaseInterface[]>(
      `${this.configUrl}/${type.toLowerCase()}/others-in-brand/?brand=${brand}&name=${encodeURIComponent(name)}`
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

  unapproveEquipmentItem(item: EquipmentItemBaseInterface): Observable<EquipmentItemBaseInterface> {
    const type = getEquipmentItemType(item);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http
      .post<EquipmentItemBaseInterface>(`${this.configUrl}/${path}/${item.id}/unapprove/`, {})
      .pipe(map(responseItem => this._parseItem(responseItem)));
  }

  freezeEquipmentItemAsAmbiguous(item: EquipmentItemBaseInterface): Observable<EquipmentItemBaseInterface> {
    const type = getEquipmentItemType(item);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http
      .post<EquipmentItemBaseInterface>(`${this.configUrl}/${path}/${item.id}/freeze-as-ambiguous/`, {})
      .pipe(map(responseItem => this._parseItem(responseItem)));
  }

  unfreezeEquipmentItemAsAmbiguous(item: EquipmentItemBaseInterface): Observable<EquipmentItemBaseInterface> {
    const type = getEquipmentItemType(item);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http
      .post<EquipmentItemBaseInterface>(`${this.configUrl}/${path}/${item.id}/unfreeze-as-ambiguous/`, {})
      .pipe(map(responseItem => this._parseItem(responseItem)));
  }

  rejectEquipmentItem(
    item: EquipmentItemBaseInterface,
    reason: EquipmentItemReviewerRejectionReason,
    comment: string | null,
    duplicateOf: EquipmentItemBaseInterface["id"] | null,
    duplicateOfKlass: EquipmentItemType | null,
    duplicateOfUsageType: EquipmentItemUsageType | null
  ): Observable<EquipmentItemBaseInterface> {
    const type = getEquipmentItemType(item);
    const path = EquipmentItemType[type].toLowerCase();

    return this.http
      .post<EquipmentItemBaseInterface>(`${this.configUrl}/${path}/${item.id}/reject/`, {
        reason,
        comment,
        duplicateOf,
        duplicateOfKlass,
        duplicateOfUsageType
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

  getMostOftenUsedWith(
    itemType: EquipmentItemType,
    itemId: EquipmentItemBaseInterface["id"]
  ): Observable<EquipmentItemMostOftenUsedWith> {
    return this.http.get<EquipmentItemMostOftenUsedWith>(
      `${this.configUrl}/${itemType.toLowerCase()}/${itemId}/most-often-used-with/`
    );
  }

  acquireReviewerLock(itemType: EquipmentItemType, itemId: EquipmentItem["id"]): Observable<void> {
    return this.http.post<void>(`${this.configUrl}/${itemType.toLowerCase()}/${itemId}/acquire-reviewer-lock/`, {});
  }

  releaseReviewerLock(itemType: EquipmentItemType, itemId: EquipmentItem["id"]): Observable<void> {
    return this.http.post<void>(`${this.configUrl}/${itemType.toLowerCase()}/${itemId}/release-reviewer-lock/`, {});
  }

  acquireEditProposalLock(itemType: EquipmentItemType, itemId: EquipmentItem["id"]): Observable<void> {
    return this.http.post<void>(
      `${this.configUrl}/${itemType.toLowerCase()}/${itemId}/acquire-edit-proposal-lock/`,
      {}
    );
  }

  releaseEditProposalLock(itemType: EquipmentItemType, itemId: EquipmentItem["id"]): Observable<void> {
    return this.http.post<void>(
      `${this.configUrl}/${itemType.toLowerCase()}/${itemId}/release-edit-proposal-lock/`,
      {}
    );
  }

  acquireEditProposalReviewLock(
    itemType: EquipmentItemType,
    editProposalId: EditProposalInterface<EquipmentItem>["id"]
  ): Observable<void> {
    return this.http.post<void>(
      `${this.configUrl}/${itemType.toLowerCase()}-edit-proposal/${editProposalId}/acquire-review-lock/`,
      {}
    );
  }

  releaseEditProposalReviewLock(
    itemType: EquipmentItemType,
    editProposalId: EditProposalInterface<EquipmentItem>["id"]
  ): Observable<void> {
    return this.http.post<void>(
      `${this.configUrl}/${itemType.toLowerCase()}-edit-proposal/${editProposalId}/release-review-lock/`,
      {}
    );
  }

  getContributors(): Observable<ContributorInterface[]> {
    return this.http.get<ContributorInterface[]>(`${this.configUrl}/contributors/`);
  }

  getPossibleItemAssignees(
    itemType: EquipmentItemType,
    itemId: EquipmentItem["id"]
  ): Observable<{ key: EquipmentItem["id"]; value: string }[]> {
    return this.http.get<{ key: UserInterface["id"]; value: string }[]>(
      `${this.configUrl}/${itemType.toLowerCase()}/${itemId}/possible-assignees/`
    );
  }

  assignItem(
    itemType: EquipmentItemType,
    itemId: EquipmentItem["id"],
    assignee: UserInterface["id"] | null
  ): Observable<EquipmentItem> {
    return this.http.post<EquipmentItem>(`${this.configUrl}/${itemType.toLowerCase()}/${itemId}/assign/`, { assignee });
  }

  getPossibleEditProposalAssignees(
    itemType: EquipmentItemType,
    editProposalId: EditProposalInterface<EquipmentItem>["id"]
  ): Observable<{ key: UserInterface["id"]; value: string }[]> {
    return this.http.get<{ key: UserInterface["id"]; value: string }[]>(
      `${this.configUrl}/${itemType.toLowerCase()}-edit-proposal/${editProposalId}/possible-assignees/`
    );
  }

  assignEditProposal(
    itemType: EquipmentItemType,
    editProposalId: EditProposalInterface<EquipmentItem>["id"],
    assignee: UserInterface["id"] | null
  ): Observable<EditProposalInterface<EquipmentItem>> {
    return this.http.post<EditProposalInterface<EquipmentItem>>(
      `${this.configUrl}/${itemType.toLowerCase()}-edit-proposal/${editProposalId}/assign/`,
      { assignee }
    );
  }

  getListings(itemType: EquipmentItemType, itemId: EquipmentItem["id"]): Observable<EquipmentListingsInterface> {
    return this.http.get<EquipmentListingsInterface>(`${this.configUrl}/${itemType.toLowerCase()}/${itemId}/listings/`);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // BRAND API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getAllBrands(page = 1, sort = EquipmentItemsSortOrder.AZ): Observable<PaginatedApiResultInterface<BrandInterface>> {
    return this.http.get<PaginatedApiResultInterface<BrandInterface>>(
      `${this.configUrl}/brand/?page=${page}&sort=${sort}`
    );
  }

  getBrand(id: BrandInterface["id"]): Observable<BrandInterface> {
    return this.http.get<BrandInterface>(`${this.configUrl}/brand/${id}/`);
  }

  getBrandsByName(name: BrandInterface["name"]): Observable<PaginatedApiResultInterface<BrandInterface>> {
    return this.http.get<PaginatedApiResultInterface<BrandInterface>>(`${this.configUrl}/brand/?name=${name}`);
  }

  getBrandsByEquipmentType(type: EquipmentItemType): Observable<PaginatedApiResultInterface<BrandInterface>> {
    return this.http.get<PaginatedApiResultInterface<BrandInterface>>(
      `${this.configUrl}/brand/?type=${type.toLowerCase()}`
    );
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

  getListingsForBrand(brandId: BrandInterface["id"]): Observable<EquipmentListingsInterface> {
    return this.http.get<EquipmentListingsInterface>(`${this.configUrl}/brand/${brandId}/listings/`);
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
    return this.http
      .get<MountInterface>(`${this.configUrl}/mount/${id}/`)
      .pipe(map(mount => this._parseMount(mount)));
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
  // MARKETPLACE API
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public loadMarketplaceListings(
    options: MarketplaceListingQueryOptionsInterface = { page: 1 }
  ): Observable<PaginatedApiResultInterface<MarketplaceListingInterface>> {
    let url = `${this.configUrl}/marketplace/listing/`;

    Object.keys(options).forEach(key => {
      const value = options[key];
      if (value != null && value !== "" && value !== "undefined") {
        const paramKey = UtilsService.camelCaseToSnakeCase(key);
        let valueStr = value.toString();
        url = UtilsService.addOrUpdateUrlParam(url, paramKey, valueStr);
      }
    });

    // The "sold" parameter needs to be explicit.
    if (options.sold === undefined) {
      url = UtilsService.addOrUpdateUrlParam(url, "sold", "false");
    }

    return this.http.get<PaginatedApiResultInterface<MarketplaceListingInterface>>(url);
  }

  public createMarketplaceListing(
    listing: Omit<MarketplaceListingInterface, "id">
  ): Observable<MarketplaceListingInterface> {
    return this.http.post<MarketplaceListingInterface>(
      `${this.configUrl}/marketplace/listing/`,
      (({ lineItems, ...rest }) => rest)(listing)
    );
  }

  public loadMarketplaceListing(id: MarketplaceListingInterface["id"]): Observable<MarketplaceListingInterface> {
    return this.http.get<MarketplaceListingInterface>(`${this.configUrl}/marketplace/listing/${id}/`);
  }

  public loadMarketplaceListingByHash(
    hash: MarketplaceListingInterface["hash"]
  ): Observable<MarketplaceListingInterface> {
    return this.http
      .get<PaginatedApiResultInterface<MarketplaceListingInterface>>(
        `${this.configUrl}/marketplace/listing/?hash=${hash}`
      )
      .pipe(
        map((result: PaginatedApiResultInterface<MarketplaceListingInterface>) => {
          if (result.results.length === 0) {
            throw new Error(`No marketplace listing found with hash ${hash}`);
          }
          return result.results[0];
        })
      );
  }

  public updateMarketplaceListing(listing: MarketplaceListingInterface): Observable<MarketplaceListingInterface> {
    return this.http.put<MarketplaceListingInterface>(
      `${this.configUrl}/marketplace/listing/${listing.id}/`,
      (({ lineItems, ...rest }) => rest)(listing)
    );
  }

  public deleteMarketplaceListing(id: MarketplaceListingInterface["id"]): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/marketplace/listing/${id}/`);
  }

  public approveMarketplaceListing(id: MarketplaceListingInterface["id"]): Observable<MarketplaceListingInterface> {
    return this.http.put<MarketplaceListingInterface>(`${this.configUrl}/marketplace/listing/${id}/approve/`, {});
  }

  public renewMarketplaceListing(id: MarketplaceListingInterface["id"]): Observable<MarketplaceListingInterface> {
    return this.http.put<MarketplaceListingInterface>(`${this.configUrl}/marketplace/listing/${id}/renew/`, {});
  }

  public createMarketplaceLineItem(
    lineItem: Omit<MarketplaceLineItemInterface, "id">
  ): Observable<MarketplaceLineItemInterface> {
    return this.http.post<MarketplaceLineItemInterface>(
      `${this.configUrl}/marketplace/listing/${lineItem.listing}/line-item/`,
      (({ images, ...rest }) => rest)(lineItem)
    );
  }

  public updateMarketplaceLineItem(lineItem: MarketplaceLineItemInterface) {
    if (lineItem.sold) {
      return of(lineItem);
    }

    return this.http.put<MarketplaceLineItemInterface>(
      `${this.configUrl}/marketplace/listing/${lineItem.listing}/line-item/${lineItem.id}/`,
      (({ images, ...rest }) => rest)(lineItem)
    );
  }

  public deleteMarketplaceLineItem(
    listingId: MarketplaceListingInterface["id"],
    lineItemId: MarketplaceLineItemInterface["id"]
  ): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/marketplace/listing/${listingId}/line-item/${lineItemId}/`);
  }

  public markMarketplaceLineItemAsSold(
    listingId: MarketplaceListingInterface["id"],
    lineItemId: MarketplaceLineItemInterface["id"],
    soldTo: UserInterface["id"]
  ): Observable<MarketplaceLineItemInterface> {
    return this.http.put<MarketplaceLineItemInterface>(
      `${this.configUrl}/marketplace/listing/${listingId}/line-item/${lineItemId}/mark-as-sold/`,
      { soldTo }
    );
  }

  public createMarketplaceImage(
    listingId: MarketplaceListingInterface["id"],
    lineItemId: MarketplaceLineItemInterface["id"],
    image: File
  ): Observable<MarketplaceImageInterface> {
    const formData: FormData = new FormData();
    formData.append("image_file", image);
    formData.append("line_item", lineItemId.toString());

    const httpOptions = {
      headers: new HttpHeaders({
        // Unsetting the Content-Type is necessary so it gets set to multipart/form-data with the correct boundary.
        "Content-Type": "__unset__",
        "Content-Disposition": `form-data; name="image"; filename=${image.name}`
      })
    };

    return this.http.post<MarketplaceImageInterface>(
      `${this.configUrl}/marketplace/listing/${listingId}/line-item/${lineItemId}/image/`,
      formData,
      httpOptions
    );
  }

  public updateMarketplaceImage(
    listingId: MarketplaceListingInterface["id"],
    lineItemId: MarketplaceLineItemInterface["id"],
    imageId: MarketplaceImageInterface["id"],
    image: File
  ): Observable<MarketplaceImageInterface> {
    const formData: FormData = new FormData();
    formData.append("image_file", image);
    formData.append("line_item", lineItemId.toString());

    const httpOptions = {
      headers: new HttpHeaders({
        // Unsetting the Content-Type is necessary so it gets set to multipart/form-data with the correct boundary.
        "Content-Type": "__unset__",
        "Content-Disposition": `form-data; name="image"; filename=${image.name}`
      })
    };

    return this.http.put<MarketplaceImageInterface>(
      `${this.configUrl}/marketplace/listing/${listingId}/line-item/${lineItemId}/image/${imageId}/`,
      formData,
      httpOptions
    );
  }

  public deleteMarketplaceImage(
    listingId: MarketplaceListingInterface["id"],
    lineItemId: MarketplaceLineItemInterface["id"],
    imageId: MarketplaceImageInterface["id"]
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.configUrl}/marketplace/listing/${listingId}/line-item/${lineItemId}/image/${imageId}/`
    );
  }

  public loadMarketplacePrivateConversations(
    listingId: MarketplaceListingInterface["id"]
  ): Observable<MarketplacePrivateConversationInterface[]> {
    const url = `${this.configUrl}/marketplace/listing/${listingId}/private-conversation/`;

    return this.http.get<PaginatedApiResultInterface<MarketplacePrivateConversationInterface>>(url).pipe(
      expand(response =>
        response.next
          ? this.http.get<PaginatedApiResultInterface<MarketplacePrivateConversationInterface>>(response.next)
          : EMPTY
      ),
      map(response => response.results),
      reduce((acc, results) => acc.concat(results), [] as MarketplacePrivateConversationInterface[])
    );
  }

  public createMarketplacePrivateConversation(
    listingId: MarketplaceListingInterface["id"],
    userId?: UserInterface["id"]
  ): Observable<MarketplacePrivateConversationInterface> {
    let url = `${this.configUrl}/marketplace/listing/${listingId}/private-conversation/`;

    if (userId) {
      url = UtilsService.addOrUpdateUrlParam(url, "user", userId.toString());
    }

    return this.http.post<MarketplacePrivateConversationInterface>(url, {});
  }

  public updateMarketplacePrivateConversation(
    privateConversation: MarketplacePrivateConversationInterface
  ): Observable<MarketplacePrivateConversationInterface> {
    const url = `${this.configUrl}/marketplace/listing/${privateConversation.listing}/private-conversation/${privateConversation.id}/`;

    return this.http.put<MarketplacePrivateConversationInterface>(url, privateConversation);
  }

  public deleteMarketplacePrivateConversation(
    listingId: MarketplaceListingInterface["id"],
    privateConversationId: MarketplacePrivateConversationInterface["id"]
  ): Observable<void> {
    const url = `${this.configUrl}/marketplace/listing/${listingId}/private-conversation/${privateConversationId}/`;

    return this.http.delete<void>(url);
  }

  public createMarketplaceOffer(offer: MarketplaceOfferInterface): Observable<MarketplaceOfferInterface> {
    const url = `${this.configUrl}/marketplace/listing/${offer.listing}/line-item/${offer.lineItem}/offer/`;

    return this.http.post<MarketplaceOfferInterface>(url, offer);
  }

  public updateMarketplaceOffer(offer: MarketplaceOfferInterface): Observable<MarketplaceOfferInterface> {
    const url = `${this.configUrl}/marketplace/listing/${offer.listing}/line-item/${offer.lineItem}/offer/${offer.id}/`;

    return this.http.put<MarketplaceOfferInterface>(url, offer);
  }

  public rejectMarketplaceOffer(offer: MarketplaceOfferInterface): Observable<MarketplaceOfferInterface> {
    const url = `${this.configUrl}/marketplace/listing/${offer.listing}/line-item/${offer.lineItem}/offer/${offer.id}/reject/`;

    return this.http.put<MarketplaceOfferInterface>(url, {});
  }

  public retractMarketplaceOffer(offer: MarketplaceOfferInterface): Observable<MarketplaceOfferInterface> {
    const url = `${this.configUrl}/marketplace/listing/${offer.listing}/line-item/${offer.lineItem}/offer/${offer.id}/retract/`;

    return this.http.put<MarketplaceOfferInterface>(url, {});
  }

  public acceptMarketplaceOffer(offer: MarketplaceOfferInterface): Observable<MarketplaceOfferInterface> {
    const url = `${this.configUrl}/marketplace/listing/${offer.listing}/line-item/${offer.lineItem}/offer/${offer.id}/accept/`;

    return this.http.put<MarketplaceOfferInterface>(url, {});
  }

  public createMarketplaceFeedback(feedback: MarketplaceFeedbackInterface): Observable<MarketplaceFeedbackInterface> {
    const url = `${this.configUrl}/marketplace/listing/${feedback.listing}/feedback/`;

    return this.http.post<MarketplaceFeedbackInterface>(url, feedback);
  }

  public getMarketplaceFeedback(listingId: MarketplaceListingInterface["id"]): Observable<MarketplaceFeedbackInterface[]> {
    const url = `${this.configUrl}/marketplace/listing/${listingId}/feedback/`;

    return this.http.get<MarketplaceFeedbackInterface[]>(url);
  }

  public loadUserMarketplaceFeedback(
    userId: UserInterface["id"],
    page: number = 1
  ): Observable<PaginatedApiResultInterface<MarketplaceFeedbackInterface>> {
    const url = `${this.configUrl}/marketplace/user/${userId}/feedback/?page=${page}`;

    return this.http.get<PaginatedApiResultInterface<MarketplaceFeedbackInterface>>(url);
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
        pixelSize: item.pixelSize !== null ? parseFloat(item.pixelSize as unknown as string) : null,
        sensorWidth: item.sensorWidth !== null ? parseFloat(item.sensorWidth as unknown as string) : null,
        sensorHeight: item.sensorHeight !== null ? parseFloat(item.sensorHeight as unknown as string) : null,
        readNoise: item.readNoise !== null ? parseFloat(item.readNoise as unknown as string) : null,
        fullWellCapacity:
          item.fullWellCapacity !== null ? parseFloat(item.fullWellCapacity as unknown as string) : null
      }
    };
  }

  private _parseCamera<T extends CameraInterface | EditProposalInterface<CameraInterface>>(item: T): T {
    return {
      ...item,
      ...{
        backFocus: item.backFocus !== null ? parseFloat(item.backFocus as unknown as string) : null
      }
    };
  }

  private _parseTelescope<T extends TelescopeInterface | EditProposalInterface<TelescopeInterface>>(item: T): T {
    return {
      ...item,
      ...{
        aperture: item.aperture !== null ? parseFloat(item.aperture as unknown as string) : null,
        minFocalLength: item.minFocalLength !== null ? parseFloat(item.minFocalLength as unknown as string) : null,
        maxFocalLength: item.maxFocalLength !== null ? parseFloat(item.maxFocalLength as unknown as string) : null
      }
    };
  }

  private _parseMount<T extends MountInterface | EditProposalInterface<MountInterface>>(item: T): T {
    return {
      ...item,
      ...{
        weight: item.weight !== null ? parseFloat(item.weight as unknown as string) : null,
        maxPayload: item.maxPayload !== null ? parseFloat(item.maxPayload as unknown as string) : null
      }
    };
  }

  private _parseFilter<T extends FilterInterface | EditProposalInterface<FilterInterface>>(item: T): T {
    return {
      ...item,
      ...{
        bandwidth: item.bandwidth !== null ? parseFloat(item.bandwidth as unknown as string) : null
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
    const { image, thumbnail, ...itemWithoutImage } = item;

    if (itemWithoutImage.diy) {
      itemWithoutImage.brand = null;
    }

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
    const { image, thumbnail, ...itemWithoutImage } = item;

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
          if (item.image && item.image.length > 0) {
            this._uploadEditProposalImage<T>(
              createdEditProposal.id,
              UtilsService.isString(item.image) ? item.image : (item.image as any[])[0].file,
              path
            )
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
    image: string | File,
    path: string
  ): Observable<EditProposalInterface<T>> {
    const _doUpload = (imageFile: File) => {
      const formData: FormData = new FormData();
      formData.append("image", imageFile);

      const httpOptions = {
        headers: new HttpHeaders({
          // Unsetting the Content-Type is necessary so it gets set to multipart/form-data with the correct boundary.
          "Content-Type": "__unset__",
          "Content-Disposition": `form-data; name="image"; filename=${imageFile.name}`
        })
      };

      return this.http.post<EditProposalInterface<T>>(
        `${this.configUrl}/${path}-edit-proposal/${id}/image/`,
        formData,
        httpOptions
      );
    };

    return new Observable<EditProposalInterface<T>>(observer => {
      if (UtilsService.isString(image)) {
        UtilsService.fileFromUrl(image as string).then((file: File) => {
          _doUpload(file).subscribe(response => {
            observer.next(response);
            observer.next();
          });
        });
      } else {
        _doUpload(image as File).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    });
  }
}
