import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { RemoteSourceAffiliateInterface } from "@core/interfaces/remote-source-affiliate.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";
import { EMPTY } from "rxjs";
import { expand, reduce } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class RemoteSourceAffiliateApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/remote-source-affiliation/remote-source-affiliate/";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getAll(): Observable<RemoteSourceAffiliateInterface[]> {
    return this.http.get<PaginatedApiResultInterface<RemoteSourceAffiliateInterface>>(this.configUrl).pipe(
      expand(response => (response.next ? this.http.get(response.next) : EMPTY)),
      reduce(
        (accumulator, response) =>
          accumulator.concat((response as PaginatedApiResultInterface<RemoteSourceAffiliateInterface>).results),
        []
      )
    );
  }
}
