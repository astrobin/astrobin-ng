import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LocationInterface } from "@core/interfaces/location.interface";
import { LocationApiServiceInterface } from "@core/services/api/classic/astrobin/location/location-api.service-interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { LoadingService } from "@core/services/loading.service";
import { Observable } from "rxjs";

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
