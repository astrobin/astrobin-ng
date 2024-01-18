import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@shared/services/loading.service";
import { EMPTY, Observable } from "rxjs";
import { expand, reduce } from "rxjs/operators";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

@Injectable({
  providedIn: "root"
})
export class CollectionApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/astrobin/collection/";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getAll(userId: UserInterface["id"]): Observable<CollectionInterface[]> {
    let url = this.configUrl;

    if (userId !== undefined) {
      url += "?user=" + userId;
    }

    return this.http.get<PaginatedApiResultInterface<CollectionInterface>>(url).pipe(
      expand(response => (response.next ? this.http.get(response.next) : EMPTY)),
      reduce(
        (accumulator, response) =>
          accumulator.concat((response as PaginatedApiResultInterface<CollectionInterface>).results),
        []
      )
    );
  }
}
