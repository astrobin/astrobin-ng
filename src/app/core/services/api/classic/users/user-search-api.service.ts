import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { UserSearchInterface } from "@core/interfaces/user-search.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import type { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UserSearchApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/users/user-search";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  search(options: SearchModelInterface): Observable<PaginatedApiResultInterface<UserSearchInterface>> {
    let url = `${this.configUrl}/`;

    // Convert keys in options to snake_case
    Object.keys(options).forEach(key => {
      const snakeCaseKey = UtilsService.camelCaseToSnakeCase(key);

      // Handle key conversion
      if (key !== snakeCaseKey) {
        options[snakeCaseKey] = options[key];
        delete options[key];
      }

      // For the ordering key, also convert its value to snake_case if it's not already prefixed with a minus
      if (snakeCaseKey === "ordering" && typeof options[snakeCaseKey] === "string") {
        let orderingValue = options[snakeCaseKey] as string;
        const hasMinusPrefix = orderingValue.startsWith("-");

        // Remove minus prefix temporarily if it exists
        if (hasMinusPrefix) {
          orderingValue = orderingValue.substring(1);
        }

        // Special handling for specific field names that might not follow the standard conversion
        let snakeCaseOrdering: string;

        // Map known fields that need special handling
        if (orderingValue === "normalizedLikes") {
          snakeCaseOrdering = "normalized_likes";
        } else if (orderingValue === "contributionIndex") {
          snakeCaseOrdering = "contribution_index";
        } else {
          // Standard conversion for other fields
          snakeCaseOrdering = UtilsService.camelCaseToSnakeCase(orderingValue);
        }

        // Add back the minus prefix if it existed
        options[snakeCaseKey] = hasMinusPrefix ? `-${snakeCaseOrdering}` : snakeCaseOrdering;
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

    return this.http.get<PaginatedApiResultInterface<UserSearchInterface>>(url);
  }
}
