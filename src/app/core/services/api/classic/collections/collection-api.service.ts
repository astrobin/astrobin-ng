import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { CollectionInterface } from "@core/interfaces/collection.interface";
import type { ImageInterface } from "@core/interfaces/image.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { Observable } from "rxjs";
import { EMPTY } from "rxjs";
import { expand, reduce } from "rxjs/operators";

export interface GetCollectionsParamsInterface {
  user?: UserInterface["id"];
  ids?: CollectionInterface["id"][];
  parent?: CollectionInterface["id"];
  page?: number;
  action?: "add-remove-images";
}

@Injectable({
  providedIn: "root"
})
export class CollectionApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/astrobin/collection/";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getAll(params: GetCollectionsParamsInterface): Observable<CollectionInterface[]> {
    const url = this._buildFindUrl(params);

    return this.http.get<PaginatedApiResultInterface<CollectionInterface>>(url).pipe(
      expand(response => (response.next ? this.http.get(response.next) : EMPTY)),
      reduce(
        (accumulator, response) =>
          accumulator.concat((response as PaginatedApiResultInterface<CollectionInterface>).results),
        []
      )
    );
  }

  find(params: GetCollectionsParamsInterface): Observable<PaginatedApiResultInterface<CollectionInterface>> {
    const url = this._buildFindUrl(params);
    return this.http.get<PaginatedApiResultInterface<CollectionInterface>>(url);
  }

  create(
    parent: CollectionInterface["id"] | null,
    name: CollectionInterface["name"],
    description: CollectionInterface["description"] | null,
    orderByTag: CollectionInterface["orderByTag"] | null
  ): Observable<CollectionInterface> {
    return this.http.post<CollectionInterface>(this.configUrl, { parent, name, description, orderByTag });
  }

  update(collection: CollectionInterface): Observable<CollectionInterface> {
    return this.http.put<CollectionInterface>(`${this.configUrl}${collection.id}/`, collection);
  }

  delete(collectionId: CollectionInterface["id"]): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}${collectionId}/`);
  }

  addImage(collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"]): Observable<void> {
    return this.http.post<void>(`${this.configUrl}${collectionId}/add-image/`, { image: imageId });
  }

  removeImage(collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"]): Observable<void> {
    return this.http.post<void>(`${this.configUrl}${collectionId}/remove-image/`, { image: imageId });
  }

  setCoverImage(
    collectionId: CollectionInterface["id"],
    imageId: ImageInterface["pk"]
  ): Observable<CollectionInterface> {
    return this.http.post<CollectionInterface>(`${this.configUrl}${collectionId}/set-cover-image/`, { image: imageId });
  }

  private _buildFindUrl(params: GetCollectionsParamsInterface): string {
    let url = this.configUrl;

    if (params.user !== undefined) {
      url = UtilsService.addOrUpdateUrlParam(url, "user", params.user.toString());
    }

    if (params.ids !== undefined && params.ids.length > 0) {
      url = UtilsService.addOrUpdateUrlParam(url, "ids", params.ids.join(","));
    }

    if (params.parent !== undefined) {
      if (params.parent === null) {
        url = UtilsService.addOrUpdateUrlParam(url, "parent", "null");
      } else {
        url = UtilsService.addOrUpdateUrlParam(url, "parent", params.parent.toString());
      }
    }

    if (params.page !== undefined) {
      url = UtilsService.addOrUpdateUrlParam(url, "page", params.page.toString());
    }

    if (params.action !== undefined) {
      url = UtilsService.addOrUpdateUrlParam(url, "action", params.action);
    }

    return url;
  }
}
