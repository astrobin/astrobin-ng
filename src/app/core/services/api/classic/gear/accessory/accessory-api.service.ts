import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { AccessoryInterface } from "@core/interfaces/accessory.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { AccessoryApiServiceInterface } from "@core/services/api/classic/gear/accessory/accessory-api.service-interface";
import type { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AccessoryApiService extends BaseClassicApiService implements AccessoryApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/accessory";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  get(id: number): Observable<AccessoryInterface> {
    return this.http.get<AccessoryInterface>(`${this.configUrl}/${id}/`);
  }
}
