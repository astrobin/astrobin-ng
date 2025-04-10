import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { LoadImageOptionsInterface } from "@app/store/actions/image.actions";
import type { MainState } from "@app/store/state";
import type { ImageAlias } from "@core/enums/image-alias.enum";
import type { CollectionInterface } from "@core/interfaces/collection.interface";
import type { ImageThumbnailInterface } from "@core/interfaces/image-thumbnail.interface";
import type { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import type { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { environment } from "@env/environment";
import type { ImageEditModelInterface } from "@features/image/services/image-edit.service";
import type { ImageIotdTpStatsInterface } from "@features/iotd/types/image-iotd-tp-stats.interface";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

export type FindImagesResponseInterface = PaginatedApiResultInterface<ImageInterface> & {
  menu: [string, string][] | null;
  active: string | null;
};

export interface FindImagesOptionsInterface {
  userId?: UserInterface["id"];
  q?: string;
  hasDeepSkyAcquisitions?: boolean;
  hasSolarSystemAcquisitions?: boolean;
  page?: number;
  gallerySerializer?: boolean;
  includeStagingArea?: boolean;
  onlyStagingArea?: boolean;
  trash?: boolean;
  collection?: CollectionInterface["id"];
  subsection?: string;
  active?: string;
  ordering?: string;
}

export interface UsersWhoLikeOrBookmarkInterface {
  userId: number;
  username: string;
  displayName: string;
  timestamp: string;
  followed: boolean;
}

@Injectable({
  providedIn: "root"
})
export class ImageApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/images";

  private readonly PROPERTY_CONFIGS = {
    like: {
      urlPath: "users-who-like",
      queryParam: "users-who-like-q"
    },
    bookmark: {
      urlPath: "users-who-bookmarked",
      queryParam: "users-who-bookmarked-q"
    }
  } as const;

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getImage(
    id: ImageInterface["pk"] | ImageInterface["hash"],
    options: LoadImageOptionsInterface = { skipThumbnails: false }
  ): Observable<ImageInterface> {
    if (!UtilsService.isNumeric(id.toString())) {
      let url = `${this.configUrl}/image/`;

      url = UtilsService.addOrUpdateUrlParam(url, "hash", `${id}`);
      url = UtilsService.addOrUpdateUrlParam(url, "skip-thumbnails", `${options.skipThumbnails}`);

      return this.http.get<FindImagesResponseInterface>(url).pipe(
        map(response => {
          if (response.results.length > 0) {
            return response.results[0];
          }
          throw new Error("Image not found");
        })
      );
    }

    return this.http.get<ImageInterface>(`${this.configUrl}/image/${id}/`);
  }

  getImages(ids: ImageInterface["pk"][]): Observable<FindImagesResponseInterface> {
    return this.http.get<FindImagesResponseInterface>(`${this.configUrl}/image/?id=${ids.join(",")}`);
  }

  getPublicImagesCountByUserId(userId: UserInterface["id"]): Observable<number> {
    return this.http.get<number>(`${this.configUrl}/image/public-images-count/?user=${userId}`);
  }

  findImages(options: FindImagesOptionsInterface): Observable<FindImagesResponseInterface> {
    let url = `${this.configUrl}/image/`;

    const params: { [key: string]: any } = {
      user: options.userId,
      q: options.q,
      "has-deepsky-acquisitions": options.hasDeepSkyAcquisitions ? "1" : null,
      "has-solarsystem-acquisitions": options.hasSolarSystemAcquisitions ? "1" : null,
      page: options.page,
      "gallery-serializer": options.gallerySerializer ? "1" : null,
      "include-staging-area": options.includeStagingArea ? "true" : null,
      "only-staging-area": options.onlyStagingArea ? "true" : null,
      trash: options.trash ? "true" : null,
      collection: options.collection,
      subsection: options.subsection,
      active: options.active,
      ordering: options.ordering
    };

    // Filter out null or undefined values
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url = UtilsService.addOrUpdateUrlParam(url, key, params[key]);
      }
    });

    return this.http.get<FindImagesResponseInterface>(url);
  }

  getThumbnail(
    id: ImageInterface["pk"] | ImageInterface["hash"],
    revision: ImageRevisionInterface["label"],
    alias: ImageAlias,
    bustCache = false
  ): Observable<ImageThumbnailInterface> {
    let url = `${environment.classicBaseUrl}/${id}/${revision}/thumb/${alias}/`;

    if (bustCache) {
      url = `${url}?t=${new Date().getTime()}`;
    }

    return this.http.get<ImageThumbnailInterface>(url);
  }

  updateImage(pk: ImageInterface["pk"], image: ImageEditModelInterface): Observable<ImageInterface> {
    return this.http.put<ImageInterface>(`${this.configUrl}/image/${pk}/`, image);
  }

  updateImageRevision(imageRevision: Partial<ImageRevisionInterface>): Observable<ImageRevisionInterface> {
    return this.http.patch<ImageRevisionInterface>(
      `${this.configUrl}/image-revision/${imageRevision.pk}/`,
      imageRevision
    );
  }

  publishImage(
    pk: ImageInterface["pk"],
    skipNotifications: boolean,
    skipActivityStream: boolean
  ): Observable<ImageInterface> {
    return this.http.put<ImageInterface>(`${this.configUrl}/image/${pk}/publish/`, {
      skipNotifications,
      skipActivityStream
    });
  }

  unpublishImage(pk: ImageInterface["pk"]): Observable<ImageInterface> {
    return this.http.put<ImageInterface>(`${this.configUrl}/image/${pk}/unpublish/`, {});
  }

  markAsFinal(pk: ImageInterface["pk"], revisionLabel: ImageRevisionInterface["label"]): Observable<ImageInterface> {
    return this.http.put<ImageInterface>(`${this.configUrl}/image/${pk}/mark-as-final/`, { revisionLabel });
  }

  deleteOriginal(pk: ImageInterface["pk"]): Observable<ImageInterface> {
    return this.http.patch<ImageInterface>(`${this.configUrl}/image/${pk}/delete-original/`, {});
  }

  deleteRevision(pk: ImageRevisionInterface["pk"]): Observable<ImageInterface> {
    return this.http.delete<ImageInterface>(`${this.configUrl}/image-revision/${pk}/`);
  }

  delete(pk: ImageInterface["pk"]): Observable<ImageInterface> {
    return this.http.delete<ImageInterface>(`${this.configUrl}/image/${pk}/`);
  }

  undelete(pk: ImageInterface["pk"]): Observable<ImageInterface> {
    return this.http.patch<ImageInterface>(`${this.configUrl}/image/${pk}/undelete/`, {});
  }

  download(
    pk: ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"],
    version: ImageAlias | "original" | "basic_annotations" | "advanced_annotations"
  ): void {}

  deleteUncompressedSourceFile(pk: ImageInterface["pk"]): Observable<ImageInterface> {
    return this.http.patch<ImageInterface>(`${this.configUrl}/image/${pk}/delete-uncompressed-source-file/`, {});
  }

  maySubmitForIotdTpConsideration(pk: ImageInterface["pk"]): Observable<{
    may: boolean;
    reason: string;
    humanizedReason: string;
  }> {
    return this.http.get<{
      may: boolean;
      reason: string;
      humanizedReason: string;
    }>(`${this.configUrl}/image/${pk}/may-submit-for-iotd-tp-consideration/`);
  }

  submitForIotdTpConsideration(pk: ImageInterface["pk"]): Observable<ImageInterface> {
    return this.http.patch<ImageInterface>(`${this.configUrl}/image/${pk}/submit-for-iotd-tp-consideration/`, {
      agreedToIotdTpRulesAndGuidelines: true
    });
  }

  getImageStats(imageId: ImageInterface["hash"] | ImageInterface["pk"]): Observable<ImageIotdTpStatsInterface> {
    return this.http.get<ImageIotdTpStatsInterface>(`${this.baseUrl}/iotd/image-stats/${imageId}/`);
  }

  getVideoEncodingProgress(pk: ImageInterface["pk"]): Observable<number> {
    return this.http.get<number>(`${this.configUrl}/image/${pk}/video-encoding-progress/`);
  }

  getRevisionVideoEncodingProgress(pk: ImageRevisionInterface["pk"]): Observable<number> {
    return this.http.get<number>(`${this.configUrl}/image-revision/${pk}/video-encoding-progress/`);
  }

  acceptCollaboratorRequest(pk: ImageInterface["pk"], userId: UserInterface["id"]): Observable<ImageInterface> {
    return this.http.patch<ImageInterface>(`${this.configUrl}/image/${pk}/accept-collaborator-request/`, { userId });
  }

  denyCollaboratorRequest(pk: ImageInterface["pk"], userId: UserInterface["id"]): Observable<ImageInterface> {
    return this.http.patch<ImageInterface>(`${this.configUrl}/image/${pk}/deny-collaborator-request/`, { userId });
  }

  removeCollaborator(pk: ImageInterface["pk"], userId: UserInterface["id"]): Observable<ImageInterface> {
    return this.http.patch<ImageInterface>(`${this.configUrl}/image/${pk}/remove-collaborator/`, { userId });
  }

  getUsersWhoLikeImage(
    pk: ImageInterface["pk"],
    q: string,
    page = 1
  ): Observable<PaginatedApiResultInterface<UsersWhoLikeOrBookmarkInterface>> {
    return this._getUsersWithProperty(pk, "like", q, page);
  }

  getUsersWhoBookmarkedImage(
    pk: ImageInterface["pk"],
    q: string,
    page = 1
  ): Observable<PaginatedApiResultInterface<UsersWhoLikeOrBookmarkInterface>> {
    return this._getUsersWithProperty(pk, "bookmark", q, page);
  }

  private _getUsersWithProperty(
    pk: ImageInterface["pk"],
    propertyType: keyof typeof this.PROPERTY_CONFIGS,
    q: string,
    page = 1
  ): Observable<PaginatedApiResultInterface<UsersWhoLikeOrBookmarkInterface>> {
    let url = `${this.configUrl}/image/${pk}/${this.PROPERTY_CONFIGS[propertyType].urlPath}/`;

    if (q) {
      url = UtilsService.addOrUpdateUrlParam(url, this.PROPERTY_CONFIGS[propertyType].queryParam, q);
    }

    if (page > 1) {
      url = UtilsService.addOrUpdateUrlParam(url, "page", page.toString());
    }

    return this.http.get<PaginatedApiResultInterface<UsersWhoLikeOrBookmarkInterface>>(url);
  }
}
