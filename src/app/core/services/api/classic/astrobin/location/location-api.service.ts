import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { LocationInterface } from "@core/interfaces/location.interface";
import type { LocationApiServiceInterface } from "@core/services/api/classic/astrobin/location/location-api.service-interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class LocationApiService extends BaseClassicApiService implements LocationApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/location";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  create(location: Omit<LocationInterface, "id">): Observable<LocationInterface> {
    return this.http.post<LocationInterface>(`${this.configUrl}/`, location);
  }
}
