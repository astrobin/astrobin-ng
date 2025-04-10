import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LocationInterface } from "@core/interfaces/location.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UsersLocationsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/users/locations";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  /** This API gets the locations used by the logged in user in their images. */
  getAll(): Observable<PaginatedApiResultInterface<LocationInterface>> {
    return this.http.get<PaginatedApiResultInterface<LocationInterface>>(`${this.configUrl}/`);
  }
}
