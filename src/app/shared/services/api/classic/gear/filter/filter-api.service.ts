import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FilterInterface } from "@shared/interfaces/filter.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { FilterApiServiceInterface } from "@shared/services/api/classic/gear/filter/filter-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class FilterApiService extends BaseClassicApiService implements FilterApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/filter";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  get(id: number): Observable<FilterInterface> {
    return this.http.get<FilterInterface>(`${this.configUrl}/${id}/`);
  }
}
