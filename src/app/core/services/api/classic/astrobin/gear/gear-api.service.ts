import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MigratableGearItemApiService } from "@core/services/api/classic/astrobin/migratable-gear-item-api.service";
import { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class GearApiService extends MigratableGearItemApiService {
  configUrl = this.baseUrl + "/astrobin/gear";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService, http);
  }

  get(id: number): Observable<any> {
    return this.http.get<any>(`${this.configUrl}/${id}/`);
  }

  getType(id: number): Observable<string> {
    return this.http.get<string>(`${this.configUrl}/${id}/type/`);
  }
}
