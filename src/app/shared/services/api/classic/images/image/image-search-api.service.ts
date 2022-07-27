import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

export interface ImageSearchOptions {
  text?: string;
  ordering?: string;
  page: number;
}

@Injectable({
  providedIn: "root"
})
export class ImageSearchApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/images/image-search";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<State>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  search(options: ImageSearchOptions): Observable<PaginatedApiResultInterface<ImageSearchInterface>> {
    let url = `${this.configUrl}/`;

    url = UtilsService.addOrUpdateUrlParam(url, "page", options.page.toString());

    for (const arg of ["text", "ordering"]) {
      if (!!options[arg]) {
        url = UtilsService.addOrUpdateUrlParam(url, arg, options[arg]);
      }
    }

    return this.http.get<PaginatedApiResultInterface<ImageSearchInterface>>(url);
  }
}
