import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { ListResponseInterface } from "@core/interfaces/list-response.interface";
import type { ThumbnailGroupInterface } from "@core/interfaces/thumbnail-group.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

import type { ThumbnailGroupApiServiceInterface } from "./thumbnail-group-api.service-interface";

@Injectable({
  providedIn: "root"
})
export class ThumbnailGroupApiService extends BaseClassicApiService implements ThumbnailGroupApiServiceInterface {
  configUrl = this.baseUrl + "/images/thumbnail-group";

  constructor(public loadingService: LoadingService, private http: HttpClient) {
    super(loadingService);
  }

  getThumbnailGroup(imageId: number, revision: string): Observable<ThumbnailGroupInterface> {
    return this.http.get<ListResponseInterface<ThumbnailGroupInterface>>(`${this.configUrl}/?image=${imageId}`).pipe(
      map(response => {
        const results = response.results.filter(result => result.revision === revision);

        if (results) {
          return results[0];
        }

        return null;
      })
    );
  }
}
