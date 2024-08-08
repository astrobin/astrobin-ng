import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { ForumPostSearchInterface } from "@shared/interfaces/forum-post-search.interface";

@Injectable({
  providedIn: "root"
})
export class ForumPostSearchApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/forum/post-search";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  search(options: SearchModelInterface): Observable<PaginatedApiResultInterface<ForumPostSearchInterface>> {
    let url = `${this.configUrl}/`;

    // Convert keys in options to snake_case
    Object.keys(options).forEach(key => {
      const snakeCaseKey = UtilsService.camelCaseToSnakeCase(key);
      if (key !== snakeCaseKey) {
        options[snakeCaseKey] = options[key];
        delete options[key];
      }
    });

    // Convert options to query string
    const queryString = UtilsService.toQueryString(options);

    // Compress query string
    const compressedQueryString = UtilsService.compressQueryString(queryString);

    // Encode query string
    const encodedQueryString = encodeURIComponent(compressedQueryString);

    // Convert options to query string
    url += `?params=${encodedQueryString}`;

    return this.http.get<PaginatedApiResultInterface<ForumPostSearchInterface>>(url);
  }
}
