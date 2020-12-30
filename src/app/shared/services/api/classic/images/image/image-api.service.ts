import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { State } from "@app/store/state";
import { environment } from "@env/environment";
import { Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { ImageApiServiceInterface } from "./image-api.service-interface";

@Injectable({
  providedIn: "root"
})
export class ImageApiService extends BaseClassicApiService implements ImageApiServiceInterface {
  configUrl = this.baseUrl + "/images";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<State>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getImage(id: number): Observable<ImageInterface> {
    return this.http.get<ImageInterface>(`${this.configUrl}/image/${id}/`);
  }

  getThumbnail(id: number | string, revision: string, alias: ImageAlias): Observable<ImageThumbnailInterface> {
    return this.http.get<ImageThumbnailInterface>(`${environment.classicBaseUrl}/${id}/${revision}/thumb/${alias}/`);
  }
}
