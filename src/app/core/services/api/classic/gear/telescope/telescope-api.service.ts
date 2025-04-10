import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { TelescopeInterface } from "@core/interfaces/telescope.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { TelescopeApiServiceInterface } from "@core/services/api/classic/gear/telescope/telescope-api.service-interface";
import type { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class TelescopeApiService extends BaseClassicApiService implements TelescopeApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/telescope";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  get(id: number): Observable<TelescopeInterface> {
    return this.http.get<TelescopeInterface>(`${this.configUrl}/${id}/`);
  }
}
