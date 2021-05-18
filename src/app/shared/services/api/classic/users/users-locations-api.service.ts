import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LocationInterface } from "@shared/interfaces/location.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";

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
