import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { State } from "@app/store/state";
import { environment } from "@env/environment";
import { Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { UserInterface } from "@shared/interfaces/user.interface";

@Injectable({
  providedIn: "root"
})
export class ImageApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/images";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<State>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getImage(id: ImageInterface["pk"] | ImageInterface["hash"]): Observable<ImageInterface> {
    if (isNaN(Number(id))) {
      const url = `${this.configUrl}/image/?hash=${id}`;
      return this.http.get<PaginatedApiResultInterface<ImageInterface>>(url).pipe(
        map(response => {
          if (response.results.length > 0) {
            return response.results[0];
          }
          throwError({ statusCode: 404 });
        })
      );
    }

    return this.http.get<ImageInterface>(`${this.configUrl}/image/${id}/`);
  }

  getImageRevisions(id: ImageInterface["pk"]): Observable<PaginatedApiResultInterface<ImageRevisionInterface>> {
    return this.http.get<PaginatedApiResultInterface<ImageRevisionInterface>>(
      `${this.configUrl}/image-revision/?image=${id}`
    );
  }

  getImages(ids: ImageInterface["pk"][]): Observable<PaginatedApiResultInterface<ImageInterface>> {
    return this.http.get<PaginatedApiResultInterface<ImageInterface>>(`${this.configUrl}/image/?id=${ids.join(",")}`);
  }

  getImagesByUserId(userId: UserInterface["id"]): Observable<PaginatedApiResultInterface<ImageInterface>> {
    return this.http.get<PaginatedApiResultInterface<ImageInterface>>(`${this.configUrl}/image/?user=${userId}`);
  }

  getThumbnail(
    id: ImageInterface["pk"] | ImageInterface["hash"],
    revision: string,
    alias: ImageAlias,
    bustCache = false
  ): Observable<ImageThumbnailInterface> {
    let url = `${environment.classicBaseUrl}/${id}/${revision}/thumb/${alias}/`;

    if (bustCache) {
      url = `${url}?t=${new Date().getTime()}`;
    }

    return this.http.get<ImageThumbnailInterface>(url);
  }

  updateImage(pk: ImageInterface["pk"], data: ImageInterface): Observable<ImageInterface> {
    const fixed = { ...data };

    for (const prop of [
      "imagingTelescopes2",
      "imagingCameras2",
      "mounts2",
      "filters2",
      "accessories2",
      "software2",
      "guidingTelescopes2",
      "guidingCameras2"
    ]) {
      fixed[prop] = [...new Set(fixed[prop])];
    }

    return this.http.put<ImageInterface>(`${this.configUrl}/image/${pk}/`, fixed);
  }
}
